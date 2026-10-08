import Sidebar from '@/components/Sidebar';
import { requireUser } from '@/lib/auth';
import { CalendarDays } from 'lucide-react';
import { persianDate } from '@/lib/format';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="app-shell">
      <Sidebar user={user} />
      <div className="main-area">
        <header className="topbar">
          <div className="breadcrumb">فضای کار <span>/</span> پنل مدیریت</div>
          <div className="top-actions">
            <span className="current-date"><CalendarDays size={16} />{persianDate(new Date())}</span>
            <span className="top-avatar" title={user.name}>{user.name.slice(0, 1)}</span>
          </div>
        </header>
        <main className="content">{children}</main>
        <footer className="footer">حساب‌یار · مدیریت فروش و حسابداری · مبالغ به تومان</footer>
      </div>
    </div>
  );
}
