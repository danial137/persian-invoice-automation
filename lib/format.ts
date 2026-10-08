import type { InvoiceStatus, PaymentMethod, Role } from '@prisma/client';

const moneyFormatter = new Intl.NumberFormat('fa-IR');
const dateFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  year: 'numeric', month: 'long', day: 'numeric',
});

export function numeric(value: bigint | number | string): string {
  return moneyFormatter.format(BigInt(value));
}

export function money(value: bigint | number | string): string {
  return `${numeric(value)} تومان`;
}

export function persianDate(value: Date | string | null | undefined): string {
  return value ? dateFormatter.format(new Date(value)) : '—';
}

export function dateInput(value: Date | null | undefined): string {
  return value ? value.toISOString().slice(0, 10) : '';
}

export const statuses: Record<InvoiceStatus, string> = {
  DRAFT: 'پیش‌نویس',
  ISSUED: 'صادر شده',
  PARTIAL: 'پرداخت جزئی',
  PAID: 'تسویه شده',
  CANCELLED: 'لغوشده',
};

export const roles: Record<Role, string> = {
  ADMIN: 'مدیر کل',
  ACCOUNTANT: 'حسابدار',
  SALES: 'فروشنده',
};

export const methods: Record<PaymentMethod, string> = {
  CASH: 'نقدی',
  CARD: 'کارت',
  TRANSFER: 'حواله',
  OTHER: 'سایر',
};
