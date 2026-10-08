'use client';

import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button type="button" className="btn btn-outline" onClick={() => window.print()}>
      <Printer size={17} /> چاپ فاکتور
    </button>
  );
}
