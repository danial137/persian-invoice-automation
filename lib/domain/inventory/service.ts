import type { Prisma } from '@prisma/client';
import { ACCOUNT, postJournal } from '@/lib/ledger';

export async function adjustInventory(
  tx: Prisma.TransactionClient,
  input: { productId: string; quantity: number; direction: 'IN' | 'OUT'; userId: string },
) {
  const product = await tx.product.findUnique({ where: { id: input.productId } });
  if (!product) throw new Error('کالا پیدا نشد.');

  const delta = input.direction === 'IN' ? input.quantity : -input.quantity;
  const changed = await tx.product.updateMany({
    where: {
      id: input.productId,
      ...(delta < 0 ? { stock: { gte: input.quantity } } : {}),
    },
    data: { stock: { increment: delta } },
  });
  if (changed.count !== 1) throw new Error('موجودی کافی نیست.');

  await tx.inventoryMovement.create({
    data: { productId: input.productId, delta, reason: 'ADJUSTMENT' },
  });

  const amount = product.costToman * BigInt(input.quantity);
  if (amount === 0n) return;

  await postJournal(tx, {
    description: `تعدیل موجودی ${product.name} (${delta > 0 ? '+' : ''}${delta})`,
    source: 'STOCK',
    userId: input.userId,
    lines: delta > 0
      ? [{ code: ACCOUNT.INVENTORY, debit: amount }, { code: ACCOUNT.EQUITY, credit: amount }]
      : [{ code: ACCOUNT.LOSS, debit: amount }, { code: ACCOUNT.INVENTORY, credit: amount }],
  });
}
