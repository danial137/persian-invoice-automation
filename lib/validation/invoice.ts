import { field, required, toDate } from '@/lib/forms';
import { validQuantity, validToman } from '@/lib/calculations';

export type InvoiceKind = 'SALE' | 'QUOTE';

export interface InvoiceInput {
  type: InvoiceKind;
  customerId: string;
  dueAt: Date | null;
  notes: string;
  taxRate: number;
  discountToman: bigint;
  items: Array<{ productId: string; quantity: number }>;
}

function parseItems(raw: string): InvoiceInput['items'] {
  let value: unknown;

  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error('اقلام ارسالی نامعتبر است.');
  }

  if (!Array.isArray(value) || value.length < 1 || value.length > 100) {
    throw new Error('فاکتور باید بین ۱ تا ۱۰۰ ردیف داشته باشد.');
  }

  const items = value.map((item: unknown) => {
    if (!item || typeof item !== 'object') {
      throw new Error('ردیف فاکتور نامعتبر است.');
    }

    const row = item as Record<string, unknown>;
    const productId = String(row.productId ?? '');
    if (!/^c[a-z0-9]{15,}$/.test(productId)) {
      throw new Error('کالای نامعتبر انتخاب شده است.');
    }

    return { productId, quantity: validQuantity(row.quantity) };
  });

  if (new Set(items.map(({ productId }) => productId)).size !== items.length) {
    throw new Error('هر کالا را فقط یک‌بار وارد کنید.');
  }

  return items;
}

export function parseInvoiceForm(form: FormData): InvoiceInput {
  const type = field(form, 'type');
  if (type !== 'SALE' && type !== 'QUOTE') {
    throw new Error('نوع فاکتور نامعتبر است.');
  }

  const taxRate = Number(field(form, 'taxRate'));
  if (!Number.isInteger(taxRate) || taxRate < 0 || taxRate > 100) {
    throw new Error('مالیات نامعتبر است.');
  }

  return {
    type,
    customerId: required(form, 'customerId'),
    dueAt: toDate(field(form, 'dueAt')),
    notes: field(form, 'notes', 1500),
    discountToman: validToman(field(form, 'discountToman') || '0', true),
    taxRate,
    items: parseItems(field(form, 'items', 120000)),
  };
}
