import { redirect } from 'next/navigation';
import { ChartNoAxesCombined, LockKeyhole, ReceiptText, ShieldCheck } from 'lucide-react';
import { loginAction } from '@/app/actions/auth';
import { currentUser } from '@/lib/auth';
import Notice from '@/components/Notice';
import SubmitButton from '@/components/ui/SubmitButton';

export const metadata = { title: 'ورود به حساب' };

export default async function LoginPage({ searchParams }: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await currentUser()) redirect('/');
  const params = await searchParams;

  return (
    <main className="login-screen">
      <section className="login-intro">
        <div className="login-brand"><ReceiptText size={28} /> حساب‌یار</div>
        <h1>مدیریت مالی،<br /><span>ساده و دقیق.</span></h1>
        <p>فاکتورها، مشتریان، موجودی و اسناد حسابداری را در یک فضای یکپارچه مدیریت کنید.</p>
        <div className="login-highlights">
          <span><ShieldCheck size={19} /> دسترسی امن</span>
          <span><ChartNoAxesCombined size={19} /> گزارش لحظه‌ای</span>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <div className="login-card-icon"><LockKeyhole size={24} /></div>
          <h2>ورود به حساب کاربری</h2>
          <p>برای دسترسی به داشبورد وارد شوید.</p>
          <Notice error={params.error} />
          <form action={loginAction} className="stack">
            <label>ایمیل کاری
              <input name="email" type="email" required placeholder="admin@example.com"
                autoComplete="username" dir="ltr" />
            </label>
            <label>رمز عبور
              <input name="password" type="password" required placeholder="••••••••••••"
                autoComplete="current-password" dir="ltr" />
            </label>
            <SubmitButton label="ورود به سیستم ←" className="btn btn-primary btn-block" />
          </form>
          <div className="login-note">برای ورود اولیه، مشخصات موجود در فایل <code>.env</code> را استفاده کنید.</div>
        </div>
      </section>
    </main>
  );
}
