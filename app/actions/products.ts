'use server';

import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { field, required } from '@/lib/forms';
import { validQuantity, validToman } from '@/lib/calculations';
import { executeAction } from '@/lib/action-redirect';
import { adjustInventory } from '@/lib/domain/inventory/service';

export async function saveProductAction(form: FormData) {
  await requireRole(['ADMIN', 'ACCOUNTANT']);
  await executeAction('/products', async () => {
    const id = field(form, 'id');
    const data = {
      sku: required(form, 'sku', 60),
      name: required(form, 'name', 180),
      unit: required(form, 'unit', 30),
      priceToman: validToman(field(form, 'priceToman')),
      costToman: validToman(field(form, 'costToman'), true),
    };

    if (id) await db.product.update({ where: { id }, data });
    else await db.product.create({ data });
  });
}

export async function adjustStockAction(form: FormData) {
  const user = await requireRole(['ADMIN', 'ACCOUNTANT']);
  await executeAction('/inventory', async () => {
    const direction = field(form, 'direction');
    if (direction !== 'IN' && direction !== 'OUT') {
      throw new Error('نوع تعدیل نامعتبر است.');
    }
    await db.$transaction((tx) => adjustInventory(tx, {
      productId: required(form, 'productId'),
      direction,
      quantity: validQuantity(field(form, 'quantity')),
      userId: user.id,
    }));
  });
}
