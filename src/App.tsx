import React, { useState } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { QuickCreateModals } from './components/layout/QuickCreateModals';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { FabricatorsPage } from './pages/FabricatorsPage';
import { DealersPage } from './pages/DealersPage';
import { ProductsPage } from './pages/ProductsPage';
import { BOMAndMRPPage } from './pages/BOMAndMRPPage';
import { InventoryAndRawMaterialsPage } from './pages/InventoryAndRawMaterialsPage';
import { QuotationsPage } from './pages/QuotationsPage';
import { SalesOrdersPage } from './pages/SalesOrdersPage';
import { ProductionPage } from './pages/ProductionPage';
import { DispatchPage } from './pages/DispatchPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AdministrationPage } from './pages/AdministrationPage';
import { Shield, Factory, Layers, Warehouse } from 'lucide-react';

const ERPShell: React.FC = () => {
  const { activeModule, currentEmployee } = useERP();
  const [showLoginScreenPreview, setShowLoginScreenPreview] = useState(false);

  if (showLoginScreenPreview) {
    return (
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white text-slate-900">
        {/* Left Corporate Brand Panel (Matches Reference Screen 1) */}
        <div className="p-10 lg:p-16 flex flex-col justify-between bg-slate-50/70 border-r border-slate-200">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Plant Network: Bhiwadi Extrusion Facility</span>
            </div>
            <span className="font-mono text-xs text-slate-400">v4.2.1-prod</span>
          </div>

          <div className="max-w-md space-y-5 my-12">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-red-600 text-white font-bold text-sm flex items-center justify-center">
                SC
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-900">
                S CRAFT <span className="text-slate-400 font-normal">PROFILES</span>
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              UPVC Manufacturing ERP
            </h1>
            <div className="w-12 h-1 bg-red-600 rounded" />
            <p className="text-sm text-slate-600 leading-relaxed">
              Manage fabricator sales, dealer networks, resin inventory, BOM material requirements, extrusion lines, and dispatch operations in one place.
            </p>
            <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Factory className="w-4 h-4 text-slate-400" />
                <span>Extrusion Lines</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-400" />
                <span>BOM & QC Logs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Warehouse className="w-4 h-4 text-slate-400" />
                <span>Warehouse & Dies</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-200">
            <span>SCraft India Ltd. Internal Employee Portal</span>
            <span>Authorized Personnel Only (No External Customer Login)</span>
          </div>
        </div>

        {/* Right Sign-In Card */}
        <div className="p-10 flex flex-col items-center justify-center bg-white">
          <div className="w-full max-w-md p-8 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Sign In</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your SCraft corporate employee credentials
              </p>
            </div>
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold uppercase text-[10px] text-slate-600 mb-1">
                  Work Email / Employee ID
                </label>
                <input
                  type="text"
                  defaultValue={currentEmployee.email}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-md font-medium"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-[10px] text-slate-600 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  defaultValue="••••••••••••"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-md"
                />
              </div>
              <button
                onClick={() => setShowLoginScreenPreview(false)}
                className="w-full py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Sign In to SCraft ERP ({currentEmployee.role})
              </button>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
              <Shield className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Access is controlled by your assigned SCraft employee role and permissions.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Left Fixed Role-Aware Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <TopBar />

        <main className="flex-1 pt-18 pb-8 px-5 max-w-[1600px] w-full mx-auto">
          {activeModule === 'dashboard' && <DashboardPage />}
          {activeModule === 'leads' && <LeadsPage />}
          {activeModule === 'fabricators' && <FabricatorsPage />}
          {activeModule === 'dealers' && <DealersPage />}
          {activeModule === 'products' && <ProductsPage />}
          {(activeModule === 'bom' || activeModule === 'material_requirements') && (
            <BOMAndMRPPage />
          )}
          {(activeModule === 'inventory' || activeModule === 'raw_materials') && (
            <InventoryAndRawMaterialsPage />
          )}
          {activeModule === 'quotations' && <QuotationsPage />}
          {activeModule === 'orders' && <SalesOrdersPage />}
          {activeModule === 'production' && <ProductionPage />}
          {activeModule === 'dispatch' && <DispatchPage />}
          {activeModule === 'payments' && <PaymentsPage />}
          {activeModule === 'reports' && <ReportsPage />}
          {(activeModule === 'employees' ||
            activeModule === 'roles' ||
            activeModule === 'activity_logs' ||
            activeModule === 'settings') && <AdministrationPage />}
        </main>

        {/* Global Operational Footer */}
        <footer className="bg-white border-t border-slate-200 px-5 py-2.5 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">
              © 2026 SCraft ERP • UPVC Profile Manufacturing Platform
            </span>
            <span>• Plant Unit 04 Bhiwadi Online</span>
            <span className="text-slate-400">|</span>
            <span>Internal Employee ERP (Fabricators are B2B Customers)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowLoginScreenPreview(true)}
              className="text-slate-500 hover:text-red-600 underline cursor-pointer"
            >
              Preview Corporate Sign-In Screen
            </button>
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Telemetry: 24ms • Operational
            </span>
          </div>
        </footer>
      </div>

      {/* Global Quick Create Modals */}
      <QuickCreateModals />
    </div>
  );
};

export function App() {
  return (
    <ERPProvider>
      <ERPShell />
    </ERPProvider>
  );
}

export default App;
