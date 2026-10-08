import React, { useState, useEffect, useCallback } from 'react';
import { 
  StaffMember, 
  TenantConfig, 
  VerifiedTransaction 
} from './types';
import { storage } from './utils/storage';
import { Navbar } from './components/Navbar';
import { CashierTerminal } from './components/CashierTerminal';
import { ManagerDashboard } from './components/ManagerDashboard';
import { SettingsModal } from './components/SettingsModal';
import { OfflinePwaBar } from './components/OfflinePwaBar';

export default function App() {
  const [tenant, setTenant] = useState<TenantConfig>(() => storage.getTenant());
  const [staffList, setStaffList] = useState<StaffMember[]>(() => storage.getStaff());
  const [activeStaff, setActiveStaff] = useState<StaffMember>(() => storage.getActiveStaff());
  const [transactions, setTransactions] = useState<VerifiedTransaction[]>(() => storage.getTransactions());
  
  const [currentView, setCurrentView] = useState<'cashier' | 'dashboard'>('cashier');
  const [showSettings, setShowSettings] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  const refreshAllState = useCallback(() => {
    setTenant(storage.getTenant());
    setStaffList(storage.getStaff());
    setActiveStaff(storage.getActiveStaff());
    setTransactions(storage.getTransactions());
    setPendingSyncCount(storage.getOfflineQueueCount());
  }, []);

  useEffect(() => {
    refreshAllState();
  }, [refreshAllState]);

  const handleStaffChange = (staff: StaffMember) => {
    storage.setActiveStaffId(staff.id);
    setActiveStaff(staff);
  };

  const handleSaveTenant = (updated: TenantConfig) => {
    storage.saveTenant(updated);
    setTenant(updated);
  };

  const handleSaveStaff = (updated: StaffMember[]) => {
    storage.saveStaff(updated);
    setStaffList(updated);
  };

  const handleResetDemoData = () => {
    storage.resetDemoData();
    refreshAllState();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Offline Connectivity & PWA Sync Notification */}
      <OfflinePwaBar onQueueSynced={refreshAllState} />

      {/* Top Bar Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          refreshAllState();
          setCurrentView(view);
        }}
        onOpenSettings={() => setShowSettings(true)}
        operatingMode={tenant.operatingMode}
        pendingSyncCount={pendingSyncCount}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'cashier' ? (
          <CashierTerminal
            tenant={tenant}
            staffList={staffList}
            activeStaff={activeStaff}
            onStaffChange={handleStaffChange}
            onOpenSettings={() => setShowSettings(true)}
            onOpenDashboard={() => setCurrentView('dashboard')}
          />
        ) : (
          <ManagerDashboard
            tenant={tenant}
            transactions={transactions}
            staffList={staffList}
            onBackToCashier={() => setCurrentView('cashier')}
            onRefreshData={refreshAllState}
          />
        )}
      </main>

      {/* Clean quiet footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-700">BirrVerify Ethiopia</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Telebirr, CBE, Awash, Abyssinia, Dashen, Berhan, CoOP</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Official Anti-Fraud Verification Gateway
          </div>
        </div>
      </footer>

      {/* Business Settings & PIN Modal */}
      {showSettings && (
        <SettingsModal
          tenant={tenant}
          staffList={staffList}
          onSaveTenant={handleSaveTenant}
          onSaveStaff={handleSaveStaff}
          onResetDemoData={handleResetDemoData}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
