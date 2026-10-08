'use server';

import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { executeAction } from '@/lib/action-redirect';
import { field, required } from '@/lib/forms';

export async function saveSettingsAction(form: FormData) {
  await requireRole(['ADMIN']);
  await executeAction('/settings', async () => {
    const defaultTaxRate = Number(field(form, 'defaultTaxRate'));
    if (!Number.isInteger(defaultTaxRate) || defaultTaxRate < 0 || defaultTaxRate > 100) {
      throw new Error('نرخ مالیات باید بین صفر تا صد باشد.');
    }
    const data = {
      name: required(form, 'name', 150),
      phone: field(form, 'phone', 50),
      address: field(form, 'address', 500),
      nationalId: field(form, 'nationalId', 50),
      taxId: field(form, 'taxId', 50),
      invoiceFooter: field(form, 'invoiceFooter', 500),
      defaultTaxRate,
    };
    await db.businessSetting.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });
  });
}
