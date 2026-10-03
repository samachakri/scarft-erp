import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Factory,
  Handshake,
  Package,
  Layers,
  Warehouse,
  Boxes,
  Calculator,
  Cpu,
  FileText,
  ShoppingCart,
  Truck,
  IndianRupee,
  BarChart3,
  UserCheck,
  ShieldCheck,
  History,
  Settings,
  ChevronDown,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ROLE_ALLOWED_MODULES } from '../../services/rbac';
import { ModuleKey } from '../../types/erp';

interface NavGroup {
  label: string;
  items: {
    key: ModuleKey;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC = () => {
  const {
    activeModule,
    navigateTo,
    currentEmployee,
    leads,
    quotations,
    salesOrders,
    productionOrders,
    rawMaterials,
    payments,
  } = useERP();

  const allowedModules = ROLE_ALLOWED_MODULES[currentEmployee.role];

  const newLeadsCount = leads.filter((l) => l.status === 'New').length;
  const pendingApprovalQuotes = quotations.filter((q) => q.status === 'Pending Approval').length;
  const activeOrdersCount = salesOrders.filter((o) => o.status !== 'Completed').length;
  const lowRawMaterialsCount = rawMaterials.filter((r) => r.status !== 'Healthy').length;
  const activeProdCount = productionOrders.filter((p) => p.productionStatus === 'In Production').length;
  const overduePaymentsCount = payments.filter((p) => p.status === 'Overdue').length;

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupLabel: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupLabel]: !prev[groupLabel] }));
  };

  const navGroups: NavGroup[] = [
    {
      label: 'OPERATIONS CORE',
      items: [
        {
          key: 'dashboard',
          label: currentEmployee.role === 'Sales Executive' ? 'My Dashboard' : 'Dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
          key: 'leads',
          label: 'Leads',
          icon: <Users className="w-4 h-4" />,
          badge: newLeadsCount > 0 ? newLeadsCount : undefined,
          badgeColor: 'bg-red-100 text-red-700',
        },
      ],
    },
    {
      label: 'CUSTOMERS',
      items: [
        {
          key: 'fabricators',
          label: 'Fabricators',
          icon: <Factory className="w-4 h-4" />,
        },
        {
          key: 'dealers',
          label: 'Dealers',
          icon: <Handshake className="w-4 h-4" />,
        },
      ],
    },
    {
      label: 'COMMERCIAL & SALES',
      items: [
        {
          key: 'quotations',
          label: 'Quotations',
          icon: <FileText className="w-4 h-4" />,
          badge: pendingApprovalQuotes > 0 ? pendingApprovalQuotes : undefined,
          badgeColor: 'bg-amber-100 text-amber-800',
        },
        {
          key: 'orders',
          label: 'Sales Orders',
          icon: <ShoppingCart className="w-4 h-4" />,
          badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
          badgeColor: 'bg-slate-200 text-slate-700',
        },
      ],
    },
    {
      label: 'PRODUCTS & BOM',
      items: [
        {
          key: 'products',
          label: 'UPVC Profiles & Pricing',
          icon: <Package className="w-4 h-4" />,
        },
        {
          key: 'bom',
          label: 'Bill of Materials',
          icon: <Layers className="w-4 h-4" />,
        },
      ],
    },
    {
      label: 'INVENTORY & MRP',
      items: [
        {
          key: 'inventory',
          label: 'Inventory Overview',
          icon: <Warehouse className="w-4 h-4" />,
        },
        {
          key: 'raw_materials',
          label: 'Raw Materials',
          icon: <Boxes className="w-4 h-4" />,
          badge: lowRawMaterialsCount > 0 ? `${lowRawMaterialsCount} Low` : undefined,
          badgeColor: 'bg-red-100 text-red-700',
        },
        {
          key: 'material_requirements',
          label: 'Material Requirements',
          icon: <Calculator className="w-4 h-4" />,
        },
      ],
    },
    {
      label: 'PLANT & LOGISTICS',
      items: [
        {
          key: 'production',
          label: 'Production & Extrusion',
          icon: <Cpu className="w-4 h-4" />,
          badge: activeProdCount > 0 ? `${activeProdCount} Live` : undefined,
          badgeColor: 'bg-emerald-100 text-emerald-800',
        },
        {
          key: 'dispatch',
          label: 'Dispatch',
          icon: <Truck className="w-4 h-4" />,
        },
        {
          key: 'payments',
          label: 'Payments',
          icon: <IndianRupee className="w-4 h-4" />,
          badge: overduePaymentsCount > 0 ? overduePaymentsCount : undefined,
          badgeColor: 'bg-red-100 text-red-700',
        },
        {
          key: 'reports',
          label: 'Reports & Analytics',
          icon: <BarChart3 className="w-4 h-4" />,
        },
      ],
    },
    {
      label: 'ADMINISTRATION',
      items: [
        {
          key: 'employees',
          label: 'Employees',
          icon: <UserCheck className="w-4 h-4" />,
        },
        {
          key: 'roles',
          label: 'Roles & Permissions',
          icon: <ShieldCheck className="w-4 h-4" />,
        },
        {
          key: 'activity_logs',
          label: 'Activity Logs',
          icon: <History className="w-4 h-4" />,
        },
        {
          key: 'settings',
          label: 'Settings & n8n Hooks',
          icon: <Settings className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-xs">
            SC
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 leading-none tracking-tight">
              SCraft <span className="text-red-600">ERP</span>
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mt-0.5">
              UPVC Manufacturing
            </div>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
          v4.2
        </span>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => allowedModules.includes(item.key));
          if (visibleItems.length === 0) return null;
          const isCollapsed = collapsedGroups[group.label];

          return (
            <div key={group.label}>
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600"
              >
                <span>{group.label}</span>
                {isCollapsed ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>

              {!isCollapsed && (
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive = activeModule === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => navigateTo(item.key, null)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-red-50 text-red-700 font-semibold border-l-3 border-red-600'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className={isActive ? 'text-red-600' : 'text-slate-400'}>
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                              item.badgeColor || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Extrusion Plant Telemetry Box */}
      <div className="p-2.5 border-t border-slate-200 bg-slate-50">
        <div className="bg-white border border-slate-200 rounded-md p-2.5 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            <span>EXTRUSION LINES</span>
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operational
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs font-semibold text-slate-800">
            <span>Line 1 to 6 Active</span>
            <span className="font-mono text-emerald-700">98.4% Eff</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 flex items-center gap-1">
            <Activity className="w-3 h-3 text-red-600" />
            <span>Bhiwadi Unit 04 • Silo Pressure OK</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
