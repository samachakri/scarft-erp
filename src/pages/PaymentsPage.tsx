import React, { useState } from 'react';
import {
  Search,
  Plus,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatINR, formatINRCompact } from '../services/rbac';
import { PaymentMethod, PaymentRecordStatus } from '../types/erp';

export const PaymentsPage: React.FC = () => {
  const {
    payments,
    selectedRecordId,
    setSelectedRecordId,
    recordPayment,
    navigateTo,
  } = useERP();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Inline Record Payment form
  const [payAmount, setPayAmount] = useState(200000);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Bank Transfer');
  const [payRef, setPayRef] = useState('NEFT-HDFC0099182');
  const [showRecordBox, setShowRecordBox] = useState(false);

  // 4 Top KPIs (Section 21)
  const totalOutstanding = payments.reduce((s, p) => s + p.outstandingAmount, 0);
  const dueTodayAmount = payments
    .filter((p) => p.status === 'Due Today')
    .reduce((s, p) => s + p.outstandingAmount, 0);
  const overdueAmount = payments
    .filter((p) => p.status === 'Overdue')
    .reduce((s, p) => s + p.outstandingAmount, 0);
  const receivedThisMonth = payments.reduce((s, p) => s + p.paidAmount, 0);

  const filteredPayments = payments.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.id.toLowerCase().includes(q) ||
      p.fabricatorName.toLowerCase().includes(q) ||
      p.orderId.toLowerCase().includes(q) ||
      p.invoiceNo.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedPayment =
    payments.find((p) => p.id === selectedRecordId) ||
    filteredPayments[0] ||
    payments[0];

  const getBadge = (st: PaymentRecordStatus) => {
    switch (st) {
      case 'Paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Partially Paid':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Due Today':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Overdue':
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">
              Payments & Accounts Receivable Ledger
            </h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              GST INVOICING & COLLECTIONS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track fabricator invoice settlements, NEFT/RTGS/UPI receipts, credit aging, and overdue balances.
          </p>
        </div>
        <button
          onClick={() => {
            setShowRecordBox(true);
            if (selectedPayment) {
              setPayAmount(
                selectedPayment.outstandingAmount > 0
                  ? selectedPayment.outstandingAmount
                  : 100000
              );
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Record Payment</span>
        </button>
      </div>

      {/* 4 KPI Cards (Section 21) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Outstanding</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {formatINRCompact(totalOutstanding)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Across {payments.filter((p) => p.outstandingAmount > 0).length} open invoices
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-[10px] font-bold uppercase text-amber-700">Due Today</div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
            {formatINRCompact(dueTodayAmount)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {payments.filter((p) => p.status === 'Due Today').length} fabricator invoices
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-[10px] font-bold uppercase text-red-600">Overdue</div>
          <div className="text-2xl font-bold font-mono text-red-600 mt-1">
            {formatINRCompact(overdueAmount)}
          </div>
          <div className="text-[11px] text-red-600 font-medium mt-0.5">
            {payments.filter((p) => p.status === 'Overdue').length} accounts past credit period
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-[10px] font-bold uppercase text-emerald-700">
            Received This Month
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {formatINRCompact(receivedThisMonth)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
            Verified in Bank Ledger
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Fabricator, Order ID, Invoice No, or Payment ID..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:border-red-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
        >
          <option value="ALL">Status: All</option>
          <option value="Paid">Paid</option>
          <option value="Partially Paid">Partially Paid</option>
          <option value="Due Today">Due Today</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Split View: Table (7 cols) + Payment Detail Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                  <th className="py-2.5 px-3">Fabricator</th>
                  <th className="py-2.5 px-2.5">Order & Invoice</th>
                  <th className="py-2.5 px-2.5 text-right">Total Amount</th>
                  <th className="py-2.5 px-2.5 text-right">Paid</th>
                  <th className="py-2.5 px-2.5 text-right">Outstanding</th>
                  <th className="py-2.5 px-2.5">Due Date</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((pay) => {
                  const isSelected = selectedPayment?.id === pay.id;
                  return (
                    <tr
                      key={pay.id}
                      onClick={() => setSelectedRecordId(pay.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-red-50/70 border-l-3 border-l-red-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{pay.fabricatorName}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {pay.fabricatorId}
                        </div>
                      </td>
                      <td className="py-3 px-2.5">
                        <div className="font-mono font-bold text-red-600">{pay.orderId}</div>
                        <div className="text-[10px] font-mono text-slate-500">{pay.invoiceNo}</div>
                      </td>
                      <td className="py-3 px-2.5 text-right font-mono font-semibold text-slate-800">
                        {formatINR(pay.orderTotalAmount)}
                      </td>
                      <td className="py-3 px-2.5 text-right font-mono font-bold text-emerald-700">
                        {formatINR(pay.paidAmount)}
                      </td>
                      <td className="py-3 px-2.5 text-right font-mono font-bold text-red-600">
                        {formatINR(pay.outstandingAmount)}
                      </td>
                      <td className="py-3 px-2.5 text-[11px] text-slate-600">{pay.dueDate}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${getBadge(
                            pay.status
                          )}`}
                        >
                          {pay.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Payment Detail Panel (Section 21) */}
        {selectedPayment && (
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between text-[11px] font-bold">
              <span>PAYMENT LEDGER • {selectedPayment.id}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getBadge(
                  selectedPayment.status
                )}`}
              >
                {selectedPayment.status}
              </span>
            </div>

            <div className="p-4 space-y-4 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <button
                    onClick={() => navigateTo('fabricators', selectedPayment.fabricatorId)}
                    className="text-base font-bold text-slate-900 hover:text-red-600 text-left"
                  >
                    {selectedPayment.fabricatorName}
                  </button>
                  <p className="text-[11px] text-slate-500">
                    Order:{' '}
                    <button
                      onClick={() => navigateTo('orders', selectedPayment.orderId)}
                      className="font-mono font-semibold text-red-600 hover:underline"
                    >
                      {selectedPayment.orderId}
                    </button>{' '}
                    • Invoice: <span className="font-mono">{selectedPayment.invoiceNo}</span>
                  </p>
                </div>
                {selectedPayment.outstandingAmount > 0 && (
                  <button
                    onClick={() => {
                      setPayAmount(selectedPayment.outstandingAmount);
                      setShowRecordBox(!showRecordBox);
                    }}
                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                  >
                    Record Receipt
                  </button>
                )}
              </div>

              {showRecordBox && (
                <div className="p-3 rounded-md bg-emerald-50/70 border border-emerald-300 space-y-2.5">
                  <div className="font-bold text-emerald-950">
                    Record Payment for {selectedPayment.orderId}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-600">
                        Amount Received (₹)
                      </label>
                      <input
                        type="number"
                        value={payAmount}
                        onChange={(e) => setPayAmount(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-600">
                        Payment Method
                      </label>
                      <select
                        value={payMethod}
                        onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                      >
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI">UPI</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Cash">Cash</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600">
                      Reference / UTR / Cheque No
                    </label>
                    <input
                      type="text"
                      value={payRef}
                      onChange={(e) => setPayRef(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowRecordBox(false)}
                      className="px-3 py-1 border border-slate-300 rounded bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        recordPayment({
                          fabricatorId: selectedPayment.fabricatorId,
                          orderId: selectedPayment.orderId,
                          amount: payAmount,
                          method: payMethod,
                          referenceNo: payRef,
                        });
                        setShowRecordBox(false);
                      }}
                      className="px-3 py-1 bg-emerald-600 text-white font-semibold rounded"
                    >
                      Save Receipt
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Detail Attributes Grid */}
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Invoice Total Amount
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                    {formatINR(selectedPayment.orderTotalAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Amount Paid
                  </div>
                  <div className="font-mono font-bold text-emerald-700 text-sm mt-0.5">
                    {formatINR(selectedPayment.paidAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Balance Outstanding
                  </div>
                  <div className="font-mono font-bold text-red-600 text-sm mt-0.5">
                    {formatINR(selectedPayment.outstandingAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Due Date</div>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {selectedPayment.dueDate}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Payment Method
                  </div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {selectedPayment.lastPaymentMethod}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Reference Number
                  </div>
                  <div className="font-mono font-semibold text-slate-800 mt-0.5">
                    {selectedPayment.referenceNo}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Last Payment Date
                  </div>
                  <div className="text-slate-700 mt-0.5">{selectedPayment.paymentDate}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Recorded By</div>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {selectedPayment.recordedBy}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
