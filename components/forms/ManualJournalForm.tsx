import type { Account } from '@prisma/client';
import { manualJournalAction } from '@/app/actions/accounting';
import SubmitButton from '@/components/ui/SubmitButton';

export default function ManualJournalForm({ accounts }: { accounts: Account[] }) {
  return (
    <form action={manualJournalAction} className="form-grid">
      <label className="col-span">شرح سند *<input name="description" required /></label>
      <label>حساب بدهکار
        <select name="debitCode" required>
          {accounts.map((a) => <option key={a.id} value={a.code}>{a.code} · {a.name}</option>)}
        </select>
      </label>
      <label>حساب بستانکار
        <select name="creditCode" required defaultValue={accounts.find((account) => account.code !== accounts[0]?.code)?.code ?? ''}>
          {accounts.map((a) => <option key={a.id} value={a.code}>{a.code} · {a.name}</option>)}
        </select>
      </label>
      <label>مبلغ (تومان)<input type="number" name="amountToman" min="1" step="1" required /></label>
      <div className="form-actions"><SubmitButton label="ثبت سند دوبل" /></div>
    </form>
  );
}
