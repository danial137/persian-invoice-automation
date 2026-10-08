import { db } from '@/lib/db';

export async function getDashboardData() {
  const [sales, customerCount, productCount, latest, payments] = await Promise.all([
    db.invoice.findMany({
      where: { type: 'SALE', status: { not: 'CANCELLED' } },
      select: { totalToman: true, paidToman: true, createdAt: true },
    }),
    db.customer.count(),
    db.product.count(),
    db.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { customer: true },
    }),
    db.payment.aggregate({ _sum: { amountToman: true } }),
  ]);

  const sold = sales.reduce((sum, invoice) => sum + invoice.totalToman, 0n);
  const due = sales.reduce(
    (sum, invoice) => sum + invoice.totalToman - invoice.paidToman, 0n,
  );

  const months = Array.from({ length: 6 }, (_, index) => {
    const today = new Date();
    const month = new Date(today.getFullYear(), today.getMonth() - 5 + index, 1);
    const sum = sales
      .filter(({ createdAt }) => createdAt.getFullYear() === month.getFullYear() && createdAt.getMonth() === month.getMonth())
      .reduce((total, invoice) => total + invoice.totalToman, 0n);
    return {
      label: new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'short' }).format(month),
      sum,
    };
  });

  return {
    sold,
    due,
    received: payments._sum.amountToman ?? 0n,
    customerCount,
    productCount,
    latest,
    months,
  };
}
