/**
 * Escape values for spreadsheets and guard against formula injection.
 * Leading formula markers must remain plain text when opened in Excel.
 */
export function csvCell(value: string): string {
  const safe = /^[\s\uFEFF]*[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function csvDocument(headers: string[], rows: string[][]): string {
  const encodeRow = (row: string[]) => row.map(csvCell).join(',');
  return '\ufeff' + [encodeRow(headers), ...rows.map(encodeRow)].join('\r\n');
}
