import { Plus, Search, Users } from 'lucide-react';
import { db } from '@/lib/db';
import { persianDate } from '@/lib/format';
import CustomerForm from '@/components/forms/CustomerForm';
import Notice from '@/components/Notice';
import EmptyRow from '@/components/ui/EmptyRow';
import PageHeading from '@/components/ui/PageHeading';
import SectionHeading from '@/components/ui/SectionHeading';

export const metadata = { title: 'مشتریان' };

interface SearchParams {
  q?: string;
  error?: string;
  ok?: string;
}

export default async function CustomersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = (params.q ?? '').slice(0, 100);
  const customers = await db.customer.findMany({
    where: query ? { OR: [{ name: { contains: query, mode: 'insensitive' } }, { phone: { contains: query } }] } : {},
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { _count: { select: { invoices: true } } },
  });

  return <>
    <PageHeading eyebrow="CRM" title="مدیریت مشتریان"
      description="مشخصات و سوابق مشتریان را در یک‌جا مدیریت کنید."
      action={<a className="btn btn-primary" href="#new-customer"><Plus size={18} /> مشتری جدید</a>} />
    <Notice error={params.error} ok={params.ok} />
    <section className="panel" id="new-customer">
      <SectionHeading title="افزودن مشتری" description="اطلاعات مشتری حقیقی یا حقوقی" action={<Users size={20} />} />
      <CustomerForm />
    </section>
    <section className="panel">
      <SectionHeading title="فهرست مشتریان" description={`${customers.length} مورد نمایش داده شده`}
        action={<form className="search" method="get">
          <Search size={17} /><input name="q" defaultValue={query} placeholder="جست‌وجوی نام یا شماره تماس" />
          <button>جست‌وجو</button>
        </form>} />
      <div className="table-wrap">
        <table>
          <thead><tr><th>مشتری</th><th>تماس</th><th>شناسه</th><th>فاکتورها</th><th>تاریخ ثبت</th><th>ویرایش</th></tr></thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td><strong>{customer.name}</strong><div className="table-sub">{customer.email || customer.address || '—'}</div></td>
                <td>{customer.phone || '—'}</td><td>{customer.taxId || '—'}</td>
                <td>{customer._count.invoices}</td><td>{persianDate(customer.createdAt)}</td>
                <td><details className="edit-details"><summary>ویرایش</summary><CustomerForm customer={customer} /></details></td>
              </tr>
            ))}
            {!customers.length && <EmptyRow columns={6} message="مشتری یافت نشد." />}
          </tbody>
        </table>
      </div>
    </section>
  </>;
}
