import { BookOpen, Scale } from 'lucide-react';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { money, persianDate } from '@/lib/format';
import ManualJournalForm from '@/components/forms/ManualJournalForm';
import Notice from '@/components/Notice';
import PageHeading from '@/components/ui/PageHeading';
import SectionHeading from '@/components/ui/SectionHeading';

export const metadata = { title: 'حسابداری' };

export default async function AccountingPage({ searchParams }: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const [params, user, accounts, journals] = await Promise.all([
    searchParams,
    requireUser(),
    db.account.findMany({ orderBy: { code: 'asc' }, include: { lines: true } }),
    db.journalEntry.findMany({
      take: 60,
      orderBy: { postedAt: 'desc' },
      include: { lines: { include: { account: true } }, createdBy: { select: { name: true } } },
    }),
  ]);
  const totalDebit = accounts.reduce((sum, account) =>
    sum + account.lines.reduce((value, line) => value + line.debitToman, 0n), 0n);
  const totalCredit = accounts.reduce((sum, account) =>
    sum + account.lines.reduce((value, line) => value + line.creditToman, 0n), 0n);
  const balanced = totalDebit === totalCredit;

  return <>
    <PageHeading eyebrow="دفتر کل" title="حسابداری و اسناد"
      description="سندهای اتوماتیک فروش، خزانه و اسناد دستی دوبل."
      action={<div className="head-metric"><Scale size={18} /><small>وضعیت تراز اسناد</small><strong className={balanced ? 'positive' : 'negative'}>{balanced ? 'تراز' : 'نامتوازن'}</strong></div>} />
    <Notice error={params.error} ok={params.ok} />
    {user.role !== 'SALES' && <section className="panel">
      <SectionHeading title="ثبت سند حسابداری دستی" description="یک ثبت دوطرفه با مبلغ برابر ایجاد می‌شود." action={<BookOpen size={19} />} />
      <ManualJournalForm accounts={accounts} />
    </section>}
    <section className="panel">
      <SectionHeading title="تراز حساب‌های کل" description="تجمیع بدهکار و بستانکار از کلیه اسناد" />
      <div className="table-wrap"><table>
        <thead><tr><th>کد</th><th>عنوان حساب</th><th>بدهکار</th><th>بستانکار</th><th>مانده</th></tr></thead>
        <tbody>
          {accounts.map((account) => {
            const debit = account.lines.reduce((sum, line) => sum + line.debitToman, 0n);
            const credit = account.lines.reduce((sum, line) => sum + line.creditToman, 0n);
            return <tr key={account.id}>
              <td className="code">{account.code}</td><td>{account.name}</td>
              <td>{money(debit)}</td><td>{money(credit)}</td>
              <td className={debit >= credit ? 'positive' : 'negative'}>{money(debit - credit)}</td>
            </tr>;
          })}
          <tr className="total-row"><td colSpan={2}>جمع</td><td>{money(totalDebit)}</td><td>{money(totalCredit)}</td><td>{money(totalDebit - totalCredit)}</td></tr>
        </tbody>
      </table></div>
    </section>
    <section className="panel">
      <SectionHeading title="آخرین اسناد حسابداری" description={`آخرین ${journals.length} سند ثبت‌شده`} />
      <div className="journal-list">
        {journals.map((journal) => <details key={journal.id} className="journal">
          <summary><span className="journal-source">{journal.source}</span><strong>{journal.description}</strong><small>{persianDate(journal.postedAt)}</small></summary>
          <div className="table-wrap"><table>
            <thead><tr><th>حساب</th><th>بدهکار</th><th>بستانکار</th></tr></thead>
            <tbody>{journal.lines.map((line) => <tr key={line.id}>
              <td>{line.account.code} · {line.account.name}</td>
              <td>{money(line.debitToman)}</td><td>{money(line.creditToman)}</td>
            </tr>)}</tbody>
          </table></div>
        </details>)}
        {!journals.length && <div className="empty">هنوز سندی ثبت نشده است.</div>}
      </div>
    </section>
  </>;
}
