import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Settings, 
  Users, 
  RotateCcw, 
  Check, 
  Plus, 
  Trash2, 
  ShieldCheck,
  CreditCard,
  MapPin
} from 'lucide-react';
import { OperatingMode, StaffMember, TenantConfig } from '../types';

interface SettingsModalProps {
  tenant: TenantConfig;
  staffList: StaffMember[];
  onSaveTenant: (updated: TenantConfig) => void;
  onSaveStaff: (updated: StaffMember[]) => void;
  onResetDemoData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  tenant,
  staffList,
  onSaveTenant,
  onSaveStaff,
  onResetDemoData,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'store' | 'staff' | 'system'>('store');

  // Tenant state
  const [businessName, setBusinessName] = useState(tenant.businessName);
  const [businessType, setBusinessType] = useState(tenant.businessType);
  const [operatingMode, setOperatingMode] = useState<OperatingMode>(tenant.operatingMode);
  const [defaultCbeSuffix, setDefaultCbeSuffix] = useState(tenant.defaultCbeSuffix);
  const [telebirrMerchantId, setTelebirrMerchantId] = useState(tenant.telebirrMerchantId);
  const [location, setLocation] = useState(tenant.location);

  // Staff state
  const [staff, setStaff] = useState<StaffMember[]>(staffList);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPin, setNewStaffPin] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'cashier' | 'server'>('server');

  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTenant({
      ...tenant,
      businessName,
      businessType,
      operatingMode,
      defaultCbeSuffix,
      telebirrMerchantId,
      location,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleAddStaff = () => {
    if (!newStaffName.trim() || newStaffPin.length !== 4) {
      alert('Please enter a staff name and a 4-digit PIN code.');
      return;
    }

    const newMember: StaffMember = {
      id: `staff-${Date.now()}`,
      name: newStaffName.trim(),
      pin: newStaffPin.trim(),
      role: newStaffRole,
      active: true,
      avatarSeed: newStaffName.slice(0, 2).toUpperCase(),
    };

    const updated = [...staff, newMember];
    setStaff(updated);
    onSaveStaff(updated);
    setNewStaffName('');
    setNewStaffPin('');
  };

  const handleToggleStaffActive = (id: string) => {
    const updated = staff.map(s => s.id === id ? { ...s, active: !s.active } : s);
    setStaff(updated);
    onSaveStaff(updated);
  };

  const handleDeleteStaff = (id: string) => {
    if (staff.length <= 1) {
      alert('Must have at least one active cashier.');
      return;
    }
    const updated = staff.filter(s => s.id !== id);
    setStaff(updated);
    onSaveStaff(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold text-slate-900">Merchant Settings & Roster</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('store')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-colors ${
              activeTab === 'store' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Business Profile & Mode
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-colors ${
              activeTab === 'staff' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Staff Roster (PINs)
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-colors ${
              activeTab === 'system' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            System & Demo Reset
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'store' && (
            <form onSubmit={handleSaveStore} className="space-y-4 text-xs">
              {/* Operating Mode Selector */}
              <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-2">
                <label className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block">
                  Operational Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOperatingMode('solo')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      operatingMode === 'solo'
                        ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                        : 'bg-white text-slate-700 border-purple-200 hover:bg-purple-100/50'
                    }`}
                  >
                    <div className="font-bold text-xs">Solo Mode</div>
                    <div className={`text-[10px] mt-0.5 ${operatingMode === 'solo' ? 'text-purple-200' : 'text-slate-500'}`}>
                      Kiosks & Boutiques. No PIN locks.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOperatingMode('team')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      operatingMode === 'team'
                        ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                        : 'bg-white text-slate-700 border-purple-200 hover:bg-purple-100/50'
                    }`}
                  >
                    <div className="font-bold text-xs">Team Mode</div>
                    <div className={`text-[10px] mt-0.5 ${operatingMode === 'team' ? 'text-purple-200' : 'text-slate-500'}`}>
                      Restaurants & Supermarkets. 4-digit PINs.
                    </div>
                  </button>
                </div>
              </div>

              {/* Business Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Business / Establishment Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-purple-600"
                />
              </div>

              {/* Business Type */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Business Category</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as TenantConfig['businessType'])}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-hidden"
                >
                  <option value="restaurant">Restaurant / Lounge / Cafe</option>
                  <option value="boutique">Clothing Boutique / Retail</option>
                  <option value="supermarket">Supermarket / Multi-Counter</option>
                  <option value="kiosk">Kiosk / Pharmacy / Counter</option>
                </select>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Location (City & Subcity)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-purple-600"
                />
              </div>

              {/* Bank IDs */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Default CBE Account Suffix</label>
                  <input
                    type="text"
                    value={defaultCbeSuffix}
                    onChange={(e) => setDefaultCbeSuffix(e.target.value)}
                    placeholder="e.g. 10004912"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:outline-hidden focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Telebirr Merchant ID</label>
                  <input
                    type="text"
                    value={telebirrMerchantId}
                    onChange={(e) => setTelebirrMerchantId(e.target.value)}
                    placeholder="e.g. 608291"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:outline-hidden focus:border-purple-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                {savedNotice ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Configuration Saved!</span>
                  </>
                ) : (
                  <span>Save Business Configuration</span>
                )}
              </button>
            </form>
          )}

          {activeTab === 'staff' && (
            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Active Servers & Cashiers
                </label>
                <div className="space-y-2">
                  {staff.map(member => (
                    <div
                      key={member.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{member.name}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="capitalize">{member.role}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono bg-white px-1.5 py-0.2 rounded border border-slate-200">
                            PIN: {member.pin}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStaffActive(member.id)}
                          className={`text-[10px] font-semibold px-2 py-1 rounded-md border ${
                            member.active 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-slate-200 text-slate-600 border-slate-300'
                          }`}
                        >
                          {member.active ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStaff(member.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Remove staff"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Staff Member */}
              <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-2.5">
                <div className="font-bold text-purple-900 text-xs">Add New Staff Member</div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="Full Name"
                    className="col-span-2 h-9 px-2.5 bg-white border border-purple-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    maxLength={4}
                    value={newStaffPin}
                    onChange={(e) => setNewStaffPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="4-digit PIN"
                    className="h-9 px-2.5 bg-white border border-purple-200 rounded-lg text-xs font-mono text-center font-bold"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as 'cashier' | 'server')}
                    className="h-8 px-2 bg-white border border-purple-200 rounded-lg text-xs"
                  >
                    <option value="cashier">Cashier</option>
                    <option value="server">Server / Waiter</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddStaff}
                    className="h-8 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Member</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="font-bold text-slate-900">Anti-Fraud Global Ledger</div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  The centralized hash index catches recycled payment screenshots across all registered stores in Ethiopia. Once an FT code or Telebirr TransNo is verified, any subsequent entry triggers a fraud interception alert.
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-amber-700" />
                  <span>Restore Demo State</span>
                </div>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  Resets the application ledger with initial realistic Ethiopian transactions from Bole, Piazza, and Kazanchis, and re-primes the duplicate test cases.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset transactions and anti-fraud index to initial demo state?')) {
                      onResetDemoData();
                      alert('Demo data restored successfully.');
                      onClose();
                    }
                  }}
                  className="mt-2 h-9 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  Reset Demo Ledger
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
