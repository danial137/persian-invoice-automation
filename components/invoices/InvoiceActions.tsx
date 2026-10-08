import type { Payment, Prisma } from '@prisma/client';
import { cancelInvoiceAction, convertQuoteAction } from '@/app/actions/invoices';
import PaymentForm from '@/components/forms/PaymentForm';
import SectionHeading from '@/components/ui/SectionHeading';
import SubmitButton from '@/components/ui/SubmitButton';
import { methods, money, persianDate } from '@/lib/format';

type InvoiceActionsInput = Prisma.InvoiceGetPayload<{ include: { payments: true } }>;

export default function InvoiceActions({ invoice, canAccount }: {
  invoice: InvoiceActionsInput;
  canAccount: boolean;
}) {
  const remaining = invoice.totalToman - invoice.paidToman;

  return (
    <div className="detail-actions no-print">
      {invoice.type === 'QUOTE' && invoice.status === 'DRAFT' && (
        <section className="panel">
          <h2>تبدیل پیش‌فاکتور به فروش</h2>
          <p>هنگام تبدیل، قیمت‌های فعلی کالا مبنای محاسبه قرار می‌گیرند.</p>
          <form action={convertQuoteAction}>
            <input type="hidden" name="id" value={invoice.id} />
            <SubmitButton label="تبدیل به فاکتور فروش" />
          </form>
        </section>
      )}

      {invoice.type === 'SALE' && canAccount && remaining > 0n && ['ISSUED', 'PARTIAL'].includes(invoice.status) && (
        <PaymentForm invoiceId={invoice.id} remaining={remaining} />
      )}

      {invoice.payments.length > 0 && (
        <section className="panel">
          <SectionHeading title="سوابق پرداخت" />
          <div className="table-wrap">
            <table>
              <thead><tr><th>مبلغ</th><th>روش</th><th>شناسه پیگیری</th><th>تاریخ</th></tr></thead>
              <tbody>
                {invoice.payments.map((payment: Payment) => (
                  <tr key={payment.id}>
                    <td>{money(payment.amountToman)}</td>
                    <td>{methods[payment.method]}</td>
                    <td>{payment.reference || '—'}</td>
                    <td>{persianDate(payment.paidAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {canAccount && invoice.status !== 'CANCELLED' && invoice.paidToman === 0n && (
        <details className="cancel-box">
          <summary>لغو این سند</summary>
          <p>لغو فروش، موجودی را بازمی‌گرداند و سند برگشت حسابداری ثبت می‌کند.</p>
          <form action={cancelInvoiceAction}>
            <input type="hidden" name="id" value={invoice.id} />
            <SubmitButton label="تأیید لغو سند" className="btn btn-danger" />
          </form>
        </details>
      )}
    </div>
  );
}
