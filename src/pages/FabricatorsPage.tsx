import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Factory,
  Handshake,
  FileText,
  ShoppingCart,
  IndianRupee,
  Edit3,
  Phone,
  MapPin,
  ArrowUpDown,
  Package,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatINR, formatINRCompact } from '../services/rbac';
import { FabricatorStatus } from '../types/erp';

export const FabricatorsPage: React.FC = () => {
  const {
    fabricators,
    dealers,
    employees,
    quotations,
    salesOrders,
    payments,
    products,
    selectedRecordId,
    setSelectedRecordId,
    setQuickCreateModal,
    updateFabricator,
    addFabricatorRequirement,
    navigateTo,
  } = useERP();

  const [search, setSearch] = useState('');
  const [dealerFilter, setDealerFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [salespersonFilter, setSalespersonFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'sales' | 'outstanding'>('sales');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [detailTab, setDetailTab] = useState<
    'overview' | 'requirements' | 'quotations' | 'orders' | 'payments' | 'activity'
  >('overview');

  // Edit Fabricator inline modal state
  const [editingFab, setEditingFab] = useState(false);
  const [editCreditLimit, setEditCreditLimit] = useState(3000000);
  const [editStatus, setEditStatus] = useState<FabricatorStatus>('Active');

  // Add Requirement inline form state
  const [addingReq, setAddingReq] = useState(false);
  const [reqProfileCode, setReqProfileCode] = useState('SCF-FR-60');
  const [reqMonthlyQty, setReqMonthlyQty] = useState(2400);
  const [reqSite, setReqSite] = useState('New Commercial Tower Site');

  const filteredFabricators = useMemo(() => {
    return fabricators
      .filter((f) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          f.id.toLowerCase().includes(q) ||
          f.name.toLowerCase().includes(q) ||
          f.contactPerson.toLowerCase().includes(q) ||
          f.location.toLowerCase().includes(q) ||
          f.phone.toLowerCase().includes(q);
        const matchesDealer = dealerFilter === 'ALL' || f.dealerId === dealerFilter;
        const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
        const matchesSales =
          salespersonFilter === 'ALL' || f.assignedSalespersonId === salespersonFilter;
        return matchesSearch && matchesDealer && matchesStatus && matchesSales;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'outstanding') return b.outstandingAmount - a.outstandingAmount;
        return b.totalSalesYtd - a.totalSalesYtd;
      });
  }, [fabricators, search, dealerFilter, statusFilter, salespersonFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredFabricators.length / pageSize));
  const paginatedFabricators = filteredFabricators.slice((page - 1) * pageSize, page * pageSize);

  const selectedFab =
    fabricators.find((f) => f.id === selectedRecordId) ||
    paginatedFabricators[0] ||
    fabricators[0];

  // Related records for selected Fabricator
  const fabQuotations = quotations.filter((q) => q.fabricatorId === selectedFab?.id);
  const fabOrders = salesOrders.filter((o) => o.fabricatorId === selectedFab?.id);
  const fabPayments = payments.filter((p) => p.fabricatorId === selectedFab?.id);

  const openQuotesCount = fabQuotations.filter(
    (q) => q.status === 'Draft' || q.status === 'Pending Approval' || q.status === 'Sent' || q.status === 'Viewed'
  ).length;
  const approvedQuotesCount = fabQuotations.filter((q) => q.status === 'Approved').length;
  const openOrdersCount = fabOrders.filter((o) => o.status !== 'Completed').length;
  const completedOrdersCount = fabOrders.filter((o) => o.status === 'Completed').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Fabricators</h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
              PRIMARY B2B CUSTOMERS • {fabricators.filter((f) => f.status === 'Active').length} ACTIVE UNITS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            SCraft manufactures UPVC profiles and sells to fabricators. Managed internally by SCraft employees (no external customer portal).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuickCreateModal('fabricator')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Fabricator</span>
          </button>
        </div>
      </div>

      {/* KPI Cards + Dealer Network Hierarchy Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Fabricators</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{fabricators.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
            North, West & Central Zones
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-[10px] font-bold uppercase text-slate-400">Active Fabricators</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {fabricators.filter((f) => f.status === 'Active').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Regular monthly profile dispatch</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-[10px] font-bold uppercase text-slate-400">On Hold / Inactive</div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
            {fabricators.filter((f) => f.status !== 'Active').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Credit review or dormant shed</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-[10px] font-bold uppercase text-slate-400">Dealer Network Link</div>
          <div className="text-sm font-bold text-slate-900 mt-1.5 flex items-center gap-1.5">
            <Handshake className="w-4 h-4 text-red-600" />
            <span>{dealers.length} Dealers → {fabricators.length} Fabricators</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Top Dealer: Apex Architectural Hardware
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap items-center gap-2.5 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search Fabricator ID (FAB-2041), company name, contact, city..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:border-red-500"
          />
        </div>

        <select
          value={dealerFilter}
          onChange={(e) => {
            setDealerFilter(e.target.value);
            setPage(1);
          }}
          className="px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
        >
          <option value="ALL">Dealer: All Dealers</option>
          {dealers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.id})
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
        >
          <option value="ALL">Status: All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Hold">On Hold</option>
          <option value="Inactive">Inactive</option>
        </select>

        <select
          value={salespersonFilter}
          onChange={(e) => {
            setSalespersonFilter(e.target.value);
            setPage(1);
          }}
          className="px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
        >
          <option value="ALL">Salesperson: All Reps</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>

        <button
          onClick={() =>
            setSortBy((prev) =>
              prev === 'sales' ? 'outstanding' : prev === 'outstanding' ? 'name' : 'sales'
            )
          }
          className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-700"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>
            Sort: {sortBy === 'sales' ? 'Total Sales' : sortBy === 'outstanding' ? 'Outstanding' : 'Name'}
          </span>
        </button>
      </div>

      {/* Split View: Fabricator Table (7 cols) + Fabricator 360 Detail Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                  <th className="py-2.5 px-3">ID & Fabricator</th>
                  <th className="py-2.5 px-2.5">Contact & Location</th>
                  <th className="py-2.5 px-2.5">Dealer & Rep</th>
                  <th className="py-2.5 px-2.5 text-center">Quotes / Orders</th>
                  <th className="py-2.5 px-2.5 text-right">Outstanding</th>
                  <th className="py-2.5 px-2.5">Last Order</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedFabricators.map((fab) => {
                  const isSelected = selectedFab?.id === fab.id;
                  return (
                    <tr
                      key={fab.id}
                      onClick={() => setSelectedRecordId(fab.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-red-50/70 border-l-3 border-l-red-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-red-600 text-[11px]">
                            {fab.id}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 font-semibold">
                            {fab.tier}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 mt-0.5">{fab.name}</div>
                      </td>
                      <td className="py-3 px-2.5">
                        <div className="font-medium text-slate-800">{fab.contactPerson}</div>
                        <div className="text-[11px] font-mono text-slate-500">{fab.phone}</div>
                        <div className="text-[10px] text-slate-500">{fab.location}</div>
                      </td>
                      <td className="py-3 px-2.5">
                        <div className="font-medium text-slate-800 truncate max-w-[140px]">
                          {fab.dealerName || 'Direct SCraft'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Rep: {fab.assignedSalespersonName}
                        </div>
                      </td>
                      <td className="py-3 px-2.5 text-center font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold">
                          {fab.openQuotationsCount} Q
                        </span>{' '}
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold">
                          {fab.openOrdersCount} O
                        </span>
                      </td>
                      <td className="py-3 px-2.5 text-right font-mono font-bold">
                        {fab.outstandingAmount > 0 ? (
                          <span className="text-red-600">{formatINR(fab.outstandingAmount)}</span>
                        ) : (
                          <span className="text-emerald-600">₹0</span>
                        )}
                      </td>
                      <td className="py-3 px-2.5 text-[11px] text-slate-600">{fab.lastOrderDate}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                            fab.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : fab.status === 'On Hold'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {fab.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, filteredFabricators.length)} of {filteredFabricators.length}{' '}
              fabricators
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white disabled:opacity-40"
              >
                Prev
              </button>
              <span className="px-2 font-semibold">
                Page {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Right: Fabricator 360 Detail Panel (5 cols) */}
        {selectedFab && (
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            {/* Red Banner */}
            <div className="px-4 py-2.5 bg-red-600 text-white flex items-center justify-between text-[11px] font-bold">
              <span>VIEWING FABRICATOR • {selectedFab.id} (SELECTED)</span>
              <span className="px-2 py-0.5 rounded bg-white/20 text-white">
                {selectedFab.tier} Workshop
              </span>
            </div>

            <div className="p-4 space-y-4 text-xs">
              {/* Title & Action Buttons */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{selectedFab.name}</h2>
                    <p className="text-[11px] text-slate-500">
                      GSTIN: <span className="font-mono font-semibold text-slate-700">{selectedFab.gstin}</span> •{' '}
                      {selectedFab.certificationStatus}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditCreditLimit(selectedFab.creditLimit);
                      setEditStatus(selectedFab.status);
                      setEditingFab(!editingFab);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* Inline Edit Form */}
                {editingFab && (
                  <div className="mt-3 p-3 rounded-md bg-slate-50 border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-800">Edit Fabricator Account</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500">
                          Status
                        </label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as FabricatorStatus)}
                          className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                        >
                          <option value="Active">Active</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500">
                          Credit Limit (₹)
                        </label>
                        <input
                          type="number"
                          value={editCreditLimit}
                          onChange={(e) => setEditCreditLimit(Number(e.target.value))}
                          className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingFab(false)}
                        className="px-2.5 py-1 border border-slate-300 rounded bg-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          updateFabricator(selectedFab.id, {
                            status: editStatus,
                            creditLimit: editCreditLimit,
                          });
                          setEditingFab(false);
                        }}
                        className="px-3 py-1 bg-red-600 text-white font-semibold rounded"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary Actions Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                  <button
                    onClick={() => navigateTo('quotations', 'CREATE_NEW')}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>+ Quotation</span>
                  </button>
                  <button
                    onClick={() => setQuickCreateModal('order')}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>+ Order</span>
                  </button>
                  <button
                    onClick={() => setQuickCreateModal('payment')}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                  >
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>Payment</span>
                  </button>
                  <button
                    onClick={() => {
                      setDetailTab('requirements');
                      setAddingReq(true);
                    }}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>+ Req</span>
                  </button>
                </div>
              </div>

              {/* Sub-Navigation Tabs inside Fabricator Detail */}
              <div className="flex border-b border-slate-200 gap-1 overflow-x-auto">
                {(
                  [
                    { key: 'overview', label: 'Overview' },
                    { key: 'requirements', label: `Requirements (${selectedFab.requirements.length})` },
                    { key: 'quotations', label: `Quotes (${fabQuotations.length})` },
                    { key: 'orders', label: `Orders (${fabOrders.length})` },
                    { key: 'payments', label: `Payments (${fabPayments.length})` },
                    { key: 'activity', label: 'Activity' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setDetailTab(t.key)}
                    className={`px-2.5 py-2 text-[11px] font-bold border-b-2 whitespace-nowrap transition-colors ${
                      detailTab === t.key
                        ? 'border-red-600 text-red-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: OVERVIEW & BUSINESS ACTIVITY */}
              {detailTab === 'overview' && (
                <div className="space-y-3.5">
                  {/* Business Activity 6-Card Summary */}
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                      BUSINESS ACTIVITY SUMMARY
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                        <div className="text-[10px] text-slate-500">Open Quotations</div>
                        <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                          {openQuotesCount}
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                        <div className="text-[10px] text-slate-500">Approved Quotes</div>
                        <div className="text-sm font-bold font-mono text-emerald-700 mt-0.5">
                          {approvedQuotesCount}
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                        <div className="text-[10px] text-slate-500">Open Orders</div>
                        <div className="text-sm font-bold font-mono text-blue-700 mt-0.5">
                          {openOrdersCount}
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                        <div className="text-[10px] text-slate-500">Completed Orders</div>
                        <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                          {completedOrdersCount}
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-emerald-50/60 border border-emerald-200">
                        <div className="text-[10px] text-emerald-800">Total Sales YTD</div>
                        <div className="text-sm font-bold font-mono text-emerald-800 mt-0.5">
                          {formatINRCompact(selectedFab.totalSalesYtd)}
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-red-50/60 border border-red-200">
                        <div className="text-[10px] text-red-800">Outstanding</div>
                        <div className="text-sm font-bold font-mono text-red-700 mt-0.5">
                          {formatINRCompact(selectedFab.outstandingAmount)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Commercial Info */}
                  <div className="p-3 rounded-md bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        Contact Person
                      </div>
                      <div className="font-semibold text-slate-900 mt-0.5">
                        {selectedFab.contactPerson}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        Phone & Email
                      </div>
                      <div className="font-mono font-semibold text-slate-900 mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{selectedFab.phone}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{selectedFab.email}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        Payment Terms
                      </div>
                      <div className="font-semibold text-slate-800 mt-0.5">
                        {selectedFab.paymentTerms}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        Credit Limit
                      </div>
                      <div className="font-mono font-bold text-slate-900 mt-0.5">
                        {formatINR(selectedFab.creditLimit)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        Assigned Salesperson
                      </div>
                      <div className="font-semibold text-slate-800 mt-0.5">
                        {selectedFab.assignedSalespersonName}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        Dealer Relationship
                      </div>
                      {selectedFab.dealerId ? (
                        <button
                          onClick={() => navigateTo('dealers', selectedFab.dealerId)}
                          className="font-semibold text-red-600 hover:underline mt-0.5 text-left"
                        >
                          {selectedFab.dealerName} ({selectedFab.dealerId})
                        </button>
                      ) : (
                        <div className="text-slate-500 mt-0.5">Direct Plant Account</div>
                      )}
                    </div>
                  </div>

                  {/* Billing & Shipping Addresses */}
                  <div className="space-y-2">
                    <div className="p-2.5 rounded border border-slate-200">
                      <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>Billing Address (Workshop Shed)</span>
                      </div>
                      <div className="text-slate-700 mt-0.5">{selectedFab.billingAddress}</div>
                    </div>
                    <div className="p-2.5 rounded border border-slate-200">
                      <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500" />
                        <span>Shipping / Project Dispatch Address</span>
                      </div>
                      <div className="text-slate-700 mt-0.5">{selectedFab.shippingAddress}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCT REQUIREMENTS */}
              {detailTab === 'requirements' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      UPVC PROFILES REQUESTED BY FABRICATOR
                    </span>
                    <button
                      onClick={() => setAddingReq(!addingReq)}
                      className="px-2.5 py-1 bg-red-600 text-white rounded text-[11px] font-semibold"
                    >
                      + Add Requirement
                    </button>
                  </div>

                  {addingReq && (
                    <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500">
                            Profile
                          </label>
                          <select
                            value={reqProfileCode}
                            onChange={(e) => setReqProfileCode(e.target.value)}
                            className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.code}>
                                {p.code} — {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500">
                            Monthly Qty (Meters)
                          </label>
                          <input
                            type="number"
                            value={reqMonthlyQty}
                            onChange={(e) => setReqMonthlyQty(Number(e.target.value))}
                            className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500">
                          Project / Site Name
                        </label>
                        <input
                          type="text"
                          value={reqSite}
                          onChange={(e) => setReqSite(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setAddingReq(false)}
                          className="px-2.5 py-1 border border-slate-300 rounded bg-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            addFabricatorRequirement(
                              selectedFab.id,
                              reqProfileCode,
                              reqMonthlyQty,
                              reqSite
                            );
                            setAddingReq(false);
                          }}
                          className="px-3 py-1 bg-slate-900 text-white font-semibold rounded"
                        >
                          Save Requirement
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedFab.requirements.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 border border-dashed border-slate-200 rounded">
                      No recurring profile requirements logged yet. Click "+ Add Requirement" above.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedFab.requirements.map((req) => (
                        <div
                          key={req.id}
                          className="p-2.5 rounded border border-slate-200 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-mono font-bold text-slate-900">
                              {req.profileCode} •{' '}
                              <span className="font-sans font-semibold text-slate-700">
                                {req.profileName}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Color: {req.color} • Site: {req.projectSite}
                            </div>
                          </div>
                          <div className="text-right font-mono font-bold text-red-600">
                            {req.monthlyQuantityMeters.toLocaleString('en-IN')} m/mo
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: QUOTATIONS */}
              {detailTab === 'quotations' && (
                <div className="space-y-2">
                  {fabQuotations.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">No quotations for this fabricator.</div>
                  ) : (
                    fabQuotations.map((qt) => (
                      <button
                        key={qt.id}
                        onClick={() => navigateTo('quotations', qt.id)}
                        className="w-full p-2.5 rounded border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left"
                      >
                        <div>
                          <div className="font-mono font-bold text-slate-900">{qt.id}</div>
                          <div className="text-[11px] text-slate-500">
                            {qt.createdAt} • Valid till {qt.validUntil}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-slate-900">
                            {formatINR(qt.grandTotal)}
                          </div>
                          <span className="text-[10px] font-semibold text-amber-700">{qt.status}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: ORDERS */}
              {detailTab === 'orders' && (
                <div className="space-y-2">
                  {fabOrders.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">No sales orders yet.</div>
                  ) : (
                    fabOrders.map((so) => (
                      <button
                        key={so.id}
                        onClick={() => navigateTo('orders', so.id)}
                        className="w-full p-2.5 rounded border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left"
                      >
                        <div>
                          <div className="font-mono font-bold text-red-600">{so.id}</div>
                          <div className="text-[11px] text-slate-500">
                            Stage: {so.workflowStage} • Due {so.expectedDate}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-slate-900">
                            {formatINR(so.orderValue)}
                          </div>
                          <span className="text-[10px] text-slate-500">{so.paymentStatus}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* TAB 5: PAYMENTS */}
              {detailTab === 'payments' && (
                <div className="space-y-2">
                  {fabPayments.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">No payment records found.</div>
                  ) : (
                    fabPayments.map((pay) => (
                      <button
                        key={pay.id}
                        onClick={() => navigateTo('payments', pay.id)}
                        className="w-full p-2.5 rounded border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left"
                      >
                        <div>
                          <div className="font-mono font-bold text-slate-900">
                            {pay.invoiceNo} ({pay.orderId})
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {pay.lastPaymentMethod} • {pay.referenceNo}
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <div className="text-emerald-700 font-bold">
                            Paid: {formatINR(pay.paidAmount)}
                          </div>
                          <div className="text-red-600 text-[11px]">
                            Bal: {formatINR(pay.outstandingAmount)}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* TAB 6: ACTIVITY */}
              {detailTab === 'activity' && (
                <div className="space-y-2">
                  {selectedFab.timeline.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">No recent activity logged.</div>
                  ) : (
                    selectedFab.timeline.map((item) => (
                      <div key={item.id} className="p-2.5 rounded bg-slate-50 border border-slate-200">
                        <div className="font-semibold text-slate-900">{item.title}</div>
                        {item.description && (
                          <div className="text-[11px] text-slate-600 mt-0.5">{item.description}</div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-1">
                          {item.timestamp} • By {item.actor}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
