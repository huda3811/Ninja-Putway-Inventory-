
import React from 'react';
import { InventoryItem } from '../types';
import { TrendingDown, TrendingUp, Package, Layers, FileSpreadsheet } from 'lucide-react';
import { handleExportExcel } from '../utils/excelExport';

interface DashboardStatsProps {
  items: InventoryItem[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ items }) => {
  const stats = items.reduce((acc, item) => {
    acc.totalItems += 1;
    acc.totalShort += item.short;
    acc.totalExtra += item.extra;
    acc.discrepancyCount += (item.short > 0 || item.extra > 0) ? 1 : 0;
    return acc;
  }, { totalItems: 0, totalShort: 0, totalExtra: 0, discrepancyCount: 0 });

  const accuracy = items.length === 0 ? 0 : Math.round(((items.length - stats.discrepancyCount) / items.length) * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Main Score */}
        <div className="col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
             <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-100"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={364}
                strokeDashoffset={364 - (364 * accuracy) / 100}
                className={`transition-all duration-1000 ${accuracy > 90 ? 'text-emerald-500' : accuracy > 70 ? 'text-amber-500' : 'text-red-500'}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-800">{accuracy}%</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Accuracy</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            {stats.discrepancyCount} discrepancies found across {stats.totalItems} checks.
          </p>
        </div>

        {/* Total Checks */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Package className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Scanned</span>
          </div>
          <p className="text-2xl font-black text-slate-800">{stats.totalItems}</p>
        </div>

        {/* Unique Bins */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Layers className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unique Bins</span>
          </div>
          <p className="text-2xl font-black text-slate-800">{new Set(items.map(i => i.binNo)).size}</p>
        </div>

        {/* Shorts */}
        <div className="bg-red-50 p-4 rounded-2xl border border-red-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-200 p-2 rounded-lg">
              <TrendingDown className="w-4 h-4 text-red-700" />
            </div>
            <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Total Short</span>
          </div>
          <p className="text-2xl font-black text-red-800">{stats.totalShort}</p>
        </div>

        {/* Extras */}
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-200 p-2 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Total Extra</span>
          </div>
          <p className="text-2xl font-black text-emerald-800">{stats.totalExtra}</p>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-4 space-y-2">
          <button
            onClick={() => handleExportExcel(items)}
            className="w-full flex items-center justify-center gap-2 p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <FileSpreadsheet className="w-5 h-5 animate-pulse" />
            <span>Quick Download Excel Report (.xlsx)</span>
          </button>
          <p className="text-[11px] text-slate-500 text-center">
            Separates all items, shorts, and extras into their own workbook sheets
          </p>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;
