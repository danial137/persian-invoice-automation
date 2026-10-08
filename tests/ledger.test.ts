import test from 'node:test';
import assert from 'node:assert/strict';
import { postJournal } from '../lib/ledger.ts';

const accounts = [
  { id: 'a', code: '1000', active: true },
  { id: 'b', code: '4000', active: true },
];

function fakeTransaction() {
  let created: any;
  const tx = {
    account: { findMany: async () => accounts },
    journalEntry: { create: async (input: unknown) => { created = input; return { id: 'journal' }; } },
  };
  return { tx: tx as any, getCreated: () => created };
}

test('a balanced journal posts only non-zero entries', async () => {
  const { tx, getCreated } = fakeTransaction();
  await postJournal(tx, {
    description: 'test', source: 'MANUAL',
    lines: [
      { code: '1000', debit: 100n },
      { code: '4000', credit: 100n },
      { code: '1000', credit: 0n },
    ],
  });
  assert.equal(getCreated().data.lines.create.length, 2);
});

test('unbalanced journals are rejected before calling the database', async () => {
  const { tx, getCreated } = fakeTransaction();
  await assert.rejects(() => postJournal(tx, {
    description: 'invalid', source: 'MANUAL',
    lines: [{ code: '1000', debit: 10n }, { code: '4000', credit: 9n }],
  }));
  assert.equal(getCreated(), undefined);
});

test('negative and mixed debit/credit lines are rejected', async () => {
  const { tx } = fakeTransaction();
  await assert.rejects(() => postJournal(tx, {
    description: 'invalid', source: 'MANUAL',
    lines: [{ code: '1000', debit: 2n, credit: 1n }, { code: '4000', credit: 1n }],
  }));
});
