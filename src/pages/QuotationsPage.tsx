import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  FileText,
  CheckCircle2,
  XCircle,
  Copy,
  Send,
  Download,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatINR, formatNumberIN, getPermissionsForRole, formatBundlesText } from '../services/rbac';
import { QuotationItem, QuotationStatus } from '../types/erp';

export const QuotationsPage: React.FC = () => {
  const {
    quotations,
    fabricators,
    products,
    currentEmployee,
    selectedRecordId,
    setSelectedRecordId,
    createQuotation,
    submitQuotationForApproval,
    approveQuotation,
    rejectQuotation,
    duplicateQuotation,
    convertQuotationToOrder,
    navigateTo,
    showToast,
  } = useERP();

  const permissions = getPermissionsForRole(currentEmployee.role);

  const [isCreating, setIsCreating] = useState(selectedRecordId === 'CREATE_NEW');

  useEffect(() => {
    if (selectedRecordId === 'CREATE_NEW') {
      setIsCreating(true);
    }
  }, [selectedRecordId]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);

  // ==========================
  // QUOTATION BUILDER STATE (Steps 1 to 5)
  // ==========================
  const [builderFabId, setBuilderFabId] = useState(fabricators[0]?.id || 'FAB-2041');
  const [builderGstType, setBuilderGstType] = useState<'CGST_SGST' | 'IGST'>('CGST_SGST');
  const [builderItems, setBuilderItems] = useState<
    {
      id: string;
      productId: string;
      description?: string;
      quantity: number;
      rate: number;
      discountPercent: number;
    }[]
  >([
    {
      id: 'LINE-1',
      productId: 'PRD-001',
      description: 'Frame Profile (Casement 60mm 4-Chamber) (White)',
      quantity: 2000,
      rate: 182,
      discountPercent: 0,
    },
    {
      id: 'LINE-2',
      productId: 'PRD-009',
      description: 'Double Glazing Bead 24mm DGU Acoustic (White)',
      quantity: 1200,
      rate: 49,
      discountPercent: 0,
    },
  ]);
  const [builderPaymentTerms, setBuilderPaymentTerms] = useState('Net 30 Days');
  const [builderDelivery, setBuilderDelivery] = useState('5-7 Working Days ex-Bhiwadi Plant');
  const [builderValidity, setBuilderValidity] = useState('20 Oct 2026');
  const [builderTransport, setBuilderTransport] = useState(8500);
  const [builderNotes, setBuilderNotes] = useState(
    'All UPVC profiles supplied in standard 6-meter bars with SCraft UV protective film.'
  );

  const selectedBuilderFab =
    fabricators.find((f) => f.id === builderFabId) || fabricators[0];

  // Auto-calculate builder line items and GST summary
  const computedBuilderLines: QuotationItem[] = builderItems.map((line) => {
    const prod = products.find((p) => p.id === line.productId) || products[0];
    const gross = line.quantity * line.rate;
    const discAmt = (gross * line.discountPercent) / 100;
    const taxable = gross - discAmt;
    const gstAmt = (taxable * prod.gstPercent) / 100;
    const total = taxable + gstAmt;
    return {
      id: line.id,
      productId: prod.id,
      profileCode: prod.code,
      description:
        line.description !== undefined && line.description !== ''
          ? line.description
          : `${prod.name} (${prod.color})`,
      quantity: line.quantity,
      unit: prod.unit,
      rate: line.rate,
      discountPercent: line.discountPercent,
      gstPercent: prod.gstPercent,
      taxableAmount: Number(taxable.toFixed(2)),
      gstAmount: Number(gstAmt.toFixed(2)),
      totalAmount: Number(total.toFixed(2)),
    };
  });

  const subtotal = computedBuilderLines.reduce((s, l) => s + l.quantity * l.rate, 0);
  const discountTotal = computedBuilderLines.reduce(
    (s, l) => s + (l.quantity * l.rate * l.discountPercent) / 100,
    0
  );
  const taxableAmount = subtotal - discountTotal;
  const totalGst = computedBuilderLines.reduce((s, l) => s + l.gstAmount, 0);
  const cgstAmount = builderGstType === 'CGST_SGST' ? Number((totalGst / 2).toFixed(2)) : 0;
  const sgstAmount = builderGstType === 'CGST_SGST' ? Number((totalGst / 2).toFixed(2)) : 0;
  const igstAmount = builderGstType === 'IGST' ? Number(totalGst.toFixed(2)) : 0;
  const exactTotal = taxableAmount + totalGst + builderTransport;
  const grandTotal = Math.round(exactTotal);
  const roundOff = Number((grandTotal - exactTotal).toFixed(2));

  const handleSaveQuotation = (targetStatus: QuotationStatus) => {
    const created = createQuotation({
      fabricatorId: selectedBuilderFab.id,
      fabricatorName: selectedBuilderFab.name,
      dealerId: selectedBuilderFab.dealerId,
      createdBy: currentEmployee.name,
      items: computedBuilderLines,
      subtotal,
      discountTotal,
      taxableAmount,
      gstType: builderGstType,
      cgstAmount,
      sgstAmount,
      igstAmount,
      transportCharges: builderTransport,
      roundOff,
      grandTotal,
      validUntil: builderValidity,
      paymentTerms: builderPaymentTerms,
      deliveryTimeline: builderDelivery,
      notes: builderNotes,
      status: targetStatus,
    });
    setIsCreating(false);
    setSelectedRecordId(created.id);
  };

  // Filtered Quotations for Table
  const filteredQuotations = quotations.filter((qt) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      qt.id.toLowerCase().includes(q) ||
      qt.fabricatorName.toLowerCase().includes(q) ||
      qt.createdBy.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || qt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedQuotation = selectedRecordId
    ? quotations.find((q) => q.id === selectedRecordId) || null
    : null;

  const getStatusStyle = (st: QuotationStatus) => {
    switch (st) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending Approval':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Draft':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Sent':
      case 'Viewed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Rejected':
      case 'Expired':
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  // ====================================================
  // RENDER QUOTATION BUILDER VIEW (Section 16)
  // ====================================================
  if (isCreating) {
    return (
      <div className="space-y-5">
        <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsCreating(false);
                setSelectedRecordId(quotations[0]?.id || null);
              }}
              className="p-2 rounded border border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Create Commercial UPVC Quotation
              </h1>
              <p className="text-xs text-slate-500">
                5-Step Quotation Builder with automatic GST (CGST/SGST/IGST) calculation & approval workflow.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSaveQuotation('Draft')}
              className="px-3.5 py-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSaveQuotation('Pending Approval')}
              className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-xs font-semibold text-white cursor-pointer"
            >
              Submit for Approval
            </button>
          </div>
        </div>

        {/* STEP 1: SELECT FABRICATOR */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold uppercase tracking-wider text-red-600">
              STEP 1: SELECT FABRICATOR CUSTOMER
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Tax Mode:</span>
              <select
                value={builderGstType}
                onChange={(e) => setBuilderGstType(e.target.value as 'CGST_SGST' | 'IGST')}
                className="px-2 py-1 border border-slate-300 rounded font-semibold bg-white"
              >
                <option value="CGST_SGST">Intra-State (9% CGST + 9% SGST)</option>
                <option value="IGST">Inter-State (18% IGST)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Select Fabricator *
              </label>
              <select
                value={builderFabId}
                onChange={(e) => {
                  const id = e.target.value;
                  setBuilderFabId(id);
                  const f = fabricators.find((fab) => fab.id === id);
                  if (f) {
                    setBuilderPaymentTerms(f.paymentTerms);
                    setBuilderGstType(f.state === 'Rajasthan' ? 'CGST_SGST' : 'IGST');
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white font-semibold"
              >
                {fabricators.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.id} — {f.name} ({f.location})
                  </option>
                ))}
              </select>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold uppercase text-slate-400">
                Contact, Phone & GSTIN
              </div>
              <div className="font-bold text-slate-900 mt-0.5">
                {selectedBuilderFab.contactPerson} • {selectedBuilderFab.phone}
              </div>
              <div className="font-mono text-[11px] text-slate-600 mt-0.5">
                GSTIN: {selectedBuilderFab.gstin} • Terms: {selectedBuilderFab.paymentTerms}
              </div>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold uppercase text-slate-400">
                Billing & Shipping Address
              </div>
              <div className="text-[11px] text-slate-700 mt-0.5 truncate">
                <strong>Bill:</strong> {selectedBuilderFab.billingAddress}
              </div>
              <div className="text-[11px] text-slate-600 truncate">
                <strong>Ship:</strong> {selectedBuilderFab.shippingAddress}
              </div>
            </div>
          </div>
        </div>

        {/* STEP 2: ADD PRODUCTS */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold uppercase tracking-wider text-red-600">
              STEP 2: ADD UPVC PROFILES & ACCESSORIES
            </span>
            <button
              onClick={() => {
                const defaultProd = products[1] || products[0];
                setBuilderItems((prev) => [
                  ...prev,
                  {
                    id: `LINE-${Date.now()}`,
                    productId: defaultProd.id,
                    description: `${defaultProd.name} (${defaultProd.color})`,
                    quantity: 1200,
                    rate: defaultProd.sellingPrice || 194,
                    discountPercent: 0,
                  },
                ]);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-2.5 text-center w-28">Quantity</th>
                  <th className="py-2.5 px-2 text-center">Unit</th>
                  <th className="py-2.5 px-2.5 text-center w-28">Rate (₹)</th>
                  <th className="py-2.5 px-2.5 text-center w-24">Discount %</th>
                  <th className="py-2.5 px-2 text-center">GST</th>
                  <th className="py-2.5 px-3 text-right">Amount (Incl. GST)</th>
                  <th className="py-2.5 px-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {builderItems.map((line, index) => {
                  const computed = computedBuilderLines[index];
                  return (
                    <tr key={line.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 min-w-[280px]">
                        <div className="space-y-1">
                          {/* Manual editable Description input */}
                          <input
                            type="text"
                            value={
                              line.description !== undefined
                                ? line.description
                                : computed.description
                            }
                            onChange={(e) => {
                              const newDesc = e.target.value;
                              setBuilderItems((prev) =>
                                prev.map((item) =>
                                  item.id === line.id ? { ...item, description: newDesc } : item
                                )
                              );
                            }}
                            placeholder="Write or edit description manually..."
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium text-slate-900 bg-white focus:outline-none focus:border-red-500 text-xs shadow-2xs"
                          />

                          {/* Select accordingly the product that the dashboard had */}
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">
                              Product:
                            </span>
                            <select
                              value={line.productId}
                              onChange={(e) => {
                                const newProd = products.find((p) => p.id === e.target.value);
                                if (newProd) {
                                  setBuilderItems((prev) =>
                                    prev.map((item) =>
                                      item.id === line.id
                                        ? {
                                            ...item,
                                            productId: e.target.value,
                                            description: `${newProd.name} (${newProd.color})`,
                                            rate: newProd.sellingPrice || item.rate,
                                          }
                                        : item
                                    )
                                  );
                                }
                              }}
                              className="w-full px-2 py-0.5 border border-slate-200 rounded bg-slate-50 text-[11px] font-mono text-slate-700 hover:bg-white focus:outline-none focus:border-red-500"
                            >
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.code} — {p.name} ({p.color}) • ₹{p.sellingPrice}/{p.unit}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-2.5 text-center">
                        <input
                          type="number"
                          min={1}
                          value={line.quantity}
                          onChange={(e) =>
                            setBuilderItems((prev) =>
                              prev.map((item) =>
                                item.id === line.id
                                  ? { ...item, quantity: Math.max(1, Number(e.target.value)) }
                                  : item
                              )
                            )
                          }
                          className="w-24 px-2 py-1.5 border border-slate-300 rounded font-mono font-bold text-center bg-white shadow-2xs"
                        />
                      </td>

                      <td className="py-2.5 px-2 text-center font-mono text-slate-600">
                        {computed.unit}
                      </td>

                      <td className="py-2.5 px-2.5 text-center">
                        <input
                          type="number"
                          min={1}
                          value={line.rate}
                          onChange={(e) =>
                            setBuilderItems((prev) =>
                              prev.map((item) =>
                                item.id === line.id
                                  ? { ...item, rate: Math.max(1, Number(e.target.value)) }
                                  : item
                              )
                            )
                          }
                          className="w-24 px-2 py-1.5 border border-slate-300 rounded font-mono font-bold text-center bg-white shadow-2xs"
                        />
                      </td>

                      <td className="py-2.5 px-2.5 text-center">
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={line.discountPercent}
                          onChange={(e) =>
                            setBuilderItems((prev) =>
                              prev.map((item) =>
                                item.id === line.id
                                  ? {
                                      ...item,
                                      discountPercent: Math.max(0, Number(e.target.value)),
                                    }
                                  : item
                              )
                            )
                          }
                          className="w-20 px-2 py-1.5 border border-slate-300 rounded font-mono text-center bg-white shadow-2xs"
                        />
                      </td>

                      <td className="py-2.5 px-2 text-center font-mono text-slate-600">
                        {computed.gstPercent}%
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                        {formatINR(computed.totalAmount)}
                      </td>

                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          disabled={builderItems.length <= 1}
                          onClick={() =>
                            setBuilderItems((prev) => prev.filter((i) => i.id !== line.id))
                          }
                          className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer rounded hover:bg-red-50"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* STEP 3 & STEP 4: PRICING SUMMARY + COMMERCIAL TERMS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
          {/* Step 4: Terms (7 cols) */}
          <div className="lg:col-span-7 bg-white p-4 rounded-lg border border-slate-200 space-y-3">
            <div className="font-bold uppercase tracking-wider text-red-600 border-b border-slate-100 pb-2">
              STEP 4: COMMERCIAL & DISPATCH TERMS
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Terms</label>
                <input
                  type="text"
                  value={builderPaymentTerms}
                  onChange={(e) => setBuilderPaymentTerms(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Delivery Timeline
                </label>
                <input
                  type="text"
                  value={builderDelivery}
                  onChange={(e) => setBuilderDelivery(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quotation Validity
                </label>
                <input
                  type="text"
                  value={builderValidity}
                  onChange={(e) => setBuilderValidity(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Transport / Freight Charges (₹)
                </label>
                <input
                  type="number"
                  value={builderTransport}
                  onChange={(e) => setBuilderTransport(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Commercial Notes & Extrusion Conditions
              </label>
              <textarea
                rows={2}
                value={builderNotes}
                onChange={(e) => setBuilderNotes(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
            </div>
          </div>

          {/* Step 3: Pricing Summary (5 cols) */}
          <div className="lg:col-span-5 bg-white p-4 rounded-lg border border-slate-200 space-y-2.5">
            <div className="font-bold uppercase tracking-wider text-red-600 border-b border-slate-100 pb-2">
              STEP 3 & 5: PRICING SUMMARY & REVIEW
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-slate-600">
                <span className="font-sans">Subtotal:</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span className="font-sans">Discount:</span>
                <span>-{formatINR(discountTotal)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-900 pt-1 border-t border-slate-100">
                <span className="font-sans">Taxable Amount:</span>
                <span>{formatINR(taxableAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-sans">CGST (9%):</span>
                <span>{formatINR(cgstAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-sans">SGST (9%):</span>
                <span>{formatINR(sgstAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-sans">IGST (18%):</span>
                <span>{formatINR(igstAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-sans">Transport Charges:</span>
                <span>{formatINR(builderTransport)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="font-sans">Round Off:</span>
                <span>₹{roundOff}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-red-600 pt-2 border-t-2 border-slate-200">
                <span className="font-sans">Grand Total:</span>
                <span>{formatINR(grandTotal)}</span>
              </div>
            </div>

            <div className="pt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSaveQuotation('Draft')}
                className="py-2 px-3 rounded border border-slate-300 hover:bg-slate-50 font-semibold text-slate-700 cursor-pointer"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSaveQuotation('Pending Approval')}
                className="py-2 px-3 rounded bg-red-600 hover:bg-red-700 font-semibold text-white cursor-pointer"
              >
                Submit for Approval
              </button>
              <button
                onClick={() => handleSaveQuotation('Sent')}
                className="py-2 px-3 rounded bg-slate-900 hover:bg-slate-800 font-semibold text-white cursor-pointer"
              >
                Save & Send to Fabricator
              </button>
              <button
                onClick={() => {
                  showToast('Generated GST Tax Quotation PDF preview', 'info');
                  window.print();
                }}
                className="py-2 px-3 rounded border border-slate-300 hover:bg-slate-50 font-semibold text-slate-700 cursor-pointer"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // RENDER QUOTATIONS LIST + APPROVAL WORKFLOW PANEL
  // ====================================================
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Quotations & Commercial Approvals</h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              {quotations.filter((q) => q.status === 'Pending Approval').length} PENDING APPROVAL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Create UPVC profile quotations for Fabricators, route through Sales Manager approval, and convert approved quotations into Sales Orders.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Create Quotation</span>
        </button>
      </div>

      {/* 7 KPI Cards (Section 15) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {(
          [
            'Draft',
            'Pending Approval',
            'Sent',
            'Viewed',
            'Approved',
            'Rejected',
            'Expired',
          ] as QuotationStatus[]
        ).map((st) => {
          const count = quotations.filter((q) => q.status === st).length;
          const active = statusFilter === st;
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(active ? 'ALL' : st)}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                active
                  ? 'bg-red-50 border-red-400 ring-1 ring-red-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                {st}
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">{count}</div>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Quotation ID (QT-2026-00421), Fabricator name, salesperson..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:border-red-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
        >
          <option value="ALL">Status: All</option>
          <option value="Draft">Draft</option>
          <option value="Pending Approval">Pending Approval</option>
          <option value="Sent">Sent</option>
          <option value="Viewed">Viewed</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Expired">Expired</option>
        </select>
      </div>

      {/* Split View: Quotations Table (Full width or 7 cols when selected) + Quotation Approval & Detail Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className={`${selectedQuotation ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white border border-slate-200 rounded-lg overflow-hidden transition-all duration-200`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                  <th className="py-2.5 px-3">Quotation ID</th>
                  <th className="py-2.5 px-3">Fabricator</th>
                  <th className="py-2.5 px-2.5">Created By</th>
                  <th className="py-2.5 px-2.5 text-right">Amount</th>
                  <th className="py-2.5 px-2.5 text-right">GST</th>
                  <th className="py-2.5 px-2.5 text-right">Total</th>
                  <th className="py-2.5 px-2.5">Valid Until</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotations.map((qt) => {
                  const isSelected = selectedQuotation?.id === qt.id;
                  const gstSum = qt.cgstAmount + qt.sgstAmount + qt.igstAmount;
                  return (
                    <tr
                      key={qt.id}
                      onClick={() => setSelectedRecordId(qt.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-red-50/70 border-l-3 border-l-red-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-red-600">{qt.id}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{qt.fabricatorName}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {qt.fabricatorId} • {qt.createdAt}
                        </div>
                      </td>
                      <td className="py-3 px-2.5 text-slate-700">{qt.createdBy}</td>
                      <td className="py-3 px-2.5 text-right font-mono text-slate-700">
                        {formatINR(qt.taxableAmount)}
                      </td>
                      <td className="py-3 px-2.5 text-right font-mono text-slate-500">
                        {formatINR(gstSum)}
                      </td>
                      <td className="py-3 px-2.5 text-right font-mono font-bold text-slate-900">
                        {formatINR(qt.grandTotal)}
                      </td>
                      <td className="py-3 px-2.5 text-[11px] text-slate-600">{qt.validUntil}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusStyle(
                            qt.status
                          )}`}
                        >
                          {qt.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Quotation Approval & Detail Panel */}
        {selectedQuotation && (
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between text-[11px] font-bold">
              <span>QUOTATION • {selectedQuotation.id}</span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusStyle(
                    selectedQuotation.status
                  )}`}
                >
                  {selectedQuotation.status}
                </span>
                <button
                  onClick={() => setSelectedRecordId(null)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Close side panel"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <button
                    onClick={() => navigateTo('fabricators', selectedQuotation.fabricatorId)}
                    className="text-base font-bold text-slate-900 hover:text-red-600 text-left"
                  >
                    {selectedQuotation.fabricatorName}
                  </button>
                  <p className="text-[11px] text-slate-500">
                    Fabricator ID: <span className="font-mono">{selectedQuotation.fabricatorId}</span> •
                    Created by {selectedQuotation.createdBy}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Grand Total</div>
                  <div className="text-base font-bold font-mono text-red-600">
                    {formatINR(selectedQuotation.grandTotal)}
                  </div>
                </div>
              </div>

              {/* Approval Workflow Action Bar (Section 17) */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  QUOTATION APPROVAL & CONVERSION WORKFLOW
                </div>

                {selectedQuotation.status === 'Draft' && (
                  <button
                    onClick={() => submitQuotationForApproval(selectedQuotation.id)}
                    className="w-full py-2 px-3 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer"
                  >
                    Submit Quotation for Sales Manager Approval
                  </button>
                )}

                {selectedQuotation.status === 'Pending Approval' && (
                  <>
                    {permissions.canApproveQuotation ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveQuotation(selectedQuotation.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve Quotation</span>
                          </button>
                          <button
                            onClick={() => setShowRejectBox(!showRejectBox)}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                        {showRejectBox && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Enter rejection / change request reason..."
                              className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                            />
                            <button
                              onClick={() => {
                                rejectQuotation(
                                  selectedQuotation.id,
                                  rejectReason || 'Pricing revision requested by Sales Manager'
                                );
                                setShowRejectBox(false);
                              }}
                              className="px-3 py-1.5 bg-slate-900 text-white rounded font-semibold"
                            >
                              Confirm
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2 text-[11px]">
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          <strong>Role Restriction:</strong> {currentEmployee.role} cannot approve their own quotation. Switch role to <strong>Sales Manager</strong> or <strong>Super Admin</strong> in the top bar to approve.
                        </span>
                      </div>
                    )}
                  </>
                )}

                {selectedQuotation.status === 'Approved' && (
                  <div className="space-y-2">
                    {selectedQuotation.convertedOrderId ? (
                      <button
                        onClick={() => navigateTo('orders', selectedQuotation.convertedOrderId)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-slate-900 text-white font-semibold cursor-pointer"
                      >
                        <ShoppingCart className="w-4 h-4 text-emerald-400" />
                        <span>View Converted Sales Order ({selectedQuotation.convertedOrderId})</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const order = convertQuotationToOrder(selectedQuotation.id);
                          if (order) {
                            navigateTo('orders', order.id);
                          }
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs cursor-pointer"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Convert Approved Quotation to Sales Order</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Secondary Actions: Edit, Duplicate, Send, Download PDF */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => {
                      const dup = duplicateQuotation(selectedQuotation.id);
                      if (dup) setSelectedRecordId(dup.id);
                    }}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={() =>
                      showToast(`Quotation ${selectedQuotation.id} sent to ${selectedQuotation.fabricatorName}`, 'success')
                    }
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                  <button
                    onClick={() => {
                      showToast(`Downloading PDF for ${selectedQuotation.id}`, 'info');
                      window.print();
                    }}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                  QUOTED UPVC PROFILES ({selectedQuotation.items.length} ITEMS)
                </div>
                <div className="border border-slate-200 rounded-md overflow-hidden divide-y divide-slate-100">
                  {selectedQuotation.items.map((item) => (
                    <div key={item.id} className="p-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-mono font-bold text-slate-900">
                          {item.profileCode} •{' '}
                          <span className="font-sans font-medium text-slate-700">
                            {item.description}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {formatNumberIN(item.quantity)} {item.unit} ({formatBundlesText(item.quantity)}) × ₹{item.rate} (Disc:{' '}
                          {item.discountPercent}%, GST: {item.gstPercent}%)
                        </div>
                      </div>
                      <div className="font-mono font-bold text-slate-900">
                        {formatINR(item.totalAmount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GST Breakdown */}
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Amount:</span>
                  <span>{formatINR(selectedQuotation.taxableAmount)}</span>
                </div>
                {selectedQuotation.gstType === 'CGST_SGST' ? (
                  <>
                    <div className="flex justify-between text-slate-600">
                      <span>CGST (9%):</span>
                      <span>{formatINR(selectedQuotation.cgstAmount)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>SGST (9%):</span>
                      <span>{formatINR(selectedQuotation.sgstAmount)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-slate-600">
                    <span>IGST (18%):</span>
                    <span>{formatINR(selectedQuotation.igstAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Transport Charges:</span>
                  <span>{formatINR(selectedQuotation.transportCharges)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 text-xs pt-1 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span>{formatINR(selectedQuotation.grandTotal)}</span>
                </div>
              </div>

              {/* Visible Activity Timeline */}
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                  APPROVAL & ACTIVITY TIMELINE
                </div>
                <div className="space-y-1.5">
                  {selectedQuotation.timeline.map((t) => (
                    <div key={t.id} className="text-[11px] flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600 mt-1 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900">{t.title}</span>
                        <div className="text-[10px] text-slate-500">
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
