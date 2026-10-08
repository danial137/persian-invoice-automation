'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton({ label, className = 'btn btn-primary' }: {
  label: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return <button type="submit" className={className} disabled={pending} aria-busy={pending}>
    {pending ? 'در حال ثبت...' : label}
  </button>;
}
