import 'server-only';
import { PrismaClient } from '@prisma/client';

/** One Prisma connection pool in dev, even when Next.js hot reloads modules. */
const globalPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const db = globalPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalPrisma.prisma = db;
}
