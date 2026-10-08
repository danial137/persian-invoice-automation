import test from 'node:test';
import assert from 'node:assert/strict';
import { totals, validQuantity, validToman } from '../lib/calculations.ts';

test('discount and tax are calculated using integer tomans', () => {
  const result = totals([
    { quantity: 2, unitPriceToman: 100_000n },
    { quantity: 1, unitPriceToman: 50_000n },
  ], 50_000n, 10);

  assert.deepEqual(result, {
    subtotal: 250_000n,
    taxable: 200_000n,
    tax: 20_000n,
    total: 220_000n,
  });
});

test('bigints prevent money precision loss', () => {
  assert.equal(totals([{ quantity: 3, unitPriceToman: 9007199254740993n }], 0n, 0).total, 27021597764222979n);
});

test('discount cannot exceed subtotal or be negative', () => {
  assert.throws(() => totals([{ quantity: 1, unitPriceToman: 200n }], 201n, 10));
  assert.throws(() => totals([{ quantity: 1, unitPriceToman: 200n }], -1n, 10));
});

test('tax uses nearest integer toman, half up', () => {
  assert.equal(totals([{ quantity: 1, unitPriceToman: 15n }], 0n, 10).tax, 2n);
});

test('reject invalid quantities, rates and line items', () => {
  assert.throws(() => totals([], 0n, 10));
  assert.throws(() => totals([{ quantity: 0, unitPriceToman: 1n }], 0n, 10));
  assert.throws(() => totals([{ quantity: 1, unitPriceToman: 1n }], 0n, 101));
  assert.throws(() => totals([{ quantity: 1, unitPriceToman: 1n }], 0n, 1.5));
});

test('validate toman and quantities', () => {
  assert.equal(validToman('100'), 100n);
  assert.equal(validToman('0', true), 0n);
  assert.throws(() => validToman('1.5'));
  assert.throws(() => validToman('0'));
  assert.equal(validQuantity('12'), 12);
  assert.throws(() => validQuantity('-1'));
  assert.throws(() => validQuantity('0'));
});
