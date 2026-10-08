import Link from 'next/link';
import { ChartNoAxesCombined, Download } from 'lucide-react';
import { db } from '@/lib/db';
import { money, numeric, persianDate } from '@/lib/format';
import PageHeading from '@/components/ui/PageHeading';
import SectionHeading from '@/components/ui/SectionHeading';
import EmptyRow from '@/components/ui/EmptyRow';

export const metadata = { title: 'گزارش‌ها' };

export default async function ReportsPage() {
  const invoices = await db.invoice.findMany({
    where: { type: 'SALE', status: { not: 'CANCELLED' } },
    include: { customer: true },
    orderBy: { issuedAt: 'desc' },
    take: 1000,
  });
  const total = invoices.reduce((sum, invoice) => sum + invoice.totalToman, 0n);
  const paid = invoices.reduce((sum, invoice) => sum + invoice.paidToman, 0n);
  const tax = invoices.reduce((sum, invoice) => sum + invoice.taxToman, 0n);

  const customerSales = new Map<string, { name: string; amount: bigint; count: number }>();
  for (const invoice of invoices) {
    const existing = customerSales.get(invoice.customerId) ?? {
      name: invoice.customer.name, amount: 0n, count: 0,
    };
    existing.amount += invoice.totalToman;
    existing.count += 1;
    customerSales.set(invoice.customerId, existing);
  }
  const ranking = [...customerSales.values()]
    .sort((a, b) => a.amount > b.amount ? -1 : a.amount < b.amount ? 1 : 0)
    .slice(0, 8);
  const recoveryPercent = total > 0n ? Number(paid * 100n / total) : 0;

  return <>
    <PageHeading eyebrow="تحلیل کسب‌وکار" title="گزارش‌های مالی و فروش"
      description="ارزش فروش، وضعیت وصول و بزرگ‌ترین مشتریان."
      action={<a href="/api/reports/sales" className="btn btn-outline"><Download size={18} /> خروجی CSV فروش</a>} />
    <div className="stats-grid">
      {[
        { title: 'ارزش فروش', value: money(total), hint: `${numeric(invoices.length)} سند قطعی` },
        { title: 'دریافتی فروش', value: money(paid), hint: 'وصول‌شده از فاکتورها' },
        { title: 'مطالبات', value: money(total - paid), hint: 'مانده سررسیددار و جاری' },
        { title: 'مالیات فروش', value: money(tax), hint: 'مالیات محاسبه‌شده فاکتورها' },
      ].map((item) => <div className="stat-card" key={item.title}>
        <div className="stat-top"><span>{item.title}</span><ChartNoAxesCombined size={20} /></div>
        <strong>{item.value}</strong><small>{item.hint}</small>
      </div>)}
    </div>
    <div className="dash-columns">
      <section className="panel">
        <SectionHeading title="مشتریان برتر" description="براساس مجموع فروش قطعی" />
        <div className="ranking">
          {ranking.map((customer, index) => <div className="rank-row" key={customer.name}>
            <span className="rank-num">{numeric(index + 1)}</span>
            <div><strong>{customer.name}</strong><small>{numeric(customer.count)} فاکتور</small></div>
            <strong>{money(customer.amount)}</strong>
          </div>)}
          {!ranking.length && <div className="empty">داده‌ای موجود نیست.</div>}
        </div>
      </section>
      <section className="panel">
        <SectionHeading title="نسبت وصول مطالبات" description="مقایسه دریافت‌شده و باقی‌مانده" />
        <div className="progress-report">
          <div className="progress-percent">{numeric(recoveryPercent)}٪</div>
          <div className="progress-track"><div style={{ width: `${recoveryPercent}%` }} /></div>
          <div className="progress-label"><span>وصول‌شده</span><span>مانده</span></div>
          <p>این گزارش تا سقف ۱۰۰۰ فاکتور اخیر را محاسبه می‌کند.</p>
        </div>
      </section>
    </div>
    <section className="panel">
      <SectionHeading title="آخرین فروش‌ها" description="جدیدترین فاکتورهای قطعی" />
      <div className="table-wrap"><table>
        <thead><tr><th>فاکتور</th><th>خریدار</th><th>تاریخ</th><th>فروش</th><th>مانده</th></tr></thead>
        <tbody>
          {invoices.slice(0, 20).map((invoice) => <tr key={invoice.id}>
            <td><Link className="table-link" href={`/invoices/${invoice.id}`}>{invoice.number}</Link></td>
            <td>{invoice.customer.name}</td><td>{persianDate(invoice.issuedAt)}</td>
            <td>{money(invoice.totalToman)}</td><td>{money(invoice.totalToman - invoice.paidToman)}</td>
          </tr>)}
          {!invoices.length && <EmptyRow columns={5} message="فروشی ثبت نشده است." />}
        </tbody>
      </table></div>
    </section>
  </>;
}
