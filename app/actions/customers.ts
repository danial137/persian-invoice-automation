'use server';

import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { executeAction } from '@/lib/action-redirect';
import { field, required } from '@/lib/forms';

export async function saveCustomerAction(form: FormData) {
  await requireRole(['ADMIN', 'ACCOUNTANT', 'SALES']);
  await executeAction('/customers', async () => {
    const id = field(form, 'id');
    const data = {
      name: required(form, 'name', 150),
      phone: field(form, 'phone', 40) || null,
      email: field(form, 'email', 150) || null,
      address: field(form, 'address', 500) || null,
      taxId: field(form, 'taxId', 80) || null,
    };
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
      throw new Error('ایمیل معتبر نیست.');
    }

    if (id) await db.customer.update({ where: { id }, data });
    else await db.customer.create({ data });
  });
}
