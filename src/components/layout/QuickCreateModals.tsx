import React, { useState } from 'react';
import { X, Sparkles, Layers, CheckCircle2, AlertCircle, Plus, Trash2, Flame } from 'lucide-react';
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
    createExtrusionSession,
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

  // Production Order & Chemical Compounding State
  const [poProfileName, setPoProfileName] = useState('3-Track Casement Window Frame (60mm Heavy Series)');
  const [poProfileCode, setPoProfileCode] = useState('SCF-CS-3T-60');
  const [poCustomColor, setPoCustomColor] = useState('White (Standard UV)');
  const [poCustomWeight, setPoCustomWeight] = useState(2.65);
  const [poOrderId, setPoOrderId] = useState(salesOrders[0]?.id || 'SO-2026-1082');
  const [poLine, setPoLine] = useState('Extruder Line 02 (KraussMaffei KM-65)');
  const [poCustomError, setPoCustomError] = useState('');

  // 3 to 5 Chemicals for the UPVC compounding batch
  const [poChemicals, setPoChemicals] = useState<{ id: string; name: string; quantityKg: number }[]>([
    { id: 'chem-1', name: 'UPVC Resin SG-5 / K-67', quantityKg: 2350 },
    { id: 'chem-2', name: 'Calcium Carbonate (CaCO3 Filler)', quantityKg: 450 },
    { id: 'chem-3', name: 'Rutile TiO2 (Titanium Dioxide R-902)', quantityKg: 75 },
    { id: 'chem-4', name: 'Ca-Zn Heat Stabilizer & Lubricant Pack', quantityKg: 65 },
    { id: 'chem-5', name: 'CPE 135A High Impact Modifier', quantityKg: 55 },
  ]);

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
      <div className={`bg-white border border-slate-200 rounded-lg shadow-2xl w-full ${quickCreateModal === 'production' ? 'max-w-2xl' : 'max-w-lg'} overflow-hidden max-h-[92vh] flex flex-col`}>
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
            const totalCompoundKg = poChemicals.reduce(
              (sum, c) => sum + (Number(c.quantityKg) || 0),
              0
            );
            const linearWeight = poCustomWeight > 0 ? poCustomWeight : 2.65;
            const calculatedOutputMeters =
              linearWeight > 0 ? Math.round(totalCompoundKg / linearWeight) : 0;

            const profilePresets = [
              { name: '3-Track Casement Window Frame (60mm Heavy)', code: 'SCF-CS-3T-60', weight: 2.65 },
              { name: '3-Track Sliding Villa Frame (112mm Heavy)', code: 'SCF-SL-112-3T', weight: 2.85 },
              { name: '2-Track Sliding Window Frame (78mm)', code: 'SCF-SL-78-2T', weight: 1.85 },
              { name: 'Casement Window Sash (60mm Z-Section)', code: 'SCF-CS-SASH-60', weight: 1.45 },
            ];

            const handleAddChemical = (name = '', qty = 50) => {
              setPoChemicals((prev) => [
                ...prev,
                { id: `c-${Date.now()}-${Math.floor(Math.random() * 1000)}`, name: name || 'New Chemical / Additive', quantityKg: qty },
              ]);
            };

            const handleUpdateName = (id: string, name: string) => {
              setPoChemicals((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
            };

            const handleUpdateKg = (id: string, qty: number) => {
              setPoChemicals((prev) => prev.map((c) => (c.id === id ? { ...c, quantityKg: Math.max(0, qty) } : c)));
            };

            const handleRemoveChemical = (id: string) => {
              if (poChemicals.length <= 1) return;
              setPoChemicals((prev) => prev.filter((c) => c.id !== id));
            };

            return (
              <>
                {/* Profile Information & Color */}
                <div className="space-y-3">
                  {/* Quick Profile Presets */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Quick Profile Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {profilePresets.map((pre) => (
                        <button
                          key={pre.code}
                          type="button"
                          onClick={() => {
                            setPoProfileName(pre.name);
                            setPoProfileCode(pre.code);
                            setPoCustomWeight(pre.weight);
                            setPoCustomError('');
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors cursor-pointer ${
                            poProfileName === pre.name
                              ? 'bg-red-50 text-red-700 border-red-300 font-bold'
                              : 'bg-slate-100 hover:bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          {pre.name.split('(')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Profile Name & Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        Name of the Profile *
                      </label>
                      <input
                        type="text"
                        value={poProfileName}
                        onChange={(e) => {
                          setPoProfileName(e.target.value);
                          setPoCustomError('');
                        }}
                        placeholder="e.g. 3-Track Casement Window Frame (60mm Heavy Series)"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        Profile Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={poProfileCode}
                        onChange={(e) => setPoProfileCode(e.target.value)}
                        placeholder="e.g. SCF-CS-3T-60"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white font-mono text-slate-800 text-xs focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  {/* Color Name (Manual Entry, No Dropdown) & Linear Weight */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        Color Name (Manual Entry) *
                      </label>
                      <input
                        type="text"
                        value={poCustomColor}
                        onChange={(e) => setPoCustomColor(e.target.value)}
                        placeholder="e.g. White, Off-White, Anthracite Grey, Walnut Wood Grain, Golden Oak"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        Linear Weight (kg/m) *
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        min="0.2"
                        max="8.0"
                        value={poCustomWeight}
                        onChange={(e) => setPoCustomWeight(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white font-mono text-slate-800 text-xs focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  {/* Extruder Line & Linked Sales Order */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        Extruder Line
                      </label>
                      <select
                        value={poLine}
                        onChange={(e) => setPoLine(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 text-xs font-medium focus:border-red-500 focus:outline-none"
                      >
                        <option value="Extruder Line 01 (KraussMaffei KM-65)">Extruder Line 01 (KraussMaffei KM-65)</option>
                        <option value="Extruder Line 02 (KraussMaffei KM-65)">Extruder Line 02 (KraussMaffei KM-65)</option>
                        <option value="Extruder Line 03 (Cincinnati Twin)">Extruder Line 03 (Cincinnati Twin)</option>
                        <option value="Extruder Line 04 (Cincinnati Milacron)">Extruder Line 04 (Cincinnati Milacron)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        Linked Sales Order (Optional)
                      </label>
                      <select
                        value={poOrderId}
                        onChange={(e) => setPoOrderId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 text-xs focus:border-red-500 focus:outline-none"
                      >
                        <option value="">Stock Replenishment (No Order)</option>
                        {salesOrders.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.id} — {o.fabricatorName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {poCustomError && (
                    <div className="p-2 bg-red-100 text-red-700 text-xs rounded border border-red-200 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{poCustomError}</span>
                    </div>
                  )}
                </div>

                {/* Dry Blend Compound Formulation: Chemical Name, Quantity (kg), + Add Chemical */}
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2">
                    <div>
                      <span className="font-bold uppercase tracking-wider text-slate-800 text-[11px] block">
                        Dry Blend Chemicals (Mix 3 to 5 Chemicals for Session)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Compounding mix formula required to produce this profile output.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddChemical('', 50)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] cursor-pointer self-start sm:self-auto transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Add Chemical</span>
                    </button>
                  </div>

                  {/* Chemicals Table */}
                  <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                          <th className="py-2 px-3">Chemical Name</th>
                          <th className="py-2 px-3 text-right w-36">Quantity (kg)</th>
                          <th className="py-2 px-2 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {poChemicals.map((chem) => (
                          <tr key={chem.id} className="hover:bg-slate-50/70">
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={chem.name}
                                onChange={(e) => handleUpdateName(chem.id, e.target.value)}
                                placeholder="Chemical Name (e.g. UPVC Resin SG-5)"
                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium text-slate-900 text-xs focus:border-red-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  value={chem.quantityKg}
                                  onChange={(e) => handleUpdateKg(chem.id, Number(e.target.value))}
                                  className="w-24 px-2 py-1.5 border border-slate-300 rounded bg-white text-right font-mono font-bold text-slate-900 text-xs focus:border-red-500 focus:outline-none"
                                />
                                <span className="font-semibold text-slate-600 text-xs">kg</span>
                              </div>
                            </td>
                            <td className="py-2 px-2 text-center">
                              {poChemicals.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveChemical(chem.id)}
                                  className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                                  title="Remove Chemical"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 1-Click Chemical Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] font-semibold text-slate-500">Quick Add:</span>
                    {[
                      { name: 'PE Wax Internal Lubricant', kg: 25 },
                      { name: 'ACR-401 Processing Aid', kg: 35 },
                      { name: 'Stearic Acid Ext. Lubricant', kg: 15 },
                      { name: 'Optical Brightener OB-1', kg: 3 },
                    ].map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleAddChemical(p.name, p.kg)}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-slate-200 text-[10px] font-medium text-slate-700 cursor-pointer transition-colors"
                      >
                        + {p.name} ({p.kg}kg)
                      </button>
                    ))}
                  </div>

                  {/* Clean Total Compound & Output Calculation Banner */}
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Total Dry Blend Compound Mix
                      </span>
                      <div className="font-mono font-bold text-red-600 text-base">
                        {totalCompoundKg.toLocaleString('en-IN')} kg
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Calculated Profile Output
                      </span>
                      <div className="font-mono font-bold text-emerald-700 text-base">
                        ~{calculatedOutputMeters.toLocaleString('en-IN')} meters ({poCustomWeight} kg/m)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!poProfileName.trim()) {
                        setPoCustomError('Please enter a name for the profile.');
                        return;
                      }
                      if (!poCustomColor.trim()) {
                        setPoCustomError('Please enter the color name.');
                        return;
                      }

                      const finalCode =
                        poProfileCode.trim() ||
                        `SCF-${poProfileName.slice(0, 8).toUpperCase().replace(/[^A-Z0-9]/g, '')}`;

                      const po = createProductionOrder({
                        orderId: poOrderId || undefined,
                        customProfileName: poProfileName.trim(),
                        customProfileCode: finalCode,
                        customColor: poCustomColor.trim(),
                        customWeightPerMeter: poCustomWeight,
                        requiredQuantity: calculatedOutputMeters,
                        dueDate: '15 Oct 2026',
                        extruderLine: poLine,
                      });

                      createExtrusionSession({
                        dieNumber: `DIE-${finalCode.replace('SCF-', '')}`,
                        customDieName: poProfileName.trim(),
                        customProfileCode: finalCode,
                        customWeightPerMeter: poCustomWeight,
                        customExtruderLine: poLine,
                        shift: 'Morning Shift (06:00 - 14:00)',
                        date: 'Today',
                        targetBundles: Math.max(1, Math.round(calculatedOutputMeters / 36)),
                        piecesPerSet: 6,
                        operatorName: 'Extrusion Floor Supervisor',
                        linkedOrderId: poOrderId || undefined,
                        notes: `Chemical Mix: ${poChemicals.map((c) => `${c.name}: ${c.quantityKg}kg`).join(', ')}`,
                        customFormulaMaterials: poChemicals.map((c) => ({
                          name: c.name,
                          quantityKg: c.quantityKg,
                        })),
                      });

                      closeModal();
                      navigateTo('production', po.id);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-xs cursor-pointer flex items-center gap-1.5 text-xs transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Schedule Extrusion Production Order</span>
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
