
export interface InventoryItem {
  id: string;
  binNo: string;
  itemNo: string;
  systemQty: number;
  physicalQty: number;
  short: number;
  extra: number;
  timestamp: number;
}

export type SortField = 'timestamp' | 'binNo' | 'itemNo';
