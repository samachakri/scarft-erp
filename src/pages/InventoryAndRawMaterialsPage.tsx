import React, { useState, useEffect } from 'react';
import {
  Search,
  Warehouse,
  Boxes,
  Package,
  Plus,
  AlertTriangle,
  Edit3,
  Check,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatINR, formatINRCompact, formatNumberIN } from '../services/rbac';
import { RawMaterial, Product, ProductCategory } from '../types/erp';

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
  } = useERP();

  const isRawMaterialsView = activeModule === 'raw_materials';

  const [invTab, setInvTab] = useState<'profiles' | 'accessories' | 'movements'>('profiles');
  const [rmTab, setRmTab] = useState<'silos' | 'movements'>('silos');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Add Raw Material Modal state
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [newMatName, setNewMatName] = useState('');
  const [newMatCode, setNewMatCode] = useState('');
  const [newMatCategory, setNewMatCategory] = useState<string>('Stabilizer & Additive');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [newMatStock, setNewMatStock] = useState<number>(1000);
  const [newMatMinLevel, setNewMatMinLevel] = useState<number>(300);
  const [newMatCost, setNewMatCost] = useState<number>(140);
  const [newMatSupplier, setNewMatSupplier] = useState<string>('Standard UPVC Chemical Supplier');

  // Add Profile Stock Modal state (Sets & Pieces in each set)
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [bundleProfileMode, setBundleProfileMode] = useState<'catalog' | 'manual'>('catalog');
  const [bundleProductId, setBundleProductId] = useState(
    products.find((p) => p.itemType === 'UPVC Profile')?.id || 'PRD-001'
  );
  const [bundleCustomName, setBundleCustomName] = useState('');
  const [bundleCustomCode, setBundleCustomCode] = useState('');
  const [bundleCustomColor, setBundleCustomColor] = useState('White');
  const [bundleCustomCategory, setBundleCustomCategory] = useState('Sliding Profile');
  const [bundleSetsCount, setBundleSetsCount] = useState<number>(30);
  const [bundlePiecesPerSet, setBundlePiecesPerSet] = useState<number>(6); // Default 6 pcs in each set
  const [bundleBarLength, setBundleBarLength] = useState<number>(6.0); // 6m standard bar
  const [bundleRack, setBundleRack] = useState('Warehouse Rack B-04');
  const [bundleNotes, setBundleNotes] = useState('Extrusion Plant Production Stacking');

  // Change Quantity Modal state
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

  // Inward GRN Modal for Raw Materials
  const [inwardRMModalItem, setInwardRMModalItem] = useState<RawMaterial | null>(null);
  const [inwardRMQty, setInwardRMQty] = useState<number>(1000);
  const [inwardRMNotes, setInwardRMNotes] = useState<string>('Received fresh bulk lot via supplier tanker');

  const selectedRM = selectedRecordId
    ? rawMaterials.find((r) => r.id === selectedRecordId || r.code === selectedRecordId) || null
    : null;

  const selectedProduct = selectedRecordId
    ? products.find((p) => p.id === selectedRecordId || p.code === selectedRecordId) || null
    : null;

  // KPIs
  const profileProducts = products.filter((p) => p.itemType === 'UPVC Profile');
  const accessoryProducts = products.filter((p) => p.itemType === 'Accessory');

  const totalProfileMeters = profileProducts.reduce((sum, p) => sum + p.currentStock, 0);
  const totalProfileSets = profileProducts.reduce(
    (sum, p) => sum + Math.floor(p.currentStock / ((p.piecesPerSet || 6) * (p.lengthMeters || 6))),
    0
  );
  const totalProfileValue = profileProducts.reduce((sum, p) => sum + p.currentStock * p.dealerPrice, 0);
  const totalProfileReserved = profileProducts.reduce((sum, p) => sum + p.reservedStock, 0);
  const lowProfileCount = profileProducts.filter((p) => p.currentStock <= p.minimumStock).length;

  const totalRawMaterialKg = rawMaterials.reduce((sum, r) => sum + r.availableQuantity, 0);
  const totalRawMaterialValue = rawMaterials.reduce(
    (sum, r) => sum + r.availableQuantity * r.averageCostPerUnit,
    0
  );
  const resinKg = rawMaterials.find((r) => r.code === 'RM-001')?.availableQuantity || 0;
  const caco3Kg = rawMaterials.find((r) => r.code === 'RM-002')?.availableQuantity || 0;
  const lowRMCount = rawMaterials.filter((r) => r.status === 'Low' || r.status === 'Critical').length;

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

  const handleCreateRawMaterial = () => {
    if (!newMatName.trim()) return;
    const created = createRawMaterial({
      name: newMatName.trim(),
      code: newMatCode.trim() || undefined,
      category: newMatCategory as RawMaterial['category'],
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

  const handleConfirmProfileBundleStock = () => {
    addProfileBundleStock({
      productId: bundleProfileMode === 'catalog' ? bundleProductId : undefined,
      customProfileName: bundleProfileMode === 'manual' ? bundleCustomName : undefined,
      customProfileCode: bundleProfileMode === 'manual' ? bundleCustomCode : undefined,
      customColor: bundleProfileMode === 'manual' ? bundleCustomColor : undefined,
      customCategory: bundleProfileMode === 'manual' ? bundleCustomCategory : undefined,
      bundlesCount: Math.max(1, bundleSetsCount),
      piecesPerSet: Math.max(1, bundlePiecesPerSet),
      barLengthMeters: bundleBarLength || 6.0,
      rackLocation: bundleRack || 'Rack A-01',
      notes: bundleNotes,
    });
    setShowBundleModal(false);
    setBundleCustomName('');
    setBundleCustomCode('');
  };

  const handleConfirmInwardRM = () => {
    if (!inwardRMModalItem) return;
    stockInRawMaterial(inwardRMModalItem.id, inwardRMQty, inwardRMNotes);
    setInwardRMModalItem(null);
  };

  return (
    <div className="space-y-4">
      {/* ==================================================== */}
      {/* HEADER SECTION */}
      {/* ==================================================== */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">
              {isRawMaterialsView
                ? 'Raw Materials & Chemical Silos'
                : 'Finished UPVC Profile Inventory'}
            </h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {isRawMaterialsView ? 'RAW COMPOUND SECTION' : 'WAREHOUSE PROFILE RACKS'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isRawMaterialsView
              ? 'Manage polymer resins, calcium carbonate, TiO2 pigments, stabilizers, impact modifiers, and chemical costs.'
              : 'Track 6-meter finished profile bars, bundle packaging sets, pieces per set, and rack bays.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isRawMaterialsView ? (
            <button
              onClick={() => setShowAddMaterialModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Raw Material / Chemical</span>
            </button>
          ) : (
            <button
              onClick={() => setShowBundleModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>+ Add Profile Stock (Sets & Pieces)</span>
            </button>
          )}

          {/* Sub-Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            {isRawMaterialsView ? (
              [
                { key: 'silos', label: 'Silo Stock & Chemicals' },
                { key: 'movements', label: 'Inward & Consumption Log' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setRmTab(t.key as typeof rmTab)}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    rmTab === t.key
                      ? 'bg-white text-red-600 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))
            ) : (
              [
                { key: 'profiles', label: 'UPVC Profiles (Sets & Racks)' },
                { key: 'accessories', label: 'Accessories' },
                { key: 'movements', label: 'Stock Movements' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setInvTab(t.key as typeof invTab)}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    invTab === t.key
                      ? 'bg-white text-red-600 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* KPIS SUMMARY */}
      {/* ==================================================== */}
      {isRawMaterialsView ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-400">Total Silo Compounds</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {formatNumberIN(totalRawMaterialKg)} kg
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{rawMaterials.length} Registered Chemicals</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-400">Total Valuation</div>
            <div className="text-xl font-bold font-mono text-blue-700 mt-1">
              {formatINRCompact(totalRawMaterialValue)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Valued at purchase cost</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-400">Resin K-67 Silo</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {formatNumberIN(resinKg)} kg
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Primary polymer compound</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-400">CaCO3 Filler Silo</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {formatNumberIN(caco3Kg)} kg
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Calcium carbonate filler</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-400">Low Stock Warnings</div>
            <div className={`text-xl font-bold font-mono mt-1 ${lowRMCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {lowRMCount} Items
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Below reorder threshold</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-400">Available Profile Stock</div>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
              {formatNumberIN(totalProfileMeters)} m
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              ~{Math.round(totalProfileMeters / 6)} Standard 6m bars
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-400">In-Stock Sets (Bundles)</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {formatNumberIN(totalProfileSets)} Sets
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Packaged profile sets</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-400">Total Stock Value</div>
            <div className="text-xl font-bold font-mono text-blue-700 mt-1">
              {formatINRCompact(totalProfileValue)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Finished profiles stock</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-400">Reserved for Orders</div>
            <div className="text-xl font-bold font-mono text-purple-700 mt-1">
              {formatNumberIN(totalProfileReserved)} m
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Locked for open sales orders</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-400">Low Stock Profiles</div>
            <div className={`text-xl font-bold font-mono mt-1 ${lowProfileCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {lowProfileCount} Profiles
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Below buffer stock</div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* FILTER BAR */}
      {/* ==================================================== */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap items-center gap-2.5 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isRawMaterialsView
                ? 'Search Chemical Name, Code (e.g. RM-001), category...'
                : 'Search Profile Code (e.g. SCF-FR-60), series name, rack...'
            }
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:border-red-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
        >
          <option value="ALL">Status: All</option>
          <option value="Healthy">Healthy Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Critical">Critical Shortage</option>
        </select>
      </div>

      {/* ==================================================== */}
      {/* VIEW 1: RAW MATERIALS ONLY (When in Raw Materials module) */}
      {/* ==================================================== */}
      {isRawMaterialsView ? (
        rmTab === 'silos' ? (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                    <th className="py-2.5 px-3">Chemical Code</th>
                    <th className="py-2.5 px-3">Material Name & Chemical Category</th>
                    <th className="py-2.5 px-3 text-right">Available Silo (kg)</th>
                    <th className="py-2.5 px-3 text-right">Reserved (kg)</th>
                    <th className="py-2.5 px-3 text-right">Min Level (kg)</th>
                    <th className="py-2.5 px-3 text-right">Avg Cost (₹/kg)</th>
                    <th className="py-2.5 px-3">Supplier & Batch</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rawMaterials
                    .filter((rm) => {
                      const q = search.toLowerCase();
                      const matchesSearch =
                        !q ||
                        rm.code.toLowerCase().includes(q) ||
                        rm.name.toLowerCase().includes(q) ||
                        rm.category.toLowerCase().includes(q);
                      const matchesStatus =
                        statusFilter === 'ALL' ||
                        rm.status === statusFilter ||
                        (statusFilter === 'Low Stock' && rm.status === 'Low');
                      return matchesSearch && matchesStatus;
                    })
                    .map((rm) => (
                      <tr
                        key={rm.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3 px-3 font-mono font-bold text-red-600">{rm.code}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{rm.name}</div>
                          <div className="text-[10px] text-slate-500">{rm.category}</div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {formatNumberIN(rm.availableQuantity)} {rm.unit}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-500">
                          {formatNumberIN(rm.reservedQuantity)} {rm.unit}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-600">
                          {formatNumberIN(rm.minimumLevel)} {rm.unit}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                          ₹{rm.averageCostPerUnit}/kg
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-slate-800 font-medium">{rm.supplier}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Last: {rm.lastPurchaseDate}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                              rm.status === 'Healthy'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : rm.status === 'Low'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {rm.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setInwardRMModalItem(rm);
                                setInwardRMQty(1000);
                              }}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] cursor-pointer"
                              title="Stock Inward via GRN"
                            >
                              + Inward
                            </button>
                            <button
                              onClick={() => {
                                setChangeQtyModalItem({
                                  id: rm.id,
                                  code: rm.code,
                                  name: rm.name,
                                  category: rm.category,
                                  currentAvailable: rm.availableQuantity,
                                  unit: rm.unit,
                                  isRM: true,
                                });
                                setNewQtyValue(rm.availableQuantity);
                                setQtyUnitMode('meters');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] cursor-pointer shadow-2xs"
                            >
                              <Edit3 className="w-3 h-3 text-slate-500" />
                              <span>Change Qty</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Raw Materials Movement Log */
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase tracking-wide">
              Chemical Inward & Consumption Audit Log
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Chemical Code & Name</th>
                    <th className="py-2.5 px-3">Movement Type</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3">Reference / GRN</th>
                    <th className="py-2.5 px-3">Performed By</th>
                    <th className="py-2.5 px-3">Audit Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {stockMovements
                    .filter((sm) => sm.itemCategory === 'Raw Material')
                    .map((sm) => (
                      <tr key={sm.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-600">{sm.date}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {sm.itemCode} — {sm.itemName}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              sm.movementType === 'Purchase' || sm.movementType === 'Stock Inward'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {sm.movementType}
                          </span>
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-bold ${
                            sm.quantity >= 0 ? 'text-emerald-700' : 'text-red-600'
                          }`}
                        >
                          {sm.quantity >= 0 ? `+${formatNumberIN(sm.quantity)}` : formatNumberIN(sm.quantity)}{' '}
                          {sm.unit}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{sm.referenceId}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-700">{sm.performedBy}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-500 text-[11px]">{sm.notes}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* ==================================================== */
        /* VIEW 2: FINISHED PROFILES ONLY (When in Inventory) */
        /* ==================================================== */
        invTab === 'profiles' ? (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wide text-slate-800">
                UPVC Finished Profile Racks & Sets
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                1 Standard Set = 6 bars of 6m (36 meters)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                    <th className="py-2.5 px-3">Profile Code</th>
                    <th className="py-2.5 px-3">Profile Name & Series</th>
                    <th className="py-2.5 px-2.5">Color Finish</th>
                    <th className="py-2.5 px-3 text-center">Available Sets</th>
                    <th className="py-2.5 px-3 text-center">Pieces / Set</th>
                    <th className="py-2.5 px-3 text-right">Total Meters (Bars)</th>
                    <th className="py-2.5 px-3 text-right">Reserved (m)</th>
                    <th className="py-2.5 px-3">Warehouse Rack</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {profileProducts
                    .filter((p) => {
                      const q = search.toLowerCase();
                      const matchesSearch =
                        !q ||
                        p.code.toLowerCase().includes(q) ||
                        p.name.toLowerCase().includes(q) ||
                        (p.rackLocation && p.rackLocation.toLowerCase().includes(q));
                      const matchesStatus =
                        statusFilter === 'ALL' ||
                        p.status === statusFilter ||
                        (statusFilter === 'Healthy' && p.status === 'Active');
                      return matchesSearch && matchesStatus;
                    })
                    .map((p) => {
                      const pcsPerSet = p.piecesPerSet || 6;
                      const metersPerSet = pcsPerSet * (p.lengthMeters || 6);
                      const setsCount = Math.floor(p.currentStock / metersPerSet);
                      const totalBars = Math.round(p.currentStock / (p.lengthMeters || 6));
                      const isLow = p.currentStock <= p.minimumStock;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-red-600">{p.code}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{p.name}</div>
                            <div className="text-[10px] text-slate-500">{p.category}</div>
                          </td>
                          <td className="py-3 px-2.5 text-slate-700 font-medium">{p.color}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                              {setsCount} Sets
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-600">
                            {pcsPerSet} pcs/set
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                            {formatNumberIN(p.currentStock)} m{' '}
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({totalBars} bars)
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-500">
                            {formatNumberIN(p.reservedStock)} m
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-800">
                            {p.rackLocation || 'Rack A-01'}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                                !isLow
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {!isLow ? 'Healthy' : 'Low Stock'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                setChangeQtyModalItem({
                                  id: p.id,
                                  code: p.code,
                                  name: p.name,
                                  category: 'UPVC Profile',
                                  currentAvailable: p.currentStock,
                                  unit: p.unit,
                                  isRM: false,
                                });
                                setNewQtyValue(p.currentStock);
                                setQtyUnitMode('sets');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] cursor-pointer shadow-2xs"
                            >
                              <Edit3 className="w-3 h-3 text-slate-500" />
                              <span>Change Qty / Sets</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        ) : invTab === 'accessories' ? (
          /* Accessories Tab */
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                    <th className="py-2.5 px-3">Item Code</th>
                    <th className="py-2.5 px-3">Accessory / Hardware Name</th>
                    <th className="py-2.5 px-3 text-right">Available Stock</th>
                    <th className="py-2.5 px-3 text-right">Selling Price</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accessoryProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-red-600">{p.code}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{p.name}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {formatNumberIN(p.currentStock)} {p.unit}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800">
                        ₹{p.sellingPrice}/{p.unit}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setChangeQtyModalItem({
                              id: p.id,
                              code: p.code,
                              name: p.name,
                              category: 'Accessory',
                              currentAvailable: p.currentStock,
                              unit: p.unit,
                              isRM: false,
                            });
                            setNewQtyValue(p.currentStock);
                            setQtyUnitMode('meters');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] cursor-pointer shadow-2xs"
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
        ) : (
          /* Profile Movements Log */
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase tracking-wide">
              Profile Warehouse Movement & Inward History
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Profile Code & Name</th>
                    <th className="py-2.5 px-3">Movement Type</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3">Reference / Batch</th>
                    <th className="py-2.5 px-3">Performed By</th>
                    <th className="py-2.5 px-3">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {stockMovements
                    .filter((sm) => sm.itemCategory !== 'Raw Material')
                    .map((sm) => (
                      <tr key={sm.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-600">{sm.date}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {sm.itemCode} — {sm.itemName}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {sm.movementType}
                          </span>
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-bold ${
                            sm.quantity >= 0 ? 'text-emerald-700' : 'text-red-600'
                          }`}
                        >
                          {sm.quantity >= 0 ? `+${formatNumberIN(sm.quantity)}` : formatNumberIN(sm.quantity)}{' '}
                          {sm.unit}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{sm.referenceId}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-700">{sm.performedBy}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-500 text-[11px]">{sm.notes}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* ==================================================== */}
      {/* MODAL 1: ADD PROFILE STOCK (Sets & Pieces in each set) */}
      {/* ==================================================== */}
      {showBundleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-red-600" />
                  <span>Add Profile Stock (Sets & Pieces)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Manually receive finished extruded profile sets, set pieces per set, and assign warehouse rack.
                </p>
              </div>
              <button
                onClick={() => setShowBundleModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Profile Selection Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800">Select or Enter Profile *</label>
                  <div className="inline-flex bg-slate-100 p-0.5 rounded text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setBundleProfileMode('catalog')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        bundleProfileMode === 'catalog'
                          ? 'bg-white text-red-600 font-bold shadow-2xs'
                          : 'text-slate-600'
                      }`}
                    >
                      From Catalog
                    </button>
                    <button
                      type="button"
                      onClick={() => setBundleProfileMode('manual')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        bundleProfileMode === 'manual'
                          ? 'bg-white text-red-600 font-bold shadow-2xs'
                          : 'text-slate-600'
                      }`}
                    >
                      ✏️ Manual / Custom Name
                    </button>
                  </div>
                </div>

                {bundleProfileMode === 'catalog' ? (
                  <select
                    value={bundleProductId}
                    onChange={(e) => setBundleProductId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded bg-white font-medium text-slate-800 focus:outline-none focus:border-red-500"
                  >
                    {profileProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.name} ({p.color}) • Currently {p.currentStock}m
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-2 p-2.5 bg-slate-50 rounded border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Profile Name *
                      </label>
                      <input
                        type="text"
                        value={bundleCustomName}
                        onChange={(e) => setBundleCustomName(e.target.value)}
                        placeholder="e.g. 3-Track Casement Window Frame or 3-Track Sliding Villa Frame"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Code (Optional)
                        </label>
                        <input
                          type="text"
                          value={bundleCustomCode}
                          onChange={(e) => setBundleCustomCode(e.target.value)}
                          placeholder="e.g. SCF-3T-CASEMENT"
                          className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Color Finish
                        </label>
                        <select
                          value={bundleCustomColor}
                          onChange={(e) => setBundleCustomColor(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                        >
                          <option value="White">White</option>
                          <option value="Anthracite Grey">Anthracite Grey</option>
                          <option value="Walnut Wood">Walnut Wood</option>
                          <option value="Golden Oak">Golden Oak</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sets Count & Pieces in each set */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-red-50/50 rounded-lg border border-red-200 space-y-1">
                  <label className="block font-bold text-red-950">
                    Number of Sets to Add *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={bundleSetsCount}
                      onChange={(e) => setBundleSetsCount(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 border border-red-300 rounded font-mono font-bold text-slate-900 bg-white"
                    />
                    <span className="font-semibold text-slate-700 whitespace-nowrap">Sets</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <label className="block font-bold text-slate-800">
                    Pieces in Each Set *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={bundlePiecesPerSet}
                      onChange={(e) => setBundlePiecesPerSet(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono font-bold text-slate-900 bg-white"
                    />
                    <span className="font-semibold text-slate-700 whitespace-nowrap">pcs / set</span>
                  </div>
                </div>
              </div>

              {/* Automatic Calculation Badge */}
              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-950 font-mono text-xs flex items-center justify-between">
                <span>Total Inward Calculation:</span>
                <span className="font-bold">
                  {bundleSetsCount} Sets × {bundlePiecesPerSet} Pieces ={' '}
                  <span className="text-emerald-700">
                    {bundleSetsCount * bundlePiecesPerSet} Bars (
                    {formatNumberIN(bundleSetsCount * bundlePiecesPerSet * (bundleBarLength || 6.0))}{' '}
                    Meters)
                  </span>
                </span>
              </div>

              {/* Rack Location & Inward Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Warehouse Rack / Bay</label>
                  <input
                    type="text"
                    value={bundleRack}
                    onChange={(e) => setBundleRack(e.target.value)}
                    placeholder="e.g. Warehouse Rack B-04"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch / Shift Notes</label>
                  <input
                    type="text"
                    value={bundleNotes}
                    onChange={(e) => setBundleNotes(e.target.value)}
                    placeholder="e.g. Received from Extrusion Line 04"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBundleModal(false)}
                className="py-1.5 px-4 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmProfileBundleStock}
                className="py-1.5 px-4 rounded bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer text-xs shadow-xs"
              >
                Confirm & Add Profile Sets
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: ADD RAW MATERIAL / CHEMICAL COMPOUND */}
      {/* ==================================================== */}
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
                  Add chemical ingredient, polymer, or additive into the Silo inventory.
                </p>
              </div>
              <button
                onClick={() => setShowAddMaterialModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Category *</label>
                    <div className="flex items-center bg-slate-100 p-0.5 rounded text-[10px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setIsCustomCategory(false)}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          !isCustomCategory
                            ? 'bg-white text-red-600 font-bold shadow-2xs'
                            : 'text-slate-500'
                        }`}
                      >
                        Dropdown
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCustomCategory(true)}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          isCustomCategory
                            ? 'bg-white text-red-600 font-bold shadow-2xs'
                            : 'text-slate-500'
                        }`}
                      >
                        ✏️ Manual
                      </button>
                    </div>
                  </div>

                  {!isCustomCategory ? (
                    <select
                      value={newMatCategory}
                      onChange={(e) => {
                        if (e.target.value === '__CUSTOM__') {
                          setIsCustomCategory(true);
                        } else {
                          setNewMatCategory(e.target.value);
                        }
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 text-xs focus:border-red-500 focus:outline-none"
                    >
                      <option value="Base Polymer">Base Polymer</option>
                      <option value="Filler">Filler (CaCO3)</option>
                      <option value="Pigment">Pigment (TiO2 / Toner)</option>
                      <option value="Stabilizer & Additive">Stabilizer & Additive</option>
                      <option value="Impact Modifier">Impact Modifier (CPE)</option>
                      <option value="Lubricant & Wax">Lubricant & Wax (PE Wax)</option>
                      <option value="Processing Aid">Processing Aid (ACR)</option>
                      <option value="__CUSTOM__">✏️ + Write Custom Category...</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={newMatCategory}
                      onChange={(e) => setNewMatCategory(e.target.value)}
                      placeholder="Write category manually..."
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs text-slate-900 focus:border-red-500 focus:outline-none"
                    />
                  )}
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
                    placeholder="e.g. Chemours / Reliance"
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

      {/* ==================================================== */}
      {/* MODAL 3: INWARD GRN FOR RAW MATERIALS */}
      {/* ==================================================== */}
      {inwardRMModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                + Stock Inward (GRN) — {inwardRMModalItem.code}
              </h3>
              <button
                onClick={() => setInwardRMModalItem(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <div className="font-bold text-slate-900">{inwardRMModalItem.name}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Current Silo: {formatNumberIN(inwardRMModalItem.availableQuantity)} kg
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Inward Quantity (kg) *
                </label>
                <input
                  type="number"
                  min={1}
                  value={inwardRMQty}
                  onChange={(e) => setInwardRMQty(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono font-bold text-slate-900 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">GRN / Delivery Challan Notes</label>
                <input
                  type="text"
                  value={inwardRMNotes}
                  onChange={(e) => setInwardRMNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setInwardRMModalItem(null)}
                className="py-1.5 px-3 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmInwardRM}
                className="py-1.5 px-4 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer text-xs shadow-xs"
              >
                Confirm Inward (+{formatNumberIN(inwardRMQty)} kg)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: DIRECT QUANTITY CHANGE MODAL */}
      {/* ==================================================== */}
      {changeQtyModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                Modify Stock Quantity — {changeQtyModalItem.code}
              </h3>
              <button
                onClick={() => setChangeQtyModalItem(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <div className="font-bold text-slate-900">{changeQtyModalItem.name}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Current Stock: {formatNumberIN(changeQtyModalItem.currentAvailable)}{' '}
                  {changeQtyModalItem.unit}
                </div>
              </div>

              {changeQtyModalItem.category === 'UPVC Profile' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Mode</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-0.5 rounded text-center font-semibold text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        if (qtyUnitMode === 'sets') {
                          setNewQtyValue(newQtyValue * 36);
                        }
                        setQtyUnitMode('meters');
                      }}
                      className={`py-1 rounded cursor-pointer ${
                        qtyUnitMode === 'meters'
                          ? 'bg-white text-red-600 shadow-2xs font-bold'
                          : 'text-slate-600'
                      }`}
                    >
                      Meters (6m bars)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (qtyUnitMode === 'meters') {
                          setNewQtyValue(Math.floor(newQtyValue / 36));
                        }
                        setQtyUnitMode('sets');
                      }}
                      className={`py-1 rounded cursor-pointer ${
                        qtyUnitMode === 'sets'
                          ? 'bg-white text-red-600 shadow-2xs font-bold'
                          : 'text-slate-600'
                      }`}
                    >
                      Sets of 6 Pcs
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Adjusted Stock Quantity</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={newQtyValue}
                    onChange={(e) => setNewQtyValue(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono font-bold text-slate-900 text-sm bg-white"
                  />
                  <span className="font-semibold text-slate-600 whitespace-nowrap">
                    {changeQtyModalItem.category === 'UPVC Profile' && qtyUnitMode === 'sets'
                      ? 'Sets of 6'
                      : changeQtyModalItem.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Adjustment</label>
                <input
                  type="text"
                  value={changeQtyReason}
                  onChange={(e) => setChangeQtyReason(e.target.value)}
                  placeholder="e.g. Physical inventory count, damaged scrap..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
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
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
