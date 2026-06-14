
import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { Copy, Trash2, Calendar, Database, Search, ArrowUpDown, FileSpreadsheet } from 'lucide-react';
import { handleExportExcel } from '../utils/excelExport';

interface InventoryListProps {
  items: InventoryItem[];
  onDelete: (id: string) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ items, onDelete }) => {
  const [search, setSearch] = useState('');


  const filteredItems = items.filter(item => 
    item.binNo.toLowerCase().includes(search.toLowerCase()) ||
    item.itemNo.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (item: InventoryItem) => {
    const text = `Bin: ${item.binNo} | Item: ${item.itemNo} | Sys: ${item.systemQty} | Phy: ${item.physicalQty} | Short: ${item.short} | Extra: ${item.extra}`;
    navigator.clipboard.writeText(text);
  };

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    }).format(ts);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Database className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium">No records found. Start scanning!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter & Export */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input 
            type="text"
            placeholder="Search Bin or Item ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        </div>
        
        <button
          onClick={() => handleExportExcel(items)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          title="Export Inventory to Excel"
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span>Export to Excel</span>
        </button>
      </div>

      <div className="grid gap-3">
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            className={`bg-white rounded-2xl border p-4 shadow-sm transition-all hover:border-indigo-300 flex flex-col gap-4 ${
              item.short > 0 ? 'border-l-4 border-l-red-500' : 
              item.extra > 0 ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-slate-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black px-2 py-0.5 bg-slate-100 text-slate-600 rounded uppercase tracking-tighter">Bin {item.binNo}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formatDate(item.timestamp)}
                  </span>
                </div>
                <h3 className="font-mono text-lg font-bold text-slate-800">{item.itemNo}</h3>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleCopy(item)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Copy Details"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onDelete(item.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-50 rounded-lg py-2">
                <span className="block text-[8px] uppercase text-slate-400 font-bold mb-0.5">Sys</span>
                <span className="font-bold text-slate-700">{item.systemQty}</span>
              </div>
              <div className="bg-slate-50 rounded-lg py-2">
                <span className="block text-[8px] uppercase text-slate-400 font-bold mb-0.5">Phy</span>
                <span className="font-bold text-slate-700">{item.physicalQty}</span>
              </div>
              <div className={`${item.short > 0 ? 'bg-red-50' : 'bg-slate-50 opacity-40'} rounded-lg py-2`}>
                <span className="block text-[8px] uppercase text-slate-400 font-bold mb-0.5">Short</span>
                <span className={`font-bold ${item.short > 0 ? 'text-red-600' : 'text-slate-700'}`}>{item.short}</span>
              </div>
              <div className={`${item.extra > 0 ? 'bg-emerald-50' : 'bg-slate-50 opacity-40'} rounded-lg py-2`}>
                <span className="block text-[8px] uppercase text-slate-400 font-bold mb-0.5">Extra</span>
                <span className={`font-bold ${item.extra > 0 ? 'text-emerald-600' : 'text-slate-700'}`}>{item.extra}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && search && (
        <div className="text-center p-8 text-slate-400">
          No matches for "{search}"
        </div>
      )}
    </div>
  );
};

export default InventoryList;
