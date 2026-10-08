import test from 'node:test';
import assert from 'node:assert/strict';
import { csvCell, csvDocument } from '../lib/csv.ts';

test('CSV quotes embedded commas and double quotes', () => {
  assert.equal(csvCell('a,"b"'), '"a,""b"""');
});

test('CSV sanitizes spreadsheet formula-like customer names', () => {
  for (const input of ['=1+1', '+SUM(A1)', '-7+1', '@cmd', ' \t=FORMULA']) {
    assert.equal(csvCell(input), `"'${input.replaceAll('"', '""')}"`);
  }
});

test('CSV uses UTF-8 BOM and CRLF for Persian-compatible export', () => {
  const document = csvDocument(['نام'], [['مشتری']]);
  assert.ok(document.startsWith('\ufeff'));
  assert.match(document, /\r\n/);
});
