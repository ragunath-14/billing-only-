import * as XLSX from 'xlsx';

// Downloads `rows` (array of plain objects — keys become column headers) as an
// .xlsx file. Shared by Products/Customers/Reports so every "Export Excel"
// button behaves identically.
export function exportToExcel(filename, sheetName, rows) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}
