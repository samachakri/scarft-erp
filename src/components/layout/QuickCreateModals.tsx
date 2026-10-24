import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { LeadCustomerType, LeadSource, PaymentMethod } from '../../types/erp';

export const QuickCreateModals: React.FC = () => {
  const {
    quickCreateModal,
    setQuickCreateModal,
    createLead,
    createFabricator,
    createDealer,
    createSalesOrder,
    stockInRawMaterial,
    createProductionOrder,
    recordPayment,
    fabricators,
    dealers,
    products,
    rawMaterials,
    salesOrders,
    navigateTo,
  } = useERP();

  // Lead State
  const [leadName, setLeadName] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadPhone, setLeadPhone] = useState('+91 98290 ');
  const [leadLocation, setLeadLocation] = useState('Jaipur, Rajasthan');
  const [leadSource, setLeadSource] = useState<LeadSource>('WhatsApp');
  const [leadType, setLeadType] = useState<LeadCustomerType>('Fabricator');
  const [leadProfile, setLeadProfile] = useState('SCF-FR-60');
  const [leadReq, setLeadReq] = useState('');

  // Fabricator State
  const [fabName, setFabName] = useState('');
  const [fabContact, setFabContact] = useState('');
  const [fabPhone, setFabPhone] = useState('+91 98290 ');
  const [fabEmail, setFabEmail] = useState('');
  const [fabGstin, setFabGstin] = useState('08AAACR9921F1Z5');
  const [fabCity, setFabCity] = useState('Jaipur');
  const [fabState, setFabState] = useState('Rajasthan');
  const [fabDealerId, setFabDealerId] = useState(dealers[0]?.id || 'DLR-1042');
  const [fabAddress, setFabAddress] = useState('RIICO Industrial Area, Phase II');

  // Dealer State
  const [dlrName, setDlrName] = useState('');
  const [dlrContact, setDlrContact] = useState('');
  const [dlrPhone, setDlrPhone] = useState('+91 98110 ');
  const [dlrLocation, setDlrLocation] = useState('Gurugram, HR');
  const [dlrTerritory, setDlrTerritory] = useState('Delhi NCR');

  // Order State
  const [orderFabId, setOrderFabId] = useState(fabricators[0]?.id || 'FAB-2041');
  const [orderProdId, setOrderProdId] = useState(products[0]?.id || 'PRD-001');
  const [orderQty, setOrderQty] = useState(2000);

  // Stock Entry State
  const [stockMatId, setStockMatId] = useState(rawMaterials[0]?.id || 'MAT-001');
  const [stockQty, setStockQty] = useState(1000);
  const [stockNotes, setStockNotes] = useState('Received fresh batch against Purchase Order');

  // Production Order State
  const [poProdId, setPoProdId] = useState(products[0]?.id || 'PRD-001');
  const [poOrderId, setPoOrderId] = useState(salesOrders[0]?.id || 'SO-2026-1082');
  const [poQty, setPoQty] = useState(2000);
  const [poLine, setPoLine] = useState('Extruder Line 02 (KraussMaffei KM-65)');

  // Payment State
  const [payOrderId, setPayOrderId] = useState(salesOrders[0]?.id || 'SO-2026-1082');
  const [payAmount, setPayAmount] = useState(250000);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Bank Transfer');
  const [payRef, setPayRef] = useState('NEFT-HDFC8829104');

  if (!quickCreateModal) return null;

  const closeModal = () => setQuickCreateModal(null);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-tight uppercase">
            {quickCreateModal === 'lead' && '+ Add New Inbound Lead'}
            {quickCreateModal === 'fabricator' && '+ Register New Fabricator Customer'}
            {quickCreateModal === 'dealer' && '+ Onboard Regional Dealer'}
            {quickCreateModal === 'order' && '+ Create Direct Sales Order'}
            {quickCreateModal === 'stock' && '+ Raw Material Stock Inward (GRN)'}
            {quickCreateModal === 'production' && '+ Schedule Extrusion Production Order'}
            {quickCreateModal === 'payment' && '+ Record Customer Payment Receipt'}
          </h3>
          <button onClick={closeModal} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 text-xs space-y-3.5">
          {quickCreateModal === 'lead' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company / Firm Name *</label>
                  <input
                    type="text"
                    value={leadCompany}
                    onChange={(e) => setLeadCompany(e.target.value)}
                    placeholder="e.g. Aravalli Windows Systems"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="e.g. Rajesh Verma"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City & State</label>
                  <input
                    type="text"
                    value={leadLocation}
                    onChange={(e) => setLeadLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lead Source</label>
                  <select
                    value={leadSource}
                    onChange={(e) => setLeadSource(e.target.value as LeadSource)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-md bg-white font-medium"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Organic">Organic</option>
                    <option value="Referral / Phone">Referral / Phone</option>
                    <option value="Walk-in / Expo">Walk-in / Expo</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Type</label>
                  <select
                    value={leadType}
                    onChange={(e) => setLeadType(e.target.value as LeadCustomerType)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-md bg-white"
                  >
                    <option value="Fabricator">Fabricator</option>
                    <option value="Dealer">Dealer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Profile</label>
                  <select
                    value={leadProfile}
                    onChange={(e) => setLeadProfile(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-md bg-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.code}>
                        {p.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Profile Requirements & Notes</label>
                <textarea
                  rows={2}
                  value={leadReq}
                  onChange={(e) => setLeadReq(e.target.value)}
                  placeholder="Specify profile meterage, color, project details..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button onClick={closeModal} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const created = createLead({
                      name: leadName || 'Vikramaditya Singh',
                      companyName: leadCompany || 'Royal Heritage uPVC Windows',
                      phone: leadPhone,
                      location: leadLocation,
                      source: leadSource,
                      customerType: leadType,
                      interestedProfiles: [leadProfile],
                      requirements: leadReq || `Inquiry for 2,000 meters of ${leadProfile}`,
                    });
                    closeModal();
                    navigateTo('leads', created.id);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md"
                >
                  Save Lead
                </button>
              </div>
            </>
          )}

          {quickCreateModal === 'fabricator' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded p-2.5 text-[11px] text-blue-900">
                <strong>Business Rule:</strong> Fabricators are SCraft's primary B2B customers. Managed internally by SCraft employees (no external customer login).
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fabricator Company Name *</label>
                  <input
                    type="text"
                    value={fabName}
                    onChange={(e) => setFabName(e.target.value)}
                    placeholder="e.g. Pinnacle uPVC Windows Pvt Ltd"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    value={fabContact}
                    onChange={(e) => setFabContact(e.target.value)}
                    placeholder="e.g. Manish Agarwal"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    value={fabPhone}
                    onChange={(e) => setFabPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={fabEmail}
                    onChange={(e) => setFabEmail(e.target.value)}
                    placeholder="owner@fabricator.in"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={fabGstin}
                    onChange={(e) => setFabGstin(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={fabCity}
                    onChange={(e) => setFabCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={fabState}
                    onChange={(e) => setFabState(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Associated Dealer</label>
                  <select
                    value={fabDealerId}
                    onChange={(e) => setFabDealerId(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-md bg-white"
                  >
                    {dealers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Workshop Billing & Shipping Address</label>
                <input
                  type="text"
                  value={fabAddress}
                  onChange={(e) => setFabAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button onClick={closeModal} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const created = createFabricator({
                      name: fabName || 'Shree Balaji uPVC Windows',
                      contactPerson: fabContact || 'Anil Khandelwal',
                      phone: fabPhone,
                      email: fabEmail || 'info@balajiupvc.in',
                      gstin: fabGstin,
                      city: fabCity,
                      state: fabState,
                      dealerId: fabDealerId,
                      billingAddress: `${fabAddress}, ${fabCity}, ${fabState}`,
                      shippingAddress: `${fabAddress}, ${fabCity}, ${fabState}`,
                    });
                    closeModal();
                    navigateTo('fabricators', created.id);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md"
                >
                  Create Fabricator
                </button>
              </div>
            </>
          )}

          {quickCreateModal === 'dealer' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dealer Firm Name *</label>
                  <input
                    type="text"
                    value={dlrName}
                    onChange={(e) => setDlrName(e.target.value)}
                    placeholder="e.g. Rajasthan Fenestration Traders"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    value={dlrContact}
                    onChange={(e) => setDlrContact(e.target.value)}
                    placeholder="e.g.Mahendra Jain"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={dlrPhone}
                    onChange={(e) => setDlrPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={dlrLocation}
                    onChange={(e) => setDlrLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Territory</label>
                  <input
                    type="text"
                    value={dlrTerritory}
                    onChange={(e) => setDlrTerritory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button onClick={closeModal} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const created = createDealer({
                      name: dlrName || 'Metro uPVC Channel Partners',
                      contactPerson: dlrContact || 'Suresh Gupta',
                      phone: dlrPhone,
                      location: dlrLocation,
                      territory: dlrTerritory,
                    });
                    closeModal();
                    navigateTo('dealers', created.id);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md"
                >
                  Save Dealer
                </button>
              </div>
            </>
          )}

          {quickCreateModal === 'order' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Fabricator Customer *</label>
                <select
                  value={orderFabId}
                  onChange={(e) => setOrderFabId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                >
                  {fabricators.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.id} — {f.name} ({f.location})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">UPVC Profile / Product *</label>
                  <select
                    value={orderProdId}
                    onChange={(e) => setOrderProdId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.name} (₹{p.sellingPrice}/{p.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity (meters/pcs) *</label>
                  <input
                    type="number"
                    value={orderQty}
                    onChange={(e) => setOrderQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button onClick={closeModal} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const prod = products.find((p) => p.id === orderProdId) || products[0];
                    const so = createSalesOrder({
                      fabricatorId: orderFabId,
                      expectedDate: '15 Oct 2026',
                      items: [{ productId: prod.id, quantity: orderQty, rate: prod.sellingPrice }],
                    });
                    closeModal();
                    navigateTo('orders', so.id);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md"
                >
                  Create Sales Order
                </button>
              </div>
            </>
          )}

          {quickCreateModal === 'stock' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Raw Material *</label>
                <select
                  value={stockMatId}
                  onChange={(e) => setStockMatId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                >
                  {rawMaterials.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      {rm.code} — {rm.name} (Avail: {rm.availableQuantity} {rm.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inward Quantity (kg/meters) *</label>
                <input
                  type="number"
                  value={stockQty}
                  onChange={(e) => setStockQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">GRN / Supplier Challan Notes</label>
                <input
                  type="text"
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button onClick={closeModal} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    stockInRawMaterial(stockMatId, stockQty, stockNotes);
                    closeModal();
                    navigateTo('raw_materials', stockMatId);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md"
                >
                  Confirm Stock Inward
                </button>
              </div>
            </>
          )}

          {quickCreateModal === 'production' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">UPVC Profile to Extrude *</label>
                <select
                  value={poProdId}
                  onChange={(e) => setPoProdId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                >
                  {products
                    .filter((p) => p.itemType === 'UPVC Profile')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.name} ({p.color})
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Linked Sales Order</label>
                  <select
                    value={poOrderId}
                    onChange={(e) => setPoOrderId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                  >
                    <option value="">Stock Replenishment (No Order)</option>
                    {salesOrders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.id} — {o.fabricatorName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Required Quantity (meters) *</label>
                  <input
                    type="number"
                    value={poQty}
                    onChange={(e) => setPoQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Extruder Line</label>
                <select
                  value={poLine}
                  onChange={(e) => setPoLine(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                >
                  <option value="Extruder Line 01 (KraussMaffei KM-65)">Extruder Line 01 (KraussMaffei KM-65)</option>
                  <option value="Extruder Line 02 (KraussMaffei KM-65)">Extruder Line 02 (KraussMaffei KM-65)</option>
                  <option value="Extruder Line 03 (Cincinnati Twin)">Extruder Line 03 (Cincinnati Twin)</option>
                  <option value="Extruder Line 04 + Lamination">Extruder Line 04 + Lamination</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button onClick={closeModal} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const po = createProductionOrder({
                      orderId: poOrderId || undefined,
                      productId: poProdId,
                      requiredQuantity: poQty,
                      dueDate: '12 Oct 2026',
                      extruderLine: poLine,
                    });
                    closeModal();
                    navigateTo('production', po.id);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md"
                >
                  Schedule Production Order
                </button>
              </div>
            </>
          )}

          {quickCreateModal === 'payment' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Sales Order *</label>
                <select
                  value={payOrderId}
                  onChange={(e) => setPayOrderId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                >
                  {salesOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id} — {o.fabricatorName} (Total: ₹{o.orderValue.toLocaleString('en-IN')}, Paid: ₹{o.paidAmount.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount Received (₹) *</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">UTR / Cheque / Reference Number *</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button onClick={closeModal} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const order = salesOrders.find((o) => o.id === payOrderId) || salesOrders[0];
                    const rec = recordPayment({
                      fabricatorId: order.fabricatorId,
                      orderId: order.id,
                      amount: payAmount,
                      method: payMethod,
                      referenceNo: payRef,
                    });
                    closeModal();
                    navigateTo('payments', rec.id);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md"
                >
                  Record Payment
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
