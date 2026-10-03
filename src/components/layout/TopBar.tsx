import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  MessageSquare,
  Shield,
  ChevronDown,
  Factory,
  FileText,
  ShoppingCart,
  Package,
  Users,
  Cpu,
  IndianRupee,
  Handshake,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { RoleName } from '../../types/erp';
import { formatINR } from '../../services/rbac';

const ALL_ROLES: RoleName[] = [
  'Super Admin',
  'Admin',
  'Sales Manager',
  'Sales Executive',
  'Inventory Manager',
  'Production Manager',
  'Production Staff',
  'Accounts Manager',
  'Accounts Executive',
];

export const TopBar: React.FC = () => {
  const {
    currentEmployee,
    switchRole,
    navigateTo,
    simulateWhatsAppLead,
    setQuickCreateModal,
    fabricators,
    dealers,
    leads,
    products,
    quotations,
    salesOrders,
    productionOrders,
    payments,
    rawMaterials,
    toastMessage,
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const q = searchQuery.trim().toLowerCase();

  const matchedProducts = q
    ? products.filter((p) => p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)).slice(0, 4)
    : [];
  const matchedFabricators = q
    ? fabricators.filter((f) => f.id.toLowerCase().includes(q) || f.name.toLowerCase().includes(q) || f.city.toLowerCase().includes(q)).slice(0, 4)
    : [];
  const matchedDealers = q
    ? dealers.filter((d) => d.id.toLowerCase().includes(q) || d.name.toLowerCase().includes(q)).slice(0, 3)
    : [];
  const matchedLeads = q
    ? leads.filter((l) => l.id.toLowerCase().includes(q) || l.companyName.toLowerCase().includes(q) || l.name.toLowerCase().includes(q)).slice(0, 3)
    : [];
  const matchedQuotations = q
    ? quotations.filter((qt) => qt.id.toLowerCase().includes(q) || qt.fabricatorName.toLowerCase().includes(q) || qt.items.some((i) => i.profileCode.toLowerCase().includes(q))).slice(0, 4)
    : [];
  const matchedOrders = q
    ? salesOrders.filter((o) => o.id.toLowerCase().includes(q) || o.fabricatorName.toLowerCase().includes(q) || o.items.some((i) => i.profileCode.toLowerCase().includes(q))).slice(0, 4)
    : [];
  const matchedProdOrders = q
    ? productionOrders.filter((po) => po.id.toLowerCase().includes(q) || po.profileCode.toLowerCase().includes(q)).slice(0, 3)
    : [];
  const matchedPayments = q
    ? payments.filter((pay) => pay.id.toLowerCase().includes(q) || pay.fabricatorName.toLowerCase().includes(q) || pay.orderId.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const totalResults =
    matchedProducts.length +
    matchedFabricators.length +
    matchedDealers.length +
    matchedLeads.length +
    matchedQuotations.length +
    matchedOrders.length +
    matchedProdOrders.length +
    matchedPayments.length;

  // Pending Action Alerts for Notification Bell
  const pendingApprovalCount = quotations.filter((qt) => qt.status === 'Pending Approval').length;
  const lowMaterialsCount = rawMaterials.filter((rm) => rm.status !== 'Healthy').length;
  const delayedProductionCount = productionOrders.filter((po) => po.productionStatus === 'Delayed').length;
  const overduePaymentsCount = payments.filter((p) => p.status === 'Overdue').length;
  const totalAlerts =
    (pendingApprovalCount > 0 ? 1 : 0) +
    (lowMaterialsCount > 0 ? 1 : 0) +
    (delayedProductionCount > 0 ? 1 : 0) +
    (overduePaymentsCount > 0 ? 1 : 0);

  return (
    <header className="h-14 bg-white border-b border-slate-200 fixed top-0 left-60 right-0 z-20 px-5 flex items-center justify-between gap-4">
      {/* Left: Plant Badge & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <div className="hidden xl:flex items-center gap-2 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-700 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Plant Unit 04 • Bhiwadi</span>
        </div>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative flex-1">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              placeholder='Global Search: Try "SCF-FR-60", "Royal Window", "QT-2026-00421", "SO-2026-1082"...'
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchOpen && q.length > 0 && (
            <div className="absolute left-0 right-0 top-10 bg-white border border-slate-200 rounded-lg shadow-xl max-h-[440px] overflow-y-auto z-50 divide-y divide-slate-100">
              <div className="px-3 py-2 bg-slate-50 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>GLOBAL ERP SEARCH RESULTS FOR "{searchQuery}"</span>
                <span>{totalResults} matches</span>
              </div>

              {totalResults === 0 && (
                <div className="p-6 text-center text-xs text-slate-500">
                  No matching records found across Products, Fabricators, Quotations, Orders, or Inventory.
                </div>
              )}

              {matchedProducts.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">
                    Products & Inventory ({matchedProducts.length})
                  </div>
                  {matchedProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        navigateTo('products', p.id);
                        setSearchOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-slate-50 rounded text-left text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-red-600" />
                        <span className="font-mono font-semibold text-slate-900">{p.code}</span>
                        <span className="text-slate-600">{p.name}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        Stock: {p.currentStock} {p.unit} • ₹{p.sellingPrice}/{p.unit === 'meters' ? 'm' : 'pc'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {matchedFabricators.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">
                    Fabricators ({matchedFabricators.length})
                  </div>
                  {matchedFabricators.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        navigateTo('fabricators', f.id);
                        setSearchOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-slate-50 rounded text-left text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Factory className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-mono font-semibold text-slate-900">{f.id}</span>
                        <span className="text-slate-700 font-medium">{f.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{f.location}</span>
                    </button>
                  ))}
                </div>
              )}

              {matchedQuotations.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">
                    Quotations ({matchedQuotations.length})
                  </div>
                  {matchedQuotations.map((qt) => (
                    <button
                      key={qt.id}
                      onClick={() => {
                        navigateTo('quotations', qt.id);
                        setSearchOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-slate-50 rounded text-left text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-mono font-semibold text-slate-900">{qt.id}</span>
                        <span className="text-slate-600">{qt.fabricatorName}</span>
                      </div>
                      <span className="text-[11px] font-mono font-semibold text-slate-700">
                        {formatINR(qt.grandTotal)} • {qt.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {matchedOrders.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">
                    Sales Orders ({matchedOrders.length})
                  </div>
                  {matchedOrders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => {
                        navigateTo('orders', o.id);
                        setSearchOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-slate-50 rounded text-left text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-mono font-semibold text-slate-900">{o.id}</span>
                        <span className="text-slate-600">{o.fabricatorName}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-600">
                        {formatINR(o.orderValue)} • {o.workflowStage}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {matchedProdOrders.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">
                    Production Orders ({matchedProdOrders.length})
                  </div>
                  {matchedProdOrders.map((po) => (
                    <button
                      key={po.id}
                      onClick={() => {
                        navigateTo('production', po.id);
                        setSearchOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-slate-50 rounded text-left text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-purple-600" />
                        <span className="font-mono font-semibold text-slate-900">{po.id}</span>
                        <span className="text-slate-600">
                          {po.profileCode} ({po.producedQuantity}/{po.requiredQuantity}m)
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">{po.productionStatus}</span>
                    </button>
                  ))}
                </div>
              )}

              {(matchedDealers.length > 0 || matchedLeads.length > 0 || matchedPayments.length > 0) && (
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">
                    Dealers, Leads & Payments
                  </div>
                  {matchedDealers.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        navigateTo('dealers', d.id);
                        setSearchOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-slate-50 rounded text-left text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Handshake className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="font-mono font-semibold">{d.id}</span>
                        <span>{d.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{d.fabricatorIds.length} Fabricators</span>
                    </button>
                  ))}
                  {matchedLeads.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        navigateTo('leads', l.id);
                        setSearchOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-slate-50 rounded text-left text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-mono font-semibold">{l.id}</span>
                        <span>{l.companyName}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{l.source} • {l.status}</span>
                    </button>
                  ))}
                  {matchedPayments.map((pay) => (
                    <button
                      key={pay.id}
                      onClick={() => {
                        navigateTo('payments', pay.id);
                        setSearchOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-slate-50 rounded text-left text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="font-mono font-semibold">{pay.id}</span>
                        <span>{pay.fabricatorName}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">Order {pay.orderId}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center Toast Banner if active */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-lg border text-xs font-semibold transition-all ${
            toastMessage.type === 'warning'
              ? 'bg-amber-900 text-white border-amber-700'
              : toastMessage.type === 'info'
              ? 'bg-slate-900 text-white border-slate-700'
              : 'bg-emerald-900 text-white border-emerald-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Right Action Bar: Simulate WhatsApp Lead, Quick Create, Notifications, Role Switcher */}
      <div className="flex items-center gap-2.5">
        {/* Simulate WhatsApp Lead Button */}
        <button
          onClick={() => {
            const lead = simulateWhatsAppLead();
            navigateTo('leads', lead.id);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
          title="Simulate incoming WhatsApp lead via n8n webhook"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden md:inline">Simulate WhatsApp Lead</span>
        </button>

        {/* Global + Create Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setQuickCreateOpen((prev) => !prev);
              setNotificationsOpen(false);
              setRoleMenuOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {quickCreateOpen && (
            <div className="absolute right-0 top-10 w-52 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 z-50 text-xs">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick Create Record
              </div>
              {[
                { key: 'lead', label: 'New Lead', icon: <Users className="w-3.5 h-3.5 text-emerald-600" /> },
                { key: 'fabricator', label: 'New Fabricator', icon: <Factory className="w-3.5 h-3.5 text-blue-600" /> },
                { key: 'dealer', label: 'New Dealer', icon: <Handshake className="w-3.5 h-3.5 text-indigo-600" /> },
                { key: 'quotation', label: 'New Quotation', icon: <FileText className="w-3.5 h-3.5 text-amber-600" /> },
                { key: 'order', label: 'New Sales Order', icon: <ShoppingCart className="w-3.5 h-3.5 text-red-600" /> },
                { key: 'stock', label: 'Raw Material Stock Entry', icon: <Package className="w-3.5 h-3.5 text-teal-600" /> },
                { key: 'production', label: 'New Production Order', icon: <Cpu className="w-3.5 h-3.5 text-purple-600" /> },
                { key: 'payment', label: 'Record Payment', icon: <IndianRupee className="w-3.5 h-3.5 text-emerald-700" /> },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setQuickCreateOpen(false);
                    if (item.key === 'quotation') {
                      navigateTo('quotations', 'CREATE_NEW');
                    } else {
                      setQuickCreateModal(item.key);
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium text-left"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen((prev) => !prev);
              setQuickCreateOpen(false);
              setRoleMenuOpen(false);
            }}
            className="relative p-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center absolute -top-0.5 -right-0.5">
                {totalAlerts}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-10 w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden text-xs">
              <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-semibold text-slate-800">
                <span>Pending Operational Actions</span>
                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                  Action Required
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigateTo('quotations', null);
                  }}
                  className="w-full p-3 hover:bg-slate-50 text-left flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900">
                      {pendingApprovalCount} quotations waiting for approval
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Includes QT-2026-00421 (Royal Window Systems)
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigateTo('raw_materials', null);
                  }}
                  className="w-full p-3 hover:bg-slate-50 text-left flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900">
                      {lowMaterialsCount} materials below minimum stock
                    </div>
                    <div className="text-[11px] text-slate-500">
                      UPVC Resin RM-001 (1,200 kg vs 1,500 kg min) & Rutile TiO2
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigateTo('production', null);
                  }}
                  className="w-full p-3 hover:bg-slate-50 text-left flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900">
                      {delayedProductionCount} production orders delayed
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Extruder Line 04 Lamination & Bay Coupling batch
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigateTo('payments', null);
                  }}
                  className="w-full p-3 hover:bg-slate-50 text-left flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900">
                      {overduePaymentsCount} payments overdue
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Follow up required with Vertex uPVC & Kalyan Fab
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher & Logged-In Employee Profile */}
        <div className="relative pl-2 border-l border-slate-200">
          <button
            onClick={() => {
              setRoleMenuOpen((prev) => !prev);
              setQuickCreateOpen(false);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2.5 py-1 px-2 rounded-md hover:bg-slate-100 transition-colors text-left cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
              {currentEmployee.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                <span>{currentEmployee.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </div>
              <div className="text-[10px] font-semibold text-red-600 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" />
                <span>Role: {currentEmployee.role}</span>
              </div>
            </div>
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 top-11 w-64 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50 text-xs">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  PROTOTYPE ROLE SWITCHER
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Switch employee role to test RBAC sidebar visibility & quotation approval permissions:
                </div>
              </div>
              <div className="py-1 max-h-72 overflow-y-auto">
                {ALL_ROLES.map((r) => {
                  const active = currentEmployee.role === r;
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 ${
                        active ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span>{r}</span>
                      {active && (
                        <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
