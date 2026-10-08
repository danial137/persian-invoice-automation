import type { BusinessSetting, Prisma } from '@prisma/client';
import { Building2, ReceiptText, UserRound } from 'lucide-react';
import { money, numeric, persianDate } from '@/lib/format';

type DetailInvoice = Prisma.InvoiceGetPayload<{
  include: { customer: true; items: true; creator: { select: { name: true } } };
}>;

export default function InvoicePaper({ invoice, settings }: {
  invoice: DetailInvoice;
  settings: BusinessSetting | null;
}) {
  const remaining = invoice.totalToman - invoice.paidToman;
  const sale = invoice.type === 'SALE';

  return (
    <article className="invoice-paper">
      <div className="paper-head">
        <div className="paper-business">
          <div className="paper-logo"><ReceiptText size={30} /></div>
          <div>
            <h2>{settings?.name || 'حساب‌یار'}</h2>
            <p>{settings?.address || 'آدرس مجموعه ثبت نشده است.'}</p>
            <p>{settings?.phone}</p>
          </div>
        </div>
        <div className="paper-title">
          <strong>{sale ? 'فاکتور فروش' : 'پیش‌فاکتور'}</strong>
          <span>{invoice.number}</span>
          <small>تاریخ: {persianDate(invoice.issuedAt)}</small>
        </div>
      </div>

      <div className="invoice-metadata">
        <div>
          <span><UserRound size={17} /> اطلاعات خریدار</span>
          <strong>{invoice.customer.name}</strong>
          <small>{invoice.customer.phone || 'شماره تماس ثبت نشده'}</small>
          <small>{invoice.customer.address}</small>
          {invoice.customer.taxId && <small>شناسه: {invoice.customer.taxId}</small>}
        </div>
        <div>
          <span><Building2 size={17} /> مشخصات سند</span>
          <strong>صادرکننده: {invoice.creator.name}</strong>
          <small>سررسید: {persianDate(invoice.dueAt)}</small>
          <small>شناسه مالیاتی فروشنده: {settings?.taxId || '—'}</small>
          <small>شناسه ملی فروشنده: {settings?.nationalId || '—'}</small>
        </div>
      </div>

      <div className="table-wrap">
        <table className="paper-table">
          <thead>
            <tr>
              <th>ردیف</th><th>شرح کالا</th><th>واحد</th>
              <th>تعداد</th><th>قیمت واحد (تومان)</th><th>جمع (تومان)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id}>
                <td>{numeric(index + 1)}</td>
                <td>{item.description}</td>
                <td>{item.unit}</td>
                <td>{numeric(item.quantity)}</td>
                <td>{numeric(item.unitPriceToman)}</td>
                <td>{numeric(item.lineTotalToman)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="paper-end">
        <div className="paper-note">
          <strong>توضیحات:</strong>
          <p>{invoice.notes || '—'}</p>
          <p>{settings?.invoiceFooter}</p>
        </div>
        <div className="paper-totals">
          <div><span>جمع کل اقلام</span><strong>{money(invoice.subtotalToman)}</strong></div>
          <div><span>تخفیف</span><strong>{money(invoice.discountToman)}</strong></div>
          <div><span>مالیات ({numeric(invoice.taxRate)}٪)</span><strong>{money(invoice.taxToman)}</strong></div>
          <div className="paper-grand"><span>مبلغ نهایی</span><strong>{money(invoice.totalToman)}</strong></div>
          {sale && <>
            <div><span>پرداخت‌شده</span><strong>{money(invoice.paidToman)}</strong></div>
            <div><span>مانده</span><strong>{money(remaining)}</strong></div>
          </>}
        </div>
      </div>
      <div className="signatures"><span>مهر و امضای فروشنده</span><span>امضای خریدار</span></div>
    </article>
  );
}
