import Link from 'next/link';
import { Wallet } from 'lucide-react';
import { db } from '@/lib/db';
import { methods, money, persianDate } from '@/lib/format';
import PageHeading from '@/components/ui/PageHeading';
import SectionHeading from '@/components/ui/SectionHeading';
import EmptyRow from '@/components/ui/EmptyRow';

export const metadata = { title: 'دریافت‌ها' };

export default async function PaymentsPage() {
  const payments = await db.payment.findMany({
    take: 100,
    orderBy: { paidAt: 'desc' },
    include: { invoice: { include: { customer: true } } },
  });
  const total = payments.reduce((sum, payment) => sum + payment.amountToman, 0n);

  return <>
    <PageHeading eyebrow="خزانه" title="دریافت‌های ثبت‌شده"
      description="سوابق دریافت‌ها و روش‌های پرداخت مشتریان."
      action={<div className="head-metric"><Wallet size={18} /><small>جمع موارد نمایش‌داده‌شده</small><strong>{money(total)}</strong></div>} />
    <section className="panel">
      <SectionHeading title="دریافت‌ها" description={`آخرین ${payments.length} تراکنش`} />
      <div className="table-wrap"><table>
        <thead><tr><th>فاکتور</th><th>مشتری</th><th>مبلغ</th><th>روش پرداخت</th><th>شناسه پیگیری</th><th>تاریخ</th></tr></thead>
        <tbody>
          {payments.map((payment) => <tr key={payment.id}>
            <td><Link className="table-link" href={`/invoices/${payment.invoiceId}`}>{payment.invoice.number}</Link></td>
            <td>{payment.invoice.customer.name}</td>
            <td className="positive">{money(payment.amountToman)}</td>
            <td>{methods[payment.method]}</td>
            <td>{payment.reference || '—'}</td>
            <td>{persianDate(payment.paidAt)}</td>
          </tr>)}
          {!payments.length && <EmptyRow columns={6} message="پرداختی ثبت نشده است." />}
        </tbody>
      </table></div>
    </section>
  </>;
}
