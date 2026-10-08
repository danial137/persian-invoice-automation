import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import type { Role } from '@prisma/client';
import { db } from '@/lib/db';

const COOKIE_NAME = 'invoice_session';
const SESSION_LIFETIME_SECONDS = 7 * 24 * 60 * 60;

type ActiveUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

function sessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET ?? '';
  if (secret.length < 32) {
    throw new Error('SESSION_SECRET باید حداقل ۳۲ کاراکتر باشد.');
  }
  return new TextEncoder().encode(secret);
}

export async function setLoginCookie(userId: string): Promise<void> {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_LIFETIME_SECONDS}s`)
    .sign(sessionSecret());

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_LIFETIME_SECONDS,
  });
}

export async function clearLoginCookie(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

export async function currentUser(): Promise<ActiveUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, sessionSecret(), { algorithms: ['HS256'] });
    if (!payload.sub) return null;
    return await db.user.findFirst({
      where: { id: payload.sub, active: true },
      select: { id: true, name: true, email: true, role: true },
    });
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<ActiveUser> {
  const user = await currentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireRole(allowed: Role[]): Promise<ActiveUser> {
  const user = await requireUser();
  if (!allowed.includes(user.role)) {
    throw new Error('شما به این عملیات دسترسی ندارید.');
  }
  return user;
}
