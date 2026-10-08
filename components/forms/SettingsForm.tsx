import type { BusinessSetting } from '@prisma/client';
import { saveSettingsAction } from '@/app/actions/settings';
import SubmitButton from '@/components/ui/SubmitButton';

export default function SettingsForm({ settings }: { settings: BusinessSetting | null }) {
  return (
    <form action={saveSettingsAction} className="form-grid">
      <label>نام شرکت / فروشگاه<input name="name" defaultValue={settings?.name} required /></label>
      <label>تلفن<input name="phone" defaultValue={settings?.phone ?? ''} /></label>
      <label>شناسه ملی<input name="nationalId" defaultValue={settings?.nationalId ?? ''} /></label>
      <label>شناسه مالیاتی<input name="taxId" defaultValue={settings?.taxId ?? ''} /></label>
      <label>نرخ پیش‌فرض مالیات (%)<input name="defaultTaxRate" type="number" min="0" max="100" defaultValue={settings?.defaultTaxRate ?? 0} required /></label>
      <label className="col-span">نشانی<input name="address" defaultValue={settings?.address ?? ''} /></label>
      <label className="col-span">متن پایین فاکتور<textarea name="invoiceFooter" rows={3} defaultValue={settings?.invoiceFooter ?? ''} /></label>
      <div className="form-actions"><SubmitButton label="ذخیره تنظیمات" /></div>
    </form>
  );
}
