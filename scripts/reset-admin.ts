import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

/**
 * Explicit password reset; seed never changes an existing password.
 * Run only after setting ADMIN_EMAIL and ADMIN_PASSWORD in .env.
 */
const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) {
    throw new Error('ADMIN_EMAIL و ADMIN_PASSWORD (حداقل ۱۲ کاراکتر) باید در .env موجود باشند.');
  }

  const account = await db.user.findUnique({ where: { email } });
  if (!account || account.role !== 'ADMIN') {
    throw new Error('حساب مدیر با این ایمیل پیدا نشد؛ ابتدا seed را اجرا کنید.');
  }
  await db.user.update({
    where: { id: account.id },
    data: { passwordHash: await hash(password, 12), active: true },
  });
  console.info('Admin password updated for:', email);
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => db.$disconnect());
