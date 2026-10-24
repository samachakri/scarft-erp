import React, { useState } from 'react';
import { X, Sparkles, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const [poProfileMode, setPoProfileMode] = useState<'catalog' | 'manual'>('catalog');
  const [poProdId, setPoProdId] = useState(products[0]?.id || 'PRD-001');
  const [poCustomName, setPoCustomName] = useState('');
  const [poCustomCode, setPoCustomCode] = useState('');
  const [poCustomCategory, setPoCustomCategory] = useState('Sliding Profile');
  const [poCustomColor, setPoCustomColor] = useState('White');
  const [poCustomWeight, setPoCustomWeight] = useState(1.45);
  const [poOrderId, setPoOrderId] = useState(salesOrders[0]?.id || 'SO-2026-1082');
  const [poQtyUnit, setPoQtyUnit] = useState<'meters' | 'sets'>('meters');
  const [poQty, setPoQty] = useState(2000);
  const [poBundles, setPoBundles] = useState(55);
  const [poLine, setPoLine] = useState('Extruder Line 02 (KraussMaffei KM-65)');
  const [poCustomError, setPoCustomError] = useState('');

  // Payment State
  const [payOrderId, setPayOrderId] = useState(salesOrders[0]?.id || 'SO-2026-1082');
  const [payAmount, setPayAmount] = useState(250000);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Bank Transfer');
  const [payRef, setPayRef] = useState('NEFT-HDFC8829104');

  if (!quickCreateModal) return null;

  const closeModal = () => {
    setQuickCreateModal(null);
    setPoCustomError('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className={`bg-white border border-slate-200 rounded-lg shadow-2xl w-full ${quickCreateModal === 'production' ? 'max-w-xl' : 'max-w-lg'} overflow-hidden max-h-[92vh] flex flex-col`}>
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
        <div className="p-5 text-xs space-y-3.5 overflow-y-auto flex-1">
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

          {quickCreateModal === 'production' && (() => {
            const selectedCatalogProd =
              products.find((p) => p.id === poProdId) ||
              products.find((p) => p.itemType === 'UPVC Profile') ||
              products[0];

            const effectiveWeightPerMeter =
              poProfileMode === 'manual'
                ? poCustomWeight > 0
                  ? poCustomWeight
                  : 1.45
                : selectedCatalogProd?.weightPerMeterKg || 1.45;

            const effectiveMeters =
              poQtyUnit === 'meters' ? Math.max(1, poQty) : Math.max(1, poBundles) * 36;
            const effectiveBundles =
              poQtyUnit === 'meters' ? Math.floor(poQty / 36) : poBundles;

            const estCompoundKg = effectiveMeters * effectiveWeightPerMeter;
            const estResinKg = Math.round(estCompoundKg * 0.78);
            const estCaCO3Kg = Math.round(estCompoundKg * 0.15);
            const estTiO2Kg = Math.round(estCompoundKg * 0.022);

            return (
              <>
                {/* Profile Selection / Manual Entry Toggle */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <label className="block font-bold text-slate-800">
                      UPVC Profile to Extrude *
                    </label>
                    <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-[11px] font-semibold self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setPoProfileMode('catalog');
                          setPoCustomError('');
                        }}
                        className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                          poProfileMode === 'catalog'
                            ? 'bg-white text-red-600 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        📋 Select from Catalog
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPoProfileMode('manual');
                          setPoCustomError('');
                        }}
                        className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                          poProfileMode === 'manual'
                            ? 'bg-white text-red-600 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        ✏️ Custom / New Profile Name
                      </button>
                    </div>
                  </div>

                  {poProfileMode === 'catalog' ? (
                    <div>
                      <select
                        value={poProdId}
                        onChange={(e) => setPoProdId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white font-medium text-slate-800 focus:outline-none focus:border-red-500"
                      >
                        {products
                          .filter((p) => p.itemType === 'UPVC Profile')
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.code} — {p.name} ({p.color})
                            </option>
                          ))}
                      </select>
                      {selectedCatalogProd && (
                        <div className="mt-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-1">
                          <span>
                            <strong>{selectedCatalogProd.category}</strong> • Weight:{' '}
                            <strong>{selectedCatalogProd.weightPerMeterKg} kg/m</strong>
                          </span>
                          <span className="font-mono text-slate-500">
                            Current Stock: {selectedCatalogProd.currentStock.toLocaleString('en-IN')} {selectedCatalogProd.unit}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50/50 border border-red-200 rounded-lg space-y-2.5">
                      <div className="flex items-center gap-1.5 text-red-800 font-semibold text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-red-600" />
                        <span>Custom Profile Extrusion / NPD Run (Manual Specification)</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Custom Profile / Product Name *
                        </label>
                        <input
                          type="text"
                          value={poCustomName}
                          onChange={(e) => {
                            setPoCustomName(e.target.value);
                            setPoCustomError('');
                          }}
                          placeholder="e.g. 3-Track Heavy Duty Sliding Frame (Custom 88mm Series)"
                          className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Profile Code / Reference (Optional)
                          </label>
                          <input
                            type="text"
                            value={poCustomCode}
                            onChange={(e) => setPoCustomCode(e.target.value)}
                            placeholder="e.g. SCF-CUST-88T"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Linear Weight (kg/meter) *
                          </label>
                          <input
                            type="number"
                            step="0.05"
                            min="0.2"
                            max="8.0"
                            value={poCustomWeight}
                            onChange={(e) => setPoCustomWeight(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white font-mono text-slate-800 focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Profile Category
                          </label>
                          <select
                            value={poCustomCategory}
                            onChange={(e) => setPoCustomCategory(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800"
                          >
                            <option value="Sliding Profile">Sliding Profile (2-Track / 3-Track)</option>
                            <option value="Frame Profile">Frame Profile (Casement 60mm)</option>
                            <option value="Sash Profile">Sash Profile (Door & Window)</option>
                            <option value="Mullion / Transom">Mullion / Transom</option>
                            <option value="Glazing Bead">Glazing Bead</option>
                            <option value="Custom Section">Custom Architectural Section</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Color / Foil Finish
                          </label>
                          <select
                            value={poCustomColor}
                            onChange={(e) => setPoCustomColor(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800"
                          >
                            <option value="White">White (Standard UV)</option>
                            <option value="Anthracite Grey">Anthracite Grey (Foil)</option>
                            <option value="Walnut Wood">Walnut Wood Grain</option>
                            <option value="Golden Oak">Golden Oak</option>
                            <option value="Dark Bronze">Dark Bronze</option>
                            <option value="Black">Architectural Black</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {poCustomError && (
                    <div className="p-2 bg-red-100 text-red-700 text-xs rounded border border-red-200 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{poCustomError}</span>
                    </div>
                  )}
                </div>

                {/* Linked Order & Extrusion Line */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Linked Sales Order
                    </label>
                    <select
                      value={poOrderId}
                      onChange={(e) => setPoOrderId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800"
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
                    <label className="block font-semibold text-slate-700 mb-1">
                      Assign Extruder Line
                    </label>
                    <select
                      value={poLine}
                      onChange={(e) => setPoLine(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800"
                    >
                      <option value="Extruder Line 01 (KraussMaffei KM-65)">
                        Extruder Line 01 (KraussMaffei KM-65)
                      </option>
                      <option value="Extruder Line 02 (KraussMaffei KM-65)">
                        Extruder Line 02 (KraussMaffei KM-65)
                      </option>
                      <option value="Extruder Line 03 (Cincinnati Twin)">
                        Extruder Line 03 (Cincinnati Twin)
                      </option>
                      <option value="Extruder Line 04 + Lamination">
                        Extruder Line 04 + Lamination
                      </option>
                    </select>
                  </div>
                </div>

                {/* Required Quantity with Meters / Sets of 6 Toggle */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800">
                      Required Production Quantity *
                    </label>
                    <div className="inline-flex items-center bg-white p-0.5 rounded border border-slate-300 text-[10px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setPoQtyUnit('meters')}
                        className={`px-2 py-0.5 rounded ${
                          poQtyUnit === 'meters'
                            ? 'bg-slate-900 text-white font-bold'
                            : 'text-slate-600'
                        }`}
                      >
                        Meters
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPoQtyUnit('sets');
                          setPoBundles(Math.max(1, Math.round(poQty / 36)));
                        }}
                        className={`px-2 py-0.5 rounded ${
                          poQtyUnit === 'sets'
                            ? 'bg-slate-900 text-white font-bold'
                            : 'text-slate-600'
                        }`}
                      >
                        Sets of 6 Pcs
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    {poQtyUnit === 'meters' ? (
                      <div>
                        <input
                          type="number"
                          step={10}
                          min={36}
                          value={poQty}
                          onChange={(e) => setPoQty(Number(e.target.value))}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white font-mono font-bold text-slate-900"
                        />
                        <div className="text-[11px] text-slate-500 mt-1">
                          = {effectiveBundles} Sets of 6 pcs ({effectiveBundles * 6} bars of 6m)
                          {poQty % 36 !== 0 ? ` + ${poQty % 36}m remaining` : ''}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            value={poBundles}
                            onChange={(e) => setPoBundles(Math.max(1, Number(e.target.value)))}
                            className="w-24 px-3 py-1.5 border border-slate-300 rounded-md bg-white font-mono font-bold text-slate-900"
                          />
                          <span className="font-semibold text-slate-700">Sets of 6 Pcs</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          = {effectiveMeters.toLocaleString('en-IN')} meters ({effectiveBundles * 6} bars)
                        </div>
                      </div>
                    )}

                    {/* Compound calculation badge */}
                    <div className="p-2 bg-white rounded border border-slate-200 text-[11px] font-mono space-y-0.5">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>Dry Blend Compound:</span>
                        <span className="text-red-600">{estCompoundKg.toLocaleString('en-IN')} kg</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Resin SG-5: {estResinKg}kg • CaCO3: {estCaCO3Kg}kg • TiO2: {estTiO2Kg}kg
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (poProfileMode === 'manual' && !poCustomName.trim()) {
                        setPoCustomError('Please enter a name for the custom profile.');
                        return;
                      }

                      const po = createProductionOrder({
                        orderId: poOrderId || undefined,
                        productId: poProfileMode === 'catalog' ? poProdId : undefined,
                        customProfileName:
                          poProfileMode === 'manual' ? poCustomName.trim() : undefined,
                        customProfileCode:
                          poProfileMode === 'manual' ? poCustomCode.trim() || undefined : undefined,
                        customColor: poProfileMode === 'manual' ? poCustomColor : undefined,
                        customCategory: poProfileMode === 'manual' ? poCustomCategory : undefined,
                        customWeightPerMeter:
                          poProfileMode === 'manual' ? poCustomWeight : undefined,
                        requiredQuantity: effectiveMeters,
                        dueDate: '12 Oct 2026',
                        extruderLine: poLine,
                      });
                      closeModal();
                      navigateTo('production', po.id);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Schedule Production Order</span>
                  </button>
                </div>
              </>
            );
          })()}

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
