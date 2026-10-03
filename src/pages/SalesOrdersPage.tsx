import React, { useState } from 'react';
import {
  Search,
  Plus,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Cpu,
  Truck,
  IndianRupee,
  ArrowRight,
  PackageCheck,
  AlertTriangle,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatINR, formatNumberIN } from '../services/rbac';
import { OrderWorkflowStage } from '../types/erp';

const WORKFLOW_STAGES: OrderWorkflowStage[] = [
  'Quotation Approved',
  'Order Created',
  'Inventory Check',
  'Production Required',
  'Production',
  'Ready',
  'Dispatch',
  'Completed',
];

export const SalesOrdersPage: React.FC = () => {
  const {
    salesOrders,
    productionOrders,
    selectedRecordId,
    setSelectedRecordId,
    setQuickCreateModal,
    advanceOrderWorkflow,
    createProductionOrder,
    navigateTo,
  } = useERP();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredOrders = salesOrders.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.fabricatorName.toLowerCase().includes(q) ||
      o.quotationId.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedOrder =
    salesOrders.find((o) => o.id === selectedRecordId) ||
    filteredOrders[0] ||
    salesOrders[0];

  const currentStageIdx = selectedOrder
    ? WORKFLOW_STAGES.indexOf(selectedOrder.workflowStage)
    : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Sales Orders</h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
              PLANT UNIT 04 • BHIWADI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track confirmed fabricator orders from inventory check and extrusion production to dispatch and payment.
          </p>
        </div>
        <button
          onClick={() => setQuickCreateModal('order')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ New Order</span>
        </button>
      </div>

      {/* 8-Step Active Tracking Workflow Banner (Section 18 + Screen 5 reference) */}
      {selectedOrder && (
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                ACTIVE TRACKING WORKFLOW
              </span>
              <span className="font-mono font-bold text-sm text-slate-900">
                • {selectedOrder.id}
              </span>
              <span className="text-xs text-slate-600">({selectedOrder.fabricatorName})</span>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Target Delivery: <strong className="text-slate-900">{selectedOrder.expectedDate}</strong>{' '}
              • Batch: <strong className="text-slate-900">{selectedOrder.batchCode}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {WORKFLOW_STAGES.map((stage, idx) => {
              const isCompleted = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              return (
                <div
                  key={stage}
                  className={`p-2.5 rounded-md border text-xs transition-all ${
                    isCurrent
                      ? 'bg-red-50 border-red-500 ring-1 ring-red-400'
                      : isCompleted
                      ? 'bg-slate-50 border-slate-300'
                      : 'bg-white border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold ${
                        isCurrent
                          ? 'text-red-700'
                          : isCompleted
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {idx + 1}. {stage}
                    </span>
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <Clock className="w-3.5 h-3.5 text-red-600 shrink-0 animate-pulse" />
                    ) : null}
                  </div>
                  <div className="mt-1.5 h-1 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full ${
                        isCompleted
                          ? 'w-full bg-slate-800'
                          : isCurrent
                          ? 'w-3/4 bg-red-600'
                          : 'w-0'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap items-center gap-2.5 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID (SO-2026-1082), Fabricator, Quotation ID..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:border-red-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
        >
          <option value="ALL">Status: All Orders</option>
          <option value="New">New</option>
          <option value="Inventory Check">Inventory Check</option>
          <option value="Production Required">Production Required</option>
          <option value="In Production">In Production</option>
          <option value="Ready for Dispatch">Ready for Dispatch</option>
          <option value="Dispatched">Dispatched</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Split View: Orders Table (7 cols) + Order 360 Detail Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                  <th className="py-2.5 px-3">Order ID & Quote</th>
                  <th className="py-2.5 px-3">Fabricator</th>
                  <th className="py-2.5 px-2.5 text-right">Order Value</th>
                  <th className="py-2.5 px-2.5">Production Status</th>
                  <th className="py-2.5 px-2.5">Payment</th>
                  <th className="py-2.5 px-2.5">Dispatch</th>
                  <th className="py-2.5 px-3">Expected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((so) => {
                  const isSelected = selectedOrder?.id === so.id;
                  return (
                    <tr
                      key={so.id}
                      onClick={() => setSelectedRecordId(so.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-red-50/70 border-l-3 border-l-red-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-red-600">{so.id}</div>
                        <div className="text-[10px] font-mono text-slate-500">{so.quotationId}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{so.fabricatorName}</div>
                        <div className="text-[10px] text-slate-400">{so.fabricatorId}</div>
                      </td>
                      <td className="py-3 px-2.5 text-right font-mono font-bold text-slate-900">
                        {formatINR(so.orderValue)}
                      </td>
                      <td className="py-3 px-2.5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                            so.productionStatus === 'Completed' ||
                            so.productionStatus === 'Not Required'
                              ? 'bg-emerald-50 text-emerald-700'
                              : so.productionStatus === 'In Production'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {so.productionStatus}
                        </span>
                      </td>
                      <td className="py-3 px-2.5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                            so.paymentStatus === 'Paid'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {so.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-2.5 text-[11px] font-medium text-slate-700">
                        {so.dispatchStatus}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-600">{so.expectedDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Order Detail Panel (5 cols) */}
        {selectedOrder && (
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between text-[11px] font-bold">
              <span>ORDER #{selectedOrder.id}</span>
              <span className="px-2 py-0.5 rounded bg-red-600 text-white">
                {selectedOrder.workflowStage}
              </span>
            </div>

            <div className="p-4 space-y-4 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <button
                    onClick={() => navigateTo('fabricators', selectedOrder.fabricatorId)}
                    className="text-base font-bold text-slate-900 hover:text-red-600 text-left"
                  >
                    {selectedOrder.fabricatorName}
                  </button>
                  <p className="text-[11px] text-slate-500">
                    Quotation:{' '}
                    <button
                      onClick={() => navigateTo('quotations', selectedOrder.quotationId)}
                      className="font-mono font-semibold text-red-600 hover:underline"
                    >
                      {selectedOrder.quotationId}
                    </button>{' '}
                    • Line: {selectedOrder.extruderLine}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Total Value</div>
                  <div className="text-base font-bold font-mono text-slate-900">
                    {formatINR(selectedOrder.orderValue)}
                  </div>
                </div>
              </div>

              {/* Line Items & Inventory Allocation Check */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    LINE ITEMS & INVENTORY ALLOCATION ({selectedOrder.items.length} ITEMS)
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-md bg-slate-50 border border-slate-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {item.profileName} ({item.profileCode})
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatNumberIN(item.orderedQuantity)} {item.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">
                          Rack Allocated: <strong>{formatNumberIN(item.allocatedStock)} {item.unit}</strong>
                        </span>
                        {item.productionRequiredQuantity > 0 ? (
                          <span className="text-red-600 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Prod Req: {formatNumberIN(item.productionRequiredQuantity)} {item.unit}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <PackageCheck className="w-3 h-3" />
                            100% Stock Reserved
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Production Status Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    PAYMENT STATUS
                  </div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">
                    Paid: {formatINR(selectedOrder.paidAmount)}
                  </div>
                  <div className="text-[11px] text-red-600 font-mono">
                    Bal: {formatINR(Math.max(0, selectedOrder.orderValue - selectedOrder.paidAmount))}
                  </div>
                </div>
                <div className="p-2.5 rounded border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    PRODUCTION & DISPATCH
                  </div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    Prod: {selectedOrder.productionStatus}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Dispatch: {selectedOrder.dispatchStatus}
                  </div>
                </div>
              </div>

              {/* Next Workflow Step Actions */}
              <div className="space-y-2 pt-1">
                {selectedOrder.workflowStage !== 'Completed' && (
                  <button
                    onClick={() => advanceOrderWorkflow(selectedOrder.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Advance Workflow Stage</span>
                  </button>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      const existingPo = productionOrders.find(
                        (p) => p.orderId === selectedOrder.id
                      );
                      if (existingPo) {
                        navigateTo('production', existingPo.id);
                      } else {
                        const firstItem = selectedOrder.items[0];
                        const po = createProductionOrder({
                          orderId: selectedOrder.id,
                          productId: firstItem.productId,
                          requiredQuantity:
                            firstItem.productionRequiredQuantity > 0
                              ? firstItem.productionRequiredQuantity
                              : firstItem.orderedQuantity,
                          dueDate: selectedOrder.expectedDate,
                          extruderLine: 'Extruder Line 02',
                        });
                        navigateTo('production', po.id);
                      }
                    }}
                    className="flex items-center justify-center gap-1 py-2 px-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Production</span>
                  </button>

                  <button
                    onClick={() => navigateTo('dispatch', null)}
                    className="flex items-center justify-center gap-1 py-2 px-2 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Dispatch</span>
                  </button>

                  <button
                    onClick={() => setQuickCreateModal('payment')}
                    className="flex items-center justify-center gap-1 py-2 px-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                  >
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>Payment</span>
                  </button>
                </div>
              </div>

              {/* Order Activity Timeline */}
              <div className="pt-2 border-t border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                  ORDER ACTIVITY LOG
                </div>
                <div className="space-y-1.5">
                  {selectedOrder.timeline.map((t) => (
                    <div key={t.id} className="text-[11px] flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600 mt-1 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900">{t.title}</span>
                        {t.description && (
                          <div className="text-[10px] text-slate-500">{t.description}</div>
                        )}
                        <div className="text-[10px] text-slate-400">
                          {t.timestamp} • {t.actor}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
