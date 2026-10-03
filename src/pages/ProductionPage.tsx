import React, { useState } from 'react';
import {
  Search,
  Plus,
  Cpu,
  Play,
  Pause,
  CheckCircle2,
  Sliders,
  Calculator,
  AlertTriangle,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatNumberIN } from '../services/rbac';
import { ProductionStatus } from '../types/erp';

export const ProductionPage: React.FC = () => {
  const {
    productionOrders,
    selectedRecordId,
    setSelectedRecordId,
    setQuickCreateModal,
    updateProductionOrder,
    calculateMRP,
    navigateTo,
  } = useERP();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Update quantity inline input
  const [deltaMeters, setDeltaMeters] = useState(250);
  const [deltaScrap, setDeltaScrap] = useState(4);
  const [showQtyBox, setShowQtyBox] = useState(false);

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

  const selectedPO =
    productionOrders.find((p) => p.id === selectedRecordId) ||
    filteredPOs[0] ||
    productionOrders[0];

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">
              Production Dashboard & Extrusion Orders
            </h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              LINES 1 TO 6 LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage twin-screw UPVC extrusion batches, inline meterage output, scrap/wastage tracking, and finished profile rack handoff.
          </p>
        </div>
        <button
          onClick={() => setQuickCreateModal('production')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ New Production Order</span>
        </button>
      </div>

      {/* 5 Production KPIs (Section 19) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(
          ['Planned', 'Material Pending', 'In Production', 'Completed', 'Delayed'] as ProductionStatus[]
        ).map((st) => {
          const count = productionOrders.filter((p) => p.productionStatus === st).length;
          const active = statusFilter === st;
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(active ? 'ALL' : st)}
              className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                active
                  ? 'bg-red-50 border-red-400 ring-1 ring-red-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {st}
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{count}</div>
            </button>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Production ID (PO-2026-00125), Profile Code (SCF-FR-60), or Fabricator..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:border-red-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
        >
          <option value="ALL">Status: All</option>
          <option value="Planned">Planned</option>
          <option value="Material Pending">Material Pending</option>
          <option value="In Production">In Production</option>
          <option value="Paused">Paused</option>
          <option value="Completed">Completed</option>
          <option value="Delayed">Delayed</option>
        </select>
      </div>

      {/* Split View: Production Table (7 cols) + Production Floor Detail Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg overflow-hidden">
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
                      <td className="py-3 px-2.5 text-right font-mono font-semibold text-slate-900">
                        {formatNumberIN(po.requiredQuantity)} m
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
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(
                  selectedPO.productionStatus
                )}`}
              >
                {selectedPO.productionStatus}
              </span>
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
                    <span>Update Qty</span>
                  </button>
                  <button
                    onClick={() => updateProductionOrder(selectedPO.id, 'pause')}
                    className="flex items-center justify-center gap-1 py-2 px-2 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer"
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
                  <div className="p-3 rounded bg-slate-50 border border-slate-300 space-y-2">
                    <div className="font-bold text-slate-800">
                      Log Extruded Output & QC Scrap
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500">
                          Additional Produced (m)
                        </label>
                        <input
                          type="number"
                          value={deltaMeters}
                          onChange={(e) => setDeltaMeters(Number(e.target.value))}
                          className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500">
                          Rejected / Startup Scrap (m)
                        </label>
                        <input
                          type="number"
                          value={deltaScrap}
                          onChange={(e) => setDeltaScrap(Number(e.target.value))}
                          className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowQtyBox(false)}
                        className="px-2.5 py-1 border border-slate-300 rounded bg-white"
                      >
                        Cancel
                      </button>
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
                        className="px-3 py-1 bg-red-600 text-white font-semibold rounded"
                      >
                        Save Output
                      </button>
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
                      className="text-[11px] font-semibold text-red-600 hover:underline flex items-center gap-1"
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
  );
};
