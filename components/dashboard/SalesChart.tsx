import { money } from '@/lib/format';
import SectionHeading from '@/components/ui/SectionHeading';

interface Month { label: string; sum: bigint }

export default function SalesChart({ months }: { months: Month[] }) {
  const max = months.reduce((largest, month) => month.sum > largest ? month.sum : largest, 0n);

  return (
    <section className="panel chart-panel">
      <SectionHeading title="روند فروش" description="مجموع فروش در شش ماه اخیر" action={<span className="subtle-tag">۶ ماه گذشته</span>} />
      <div className="chart">
        {months.map((month, index) => (
          <div className="chart-col" key={`${month.label}-${index}`}>
            <div className="bar-region">
              <div className="chart-bar" title={money(month.sum)} style={{ height: `${max ? Math.max(6, Number(month.sum * 100n / max)) : 5}%` }} />
            </div>
            <span>{month.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
