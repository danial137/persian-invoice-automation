import { AlertTriangle, Warehouse } from 'lucide-react';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { money, numeric, persianDate } from '@/lib/format';
import InventoryAdjustmentForm from '@/components/forms/InventoryAdjustmentForm';
import Notice from '@/components/Notice';
import EmptyRow from '@/components/ui/EmptyRow';
import PageHeading from '@/components/ui/PageHeading';
import SectionHeading from '@/components/ui/SectionHeading';

export const metadata = { title: 'مدیریت انبار' };

const movementNames = {
  OPENING: 'موجودی اولیه',
  SALE: 'فروش',
  CANCELLATION: 'برگشت فروش',
  ADJUSTMENT: 'تعدیل دستی',
} as const;

export default async function InventoryPage({ searchParams }: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const [params, user, products, movements] = await Promise.all([
    searchParams,
    requireUser(),
    db.product.findMany({ orderBy: { name: 'asc' } }),
    db.inventoryMovement.findMany({ take: 30, orderBy: { createdAt: 'desc' }, include: { product: true, invoice: true } }),
  ]);
  const value = products.reduce((sum, p) => sum + p.costToman * BigInt(p.stock), 0n);
  const lowStock = products.filter((product) => product.stock <= 3).length;

  return <>
    <PageHeading eyebrow="گردش موجودی" title="مدیریت انبار"
      description="تعدیل موجودی، تاریخچه ورود و خروج، و ارزش انبار."
      action={<div className="head-metric"><small>ارزش موجودی</small><strong>{money(value)}</strong></div>} />
    <Notice error={params.error} ok={params.ok} />
    {lowStock > 0 && <div className="notice warn"><AlertTriangle size={17} /> {lowStock} کالا موجودی کم یا صفر دارد.</div>}
    {user.role !== 'SALES' && <section className="panel">
      <SectionHeading title="ثبت رسید / حواله تعدیل انبار"
        description="ورود و خروج دستی موجودی با سند حسابداری خودکار" action={<Warehouse size={20} />} />
      <InventoryAdjustmentForm products={products} />
    </section>}
    <section className="panel">
      <SectionHeading title="تاریخچه گردش کالا" description="آخرین ۳۰ حرکت ثبت‌شده" />
      <div className="table-wrap"><table>
        <thead><tr><th>کالا</th><th>نوع</th><th>تغییر موجودی</th><th>ارجاع</th><th>تاریخ</th></tr></thead>
        <tbody>
          {movements.map((movement) => <tr key={movement.id}>
            <td>{movement.product.name}</td>
            <td>{movementNames[movement.reason]}</td>
            <td className={movement.delta > 0 ? 'positive' : 'negative'}>
              {movement.delta > 0 ? '+' : ''}{numeric(movement.delta)}
            </td>
            <td>{movement.invoice?.number || '—'}</td>
            <td>{persianDate(movement.createdAt)}</td>
          </tr>)}
          {!movements.length && <EmptyRow columns={5} message="گردش موجودی ثبت نشده است." />}
        </tbody>
      </table></div>
    </section>
  </>;
}
