import * as XLSX from 'xlsx';
import { InventoryItem } from '../types';

export const formatDate = (ts: number) => {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(ts);
};

export const generateExcelBlob = (items: InventoryItem[]): Blob => {
  const mapItemForExcel = (item: InventoryItem) => ({
    'Date/Time': formatDate(item.timestamp),
    'Bin Number': item.binNo,
    'Item Number': item.itemNo,
    'System Qty': item.systemQty,
    'Physical Qty': item.physicalQty,
    'Difference': item.physicalQty - item.systemQty,
    'Shortage': item.short > 0 ? item.short : 0,
    'Extra': item.extra > 0 ? item.extra : 0,
    'Status': item.short > 0 ? 'SHORTAGE' : item.extra > 0 ? 'EXTRA' : 'MATCH'
  });

  const allData = items.map(mapItemForExcel);
  const shortageData = items.filter(item => item.short > 0).map(mapItemForExcel);
  const extraData = items.filter(item => item.extra > 0).map(mapItemForExcel);

  const wb = XLSX.utils.book_new();

  // Add All Records sheet
  const wsAll = XLSX.utils.json_to_sheet(allData);
  XLSX.utils.book_append_sheet(wb, wsAll, "All Records");

  // Add Shortages sheet
  const wsShortages = XLSX.utils.json_to_sheet(
    shortageData.length > 0 ? shortageData : [{ 'Status': 'No shortage items recorded' }]
  );
  XLSX.utils.book_append_sheet(wb, wsShortages, "Shortages (Short)");

  // Add Extras sheet
  const wsExtras = XLSX.utils.json_to_sheet(
    extraData.length > 0 ? extraData : [{ 'Status': 'No extra items recorded' }]
  );
  XLSX.utils.book_append_sheet(wb, wsExtras, "Extras");

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const handleExportExcel = (items: InventoryItem[]) => {
  if (!items || items.length === 0) return;
  const blob = generateExcelBlob(items);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.id = 'excel-download-anchor';
  link.href = url;
  link.download = `Ninja_Putway_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
