/** Validation utilities for Server Actions. Never silently truncate submitted input. */
export function field(form: FormData, name: string, maxLength = 300): string {
  const raw = form.get(name);
  if (typeof raw !== 'string') return '';

  const value = raw.trim();
  if (value.length > maxLength) {
    throw new Error(`مقدار فیلد «${name}» بیش از حد طولانی است.`);
  }
  return value;
}

export function required(form: FormData, name: string, maxLength = 300): string {
  const value = field(form, name, maxLength);
  if (!value) throw new Error(`فیلد «${name}» الزامی است.`);
  return value;
}

export function toDate(value: string): Date | null {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('تاریخ نامعتبر است.');

  const date = new Date(`${value}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error('تاریخ نامعتبر است.');
  }
  return date;
}

/** Database and library errors should never leak SQL, server paths or secrets to the UI. */
export function pathError(path: string, error: unknown): string {
  const message = error instanceof Error && /[\u0600-\u06FF]/.test(error.message)
    ? error.message
    : 'عملیات انجام نشد. لطفاً اطلاعات ورودی را بررسی کنید یا با پشتیبانی تماس بگیرید.';
  const joiner = path.includes('?') ? '&' : '?';
  return `${path}${joiner}error=${encodeURIComponent(message.slice(0, 180))}`;
}
