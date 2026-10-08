import { Trash2 } from 'lucide-react';
import { money } from '@/lib/format';
import type { CatalogProduct, InvoiceKind, InvoiceRow } from './types';

interface Props {
  rows: InvoiceRow[];
  products: CatalogProduct[];
  kind: InvoiceKind;
  updateRow: (key: number, patch: Partial<InvoiceRow>) => void;
  removeRow: (key: number) => void;
}

function safeQuantity(value: number) {
  return Number.isSafeInteger(value) && value > 0 ? BigInt(value) : 0n;
}

export default function InvoiceItemsTable({ rows, products, kind, updateRow, removeRow }: Props) {
  const byId = new Map(products.map((product) => [product.id, product]));

  return (
    <div className="table-wrap" role="region" aria-label="جدول اقلام فاکتور" tabIndex={0}>
      <table className="invoice-items-table">
        <thead><tr><th>شرح کالا</th><th>موجودی</th><th>تعداد</th><th>قیمت واحد</th><th>مبلغ</th><th>عملیات</th></tr></thead>
        <tbody>
          {rows.map((row) => {
            const product = byId.get(row.productId);
            const insufficientStock = Boolean(product && kind === 'SALE' && row.quantity > product.stock);
            const lineTotal = BigInt(product?.price ?? '0') * safeQuantity(row.quantity);

            return (
              <tr key={row.key}>
                <td>
                  <select className="item-select" aria-label="محصول" required value={row.productId}
                    onChange={(event) => updateRow(row.key, { productId: event.target.value })}>
                    <option value="">انتخاب محصول</option>
                    {products.map((option) => (
                      <option key={option.id} value={option.id}>{option.name} · {option.sku}</option>
                    ))}
                  </select>
                </td>
                <td className={insufficientStock ? 'negative' : ''}>
                  {product ? `${product.stock} ${product.unit}` : '—'}
                </td>
                <td>
                  <input className="quantity-input" aria-label="تعداد" type="number" min="1"
                    max="9999999" step="1" required value={row.quantity}
                    onChange={(event) => updateRow(row.key, { quantity: Number(event.target.value) })} />
                </td>
                <td>{product ? money(product.price) : '—'}</td>
                <td><strong>{money(lineTotal)}</strong></td>
                <td>
                  <button type="button" className="icon-btn danger" aria-label="حذف ردیف"
                    disabled={rows.length === 1} onClick={() => removeRow(row.key)}>
                    <Trash2 size={17} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
