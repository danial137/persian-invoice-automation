import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { db } from '@/lib/db';
import { money, persianDate } from '@/lib/format';
import StatusBadge from '@/components/StatusBadge';
import Notice from '@/components/Notice';
import PageHeading from '@/components/ui/PageHeading';
import SectionHeading from '@/components/ui/SectionHeading';
import EmptyRow from '@/components/ui/EmptyRow';

export const metadata = { title: 'فاکتورها' };

interface Params { q?: string; type?: string; error?: string; ok?: string }

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const search = (params.q ?? '').slice(0, 100);
  const type = params.type === 'SALE' || params.type === 'QUOTE' ? params.type : undefined;
  const invoices = await db.invoice.findMany({
    where: {
      ...(type && { type }),
      ...(search && { OR: [
        { number: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ] }),
    },
    include: { customer: true },
    orderBy: { createdAt: 'desc' },
    take: 150,
  });

  return <>
    <PageHeading eyebrow="فروش" title="فاکتورها و پیش‌فاکتورها"
      description="صدور، پیگیری مطالبات و مشاهده جزئیات اسناد."
      action={<Link href="/invoices/new" className="btn btn-primary"><Plus size={18} /> فاکتور جدید</Link>} />
    <Notice error={params.error} ok={params.ok} />
    <section className="panel">
      <SectionHeading title="فهرست اسناد" description={`${invoices.length} مورد نمایش داده شده`}
        action={<form className="search multi-search" method="get">
          <Search size={17} />
          <input name="q" defaultValue={search} placeholder="شماره یا نام مشتری" />
          <select name="type" defaultValue={type ?? ''}>
            <option value="">همه</option><option value="SALE">فاکتور فروش</option><option value="QUOTE">پیش‌فاکتور</option>
          </select>
          <button>فیلتر</button>
        </form>} />
      <div className="table-wrap"><table>
        <thead><tr><th>شماره</th><th>مشتری</th><th>نوع</th><th>تاریخ</th><th>مبلغ کل</th><th>باقی‌مانده</th><th>وضعیت</th><th>جزئیات</th></tr></thead>
        <tbody>
          {invoices.map((invoice) => <tr key={invoice.id}>
            <td className="code">{invoice.number}</td>
            <td><strong>{invoice.customer.name}</strong></td>
            <td>{invoice.type === 'SALE' ? 'فروش' : 'پیش‌فاکتور'}</td>
            <td>{persianDate(invoice.issuedAt)}</td>
            <td>{money(invoice.totalToman)}</td>
            <td>{invoice.type === 'SALE' && invoice.status !== 'CANCELLED' ? money(invoice.totalToman - invoice.paidToman) : '—'}</td>
            <td><StatusBadge status={invoice.status} /></td>
            <td><Link href={`/invoices/${invoice.id}`} className="table-link">مشاهده ←</Link></td>
          </tr>)}
          {!invoices.length && <EmptyRow columns={8} message="سندی یافت نشد." />}
        </tbody>
      </table></div>
    </section>
  </>;
}
