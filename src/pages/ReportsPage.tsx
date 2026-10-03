import React, { useState } from 'react';
import { BarChart3, Download } from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatINR, formatINRCompact, formatNumberIN } from '../services/rbac';

export const ReportsPage: React.FC = () => {
  const {
    fabricators,
    dealers,
    products,
    rawMaterials,
    quotations,
    salesOrders,
    productionOrders,
    payments,
    showToast,
  } = useERP();

  const [category, setCategory] = useState<
    'sales' | 'inventory' | 'production' | 'fabricators' | 'payments'
  >('sales');

  const totalQuotes = quotations.length;
  const approvedQuotes = quotations.filter((q) => q.status === 'Approved').length;
  const conversionRate = totalQuotes > 0 ? Math.round((approvedQuotes / totalQuotes) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Operational & Financial Reports</h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              FY 2026-27 LEDGER SUMMARY
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Clean tabular management reports across Sales, Inventory, Extrusion Production, Fabricators, and Payments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            {[
              { key: 'sales', label: 'Sales' },
              { key: 'inventory', label: 'Inventory' },
              { key: 'production', label: 'Production' },
              { key: 'fabricators', label: 'Fabricators' },
              { key: 'payments', label: 'Payments' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCategory(tab.key as typeof category)}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  category === tab.key
                    ? 'bg-white text-red-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => showToast(`Exported ${category.toUpperCase()} report to CSV`, 'info')}
            className="flex items-center gap-1.5 px-3 py-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 1. SALES REPORTS */}
      {category === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Sales by Month & Quotation Conversion */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-slate-700">
                Sales by Month & Quotation Conversion
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-700">
                Conversion Rate: {conversionRate}% ({approvedQuotes}/{totalQuotes})
              </span>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                  <th className="py-2.5 px-4">Month</th>
                  <th className="py-2.5 px-3 text-right">Quotations</th>
                  <th className="py-2.5 px-3 text-right">Orders</th>
                  <th className="py-2.5 px-3 text-right">Extruded MT</th>
                  <th className="py-2.5 px-4 text-right">Booked Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="py-2.5 px-4 font-sans font-semibold">October 2026 (MTD)</td>
                  <td className="py-2.5 px-3 text-right">{quotations.length}</td>
                  <td className="py-2.5 px-3 text-right">{salesOrders.length}</td>
                  <td className="py-2.5 px-3 text-right">64.2 MT</td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                    {formatINR(salesOrders.reduce((s, o) => s + o.orderValue, 0))}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-sans font-semibold">September 2026</td>
                  <td className="py-2.5 px-3 text-right">42</td>
                  <td className="py-2.5 px-3 text-right">29</td>
                  <td className="py-2.5 px-3 text-right">148.5 MT</td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                    ₹2,84,50,000
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-sans font-semibold">August 2026</td>
                  <td className="py-2.5 px-3 text-right">38</td>
                  <td className="py-2.5 px-3 text-right">25</td>
                  <td className="py-2.5 px-3 text-right">132.0 MT</td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                    ₹2,51,20,000
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-sans font-semibold">July 2026</td>
                  <td className="py-2.5 px-3 text-right">35</td>
                  <td className="py-2.5 px-3 text-right">22</td>
                  <td className="py-2.5 px-3 text-right">119.4 MT</td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                    ₹2,26,80,000
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sales by Profile & Sales by Dealer */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-bold uppercase text-slate-700">
                Sales by UPVC Profile & Dealer Network
              </h3>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                  <th className="py-2.5 px-4">Profile / Dealer</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Rate / Volume</th>
                  <th className="py-2.5 px-4 text-right">Revenue Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.slice(0, 4).map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-4">
                      <span className="font-mono font-bold text-red-600">{p.code}</span> •{' '}
                      <span className="font-semibold text-slate-800">{p.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{p.category}</td>
                    <td className="py-2.5 px-3 text-right font-mono">₹{p.sellingPrice}/m</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatINR(p.sellingPrice * 18500)}
                    </td>
                  </tr>
                ))}
                {dealers.slice(0, 3).map((d) => (
                  <tr key={d.id} className="bg-slate-50/50">
                    <td className="py-2.5 px-4">
                      <span className="font-mono font-bold text-indigo-600">{d.id}</span> •{' '}
                      <span className="font-semibold text-slate-800">{d.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      Dealer ({d.fabricatorIds.length} Fabs)
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">{d.totalVolumeMt} MT/mo</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">
                      {formatINRCompact(d.totalVolumeMt * 195000)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. INVENTORY REPORTS */}
      {category === 'inventory' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-bold uppercase text-slate-700">
              Inventory Value, Low Stock & Material Consumption Report
            </h3>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                <th className="py-2.5 px-4">Material Code & Name</th>
                <th className="py-2.5 px-3 text-right">Available</th>
                <th className="py-2.5 px-3 text-right">Minimum Level</th>
                <th className="py-2.5 px-3 text-right">Unit Cost</th>
                <th className="py-2.5 px-3 text-right">Total Valuation</th>
                <th className="py-2.5 px-4">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rawMaterials.map((rm) => (
                <tr key={rm.id}>
                  <td className="py-2.5 px-4">
                    <span className="font-mono font-bold text-red-600 mr-2">{rm.code}</span>
                    <span className="font-semibold text-slate-900">{rm.name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold">
                    {formatNumberIN(rm.availableQuantity)} {rm.unit}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                    {formatNumberIN(rm.minimumLevel)} {rm.unit}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    ₹{rm.averageCostPerUnit}/{rm.unit}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {formatINR(
                      (rm.availableQuantity + rm.reservedQuantity) * rm.averageCostPerUnit
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rm.status === 'Healthy'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {rm.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. PRODUCTION REPORTS */}
      {category === 'production' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-bold uppercase text-slate-700">
              Production Quantity, Output Efficiency & Extrusion Wastage Report
            </h3>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                <th className="py-2.5 px-4">Production Order</th>
                <th className="py-2.5 px-3">Profile</th>
                <th className="py-2.5 px-3">Extruder Line</th>
                <th className="py-2.5 px-3 text-right">Required (m)</th>
                <th className="py-2.5 px-3 text-right">Produced (m)</th>
                <th className="py-2.5 px-3 text-right">Rejected (m)</th>
                <th className="py-2.5 px-4 text-right">Wastage (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {productionOrders.map((po) => (
                <tr key={po.id}>
                  <td className="py-2.5 px-4 font-bold text-red-600">{po.id}</td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                    {po.profileCode} — {po.profileName}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">{po.extruderLine}</td>
                  <td className="py-2.5 px-3 text-right">{formatNumberIN(po.requiredQuantity)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                    {formatNumberIN(po.producedQuantity)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-red-600">{po.rejectedQuantity}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-amber-700">
                    {po.wastageKg} kg
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. FABRICATORS REPORTS */}
      {category === 'fabricators' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-bold uppercase text-slate-700">
              Sales by Fabricator & Credit Utilization Report
            </h3>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                <th className="py-2.5 px-4">Fabricator ID & Name</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Associated Dealer</th>
                <th className="py-2.5 px-3 text-right">Total Sales YTD</th>
                <th className="py-2.5 px-3 text-right">Credit Limit</th>
                <th className="py-2.5 px-4 text-right">Outstanding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fabricators.map((f) => (
                <tr key={f.id}>
                  <td className="py-2.5 px-4">
                    <span className="font-mono font-bold text-red-600 mr-1.5">{f.id}</span>
                    <span className="font-bold text-slate-900">{f.name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{f.location}</td>
                  <td className="py-2.5 px-3 text-slate-600">{f.dealerName || 'Direct'}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                    {formatINR(f.totalSalesYtd)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {formatINR(f.creditLimit)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-red-600">
                    {formatINR(f.outstandingAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. PAYMENTS REPORTS */}
      {category === 'payments' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-bold uppercase text-slate-700">
              Outstanding Payments & Aging Report
            </h3>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                <th className="py-2.5 px-4">Fabricator</th>
                <th className="py-2.5 px-3">Order & Invoice</th>
                <th className="py-2.5 px-3 text-right">Invoice Total</th>
                <th className="py-2.5 px-3 text-right">Paid</th>
                <th className="py-2.5 px-3 text-right">Outstanding</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{p.fabricatorName}</td>
                  <td className="py-2.5 px-3 font-mono">
                    {p.orderId} ({p.invoiceNo})
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {formatINR(p.orderTotalAmount)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-700">
                    {formatINR(p.paidAmount)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600">
                    {formatINR(p.outstandingAmount)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{p.dueDate}</td>
                  <td className="py-2.5 px-4 font-bold">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
