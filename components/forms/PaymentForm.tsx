import { addPaymentAction } from '@/app/actions/payments';
import { money } from '@/lib/format';
import SubmitButton from '@/components/ui/SubmitButton';

export default function PaymentForm({ invoiceId, remaining }: {
  invoiceId: string;
  remaining: bigint;
}) {
  return (
    <section className="panel">
      <h2>ثبت دریافت وجه</h2>
      <p>مانده قابل دریافت: {money(remaining)}</p>
      <form action={addPaymentAction} className="form-grid">
        <input type="hidden" name="invoiceId" value={invoiceId} />
        <label>مبلغ (تومان)<input name="amountToman" type="number" min="1" max={remaining.toString()} required /></label>
        <label>روش دریافت
          <select name="method">
            <option value="TRANSFER">انتقال بانکی</option>
            <option value="CARD">کارت‌خوان</option>
            <option value="CASH">نقدی</option>
            <option value="OTHER">سایر</option>
          </select>
        </label>
        <label>شناسه پیگیری<input name="reference" /></label>
        <label>توضیحات<input name="note" /></label>
        <div className="form-actions"><SubmitButton label="ثبت و صدور سند دریافت" /></div>
      </form>
    </section>
  );
}
