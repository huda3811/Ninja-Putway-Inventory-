
import React, { useState, useEffect, useRef } from 'react';
import { Scan, Package, Database, Hash, AlertTriangle, X } from 'lucide-react';
import { InventoryItem } from '../types';
import { Html5Qrcode } from 'html5-qrcode';

interface InventoryFormProps {
  onAdd: (item: Omit<InventoryItem, 'id' | 'timestamp'>) => void;
  items: InventoryItem[];
}

const InventoryForm: React.FC<InventoryFormProps> = ({ onAdd, items }) => {
  const [binNo, setBinNo] = useState('');
  const [itemNo, setItemNo] = useState('');
  const [systemQty, setSystemQty] = useState<string>('');
  const [physicalQty, setPhysicalQty] = useState<string>('');
  const [scanningTarget, setScanningTarget] = useState<'bin' | 'item' | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "reader";

  // Auto-calculate short/extra for display
  const sys = parseInt(systemQty) || 0;
  const phy = parseInt(physicalQty) || 0;
  const shortVal = Math.max(0, sys - phy);
  const extraVal = Math.max(0, phy - sys);

  // Check for duplicates in real-time
  useEffect(() => {
    if (binNo && itemNo) {
      const exists = items.find(i => i.binNo === binNo && i.itemNo === itemNo);
      if (exists) {
        setDuplicateWarning(`Item ${itemNo} already scanned in Bin ${binNo}`);
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  }, [binNo, itemNo, items]);

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!binNo || !itemNo || systemQty === '' || physicalQty === '') return;

    onAdd({
      binNo,
      itemNo,
      systemQty: sys,
      physicalQty: phy,
      short: shortVal,
      extra: extraVal
    });

    setItemNo('');
    setSystemQty('');
    setPhysicalQty('');
  };

  const startScanner = async (target: 'bin' | 'item') => {
    if (scanningTarget) {
      await stopScanner();
    }

    setScanningTarget(target);
    
    // Brief delay to ensure the DOM element exists
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;
        
        const config = { 
          fps: 10, 
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.0
        };

        await html5QrCode.start(
          { facingMode: "environment" }, 
          config, 
          (decodedText) => {
            // Success callback
            handleScanSuccess(decodedText, target);
          },
          undefined // Error callback (silent)
        );
      } catch (err) {
        console.error("Camera error:", err);
        alert("Unable to access camera. Please check permissions.");
        setScanningTarget(null);
      }
    }, 100);
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (e) {
        console.error("Failed to stop scanner", e);
      }
    }
    setScanningTarget(null);
  };

  const handleScanSuccess = (text: string, target: 'bin' | 'item') => {
    // Vibrate phone on success
    if (navigator.vibrate) navigator.vibrate(100);
    
    if (target === 'bin') {
      setBinNo(text.toUpperCase());
    } else {
      setItemNo(text);
    }
    
    stopScanner();
  };

  const simulateScan = () => {
    const fakeData = scanningTarget === 'bin' 
      ? `B-${Math.floor(10 + Math.random() * 90)}-${Math.floor(100 + Math.random() * 900)}`
      : `NJ-${Math.floor(100000 + Math.random() * 900000)}`;
    
    handleScanSuccess(fakeData, scanningTarget!);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* Duplicate Warning */}
        {duplicateWarning && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl flex items-center gap-2 text-sm animate-pulse">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <p>{duplicateWarning}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bin No with Scanner */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-500" />
                Bin Number
              </span>
              <button
                type="button"
                onClick={() => scanningTarget === 'bin' ? stopScanner() : startScanner('bin')}
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md transition-colors ${
                  scanningTarget === 'bin' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {scanningTarget === 'bin' ? 'Cancel' : 'Scan Bin'}
              </button>
            </label>
            <div className="relative group">
              <input
                type="text"
                required
                placeholder="e.g. B-04-12"
                value={binNo}
                onChange={(e) => setBinNo(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 pr-12"
              />
              <button 
                type="button"
                onClick={() => startScanner('bin')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 p-1"
              >
                <Scan className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Items No with Scanner */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-indigo-500" />
                Item Number
              </span>
              <button
                type="button"
                onClick={() => scanningTarget === 'item' ? stopScanner() : startScanner('item')}
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md transition-colors ${
                  scanningTarget === 'item' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {scanningTarget === 'item' ? 'Cancel' : 'Scan Item'}
              </button>
            </label>
            <div className="relative group">
              <input
                type="text"
                required
                placeholder="Scan or enter code"
                value={itemNo}
                onChange={(e) => setItemNo(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all pr-12"
              />
              <button 
                type="button"
                onClick={() => startScanner('item')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 p-1"
              >
                <Scan className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Real Scanner Preview */}
        {scanningTarget && (
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-square md:aspect-video flex items-center justify-center border-4 border-indigo-600 shadow-2xl">
            {/* The html5-qrcode library will use this div */}
            <div id={scannerId} className="w-full h-full"></div>
            
            {/* Overlay UI */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
              <div className="w-64 h-48 border-2 border-indigo-400 rounded-lg relative overflow-hidden">
                <div className="absolute inset-x-0 h-0.5 bg-red-500 scanner-line shadow-[0_0_8px_rgba(239,68,68,1)]"></div>
              </div>
              <p className="text-white text-xs mt-4 font-bold uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full">
                Align {scanningTarget === 'bin' ? 'Bin Label' : 'Item Barcode'} in Frame
              </p>
            </div>

            <button 
              type="button"
              onClick={stopScanner}
              className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="absolute bottom-4 z-20 flex gap-2">
              <button 
                type="button"
                onClick={simulateScan}
                className="bg-indigo-600 text-white px-4 py-2 rounded-full font-bold text-xs shadow-xl active:scale-95 transition-transform"
              >
                Simulate Scanned Code
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">System Count</label>
            <input
              type="number"
              required
              min="0"
              placeholder="0"
              value={systemQty}
              onChange={(e) => setSystemQty(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Physical Count</label>
            <input
              type="number"
              required
              min="0"
              placeholder="0"
              value={physicalQty}
              onChange={(e) => setPhysicalQty(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Live Calculation Preview */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border transition-all ${shortVal > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
            <span className="text-[10px] uppercase font-bold tracking-widest text-red-600 block mb-1">Shortage</span>
            <span className="text-2xl font-bold text-red-700">{shortVal}</span>
          </div>
          <div className={`p-4 rounded-xl border transition-all ${extraVal > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 block mb-1">Extra</span>
            <span className="text-2xl font-bold text-emerald-700">{extraVal}</span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Package className="w-5 h-5" />
          Save Entry
        </button>
      </form>
    </div>
  );
};

export default InventoryForm;
