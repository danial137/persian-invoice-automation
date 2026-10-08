'use client';

import { useMemo, useState } from 'react';
import { FilePlus2, Plus } from 'lucide-react';
import { createInvoiceAction } from '@/app/actions/invoices';
import { money } from '@/lib/format';
import { totals } from '@/lib/calculations';
import InvoiceItemsTable from './InvoiceItemsTable';
import type { CatalogProduct, CustomerOption, InvoiceKind, InvoiceRow } from './types';

interface Props {
  products: CatalogProduct[];
  customers: CustomerOption[];
  taxRate: number;
}

/** Client preview is advisory; the server always recomputes authoritative totals. */
export default function InvoiceEditor({ products, customers, taxRate }: Props) {
  const [rows, setRows] = useState<InvoiceRow[]>([
    { key: 0, productId: products[0]?.id ?? '', quantity: 1 },
  ]);
  const [nextKey, setNextKey] = useState(1);
  const [kind, setKind] = useState<InvoiceKind>('SALE');
  const [tax, setTax] = useState(taxRate);
  const [discount, setDiscount] = useState('0');

  const catalog = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const validDiscount = /^\d{1,15}$/.test(discount);
  const discountToman = validDiscount ? BigInt(discount) : 0n;
  const lineItems = rows.map((row) => ({
    quantity: row.quantity,
    unitPriceToman: BigInt(catalog.get(row.productId)?.price ?? '0'),
  }));
  const subtotal = lineItems.reduce((sum, line) =>
    sum + BigInt(Number.isSafeInteger(line.quantity) && line.quantity > 0 ? line.quantity : 0) * line.unitPriceToman, 0n);

  const invalidRows = rows.some((row) => !row.productId || !Number.isSafeInteger(row.quantity) || row.quantity < 1);
  const ids = rows.map(({ productId }) => productId).filter(Boolean);
  const duplicateProduct = new Set(ids).size !== ids.length;
  const insufficientStock = kind === 'SALE' && rows.some(({ productId, quantity }) =>
    quantity > (catalog.get(productId)?.stock ?? 0));
  const invalid = invalidRows || duplicateProduct || insufficientStock || !validDiscount ||
    discountToman > subtotal || rows.length > 100 || !products.length || !customers.length;

  const summary = !invalid
    ? totals(lineItems, discountToman, tax)
    : { subtotal, tax: 0n, total: subtotal };

  function updateRow(key: number, patch: Partial<InvoiceRow>) {
    setRows((current) => current.map((row) => row.key === key ? { ...row, ...patch } : row));
  }

  function addRow() {
    if (rows.length >= 100) return;
    setRows((current) => [...current, { key: nextKey, productId: '', quantity: 1 }]);
    setNextKey((value) => value + 1);
  }

  return (
    <form action={createInvoiceAction} className="invoice-form">
      <input type="hidden" name="items" value={JSON.stringify(rows.map(({ productId, quantity }) => ({ productId, quantity })))} />
      <section className="panel">
        <div className="panel-title"><div><h2>مشخصات سند</h2><p>نوع سند و طرف حساب را انتخاب کنید.</p></div></div>
        <div className="form-grid">
          <label>نوع سند
            <select name="type" value={kind} onChange={(event) => setKind(event.target.value as InvoiceKind)}>
              <option value="SALE">فاکتور فروش قطعی (کسر از انبار)</option>
              <option value="QUOTE">پیش‌فاکتور (بدون کسر از انبار)</option>
            </select>
          </label>
          <label>مشتری *
            <select name="customerId" required defaultValue="">
              <option value="">انتخاب مشتری</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label>تاریخ سررسید (اختیاری)<input name="dueAt" type="date" /></label>
          <label>مالیات (%)
            <input name="taxRate" type="number" min="0" max="100" step="1" value={tax}
              onChange={(event) => setTax(Math.max(0, Math.min(100, Number(event.target.value) || 0)))} />
          </label>
        </div>
      </section>
      <section className="panel">
        <div className="panel-title">
          <div><h2>اقلام فاکتور</h2><p>قیمت‌ها از کاتالوگ کالا خوانده می‌شوند.</p></div>
          <button type="button" className="btn btn-outline btn-sm" onClick={addRow} disabled={rows.length >= 100}>
            <Plus size={17} /> افزودن ردیف
          </button>
        </div>
        <InvoiceItemsTable rows={rows} products={products} kind={kind} updateRow={updateRow}
          removeRow={(key) => setRows((current) => current.filter((row) => row.key !== key))} />
        {duplicateProduct && <p className="form-validation">هر کالا را فقط یک‌بار وارد کنید.</p>}
        {insufficientStock && <p className="form-validation">موجودی یک یا چند کالا کافی نیست.</p>}
      </section>
      <div className="invoice-bottom">
        <section className="panel">
          <div className="panel-title"><h2>توضیحات</h2></div>
          <label>یادداشت یا شرایط پرداخت
            <textarea name="notes" rows={5} placeholder="توضیحات اختیاری روی فاکتور" />
          </label>
        </section>
        <section className="panel totals-panel">
          <h2>خلاصه مبلغ فاکتور</h2>
          <div className="total-line"><span>جمع اقلام</span><strong>{money(subtotal)}</strong></div>
          <label className="total-line">تخفیف (تومان)
            <input name="discountToman" type="number" min="0" step="1" value={discount}
              onChange={(event) => setDiscount(event.target.value)} />
          </label>
          <div className="total-line"><span>مالیات ({tax}٪)</span><strong>{money(summary.tax)}</strong></div>
          <div className="grand-total"><span>مبلغ قابل پرداخت</span><strong>{money(summary.total)}</strong></div>
          {!validDiscount && <p className="form-validation">تخفیف باید عدد صحیح حداکثر ۱۵ رقمی باشد.</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={invalid}>
            <FilePlus2 size={19} /> {kind === 'SALE' ? 'صدور فاکتور فروش' : 'ثبت پیش‌فاکتور'}
          </button>
          <p className="form-hint">موجودی و ثبت حسابداری فقط برای فاکتور فروش قطعی اعمال می‌شوند.</p>
        </section>
      </div>
    </form>
  );
}
