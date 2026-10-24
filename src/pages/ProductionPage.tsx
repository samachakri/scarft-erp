import React, { useState } from 'react';
import {
  Search,
  Plus,
  Play,
  Pause,
  CheckCircle2,
  Sliders,
  Calculator,
  AlertTriangle,
  Layers,
  Settings2,
  Activity,
  X,
  Flame,
  ShieldCheck,
  Trash2,
  Sparkles,
  RefreshCw,
  Clock,
  Check,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatNumberIN, formatBundlesText } from '../services/rbac';
import { ProductionStatus, SessionShift, SessionStatus } from '../types/erp';

export interface CompoundIngredient {
  id: string;
  materialCode: string;
  materialName: string;
  quantityKg: number;
  costPerKg: number;
  percentage: number;
  siloStockKg: number;
  isCustom?: boolean;
}

export const ProductionPage: React.FC = () => {
  const {
    productionOrders,
    dies,
    extrusionSessions,
    rawMaterials,
    currentEmployee,
    selectedRecordId,
    setSelectedRecordId,
    setQuickCreateModal,
    updateProductionOrder,
    createExtrusionSession,
    updateExtrusionSessionStatus,
    calculateMRP,
    stockInRawMaterial,
    createRawMaterial,
    navigateTo,
    showToast,
  } = useERP();

  // Tab switching: 'orders' or 'sessions'
  const [activeTab, setActiveTab] = useState<'sessions' | 'orders'>('sessions');

  // Search & filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Inline work order update
  const [deltaMeters, setDeltaMeters] = useState(300);
  const [deltaScrap, setDeltaScrap] = useState(4);
  const [showQtyBox, setShowQtyBox] = useState(false);

  // Extrusion Session Creator Modal
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionDieMode, setSessionDieMode] = useState<'catalog' | 'manual'>('manual');
  const [sessionDieNumber, setSessionDieNumber] = useState<string>('DIE-S112-30T');
  const [sessionCustomDieName, setSessionCustomDieName] = useState<string>(
    '3-Track Casement Window Frame (60mm Heavy Series)'
  );
  const [sessionCustomDieNumber, setSessionCustomDieNumber] = useState<string>(
    'DIE-CS60-3TRK'
  );
  const [sessionCustomProfileCode, setSessionCustomProfileCode] = useState<string>('SCF-CS-3T-60');
  const [sessionColor, setSessionColor] = useState<string>('White (Standard UV)');
  const [sessionCustomWeight, setSessionCustomWeight] = useState<number>(2.75);
  const [sessionCustomLine, setSessionCustomLine] = useState<string>(
    'Extruder Line 02 (KraussMaffei KM-65)'
  );
  const [sessionShift, setSessionShift] = useState<SessionShift>('Morning Shift (06:00 - 14:00)');
  const [sessionBundles, setSessionBundles] = useState<number>(30); // 30 Sets
  const [sessionPiecesPerSet, setSessionPiecesPerSet] = useState<number>(6); // 6 pcs per set
  const [sessionOperator, setSessionOperator] = useState<string>(currentEmployee.name);
  const [sessionNotes, setSessionNotes] = useState<string>(
    'Vacuum calibrator at -0.65 bar. Barrel zones heated to 185°C - 205°C.'
  );

  // Dynamic Compound Formula with direct kg & cost inputs
  const [compoundMaterials, setCompoundMaterials] = useState<CompoundIngredient[]>([
    {
      id: 'mat-1',
      materialCode: 'RM-001',
      materialName: 'UPVC Resin SG-5 / K-67',
      quantityKg: 2350,
      costPerKg: 88,
      percentage: 78.5,
      siloStockKg: 5200,
    },
    {
      id: 'mat-2',
      materialCode: 'RM-002',
      materialName: 'CaCO3 Filler (Calcium Carbonate 2-Micron)',
      quantityKg: 450,
      costPerKg: 12,
      percentage: 15.0,
      siloStockKg: 9500,
    },
    {
      id: 'mat-3',
      materialCode: 'RM-003',
      materialName: 'Rutile TiO2 (Titanium Dioxide R-902)',
      quantityKg: 75,
      costPerKg: 320,
      percentage: 2.5,
      siloStockKg: 420,
    },
    {
      id: 'mat-4',
      materialCode: 'RM-004',
      materialName: 'Ca-Zn Heat Stabilizer & Lubricant Pack',
      quantityKg: 65,
      costPerKg: 210,
      percentage: 2.2,
      siloStockKg: 650,
    },
    {
      id: 'mat-5',
      materialCode: 'RM-005',
      materialName: 'CPE 135A High Impact Modifier',
      quantityKg: 55,
      costPerKg: 145,
      percentage: 1.8,
      siloStockKg: 800,
    },
  ]);

  // Adding chemical state
  const [showAddMatForm, setShowAddMatForm] = useState(false);
  const [newMatName, setNewMatName] = useState('');
  const [newMatKg, setNewMatKg] = useState<number>(40);
  const [newMatCost, setNewMatCost] = useState<number>(150);
  const [newMatSiloStock, setNewMatSiloStock] = useState<number>(500);

  // Target outputs calculation
  const targetPieces = sessionBundles * sessionPiecesPerSet;
  const targetMeters = targetPieces * 6.0;
  const effectiveDieWeight =
    sessionDieMode === 'manual'
      ? sessionCustomWeight > 0
        ? sessionCustomWeight
        : 2.75
      : dies.find((d) => d.dieNumber === sessionDieNumber)?.weightPerMeterKg || 2.75;

  const totalFormulaKg = compoundMaterials.reduce((sum, m) => sum + (Number(m.quantityKg) || 0), 0);
  const totalFormulaCost = compoundMaterials.reduce(
    (sum, m) => sum + (Number(m.quantityKg) || 0) * (Number(m.costPerKg) || 0),
    0
  );
  const avgFormulaCostPerKg = totalFormulaKg > 0 ? totalFormulaCost / totalFormulaKg : 0;

  // Selected Profile Presets
  const profilePresets = [
    {
      name: '3-Track Casement Window Frame (60mm Heavy Series)',
      code: 'SCF-CS-3T-60',
      dieNumber: 'DIE-CS60-3TRK',
      weight: 2.75,
      line: 'Extruder Line 02 (KraussMaffei KM-65)',
      piecesPerSet: 6,
    },
    {
      name: '3-Track Sliding Villa Frame (112mm Heavy Series)',
      code: 'SCF-SL-112-3T',
      dieNumber: 'DIE-S112-30T',
      weight: 2.85,
      line: 'Extruder Line 04 (Cincinnati Milacron)',
      piecesPerSet: 6,
    },
    {
      name: '2-Track Sliding Window Frame (78mm Slim Series)',
      code: 'SCF-SL-78-2T',
      dieNumber: 'DIE-S78-20T',
      weight: 1.85,
      line: 'Extruder Line 01 (KraussMaffei KM-65)',
      piecesPerSet: 6,
    },
    {
      name: 'Casement Window Sash (60mm Z-Section)',
      code: 'SCF-CS-SASH-60',
      dieNumber: 'DIE-CS60-SASH',
      weight: 1.45,
      line: 'Extruder Line 03 (Cincinnati Twin)',
      piecesPerSet: 8,
    },
  ];

  const handleApplyPreset = (preset: typeof profilePresets[0]) => {
    setSessionDieMode('manual');
    setSessionCustomDieName(preset.name);
    setSessionCustomProfileCode(preset.code);
    setSessionCustomDieNumber(preset.dieNumber);
    setSessionCustomWeight(preset.weight);
    setSessionCustomLine(preset.line);
    setSessionPiecesPerSet(preset.piecesPerSet);
  };

  // Compute live consumption and silo remaining runs for each material
  const materialsWithTelemetry = compoundMaterials.map((mat) => {
    const requiredKg = Number(mat.quantityKg) || 0;
    const liveSiloStock =
      rawMaterials.find((r) => r.code === mat.materialCode)?.availableQuantity ?? mat.siloStockKg;
    const runsSupported = requiredKg > 0 ? Math.floor(liveSiloStock / requiredKg) : 99;
    const isShortage = liveSiloStock < requiredKg;
    const sharePercent = totalFormulaKg > 0 ? Number(((requiredKg / totalFormulaKg) * 100).toFixed(1)) : 0;
    const itemCost = requiredKg * (mat.costPerKg || 0);

    return {
      ...mat,
      requiredKg,
      liveSiloStock,
      runsSupported,
      isShortage,
      sharePercent,
      itemCost,
    };
  });

  const maxSessionsSupported =
    materialsWithTelemetry.length > 0
      ? Math.min(...materialsWithTelemetry.map((m) => m.runsSupported))
      : 0;

  const bottleneckIngredient = materialsWithTelemetry.find(
    (m) => m.runsSupported === maxSessionsSupported
  );

  const handleUpdateKg = (id: string, kg: number) => {
    setCompoundMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, quantityKg: Math.max(0, kg) } : m))
    );
  };

  const handleUpdateCost = (id: string, cost: number) => {
    setCompoundMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, costPerKg: Math.max(0, cost) } : m))
    );
  };

  const handleRemoveMaterial = (id: string) => {
    if (compoundMaterials.length <= 1) {
      showToast('Formula must contain at least one raw material.', 'warning');
      return;
    }
    setCompoundMaterials((prev) => prev.filter((m) => m.id !== id));
    showToast('Ingredient removed from formula.', 'info');
  };

  const handleQuickRestockSilo = (matCode: string, qty: number = 1000) => {
    const matched = rawMaterials.find((r) => r.code === matCode);
    if (matched) {
      stockInRawMaterial(matched.id, qty, 'Emergency Silo Top-up for Extrusion Session');
      showToast(`Restocked +${qty} kg of ${matched.name} to Silo!`, 'success');
    } else {
      setCompoundMaterials((prev) =>
        prev.map((m) =>
          m.materialCode === matCode ? { ...m, siloStockKg: m.siloStockKg + qty } : m
        )
      );
      showToast(`Restocked +${qty} kg to Silo!`, 'success');
    }
  };

  const handleAddCustomChemical = () => {
    if (!newMatName.trim()) {
      showToast('Please enter chemical name.', 'warning');
      return;
    }

    const createdRm = createRawMaterial({
      name: newMatName.trim(),
      category: 'Chemical / Raw Material',
      availableQuantity: newMatSiloStock,
      minimumLevel: 100,
      unit: 'kg',
    });

    const newMat: CompoundIngredient = {
      id: `mat-${Date.now()}`,
      materialCode: createdRm.code,
      materialName: createdRm.name,
      quantityKg: Number(newMatKg) || 50,
      costPerKg: Number(newMatCost) || 120,
      percentage: 2.0,
      siloStockKg: createdRm.availableQuantity,
      isCustom: true,
    };

    setCompoundMaterials((prev) => [...prev, newMat]);
    setNewMatName('');
    setShowAddMatForm(false);
    showToast(`Added ${createdRm.name} (${newMat.quantityKg} kg) to formula!`, 'success');
  };

  const handleCreateSession = () => {
    const finalProfileName =
      sessionDieMode === 'manual'
        ? sessionCustomDieName.trim() || '3-Track Casement Window Frame'
        : dies.find((d) => d.dieNumber === sessionDieNumber)?.dieName || 'UPVC Extrusion Profile';

    const finalDieNumber =
      sessionDieMode === 'manual'
        ? sessionCustomDieNumber.trim() || 'DIE-CS60-3TRK'
        : sessionDieNumber;

    const finalProfileCode =
      sessionDieMode === 'manual'
        ? sessionCustomProfileCode.trim() || 'SCF-CS-3T-60'
        : dies.find((d) => d.dieNumber === sessionDieNumber)?.profileCode || 'SCF-PR-01';

    const calculatedMeters = effectiveDieWeight > 0 ? Math.round(totalFormulaKg / effectiveDieWeight) : 1080;
    const calculatedBundles = Math.max(1, Math.round(calculatedMeters / 36));

    createExtrusionSession({
      dieNumber: finalDieNumber,
      customDieName: finalProfileName,
      customProfileCode: finalProfileCode,
      customWeightPerMeter: effectiveDieWeight,
      customExtruderLine:
        sessionDieMode === 'manual' ? sessionCustomLine : undefined,
      shift: sessionShift,
      date: 'Today',
      targetBundles: calculatedBundles,
      piecesPerSet: 6,
      operatorName: sessionOperator,
      notes: `${sessionNotes} • Color: ${sessionColor}`,
      customFormulaMaterials: compoundMaterials.map((m) => ({
        name: m.materialName,
        quantityKg: m.quantityKg,
        costPerKg: m.costPerKg,
        percentage: Number(((m.quantityKg / (totalFormulaKg || 1)) * 100).toFixed(1)),
      })),
    });

    setShowSessionModal(false);
    showToast(`Extrusion Session scheduled for ${finalProfileName} (${sessionColor})!`, 'success');
  };

  // Filtered Production Orders
  const filteredPOs = productionOrders.filter((po) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      po.id.toLowerCase().includes(q) ||
      po.profileCode.toLowerCase().includes(q) ||
      po.profileName.toLowerCase().includes(q) ||
      (po.fabricatorName || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || po.productionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Selected session / PO record: only opened when clicked by user
  const selectedPO = selectedRecordId
    ? productionOrders.find((p) => p.id === selectedRecordId) || null
    : null;

  const selectedSession = selectedRecordId
    ? extrusionSessions.find((s) => s.id === selectedRecordId) || null
    : null;

  const poMRP = selectedPO
    ? calculateMRP(selectedPO.profileCode, selectedPO.requiredQuantity)
    : null;

  const getStatusBadge = (st: ProductionStatus) => {
    switch (st) {
      case 'In Production':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Material Pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Delayed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Paused':
        return 'bg-slate-200 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getSessionBadge = (st: SessionStatus) => {
    switch (st) {
      case 'Running':
        return 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse';
      case 'Heating Up':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Scheduled':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Paused':
        return 'bg-slate-200 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Extrusion Floor & Sessions</h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Lines 1 to 6 Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure formulas with exact kg, track remaining sessions from silo stock, and run extrusion into inventory racks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSessionModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Schedule Extrusion Session</span>
          </button>
          <button
            onClick={() => setQuickCreateModal('production')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Production Order</span>
          </button>
        </div>
      </div>

      {/* Primary Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => {
            setActiveTab('sessions');
            setSelectedRecordId(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer border-b-2 ${
            activeTab === 'sessions'
              ? 'border-red-600 text-red-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Extrusion Sessions & Formula Telemetry</span>
          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
            {extrusionSessions.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('orders');
            setSelectedRecordId(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer border-b-2 ${
            activeTab === 'orders'
              ? 'border-red-600 text-red-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Production Work Orders (PO)</span>
          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
            {productionOrders.length}
          </span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* VIEW 1: EXTRUSION SESSIONS & FORMULA TELEMETRY */}
      {/* ==================================================== */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {/* Extrusion Tooling Dies Quick Strip */}
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-slate-700" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Extrusion Dies & Tooling Health
                </h2>
              </div>
              <span className="text-[11px] text-slate-500">
                1 Session = 30 Sets • 6m Bar Length
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {dies.map((die) => {
                const remainingMeters = Math.max(0, die.ratedLifeMeters - die.totalMetersRun);
                const remainingSessions = Math.floor(remainingMeters / 1080);
                const is3Track = die.dieNumber === 'DIE-S112-30T';

                return (
                  <div
                    key={die.id}
                    className={`p-2.5 rounded-lg border text-xs transition-all ${
                      is3Track
                        ? 'border-red-300 bg-red-50/30'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900">{die.dieNumber}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          die.maintenanceStatus === 'Ready'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {die.maintenanceStatus}
                      </span>
                    </div>

                    <div className="font-semibold text-slate-800 text-[11px] mt-1 truncate" title={die.dieName}>
                      {die.dieName}
                    </div>

                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {die.extruderLine.split('(')[0]} • {die.weightPerMeterKg} kg/m
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-500">Tool Life:</span>
                      <span className="font-bold text-slate-800">{remainingSessions} Runs Left</span>
                    </div>

                    <button
                      onClick={() => {
                        setSessionDieNumber(die.dieNumber);
                        setSessionCustomDieName(die.dieName);
                        setSessionCustomProfileCode(die.profileCode);
                        setSessionCustomWeight(die.weightPerMeterKg);
                        setSessionDieMode('catalog');
                        setShowSessionModal(true);
                      }}
                      className="mt-2 w-full py-1 px-2 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Play className="w-2.5 h-2.5 text-red-600" />
                      <span>Schedule Run</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active & Scheduled Extrusion Sessions Grid (Split View on Click) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div
              className={`${
                selectedSession ? 'lg:col-span-7' : 'lg:col-span-12'
              } bg-white border border-slate-200 rounded-lg overflow-hidden transition-all duration-200`}
            >
              <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Extrusion Sessions ({extrusionSessions.length})
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Click a row to open formula & silo panel
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/60 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                      <th className="py-2.5 px-3">Session Code</th>
                      <th className="py-2.5 px-3">Profile & Die Name</th>
                      <th className="py-2.5 px-2.5">Line & Shift</th>
                      <th className="py-2.5 px-2.5 text-right">Target Output</th>
                      <th className="py-2.5 px-2.5 text-right">Compound Batch</th>
                      <th className="py-2.5 px-2.5 text-center">Silo Runs Left</th>
                      <th className="py-2.5 px-2.5">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {extrusionSessions.map((ses) => {
                      const isSelected = selectedSession?.id === ses.id;
                      const piecesPerSet = ses.piecesPerSet || 6;
                      const totalCompound =
                        ses.resinRequiredKg +
                        ses.calciumCarbonateRequiredKg +
                        ses.tio2RequiredKg +
                        ses.additivesRequiredKg;

                      return (
                        <tr
                          key={ses.id}
                          onClick={() => setSelectedRecordId(ses.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-red-50/70 border-l-3 border-l-red-600'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3 px-3">
                            <div className="font-mono font-bold text-red-600">{ses.sessionCode}</div>
                            <div className="text-[10px] text-slate-400">{ses.date}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-mono font-bold text-slate-900">{ses.profileCode}</div>
                            <div className="text-[11px] text-slate-700 font-medium truncate max-w-[200px]" title={ses.profileName}>
                              {ses.profileName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Die: {ses.dieNumber}
                            </div>
                          </td>
                          <td className="py-3 px-2.5">
                            <div className="text-slate-800 font-medium">{ses.extruderLine.split('(')[0]}</div>
                            <div className="text-[10px] text-slate-500">{ses.shift.split('(')[0]}</div>
                          </td>
                          <td className="py-3 px-2.5 text-right font-mono">
                            <div className="font-bold text-slate-900">
                              {ses.targetBundles} Sets ({piecesPerSet} pcs/set)
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {formatNumberIN(ses.targetMeters)} m ({ses.targetPieces} bars)
                            </div>
                          </td>
                          <td className="py-3 px-2.5 text-right font-mono">
                            <div className="font-bold text-slate-900">
                              {formatNumberIN(totalCompound)} kg
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Resin: {formatNumberIN(ses.resinRequiredKg)} kg
                            </div>
                          </td>
                          <td className="py-3 px-2.5 text-center font-mono">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold border ${
                                ses.remainingSessionsSupported <= 1
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {ses.remainingSessionsSupported} Runs
                            </span>
                          </td>
                          <td className="py-3 px-2.5">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${getSessionBadge(
                                ses.status
                              )}`}
                            >
                              {ses.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {ses.status === 'Running' ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateExtrusionSessionStatus(ses.id, 'Completed');
                                }}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] cursor-pointer shadow-2xs transition-colors"
                              >
                                Complete & Stock In
                              </button>
                            ) : ses.status === 'Scheduled' ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateExtrusionSessionStatus(ses.id, 'Running');
                                }}
                                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] cursor-pointer shadow-2xs transition-colors"
                              >
                                Start Extrusion
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                                <Check className="w-3 h-3" /> Stocked in Rack
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Extrusion Session Detail Panel (Right Side Panel - Only Visible When Clicked) */}
            {selectedSession && (
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between text-[11px] font-bold">
                  <span className="font-mono">{selectedSession.sessionCode}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSessionBadge(
                        selectedSession.status
                      )}`}
                    >
                      {selectedSession.status}
                    </span>
                    <button
                      onClick={() => setSelectedRecordId(null)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      ✕ Close
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-4 text-xs">
                  <div>
                    <span className="font-mono font-bold text-red-600 text-sm">
                      {selectedSession.dieNumber} • {selectedSession.profileCode}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-0.5">
                      {selectedSession.profileName}
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Line: <strong>{selectedSession.extruderLine.split('(')[0]}</strong> • Shift:{' '}
                      {selectedSession.shift.split('(')[0]} • Operator:{' '}
                      <strong>{selectedSession.operatorName}</strong>
                    </p>
                  </div>

                  {/* Output Breakdown */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3 font-mono">
                    <div>
                      <span className="text-[10px] font-sans font-bold uppercase text-slate-400">
                        Target Production
                      </span>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {selectedSession.targetBundles} Sets ({selectedSession.piecesPerSet || 6} pcs/set)
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans">
                        = {formatNumberIN(selectedSession.targetMeters)} m ({selectedSession.targetPieces} bars)
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans font-bold uppercase text-slate-400">
                        Extruded Status
                      </span>
                      <div className="font-bold text-emerald-700 text-sm mt-0.5">
                        {selectedSession.producedBundles} Sets ({selectedSession.producedMeters} m)
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans">
                        Scrap / Loss: {selectedSession.scrapMeters} m
                      </div>
                    </div>
                  </div>

                  {/* Compound Recipe Breakdown */}
                  <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-500">
                        Compound Batch Ingredients ({selectedSession.targetBundles} Sets)
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-800">
                        Total:{' '}
                        {formatNumberIN(
                          selectedSession.resinRequiredKg +
                            selectedSession.calciumCarbonateRequiredKg +
                            selectedSession.tio2RequiredKg +
                            selectedSession.additivesRequiredKg
                        )}{' '}
                        kg
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 text-[11px] font-mono">
                      <div className="py-1.5 flex items-center justify-between">
                        <span className="font-sans text-slate-700">UPVC Resin SG-5 / K-67</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {formatNumberIN(selectedSession.resinRequiredKg)} kg
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuickRestockSilo('RM-001', 1000)}
                            className="text-[10px] font-sans text-blue-600 hover:underline cursor-pointer"
                          >
                            +Top-up Silo
                          </button>
                        </div>
                      </div>
                      <div className="py-1.5 flex items-center justify-between">
                        <span className="font-sans text-slate-700">Calcium Carbonate (CaCO3)</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {formatNumberIN(selectedSession.calciumCarbonateRequiredKg)} kg
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuickRestockSilo('RM-002', 1000)}
                            className="text-[10px] font-sans text-blue-600 hover:underline cursor-pointer"
                          >
                            +Top-up Silo
                          </button>
                        </div>
                      </div>
                      <div className="py-1.5 flex items-center justify-between">
                        <span className="font-sans text-slate-700">Rutile TiO2 (Titanium Dioxide)</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {formatNumberIN(selectedSession.tio2RequiredKg)} kg
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuickRestockSilo('RM-003', 200)}
                            className="text-[10px] font-sans text-blue-600 hover:underline cursor-pointer"
                          >
                            +Top-up Silo
                          </button>
                        </div>
                      </div>
                      <div className="py-1.5 flex items-center justify-between">
                        <span className="font-sans text-slate-700">Ca-Zn Stabilizers & Additives</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {formatNumberIN(selectedSession.additivesRequiredKg)} kg
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuickRestockSilo('RM-004', 200)}
                            className="text-[10px] font-sans text-blue-600 hover:underline cursor-pointer"
                          >
                            +Top-up Silo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Silo Telemetry & Remaining Sessions */}
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
                    <div className="flex items-center justify-between text-emerald-900 font-bold text-xs">
                      <span>Remaining Sessions Supported by Silo Stock</span>
                      <span className="text-sm font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300">
                        {selectedSession.remainingSessionsSupported} Runs
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Silo compounds are automatically deducted when session completes, and finished profile sets are booked into inventory racks.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex gap-2">
                    {selectedSession.status === 'Scheduled' && (
                      <button
                        onClick={() => updateExtrusionSessionStatus(selectedSession.id, 'Running')}
                        className="flex-1 py-2 px-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer text-center text-xs transition-colors"
                      >
                        Start Extruder Line
                      </button>
                    )}
                    {selectedSession.status === 'Running' && (
                      <button
                        onClick={() => updateExtrusionSessionStatus(selectedSession.id, 'Completed')}
                        className="flex-1 py-2 px-3 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer text-center text-xs transition-colors"
                      >
                        Complete Session & Stock In Sets
                      </button>
                    )}
                    {selectedSession.status === 'Completed' && (
                      <div className="flex-1 py-2 px-3 rounded bg-slate-100 text-slate-700 text-center font-semibold text-xs">
                        ✓ Finished Sets Extruded and Stocked into Racks
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW 2: PRODUCTION WORK ORDERS (PO) */}
      {/* ==================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search PO ID, Profile Code, Fabricator..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:border-red-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 font-medium"
            >
              <option value="ALL">Status: All</option>
              <option value="In Production">In Production</option>
              <option value="Completed">Completed</option>
              <option value="Material Pending">Material Pending</option>
              <option value="Paused">Paused</option>
              <option value="Delayed">Delayed</option>
            </select>
          </div>

          {/* PO Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div
              className={`${
                selectedPO ? 'lg:col-span-7' : 'lg:col-span-12'
              } bg-white border border-slate-200 rounded-lg overflow-hidden transition-all duration-200`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                      <th className="py-2.5 px-3">Production ID</th>
                      <th className="py-2.5 px-3">Profile</th>
                      <th className="py-2.5 px-2.5 text-right">Required</th>
                      <th className="py-2.5 px-2.5 text-right">Produced</th>
                      <th className="py-2.5 px-2.5 text-right">Remaining</th>
                      <th className="py-2.5 px-2.5">Material Status</th>
                      <th className="py-2.5 px-2.5">Status</th>
                      <th className="py-2.5 px-3">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPOs.map((po) => {
                      const isSelected = selectedPO?.id === po.id;
                      const pct =
                        po.requiredQuantity > 0
                          ? Number(((po.producedQuantity / po.requiredQuantity) * 100).toFixed(1))
                          : 0;
                      return (
                        <tr
                          key={po.id}
                          onClick={() => setSelectedRecordId(po.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-red-50/70 border-l-3 border-l-red-600'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3 px-3">
                            <div className="font-mono font-bold text-red-600">{po.id}</div>
                            {po.orderId && (
                              <div className="text-[10px] font-mono text-slate-400">
                                Order: {po.orderId}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-mono font-bold text-slate-900">{po.profileCode}</div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                              {po.profileName}
                            </div>
                          </td>
                          <td className="py-3 px-2.5 text-right font-mono">
                            <div className="font-semibold text-slate-900">
                              {formatNumberIN(po.requiredQuantity)} m
                            </div>
                            <div className="text-[10px] text-slate-500 font-sans">
                              {formatBundlesText(po.requiredQuantity)}
                            </div>
                          </td>
                          <td className="py-3 px-2.5 text-right font-mono">
                            <div className="font-bold text-emerald-700">
                              {formatNumberIN(po.producedQuantity)} m
                            </div>
                            <div className="text-[10px] text-slate-500">{pct}%</div>
                          </td>
                          <td className="py-3 px-2.5 text-right font-mono text-slate-700">
                            {formatNumberIN(po.remainingQuantity)} m
                          </td>
                          <td className="py-3 px-2.5">
                            <span
                              className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                po.materialStatus.includes('Shortage')
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {po.materialStatus}
                            </span>
                          </td>
                          <td className="py-3 px-2.5">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(
                                po.productionStatus
                              )}`}
                            >
                              {po.productionStatus}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-600">{po.dueDate}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PO Detail Panel (Right Side Panel - Only Visible When Clicked) */}
            {selectedPO && (
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between text-[11px] font-bold">
                  <span>WORK ORDER • {selectedPO.id}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(
                        selectedPO.productionStatus
                      )}`}
                    >
                      {selectedPO.productionStatus}
                    </span>
                    <button
                      onClick={() => setSelectedRecordId(null)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      ✕ Close
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-red-600 text-sm">
                        {selectedPO.profileCode} ({selectedPO.color})
                      </span>
                      {selectedPO.orderId && (
                        <button
                          onClick={() => navigateTo('orders', selectedPO.orderId)}
                          className="text-[11px] font-mono font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          Order: {selectedPO.orderId}
                        </button>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-slate-900 mt-0.5">
                      {selectedPO.profileName}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Line: <strong>{selectedPO.extruderLine}</strong> • Fabricator:{' '}
                      {selectedPO.fabricatorName}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    {(() => {
                      const pct =
                        selectedPO.requiredQuantity > 0
                          ? Number(
                              ((selectedPO.producedQuantity / selectedPO.requiredQuantity) * 100).toFixed(
                                1
                              )
                            )
                          : 0;
                      return (
                        <>
                          <div className="flex items-center justify-between font-mono">
                            <span className="font-bold text-slate-800">
                              Output: {formatNumberIN(selectedPO.producedQuantity)} /{' '}
                              {formatNumberIN(selectedPO.requiredQuantity)} m
                            </span>
                            <span className="font-bold text-red-600 text-sm">{pct}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-600 transition-all"
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Floor Controls */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        onClick={() => updateProductionOrder(selectedPO.id, 'start')}
                        className="flex items-center justify-center gap-1 py-2 px-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start</span>
                      </button>
                      <button
                        onClick={() => setShowQtyBox(!showQtyBox)}
                        className="flex items-center justify-center gap-1 py-2 px-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer transition-colors"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>+ Output</span>
                      </button>
                      <button
                        onClick={() => updateProductionOrder(selectedPO.id, 'pause')}
                        className="flex items-center justify-center gap-1 py-2 px-2 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer transition-colors"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause</span>
                      </button>
                      <button
                        onClick={() => updateProductionOrder(selectedPO.id, 'complete')}
                        className="flex items-center justify-center gap-1 py-2 px-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                    </div>

                    {showQtyBox && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                        <div className="text-[11px] font-bold text-slate-700">
                          Log Extruded Meters & Rejection
                        </div>
                        <div className="flex gap-2">
                          <div>
                            <span className="text-[10px] text-slate-500">Meters Produced</span>
                            <input
                              type="number"
                              value={deltaMeters}
                              onChange={(e) => setDeltaMeters(Number(e.target.value))}
                              className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500">Scrap / Loss (m)</span>
                            <input
                              type="number"
                              value={deltaScrap}
                              onChange={(e) => setDeltaScrap(Number(e.target.value))}
                              className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => {
                                updateProductionOrder(
                                  selectedPO.id,
                                  'update_qty',
                                  deltaMeters,
                                  deltaScrap
                                );
                                setShowQtyBox(false);
                              }}
                              className="px-3 py-1 bg-red-600 text-white font-semibold rounded cursor-pointer"
                            >
                              Save Output
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MRP Summary */}
                  {poMRP && (
                    <div className="p-3 rounded border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          BOM Compound ({formatNumberIN(selectedPO.requiredQuantity)}m)
                        </span>
                        <button
                          onClick={() => navigateTo('material_requirements', selectedPO.profileCode)}
                          className="text-[11px] font-semibold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Calculator className="w-3 h-3" />
                          <span>MRP</span>
                        </button>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {poMRP.rows.map((r) => (
                          <div
                            key={r.materialCode}
                            className="py-1.5 flex items-center justify-between text-[11px]"
                          >
                            <span className="text-slate-700">{r.materialName}</span>
                            <span className="font-mono font-semibold text-slate-900">
                              {formatNumberIN(r.requiredKg)} kg
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: SCHEDULE EXTRUSION RUN SESSION */}
      {/* ==================================================== */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-600" />
                  <span>Schedule Extrusion Run Session</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select profile die or enter custom name, configure chemical ingredients in kg & cost, and check silo stock.
                </p>
              </div>
              <button
                onClick={() => setShowSessionModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Profile Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Quick Profile Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profilePresets.map((preset) => (
                  <button
                    key={preset.code}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                      sessionCustomProfileCode === preset.code
                        ? 'bg-red-50 text-red-700 border-red-300 ring-1 ring-red-300'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                    }`}
                  >
                    {preset.name.split('(')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile & Die Configuration */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Profile & Tooling Specification</span>
                <div className="flex items-center bg-white p-0.5 rounded border border-slate-200 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSessionDieMode('manual')}
                    className={`px-2 py-0.5 rounded font-semibold cursor-pointer ${
                      sessionDieMode === 'manual' ? 'bg-red-600 text-white' : 'text-slate-600'
                    }`}
                  >
                    Custom / Manual Name
                  </button>
                  <button
                    type="button"
                    onClick={() => setSessionDieMode('catalog')}
                    className={`px-2 py-0.5 rounded font-semibold cursor-pointer ${
                      sessionDieMode === 'catalog' ? 'bg-red-600 text-white' : 'text-slate-600'
                    }`}
                  >
                    Catalog Dies
                  </button>
                </div>
              </div>

              {sessionDieMode === 'manual' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Profile Name *
                    </label>
                    <input
                      type="text"
                      value={sessionCustomDieName}
                      onChange={(e) => setSessionCustomDieName(e.target.value)}
                      placeholder="e.g. 3-Track Casement Window Frame (60mm Heavy Series)"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-900 font-medium focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Profile Code
                    </label>
                    <input
                      type="text"
                      value={sessionCustomProfileCode}
                      onChange={(e) => setSessionCustomProfileCode(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Die Number
                    </label>
                    <input
                      type="text"
                      value={sessionCustomDieNumber}
                      onChange={(e) => setSessionCustomDieNumber(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Color Name (Manual Entry) *
                    </label>
                    <input
                      type="text"
                      value={sessionColor}
                      onChange={(e) => setSessionColor(e.target.value)}
                      placeholder="e.g. White, Off-White, Anthracite Grey, Walnut, Golden Oak"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Weight (kg/m)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={sessionCustomWeight}
                      onChange={(e) => setSessionCustomWeight(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Extruder Line (Manual Entry) *
                    </label>
                    <input
                      type="text"
                      value={sessionCustomLine}
                      onChange={(e) => setSessionCustomLine(e.target.value)}
                      placeholder="e.g. Extruder Line 02 (KraussMaffei KM-65) or Line 04"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 font-medium text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Select Die from Library
                    </label>
                    <select
                      value={sessionDieNumber}
                      onChange={(e) => setSessionDieNumber(e.target.value)}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded bg-white font-mono font-semibold text-slate-900"
                    >
                      {dies.map((d) => (
                        <option key={d.id} value={d.dieNumber}>
                          {d.dieNumber} • {d.dieName} ({d.weightPerMeterKg} kg/m)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Color Name (Manual Entry) *
                    </label>
                    <input
                      type="text"
                      value={sessionColor}
                      onChange={(e) => setSessionColor(e.target.value)}
                      placeholder="e.g. White, Anthracite Grey, Walnut, Golden Oak"
                      className="w-full px-2.5 py-2 border border-slate-300 rounded bg-white font-medium text-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Extruder Line (Manual Entry) *
                    </label>
                    <input
                      type="text"
                      value={sessionCustomLine}
                      onChange={(e) => setSessionCustomLine(e.target.value)}
                      placeholder="e.g. Extruder Line 02 or Line 01"
                      className="w-full px-2.5 py-2 border border-slate-300 rounded bg-white font-medium text-slate-800 text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Shift & Floor Operator Assignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block font-bold text-slate-800 mb-1">Production Shift</label>
                <select
                  value={sessionShift}
                  onChange={(e) => setSessionShift(e.target.value as SessionShift)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium"
                >
                  <option value="Morning Shift (06:00 - 14:00)">Morning (06:00 - 14:00)</option>
                  <option value="Evening Shift (14:00 - 22:00)">Evening (14:00 - 22:00)</option>
                  <option value="Night Shift (22:00 - 06:00)">Night (22:00 - 06:00)</option>
                </select>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block font-bold text-slate-800 mb-1">Floor Operator</label>
                <input
                  type="text"
                  value={sessionOperator}
                  onChange={(e) => setSessionOperator(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-xs text-slate-800 font-medium"
                />
              </div>
            </div>

            {/* Formula Chemicals Table: Manual kgs, names, cost */}
            <div className="border border-slate-200 rounded-lg p-3 space-y-2.5 bg-slate-50/20 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-200 pb-2">
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-800 text-[11px] block">
                    Compound Recipe Formulation (Exact kg & Cost)
                  </span>
                  <span className="text-[11px] font-mono font-bold text-red-600">
                    Total: {formatNumberIN(totalFormulaKg)} kg • Est. Cost: ₹{formatNumberIN(Math.round(totalFormulaCost))} (₹{avgFormulaCostPerKg.toFixed(1)}/kg)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddMatForm(!showAddMatForm)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] cursor-pointer self-start sm:self-auto transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add Chemical</span>
                </button>
              </div>

              {/* Add Chemical Drawer */}
              {showAddMatForm && (
                <div className="p-3 bg-white rounded-lg border border-slate-300 space-y-2 shadow-xs">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Add New Chemical / Ingredient to Formula</span>
                    <button
                      type="button"
                      onClick={() => setShowAddMatForm(false)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Chemical Name *
                      </label>
                      <input
                        type="text"
                        value={newMatName}
                        onChange={(e) => setNewMatName(e.target.value)}
                        placeholder="e.g. PE Wax Internal Lubricant or ACR-401"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium focus:border-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Quantity (kg) *
                      </label>
                      <input
                        type="number"
                        value={newMatKg}
                        onChange={(e) => setNewMatKg(Number(e.target.value))}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Cost (₹/kg)
                      </label>
                      <input
                        type="number"
                        value={newMatCost}
                        onChange={(e) => setNewMatCost(Number(e.target.value))}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {[
                      { name: 'CPE 135A Impact Modifier', kg: 55, cost: 145 },
                      { name: 'ACR-401 Processing Aid', kg: 35, cost: 185 },
                      { name: 'PE Wax Lubricant', kg: 25, cost: 165 },
                      { name: 'Stearic Acid Ext. Lubricant', kg: 15, cost: 130 },
                      { name: 'Optical Brightener OB-1', kg: 3, cost: 1200 },
                    ].map((pre) => (
                      <button
                        key={pre.name}
                        type="button"
                        onClick={() => {
                          setNewMatName(pre.name);
                          setNewMatKg(pre.kg);
                          setNewMatCost(pre.cost);
                        }}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-slate-200 text-[10px] font-medium cursor-pointer transition-colors"
                      >
                        + {pre.name}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddMatForm(false)}
                      className="px-3 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomChemical}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded cursor-pointer transition-colors"
                    >
                      Add to Recipe
                    </button>
                  </div>
                </div>
              )}

              {/* Chemicals List Table */}
              <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                      <th className="py-2 px-3">Chemical / Ingredient</th>
                      <th className="py-2 px-2.5 text-right w-24">Req (kg)</th>
                      <th className="py-2 px-2.5 text-right w-24">Cost (₹/kg)</th>
                      <th className="py-2 px-2.5 text-right">Total (₹)</th>
                      <th className="py-2 px-2.5 text-right">Share %</th>
                      <th className="py-2 px-2.5 text-right">Silo Stock</th>
                      <th className="py-2 px-2.5 text-center">Runs Left</th>
                      <th className="py-2 px-2 text-center w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {materialsWithTelemetry.map((mat) => (
                      <tr key={mat.id} className={mat.isShortage ? 'bg-amber-50/50' : ''}>
                        <td className="py-2 px-3 font-sans font-semibold text-slate-900">
                          {mat.materialName}
                        </td>
                        <td className="py-2 px-2.5 text-right">
                          <input
                            type="number"
                            min={0}
                            value={mat.quantityKg}
                            onChange={(e) => handleUpdateKg(mat.id, Number(e.target.value))}
                            className="w-20 px-1.5 py-0.5 border border-slate-300 rounded bg-white text-right font-mono font-bold text-slate-900 focus:border-red-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-2.5 text-right">
                          <input
                            type="number"
                            min={0}
                            value={mat.costPerKg}
                            onChange={(e) => handleUpdateCost(mat.id, Number(e.target.value))}
                            className="w-16 px-1.5 py-0.5 border border-slate-300 rounded bg-white text-right font-mono text-slate-800 focus:border-red-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-2.5 text-right font-semibold text-slate-800">
                          ₹{formatNumberIN(Math.round(mat.itemCost))}
                        </td>
                        <td className="py-2 px-2.5 text-right text-slate-600">
                          {mat.sharePercent}%
                        </td>
                        <td className="py-2 px-2.5 text-right">
                          <span className={mat.isShortage ? 'text-amber-800 font-bold' : 'text-slate-800'}>
                            {formatNumberIN(mat.liveSiloStock)} kg
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-center">
                          {mat.isShortage ? (
                            <button
                              type="button"
                              onClick={() => handleQuickRestockSilo(mat.materialCode, 1000)}
                              className="px-1.5 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-sans text-[10px] font-bold cursor-pointer"
                              title="Click to top-up 1000 kg"
                            >
                              +Restock Silo
                            </button>
                          ) : (
                            <span className="font-bold text-emerald-700">
                              {mat.runsSupported} Runs
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterial(mat.id)}
                            className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                            title="Remove chemical"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculated Silo Stock Safe Runs Banner */}
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-950 font-sans">
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Remaining Sessions Supported by Current Silo Stock:</span>
                  </div>
                  <div className="text-[11px] text-emerald-800 mt-0.5">
                    {maxSessionsSupported > 0
                      ? `Factory silo holds enough stock for ${maxSessionsSupported} safe full runs (Bottleneck: ${bottleneckIngredient?.materialName || 'UPVC Resin'}).`
                      : `Silo shortage detected. Top up raw materials before starting extruder line.`}
                  </div>
                </div>
                <span
                  className={`text-xl font-bold font-mono px-3 py-1 bg-white rounded-md border ${
                    maxSessionsSupported > 0
                      ? 'text-emerald-700 border-emerald-300'
                      : 'text-amber-700 border-amber-300'
                  }`}
                >
                  {maxSessionsSupported} Runs
                </span>
              </div>
            </div>

            {/* Operator & Calibration Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operator Name</label>
                <input
                  type="text"
                  value={sessionOperator}
                  onChange={(e) => setSessionOperator(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tooling & Process Notes</label>
                <input
                  type="text"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowSessionModal(false)}
                className="py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSession}
                className="py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Flame className="w-4 h-4" />
                <span>Confirm & Schedule Extrusion Session</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
