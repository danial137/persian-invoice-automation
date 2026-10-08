import type { Customer } from '@prisma/client';
import { saveCustomerAction } from '@/app/actions/customers';
import SubmitButton from '@/components/ui/SubmitButton';

export default function CustomerForm({ customer }: { customer?: Customer }) {
  return (
    <form action={saveCustomerAction} className={customer ? 'mini-form' : 'form-grid'}>
      {customer && <input type="hidden" name="id" value={customer.id} />}
      <label>نام مشتری *<input name="name" defaultValue={customer?.name} required maxLength={150} /></label>
      <label>موبایل / تلفن<input name="phone" defaultValue={customer?.phone ?? ''} dir="ltr" /></label>
      <label>ایمیل<input name="email" type="email" defaultValue={customer?.email ?? ''} dir="ltr" /></label>
      <label>شناسه ملی / کد اقتصادی<input name="taxId" defaultValue={customer?.taxId ?? ''} /></label>
      <label className={customer ? '' : 'col-span'}>آدرس<input name="address" defaultValue={customer?.address ?? ''} /></label>
      <div className={customer ? '' : 'form-actions'}>
        <SubmitButton label={customer ? 'ذخیره تغییرات' : 'ثبت مشتری'} />
      </div>
    </form>
  );
}
