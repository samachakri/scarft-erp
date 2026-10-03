import React from 'react';
import {
  Users,
  Factory,
  Handshake,
  FileText,
  ShoppingCart,
  AlertTriangle,
  Cpu,
  IndianRupee,
  ArrowRight,
  CheckCircle2,
  Clock,
  MessageSquare,
  Plus,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatINR, formatINRCompact, formatNumberIN } from '../services/rbac';
import { ModuleKey } from '../types/erp';

export const DashboardPage: React.FC = () => {
  const {
    leads,
    fabricators,
    dealers,
    quotations,
    salesOrders,
    rawMaterials,
    productionOrders,
    payments,
    navigateTo,
    simulateWhatsAppLead,
    setQuickCreateModal,
    currentEmployee,
  } = useERP();

  // Top 8 KPIs
  const newLeadsCount = leads.filter((l) => l.status === 'New').length;
  const activeFabricatorsCount = fabricators.filter((f) => f.status === 'Active').length;
  const activeDealersCount = dealers.filter((d) => d.status === 'Active').length;
  const pendingQuotationsCount = quotations.filter(
    (q) => q.status === 'Pending Approval' || q.status === 'Draft' || q.status === 'Sent'
  ).length;
  const waitingApprovalQuotesCount = quotations.filter((q) => q.status === 'Pending Approval').length;
  const openOrdersCount = salesOrders.filter((o) => o.status !== 'Completed').length;
  const lowStockCount = rawMaterials.filter((r) => r.status !== 'Healthy').length;
  const prodInProgressCount = productionOrders.filter((p) => p.productionStatus === 'In Production').length;
  const totalOutstanding = payments.reduce((sum, p) => sum + p.outstandingAmount, 0);

  // Sales Overview metrics
  const totalSalesValue = salesOrders.reduce((sum, o) => sum + o.orderValue, 0);
  const totalQuotationsValue = quotations.reduce((sum, q) => sum + q.grandTotal, 0);

  // Production Overview counts
  const prodPlanned = productionOrders.filter(
    (p) => p.productionStatus === 'Planned' || p.productionStatus === 'Material Pending'
  ).length;
  const prodActive = productionOrders.filter((p) => p.productionStatus === 'In Production').length;
  const prodCompleted = productionOrders.filter((p) => p.productionStatus === 'Completed').length;
  const prodDelayed = productionOrders.filter((p) => p.productionStatus === 'Delayed').length;

  const overduePaymentsCount = payments.filter((p) => p.status === 'Overdue').length;

  const flowSteps: { label: string; sub: string; mod: ModuleKey; count: string }[] = [
    { label: '1. Leads', sub: 'WhatsApp / Web', mod: 'leads', count: `${leads.length} Leads` },
    { label: '2. Fabricator', sub: 'B2B Customer', mod: 'fabricators', count: `${fabricators.length} Units` },
    { label: '3. Quotation', sub: 'Pricing & Approval', mod: 'quotations', count: `${quotations.length} Quotes` },
    { label: '4. Sales Order', sub: 'Inventory Check', mod: 'orders', count: `${salesOrders.length} Orders` },
    { label: '5. MRP & BOM', sub: 'Raw Materials', mod: 'material_requirements', count: `${lowStockCount} Alerts` },
    { label: '6. Extrusion', sub: 'Lines 1-6', mod: 'production', count: `${prodActive} Running` },
    { label: '7. Dispatch', sub: 'Gatepass & EWB', mod: 'dispatch', count: '7 Loads' },
    { label: '8. Payment', sub: 'Ledger & GST', mod: 'payments', count: formatINRCompact(totalOutstanding) },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {currentEmployee.role === 'Sales Executive'
                ? `Sales Desk Dashboard — ${currentEmployee.name}`
                : 'SCraft Manufacturing Operations Dashboard'}
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
              FY 2026-27 • Plant Unit 04 Bhiwadi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time UPVC profile sales, fabricator orders, resin inventory, and extrusion line status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const l = simulateWhatsAppLead();
              navigateTo('leads', l.id);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Simulate WhatsApp Lead</span>
          </button>
          <button
            onClick={() => navigateTo('quotations', 'CREATE_NEW')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Quotation</span>
          </button>
        </div>
      </div>

      {/* Interactive Core Manufacturing Workflow Strip */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            END-TO-END SCRAFT MANUFACTURING ERP WORKFLOW (CLICK ANY STAGE TO INSPECT)
          </span>
          <span className="text-[11px] text-slate-500">
            Fabricators are SCraft's customers (Internal Employee ERP Only)
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {flowSteps.map((step, idx) => (
            <button
              key={step.label}
              onClick={() => navigateTo(step.mod, null)}
              className="group relative flex flex-col justify-between p-2.5 rounded-md border border-slate-200 bg-slate-50/70 hover:bg-red-50/60 hover:border-red-300 text-left transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 group-hover:text-red-700">
                  {step.label}
                </span>
                {idx < flowSteps.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-red-600" />
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{step.sub}</div>
              <div className="mt-1.5 text-xs font-mono font-bold text-slate-900">{step.count}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Pending Attention Alerts Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => navigateTo('quotations', null)}
          className="flex items-center justify-between p-3 bg-amber-50/90 hover:bg-amber-100/80 border border-amber-200 rounded-lg text-left transition-colors cursor-pointer"
        >
          <div>
            <div className="text-[10px] font-bold uppercase text-amber-800">ACTION REQUIRED • COMMERCIAL</div>
            <div className="text-xs font-bold text-slate-900 mt-0.5">
              {waitingApprovalQuotesCount} quotations waiting for approval
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-700 shrink-0" />
        </button>

        <button
          onClick={() => navigateTo('raw_materials', null)}
          className="flex items-center justify-between p-3 bg-red-50/90 hover:bg-red-100/80 border border-red-200 rounded-lg text-left transition-colors cursor-pointer"
        >
          <div>
            <div className="text-[10px] font-bold uppercase text-red-800">INVENTORY SHORTAGE ALERT</div>
            <div className="text-xs font-bold text-slate-900 mt-0.5">
              {lowStockCount} materials below minimum stock
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-red-700 shrink-0" />
        </button>

        <button
          onClick={() => navigateTo('production', null)}
          className="flex items-center justify-between p-3 bg-purple-50/90 hover:bg-purple-100/80 border border-purple-200 rounded-lg text-left transition-colors cursor-pointer"
        >
          <div>
            <div className="text-[10px] font-bold uppercase text-purple-800">EXTRUSION FLOOR ALERT</div>
            <div className="text-xs font-bold text-slate-900 mt-0.5">
              {prodDelayed} production orders delayed
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-purple-700 shrink-0" />
        </button>

        <button
          onClick={() => navigateTo('payments', null)}
          className="flex items-center justify-between p-3 bg-rose-50/90 hover:bg-rose-100/80 border border-rose-200 rounded-lg text-left transition-colors cursor-pointer"
        >
          <div>
            <div className="text-[10px] font-bold uppercase text-rose-800">ACCOUNTS RECEIVABLE</div>
            <div className="text-xs font-bold text-slate-900 mt-0.5">
              {overduePaymentsCount} payments overdue
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-rose-700 shrink-0" />
        </button>
      </div>

      {/* Top 8 Operational KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          {
            label: 'New Leads',
            value: newLeadsCount,
            sub: `${leads.length} Total`,
            icon: <Users className="w-4 h-4 text-emerald-600" />,
            mod: 'leads' as ModuleKey,
          },
          {
            label: 'Active Fabricators',
            value: activeFabricatorsCount,
            sub: `${fabricators.length} Registered`,
            icon: <Factory className="w-4 h-4 text-blue-600" />,
            mod: 'fabricators' as ModuleKey,
          },
          {
            label: 'Active Dealers',
            value: activeDealersCount,
            sub: `${dealers.length} Networks`,
            icon: <Handshake className="w-4 h-4 text-indigo-600" />,
            mod: 'dealers' as ModuleKey,
          },
          {
            label: 'Pending Quotations',
            value: pendingQuotationsCount,
            sub: `${waitingApprovalQuotesCount} Need Approval`,
            icon: <FileText className="w-4 h-4 text-amber-600" />,
            mod: 'quotations' as ModuleKey,
          },
          {
            label: 'Open Orders',
            value: openOrdersCount,
            sub: formatINRCompact(totalSalesValue),
            icon: <ShoppingCart className="w-4 h-4 text-red-600" />,
            mod: 'orders' as ModuleKey,
          },
          {
            label: 'Low Stock Items',
            value: lowStockCount,
            sub: 'Resin & TiO2 Alert',
            icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
            mod: 'raw_materials' as ModuleKey,
          },
          {
            label: 'Production Active',
            value: prodInProgressCount,
            sub: `${productionOrders.length} Work Orders`,
            icon: <Cpu className="w-4 h-4 text-purple-600" />,
            mod: 'production' as ModuleKey,
          },
          {
            label: 'Outstanding Dues',
            value: formatINRCompact(totalOutstanding),
            sub: `${overduePaymentsCount} Overdue`,
            icon: <IndianRupee className="w-4 h-4 text-rose-600" />,
            mod: 'payments' as ModuleKey,
          },
        ].map((kpi) => (
          <button
            key={kpi.label}
            onClick={() => navigateTo(kpi.mod, null)}
            className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 text-left transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 leading-tight">{kpi.label}</span>
              {kpi.icon}
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono mt-2">{kpi.value}</div>
            <div className="text-[10px] font-medium text-slate-500 mt-1">{kpi.sub}</div>
          </button>
        ))}
      </div>

      {/* Middle Row: Sales Overview, Production Overview, and Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sales Overview + Production Overview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Sales Overview */}
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Sales & Commercial Overview
                </h2>
                <p className="text-[11px] text-slate-500">Conversion funnel from Lead to Sales Order</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Oct 2026
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] text-slate-500">Total Active Leads</div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">{leads.length}</div>
                <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                  {leads.filter((l) => l.source === 'WhatsApp').length} via WhatsApp
                </div>
              </div>
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] text-slate-500">Quotations Pipeline</div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  {quotations.length} ({formatINRCompact(totalQuotationsValue)})
                </div>
                <div className="text-[10px] text-amber-700 font-medium mt-0.5">
                  {quotations.filter((q) => q.status === 'Approved').length} Approved
                </div>
              </div>
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] text-slate-500">Confirmed Sales Orders</div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">{salesOrders.length}</div>
                <div className="text-[10px] text-blue-600 font-medium mt-0.5">
                  {salesOrders.filter((o) => o.workflowStage === 'Production').length} in Extrusion
                </div>
              </div>
              <div className="p-3 rounded-md bg-red-50/60 border border-red-200">
                <div className="text-[11px] text-red-800 font-medium">Booked Order Value</div>
                <div className="text-lg font-bold font-mono text-red-700 mt-0.5">
                  {formatINRCompact(totalSalesValue)}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5">Ex-Bhiwadi GST Inclusive</div>
              </div>
            </div>
          </div>

          {/* Production Overview */}
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Extrusion & Production Overview
                </h2>
                <p className="text-[11px] text-slate-500">Status across KraussMaffei & Cincinnati lines</p>
              </div>
              <button
                onClick={() => navigateTo('production', null)}
                className="text-xs text-red-600 hover:underline font-semibold"
              >
                Open Floor →
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2.5 mt-3 text-center">
              <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-500">Planned</div>
                <div className="text-lg font-bold font-mono text-slate-800 mt-1">{prodPlanned}</div>
              </div>
              <div className="p-2.5 rounded-md bg-blue-50 border border-blue-200">
                <div className="text-[10px] font-bold uppercase text-blue-700">In Production</div>
                <div className="text-lg font-bold font-mono text-blue-800 mt-1">{prodActive}</div>
              </div>
              <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-200">
                <div className="text-[10px] font-bold uppercase text-emerald-700">Completed</div>
                <div className="text-lg font-bold font-mono text-emerald-800 mt-1">{prodCompleted}</div>
              </div>
              <div className="p-2.5 rounded-md bg-red-50 border border-red-200">
                <div className="text-[10px] font-bold uppercase text-red-700">Delayed</div>
                <div className="text-lg font-bold font-mono text-red-700 mt-1">{prodDelayed}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Alerts Table (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Raw Material Inventory Alerts & Thresholds
              </h2>
              <p className="text-[11px] text-slate-500">
                Real-time resin & additive stock vs minimum safety levels
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuickCreateModal('stock')}
                className="px-2.5 py-1 bg-slate-900 text-white rounded text-[11px] font-semibold hover:bg-slate-800 cursor-pointer"
              >
                + Stock In
              </button>
              <button
                onClick={() => navigateTo('material_requirements', null)}
                className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-[11px] font-semibold hover:bg-red-100 cursor-pointer"
              >
                Run MRP Calculator
              </button>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                  <th className="py-2.5 px-3.5">Material</th>
                  <th className="py-2.5 px-3 text-right">Available</th>
                  <th className="py-2.5 px-3 text-right">Minimum Level</th>
                  <th className="py-2.5 px-3 text-right">Shortage</th>
                  <th className="py-2.5 px-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rawMaterials.slice(0, 6).map((rm) => {
                  const shortage = Math.max(0, rm.minimumLevel - rm.availableQuantity);
                  return (
                    <tr
                      key={rm.id}
                      onClick={() => navigateTo('raw_materials', rm.id)}
                      className="hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="py-2.5 px-3.5">
                        <div className="font-semibold text-slate-900">{rm.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {rm.code} • {rm.supplier.split('(')[0]}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">
                        {formatNumberIN(rm.availableQuantity)} {rm.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        {formatNumberIN(rm.minimumLevel)} {rm.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        {shortage > 0 ? (
                          <span className="text-red-600">
                            -{formatNumberIN(shortage)} {rm.unit}
                          </span>
                        ) : (
                          <span className="text-emerald-600">0 {rm.unit}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            rm.status === 'Healthy'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : rm.status === 'Low'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {rm.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Leads, Recent Quotations, Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Leads */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Recent Leads</h3>
            <button
              onClick={() => navigateTo('leads', null)}
              className="text-[11px] font-semibold text-red-600 hover:underline"
            >
              View All ({leads.length})
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {leads.slice(0, 5).map((lead) => (
              <button
                key={lead.id}
                onClick={() => navigateTo('leads', lead.id)}
                className="w-full px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between text-left text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-red-600">{lead.id}</span>
                    <span>{lead.companyName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {lead.name} • {lead.location}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {lead.source}
                  </span>
                  <div className="text-[10px] font-medium text-slate-500 mt-0.5">{lead.status}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Quotations */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Recent Quotations
            </h3>
            <button
              onClick={() => navigateTo('quotations', null)}
              className="text-[11px] font-semibold text-red-600 hover:underline"
            >
              View All ({quotations.length})
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {quotations.slice(0, 5).map((qt) => (
              <button
                key={qt.id}
                onClick={() => navigateTo('quotations', qt.id)}
                className="w-full px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between text-left text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-slate-700">{qt.id}</span>
                    <span>{qt.fabricatorName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">By {qt.createdBy} • {qt.createdAt}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900">{formatINR(qt.grandTotal)}</div>
                  <span
                    className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      qt.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : qt.status === 'Pending Approval'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {qt.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Sales Orders */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Recent Sales Orders
            </h3>
            <button
              onClick={() => navigateTo('orders', null)}
              className="text-[11px] font-semibold text-red-600 hover:underline"
            >
              View All ({salesOrders.length})
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {salesOrders.slice(0, 5).map((so) => (
              <button
                key={so.id}
                onClick={() => navigateTo('orders', so.id)}
                className="w-full px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between text-left text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-red-600">{so.id}</span>
                    <span>{so.fabricatorName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    {so.productionStatus === 'Completed' ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Clock className="w-3 h-3 text-amber-600" />
                    )}
                    <span>Stage: {so.workflowStage}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900">{formatINR(so.orderValue)}</div>
                  <div className="text-[10px] text-slate-500">Due: {so.expectedDate}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
