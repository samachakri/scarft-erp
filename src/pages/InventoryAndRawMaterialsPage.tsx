import React, { useState, useEffect } from 'react';
import {
  Search,
  Warehouse,
  Boxes,
  Package,
  ArrowUpDown,
  Plus,
  Sliders,
  History,
  Calculator,
  AlertTriangle,
  Edit3,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatINR, formatINRCompact, formatNumberIN, formatBundlesText } from '../services/rbac';
import { RawMaterial } from '../types/erp';

export const InventoryAndRawMaterialsPage: React.FC = () => {
  const {
    activeModule,
    selectedRecordId,
    setSelectedRecordId,
    rawMaterials,
    products,
    stockMovements,
    stockInRawMaterial,
    createRawMaterial,
    adjustRawMaterialStock,
    updateInventoryItemQuantity,
    addProfileBundleStock,
    navigateTo,
  } = useERP();

  const [tab, setTab] = useState<
    'overview' | 'raw_materials' | 'profiles' | 'accessories' | 'movements'
  >(activeModule === 'raw_materials' ? 'raw_materials' : 'overview');

  // Add Raw Material Modal state
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [newMatName, setNewMatName] = useState('');
  const [newMatCode, setNewMatCode] = useState('');
  const [newMatCategory, setNewMatCategory] = useState<RawMaterial['category']>('Stabilizer & Additive');
  const [newMatStock, setNewMatStock] = useState<number>(500);
  const [newMatMinLevel, setNewMatMinLevel] = useState<number>(200);
  const [newMatCost, setNewMatCost] = useState<number>(140);
  const [newMatSupplier, setNewMatSupplier] = useState<string>('Standard UPVC Chemical Supplier');

  const handleCreateRawMaterial = () => {
    if (!newMatName.trim()) {
      return;
    }
    const created = createRawMaterial({
      name: newMatName.trim(),
      code: newMatCode.trim() || undefined,
      category: newMatCategory,
      availableQuantity: newMatStock,
      minimumLevel: newMatMinLevel,
      averageCostPerUnit: newMatCost,
      supplier: newMatSupplier,
      unit: 'kg',
    });
    setShowAddMaterialModal(false);
    setNewMatName('');
    setNewMatCode('');
    setSelectedRecordId(created.id);
  };

  useEffect(() => {
    if (activeModule === 'raw_materials') {
      setTab('raw_materials');
    } else if (activeModule === 'inventory') {
      setTab('overview');
    }
  }, [activeModule]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Raw Material Action Form State
  const [actionMode, setActionMode] = useState<'stock_in' | 'adjust' | null>(null);
  const [qtyInput, setQtyInput] = useState(500);
  const [notesInput, setNotesInput] = useState('Reliance Hazira Lot #R-8821');

  // Manual Profile Bundle Receiving (Sets of 6 pieces)
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [bundleProductId, setBundleProductId] = useState(
    products.find((p) => p.itemType === 'UPVC Profile')?.id || 'PRD-001'
  );
  const [bundleSetsCount, setBundleSetsCount] = useState(30);
  const [bundleRack, setBundleRack] = useState('Warehouse Rack B-04');
  const [bundleNotes, setBundleNotes] = useState('Received from Line 04 extrusion batch');

  // Direct Quantity Change Modal State (Any item in Inventory)
  const [changeQtyModalItem, setChangeQtyModalItem] = useState<{
    id: string;
    code: string;
    name: string;
    category: string;
    currentAvailable: number;
    unit: string;
    isRM: boolean;
  } | null>(null);
  const [newQtyValue, setNewQtyValue] = useState<number>(0);
  const [qtyUnitMode, setQtyUnitMode] = useState<'meters' | 'sets'>('meters');
  const [changeQtyReason, setChangeQtyReason] = useState<string>('Physical warehouse audit count');

  const openChangeQtyModal = (item: {
    id: string;
    code: string;
    name: string;
    category: string;
    available: number;
    unit: string;
    isRM: boolean;
  }) => {
    setChangeQtyModalItem({
      id: item.id,
      code: item.code,
      name: item.name,
      category: item.category,
      currentAvailable: item.available,
      unit: item.unit,
      isRM: item.isRM,
    });
    setNewQtyValue(item.available);
    setQtyUnitMode('meters');
    setChangeQtyReason('Physical warehouse audit count');
  };

  const handleSaveNewQuantity = () => {
    if (!changeQtyModalItem) return;
    updateInventoryItemQuantity(
      changeQtyModalItem.id,
      newQtyValue,
      changeQtyReason,
      qtyUnitMode
    );
    setChangeQtyModalItem(null);
  };

  const selectedRM = selectedRecordId
    ? rawMaterials.find((r) => r.id === selectedRecordId || r.code === selectedRecordId) || null
    : null;

  // Inventory Overview KPIs
  const rawMaterialValue = rawMaterials.reduce(
    (sum, r) => sum + (r.availableQuantity + r.reservedQuantity) * r.averageCostPerUnit,
    0
  );
  const profileStockValue = products
    .filter((p) => p.itemType === 'UPVC Profile')
    .reduce((sum, p) => sum + p.currentStock * p.dealerPrice, 0);
  const accessoryStockValue = products
    .filter((p) => p.itemType === 'Accessory')
    .reduce((sum, p) => sum + p.currentStock * p.dealerPrice, 0);
  const totalStockValue = rawMaterialValue + profileStockValue + accessoryStockValue;

  const lowStockCount =
    rawMaterials.filter((r) => r.status === 'Low').length +
    products.filter((p) => p.status === 'Low Stock').length;
  const criticalStockCount = rawMaterials.filter(
    (r) => r.status === 'Critical' || r.status === 'Out of Stock'
  ).length;

  // Unified items for Overview table
  const unifiedItems = [
    ...rawMaterials.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      category: `Raw Material (${r.category})`,
      available: r.availableQuantity,
      reserved: r.reservedQuantity,
      total: r.availableQuantity + r.reservedQuantity,
      unit: r.unit,
      minLevel: r.minimumLevel,
      status: r.status,
      isRM: true,
    })),
    ...products.map((p) => {
      const avail = Math.max(0, p.currentStock - p.reservedStock);
      const st =
        p.currentStock === 0
          ? 'Out of Stock'
          : p.currentStock < p.minimumStock * 0.6
          ? 'Critical'
          : p.currentStock < p.minimumStock
          ? 'Low'
          : 'Healthy';
      return {
        id: p.id,
        code: p.code,
        name: p.name,
        category: p.itemType,
        available: avail,
        reserved: p.reservedStock,
        total: p.currentStock,
        unit: p.unit,
        minLevel: p.minimumStock,
        status: st,
        isRM: false,
      };
    }),
  ].filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q || item.code.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const rmMovements = stockMovements.filter((sm) => sm.itemCode === selectedRM?.code);

  return (
    <div className="space-y-4">
      {/* Header & Tabs */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">
              {tab === 'raw_materials'
                ? 'Raw Materials & Silo Stock'
                : 'Inventory & Warehouse Management'}
            </h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              BHIWADI PLANT SILOS & RACK BAYS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor UPVC resin, calcium carbonate, rutile TiO2, finished 6m profile racks, and stock movements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowBundleModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>+ Add Profile Stock (Sets of 6 pcs)</span>
          </button>

          <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'raw_materials', label: 'Raw Materials' },
              { key: 'profiles', label: 'UPVC Profiles' },
              { key: 'accessories', label: 'Accessories' },
              { key: 'movements', label: 'Stock Movements' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as typeof tab)}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  tab === t.key
                    ? 'bg-white text-red-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
            <button
              onClick={() => navigateTo('material_requirements', null)}
              className="px-3 py-1.5 rounded-md text-slate-700 hover:text-red-600 flex items-center gap-1 cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5 text-red-600" />
              <span>Material Requirements</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 6 Inventory Overview KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Stock Value</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {formatINRCompact(totalStockValue)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Valuation at Cost</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-[10px] font-bold uppercase text-slate-400">Raw Material Stock</div>
          <div className="text-xl font-bold font-mono text-blue-700 mt-1">
            {formatINRCompact(rawMaterialValue)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{rawMaterials.length} Compounds</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-[10px] font-bold uppercase text-slate-400">Profile Stock</div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
            {formatINRCompact(profileStockValue)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Finished 6m Bars</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-[10px] font-bold uppercase text-slate-400">Low Stock Items</div>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1">{lowStockCount}</div>
          <div className="text-[10px] text-amber-700 mt-0.5">Below min threshold</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-[10px] font-bold uppercase text-slate-400">Critical Stock</div>
          <div className="text-xl font-bold font-mono text-red-600 mt-1">{criticalStockCount}</div>
          <div className="text-[10px] text-red-600 mt-0.5">Immediate PO needed</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-[10px] font-bold uppercase text-slate-400">Reserved Stock</div>
          <div className="text-xl font-bold font-mono text-purple-700 mt-1">
            {formatNumberIN(
              products.reduce((s, p) => s + p.reservedStock, 0)
            )}{' '}
            m
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Locked for Open Orders</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap items-center gap-2.5 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code (RM-001, SCF-FR-60) or item name..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:border-red-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
        >
          <option value="ALL">Status: All Health Levels</option>
          <option value="Healthy">Healthy</option>
          <option value="Low">Low</option>
          <option value="Critical">Critical</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
      </div>

      {/* TAB CONTENT 1: OVERVIEW / PROFILES / ACCESSORIES */}
      {(tab === 'overview' || tab === 'profiles' || tab === 'accessories') && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                  <th className="py-2.5 px-4">Item</th>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Available</th>
                  <th className="py-2.5 px-3 text-right">Reserved</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3 text-right">Minimum Level</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unifiedItems
                  .filter((i) => {
                    if (tab === 'profiles') return i.category === 'UPVC Profile';
                    if (tab === 'accessories') return i.category === 'Accessory';
                    return true;
                  })
                  .map((item) => (
                    <tr
                      key={item.code}
                      onClick={() => {
                        if (item.isRM) {
                          setSelectedRecordId(item.id);
                          setTab('raw_materials');
                        } else {
                          navigateTo('products', item.id);
                        }
                      }}
                      className="hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                      <td className="py-3 px-3 font-mono font-bold text-red-600">{item.code}</td>
                      <td className="py-3 px-3 text-slate-600">{item.category}</td>
                      <td className="py-3 px-3 text-right font-mono">
                        <div className="font-bold text-slate-900">{formatNumberIN(item.available)} {item.unit}</div>
                        {item.category === 'UPVC Profile' && (
                          <div className="text-[10px] text-slate-500 font-sans">{formatBundlesText(item.available)}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-amber-700">
                        {formatNumberIN(item.reserved)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800">
                        {formatNumberIN(item.total)}
                      </td>
                      <td className="py-3 px-3 text-slate-500">{item.unit}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        {formatNumberIN(item.minLevel)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                            item.status === 'Healthy'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.status === 'Low'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openChangeQtyModal(item);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-[11px] cursor-pointer shadow-2xs"
                        >
                          <Edit3 className="w-3 h-3 text-slate-500" />
                          <span>Change Qty</span>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: RAW MATERIALS SPLIT VIEW (Section 13) */}
      {tab === 'raw_materials' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className={`${selectedRM ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white border border-slate-200 rounded-lg overflow-hidden transition-all duration-200`}>
            {/* Raw Material Actions Header */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                  Silos & Chemical Compounds Registry
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">
                  {rawMaterials.length} COMPOUNDS
                </span>
              </div>
              <button
                onClick={() => setShowAddMaterialModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-xs cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Raw Material / Chemical</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Material Name & Category</th>
                    <th className="py-2.5 px-2.5 text-right">Available</th>
                    <th className="py-2.5 px-2.5 text-right">Reserved</th>
                    <th className="py-2.5 px-2.5 text-right">Min Level</th>
                    <th className="py-2.5 px-2.5">Supplier</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rawMaterials
                    .filter(
                      (r) =>
                        (!search ||
                          r.code.toLowerCase().includes(search.toLowerCase()) ||
                          r.name.toLowerCase().includes(search.toLowerCase())) &&
                        (statusFilter === 'ALL' || r.status === statusFilter)
                    )
                    .map((rm) => {
                      const isSelected = selectedRM?.id === rm.id;
                      return (
                        <tr
                          key={rm.id}
                          onClick={() => setSelectedRecordId(rm.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-red-50/70 border-l-3 border-l-red-600'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3 px-3 font-mono font-bold text-red-600">{rm.code}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{rm.name}</div>
                            <div className="text-[10px] text-slate-500">{rm.category}</div>
                          </td>
                          <td className="py-3 px-2.5 text-right font-mono font-bold text-slate-900">
                            {formatNumberIN(rm.availableQuantity)} {rm.unit}
                          </td>
                          <td className="py-3 px-2.5 text-right font-mono text-slate-600">
                            {formatNumberIN(rm.reservedQuantity)} {rm.unit}
                          </td>
                          <td className="py-3 px-2.5 text-right font-mono text-slate-500">
                            {formatNumberIN(rm.minimumLevel)} {rm.unit}
                          </td>
                          <td className="py-3 px-2.5 text-[11px] text-slate-600 truncate max-w-[140px]">
                            {rm.supplier}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                                rm.status === 'Healthy'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : rm.status === 'Low'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              {rm.status === 'Low' ? 'Low Stock' : rm.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openChangeQtyModal({
                                  id: rm.id,
                                  code: rm.code,
                                  name: rm.name,
                                  category: rm.category,
                                  available: rm.availableQuantity,
                                  unit: rm.unit,
                                  isRM: true,
                                });
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-[11px] cursor-pointer shadow-2xs"
                            >
                              <Edit3 className="w-3 h-3 text-slate-500" />
                              <span>Change Qty</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Raw Material Detail & Stock In / Adjust Panel */}
          {selectedRM && (
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
              <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between text-[11px] font-bold">
                <span>RAW MATERIAL DETAIL • {selectedRM.code}</span>
                <div className="flex items-center gap-2">
                  <span>{selectedRM.category}</span>
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
                  <h2 className="text-base font-bold text-slate-900">{selectedRM.name}</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Approved Supplier: <strong className="text-slate-700">{selectedRM.supplier}</strong>
                  </p>
                </div>

                {/* Action Buttons: Stock In, Adjust Stock, View History */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setActionMode(actionMode === 'stock_in' ? null : 'stock_in');
                      setQtyInput(1000);
                    }}
                    className="flex items-center justify-center gap-1 py-2 px-3 rounded bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Stock In</span>
                  </button>
                  <button
                    onClick={() => {
                      setActionMode(actionMode === 'adjust' ? null : 'adjust');
                      setQtyInput(selectedRM.availableQuantity);
                    }}
                    className="flex items-center justify-center gap-1 py-2 px-3 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Adjust Stock</span>
                  </button>
                  <button
                    onClick={() => setTab('movements')}
                    className="flex items-center justify-center gap-1 py-2 px-3 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>View History</span>
                  </button>
                </div>

                {/* Inline Stock In / Adjust Drawer */}
                {actionMode && (
                  <div className="p-3 rounded-md bg-slate-50 border border-slate-300 space-y-2.5">
                    <div className="font-bold text-slate-900">
                      {actionMode === 'stock_in'
                        ? `Stock Inward Entry (${selectedRM.code})`
                        : `Physical Silo Stock Adjustment (${selectedRM.code})`}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500">
                          {actionMode === 'stock_in'
                            ? `Add Quantity (${selectedRM.unit})`
                            : `New Available Quantity (${selectedRM.unit})`}
                        </label>
                        <input
                          type="number"
                          value={qtyInput}
                          onChange={(e) => setQtyInput(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500">
                          Reference / Reason
                        </label>
                        <input
                          type="text"
                          value={notesInput}
                          onChange={(e) => setNotesInput(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setActionMode(null)}
                        className="px-3 py-1 border border-slate-300 rounded bg-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (actionMode === 'stock_in') {
                            stockInRawMaterial(selectedRM.id, qtyInput, notesInput);
                          } else {
                            adjustRawMaterialStock(selectedRM.id, qtyInput, notesInput);
                          }
                          setActionMode(null);
                        }}
                        className="px-3 py-1 bg-emerald-600 text-white font-semibold rounded"
                      >
                        Confirm Update
                      </button>
                    </div>
                  </div>
                )}

                {/* Stock Metrics Grid */}
                <div className="p-3 rounded-md bg-slate-50 border border-slate-200 grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      Current Total Stock
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      {formatNumberIN(selectedRM.availableQuantity + selectedRM.reservedQuantity)}{' '}
                      {selectedRM.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      Available Stock
                    </div>
                    <div className="font-mono font-bold text-emerald-700 text-sm mt-0.5">
                      {formatNumberIN(selectedRM.availableQuantity)} {selectedRM.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      Reserved Stock
                    </div>
                    <div className="font-mono font-bold text-amber-700 text-sm mt-0.5">
                      {formatNumberIN(selectedRM.reservedQuantity)} {selectedRM.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      Minimum Level
                    </div>
                    <div className="font-mono font-semibold text-slate-800 mt-0.5">
                      {formatNumberIN(selectedRM.minimumLevel)} {selectedRM.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      Average Cost
                    </div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">
                      ₹{selectedRM.averageCostPerUnit}/{selectedRM.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      Last Purchase
                    </div>
                    <div className="font-medium text-slate-700 mt-0.5">
                      {selectedRM.lastPurchaseDate}
                    </div>
                  </div>
                </div>

                {/* Recent Stock Movements for this material */}
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-2">
                    RECENT STOCK MOVEMENTS ({selectedRM.code})
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {rmMovements.length === 0 ? (
                      <div className="p-3 text-center text-slate-400 border border-dashed rounded">
                        No recent stock movements for {selectedRM.code}.
                      </div>
                    ) : (
                      rmMovements.map((sm) => (
                        <div
                          key={sm.id}
                          className="p-2.5 rounded border border-slate-200 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-slate-900">
                              {sm.movementType} • <span className="font-mono">{sm.referenceId}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {sm.notes} ({sm.date})
                            </div>
                          </div>
                          <span
                            className={`font-mono font-bold ${
                              sm.quantity >= 0 ? 'text-emerald-700' : 'text-red-600'
                            }`}
                          >
                            {sm.quantity >= 0 ? `+${sm.quantity}` : sm.quantity} {sm.unit}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: STOCK MOVEMENTS LEDGER */}
      {tab === 'movements' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-3">Item Code & Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Movement Type</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Performed By</th>
                  <th className="py-2.5 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockMovements.map((sm) => (
                  <tr key={sm.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-600">{sm.date}</td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-red-600 mr-1.5">{sm.itemCode}</span>
                      <span className="font-semibold text-slate-900">{sm.itemName}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{sm.itemCategory}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold text-[10px]">
                        {sm.movementType}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-mono font-bold ${
                        sm.quantity >= 0 ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {sm.quantity >= 0 ? `+${sm.quantity}` : sm.quantity} {sm.unit}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">{sm.referenceId}</td>
                    <td className="py-3 px-3 text-slate-700">{sm.performedBy}</td>
                    <td className="py-3 px-4 text-slate-500">{sm.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Modal: Quick Add Profile Stock in Sets of 6 pieces */}
      {showBundleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Receive Profile Stock (Sets of 6 pcs)
                </h3>
              </div>
              <button
                onClick={() => setShowBundleModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select UPVC Profile</label>
                <select
                  value={bundleProductId}
                  onChange={(e) => setBundleProductId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-semibold bg-white"
                >
                  {products
                    .filter((p) => p.itemType === 'UPVC Profile')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} • {p.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Quantity to Add (Sets of 6 Pieces)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={bundleSetsCount}
                    onChange={(e) => setBundleSetsCount(Math.max(1, Number(e.target.value)))}
                    className="w-24 px-3 py-1.5 border border-slate-300 rounded font-mono font-bold text-slate-900"
                  />
                  <span className="font-semibold text-slate-700">Sets</span>
                </div>
                <div className="mt-1 font-mono text-[11px] text-emerald-700 font-semibold">
                  = {bundleSetsCount * 6} bars of 6m ({formatNumberIN(bundleSetsCount * 36)} meters)
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Warehouse Rack Location</label>
                <input
                  type="text"
                  value={bundleRack}
                  onChange={(e) => setBundleRack(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Batch Reference</label>
                <input
                  type="text"
                  value={bundleNotes}
                  onChange={(e) => setBundleNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowBundleModal(false)}
                className="py-1.5 px-3 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addProfileBundleStock(bundleProductId, bundleSetsCount, bundleRack, bundleNotes);
                  setShowBundleModal(false);
                }}
                className="py-1.5 px-3.5 rounded bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer text-xs shadow-xs"
              >
                Confirm & Stock In {bundleSetsCount} Sets
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal: Change Inventory Quantity for any Item */}
      {changeQtyModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Modify Stock Quantity
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {changeQtyModalItem.code} • {changeQtyModalItem.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setChangeQtyModalItem(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between font-mono">
                <div>
                  <div className="text-[10px] font-sans text-slate-500 uppercase font-bold">Current Stock Level</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {formatNumberIN(changeQtyModalItem.currentAvailable)} {changeQtyModalItem.unit}
                  </div>
                  {changeQtyModalItem.category === 'UPVC Profile' && (
                    <div className="text-[10px] font-sans text-slate-500">
                      {formatBundlesText(changeQtyModalItem.currentAvailable)}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-sans text-slate-500 uppercase font-bold">Category</div>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold text-[10px]">
                    {changeQtyModalItem.category}
                  </span>
                </div>
              </div>

              {changeQtyModalItem.category === 'UPVC Profile' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity Unit Mode</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-md text-center font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        if (qtyUnitMode === 'sets') {
                          setNewQtyValue(newQtyValue * 36);
                        }
                        setQtyUnitMode('meters');
                      }}
                      className={`py-1.5 rounded cursor-pointer ${
                        qtyUnitMode === 'meters' ? 'bg-white text-red-600 shadow-2xs font-bold' : 'text-slate-600'
                      }`}
                    >
                      Meters (Standard 6m Bars)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (qtyUnitMode === 'meters') {
                          setNewQtyValue(Math.floor(newQtyValue / 36));
                        }
                        setQtyUnitMode('sets');
                      }}
                      className={`py-1.5 rounded cursor-pointer ${
                        qtyUnitMode === 'sets' ? 'bg-white text-red-600 shadow-2xs font-bold' : 'text-slate-600'
                      }`}
                    >
                      Sets of 6 Pieces (1 Set = 36m)
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  New Adjusted Stock Quantity
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={newQtyValue}
                    onChange={(e) => setNewQtyValue(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold text-slate-900 text-sm bg-white"
                  />
                  <span className="font-semibold text-slate-600 whitespace-nowrap">
                    {changeQtyModalItem.category === 'UPVC Profile' && qtyUnitMode === 'sets'
                      ? 'Sets of 6'
                      : changeQtyModalItem.unit}
                  </span>
                </div>
                {changeQtyModalItem.category === 'UPVC Profile' && qtyUnitMode === 'sets' && (
                  <div className="mt-1 font-mono text-[11px] text-emerald-700 font-semibold">
                    = {newQtyValue * 6} bars of 6m ({formatNumberIN(newQtyValue * 36)} meters)
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reason for Adjustment / Audit Reference
                </label>
                <input
                  type="text"
                  value={changeQtyReason}
                  onChange={(e) => setChangeQtyReason(e.target.value)}
                  placeholder="e.g. Physical warehouse audit count, scrap write-off..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setChangeQtyModalItem(null)}
                className="py-1.5 px-3 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNewQuantity}
                className="py-1.5 px-4 rounded bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer text-xs shadow-xs"
              >
                Update Stock Quantity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD RAW MATERIAL / CHEMICAL */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-red-600" />
                  <span>Register Raw Material / Chemical Compound</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Add custom chemical, additive, or polymer into the ERP registry and Silo inventory.
                </p>
              </div>
              <button
                onClick={() => setShowAddMaterialModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Chemical / Raw Material Name *
                </label>
                <input
                  type="text"
                  value={newMatName}
                  onChange={(e) => setNewMatName(e.target.value)}
                  placeholder="e.g. CPE 135A High Impact Modifier"
                  className="w-full px-3 py-2 border border-slate-300 rounded font-medium text-slate-900 bg-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Material Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={newMatCode}
                    onChange={(e) => setNewMatCode(e.target.value)}
                    placeholder="e.g. RM-007"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newMatCategory}
                    onChange={(e) => setNewMatCategory(e.target.value as RawMaterial['category'])}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800"
                  >
                    <option value="Base Polymer">Base Polymer</option>
                    <option value="Filler">Filler (CaCO3)</option>
                    <option value="Pigment">Pigment (TiO2 / Toner)</option>
                    <option value="Stabilizer & Additive">Stabilizer & Additive</option>
                    <option value="Laminate & Gasket">Laminate & Gasket</option>
                    <option value="Reinforcement">Reinforcement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Silo Stock (kg)</label>
                  <input
                    type="number"
                    min={0}
                    value={newMatStock}
                    onChange={(e) => setNewMatStock(Math.max(0, Number(e.target.value)))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Alert Level (kg)</label>
                  <input
                    type="number"
                    min={0}
                    value={newMatMinLevel}
                    onChange={(e) => setNewMatMinLevel(Math.max(0, Number(e.target.value)))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Avg Cost (₹/kg)</label>
                  <input
                    type="number"
                    min={0}
                    value={newMatCost}
                    onChange={(e) => setNewMatCost(Math.max(0, Number(e.target.value)))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    value={newMatSupplier}
                    onChange={(e) => setNewMatSupplier(e.target.value)}
                    placeholder="e.g. Chemours India Pvt Ltd"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddMaterialModal(false)}
                className="py-1.5 px-3 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateRawMaterial}
                className="py-1.5 px-4 rounded bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer text-xs shadow-xs"
              >
                Register Raw Material
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
