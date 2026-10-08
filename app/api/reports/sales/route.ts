import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { csvDocument } from '@/lib/csv';

export const dynamic = 'force-dynamic';

export async function GET() {
  await requireUser();

  const invoices = await db.invoice.findMany({
    where: { type: 'SALE' },
    include: { customer: true },
    orderBy: { issuedAt: 'desc' },
  });
  const headers = [
    'شماره', 'مشتری', 'تاریخ میلادی', 'وضعیت',
    'جمع کل (تومان)', 'پرداخت (تومان)', 'مانده (تومان)', 'مالیات (تومان)',
  ];
  const rows = invoices.map((invoice) => [
    invoice.number,
    invoice.customer.name,
    invoice.issuedAt.toISOString().slice(0, 10),
    invoice.status,
    invoice.totalToman.toString(),
    invoice.paidToman.toString(),
    (invoice.totalToman - invoice.paidToman).toString(),
    invoice.taxToman.toString(),
  ]);

  return new NextResponse(csvDocument(headers, rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sales-report.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
