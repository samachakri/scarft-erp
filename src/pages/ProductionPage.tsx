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
  Boxes,
  Flame,
  ArrowRight,
  ShieldCheck,
  Trash2,
  Sparkles,
  PlusCircle,
  Edit3,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatNumberIN, formatBundlesText } from '../services/rbac';
import { ExtrusionDie, ExtrusionSession, ProductionStatus, SessionShift, SessionStatus } from '../types/erp';

interface CompoundIngredient {
  id: string;
  materialCode: string;
  materialName: string;
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
  const [activeTab, setActiveTab] = useState<'orders' | 'sessions'>('sessions');

  // Search & filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Inline work order update
  const [deltaMeters, setDeltaMeters] = useState(250);
  const [deltaScrap, setDeltaScrap] = useState(4);
  const [showQtyBox, setShowQtyBox] = useState(false);

  // Extrusion Session Creator Modal / Drawer
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionDieMode, setSessionDieMode] = useState<'catalog' | 'manual'>('catalog');
  const [sessionDieNumber, setSessionDieNumber] = useState<string>('DIE-S112-30T');
  const [sessionCustomDieName, setSessionCustomDieName] = useState<string>(
    '3-Track Sliding Villa Frame Die (112mm Heavy)'
  );
  const [sessionCustomDieNumber, setSessionCustomDieNumber] = useState<string>(
    'DIE-S112-30T-CUSTOM'
  );
  const [sessionCustomProfileCode, setSessionCustomProfileCode] = useState<string>('SCF-SL-112');
  const [sessionCustomWeight, setSessionCustomWeight] = useState<number>(2.85);
  const [sessionCustomLine, setSessionCustomLine] = useState<string>(
    'Extruder Line 04 (Cincinnati Milacron)'
  );
  const [sessionShift, setSessionShift] = useState<SessionShift>('Morning Shift (06:00 - 14:00)');
  const [sessionBundles, setSessionBundles] = useState<number>(30); // 30 Sets of 6 pcs = 180 bars = 1,080m
  const [sessionOperator, setSessionOperator] = useState<string>(currentEmployee.name);
  const [sessionNotes, setSessionNotes] = useState<string>(
    'Pre-heating calibrating to 190°C. Inline puller vacuum at -0.65 bar.'
  );

  // Dynamic Compound Raw Materials
  const [compoundMaterials, setCompoundMaterials] = useState<CompoundIngredient[]>([
    {
      id: 'mat-1',
      materialCode: 'RM-001',
      materialName: 'UPVC Resin SG-5 / K-67',
      percentage: 78.0,
      siloStockKg: 1200,
    },
    {
      id: 'mat-2',
      materialCode: 'RM-002',
      materialName: 'CaCO3 Filler (Calcium Carbonate)',
      percentage: 15.0,
      siloStockKg: 4800,
    },
    {
      id: 'mat-3',
      materialCode: 'RM-003',
      materialName: 'Rutile TiO2 (Titanium Dioxide)',
      percentage: 2.2,
      siloStockKg: 32,
    },
    {
      id: 'mat-4',
      materialCode: 'RM-004',
      materialName: 'Ca-Zn Heat Stabilizer & Lubricant',
      percentage: 1.8,
      siloStockKg: 420,
    },
  ]);

  // Adding raw material state
  const [showAddMatForm, setShowAddMatForm] = useState(false);
  const [selectedAddMatId, setSelectedAddMatId] = useState('RM-005');
  const [customAddMatName, setCustomAddMatName] = useState('');
  const [customAddMatPercent, setCustomAddMatPercent] = useState<number>(2.5);

  // Selected Die in Creator
  const selectedDie = dies.find((d) => d.dieNumber === sessionDieNumber) || dies[0];
  const targetMeters = sessionBundles * 36;
  const targetPieces = sessionBundles * 6;
  const effectiveDieWeight =
    sessionDieMode === 'manual'
      ? sessionCustomWeight > 0
        ? sessionCustomWeight
        : 2.85
      : selectedDie?.weightPerMeterKg || 2.85;

  const totalCompoundKg = targetMeters * effectiveDieWeight;

  // Compute live consumption and silo runs for each material
  const materialsWithTelemetry = compoundMaterials.map((mat) => {
    const requiredKg = Math.round((totalCompoundKg * mat.percentage) / 100);
    const liveSiloStock =
      rawMaterials.find((r) => r.code === mat.materialCode)?.availableQuantity ??
      mat.siloStockKg;
    const runsSupported = requiredKg > 0 ? Math.floor(liveSiloStock / requiredKg) : 99;
    const isShortage = liveSiloStock < requiredKg;
    return {
      ...mat,
      requiredKg,
      liveSiloStock,
      runsSupported,
      isShortage,
    };
  });

  const maxSessionsSupported =
    materialsWithTelemetry.length > 0
      ? Math.min(...materialsWithTelemetry.map((m) => m.runsSupported))
      : 0;

  const handleQuickRestockSilo = (matCode: string, qty: number = 500) => {
    const matched = rawMaterials.find((r) => r.code === matCode);
    if (matched) {
      stockInRawMaterial(matched.id, qty, 'Emergency Silo Top-up for Extrusion Session');
      showToast(`Restocked ${qty} kg of ${matched.name} to Silo!`, 'success');
    } else {
      setCompoundMaterials((prev) =>
        prev.map((m) =>
          m.materialCode === matCode ? { ...m, siloStockKg: m.siloStockKg + qty } : m
        )
      );
      showToast(`Restocked ${qty} kg to Silo!`, 'success');
    }
  };

  const handleAddRawMaterial = () => {
    if (selectedAddMatId === 'CUSTOM' || !selectedAddMatId) {
      if (!customAddMatName.trim()) {
        showToast('Please enter a raw material name', 'warning');
        return;
      }
      // Register custom chemical in global raw materials registry so it persists and is selectable next time!
      const createdRm = createRawMaterial({
        name: customAddMatName.trim(),
        category: 'Stabilizer & Additive',
        availableQuantity: 600,
        minimumLevel: 150,
        unit: 'kg',
      });
      const newMat: CompoundIngredient = {
        id: `mat-${Date.now()}`,
        materialCode: createdRm.code,
        materialName: createdRm.name,
        percentage: Number(customAddMatPercent) || 1.0,
        siloStockKg: createdRm.availableQuantity,
        isCustom: true,
      };
      setCompoundMaterials((prev) => [...prev, newMat]);
      setCustomAddMatName('');
      setShowAddMatForm(false);
      showToast(`Registered & added ${createdRm.name} (${newMat.percentage}%) to formula!`, 'success');
    } else {
      const rm = rawMaterials.find((r) => r.id === selectedAddMatId || r.code === selectedAddMatId);
      if (!rm) {
        showToast('Selected material not found', 'warning');
        return;
      }
      if (compoundMaterials.some((m) => m.materialCode === rm.code)) {
        showToast(`${rm.name} is already in compound formula`, 'warning');
        return;
      }
      const newMat: CompoundIngredient = {
        id: `mat-${Date.now()}`,
        materialCode: rm.code,
        materialName: rm.name,
        percentage: Number(customAddMatPercent) || 2.0,
        siloStockKg: rm.availableQuantity,
      };
      setCompoundMaterials((prev) => [...prev, newMat]);
      setShowAddMatForm(false);
      showToast(`Added ${rm.name} (${newMat.percentage}%) to formula!`, 'success');
    }
  };

  const handleRemoveRawMaterial = (id: string) => {
    setCompoundMaterials((prev) => prev.filter((m) => m.id !== id));
    showToast('Raw material removed from compound formula', 'info');
  };

  const handleUpdatePercentage = (id: string, newPct: number) => {
    setCompoundMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, percentage: Math.max(0.1, newPct) } : m))
    );
  };

  const handleCreateSession = () => {
    createExtrusionSession({
      dieNumber:
        sessionDieMode === 'manual'
          ? sessionCustomDieNumber || 'DIE-CUST-3T'
          : sessionDieNumber,
      customDieName: sessionDieMode === 'manual' ? sessionCustomDieName : undefined,
      customProfileCode:
        sessionDieMode === 'manual' ? sessionCustomProfileCode : undefined,
      customWeightPerMeter:
        sessionDieMode === 'manual' ? sessionCustomWeight : undefined,
      customExtruderLine:
        sessionDieMode === 'manual' ? sessionCustomLine : undefined,
      shift: sessionShift,
      date: '03 Oct 2026',
      targetBundles: sessionBundles,
      operatorName: sessionOperator,
      notes: sessionNotes,
    });
    setShowSessionModal(false);
    showToast(
      `Extrusion Session scheduled for ${
        sessionDieMode === 'manual' ? sessionCustomDieName : selectedDie.dieName
      }!`,
      'success'
    );
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

  // Selected record: only set when clicked by the user
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
            <h1 className="text-lg font-bold text-slate-900">
              Extrusion Operations & Production Floor
            </h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              LINES 1 TO 6 LIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Extrusion session scheduling, die tooling telemetry, dry blend BOM formulas, and automatic remaining sessions calculation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSessionDieNumber('DIE-S112-30T'); // Default to 3-track die
              setShowSessionModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer shadow-xs"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Schedule Extrusion Session (3-Track / Die)</span>
          </button>
          <button
            onClick={() => setQuickCreateModal('production')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
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
          <span>Extrusion Sessions & Die Scheduler</span>
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
      {/* VIEW 1: EXTRUSION SESSIONS & DIE SCHEDULER */}
      {/* ==================================================== */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {/* Quick Die Library & Readiness Banner */}
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-slate-700" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Extrusion Tooling Library & Remaining Die Life
                </h2>
              </div>
              <span className="text-[11px] text-slate-500">
                1 Session = 30 Sets of 6 pcs = 180 bars = 1,080 meters
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {dies.map((die) => {
                const remainingMeters = Math.max(0, die.ratedLifeMeters - die.totalMetersRun);
                const remainingSessions = Math.floor(remainingMeters / 1080);
                const lifeUsedPct = Number(((die.totalMetersRun / die.ratedLifeMeters) * 100).toFixed(0));
                const is3Track = die.dieNumber === 'DIE-S112-30T';

                return (
                  <div
                    key={die.id}
                    className={`p-3 rounded-lg border text-xs transition-all ${
                      is3Track
                        ? 'border-red-400 bg-red-50/40 shadow-xs'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900">{die.dieNumber}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          die.maintenanceStatus === 'Ready'
                            ? 'bg-emerald-100 text-emerald-800'
                            : die.maintenanceStatus === 'In Tooling'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
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

                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>Life: {lifeUsedPct}%</span>
                        <span className="font-bold text-slate-800">{remainingSessions} Sessions Left</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${lifeUsedPct > 80 ? 'bg-amber-500' : 'bg-emerald-600'}`}
                          style={{ width: `${Math.min(100, lifeUsedPct)}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSessionDieNumber(die.dieNumber);
                        setShowSessionModal(true);
                      }}
                      className="mt-2.5 w-full py-1 px-2 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Play className="w-2.5 h-2.5 text-red-600" />
                      <span>Schedule Session</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active & Scheduled Extrusion Sessions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className={`${selectedSession ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white border border-slate-200 rounded-lg overflow-hidden transition-all duration-200`}>
              <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Scheduled & Running Extrusion Sessions ({extrusionSessions.length})
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Click any session row to inspect live formulation & status
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                      <th className="py-2.5 px-3">Session Code</th>
                      <th className="py-2.5 px-3">Die & Profile</th>
                      <th className="py-2.5 px-2.5">Line & Shift</th>
                      <th className="py-2.5 px-2.5 text-right">Target Output</th>
                      <th className="py-2.5 px-2.5 text-right">Raw Material Compound</th>
                      <th className="py-2.5 px-2.5 text-center">Remaining Sessions</th>
                      <th className="py-2.5 px-2.5">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {extrusionSessions.map((ses) => {
                      const isSelected = selectedSession?.id === ses.id;
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
                            <div className="font-mono font-bold text-slate-900">{ses.dieNumber}</div>
                            <div className="text-[11px] text-slate-600 font-medium truncate max-w-[180px]">
                              {ses.profileCode} • {ses.profileName}
                            </div>
                          </td>
                          <td className="py-3 px-2.5">
                            <div className="text-slate-800 font-medium">{ses.extruderLine.split('(')[0]}</div>
                            <div className="text-[10px] text-slate-500">{ses.shift.split('(')[0]}</div>
                          </td>
                          <td className="py-3 px-2.5 text-right font-mono">
                            <div className="font-bold text-slate-900">{ses.targetBundles} Sets of 6</div>
                            <div className="text-[10px] text-slate-500">
                              {formatNumberIN(ses.targetMeters)} m ({ses.targetPieces} bars)
                            </div>
                          </td>
                          <td className="py-3 px-2.5 text-right font-mono">
                            <div className="font-semibold text-slate-800">
                              {formatNumberIN(ses.resinRequiredKg + ses.calciumCarbonateRequiredKg + ses.tio2RequiredKg + ses.additivesRequiredKg)} kg
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Resin: {ses.resinRequiredKg}kg | CaCO3: {ses.calciumCarbonateRequiredKg}kg
                            </div>
                          </td>
                          <td className="py-3 px-2.5 text-center font-mono">
                            <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              {ses.remainingSessionsSupported} Sessions
                            </span>
                          </td>
                          <td className="py-3 px-2.5">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${getSessionBadge(ses.status)}`}>
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
                                className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] cursor-pointer"
                              >
                                Complete & Stock In
                              </button>
                            ) : ses.status === 'Scheduled' ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateExtrusionSessionStatus(ses.id, 'Running');
                                }}
                                className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] cursor-pointer"
                              >
                                Start Extrusion
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400">Stocked In</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Extrusion Session Detail Panel (5 cols) */}
            {selectedSession && (
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between text-[11px] font-bold">
                  <span>SESSION • {selectedSession.sessionCode}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSessionBadge(selectedSession.status)}`}>
                      {selectedSession.status}
                    </span>
                    <button
                      onClick={() => setSelectedRecordId(null)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
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
                      Extruder: <strong>{selectedSession.extruderLine}</strong> • Shift:{' '}
                      {selectedSession.shift} • Operator: <strong>{selectedSession.operatorName}</strong>
                    </p>
                  </div>

                  {/* Batch & Output Status */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3 font-mono">
                    <div>
                      <span className="text-[10px] font-sans font-bold uppercase text-slate-400">Target Output</span>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {selectedSession.targetBundles} Sets of 6 pcs
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans">
                        = {formatNumberIN(selectedSession.targetMeters)} meters ({selectedSession.targetPieces} bars)
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans font-bold uppercase text-slate-400">Current Output</span>
                      <div className="font-bold text-emerald-700 text-sm mt-0.5">
                        {selectedSession.producedBundles} Sets ({selectedSession.producedMeters}m)
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans">
                        Scrap: {selectedSession.scrapMeters}m
                      </div>
                    </div>
                  </div>

                  {/* Dry Blend Compound Formulation Requirement */}
                  <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-500">
                        DRY BLEND COMPOUND FOR THIS SESSION ({selectedSession.targetBundles} SETS)
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-700">
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
                      <div className="py-1.5 flex justify-between">
                        <span className="font-sans text-slate-700">1. UPVC Resin (SG-5 K67)</span>
                        <span className="font-bold text-slate-900">{formatNumberIN(selectedSession.resinRequiredKg)} kg</span>
                      </div>
                      <div className="py-1.5 flex justify-between">
                        <span className="font-sans text-slate-700">2. Calcium Carbonate (2 Micron Coated)</span>
                        <span className="font-bold text-slate-900">{formatNumberIN(selectedSession.calciumCarbonateRequiredKg)} kg</span>
                      </div>
                      <div className="py-1.5 flex justify-between">
                        <span className="font-sans text-slate-700">3. Titanium Dioxide (Rutile TiO2 R-902)</span>
                        <span className="font-bold text-slate-900">{formatNumberIN(selectedSession.tio2RequiredKg)} kg</span>
                      </div>
                      <div className="py-1.5 flex justify-between">
                        <span className="font-sans text-slate-700">4. Ca-Zn Stabilizer & Impact Modifiers</span>
                        <span className="font-bold text-slate-900">{formatNumberIN(selectedSession.additivesRequiredKg)} kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Silo Capacity & Remaining Sessions Analysis */}
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1.5">
                    <div className="flex items-center justify-between text-amber-900 font-bold text-xs">
                      <span>Remaining Sessions Supported by Silo Stock</span>
                      <span className="text-base font-mono">{selectedSession.remainingSessionsSupported} Sessions</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Based on current silo stock: UPVC Resin supports{' '}
                      <strong>
                        {Number(
                          (
                            (rawMaterials.find((r) => r.code === 'RM-001')?.availableQuantity ||
                              1200) / Math.max(1, selectedSession.resinRequiredKg)
                          ).toFixed(1)
                        )}{' '}
                        sessions
                      </strong>
                      , Calcium Carbonate supports{' '}
                      <strong>
                        {Number(
                          (
                            (rawMaterials.find((r) => r.code === 'RM-002')?.availableQuantity ||
                              4800) / Math.max(1, selectedSession.calciumCarbonateRequiredKg)
                          ).toFixed(1)
                        )}{' '}
                        sessions
                      </strong>
                      , and Rutile TiO2 supports{' '}
                      <strong>
                        {Number(
                          (
                            (rawMaterials.find((r) => r.code === 'RM-003')?.availableQuantity || 32) /
                            Math.max(1, selectedSession.tio2RequiredKg)
                          ).toFixed(1)
                        )}{' '}
                        sessions
                      </strong>
                      . Minimum bottleneck determines remaining runs before compounding reorder.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex gap-2">
                    {selectedSession.status !== 'Completed' ? (
                      <button
                        onClick={() => updateExtrusionSessionStatus(selectedSession.id, 'Completed')}
                        className="flex-1 py-2 px-3 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer text-center"
                      >
                        Mark Session Complete & Auto-Stock Sets
                      </button>
                    ) : (
                      <div className="flex-1 py-2 px-3 rounded bg-slate-100 text-slate-700 text-center font-semibold">
                        ✓ Profiles Extruded and Added to Inventory Racks
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
          {/* Search & Status Filters */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search PO-2026-..., Profile Code, Fabricator..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:border-red-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
            >
              <option value="ALL">Status: All</option>
              <option value="In Production">In Production</option>
              <option value="Completed">Completed</option>
              <option value="Material Pending">Material Pending</option>
              <option value="Paused">Paused</option>
              <option value="Delayed">Delayed</option>
            </select>
          </div>

          {/* Split View: Production Table (Full width or 7 cols when selected) + Production Floor Detail Panel (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className={`${selectedPO ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white border border-slate-200 rounded-lg overflow-hidden transition-all duration-200`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                      <th className="py-2.5 px-3">Production ID</th>
                      <th className="py-2.5 px-3">Profile</th>
                      <th className="py-2.5 px-2.5 text-right">Required (Meters & Sets)</th>
                      <th className="py-2.5 px-2.5 text-right">Produced</th>
                      <th className="py-2.5 px-2.5 text-right">Remaining</th>
                      <th className="py-2.5 px-2.5">Material Status</th>
                      <th className="py-2.5 px-2.5">Prod Status</th>
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
                            <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
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

            {/* Right: Production Order Detail Panel (5 cols) */}
            {selectedPO && (
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between text-[11px] font-bold">
                  <span>PRODUCTION WORK ORDER • {selectedPO.id}</span>
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
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
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
                          className="text-[11px] font-mono font-semibold text-blue-600 hover:underline"
                        >
                          Linked Order: {selectedPO.orderId}
                        </button>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-slate-900 mt-0.5">
                      {selectedPO.profileName}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Extruder Line: <strong>{selectedPO.extruderLine}</strong> • Fabricator:{' '}
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
                              Produced: {formatNumberIN(selectedPO.producedQuantity)} /{' '}
                              {formatNumberIN(selectedPO.requiredQuantity)} meters
                            </span>
                            <span className="font-bold text-red-600 text-sm">Progress: {pct}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-600 transition-all"
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* 4 Floor Control Action Buttons: Start Production, Update Quantity, Pause, Complete */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        onClick={() => updateProductionOrder(selectedPO.id, 'start')}
                        className="flex items-center justify-center gap-1 py-2 px-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start</span>
                      </button>
                      <button
                        onClick={() => setShowQtyBox(!showQtyBox)}
                        className="flex items-center justify-center gap-1 py-2 px-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>+ Output</span>
                      </button>
                      <button
                        onClick={() => updateProductionOrder(selectedPO.id, 'pause')}
                        className="flex items-center justify-center gap-1 py-2 px-2 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause</span>
                      </button>
                      <button
                        onClick={() => updateProductionOrder(selectedPO.id, 'complete')}
                        className="flex items-center justify-center gap-1 py-2 px-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                    </div>

                    {showQtyBox && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                        <div className="text-[11px] font-bold text-slate-700">
                          Log Extruded Meterage & Rejection
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
                            <span className="text-[10px] text-slate-500">Scrap / Rejected (m)</span>
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

                  {/* Output, Rejected, Wastage, Final Quantity Grid */}
                  <div className="p-3 rounded-md bg-slate-50 border border-slate-200 grid grid-cols-3 gap-3 font-mono">
                    <div>
                      <div className="text-[10px] font-sans font-bold uppercase text-slate-400">
                        Required Qty
                      </div>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {formatNumberIN(selectedPO.requiredQuantity)} m
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans">
                        {formatBundlesText(selectedPO.requiredQuantity)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-sans font-bold uppercase text-slate-400">
                        Gross Output
                      </div>
                      <div className="font-bold text-blue-700 mt-0.5">
                        {formatNumberIN(selectedPO.producedQuantity)} m
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-sans font-bold uppercase text-slate-400">
                        Remaining
                      </div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {formatNumberIN(selectedPO.remainingQuantity)} m
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-sans font-bold uppercase text-slate-400">
                        Rejected Qty
                      </div>
                      <div className="font-bold text-red-600 mt-0.5">
                        {selectedPO.rejectedQuantity} m
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-sans font-bold uppercase text-slate-400">
                        Wastage (kg)
                      </div>
                      <div className="font-bold text-amber-700 mt-0.5">{selectedPO.wastageKg} kg</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-sans font-bold uppercase text-slate-400">
                        Final Good Qty
                      </div>
                      <div className="font-bold text-emerald-700 mt-0.5">
                        {formatNumberIN(selectedPO.finalQuantity)} m
                      </div>
                    </div>
                  </div>

                  {/* Material Requirement Summary for this PO */}
                  {poMRP && (
                    <div className="p-3 rounded border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          BOM MATERIAL REQUIREMENT ({formatNumberIN(selectedPO.requiredQuantity)}M)
                        </span>
                        <button
                          onClick={() =>
                            navigateTo('material_requirements', selectedPO.profileCode)
                          }
                          className="text-[11px] font-semibold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Calculator className="w-3 h-3" />
                          <span>Open MRP</span>
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
                              Req: {formatNumberIN(r.requiredKg)} kg
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
      {/* MODAL: SCHEDULE EXTRUSION SESSION (3-TRACK / DIE) */}
      {/* ==================================================== */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-600" />
                  <span>Schedule Extrusion Run Session</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select profile die or enter custom profile, set target sets of 6 pieces, configure raw materials, and check silo compatibility.
                </p>
              </div>
              <button
                onClick={() => setShowSessionModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Die & Profile Selector with Custom Mode Toggle */}
            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="block font-bold text-slate-800">
                    Extrusion Die & Profile (e.g. 3-Track Sliding Villa Frame) *
                  </label>
                  <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-[11px] font-semibold self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setSessionDieMode('catalog')}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                        sessionDieMode === 'catalog'
                          ? 'bg-white text-red-600 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      📋 Select Existing Die
                    </button>
                    <button
                      type="button"
                      onClick={() => setSessionDieMode('manual')}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                        sessionDieMode === 'manual'
                          ? 'bg-white text-red-600 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ✏️ Custom / New Die & Profile
                    </button>
                  </div>
                </div>

                {sessionDieMode === 'catalog' ? (
                  <div>
                    <select
                      value={sessionDieNumber}
                      onChange={(e) => setSessionDieNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono font-semibold text-slate-900 focus:border-red-500 focus:outline-none"
                    >
                      {dies.map((d) => (
                        <option key={d.id} value={d.dieNumber}>
                          {d.dieNumber} • {d.dieName} ({d.extruderLine.split('(')[0]}) — {d.weightPerMeterKg} kg/m
                        </option>
                      ))}
                    </select>
                    <div className="mt-1 text-[11px] text-slate-500">
                      Die standard line speed: <strong>{selectedDie?.standardSpeedMpm} m/min</strong> • Heating zones: <strong>{selectedDie?.heatingZonesTemp}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-red-50/50 border border-red-200 rounded-lg space-y-2.5">
                    <div className="flex items-center gap-1.5 text-red-800 font-semibold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-red-600" />
                      <span>Custom Extrusion Tooling / Specialized Profile Specification</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Custom Die & Profile Name *
                      </label>
                      <input
                        type="text"
                        value={sessionCustomDieName}
                        onChange={(e) => setSessionCustomDieName(e.target.value)}
                        placeholder="e.g. 3-Track Sliding Villa Frame Die (112mm Heavy Series)"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Die Tooling Code
                        </label>
                        <input
                          type="text"
                          value={sessionCustomDieNumber}
                          onChange={(e) => setSessionCustomDieNumber(e.target.value)}
                          placeholder="DIE-S112-30T-CUSTOM"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white font-mono text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Linear Weight (kg/m) *
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          min="0.3"
                          max="8.0"
                          value={sessionCustomWeight}
                          onChange={(e) => setSessionCustomWeight(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white font-mono text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Extruder Line
                        </label>
                        <select
                          value={sessionCustomLine}
                          onChange={(e) => setSessionCustomLine(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800"
                        >
                          <option value="Extruder Line 01 (KraussMaffei KM-65)">Extruder Line 01</option>
                          <option value="Extruder Line 02 (KraussMaffei KM-65)">Extruder Line 02</option>
                          <option value="Extruder Line 03 (Cincinnati Twin)">Extruder Line 03</option>
                          <option value="Extruder Line 04 (Cincinnati Milacron)">Extruder Line 04</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity in Sets of 6 pcs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-red-50/50 rounded-lg border border-red-200 space-y-1">
                  <label className="block font-bold text-red-950">
                    Session Target (Sets of 6 Pieces)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={sessionBundles}
                      onChange={(e) => setSessionBundles(Math.max(1, Number(e.target.value)))}
                      className="w-24 px-3 py-1.5 border border-red-300 rounded font-mono font-bold text-slate-900 bg-white"
                    />
                    <span className="font-semibold text-slate-700">Sets of 6</span>
                  </div>
                  <div className="text-[11px] font-mono text-red-700 pt-1">
                    = {formatNumberIN(targetMeters)} meters ({targetPieces} bars of 6m)
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <label className="block font-bold text-slate-800">Production Shift</label>
                  <select
                    value={sessionShift}
                    onChange={(e) => setSessionShift(e.target.value as SessionShift)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium"
                  >
                    <option value="Morning Shift (06:00 - 14:00)">Morning Shift (06:00 - 14:00)</option>
                    <option value="Evening Shift (14:00 - 22:00)">Evening Shift (14:00 - 22:00)</option>
                    <option value="Night Shift (22:00 - 06:00)">Night Shift (22:00 - 06:00)</option>
                  </select>
                  <div className="text-[11px] text-slate-500 pt-1">
                    Assigned: <strong>{sessionDieMode === 'manual' ? sessionCustomLine : selectedDie?.extruderLine}</strong>
                  </div>
                </div>
              </div>

              {/* Raw Material Compound & Silo Configuration */}
              <div className="border border-slate-200 rounded-lg p-3 space-y-2.5 bg-slate-50/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-200 pb-2">
                  <div>
                    <span className="font-bold uppercase tracking-wider text-slate-800 text-[11px] block">
                      Raw Material Compound Formulation ({sessionBundles} Sets / {formatNumberIN(targetMeters)}m)
                    </span>
                    <span className="text-[11px] font-mono font-bold text-red-600">
                      Est. Total Compound: {formatNumberIN(Math.round(totalCompoundKg))} kg ({effectiveDieWeight} kg/m)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddMatForm(!showAddMatForm)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Add Raw Material</span>
                  </button>
                </div>

                {/* Add Raw Material Drawer */}
                {showAddMatForm && (
                  <div className="p-3 bg-white rounded-lg border border-slate-300 space-y-2.5 shadow-xs">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>Add Raw Material / Chemical Ingredient to Extrusion Mix</span>
                      <button
                        type="button"
                        onClick={() => setShowAddMatForm(false)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">
                          Select from Registered Raw Materials or Write New
                        </label>
                        <select
                          value={selectedAddMatId}
                          onChange={(e) => setSelectedAddMatId(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium"
                        >
                          <optgroup label="Select from Silo / Registered Chemicals">
                            {rawMaterials.map((rm) => (
                              <option key={rm.id} value={rm.code}>
                                {rm.code} — {rm.name} (Silo: {rm.availableQuantity} kg)
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Custom Chemical / Additive">
                            <option value="CUSTOM">✏️ + Write New Chemical Name...</option>
                          </optgroup>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">
                          Recipe Formulation %
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="50"
                            value={customAddMatPercent}
                            onChange={(e) => setCustomAddMatPercent(Number(e.target.value))}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white font-mono font-bold"
                          />
                          <span className="font-bold text-slate-600">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Chemical Presets for 1-Click Addition */}
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 block mb-1">
                        Quick Add UPVC Chemical Presets:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'CPE 135A High Impact Modifier', pct: 3.5 },
                          { name: 'ACR-401 Extrusion Processing Aid', pct: 1.5 },
                          { name: 'PE Wax Internal Lubricant', pct: 0.8 },
                          { name: 'Stearic Acid External Lubricant', pct: 0.5 },
                          { name: 'Optical Brightener OB-1', pct: 0.05 },
                          { name: 'Walnut / Golden Oak Toner Batch', pct: 2.0 },
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setSelectedAddMatId('CUSTOM');
                              setCustomAddMatName(preset.name);
                              setCustomAddMatPercent(preset.pct);
                            }}
                            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-slate-200 text-[10px] text-slate-700 font-medium cursor-pointer transition-colors"
                          >
                            + {preset.name} ({preset.pct}%)
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedAddMatId === 'CUSTOM' && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">
                          Custom Material / Additive Name * (Will be saved to registry for future sessions)
                        </label>
                        <input
                          type="text"
                          value={customAddMatName}
                          onChange={(e) => setCustomAddMatName(e.target.value)}
                          placeholder="e.g. CPE 135A High Impact Modifier or PE Wax Internal Lubricant"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium focus:border-red-500 focus:outline-none"
                        />
                      </div>
                    )}

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
                        onClick={handleAddRawMaterial}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded cursor-pointer"
                      >
                        Add to Compound
                      </button>
                    </div>
                  </div>
                )}

                {/* Compound Raw Materials Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {materialsWithTelemetry.map((mat) => (
                    <div
                      key={mat.id}
                      className={`p-2.5 rounded-lg border transition-all ${
                        mat.isShortage
                          ? 'bg-amber-50/80 border-amber-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="font-bold text-slate-900 leading-tight">
                          {mat.materialName}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                            {mat.percentage}%
                          </span>
                          {compoundMaterials.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRawMaterial(mat.id)}
                              className="text-slate-400 hover:text-red-600 p-0.5 cursor-pointer"
                              title="Remove raw material"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-1.5 flex items-center justify-between font-mono text-[11px]">
                        <div>
                          <span className="text-slate-500 text-[10px]">Required: </span>
                          <span className="font-bold text-slate-900">
                            {formatNumberIN(mat.requiredKg)} kg
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px]">Silo Stock: </span>
                          <span
                            className={`font-bold ${
                              mat.isShortage ? 'text-amber-700' : 'text-slate-900'
                            }`}
                          >
                            {formatNumberIN(mat.liveSiloStock)} kg
                          </span>
                        </div>
                      </div>

                      {/* Stock Readiness & Inward Shortcut */}
                      <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        {mat.isShortage ? (
                          <div className="flex items-center justify-between w-full gap-1">
                            <span className="text-amber-800 font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>Shortage: {formatNumberIN(mat.requiredKg - mat.liveSiloStock)} kg</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickRestockSilo(mat.materialCode, 1000)}
                              className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer transition-colors"
                            >
                              + Restock Silo (+1000kg)
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-emerald-700 font-medium">
                              ✓ Ready for ~{mat.runsSupported} full runs
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickRestockSilo(mat.materialCode, 500)}
                              className="text-slate-500 hover:text-slate-800 underline cursor-pointer"
                            >
                              + Top up 500kg
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Auto Calculated Remaining Sessions Banner */}
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-950 font-sans">
                  <div>
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Remaining Sessions Supported by Current Silo Stock:</span>
                    </div>
                    <div className="text-[11px] text-emerald-800 mt-0.5">
                      {maxSessionsSupported > 0
                        ? `You can safely run ~${maxSessionsSupported} full sessions before raw material replenishment.`
                        : `Attention: Raw material shortage detected in Silo. Click "+ Restock Silo" above to replenish before run.`}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Extruder Operator</label>
                  <input
                    type="text"
                    value={sessionOperator}
                    onChange={(e) => setSessionOperator(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Calibration & Die Setup Notes</label>
                  <input
                    type="text"
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowSessionModal(false)}
                className="py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSession}
                className="py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer text-xs flex items-center gap-1.5 shadow-xs"
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