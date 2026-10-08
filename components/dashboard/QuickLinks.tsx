import Link from 'next/link';
import { ArrowUpLeft, FileText, Package, Users } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';

const links = [
  { href: '/invoices/new', title: 'فاکتور جدید', hint: 'صدور سند فروش یا پیش‌فاکتور', icon: FileText, color: 'purple' },
  { href: '/customers', title: 'مدیریت مشتریان', hint: 'ثبت اطلاعات و سوابق', icon: Users, color: 'blue' },
  { href: '/inventory', title: 'موجودی انبار', hint: 'ورود و خروج کالا', icon: Package, color: 'green' },
];

export default function QuickLinks() {
  return (
    <section className="panel quick-panel">
      <SectionHeading title="دسترسی سریع" description="کارهای روزمره" />
      <div className="quick-links">
        {links.map(({ href, title, hint, icon: Icon, color }) => (
          <Link key={href} href={href}>
            <span className={`quick-circle ${color}`}><Icon size={19} /></span>
            <div><strong>{title}</strong><small>{hint}</small></div>
            <ArrowUpLeft size={16} />
          </Link>
        ))}
      </div>
    </section>
  );
}
