'use server';

import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { validToman } from '@/lib/calculations';
import { executeAction } from '@/lib/action-redirect';
import { field, required } from '@/lib/forms';
import { postJournal } from '@/lib/ledger';

export async function manualJournalAction(form: FormData) {
  const user = await requireRole(['ADMIN', 'ACCOUNTANT']);
  await executeAction('/accounting', async () => {
    const debitCode = required(form, 'debitCode');
    const creditCode = required(form, 'creditCode');
    if (debitCode === creditCode) {
      throw new Error('حساب بدهکار و بستانکار باید متفاوت باشند.');
    }

    const amount = validToman(field(form, 'amountToman'));
    await db.$transaction((tx) => postJournal(tx, {
      description: required(form, 'description', 250),
      source: 'MANUAL',
      userId: user.id,
      lines: [{ code: debitCode, debit: amount }, { code: creditCode, credit: amount }],
    }));
  });
}
