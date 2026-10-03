import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  ShieldCheck,
  History,
  Settings,
  Webhook,
  Check,
  X,
  ArrowRight,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { ROLE_ALLOWED_MODULES, getPermissionsForRole } from '../services/rbac';
import { RoleName, WebhookEventType } from '../types/erp';

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

const SUPPORTED_WEBHOOK_EVENTS: WebhookEventType[] = [
  'lead.created',
  'lead.updated',
  'fabricator.created',
  'quotation.created',
  'quotation.approved',
  'order.created',
  'production.started',
  'production.completed',
  'dispatch.created',
  'payment.received',
];

export const AdministrationPage: React.FC = () => {
  const {
    activeModule,
    employees,
    fabricators,
    activityLogs,
    webhookEvents,
    currentEmployee,
    switchRole,
    navigateTo,
    simulateWhatsAppLead,
  } = useERP();

  const [tab, setTab] = useState<'employees' | 'roles' | 'activity_logs' | 'settings'>('employees');
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || 'EMP-001');

  useEffect(() => {
    if (
      activeModule === 'employees' ||
      activeModule === 'roles' ||
      activeModule === 'activity_logs' ||
      activeModule === 'settings'
    ) {
      setTab(activeModule);
    }
  }, [activeModule]);

  const selectedEmployee =
    employees.find((e) => e.id === selectedEmpId) || employees[0];
  const empPermissions = getPermissionsForRole(selectedEmployee.role);
  const empFabricators = fabricators.filter((f) =>
    selectedEmployee.assignedFabricatorIds.includes(f.id)
  );

  return (
    <div className="space-y-4">
      {/* Header & Tabs */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">
              System Administration, RBAC & Audit Logs
            </h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
              INTERNAL GOVERNANCE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage SCraft employees, role-based access control permissions, before/after audit trails, and future n8n webhook architecture.
          </p>
        </div>

        <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          {[
            { key: 'employees', label: 'Employees', icon: <UserCheck className="w-3.5 h-3.5" /> },
            {
              key: 'roles',
              label: 'Roles & Permissions',
              icon: <ShieldCheck className="w-3.5 h-3.5" />,
            },
            {
              key: 'activity_logs',
              label: 'Activity Logs',
              icon: <History className="w-3.5 h-3.5" />,
            },
            {
              key: 'settings',
              label: 'Settings & n8n Webhooks',
              icon: <Settings className="w-3.5 h-3.5" />,
            },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                tab === t.key
                  ? 'bg-white text-red-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: EMPLOYEES (Section 22) */}
      {tab === 'employees' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-2.5">Employee ID</th>
                  <th className="py-2.5 px-2.5">Department</th>
                  <th className="py-2.5 px-2.5">Role</th>
                  <th className="py-2.5 px-2.5">Manager</th>
                  <th className="py-2.5 px-2.5">Last Active</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => {
                  const isSelected = selectedEmployee.id === emp.id;
                  return (
                    <tr
                      key={emp.id}
                      onClick={() => setSelectedEmpId(emp.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-red-50/70 border-l-3 border-l-red-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="text-[10px] text-slate-500">{emp.email}</div>
                      </td>
                      <td className="py-3 px-2.5 font-mono font-bold text-red-600">
                        {emp.employeeCode}
                      </td>
                      <td className="py-3 px-2.5 text-slate-700">{emp.department}</td>
                      <td className="py-3 px-2.5 font-semibold text-slate-900">{emp.role}</td>
                      <td className="py-3 px-2.5 text-slate-600">{emp.managerName}</td>
                      <td className="py-3 px-2.5 text-[11px] text-slate-500">{emp.lastActive}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Employee Detail Card */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between text-[11px] font-bold">
              <span>EMPLOYEE PROFILE • {selectedEmployee.employeeCode}</span>
              <span>{selectedEmployee.role}</span>
            </div>
            <div className="p-4 space-y-4 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{selectedEmployee.name}</h2>
                  <p className="text-[11px] text-slate-500">
                    {selectedEmployee.department} • {selectedEmployee.plantUnit}
                  </p>
                </div>
                <button
                  onClick={() => switchRole(selectedEmployee.role)}
                  className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer"
                >
                  Simulate This User
                </button>
              </div>

              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Work Email</div>
                  <div className="font-medium text-slate-900 mt-0.5 truncate">
                    {selectedEmployee.email}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Phone</div>
                  <div className="font-mono font-semibold text-slate-900 mt-0.5">
                    {selectedEmployee.phone}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Reporting Manager
                  </div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {selectedEmployee.managerName}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Role</div>
                  <div className="font-bold text-red-600 mt-0.5">{selectedEmployee.role}</div>
                </div>
              </div>

              {/* Assigned Fabricators */}
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                  ASSIGNED FABRICATOR ACCOUNTS ({empFabricators.length})
                </div>
                {empFabricators.length === 0 ? (
                  <div className="p-2.5 rounded bg-slate-50 text-slate-500 text-[11px]">
                    Plant / Backoffice role — no direct fabricator sales quota assigned.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {empFabricators.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => navigateTo('fabricators', f.id)}
                        className="px-2.5 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-red-50 text-[11px] font-semibold text-slate-800"
                      >
                        {f.id} • {f.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Effective Permissions */}
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                  ROLE PERMISSIONS SUMMARY
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: 'Approve Quotations', ok: empPermissions.canApproveQuotation },
                    { label: 'Create Quotations', ok: empPermissions.canCreateQuotation },
                    { label: 'Convert Leads', ok: empPermissions.canConvertLead },
                    { label: 'Manage Inventory', ok: empPermissions.canManageInventory },
                    { label: 'Manage Extrusion', ok: empPermissions.canManageProduction },
                    { label: 'Record Payments', ok: empPermissions.canRecordPayment },
                  ].map((perm) => (
                    <div
                      key={perm.label}
                      className="p-2 rounded border border-slate-200 flex items-center justify-between text-[11px]"
                    >
                      <span>{perm.label}</span>
                      {perm.ok ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-300" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES & PERMISSIONS MATRIX (Section 23) */}
      {tab === 'roles' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-800">
                Role-Based Access Control (RBAC) Matrix
              </h3>
              <p className="text-[11px] text-slate-500">
                Click "Switch to Role" on any row to immediately test how the sidebar and action buttons adapt for that employee role.
              </p>
            </div>
            <span className="text-xs font-bold text-red-600">
              Current Active Role: {currentEmployee.role}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-3">Visible Sidebar Modules</th>
                  <th className="py-2.5 px-3 text-center">Approve Quote</th>
                  <th className="py-2.5 px-3 text-center">Inventory / MRP</th>
                  <th className="py-2.5 px-3 text-center">Production Floor</th>
                  <th className="py-2.5 px-4 text-right">Test Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ALL_ROLES.map((r) => {
                  const mods = ROLE_ALLOWED_MODULES[r];
                  const perms = getPermissionsForRole(r);
                  const isCurrent = currentEmployee.role === r;
                  return (
                    <tr key={r} className={isCurrent ? 'bg-red-50/50' : 'hover:bg-slate-50'}>
                      <td className="py-3 px-4 font-bold text-slate-900">{r}</td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {mods.map((m) => (
                            <span
                              key={m}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {perms.canApproveQuotation ? (
                          <span className="text-emerald-700 font-bold">Yes</span>
                        ) : (
                          <span className="text-red-600 font-semibold">Blocked</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {perms.canManageInventory ? 'Full' : 'View'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {perms.canManageProduction ? 'Full' : 'View'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => switchRole(r)}
                          className={`px-3 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          {isCurrent ? 'Active Role' : 'Switch to Role'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVITY LOG / AUDIT TRAIL (Section 24) */}
      {tab === 'activity_logs' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-800">
                System Audit & Activity Log ({activityLogs.length} Events)
              </h3>
              <p className="text-[11px] text-slate-500">
                Tracks every price change, quotation approval, stock adjustment, production update, and payment receipt.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Module</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Record</th>
                  <th className="py-2.5 px-4">Change (Before → After)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{log.employeeName}</div>
                      <div className="text-[10px] text-slate-500">{log.employeeRole}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold text-[10px]">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{log.action}</td>
                    <td className="py-3 px-3 font-mono font-bold text-red-600">{log.recordId}</td>
                    <td className="py-3 px-4">
                      {log.beforeValue || log.afterValue ? (
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700">
                            Before: {log.beforeValue || '—'}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                            After: {log.afterValue || '—'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600">{log.summary}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS & FUTURE N8N ARCHITECTURE (Section 33) */}
      {tab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 bg-white p-4 rounded-lg border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Webhook className="w-4 h-4 text-red-600" />
                <span className="font-bold uppercase tracking-wider text-slate-800">
                  Future n8n & Database Service Architecture
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                Event Bus Ready
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              The frontend is decoupled from mock data via <code className="font-mono bg-slate-100 px-1 rounded">ERPContext / erpService</code>. When connecting Supabase/PostgreSQL and n8n WhatsApp automation, the following webhook events are already wired:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORTED_WEBHOOK_EVENTS.map((ev) => (
                <div
                  key={ev}
                  className="p-2 rounded bg-slate-50 border border-slate-200 font-mono text-[11px] font-semibold text-slate-800 flex items-center justify-between"
                >
                  <span>{ev}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              ))}
            </div>
            <div className="pt-2">
              <button
                onClick={() => simulateWhatsAppLead()}
                className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
              >
                Trigger Simulated "lead.created" n8n Webhook
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white p-4 rounded-lg border border-slate-200 space-y-3 text-xs">
            <div className="font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Live Emitted Webhook Payloads ({webhookEvents.length})
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {webhookEvents.map((wh) => (
                <div
                  key={wh.id}
                  className="p-2.5 rounded bg-slate-900 text-slate-100 font-mono text-[11px] space-y-1"
                >
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span>{wh.event}</span>
                    <span className="text-slate-400 text-[10px]">
                      {wh.timestamp} • {wh.source}
                    </span>
                  </div>
                  <div className="text-slate-300 text-[10px] break-all">
                    {JSON.stringify(wh.payload)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
