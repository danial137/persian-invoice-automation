import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { getDashboardData } from '@/lib/queries/dashboard';
import { money, persianDate } from '@/lib/format';
import DashboardStats from '@/components/dashboard/DashboardStats';
import SalesChart from '@/components/dashboard/SalesChart';
import QuickLinks from '@/components/dashboard/QuickLinks';
import PageHeading from '@/components/ui/PageHeading';
import SectionHeading from '@/components/ui/SectionHeading';
import EmptyRow from '@/components/ui/EmptyRow';
import StatusBadge from '@/components/StatusBadge';

export default async function DashboardPage() {
  const { latest, months, ...stats } = await getDashboardData();

  return (
    <>
      <PageHeading
        eyebrow="داشبورد مدیریتی"
        title="سلام، خوش اومدی 👋"
        description="خلاصه‌ای از عملکرد کسب‌وکارت را اینجا ببین."
        action={<Link className="btn btn-primary" href="/invoices/new"><Plus size={18} /> صدور فاکتور</Link>}
      />
      <DashboardStats {...stats} />
      <div className="dash-columns">
        <SalesChart months={months} />
        <QuickLinks />
      </div>
      <section className="panel">
        <SectionHeading
          title="آخرین فاکتورها"
          description="جدیدترین فعالیت‌های فروش"
          action={<Link className="link-more" href="/invoices">مشاهده همه <ArrowLeft size={17} /></Link>}
        />
        <div className="table-wrap">
          <table>
            <thead><tr><th>شماره</th><th>مشتری</th><th>نوع</th><th>تاریخ</th><th>مبلغ</th><th>وضعیت</th></tr></thead>
            <tbody>
              {latest.map((invoice) => (
                <tr key={invoice.id}>
                  <td><Link href={`/invoices/${invoice.id}`} className="table-link">{invoice.number}</Link></td>
                  <td>{invoice.customer.name}</td>
                  <td>{invoice.type === 'SALE' ? 'فاکتور فروش' : 'پیش‌فاکتور'}</td>
                  <td>{persianDate(invoice.createdAt)}</td>
                  <td className="num">{money(invoice.totalToman)}</td>
                  <td><StatusBadge status={invoice.status} /></td>
                </tr>
              ))}
              {!latest.length && <EmptyRow columns={6} message="هنوز فاکتوری صادر نشده است." />}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
