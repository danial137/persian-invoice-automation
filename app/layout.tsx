import type { Metadata } from 'next';
import '@/styles/base.css';
import '@/styles/components.css';
import '@/styles/auth.css';
import '@/styles/responsive.css';
import '@/styles/print.css';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'حساب‌یار | اتوماسیون فروش',
    template: '%s | حساب‌یار',
  },
  description: 'مدیریت فاکتور، انبار و حسابداری فارسی',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="fa" dir="rtl"><body>{children}</body></html>;
}
