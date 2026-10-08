import type { Prisma } from '@prisma/client';
import { totals } from '@/lib/calculations';
import { ACCOUNT, postJournal } from '@/lib/ledger';
import type { InvoiceInput } from '@/lib/validation/invoice';

type Transaction = Prisma.TransactionClient;

async function loadInvoiceLines(tx: Transaction, input: InvoiceInput) {
  const products = await tx.product.findMany({
    where: { id: { in: input.items.map((item) => item.productId) }, active: true },
  });

  if (products.length !== input.items.length) {
    throw new Error('یک یا چند کالا یافت نشد.');
  }

  const byId = new Map(products.map((product) => [product.id, product]));
  return input.items.map(({ productId, quantity }) => {
    const product = byId.get(productId)!;
    return {
      productId,
      quantity,
      product,
      unitPriceToman: product.priceToman,
      unitCostToman: product.costToman,
      lineTotalToman: product.priceToman * BigInt(quantity),
    };
  });
}

async function reserveInventory(
  tx: Transaction,
  invoiceId: string,
  lines: Awaited<ReturnType<typeof loadInvoiceLines>>,
) {
  for (const line of lines) {
    // The condition makes the stock decrement safe against simultaneous sales.
    const updated = await tx.product.updateMany({
      where: { id: line.productId, stock: { gte: line.quantity } },
      data: { stock: { decrement: line.quantity } },
    });
    if (updated.count !== 1) {
      throw new Error(`موجودی «${line.product.name}» کافی نیست.`);
    }

    await tx.inventoryMovement.create({
      data: { productId: line.productId, invoiceId, reason: 'SALE', delta: -line.quantity },
    });
  }
}

export async function createInvoice(tx: Transaction, input: InvoiceInput, userId: string) {
  const customer = await tx.customer.findUnique({ where: { id: input.customerId } });
  if (!customer) throw new Error('مشتری یافت نشد.');

  const lines = await loadInvoiceLines(tx, input);
  const summary = totals(lines, input.discountToman, input.taxRate);
  const issued = input.type === 'SALE';
  const sequence = await tx.sequence.upsert({
    where: { key: input.type },
    create: { key: input.type, current: 1 },
    update: { current: { increment: 1 } },
  });
  const prefix = issued ? 'INV-' : 'QUO-';
  const number = `${prefix}${String(sequence.current).padStart(6, '0')}`;

  const invoice = await tx.invoice.create({
    data: {
      number,
      type: input.type,
      status: issued ? 'ISSUED' : 'DRAFT',
      customerId: input.customerId,
      creatorId: userId,
      dueAt: input.dueAt,
      notes: input.notes || null,
      discountToman: input.discountToman,
      taxRate: input.taxRate,
      subtotalToman: summary.subtotal,
      taxToman: summary.tax,
      totalToman: summary.total,
      items: {
        create: lines.map((line) => ({
          productId: line.productId,
          description: line.product.name,
          unit: line.product.unit,
          quantity: line.quantity,
          unitPriceToman: line.unitPriceToman,
          unitCostToman: line.unitCostToman,
          lineTotalToman: line.lineTotalToman,
        })),
      },
    },
  });

  if (!issued) return invoice;

  await reserveInventory(tx, invoice.id, lines);
  const cost = lines.reduce(
    (sum, line) => sum + line.unitCostToman * BigInt(line.quantity),
    0n,
  );

  if (summary.total === 0n && cost === 0n) return invoice;

  await postJournal(tx, {
    description: `فروش ${number} به ${customer.name}`,
    source: 'SALE',
    invoiceId: invoice.id,
    userId,
    lines: [
      { code: ACCOUNT.RECEIVABLE, debit: summary.total },
      { code: ACCOUNT.SALES, credit: summary.taxable },
      { code: ACCOUNT.TAX, credit: summary.tax },
      { code: ACCOUNT.COGS, debit: cost },
      { code: ACCOUNT.INVENTORY, credit: cost },
    ],
  });

  return invoice;
}

export async function convertQuote(tx: Transaction, quoteId: string, userId: string) {
  const quote = await tx.invoice.findUnique({
    where: { id: quoteId },
    include: { items: true },
  });
  if (!quote || quote.type !== 'QUOTE' || quote.status !== 'DRAFT') {
    throw new Error('پیش‌فاکتور معتبر نیست.');
  }

  // Claim the draft before generating a sale; prevents double conversion.
  const claimed = await tx.invoice.updateMany({
    where: { id: quoteId, type: 'QUOTE', status: 'DRAFT' },
    data: { status: 'CANCELLED' },
  });
  if (claimed.count !== 1) {
    throw new Error('این پیش‌فاکتور قبلاً تبدیل شده یا وضعیت آن تغییر کرده است.');
  }

  // Conversion uses current catalog prices (same behavior as the original app).
  const invoice = await createInvoice(tx, {
    type: 'SALE',
    customerId: quote.customerId,
    dueAt: quote.dueAt,
    notes: quote.notes ?? '',
    taxRate: quote.taxRate,
    discountToman: quote.discountToman,
    items: quote.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
  }, userId);

  return invoice;
}

export async function cancelInvoice(tx: Transaction, id: string, userId: string) {
  const invoice = await tx.invoice.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!invoice) throw new Error('فاکتور یافت نشد.');
  if (invoice.status === 'CANCELLED') throw new Error('این فاکتور قبلاً لغو شده است.');
  if (invoice.paidToman > 0n) {
    throw new Error('لغو فاکتور دارای پرداخت مجاز نیست؛ ابتدا استرداد وجه باید ثبت شود.');
  }

  // Only one concurrent cancellation can change the document's status.
  const claimed = await tx.invoice.updateMany({
    where: { id, status: invoice.status, paidToman: 0n },
    data: { status: 'CANCELLED' },
  });
  if (claimed.count !== 1) throw new Error('وضعیت فاکتور تغییر کرده؛ دوباره تلاش کنید.');

  if (invoice.type !== 'SALE') return;

  for (const item of invoice.items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
    await tx.inventoryMovement.create({
      data: { productId: item.productId, invoiceId: id, reason: 'CANCELLATION', delta: item.quantity },
    });
  }

  const cost = invoice.items.reduce(
    (sum, item) => sum + item.unitCostToman * BigInt(item.quantity), 0n,
  );
  await postJournal(tx, {
    description: `برگشت از فروش ${invoice.number}`,
    source: 'REVERSAL',
    invoiceId: id,
    userId,
    lines: [
      { code: ACCOUNT.SALES, debit: invoice.subtotalToman - invoice.discountToman },
      { code: ACCOUNT.TAX, debit: invoice.taxToman },
      { code: ACCOUNT.RECEIVABLE, credit: invoice.totalToman },
      { code: ACCOUNT.INVENTORY, debit: cost },
      { code: ACCOUNT.COGS, credit: cost },
    ],
  });
}
