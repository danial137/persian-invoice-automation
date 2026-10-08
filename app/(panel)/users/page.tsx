import { UserCog } from 'lucide-react';
import { toggleUserAction } from '@/app/actions/auth';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { roles, persianDate } from '@/lib/format';
import CreateUserForm from '@/components/forms/CreateUserForm';
import Notice from '@/components/Notice';
import PageHeading from '@/components/ui/PageHeading';
import SectionHeading from '@/components/ui/SectionHeading';

export const metadata = { title: 'کاربران' };

export default async function UsersPage({ searchParams }: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const [user, params, users] = await Promise.all([
    requireRole(['ADMIN']),
    searchParams,
    db.user.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);

  return <>
    <PageHeading eyebrow="امنیت و دسترسی" title="کاربران سیستم"
      description="تعریف کاربر و تعیین سطح دسترسی نقش‌ها." action={<UserCog size={22} />} />
    <Notice error={params.error} ok={params.ok} />
    <section className="panel">
      <SectionHeading title="ایجاد حساب کاربری"
        description="فروشنده امور فروش را مدیریت می‌کند و حسابدار به خزانه و اسناد دسترسی دارد." />
      <CreateUserForm />
    </section>
    <section className="panel">
      <SectionHeading title="کاربران ثبت‌شده" description={`${users.length} حساب`} />
      <div className="table-wrap"><table>
        <thead><tr><th>نام</th><th>ایمیل</th><th>نقش</th><th>وضعیت</th><th>ایجاد</th><th>عملیات</th></tr></thead>
        <tbody>
          {users.map((account) => <tr key={account.id}>
            <td>{account.name}</td><td dir="ltr">{account.email}</td>
            <td>{roles[account.role]}</td>
            <td><span className={`status ${account.active ? 'status-paid' : 'status-cancelled'}`}>
              {account.active ? 'فعال' : 'غیرفعال'}
            </span></td>
            <td>{persianDate(account.createdAt)}</td>
            <td>{account.id !== user.id && <form action={toggleUserAction}>
              <input type="hidden" name="id" value={account.id} />
              <button className="btn btn-outline btn-sm">{account.active ? 'غیرفعال‌سازی' : 'فعال‌سازی'}</button>
            </form>}</td>
          </tr>)}
        </tbody>
      </table></div>
    </section>
  </>;
}
