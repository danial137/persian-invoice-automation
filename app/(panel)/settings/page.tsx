import { Settings as Gear } from 'lucide-react';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import SettingsForm from '@/components/forms/SettingsForm';
import Notice from '@/components/Notice';
import PageHeading from '@/components/ui/PageHeading';
import SectionHeading from '@/components/ui/SectionHeading';

export const metadata = { title: 'تنظیمات' };

export default async function SettingsPage({ searchParams }: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  await requireRole(['ADMIN']);
  const [params, settings] = await Promise.all([
    searchParams,
    db.businessSetting.findUnique({ where: { id: 1 } }),
  ]);

  return <>
    <PageHeading eyebrow="پیکربندی" title="تنظیمات کسب‌وکار"
      description="اطلاعاتی که روی نسخه چاپی فاکتورها نمایش داده می‌شود."
      action={<Gear size={22} />} />
    <Notice error={params.error} ok={params.ok} />
    <section className="panel">
      <SectionHeading title="مشخصات فروشنده" description="اطلاعات حقوقی و تماس مجموعه" />
      <SettingsForm settings={settings} />
    </section>
  </>;
}
