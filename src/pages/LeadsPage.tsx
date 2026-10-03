import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  MessageSquare,
  Phone,
  Globe,
  UserPlus,
  FileText,
  Calendar,
  CheckCircle2,
  X,
  ArrowUpDown,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { LeadStatus } from '../types/erp';

export const LeadsPage: React.FC = () => {
  const {
    leads,
    employees,
    selectedRecordId,
    setSelectedRecordId,
    simulateWhatsAppLead,
    setQuickCreateModal,
    updateLeadStatus,
    assignLead,
    addLeadFollowUp,
    convertLeadToFabricator,
    navigateTo,
  } = useERP();

  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [assignedFilter, setAssignedFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'id' | 'companyName' | 'estimatedMonthlyMt'>('id');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Follow-up input state
  const [followUpText, setFollowUpText] = useState('');
  const [followUpDate, setFollowUpDate] = useState('05 Oct 2026, 11:00 AM');

  const filteredLeads = useMemo(() => {
    return leads
      .filter((l) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          l.id.toLowerCase().includes(q) ||
          l.name.toLowerCase().includes(q) ||
          l.companyName.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q);
        const matchesSource = sourceFilter === 'ALL' || l.source === sourceFilter;
        const matchesType = typeFilter === 'ALL' || l.customerType === typeFilter;
        const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
        const matchesAssigned = assignedFilter === 'ALL' || l.assignedEmployeeId === assignedFilter;
        return matchesSearch && matchesSource && matchesType && matchesStatus && matchesAssigned;
      })
      .sort((a, b) => {
        if (sortBy === 'companyName') return a.companyName.localeCompare(b.companyName);
        if (sortBy === 'estimatedMonthlyMt') return b.estimatedMonthlyMt - a.estimatedMonthlyMt;
        return b.id.localeCompare(a.id);
      });
  }, [leads, search, sourceFilter, typeFilter, statusFilter, assignedFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const paginatedLeads = filteredLeads.slice((page - 1) * pageSize, page * pageSize);

  const selectedLead =
    leads.find((l) => l.id === selectedRecordId) || paginatedLeads[0] || leads[0];

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'WhatsApp':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Website':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Facebook':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Instagram':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'Phone':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'New':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Contacted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Qualified':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Quotation':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Converted':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Lost':
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">Leads & Inbound Inquiries</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                n8n WhatsApp Sync Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Qualify inbound fabricator & dealer inquiries and convert qualified fabricators into active customer accounts.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const created = simulateWhatsAppLead();
              setSelectedRecordId(created.id);
              setPage(1);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Simulate WhatsApp Lead</span>
          </button>
          <button
            onClick={() => setQuickCreateModal('lead')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Lead</span>
          </button>
        </div>
      </div>

      {/* Status KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
        {(['New', 'Contacted', 'Qualified', 'Quotation', 'Converted', 'Lost'] as LeadStatus[]).map(
          (st) => {
            const count = leads.filter((l) => l.status === st).length;
            const active = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(active ? 'ALL' : st);
                  setPage(1);
                }}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  active
                    ? 'bg-red-50 border-red-400 ring-1 ring-red-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {st}
                </div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-1">{count}</div>
              </button>
            );
          }
        )}
      </div>

      {/* Filters Bar */}
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
            placeholder="Search by Lead ID, firm name, contact, phone, city..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:border-red-500"
          />
        </div>

        <select
          value={sourceFilter}
          onChange={(e) => {
            setSourceFilter(e.target.value);
            setPage(1);
          }}
          className="px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
        >
          <option value="ALL">Source: All Sources</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Website">Website</option>
          <option value="Facebook">Facebook</option>
          <option value="Instagram">Instagram</option>
          <option value="Phone">Phone</option>
          <option value="Manual">Manual</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
        >
          <option value="ALL">Customer Type: All</option>
          <option value="Fabricator">Fabricator</option>
          <option value="Dealer">Dealer</option>
          <option value="Other">Other</option>
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
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Quotation">Quotation</option>
          <option value="Converted">Converted</option>
          <option value="Lost">Lost</option>
        </select>

        <select
          value={assignedFilter}
          onChange={(e) => {
            setAssignedFilter(e.target.value);
            setPage(1);
          }}
          className="px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
        >
          <option value="ALL">Assigned: All Reps</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>

        <button
          onClick={() =>
            setSortBy((prev) =>
              prev === 'id' ? 'companyName' : prev === 'companyName' ? 'estimatedMonthlyMt' : 'id'
            )
          }
          className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-700"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Sort: {sortBy === 'id' ? 'Newest' : sortBy === 'companyName' ? 'Name' : 'Volume'}</span>
        </button>
      </div>

      {/* Main Split View: Table (7 cols) + Lead Detail Drawer (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Leads Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                  <th className="py-2.5 px-3">Lead ID</th>
                  <th className="py-2.5 px-3">Name & Firm</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Assigned</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLeads.map((lead) => {
                  const isSelected = selectedLead?.id === lead.id;
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedRecordId(lead.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-red-50/70 border-l-3 border-l-red-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{lead.id}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{lead.companyName}</div>
                        <div className="text-[11px] text-slate-500">
                          {lead.name} • {lead.location}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-700">{lead.phone}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-semibold ${getSourceBadge(
                            lead.source
                          )}`}
                        >
                          {lead.source}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-700">{lead.customerType}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{lead.assignedEmployeeName}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-bold ${getStatusBadge(
                            lead.status
                          )}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-500">
                        <div>{lead.createdAt}</div>
                        <div className="text-[10px] text-slate-400">Last: {lead.lastContact}</div>
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
              {Math.min(page * pageSize, filteredLeads.length)} of {filteredLeads.length} leads
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

        {/* Right: Persistent Lead Detail Panel (5 cols) */}
        {selectedLead && (
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            {/* Top Status Strip */}
            <div className="px-4 py-2.5 bg-red-50 border-b border-red-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-bold text-red-800">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span>VIEWING LEAD • {selectedLead.id}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getStatusBadge(
                  selectedLead.status
                )}`}
              >
                {selectedLead.status}
              </span>
            </div>

            <div className="p-4 space-y-4 text-xs">
              {/* Title & Primary Actions */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{selectedLead.companyName}</h2>
                    <p className="text-xs text-slate-500">
                      Contact: {selectedLead.name} • {selectedLead.customerType} Inquiry
                    </p>
                  </div>
                  <select
                    value={selectedLead.status}
                    onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value as LeadStatus)}
                    className="px-2 py-1 border border-slate-300 rounded text-[11px] font-semibold bg-white"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Quotation">Quotation</option>
                    <option value="Converted">Converted</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                {/* Primary Conversion & Quotation Actions */}
                <div className="grid grid-cols-2 gap-2.5 mt-3">
                  {selectedLead.convertedFabricatorId ? (
                    <button
                      onClick={() => navigateTo('fabricators', selectedLead.convertedFabricatorId)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-emerald-600 text-white font-semibold cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>View Fabricator ({selectedLead.convertedFabricatorId})</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const fab = convertLeadToFabricator(selectedLead.id);
                        if (fab) {
                          navigateTo('fabricators', fab.id);
                        }
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Convert to Fabricator</span>
                    </button>
                  )}

                  <button
                    onClick={() => navigateTo('quotations', 'CREATE_NEW')}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Create Quotation</span>
                  </button>
                </div>
              </div>

              {/* Customer Info Grid */}
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Phone</div>
                  <div className="font-mono font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{selectedLead.phone}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Email</div>
                  <div className="font-medium text-slate-800 mt-0.5 truncate">{selectedLead.email}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Location</div>
                  <div className="font-medium text-slate-800 mt-0.5">{selectedLead.location}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Assigned Employee</div>
                  <select
                    value={selectedLead.assignedEmployeeId}
                    onChange={(e) => assignLead(selectedLead.id, e.target.value)}
                    className="mt-0.5 w-full px-2 py-1 bg-white border border-slate-200 rounded text-[11px] font-semibold"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Inbound Source & Requirements */}
              <div className="p-3 rounded-md border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    INBOUND SOURCE & REQUIREMENTS
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getSourceBadge(
                      selectedLead.source
                    )}`}
                  >
                    {selectedLead.source}
                  </span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed">{selectedLead.requirements}</p>
                {selectedLead.whatsappMessage && (
                  <div className="p-2.5 rounded bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-950">
                    <div className="font-bold text-[10px] uppercase text-emerald-700 mb-0.5">
                      n8n WhatsApp Payload Message:
                    </div>
                    "{selectedLead.whatsappMessage}"
                  </div>
                )}
              </div>

              {/* Interested Profiles */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    INTERESTED UPVC PROFILES
                  </span>
                  <span className="text-[11px] font-mono font-bold text-red-600">
                    Est. Demand: {selectedLead.estimatedMonthlyMt} MT/mo
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLead.interestedProfiles.map((code) => (
                    <button
                      key={code}
                      onClick={() => navigateTo('products', null)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 font-mono text-[11px] font-semibold text-slate-800"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Follow-up */}
              <div className="pt-2 border-t border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-2">
                  FOLLOW-UPS & NOTES ({selectedLead.followUps.length})
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={followUpText}
                    onChange={(e) => setFollowUpText(e.target.value)}
                    placeholder="Add follow-up note or sample dispatch..."
                    className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded text-xs"
                  />
                  <button
                    onClick={() => {
                      if (!followUpText.trim()) return;
                      addLeadFollowUp(selectedLead.id, followUpText, followUpDate);
                      setFollowUpText('');
                    }}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
                {selectedLead.followUps.map((fu) => (
                  <div
                    key={fu.id}
                    className="p-2.5 rounded bg-slate-50 border-l-3 border-l-red-500 mb-1.5 text-[11px]"
                  >
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-red-600" />
                      <span>{fu.date}</span>
                    </div>
                    <div className="text-slate-600 mt-0.5">{fu.summary}</div>
                  </div>
                ))}
              </div>

              {/* Activity Timeline */}
              <div className="pt-2 border-t border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-2">
                  ACTIVITY TIMELINE
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedLead.timeline.map((item) => (
                    <div key={item.id} className="flex items-start gap-2 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-red-600 mt-1 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800">{item.timestamp}</span> •{' '}
                        <span className="font-medium text-slate-900">{item.title}</span>
                        {item.description && (
                          <div className="text-slate-500 text-[10px]">{item.description}</div>
                        )}
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
