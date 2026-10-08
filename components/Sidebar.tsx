'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  BookOpen,
  Boxes,
  ChartNoAxesCombined,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  ReceiptText,
  Settings,
  UserCog,
  Users,
  Wallet,
  Warehouse,
  X,
} from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';

const navigation = [
  { href: '/', text: 'نمای کلی', icon: LayoutDashboard },
  { href: '/invoices', text: 'فاکتورها و پیش‌فاکتورها', icon: FileText },
  { href: '/customers', text: 'مشتریان', icon: Users },
  { href: '/products', text: 'کالاها و خدمات', icon: Boxes },
  { href: '/inventory', text: 'عملیات انبار', icon: Warehouse },
  { href: '/payments', text: 'دریافت‌ها', icon: Wallet },
  { href: '/accounting', text: 'حسابداری و اسناد', icon: BookOpen },
  { href: '/reports', text: 'گزارش‌ها', icon: ChartNoAxesCombined },
  { href: '/users', text: 'کاربران', icon: UserCog, adminOnly: true },
  { href: '/settings', text: 'تنظیمات کسب‌وکار', icon: Settings, adminOnly: true },
];

type SidebarUser = { name: string; email: string; role: string };

export default function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        className="mobile-menu"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="main-navigation"
        aria-label={open ? 'بستن منو' : 'باز کردن منو'}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && <button type="button" className="overlay" aria-label="بستن منو" onClick={closeMenu} />}

      <aside id="main-navigation" className={`sidebar${open ? ' sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-icon"><ReceiptText size={27} /></div>
          <div><strong>حساب‌یار</strong><small>اتوماسیون هوشمند فروش</small></div>
        </div>

        <Link href="/invoices/new" onClick={closeMenu} className="side-create">
          <PlusCircle size={18} /> صدور فاکتور جدید
        </Link>

        <div className="nav-label">منوی اصلی</div>
        <nav className="nav-list" aria-label="منوی مدیریت">
          {navigation
            .filter((item) => !item.adminOnly || user.role === 'ADMIN')
            .map((item) => {
              const Icon = item.icon;
              const active = item.href === '/' ? pathname === '/' :
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  aria-current={active ? 'page' : undefined}
                  className={`nav-item${active ? ' active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.text}</span>
                </Link>
              );
            })}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-avatar">{user.name.slice(0, 1)}</div>
          <div className="user-mini">
            <strong>{user.name}</strong>
            <small>{user.email}</small>
          </div>
          <form action={logoutAction}>
            <button className="logout" title="خروج" aria-label="خروج"><LogOut size={18} /></button>
          </form>
        </div>
      </aside>
    </>
  );
}
