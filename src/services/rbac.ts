import { ModuleKey, RoleName } from '../types/erp';

export const ROLE_ALLOWED_MODULES: Record<RoleName, ModuleKey[]> = {
  'Super Admin': [
    'dashboard',
    'leads',
    'fabricators',
    'dealers',
    'products',
    'bom',
    'inventory',
    'raw_materials',
    'material_requirements',
    'production',
    'quotations',
    'orders',
    'dispatch',
    'payments',
    'reports',
    'employees',
    'roles',
    'activity_logs',
    'settings',
  ],
  Admin: [
    'dashboard',
    'leads',
    'fabricators',
    'dealers',
    'products',
    'bom',
    'inventory',
    'raw_materials',
    'material_requirements',
    'production',
    'quotations',
    'orders',
    'dispatch',
    'payments',
    'reports',
    'employees',
    'roles',
    'activity_logs',
    'settings',
  ],
  'Sales Manager': [
    'dashboard',
    'leads',
    'fabricators',
    'dealers',
    'products',
    'quotations',
    'orders',
    'reports',
  ],
  'Sales Executive': [
    'dashboard',
    'leads',
    'fabricators',
    'dealers',
    'products',
    'quotations',
    'orders',
  ],
  'Inventory Manager': [
    'dashboard',
    'products',
    'bom',
    'inventory',
    'raw_materials',
    'material_requirements',
    'dispatch',
  ],
  'Production Manager': [
    'dashboard',
    'products',
    'bom',
    'inventory',
    'material_requirements',
    'production',
    'orders',
  ],
  'Production Staff': [
    'dashboard',
    'products',
    'bom',
    'material_requirements',
    'production',
  ],
  'Accounts Manager': [
    'dashboard',
    'fabricators',
    'quotations',
    'orders',
    'dispatch',
    'payments',
    'reports',
  ],
  'Accounts Executive': [
    'dashboard',
    'orders',
    'payments',
    'reports',
  ],
};

export interface RolePermissionsMatrix {
  canApproveQuotation: boolean;
  canCreateQuotation: boolean;
  canConvertLead: boolean;
  canManageInventory: boolean;
  canManageProduction: boolean;
  canManageDispatch: boolean;
  canRecordPayment: boolean;
  canManageAdmin: boolean;
}

export function getPermissionsForRole(role: RoleName): RolePermissionsMatrix {
  return {
    canApproveQuotation: ['Super Admin', 'Admin', 'Sales Manager'].includes(role),
    canCreateQuotation: ['Super Admin', 'Admin', 'Sales Manager', 'Sales Executive'].includes(role),
    canConvertLead: ['Super Admin', 'Admin', 'Sales Manager', 'Sales Executive'].includes(role),
    canManageInventory: ['Super Admin', 'Admin', 'Inventory Manager'].includes(role),
    canManageProduction: ['Super Admin', 'Admin', 'Production Manager', 'Production Staff'].includes(role),
    canManageDispatch: ['Super Admin', 'Admin', 'Inventory Manager', 'Production Manager'].includes(role),
    canRecordPayment: ['Super Admin', 'Admin', 'Accounts Manager', 'Accounts Executive'].includes(role),
    canManageAdmin: ['Super Admin', 'Admin'].includes(role),
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRCompact(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return formatINR(amount);
}

export function formatNumberIN(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

// In Indian UPVC profile manufacturing, standard extruded bars are 6 meters long
// and packed in Sets / Bundles of 6 pieces (1 Set = 6 pcs = 36 meters).
export function metersToBundles(meters: number, barLengthM = 6, pcsPerBundle = 6): {
  bundles: number;
  pieces: number;
  meterPerBundle: number;
} {
  const meterPerBundle = barLengthM * pcsPerBundle; // 36 meters
  const bundles = Math.floor(meters / meterPerBundle);
  const remainingMeters = meters % meterPerBundle;
  const pieces = Math.ceil(remainingMeters / barLengthM);
  return { bundles, pieces, meterPerBundle };
}

export function bundlesToMeters(bundles: number, pieces = 0, barLengthM = 6): number {
  return bundles * (6 * barLengthM) + pieces * barLengthM;
}

export function formatBundlesText(meters: number): string {
  if (!meters || meters <= 0) return '0 Sets';
  const { bundles, pieces } = metersToBundles(meters);
  if (bundles === 0) return `${pieces} pcs (${pieces * 6}m)`;
  if (pieces === 0) return `${bundles} Sets (${bundles * 6} pcs)`;
  return `${bundles} Sets + ${pieces} pcs`;
}
