import test from 'node:test';
import assert from 'node:assert/strict';
import { field, required, toDate, pathError } from '../lib/forms.ts';

test('required form fields are trimmed', () => {
  const form = new FormData();
  form.set('name', '  Ali  ');
  assert.equal(required(form, 'name'), 'Ali');
});

test('form values too long are rejected, not silently truncated', () => {
  const form = new FormData();
  form.set('sku', 'x'.repeat(61));
  assert.throws(() => field(form, 'sku', 60));
});

test('dates must be real Gregorian dates', () => {
  assert.equal(toDate(''), null);
  assert.ok(toDate('2026-10-09') instanceof Date);
  assert.throws(() => toDate('2026-02-30'));
});

test('internal errors are not exposed in query strings', () => {
  assert.doesNotMatch(pathError('/customers', new Error('database password leaked')), /password/);
});
