import { FileText, TrendingUp, Users, Wallet } from 'lucide-react';
import { money, numeric } from '@/lib/format';

interface Props {
  sold: bigint;
  due: bigint;
  received: bigint;
  customerCount: number;
  productCount: number;
}

export default function DashboardStats({ sold, due, received, customerCount, productCount }: Props) {
  const stats = [
    { label: 'مجموع فروش', value: money(sold), hint: 'فاکتورهای فروش فعال', icon: TrendingUp, color: 'purple' },
    { label: 'مجموع دریافتی', value: money(received), hint: 'ثبت‌شده در سیستم', icon: Wallet, color: 'green' },
    { label: 'مانده مطالبات', value: money(due), hint: 'فاکتورهای تسویه‌نشده', icon: FileText, color: 'orange' },
    { label: 'مشتریان / کالاها', value: `${numeric(customerCount)} / ${numeric(productCount)}`, hint: 'مشتری / محصول', icon: Users, color: 'blue' },
  ];

  return <section className="stats-grid" aria-label="آمار فروش">
    {stats.map(({ label, value, hint, icon: Icon, color }) => (
      <div className="stat-card" key={label}>
        <div className="stat-top"><span>{label}</span><div className={`stat-icon ${color}`}><Icon size={21} /></div></div>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
    ))}
  </section>;
}
