import type { Product } from '@prisma/client';
import { adjustStockAction } from '@/app/actions/products';
import { numeric } from '@/lib/format';
import SubmitButton from '@/components/ui/SubmitButton';

export default function InventoryAdjustmentForm({ products }: { products: Product[] }) {
  return (
    <form action={adjustStockAction} className="form-grid">
      <label>کالا
        <select name="productId" required>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} · موجودی {numeric(product.stock)}
            </option>
          ))}
        </select>
      </label>
      <label>نوع عملیات
        <select name="direction">
          <option value="IN">ورود به انبار (+)</option>
          <option value="OUT">خروج / کسری انبار (-)</option>
        </select>
      </label>
      <label>تعداد<input name="quantity" type="number" min="1" step="1" required /></label>
      <div className="form-actions">
        {products.length > 0 && <SubmitButton label="ثبت گردش موجودی" />}
      </div>
    </form>
  );
}
