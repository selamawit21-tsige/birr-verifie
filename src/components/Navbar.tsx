import React from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Terminal, 
  Settings, 
  Smartphone,
  Wifi,
  WifiOff
} from 'lucide-react';
import { OperatingMode } from '../types';

interface NavbarProps {
  currentView: 'cashier' | 'dashboard';
  onNavigate: (view: 'cashier' | 'dashboard') => void;
  onOpenSettings: () => void;
  operatingMode: OperatingMode;
  pendingSyncCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenSettings,
  operatingMode,
  pendingSyncCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Zone 1: Single Text Element Wordmark */}
        <a 
          href="/" 
          onClick={(e) => { e.preventDefault(); onNavigate('cashier'); }}
          className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2"
        >
          <span className="w-7 h-7 rounded-lg bg-purple-700 text-white flex items-center justify-center text-xs font-black shadow-2xs">
            BV
          </span>
          <span className="whitespace-nowrap font-bold">BirrVerify</span>
        </a>

        {/* Zone 2: Clean 1-2 Word Navigation Links / Segmented Buttons */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onNavigate('cashier')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              currentView === 'cashier'
                ? 'bg-purple-50 text-purple-900 border border-purple-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-purple-600" />
            <span>Cashier POS</span>
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              currentView === 'dashboard'
                ? 'bg-purple-50 text-purple-900 border border-purple-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-purple-600" />
            <span>Manager Audit</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Quick Settings */}
        <div className="flex items-center gap-2">
          {pendingSyncCount > 0 && (
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200 hidden sm:inline-block">
              {pendingSyncCount} queued
            </span>
          )}

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Business Settings & Staff PINs"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
