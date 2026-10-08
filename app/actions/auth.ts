'use server';

import { compare, hash } from 'bcryptjs';
import type { Role } from '@prisma/client';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { clearLoginCookie, requireRole, setLoginCookie } from '@/lib/auth';
import { executeAction } from '@/lib/action-redirect';
import { field, required } from '@/lib/forms';

const ROLES: Role[] = ['ADMIN', 'ACCOUNTANT', 'SALES'];

export async function loginAction(form: FormData) {
  const email = field(form, 'email', 200).toLowerCase();
  const password = field(form, 'password', 500);
  const user = await db.user.findUnique({ where: { email } });
  if (!user?.active || !(await compare(password, user.passwordHash))) {
    redirect('/login?error=' + encodeURIComponent('ایمیل یا رمز عبور صحیح نیست.'));
  }
  await setLoginCookie(user.id);
  redirect('/');
}

export async function logoutAction() {
  await clearLoginCookie();
  redirect('/login');
}

export async function createUserAction(form: FormData) {
  await requireRole(['ADMIN']);
  await executeAction('/users', async () => {
    const name = required(form, 'name', 120);
    const email = required(form, 'email', 200).toLowerCase();
    const password = required(form, 'password', 200);
    const role = field(form, 'role') as Role;

    if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('ایمیل نامعتبر است.');
    if (password.length < 12) throw new Error('رمز عبور حداقل ۱۲ کاراکتر باشد.');
    if (!ROLES.includes(role)) throw new Error('نقش نامعتبر است.');

    await db.user.create({
      data: { name, email, passwordHash: await hash(password, 12), role },
    });
  });
}

export async function toggleUserAction(form: FormData) {
  const actor = await requireRole(['ADMIN']);
  await executeAction('/users', async () => {
    const id = required(form, 'id');
    if (id === actor.id) throw new Error('حساب خودتان را نمی‌توانید غیرفعال کنید.');
    const target = await db.user.findUnique({ where: { id } });
    if (!target) throw new Error('کاربر پیدا نشد.');
    await db.user.update({ where: { id }, data: { active: !target.active } });
  });
}
