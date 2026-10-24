import React, { useState } from 'react';
import {
  Search,
  Plus,
  Handshake,
  Factory,
  Link2,
  Unlink,
  Phone,
  MapPin,
  FileText,
  ShoppingCart,
  ArrowDown,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatINR, formatINRCompact } from '../services/rbac';

export const DealersPage: React.FC = () => {
  const {
    dealers,
    fabricators,
    salesOrders,
    quotations,
    selectedRecordId,
    setSelectedRecordId,
    setQuickCreateModal,
    toggleDealerFabricator,
    navigateTo,
  } = useERP();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [linkFabSelect, setLinkFabSelect] = useState('');

  const filteredDealers = dealers.filter((d) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      d.id.toLowerCase().includes(q) ||
      d.name.toLowerCase().includes(q) ||
      d.contactPerson.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedDealer = selectedRecordId
    ? dealers.find((d) => d.id === selectedRecordId) || null
    : null;

  const associatedFabricators = fabricators.filter((f) =>
    selectedDealer?.fabricatorIds.includes(f.id)
  );
  const unlinkedFabricators = fabricators.filter(
    (f) => !selectedDealer?.fabricatorIds.includes(f.id)
  );

  const dealerOrders = salesOrders.filter((o) =>
    selectedDealer?.fabricatorIds.includes(o.fabricatorId)
  );
  const dealerQuotations = quotations.filter(
    (q) => q.dealerId === selectedDealer?.id || selectedDealer?.fabricatorIds.includes(q.fabricatorId)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Dealers Directory & Network</h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              CHANNEL RELATIONSHIPS • {dealers.length} REGIONAL DEALERS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dealers are channel partners associated with multiple Fabricators. Managed internally by SCraft employees.
          </p>
        </div>
        <button
          onClick={() => setQuickCreateModal('dealer')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Dealer</span>
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Dealers</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{dealers.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across RJ, GJ, HR, MP</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-[10px] font-bold uppercase text-slate-400">Active Network</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {dealers.filter((d) => d.status === 'Active').length}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Credit approved</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-[10px] font-bold uppercase text-slate-400">Associated Fabricators</div>
          <div className="text-2xl font-bold font-mono text-blue-700 mt-1">
            {fabricators.filter((f) => f.dealerId).length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Linked to regional dealers</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-[10px] font-bold uppercase text-slate-400">Allocated Tonnage</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {dealers.reduce((s, d) => s + d.totalVolumeMt, 0).toFixed(1)} MT/mo
          </div>
          <div className="text-[11px] text-red-600 font-medium mt-0.5">Extrusion capacity</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap items-center gap-2.5 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Dealer ID (DLR-1042), firm name, contact person, location..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:border-red-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
        >
          <option value="ALL">Status: All</option>
          <option value="Active">Active</option>
          <option value="Credit Hold">Credit Hold</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Split View: Dealer Table (Full width or 7 cols when selected) + Dealer Relationship Detail (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className={`${selectedDealer ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white border border-slate-200 rounded-lg overflow-hidden transition-all duration-200`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                  <th className="py-2.5 px-3">Dealer ID & Name</th>
                  <th className="py-2.5 px-3">Contact & Phone</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3 text-center">Fabricators</th>
                  <th className="py-2.5 px-3 text-center">Active Fabs</th>
                  <th className="py-2.5 px-3 text-center">Open Orders</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDealers.map((dlr) => {
                  const isSelected = selectedDealer?.id === dlr.id;
                  const linkedFabs = fabricators.filter((f) => dlr.fabricatorIds.includes(f.id));
                  const activeLinkedFabs = linkedFabs.filter((f) => f.status === 'Active').length;
                  return (
                    <tr
                      key={dlr.id}
                      onClick={() => setSelectedRecordId(dlr.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-red-50/70 border-l-3 border-l-red-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-red-600 text-[11px]">{dlr.id}</div>
                        <div className="font-bold text-slate-900">{dlr.name}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{dlr.contactPerson}</div>
                        <div className="font-mono text-[11px] text-slate-500">{dlr.phone}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-800">{dlr.location}</div>
                        <div className="text-[10px] text-slate-500">{dlr.territory}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                        {dlr.fabricatorIds.length} units
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                        {activeLinkedFabs} active
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-blue-700">
                        {dlr.openOrdersCount}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                            dlr.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : dlr.status === 'Credit Hold'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {dlr.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Dealer Detail & Fabricator Hierarchy Panel */}
        {selectedDealer && (
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between text-[11px] font-bold">
              <span>DEALER PROFILE • {selectedDealer.id}</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white">
                  Est. {selectedDealer.establishedYear}
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
                <h2 className="text-base font-bold text-slate-900">{selectedDealer.name}</h2>
                <p className="text-[11px] text-slate-500">
                  GSTIN: <span className="font-mono font-semibold">{selectedDealer.gstin}</span> •{' '}
                  Territory: {selectedDealer.territory}
                </p>
              </div>

              {/* Dealer Contact & Credit Card */}
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Contact Principal
                  </div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {selectedDealer.contactPerson}
                  </div>
                  <div className="font-mono text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{selectedDealer.phone}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Location & Rep
                  </div>
                  <div className="font-medium text-slate-800 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-500" />
                    <span>{selectedDealer.location}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    SCraft Rep: {selectedDealer.assignedSalespersonName}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Credit Limit</div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">
                    {formatINRCompact(selectedDealer.creditLimit)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Outstanding Ledger
                  </div>
                  <div className="font-mono font-bold text-red-600 mt-0.5">
                    {formatINRCompact(selectedDealer.outstandingAmount)}
                  </div>
                </div>
              </div>

              {/* Visual Relationship Hierarchy: Dealer -> Fabricator 1..N */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    DEALER → FABRICATOR HIERARCHY ({associatedFabricators.length} ASSOCIATED)
                  </span>
                </div>

                {/* Root Dealer Node */}
                <div className="p-2.5 rounded-md bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Handshake className="w-4 h-4 text-red-400" />
                    <div>
                      <div className="font-bold text-xs">{selectedDealer.name}</div>
                      <div className="text-[10px] text-slate-300">
                        {selectedDealer.id} • {selectedDealer.territory}
                      </div>
                    </div>
                  </div>
                  <ArrowDown className="w-4 h-4 text-red-400" />
                </div>

                {/* Associated Fabricator Nodes */}
                <div className="pl-4 border-l-2 border-red-300 space-y-2">
                  {associatedFabricators.map((fab, idx) => (
                    <div
                      key={fab.id}
                      className="p-2.5 rounded bg-white border border-slate-200 flex items-center justify-between shadow-2xs"
                    >
                      <button
                        onClick={() => navigateTo('fabricators', fab.id)}
                        className="text-left group"
                      >
                        <div className="font-bold text-slate-900 group-hover:text-red-600 flex items-center gap-1.5">
                          <Factory className="w-3.5 h-3.5 text-blue-600" />
                          <span>
                            Fabricator {idx + 1}: {fab.name}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {fab.id} • {fab.location} • Sales: {formatINRCompact(fab.totalSalesYtd)}
                        </div>
                      </button>
                      <button
                        onClick={() => toggleDealerFabricator(selectedDealer.id, fab.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Remove Fabricator Association"
                      >
                        <Unlink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add / Associate Another Fabricator Control */}
                <div className="pt-2 flex items-center gap-2">
                  <select
                    value={linkFabSelect}
                    onChange={(e) => setLinkFabSelect(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                  >
                    <option value="">+ Associate another Fabricator...</option>
                    {unlinkedFabricators.map((uf) => (
                      <option key={uf.id} value={uf.id}>
                        {uf.id} — {uf.name} ({uf.location})
                      </option>
                    ))}
                  </select>
                  <button
                    disabled={!linkFabSelect}
                    onClick={() => {
                      if (!linkFabSelect) return;
                      toggleDealerFabricator(selectedDealer.id, linkFabSelect);
                      setLinkFabSelect('');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 disabled:opacity-40 text-white font-semibold rounded cursor-pointer"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Link</span>
                  </button>
                </div>
              </div>

              {/* Performance & Sales Activity */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">Cluster Quotes</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                    {dealerQuotations.length}
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">Cluster Orders</div>
                  <div className="text-sm font-bold font-mono text-blue-700 mt-0.5">
                    {dealerOrders.length}
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">Cluster Revenue</div>
                  <div className="text-sm font-bold font-mono text-emerald-700 mt-0.5">
                    {formatINRCompact(dealerOrders.reduce((s, o) => s + o.orderValue, 0))}
                  </div>
                </div>
              </div>

              {/* Linked Orders List */}
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                  ACTIVE ORDERS ACROSS ASSOCIATED FABRICATORS
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {dealerOrders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => navigateTo('orders', o.id)}
                      className="w-full p-2 rounded border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-3.5 h-3.5 text-red-600" />
                        <div>
                          <div className="font-mono font-bold text-slate-900">{o.id}</div>
                          <div className="text-[10px] text-slate-500">{o.fabricatorName}</div>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-bold text-slate-900">{formatINR(o.orderValue)}</div>
                        <div className="text-[10px] text-slate-500">{o.workflowStage}</div>
                      </div>
                    </button>
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
