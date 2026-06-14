
import React, { useState, useEffect, useCallback } from 'react';
import { InventoryItem } from './types';
import { 
  Package, 
  Plus, 
  History, 
  LayoutDashboard, 
  Settings,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Database,
  Share2
} from 'lucide-react';
import InventoryForm from './components/InventoryForm';
import InventoryList from './components/InventoryList';
import DashboardStats from './components/DashboardStats';
import ExportSection from './components/ExportSection';

const App: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'history' | 'settings'>('add');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ninja_inventory');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved inventory", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ninja_inventory', JSON.stringify(items));
  }, [items]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleAddItem = (newItem: Omit<InventoryItem, 'id' | 'timestamp'>) => {
    const isDuplicate = items.some(
      item => item.binNo === newItem.binNo && item.itemNo === newItem.itemNo
    );

    if (isDuplicate) {
      showToast(`Warning: Item ${newItem.itemNo} in Bin ${newItem.binNo} already exists!`, 'warning');
    }

    const itemWithMeta: InventoryItem = {
      ...newItem,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    setItems(prev => [itemWithMeta, ...prev]);
    showToast('Entry added successfully');
    setActiveTab('history');
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    showToast('Entry deleted', 'error');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      setItems([]);
      showToast('All records cleared', 'error');
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Package className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              Ninja <span className="text-indigo-600">Putway</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
             <button 
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}`}
            >
              <Database className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-indigo-600" />
              Real-time Insights
            </h2>
            <DashboardStats items={items} />
          </div>
        )}

        {activeTab === 'add' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              New Entry
            </h2>
            <InventoryForm onAdd={handleAddItem} items={items} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                Audit Log
              </h2>
              {items.length > 0 && (
                <button 
                  onClick={handleClearAll}
                  className="text-xs text-red-600 font-medium hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear Data
                </button>
              )}
            </div>
            
            <InventoryList items={items} onDelete={handleDeleteItem} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              Data Management
            </h2>
            
            <ExportSection items={items} title="Bulk Export System" />

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Storage Information</h3>
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500">Current Records</span>
                   <span className="font-bold">{items.length}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500">Storage Location</span>
                   <span className="font-bold">Device LocalStorage</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500">Last Sync</span>
                   <span className="font-bold">Real-time</span>
                 </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <button 
                  onClick={handleClearAll}
                  className="w-full flex items-center justify-center gap-2 text-red-600 font-bold py-3 border border-red-100 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Reset Application Database
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {toast && (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 min-w-[300px] z-[60] animate-in slide-in-from-bottom-10 fade-in ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
          toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
          'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
          {toast.type === 'warning' && <AlertCircle className="w-5 h-5" />}
          {toast.type === 'error' && <Trash2 className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-around z-50">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Stats</span>
        </button>
        <button 
          onClick={() => setActiveTab('add')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'add' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <div className={`p-2 rounded-full -mt-10 mb-1 shadow-lg transition-transform active:scale-95 ${activeTab === 'add' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>
            <Plus className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Entry</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <History className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">List</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <Database className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Data</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
