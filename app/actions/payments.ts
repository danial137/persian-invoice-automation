'use server';

import type { PaymentMethod } from '@prisma/client';
import { requireRole } from '@/lib/auth';
import { validToman } from '@/lib/calculations';
import { db } from '@/lib/db';
import { field, required } from '@/lib/forms';
import { executeAction } from '@/lib/action-redirect';
import { recordPayment } from '@/lib/domain/payments/service';

const METHODS: PaymentMethod[] = ['CASH', 'CARD', 'TRANSFER', 'OTHER'];

export async function addPaymentAction(form: FormData) {
  const user = await requireRole(['ADMIN', 'ACCOUNTANT']);
  const invoiceId = required(form, 'invoiceId');

  await executeAction(`/invoices/${invoiceId}`, async () => {
    const method = field(form, 'method') as PaymentMethod;
    if (!METHODS.includes(method)) throw new Error('روش پرداخت نامعتبر است.');

    await db.$transaction((tx) => recordPayment(tx, {
      invoiceId,
      amount: validToman(field(form, 'amountToman')),
      method,
      reference: field(form, 'reference', 100) || null,
      note: field(form, 'note', 250) || null,
      userId: user.id,
    }));
  });
}
