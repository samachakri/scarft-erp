import React, { useState } from 'react';
import {
  Search,
  Package,
  Layers,
  Calculator,
  IndianRupee,
  Edit3,
  Check,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatNumberIN, formatBundlesText } from '../services/rbac';

export const ProductsPage: React.FC = () => {
  const {
    products,
    boms,
    selectedRecordId,
    setSelectedRecordId,
    updateProductPrice,
    navigateTo,
  } = useERP();

  const [activeTab, setActiveTab] = useState<
    'profiles' | 'accessories' | 'pricing' | 'bom'
  >('profiles');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [colorFilter, setColorFilter] = useState('ALL');

  // Inline pricing editor state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempSellPrice, setTempSellPrice] = useState(182);
  const [tempDealerPrice, setTempDealerPrice] = useState(164);

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'profiles' && p.itemType !== 'UPVC Profile') return false;
    if (activeTab === 'accessories' && p.itemType !== 'Accessory') return false;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.code.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesColor = colorFilter === 'ALL' || p.color === colorFilter;
    return matchesSearch && matchesCat && matchesColor;
  });

  const selectedProduct = selectedRecordId
    ? products.find((p) => p.id === selectedRecordId || p.code === selectedRecordId) || null
    : null;

  const selectedBom = selectedProduct
    ? boms.find((b) => b.productId === selectedProduct.id || b.profileCode === selectedProduct.code) || boms[0]
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Products — UPVC Profiles & Catalog</h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {products.filter((p) => p.itemType === 'UPVC Profile').length} PROFILES •{' '}
              {products.filter((p) => p.itemType === 'Accessory').length} ACCESSORIES
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Technical UPVC profile specifications, linear weight (kg/m), selling & dealer pricing, GST slabs, and extrusion Bill of Materials.
          </p>
        </div>

        {/* Module Sub-Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          {[
            { key: 'profiles', label: 'UPVC Profiles' },
            { key: 'accessories', label: 'Accessories' },
            { key: 'pricing', label: 'Pricing Matrix' },
            { key: 'bom', label: 'Bill of Materials' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-white text-red-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap items-center gap-2.5 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Profile Code (e.g. SCF-FR-60), profile name, category..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:border-red-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
        >
          <option value="ALL">Category: All</option>
          <option value="Frame Profile">Frame Profile</option>
          <option value="Sash Profile">Sash Profile</option>
          <option value="Sliding Profile">Sliding Profile</option>
          <option value="Mullion / Transom">Mullion / Transom</option>
          <option value="Glazing Bead">Glazing Bead</option>
          <option value="Louver & Misc">Louver & Misc</option>
          <option value="Accessory">Accessory</option>
        </select>
        <select
          value={colorFilter}
          onChange={(e) => setColorFilter(e.target.value)}
          className="px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
        >
          <option value="ALL">Color: All Shades</option>
          <option value="White">White</option>
          <option value="Anthracite Grey">Anthracite Grey</option>
          <option value="Walnut Wood">Walnut Wood</option>
          <option value="Black">Black</option>
        </select>
      </div>

      {/* Split View: Table (Full width or 7 cols when selected) + Profile & BOM Detail (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className={`${selectedProduct ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white border border-slate-200 rounded-lg overflow-hidden transition-all duration-200`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                  <th className="py-2.5 px-3">Profile Code</th>
                  <th className="py-2.5 px-3">Profile Name & Category</th>
                  <th className="py-2.5 px-2.5">Color</th>
                  <th className="py-2.5 px-2.5">Length</th>
                  <th className="py-2.5 px-2.5 text-right">Wt / Meter</th>
                  <th className="py-2.5 px-2.5 text-right">Current Stock</th>
                  <th className="py-2.5 px-2.5 text-right">Selling Price</th>
                  <th className="py-2.5 px-2.5 text-center">GST</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((prod) => {
                  const isSelected = selectedProduct?.id === prod.id;
                  const isEditingThis = editingPriceId === prod.id;
                  return (
                    <tr
                      key={prod.id}
                      onClick={() => setSelectedRecordId(prod.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-red-50/70 border-l-3 border-l-red-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-red-600">{prod.code}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{prod.name}</div>
                        <div className="text-[10px] text-slate-500">{prod.category}</div>
                      </td>
                      <td className="py-3 px-2.5 text-slate-700 font-medium">{prod.color}</td>
                      <td className="py-3 px-2.5 font-mono text-slate-700">
                        {prod.lengthMeters > 0 ? `${prod.lengthMeters} meters` : 'Standard'}
                      </td>
                      <td className="py-3 px-2.5 text-right font-mono text-slate-700">
                        {prod.weightPerMeterKg} kg/{prod.unit === 'meters' ? 'm' : 'pc'}
                      </td>
                      <td className="py-3 px-2.5 text-right font-mono font-bold text-slate-900">
                        {formatNumberIN(prod.currentStock)} {prod.unit}
                      </td>
                      <td className="py-3 px-2.5 text-right font-mono font-bold text-slate-900">
                        {isEditingThis ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-end gap-1"
                          >
                            <input
                              type="number"
                              value={tempSellPrice}
                              onChange={(e) => setTempSellPrice(Number(e.target.value))}
                              className="w-16 px-1.5 py-0.5 border border-red-400 rounded text-right"
                            />
                            <button
                              onClick={() => {
                                updateProductPrice(prod.id, tempSellPrice, tempDealerPrice);
                                setEditingPriceId(null);
                              }}
                              className="p-1 bg-emerald-600 text-white rounded"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <span>
                              ₹{prod.sellingPrice}/{prod.unit === 'meters' ? 'm' : 'pc'}
                            </span>
                            {activeTab === 'pricing' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingPriceId(prod.id);
                                  setTempSellPrice(prod.sellingPrice);
                                  setTempDealerPrice(prod.dealerPrice);
                                }}
                                className="p-1 text-slate-400 hover:text-red-600"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2.5 text-center font-mono text-slate-600">
                        {prod.gstPercent}%
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                            prod.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {prod.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Profile Specification & Bill of Materials Card (5 cols) */}
        {selectedProduct && (
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between text-[11px] font-bold">
              <span>PROFILE SPECIFICATION • {selectedProduct.code}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-red-400">
                  {selectedProduct.dieNumber || 'STD-TOOLING'}
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
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-red-600">
                    {selectedProduct.code}
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Category: {selectedProduct.category} • Color: {selectedProduct.color}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    selectedProduct.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {selectedProduct.status}
                </span>
              </div>

              {/* Technical & Commercial Attributes Grid */}
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 grid grid-cols-3 gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Bar Length</div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">
                    {selectedProduct.lengthMeters > 0
                      ? `${selectedProduct.lengthMeters} meters`
                      : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Weight / Meter
                  </div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">
                    {selectedProduct.weightPerMeterKg} kg/m
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Unit</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{selectedProduct.unit}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Selling Price
                  </div>
                  <div className="font-mono font-bold text-red-600 text-sm mt-0.5">
                    ₹{selectedProduct.sellingPrice}/{selectedProduct.unit === 'meters' ? 'm' : 'pc'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Dealer Price
                  </div>
                  <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                    ₹{selectedProduct.dealerPrice}/{selectedProduct.unit === 'meters' ? 'm' : 'pc'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Default GST</div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">
                    {selectedProduct.gstPercent}% (HSN 3916)
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Current Stock
                  </div>
                  <div className="font-mono font-bold text-emerald-700 mt-0.5">
                    {formatNumberIN(selectedProduct.currentStock)} {selectedProduct.unit}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Reserved Stock
                  </div>
                  <div className="font-mono font-semibold text-amber-700 mt-0.5">
                    {formatNumberIN(selectedProduct.reservedStock)} {selectedProduct.unit}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Minimum Stock
                  </div>
                  <div className="font-mono text-slate-700 mt-0.5">
                    {formatNumberIN(selectedProduct.minimumStock)} {selectedProduct.unit}
                  </div>
                </div>
              </div>

              {/* Bill of Materials Breakdown */}
              {selectedProduct.itemType === 'UPVC Profile' && selectedBom && (
                <div className="p-3.5 rounded-lg border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-red-600" />
                      <span className="font-bold uppercase tracking-wider text-[11px] text-slate-800">
                        Bill of Materials ({selectedProduct.code})
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      Formula per 1 meter extrusion
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-md overflow-hidden">
                    {selectedBom.components.map((comp) => (
                      <div
                        key={comp.materialId}
                        className="px-3 py-2 bg-white flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-slate-900">{comp.materialName}</span>
                          <span className="ml-1.5 text-[10px] font-mono text-slate-400">
                            ({comp.materialCode})
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">
                          {comp.quantityPerMeter} kg/m
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => navigateTo('bom', selectedProduct.code)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Open BOM Calculator</span>
                    </button>
                    <button
                      onClick={() => navigateTo('material_requirements', selectedProduct.code)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Plan Material (MRP)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
