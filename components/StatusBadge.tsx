import type { InvoiceStatus } from '@prisma/client';
import { statuses } from '@/lib/format';

export default function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className={`status status-${status.toLowerCase()}`}>
      <span className="status-dot" />
      {statuses[status]}
    </span>
  );
}
