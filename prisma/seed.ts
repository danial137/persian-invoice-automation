import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const db = new PrismaClient();

const defaultAccounts = [
  { code: '1000', name: 'صندوق و بانک', category: 'ASSET' },
  { code: '1100', name: 'حساب‌های دریافتنی', category: 'ASSET' },
  { code: '1200', name: 'موجودی کالا', category: 'ASSET' },
  { code: '2100', name: 'مالیات فروش پرداختنی', category: 'LIABILITY' },
  { code: '3000', name: 'سرمایه / تعدیلات اولیه', category: 'EQUITY' },
  { code: '4000', name: 'درآمد فروش', category: 'REVENUE' },
  { code: '5000', name: 'بهای تمام‌شده کالای فروش‌رفته', category: 'EXPENSE' },
  { code: '5100', name: 'کسری و ضایعات انبار', category: 'EXPENSE' },
  { code: '5200', name: 'هزینه‌های عمومی', category: 'EXPENSE' },
] as const;

async function seedAccounts() {
  for (const account of defaultAccounts) {
    await db.account.upsert({
      where: { code: account.code },
      update: { name: account.name, category: account.category },
      create: account,
    });
  }
}

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@example.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error('ADMIN_PASSWORD را در .env با حداقل ۱۲ کاراکتر تنظیم کنید.');
  }

  await db.user.upsert({
    where: { email },
    update: {}, // Do not silently replace the password of an existing admin.
    create: {
      name: 'مدیر سیستم',
      email,
      passwordHash: await hash(password, 12),
      role: 'ADMIN',
    },
  });
  console.info('Seed complete. Admin:', email);
}

async function seedSamples() {
  if ((await db.customer.count()) === 0) {
    await db.customer.createMany({ data: [
      { name: 'شرکت نوآوران پارس', phone: '02188880000', address: 'تهران' },
      { name: 'فروشگاه آریا', phone: '09120000000', address: 'اصفهان' },
      { name: 'مشتری حضوری', phone: '', address: '' },
    ] });
  }

  if ((await db.product.count()) === 0) {
    // Opening inventory must go through stock adjustments and ledger entries.
    await db.product.createMany({ data: [
      { sku: 'LAP-001', name: 'لپ‌تاپ سازمانی', unit: 'دستگاه', priceToman: 38500000n, costToman: 33500000n },
      { sku: 'MON-002', name: 'مانیتور ۲۴ اینچ', unit: 'دستگاه', priceToman: 7900000n, costToman: 6500000n },
      { sku: 'MOU-003', name: 'ماوس بی‌سیم', unit: 'عدد', priceToman: 780000n, costToman: 530000n },
    ] });
  }
}

async function main() {
  await seedAccounts();
  await db.businessSetting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'حساب‌یار', defaultTaxRate: 10 },
  });
  await seedAdmin();
  await seedSamples();
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => db.$disconnect());
