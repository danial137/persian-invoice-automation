import type { PaymentMethod, Prisma } from '@prisma/client';
import { ACCOUNT, postJournal } from '@/lib/ledger';

interface PaymentInput {
  invoiceId: string;
  amount: bigint;
  method: PaymentMethod;
  reference: string | null;
  note: string | null;
  userId: string;
}

export async function recordPayment(tx: Prisma.TransactionClient, input: PaymentInput) {
  const invoice = await tx.invoice.findUnique({ where: { id: input.invoiceId } });
  if (!invoice || invoice.type !== 'SALE' || !['ISSUED', 'PARTIAL'].includes(invoice.status)) {
    throw new Error('این فاکتور قابل پرداخت نیست.');
  }
  if (input.amount > invoice.totalToman - invoice.paidToman) {
    throw new Error('مبلغ پرداخت از مانده فاکتور بیشتر است.');
  }

  const paid = invoice.paidToman + input.amount;
  const updated = await tx.invoice.updateMany({
    where: {
      id: input.invoiceId,
      paidToman: invoice.paidToman,
      status: { in: ['ISSUED', 'PARTIAL'] },
    },
    data: {
      paidToman: { increment: input.amount },
      status: paid === invoice.totalToman ? 'PAID' : 'PARTIAL',
    },
  });
  if (updated.count !== 1) {
    throw new Error('مانده فاکتور تغییر کرده است؛ صفحه را نوسازی کنید.');
  }

  await tx.payment.create({
    data: {
      invoiceId: input.invoiceId,
      amountToman: input.amount,
      method: input.method,
      reference: input.reference,
      note: input.note,
    },
  });

  await postJournal(tx, {
    description: `دریافت وجه فاکتور ${invoice.number}`,
    source: 'PAYMENT',
    invoiceId: input.invoiceId,
    userId: input.userId,
    lines: [
      { code: ACCOUNT.CASH, debit: input.amount },
      { code: ACCOUNT.RECEIVABLE, credit: input.amount },
    ],
  });
}
