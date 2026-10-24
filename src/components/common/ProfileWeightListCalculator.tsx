import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Plus,
  Trash2,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  FileText,
  RotateCcw,
  Sparkles,
  Layers,
  Scale,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { formatINR, formatNumberIN, formatBundlesText } from '../../services/rbac';
import { Product } from '../../types/erp';

export interface WeightListItem {
  id: string;
  profileCode: string;
  profileName: string;
  weightPerMeterKg: number;
  weightKg: number;
  lengthMeters: number;
  bundlesCount: number;
  piecesCount: number;
  ratePerMeter: number;
  totalTaxableAmount: number;
  availableStockMeters: number;
  stockStatus: 'In Stock' | 'Partial Stock' | 'Production Required';
  shortageMeters: number;
}

interface ProfileWeightListCalculatorProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export const ProfileWeightListCalculator: React.FC<ProfileWeightListCalculatorProps> = ({
  title = 'Profile Weight List & Project Requirement Calculator',
  subtitle = 'Upload a fabricator weight list spreadsheet / CSV or manually add profile weights to calculate meterage, bundles, BOM raw materials, and stock readiness.',
  compact = false,
}) => {
  const { products, fabricators, navigateTo, createQuotation, showToast } = useERP();

  const upvcProfiles = products.filter((p) => p.itemType === 'UPVC Profile');

  // Input Mode: 'manual' or 'upload'
  const [entryMode, setEntryMode] = useState<'manual' | 'upload'>('manual');

  // Manual Line Entry State
  const [selectedProfileId, setSelectedProfileId] = useState<string>(upvcProfiles[0]?.id || 'PRD-001');
  const [entryType, setEntryType] = useState<'weight' | 'meters' | 'sets'>('weight');
  const [entryValue, setEntryValue] = useState<number>(1420); // 1,420 kg
  const [selectedFabId, setSelectedFabId] = useState<string>(fabricators[0]?.id || 'FAB-2041');

  // Upload / Paste Text State
  const [pasteText, setPasteText] = useState<string>('');

  // Weight List Items
  const [items, setItems] = useState<WeightListItem[]>([
    {
      id: 'WL-1',
      profileCode: 'SCF-FR-60',
      profileName: 'Frame Profile (Casement 60mm 4-Chamber)',
      weightPerMeterKg: 1.42,
      weightKg: 2840,
      lengthMeters: 2000,
      bundlesCount: 55,
      piecesCount: 4,
      ratePerMeter: 182,
      totalTaxableAmount: 364000,
      availableStockMeters: 1450,
      stockStatus: 'Partial Stock',
      shortageMeters: 550,
    },
    {
      id: 'WL-2',
      profileCode: 'SCF-SH-60',
      profileName: 'Window Sash Profile (Casement 60mm)',
      weightPerMeterKg: 1.25,
      weightKg: 1500,
      lengthMeters: 1200,
      bundlesCount: 33,
      piecesCount: 2,
      ratePerMeter: 165,
      totalTaxableAmount: 198000,
      availableStockMeters: 1800,
      stockStatus: 'In Stock',
      shortageMeters: 0,
    },
    {
      id: 'WL-3',
      profileCode: 'SCF-SL-30T',
      profileName: 'Sliding 3-Track Villa Heavy Outer Frame (112mm)',
      weightPerMeterKg: 2.85,
      weightKg: 3078,
      lengthMeters: 1080,
      bundlesCount: 30,
      piecesCount: 0,
      ratePerMeter: 310,
      totalTaxableAmount: 334800,
      availableStockMeters: 648,
      stockStatus: 'Partial Stock',
      shortageMeters: 432,
    },
    {
      id: 'WL-4',
      profileCode: 'SCF-BD-24',
      profileName: 'Glazing Bead (Double Glaze DGU 24mm)',
      weightPerMeterKg: 0.28,
      weightKg: 336,
      lengthMeters: 1200,
      bundlesCount: 33,
      piecesCount: 2,
      ratePerMeter: 49,
      totalTaxableAmount: 58800,
      availableStockMeters: 3200,
      stockStatus: 'In Stock',
      shortageMeters: 0,
    },
  ]);

  // Helper to build a WeightListItem
  const buildItemFromInput = (
    profile: Product,
    inputMode: 'weight' | 'meters' | 'sets',
    inputValue: number
  ): WeightListItem => {
    const wtPerM = profile.weightPerMeterKg || 1.85;
    let meters = 0;
    let weight = 0;

    if (inputMode === 'weight') {
      weight = inputValue;
      meters = Math.round(inputValue / wtPerM);
    } else if (inputMode === 'meters') {
      meters = inputValue;
      weight = Math.round(inputValue * wtPerM);
    } else {
      // sets of 6 pcs (36m per set)
      meters = inputValue * 36;
      weight = Math.round(meters * wtPerM);
    }

    const bundles = Math.floor(meters / 36);
    const remainder = meters % 36;
    const pieces = Math.ceil(remainder / 6);
    const taxable = meters * profile.sellingPrice;
    const available = profile.currentStock;
    const shortage = Math.max(0, meters - available);

    let stockStatus: WeightListItem['stockStatus'] = 'In Stock';
    if (shortage > 0) {
      stockStatus = available > 0 ? 'Partial Stock' : 'Production Required';
    }

    return {
      id: `WL-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substr(2, 4)}`,
      profileCode: profile.code,
      profileName: profile.name,
      weightPerMeterKg: wtPerM,
      weightKg: weight,
      lengthMeters: meters,
      bundlesCount: bundles,
      piecesCount: pieces,
      ratePerMeter: profile.sellingPrice,
      totalTaxableAmount: taxable,
      availableStockMeters: available,
      stockStatus,
      shortageMeters: shortage,
    };
  };

  // Add line manually
  const handleAddManualLine = () => {
    const prod = upvcProfiles.find((p) => p.id === selectedProfileId) || upvcProfiles[0];
    if (!prod || entryValue <= 0) return;

    const newItem = buildItemFromInput(prod, entryType, entryValue);
    setItems((prev) => [...prev, newItem]);
    showToast(`Added ${prod.code} (${formatNumberIN(newItem.weightKg)} kg / ${formatNumberIN(newItem.lengthMeters)}m) to Weight List`, 'success');
  };

  // Preset demo projects
  const loadPreset = (presetKey: 'tower' | 'villa' | 'hospital') => {
    if (presetKey === 'tower') {
      const p1 = upvcProfiles.find((p) => p.code === 'SCF-FR-60') || upvcProfiles[0];
      const p2 = upvcProfiles.find((p) => p.code === 'SCF-SH-60') || upvcProfiles[1];
      const p3 = upvcProfiles.find((p) => p.code === 'SCF-ML-60') || upvcProfiles[0];
      const p4 = upvcProfiles.find((p) => p.code === 'SCF-BD-24') || upvcProfiles[0];
      setItems([
        buildItemFromInput(p1, 'weight', 4260), // 3,000m
        buildItemFromInput(p2, 'weight', 2500), // 2,000m
        buildItemFromInput(p3, 'weight', 1980), // 1,200m
        buildItemFromInput(p4, 'weight', 560), // 2,000m
      ]);
      showToast('Loaded Sector 65 High-Rise Tower Weight List (9,300 kg)', 'info');
    } else if (presetKey === 'villa') {
      const p1 = upvcProfiles.find((p) => p.code === 'SCF-SL-30T') || upvcProfiles[0];
      const p2 = upvcProfiles.find((p) => p.code === 'SCF-SL-DR85') || upvcProfiles[0];
      const p3 = upvcProfiles.find((p) => p.code === 'SCF-MSH-42') || upvcProfiles[0];
      setItems([
        buildItemFromInput(p1, 'weight', 3420), // 1,200m
        buildItemFromInput(p2, 'weight', 1620), // 1,000m
        buildItemFromInput(p3, 'weight', 580), // 800m
      ]);
      showToast('Loaded Luxury Villa 3-Track Weight List (5,620 kg)', 'info');
    } else {
      const p1 = upvcProfiles.find((p) => p.code === 'SCF-SL-25T') || upvcProfiles[0];
      const p2 = upvcProfiles.find((p) => p.code === 'SCF-SL-SH66') || upvcProfiles[0];
      const p3 = upvcProfiles.find((p) => p.code === 'SCF-LV-50') || upvcProfiles[0];
      setItems([
        buildItemFromInput(p1, 'weight', 4875), // 2,500m
        buildItemFromInput(p2, 'weight', 1950), // 1,500m
        buildItemFromInput(p3, 'weight', 850), // 1,000m
      ]);
      showToast('Loaded Hospital Tender Weight List (7,675 kg)', 'info');
    }
  };

  // Parse CSV or Text
  const parsePastedContent = (text: string) => {
    if (!text.trim()) return;
    const lines = text.split('\n');
    const newItems: WeightListItem[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.toLowerCase().startsWith('profile') || trimmed.toLowerCase().startsWith('code')) continue;
      const parts = trimmed.split(/[,;\t]+/).map((s) => s.trim());
      if (parts.length >= 2) {
        const code = parts[0].toUpperCase();
        const val = parseFloat(parts[1].replace(/[^0-9.]/g, ''));
        const prod = upvcProfiles.find((p) => p.code === code) || upvcProfiles.find((p) => p.code.includes(code));
        if (prod && !isNaN(val) && val > 0) {
          // If value is large (e.g. > 150), treat as weight in kg, otherwise if specified
          const isWeight = parts[2]?.toLowerCase().includes('m') ? false : true;
          newItems.push(buildItemFromInput(prod, isWeight ? 'weight' : 'meters', val));
        }
      }
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
      setPasteText('');
      showToast(`Parsed and imported ${newItems.length} profile weight entries!`, 'success');
    } else {
      showToast('No matching profile codes found. Use format: SCF-FR-60, 2840', 'warning');
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        parsePastedContent(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Remove row
  const handleRemoveRow = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Convert to Commercial Quotation
  const handleConvertToQuotation = () => {
    if (items.length === 0) return;
    const fab = fabricators.find((f) => f.id === selectedFabId) || fabricators[0];

    const quotationLines = items.map((it) => {
      const gross = it.totalTaxableAmount;
      const gstAmt = Math.round((gross * 0.18));
      return {
        id: `LINE-${it.id}`,
        productId: it.profileCode,
        profileCode: it.profileCode,
        description: it.profileName,
        quantity: it.lengthMeters,
        unit: 'meters' as const,
        rate: it.ratePerMeter,
        discountPercent: 0,
        taxableAmount: gross,
        gstPercent: 18 as const,
        gstAmount: gstAmt,
        totalAmount: gross + gstAmt,
      };
    });

    const subtotal = quotationLines.reduce((s, l) => s + l.taxableAmount, 0);
    const totalGst = quotationLines.reduce((s, l) => s + l.gstAmount, 0);
    const grandTotal = subtotal + totalGst;

    const created = createQuotation({
      fabricatorId: fab.id,
      fabricatorName: fab.name,
      dealerId: fab.dealerId,
      createdBy: 'Sales Desk (Weight List Import)',
      items: quotationLines,
      subtotal,
      discountTotal: 0,
      taxableAmount: subtotal,
      gstType: 'CGST_SGST',
      cgstAmount: Number((totalGst / 2).toFixed(2)),
      sgstAmount: Number((totalGst / 2).toFixed(2)),
      igstAmount: 0,
      transportCharges: 6500,
      roundOff: 0,
      grandTotal: grandTotal + 6500,
      validUntil: '24 Nov 2026',
      paymentTerms: '50% Advance, 50% Before Dispatch',
      deliveryTimeline: '5-7 Working Days ex-Bhiwadi',
      notes: `Generated automatically from uploaded fabricator project weight list (${formatNumberIN(totalWeightKg)} kg).`,
      status: 'Draft',
    });

    showToast(`Quotation ${created.id} created from Weight List!`, 'success');
    navigateTo('quotations', created.id);
  };

  // Summary Metrics
  const totalWeightKg = items.reduce((s, i) => s + i.weightKg, 0);
  const totalWeightMt = Number((totalWeightKg / 1000).toFixed(2));
  const totalMeters = items.reduce((s, i) => s + i.lengthMeters, 0);
  const totalSets = Math.floor(totalMeters / 36);
  const totalPieces = Math.ceil(totalMeters / 6);
  const totalTaxable = items.reduce((s, i) => s + i.totalTaxableAmount, 0);
  const totalGst = Math.round(totalTaxable * 0.18);
  const totalCommercial = totalTaxable + totalGst;

  const totalShortageMeters = items.reduce((s, i) => s + i.shortageMeters, 0);
  const totalShortageWeight = items.reduce((s, i) => s + i.shortageMeters * i.weightPerMeterKg, 0);
  const stockAvailableMeters = Math.max(0, totalMeters - totalShortageMeters);
  const stockReadinessPct = totalMeters > 0 ? Number(((stockAvailableMeters / totalMeters) * 100).toFixed(0)) : 100;

  // Selected manual profile preview
  const manualProfile = upvcProfiles.find((p) => p.id === selectedProfileId) || upvcProfiles[0];
  const manualCalculatedPreview = manualProfile
    ? buildItemFromInput(manualProfile, entryType, entryValue)
    : null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs space-y-0">
      {/* Header Banner */}
      <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-red-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider">{title}</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/30 text-red-200 border border-red-500/40">
              DUAL ENTRY: MANUAL + WEIGHT LIST UPLOAD
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">{subtitle}</p>
        </div>

        {/* Preset Sample Projects */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Load Project Sample:</span>
          <button
            onClick={() => loadPreset('tower')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 cursor-pointer"
          >
            🏢 Tower (9.3 MT)
          </button>
          <button
            onClick={() => loadPreset('villa')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 cursor-pointer"
          >
            🏡 3-Track Villa (5.6 MT)
          </button>
          <button
            onClick={() => loadPreset('hospital')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 cursor-pointer"
          >
            🏥 Tender (7.7 MT)
          </button>
        </div>
      </div>

      {/* Input Options Container */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEntryMode('manual')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                entryMode === 'manual'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Option 1: Manual Profile & Weight Entry
            </button>
            <button
              onClick={() => setEntryMode('upload')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                entryMode === 'upload'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Option 2: Upload / Paste Weight List (CSV)
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600">Assign to Fabricator:</span>
            <select
              value={selectedFabId}
              onChange={(e) => setSelectedFabId(e.target.value)}
              className="px-2.5 py-1 border border-slate-300 rounded bg-white font-medium text-slate-800"
            >
              {fabricators.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* MODE 1: MANUAL PROFILE & WEIGHT ENTRY */}
        {entryMode === 'manual' && (
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-4">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select UPVC Profile
                </label>
                <select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white font-mono font-semibold text-slate-900 text-xs"
                >
                  {upvcProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} • {p.name} ({p.weightPerMeterKg} kg/m)
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Specify Quantity By
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-md border border-slate-200 text-[11px] font-semibold text-center">
                  <button
                    onClick={() => setEntryType('weight')}
                    className={`py-1 rounded cursor-pointer ${
                      entryType === 'weight' ? 'bg-white text-red-600 shadow-2xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    Weight (kg)
                  </button>
                  <button
                    onClick={() => setEntryType('meters')}
                    className={`py-1 rounded cursor-pointer ${
                      entryType === 'meters' ? 'bg-white text-red-600 shadow-2xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    Meters (m)
                  </button>
                  <button
                    onClick={() => setEntryType('sets')}
                    className={`py-1 rounded cursor-pointer ${
                      entryType === 'sets' ? 'bg-white text-red-600 shadow-2xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    Sets of 6
                  </button>
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {entryType === 'weight'
                    ? 'Total Weight in Kilograms (kg)'
                    : entryType === 'meters'
                    ? 'Length in Meters (6m Bars)'
                    : 'Sets of 6 Pieces (1 Set = 36m)'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={entryValue}
                    onChange={(e) => setEntryValue(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono font-bold text-slate-900 text-xs"
                  />
                  <span className="font-mono text-xs font-semibold text-slate-500 whitespace-nowrap">
                    {entryType === 'weight' ? 'kg' : entryType === 'meters' ? 'm' : 'sets'}
                  </span>
                </div>
              </div>

              <div className="md:col-span-2">
                <button
                  onClick={handleAddManualLine}
                  className="w-full py-2 px-3 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Profile</span>
                </button>
              </div>
            </div>

            {/* Live Auto-Conversion Formula Preview */}
            {manualCalculatedPreview && (
              <div className="p-2.5 rounded-md bg-amber-50/60 border border-amber-200 text-xs flex flex-wrap items-center justify-between text-slate-700 font-mono">
                <div>
                  <span className="font-sans font-bold text-slate-900 mr-2">Calculated Equivalent:</span>
                  <span>{formatNumberIN(manualCalculatedPreview.weightKg)} kg</span>
                  <span className="text-slate-400 mx-1.5">⇄</span>
                  <span className="font-bold text-slate-900">{formatNumberIN(manualCalculatedPreview.lengthMeters)} meters</span>
                  <span className="text-slate-400 mx-1.5">⇄</span>
                  <span className="text-red-700 font-semibold">{manualCalculatedPreview.bundlesCount} Sets + {manualCalculatedPreview.piecesCount} pcs ({Math.ceil(manualCalculatedPreview.lengthMeters / 6)} bars of 6m)</span>
                </div>
                <div className="font-sans text-[11px] text-slate-600">
                  Rate: ₹{manualCalculatedPreview.ratePerMeter}/m • Est: <strong>{formatINR(manualCalculatedPreview.totalTaxableAmount)}</strong>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: UPLOAD / PASTE WEIGHT LIST */}
        {entryMode === 'upload' && (
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Dropzone File Upload */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors flex flex-col items-center justify-center relative cursor-pointer">
                <FileSpreadsheet className="w-8 h-8 text-red-600 mb-1" />
                <span className="font-bold text-xs text-slate-800">
                  Upload Profile Weight List File
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  Drag and drop CSV or text file exported from cutting software
                </span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {/* Paste Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700">
                    Or Paste Profile Code & Weight Values:
                  </label>
                  <span className="text-[10px] text-slate-400">Format: SCF-FR-60, 2840</span>
                </div>
                <textarea
                  rows={3}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="SCF-FR-60, 2840&#10;SCF-SH-60, 1875&#10;SCF-SL-30T, 3420&#10;SCF-BD-24, 336"
                  className="w-full p-2 border border-slate-300 rounded-md font-mono text-xs focus:outline-none focus:border-red-500"
                />
                <button
                  onClick={() => parsePastedContent(pasteText)}
                  disabled={!pasteText.trim()}
                  className="py-1 px-3 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer disabled:opacity-40"
                >
                  Parse & Import Pasted Lines
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CALCULATED WEIGHT LIST TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
              <th className="py-2.5 px-3">Profile Code & Description</th>
              <th className="py-2.5 px-2.5 text-right">Unit Wt (kg/m)</th>
              <th className="py-2.5 px-3 text-right">Total Weight</th>
              <th className="py-2.5 px-3 text-right">Length (Meters)</th>
              <th className="py-2.5 px-3 text-right">Sets of 6 pcs (36m)</th>
              <th className="py-2.5 px-2.5 text-right">Rate / Meter</th>
              <th className="py-2.5 px-3 text-right">Taxable Amount</th>
              <th className="py-2.5 px-3">Warehouse Stock Check</th>
              <th className="py-2.5 px-2.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                  No profiles in weight list. Upload a CSV or manually add profiles above.
                </td>
              </tr>
            ) : (
              items.map((it) => (
                <tr key={it.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="font-mono font-bold text-red-600 mr-2">{it.profileCode}</span>
                    <span className="font-medium text-slate-800">{it.profileName}</span>
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono text-slate-600">
                    {it.weightPerMeterKg} kg/m
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    <div className="font-bold text-slate-900">{formatNumberIN(it.weightKg)} kg</div>
                    <div className="text-[10px] text-slate-400">{(it.weightKg / 1000).toFixed(2)} MT</div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {formatNumberIN(it.lengthMeters)} m
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    <div className="font-semibold text-slate-800">{it.bundlesCount} Sets + {it.piecesCount} pcs</div>
                    <div className="text-[10px] text-slate-500 font-sans">
                      ({Math.ceil(it.lengthMeters / 6)} bars)
                    </div>
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono text-slate-700">
                    ₹{it.ratePerMeter}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {formatINR(it.totalTaxableAmount)}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                          it.stockStatus === 'In Stock'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : it.stockStatus === 'Partial Stock'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {it.stockStatus === 'In Stock' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {it.stockStatus !== 'In Stock' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        <span>{it.stockStatus}</span>
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Stock: {formatNumberIN(it.availableStockMeters)}m
                      {it.shortageMeters > 0 && (
                        <span className="text-red-600 font-semibold ml-1">
                          (Need {formatNumberIN(it.shortageMeters)}m)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-2.5 text-center">
                    <button
                      onClick={() => handleRemoveRow(it.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 cursor-pointer"
                      title="Remove row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* SUMMARY TOTALS & INSTANT ACTIONS BAR */}
      <div className="p-4 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div>
            <div className="text-[10px] font-sans font-bold uppercase text-slate-400">Total Weight</div>
            <div className="text-lg font-bold text-red-400 mt-0.5">
              {formatNumberIN(totalWeightKg)} kg
            </div>
            <div className="text-[10px] text-slate-400">({totalWeightMt} Metric Tonnes)</div>
          </div>
          <div>
            <div className="text-[10px] font-sans font-bold uppercase text-slate-400">Total Extruded Meters</div>
            <div className="text-lg font-bold text-white mt-0.5">
              {formatNumberIN(totalMeters)} m
            </div>
            <div className="text-[10px] text-slate-400 font-sans">
              {totalSets} Sets of 6 pcs ({totalPieces} bars)
            </div>
          </div>
          <div>
            <div className="text-[10px] font-sans font-bold uppercase text-slate-400">Stock Availability</div>
            <div className={`text-lg font-bold mt-0.5 ${stockReadinessPct >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {stockReadinessPct}% Ready
            </div>
            <div className="text-[10px] text-slate-400 font-sans">
              {totalShortageMeters > 0 ? `${formatNumberIN(totalShortageMeters)}m Shortage` : 'All Available'}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-sans font-bold uppercase text-slate-400">Commercial Value (Incl. GST)</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">
              {formatINR(totalCommercial)}
            </div>
            <div className="text-[10px] text-slate-400">Taxable: {formatINR(totalTaxable)}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <button
              onClick={() => setItems([])}
              className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Clear List
            </button>
          )}

          <button
            onClick={handleConvertToQuotation}
            disabled={items.length === 0}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-40"
          >
            <span>Convert Weight List to Commercial Quotation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
