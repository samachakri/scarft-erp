import React, { useState } from 'react';
import {
  Search,
  Plus,
  Truck,
  CheckCircle2,
  FileText,
  MapPin,
  Phone,
  X,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatNumberIN } from '../services/rbac';
import { DispatchStatus } from '../types/erp';

export const DispatchPage: React.FC = () => {
  const {
    dispatches,
    salesOrders,
    selectedRecordId,
    setSelectedRecordId,
    createDispatch,
    updateDispatchStatus,
    navigateTo,
    showToast,
  } = useERP();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [creatingModal, setCreatingModal] = useState(false);

  // New Dispatch Form
  const [dspOrderId, setDspOrderId] = useState(salesOrders[0]?.id || 'SO-2026-1082');
  const [dspAgency, setDspAgency] = useState('Jaipur Golden Heavy Transport');
  const [dspVehicle, setDspVehicle] = useState('RJ-14-GA-8821 (22ft Open)');
  const [dspDriver, setDspDriver] = useState('Ramlal Gurjar');
  const [dspPhone, setDspPhone] = useState('+91 94142 66109');
  const [dspExpected, setDspExpected] = useState('05 Oct 2026');

  const filteredDispatches = dispatches.filter((d) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      d.id.toLowerCase().includes(q) ||
      d.orderId.toLowerCase().includes(q) ||
      d.fabricatorName.toLowerCase().includes(q) ||
      d.vehicleNumber.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedDispatch = selectedRecordId
    ? dispatches.find((d) => d.id === selectedRecordId) || null
    : null;

  const getBadge = (st: DispatchStatus) => {
    switch (st) {
      case 'Ready to Dispatch':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Dispatched Today':
      case 'In Transit':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending':
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Dispatch & Logistics Management</h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              LOADING BAYS 1–4 • BHIWADI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate vehicle loading, Delivery Challans, E-Way Bills, Gatepasses, and transit tracking to fabricator sites.
          </p>
        </div>
        <button
          onClick={() => setCreatingModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Create Dispatch</span>
        </button>
      </div>

      {/* 5 Dispatch KPIs (Section 20) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(
          [
            'Ready to Dispatch',
            'Dispatched Today',
            'In Transit',
            'Delivered',
            'Pending',
          ] as DispatchStatus[]
        ).map((st) => {
          const count = dispatches.filter((d) => d.status === st).length;
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

      {/* Search */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Dispatch ID, Order ID, Fabricator, Vehicle No..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:border-red-500"
          />
        </div>
      </div>

      {/* Split View: Table (Full width or 7 cols when selected) + Dispatch Detail Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className={`${selectedDispatch ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white border border-slate-200 rounded-lg overflow-hidden transition-all duration-200`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                  <th className="py-2.5 px-3">Dispatch ID & Order</th>
                  <th className="py-2.5 px-3">Fabricator</th>
                  <th className="py-2.5 px-2.5">Items & Qty</th>
                  <th className="py-2.5 px-2.5">Transport & Vehicle</th>
                  <th className="py-2.5 px-2.5">Dates</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDispatches.map((dsp) => {
                  const isSelected = selectedDispatch?.id === dsp.id;
                  return (
                    <tr
                      key={dsp.id}
                      onClick={() => setSelectedRecordId(dsp.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-red-50/70 border-l-3 border-l-red-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-red-600">{dsp.id}</div>
                        <div className="text-[10px] font-mono text-slate-500">{dsp.orderId}</div>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">{dsp.fabricatorName}</td>
                      <td className="py-3 px-2.5">
                        <div className="font-mono font-semibold text-slate-800">
                          {formatNumberIN(dsp.totalQuantityMeters)} m
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                          {dsp.itemsSummary}
                        </div>
                      </td>
                      <td className="py-3 px-2.5">
                        <div className="font-mono text-[11px] font-semibold text-slate-800">
                          {dsp.vehicleNumber.split('(')[0]}
                        </div>
                        <div className="text-[10px] text-slate-500">{dsp.transportAgency}</div>
                      </td>
                      <td className="py-3 px-2.5 text-[11px] text-slate-600">
                        <div>Disp: {dsp.dispatchDate}</div>
                        <div className="text-[10px] text-slate-400">ETA: {dsp.expectedDelivery}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${getBadge(
                            dsp.status
                          )}`}
                        >
                          {dsp.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Dispatch Detail Panel */}
        {selectedDispatch && (
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between text-[11px] font-bold">
              <span>DISPATCH CONSIGNMENT • {selectedDispatch.id}</span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getBadge(
                    selectedDispatch.status
                  )}`}
                >
                  {selectedDispatch.status}
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
                <button
                  onClick={() => navigateTo('fabricators', selectedDispatch.fabricatorId)}
                  className="text-base font-bold text-slate-900 hover:text-red-600 text-left"
                >
                  {selectedDispatch.fabricatorName}
                </button>
                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{selectedDispatch.deliveryAddress}</span>
                </div>
              </div>

              {/* Actions: Mark Dispatched, Mark Delivered */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() =>
                    updateDispatchStatus(selectedDispatch.id, 'Dispatched Today')
                  }
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Mark Dispatched</span>
                </button>
                <button
                  onClick={() => updateDispatchStatus(selectedDispatch.id, 'Delivered')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Delivered</span>
                </button>
              </div>

              {/* Transport, Vehicle & Driver Info */}
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Sales Order & Qty
                  </div>
                  <button
                    onClick={() => navigateTo('orders', selectedDispatch.orderId)}
                    className="font-mono font-bold text-red-600 hover:underline mt-0.5"
                  >
                    {selectedDispatch.orderId}
                  </button>
                  <div className="font-mono text-slate-700">
                    {formatNumberIN(selectedDispatch.totalQuantityMeters)} meters
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Payment Clearance
                  </div>
                  <div className="font-bold text-emerald-700 mt-0.5">
                    {selectedDispatch.paymentStatus}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Transport & Vehicle
                  </div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">
                    {selectedDispatch.vehicleNumber}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {selectedDispatch.transportAgency}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Driver Contact
                  </div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {selectedDispatch.driverName}
                  </div>
                  <div className="font-mono text-[11px] text-slate-600 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{selectedDispatch.driverPhone}</span>
                  </div>
                </div>
              </div>

              {/* Items Summary */}
              <div className="p-3 rounded border border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                  ORDER ITEMS LOADED
                </div>
                <div className="font-medium text-slate-800">{selectedDispatch.itemsSummary}</div>
              </div>

              {/* Compliance & Gatepass Documents */}
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                  STATUTORY & PLANT DISPATCH DOCUMENTS
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Delivery Challan', val: selectedDispatch.documents.challanNo },
                    { label: 'GST Tax Invoice', val: selectedDispatch.documents.invoiceNo },
                    { label: 'E-Way Bill', val: selectedDispatch.documents.eWayBillNo },
                    { label: 'Plant Gatepass', val: selectedDispatch.documents.gatepassNo },
                  ].map((doc) => (
                    <button
                      key={doc.label}
                      onClick={() =>
                        showToast(`Opened ${doc.label} (${doc.val})`, 'info')
                      }
                      className="p-2 rounded border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left"
                    >
                      <div>
                        <div className="text-[10px] text-slate-400">{doc.label}</div>
                        <div className="font-mono font-bold text-slate-800 text-[11px]">
                          {doc.val}
                        </div>
                      </div>
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Dispatch Modal */}
      {creatingModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden text-xs">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between font-bold">
              <span>+ CREATE NEW DISPATCH CONSIGNMENT</span>
              <button onClick={() => setCreatingModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Sales Order *
                </label>
                <select
                  value={dspOrderId}
                  onChange={(e) => setDspOrderId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded bg-white"
                >
                  {salesOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id} — {o.fabricatorName} ({o.status})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Transport Agency *
                </label>
                <input
                  type="text"
                  value={dspAgency}
                  onChange={(e) => setDspAgency(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Vehicle Number *
                  </label>
                  <input
                    type="text"
                    value={dspVehicle}
                    onChange={(e) => setDspVehicle(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Expected Delivery
                  </label>
                  <input
                    type="text"
                    value={dspExpected}
                    onChange={(e) => setDspExpected(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={dspDriver}
                    onChange={(e) => setDspDriver(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Driver Phone</label>
                  <input
                    type="text"
                    value={dspPhone}
                    onChange={(e) => setDspPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setCreatingModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const created = createDispatch({
                      orderId: dspOrderId,
                      transportAgency: dspAgency,
                      vehicleNumber: dspVehicle,
                      driverName: dspDriver,
                      driverPhone: dspPhone,
                      expectedDelivery: dspExpected,
                    });
                    setSelectedRecordId(created.id);
                    setCreatingModal(false);
                  }}
                  className="px-4 py-1.5 bg-red-600 text-white font-semibold rounded"
                >
                  Create Dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
