import Link from 'next/link';
import { db } from '@/lib/db';
import InvoiceEditor from '@/components/invoices/InvoiceEditor';
import Notice from '@/components/Notice';
import PageHeading from '@/components/ui/PageHeading';

export const metadata = { title: 'صدور فاکتور' };

export default async function NewInvoicePage({ searchParams }: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [params, products, customers, settings] = await Promise.all([
    searchParams,
    db.product.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    db.customer.findMany({ orderBy: { name: 'asc' } }),
    db.businessSetting.findUnique({ where: { id: 1 } }),
  ]);

  return <>
    <PageHeading eyebrow="فروش / سند جدید" title="صدور فاکتور جدید"
      description="انتخاب مشتری، افزودن محصولات و محاسبه خودکار مبلغ."
      action={<Link href="/invoices" className="btn btn-outline">بازگشت به فاکتورها</Link>} />
    <Notice error={params.error} />
    {(!products.length || !customers.length) && (
      <div className="notice warn">
        برای صدور سند ابتدا <Link href="/products">کالا</Link> و <Link href="/customers">مشتری</Link> تعریف کنید.
      </div>
    )}
    <InvoiceEditor
      products={products.map((p) => ({ id: p.id, name: p.name, sku: p.sku, price: p.priceToman.toString(), stock: p.stock, unit: p.unit }))}
      customers={customers.map(({ id, name }) => ({ id, name }))}
      taxRate={settings?.defaultTaxRate ?? 0}
    />
  </>;
}
