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
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatINR, formatINRCompact, formatNumberIN } from '../services/rbac';

export const InventoryAndRawMaterialsPage: React.FC = () => {
  const {
    activeModule,
    selectedRecordId,
    setSelectedRecordId,
    rawMaterials,
    products,
    stockMovements,
    stockInRawMaterial,
    adjustRawMaterialStock,
    navigateTo,
  } = useERP();

  const [tab, setTab] = useState<
    'overview' | 'raw_materials' | 'profiles' | 'accessories' | 'movements'
  >(activeModule === 'raw_materials' ? 'raw_materials' : 'overview');

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

  const selectedRM =
    rawMaterials.find((r) => r.id === selectedRecordId || r.code === selectedRecordId) ||
    rawMaterials[0];

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
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {formatNumberIN(item.available)}
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
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg overflow-hidden">
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
                <span>{selectedRM.category}</span>
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
    </div>
  );
};
