import { createUserAction } from '@/app/actions/auth';
import SubmitButton from '@/components/ui/SubmitButton';

export default function CreateUserForm() {
  return (
    <form action={createUserAction} className="form-grid">
      <label>نام و نام خانوادگی<input name="name" required /></label>
      <label>ایمیل<input type="email" name="email" dir="ltr" required /></label>
      <label>رمز عبور (حداقل ۱۲ کاراکتر)<input name="password" type="password" minLength={12} required /></label>
      <label>نقش
        <select name="role">
          <option value="SALES">فروشنده</option>
          <option value="ACCOUNTANT">حسابدار</option>
          <option value="ADMIN">مدیر کل</option>
        </select>
      </label>
      <div className="form-actions"><SubmitButton label="ثبت کاربر" /></div>
    </form>
  );
}
