/** Monetary values are non-negative integer tomans stored as bigint. */
export interface PricedLine {
  quantity: number;
  unitPriceToman: bigint;
}

export interface InvoiceTotals {
  subtotal: bigint;
  taxable: bigint;
  tax: bigint;
  total: bigint;
}

/** Rounds tax to the nearest whole toman, half up. */
export function totals(items: PricedLine[], discountToman: bigint, taxRate: number): InvoiceTotals {
  if (items.length === 0 || items.some((line) =>
    !Number.isSafeInteger(line.quantity) || line.quantity < 1 || line.unitPriceToman < 0n,
  )) {
    throw new Error('اقلام فاکتور معتبر نیستند.');
  }
  if (!Number.isInteger(taxRate) || taxRate < 0 || taxRate > 100) {
    throw new Error('نرخ مالیات نامعتبر است.');
  }

  const subtotal = items.reduce(
    (sum, item) => sum + BigInt(item.quantity) * item.unitPriceToman, 0n,
  );
  if (discountToman < 0n || discountToman > subtotal) {
    throw new Error('تخفیف نباید از مبلغ کالاها بیشتر باشد.');
  }

  const taxable = subtotal - discountToman;
  const tax = (taxable * BigInt(taxRate) + 50n) / 100n;
  return { subtotal, taxable, tax, total: taxable + tax };
}

export function validToman(value: unknown, allowZero = false): bigint {
  const text = String(value ?? '').trim();
  if (!/^\d{1,15}$/.test(text)) {
    throw new Error('مبلغ باید عدد صحیح نامنفی و حداکثر ۱۵ رقم باشد.');
  }
  const result = BigInt(text);
  if (!allowZero && result === 0n) throw new Error('مبلغ باید بزرگ‌تر از صفر باشد.');
  return result;
}

export function validQuantity(value: unknown, allowZero = false): number {
  const text = String(value ?? '').trim();
  if (!/^\d{1,7}$/.test(text)) throw new Error('تعداد نامعتبر است.');
  const quantity = Number(text);
  if (!Number.isSafeInteger(quantity) || (allowZero ? quantity < 0 : quantity < 1)) {
    throw new Error('تعداد نامعتبر است.');
  }
  return quantity;
}
