'use server';

import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { required } from '@/lib/forms';
import { executeAction } from '@/lib/action-redirect';
import { parseInvoiceForm } from '@/lib/validation/invoice';
import { createInvoice, convertQuote, cancelInvoice } from '@/lib/domain/invoices/service';

const SELLERS = ['ADMIN', 'ACCOUNTANT', 'SALES'] as const;

export async function createInvoiceAction(form: FormData) {
  const user = await requireRole([...SELLERS]);
  await executeAction('/invoices/new', async () => {
    const input = parseInvoiceForm(form);
    const invoice = await db.$transaction(
      (tx) => createInvoice(tx, input, user.id),
      { maxWait: 5000, timeout: 20000 },
    );
    return `/invoices/${invoice.id}`;
  });
}

export async function convertQuoteAction(form: FormData) {
  const user = await requireRole([...SELLERS]);
  const quoteId = required(form, 'id');
  await executeAction(`/invoices/${quoteId}`, async () => {
    const invoice = await db.$transaction(
      (tx) => convertQuote(tx, quoteId, user.id),
      { timeout: 20000 },
    );
    return `/invoices/${invoice.id}`;
  });
}

export async function cancelInvoiceAction(form: FormData) {
  const user = await requireRole(['ADMIN', 'ACCOUNTANT']);
  const invoiceId = required(form, 'id');
  await executeAction(`/invoices/${invoiceId}`, async () => {
    await db.$transaction((tx) => cancelInvoice(tx, invoiceId, user.id));
  });
}
