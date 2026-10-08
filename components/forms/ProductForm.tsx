import type { Product } from '@prisma/client';
import { saveProductAction } from '@/app/actions/products';
import SubmitButton from '@/components/ui/SubmitButton';

export default function ProductForm({ product }: { product?: Product }) {
  return (
    <form action={saveProductAction} className={product ? 'mini-form' : 'form-grid'}>
      {product && <input type="hidden" name="id" value={product.id} />}
      <label>کد کالا (SKU) *<input name="sku" dir="ltr" required defaultValue={product?.sku} maxLength={60} /></label>
      <label>نام محصول *<input name="name" required defaultValue={product?.name} maxLength={180} /></label>
      <label>واحد<input name="unit" required defaultValue={product?.unit ?? 'عدد'} /></label>
      <label>قیمت فروش (تومان) *<input type="number" name="priceToman" min="1" step="1" required defaultValue={product?.priceToman.toString()} /></label>
      <label>بهای تمام‌شده (تومان)<input type="number" name="costToman" min="0" step="1" required defaultValue={product?.costToman.toString() ?? '0'} /></label>
      <div className={product ? '' : 'form-actions'}>
        <SubmitButton label={product ? 'ذخیره تغییرات' : 'ثبت کالا'} />
      </div>
    </form>
  );
}
