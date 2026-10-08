import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { persianDate } from '@/lib/format';
import InvoicePaper from '@/components/invoices/InvoicePaper';
import InvoiceActions from '@/components/invoices/InvoiceActions';
import StatusBadge from '@/components/StatusBadge';
import PrintButton from '@/components/PrintButton';
import Notice from '@/components/Notice';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; ok?: string }>;
}

export default async function InvoiceDetailPage({ params, searchParams }: Props) {
  const [{ id }, query, user] = await Promise.all([params, searchParams, requireUser()]);
  const [invoice, settings] = await Promise.all([
    db.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        payments: { orderBy: { paidAt: 'desc' } },
        creator: { select: { name: true } },
      },
    }),
    db.businessSetting.findUnique({ where: { id: 1 } }),
  ]);
  if (!invoice) notFound();

  return <>
    <header className="page-head no-print">
      <div>
        <div className="eyebrow"><Link href="/invoices">فاکتورها</Link> / جزئیات سند</div>
        <h1>{invoice.type === 'SALE' ? 'فاکتور فروش' : 'پیش‌فاکتور'} {invoice.number}</h1>
        <p>تاریخ صدور: {persianDate(invoice.issuedAt)}</p>
      </div>
      <div className="head-buttons">
        <StatusBadge status={invoice.status} />
        <PrintButton />
        <Link className="btn btn-outline" href="/invoices"><ArrowRight size={17} /> بازگشت</Link>
      </div>
    </header>
    <div className="no-print"><Notice error={query.error} ok={query.ok} /></div>
    <InvoicePaper invoice={invoice} settings={settings} />
    <InvoiceActions invoice={invoice} canAccount={user.role !== 'SALES'} />
  </>;
}
