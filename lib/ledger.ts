import type { Prisma } from '@prisma/client';

export const ACCOUNT = {
  CASH: '1000',
  RECEIVABLE: '1100',
  INVENTORY: '1200',
  TAX: '2100',
  EQUITY: '3000',
  SALES: '4000',
  COGS: '5000',
  LOSS: '5100',
  EXPENSE: '5200',
} as const;

export interface JournalLineInput {
  code: string;
  debit?: bigint;
  credit?: bigint;
}

export interface JournalInput {
  description: string;
  source: string;
  invoiceId?: string;
  userId?: string;
  lines: JournalLineInput[];
}

/** Posts a balanced double-entry journal atomically within the caller's transaction. */
export async function postJournal(tx: Prisma.TransactionClient, journal: JournalInput) {
  const debit = journal.lines.reduce((total, line) => total + (line.debit ?? 0n), 0n);
  const credit = journal.lines.reduce((total, line) => total + (line.credit ?? 0n), 0n);
  if (debit <= 0n || debit !== credit) {
    throw new Error('سند حسابداری باید تراز باشد.');
  }

  const hasInvalidLine = journal.lines.some(({ debit = 0n, credit = 0n }) =>
    debit < 0n || credit < 0n || (debit > 0n && credit > 0n),
  );
  if (hasInvalidLine) throw new Error('سطر سند نامعتبر است.');

  const postedLines = journal.lines.filter((line) => (line.debit ?? 0n) + (line.credit ?? 0n) > 0n);
  const codes = [...new Set(postedLines.map((line) => line.code))];
  const accounts = await tx.account.findMany({ where: { code: { in: codes }, active: true } });
  if (accounts.length !== codes.length) {
    throw new Error('حساب‌های پایه راه‌اندازی نشده‌اند؛ ابتدا seed را اجرا کنید.');
  }
  const accountIds = new Map(accounts.map((account) => [account.code, account.id]));

  return tx.journalEntry.create({
    data: {
      description: journal.description,
      source: journal.source,
      invoiceId: journal.invoiceId,
      createdById: journal.userId,
      lines: {
        create: postedLines.map((line) => ({
          accountId: accountIds.get(line.code)!,
          debitToman: line.debit ?? 0n,
          creditToman: line.credit ?? 0n,
        })),
      },
    },
  });
}
