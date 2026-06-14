
import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Share2, Download, CheckCircle2, Loader2 } from 'lucide-react';
import { InventoryItem } from '../types';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, HeadingLevel, TextRun, BorderStyle } from 'docx';
import { formatDate, generateExcelBlob, handleExportExcel } from '../utils/excelExport';

interface ExportSectionProps {
  items: InventoryItem[];
  title?: string;
}

const ExportSection: React.FC<ExportSectionProps> = ({ items, title = "Export Data" }) => {
  const [isExporting, setIsExporting] = useState(false);

  if (items.length === 0) return null;

  const onExportExcel = () => {
    handleExportExcel(items);
  };


  const generateWordBlob = async () => {
    const tableHeader = new TableRow({
      tableHeader: true,
      children: [
        'Date', 'Bin', 'Item ID', 'Sys', 'Phy', 'Diff'
      ].map(text => new TableCell({
        shading: { fill: "4F46E5" },
        children: [new Paragraph({ 
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text, color: "FFFFFF", bold: true, size: 20 })] 
        })]
      }))
    });

    const tableRows = items.map((item, index) => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: formatDate(item.timestamp), size: 18 })] }),
        new TableCell({ children: [new Paragraph({ text: item.binNo, bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: item.itemNo, size: 18 })] }),
        new TableCell({ children: [new Paragraph({ text: item.systemQty.toString(), alignment: AlignmentType.CENTER })] }),
        new TableCell({ children: [new Paragraph({ text: item.physicalQty.toString(), alignment: AlignmentType.CENTER })] }),
        new TableCell({ 
          shading: { fill: item.short > 0 ? "FEE2E2" : item.extra > 0 ? "DCFCE7" : "FFFFFF" },
          children: [new Paragraph({ 
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ 
              text: item.short > 0 ? `-${item.short}` : item.extra > 0 ? `+${item.extra}` : "0",
              color: item.short > 0 ? "991B1B" : item.extra > 0 ? "166534" : "000000",
              bold: true
            })]
          })] 
        }),
      ],
    }));

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            text: "NINJA ONLINE SHOP",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "PUTWAY INVENTORY DISCREPANCY REPORT",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `Generated: ${formatDate(Date.now())}`, italic: true }),
            ]
          }),
          new Paragraph({ text: "" }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [tableHeader, ...tableRows],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "Summary:", bold: true, underline: {} }),
              new TextRun({ text: `\nTotal Items Checked: ${items.length}`, break: 1 }),
              new TextRun({ text: `\nTotal Shortages: ${items.reduce((a, b) => a + b.short, 0)}`, break: 1 }),
              new TextRun({ text: `\nTotal Extras: ${items.reduce((a, b) => a + b.extra, 0)}`, break: 1 }),
            ]
          })
        ],
      }],
    });

    return await Packer.toBlob(doc);
  };

  const handleExportWord = async () => {
    setIsExporting(true);
    try {
      const blob = await generateWordBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Ninja_Putway_Report_${new Date().toISOString().split('T')[0]}.docx`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareFile = async () => {
    setIsExporting(true);
    try {
      const blob = generateExcelBlob(items);
      const filename = `Ninja_Report_${new Date().getTime()}.xlsx`;
      const file = new File([blob], filename, { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Ninja Putway Inventory Report',
          text: `Please find the attached inventory report for ${items.length} items.`
        });
      } else {
        // Fallback to text sharing
        const summary = items.map(i => `${i.binNo} | ${i.itemNo} | Diff: ${i.physicalQty - i.systemQty}`).join('\n');
        await navigator.share({
          title: 'Inventory Summary',
          text: `Ninja Putway Report:\n${summary}`
        });
      }
    } catch (err) {
      console.error("Share failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Download className="w-4 h-4 text-indigo-600" />
          {title}
        </h3>
        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">
          {items.length} Records
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={onExportExcel}
          className="group flex flex-col items-center justify-center gap-2 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl hover:bg-emerald-100 transition-all text-emerald-700 active:scale-95"
        >
          <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Excel</span>
        </button>
        
        <button
          onClick={handleExportWord}
          disabled={isExporting}
          className="group flex flex-col items-center justify-center gap-2 p-4 bg-blue-50 border border-blue-100 rounded-2xl hover:bg-blue-100 transition-all text-blue-700 active:scale-95 disabled:opacity-50"
        >
          <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
            {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Word</span>
        </button>

        <button
          onClick={handleShareFile}
          disabled={isExporting}
          className="group flex flex-col items-center justify-center gap-2 p-4 bg-indigo-600 border border-transparent rounded-2xl hover:bg-indigo-700 transition-all text-white shadow-lg shadow-indigo-100 active:scale-95"
        >
          <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
            <Share2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Share</span>
        </button>
      </div>

      <div className="pt-2 space-y-1">
        <p className="text-[10px] text-slate-400 text-center italic">
          Tip: You can share the actual Excel file directly to WhatsApp or Email.
        </p>
        <p className="text-[10.5px] text-emerald-600 font-medium text-center">
          📊 Excel downloads are split into 3 sheets: All Records, Shortages, and Extras.
        </p>
      </div>
    </div>
  );
};

export default ExportSection;
