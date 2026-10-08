import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Search, 
  ShieldCheck, 
  Tag, 
  Building2, 
  User, 
  Users, 
  Sparkles,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Zap,
  DollarSign,
  Check
} from 'lucide-react';
import { BankProvider, OperatingMode, StaffMember, TenantConfig, VerifiedTransaction } from '../types';
import { BANK_LIST, ETHIOPIAN_BANKS, DEMO_SAMPLES } from '../config/banks';
import { storage } from '../utils/storage';
import { soundFX } from '../utils/audio';
import { BankReceiptSlip } from './BankReceiptSlip';
import { FraudAlertModal } from './FraudAlertModal';
import { CameraScannerModal } from './CameraScannerModal';
import { StaffPinModal } from './StaffPinModal';

interface CashierTerminalProps {
  tenant: TenantConfig;
  staffList: StaffMember[];
  activeStaff: StaffMember;
  onStaffChange: (staff: StaffMember) => void;
  onOpenSettings: () => void;
  onOpenDashboard: () => void;
}

export const CashierTerminal: React.FC<CashierTerminalProps> = ({
  tenant,
  staffList,
  activeStaff,
  onStaffChange,
  onOpenSettings,
  onOpenDashboard,
}) => {
  // Active Bank selection
  const [selectedBankId, setSelectedBankId] = useState<BankProvider>('telebirr');
  const activeBank = ETHIOPIAN_BANKS[selectedBankId];

  // Form State
  const [refNumber, setRefNumber] = useState('');
  const [amount, setAmount] = useState<string>('850.00');
  const [accountSuffix, setAccountSuffix] = useState(tenant.defaultCbeSuffix || '');
  const [payerName, setPayerName] = useState('Customer Walk-in');
  const [payerPhone, setPayerPhone] = useState('0911***482');
  const [contextTag, setContextTag] = useState('');

  // UI Modals & Views
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedTx, setVerifiedTx] = useState<VerifiedTransaction | null>(null);
  const [fraudTx, setFraudTx] = useState<VerifiedTransaction | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Hardware Scanner buffer
  const hardwareBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  // Sync account suffix when tenant default changes
  useEffect(() => {
    if (tenant.defaultCbeSuffix && !accountSuffix) {
      setAccountSuffix(tenant.defaultCbeSuffix);
    }
  }, [tenant.defaultCbeSuffix, accountSuffix]);

  // Hardware USB/Bluetooth Barcode Scanner wedge listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in standard inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const now = Date.now();
      // Rapid key entries (< 50ms) are typical of hardware barcode scanners
      if (now - lastKeyTimeRef.current > 100) {
        hardwareBufferRef.current = '';
      }
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        if (hardwareBufferRef.current.length >= 6) {
          const scanned = hardwareBufferRef.current.trim().toUpperCase();
          hardwareBufferRef.current = '';
          handleScannedCode({ code: scanned });
        }
      } else if (e.key.length === 1) {
        hardwareBufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleScannedCode = (result: { code: string; bank?: BankProvider }) => {
    setShowScanner(false);
    setRefNumber(result.code);
    if (result.bank) {
      setSelectedBankId(result.bank);
    }
    setValidationError(null);
  };

  const handleVerify = () => {
    const cleanedRef = refNumber.trim().toUpperCase();

    if (!cleanedRef) {
      setValidationError('Please enter or scan a reference number.');
      return;
    }

    if (activeBank.requiresAccountSuffix && !accountSuffix.trim()) {
      setValidationError('CBE verification requires the 8-digit merchant account suffix.');
      return;
    }

    const numAmount = parseFloat(amount) || 500.00;
    setValidationError(null);
    setIsVerifying(true);

    // Simulate realistic bank network query latency (450ms)
    setTimeout(() => {
      setIsVerifying(false);

      const result = storage.verifyReferenceNumber({
        bank: selectedBankId,
        referenceNumber: cleanedRef,
        amount: numAmount,
        payerName: payerName.trim() || 'Digital Payer',
        payerPhoneOrAccount: payerPhone.trim() || '09****9999',
        contextTag: contextTag.trim() || undefined,
        accountSuffix: activeBank.requiresAccountSuffix ? accountSuffix.trim() : undefined,
        officialPortalUrl: activeBank.portalUrl,
      });

      if (result.isDuplicate) {
        setFraudTx(result.transaction);
      } else {
        soundFX.playSuccess();
        setVerifiedTx(result.transaction);
      }
    }, 450);
  };

  const handleResetForNext = () => {
    setVerifiedTx(null);
    setFraudTx(null);
    setRefNumber('');
    setValidationError(null);
  };

  // Load sample voucher
  const loadSample = (sample: typeof DEMO_SAMPLES[0]) => {
    setSelectedBankId(sample.bank);
    setRefNumber(sample.ref);
    setAmount(sample.amount.toFixed(2));
    setPayerName(sample.payer);
    setPayerPhone(sample.account);
    setContextTag(sample.tag);
    setValidationError(null);
  };

  // Quick context chips based on business type
  const contextSuggestions = tenant.businessType === 'restaurant'
    ? ['Table 1', 'Table 2', 'Table 4', 'VIP Lounge', 'Bar Counter', 'Takeout']
    : tenant.businessType === 'boutique'
    ? ['Jacket #12', 'Shoes #4', 'Fitting Room 1', 'Gift Wrap']
    : ['Counter 1', 'Counter 2', 'Express Register', 'Wholesale'];

  return (
    <div className="w-full max-w-lg mx-auto pb-8">
      {/* Operating Mode & Active Cashier Header Strip */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-700 text-white font-bold flex items-center justify-center text-xs shadow-xs">
            BV
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 leading-tight">
              {tenant.businessName}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span>{tenant.operatingMode === 'team' ? 'Team Mode' : 'Solo POS'}</span>
              <span aria-hidden="true">·</span>
              <span className="text-purple-700 font-medium">{tenant.location.split(',')[0]}</span>
            </div>
          </div>
        </div>

        {tenant.operatingMode === 'team' ? (
          <button
            onClick={() => setShowPinModal(true)}
            className="flex items-center gap-1.5 py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            title="Switch server or cashier PIN"
          >
            <User className="w-3.5 h-3.5 text-purple-600" />
            <span className="truncate max-w-[90px]">{activeStaff.name.split(' ')[0]}</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        ) : (
          <span className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            SOLO READY
          </span>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* If a transaction was just verified, render the Authentic Slip! */}
        {verifiedTx ? (
          <BankReceiptSlip
            transaction={verifiedTx}
            onVerifyNext={handleResetForNext}
          />
        ) : (
          <>
            {/* Quick Test Samples Selector Banner */}
            <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Quick Test Codes:
                </span>
                <span className="text-[10px] text-purple-700">Tap to load</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DEMO_SAMPLES.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadSample(sample)}
                    className={`text-[11px] font-medium py-1 px-2.5 rounded-lg border transition-all ${
                      sample.isDuplicate
                        ? 'bg-red-100 hover:bg-red-200 text-red-800 border-red-300 font-bold'
                        : 'bg-white hover:bg-purple-100/60 text-purple-900 border-purple-200'
                    }`}
                  >
                    {sample.isDuplicate ? '🚨 Test Duplicate Fraud' : `${ETHIOPIAN_BANKS[sample.bank].shortName}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Provider Selection Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold px-0.5">
                <span>Select Payment Provider (1 of 7):</span>
                <span className="text-[11px] text-purple-700 font-medium">
                  {activeBank.localName}
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {BANK_LIST.map((bank) => {
                  const isSelected = selectedBankId === bank.id;
                  return (
                    <button
                      key={bank.id}
                      onClick={() => {
                        setSelectedBankId(bank.id);
                        setValidationError(null);
                      }}
                      className={`p-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-between min-h-[70px] relative ${
                        isSelected
                          ? 'border-purple-600 bg-white ring-2 ring-purple-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[10px] font-bold shadow-2xs"
                        style={{ backgroundColor: bank.primaryColor }}
                      >
                        {bank.shortName.slice(0, 3).toUpperCase()}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-800 truncate w-full mt-1">
                        {bank.shortName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Adaptive Input Form */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
              {/* Selected Bank Banner */}
              <div 
                className="p-3 rounded-2xl text-white flex items-center justify-between shadow-2xs transition-colors"
                style={{ backgroundColor: activeBank.primaryColor }}
              >
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                    Target Gateway
                  </div>
                  <div className="text-sm font-bold">{activeBank.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] opacity-80">Reference Syntax</div>
                  <div className="text-xs font-mono font-semibold">
                    {activeBank.refCodePrefix ? `${activeBank.refCodePrefix}...` : 'Numeric / Code'}
                  </div>
                </div>
              </div>

              {/* Main Reference Code Input with Scanner Trigger */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Transaction Reference / FT Code</span>
                  </label>
                  <span className="text-[10px] text-slate-500">
                    {activeBank.refHint}
                  </span>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={refNumber}
                    onChange={(e) => {
                      setRefNumber(e.target.value.toUpperCase());
                      setValidationError(null);
                    }}
                    placeholder={activeBank.refCodePlaceholder}
                    className="w-full h-12 pl-3.5 pr-24 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-600 rounded-2xl font-mono text-sm uppercase font-semibold text-slate-900 placeholder:text-slate-400 placeholder:normal-case focus:outline-hidden transition-colors"
                  />
                  <div className="absolute right-1.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowScanner(true)}
                      className="h-9 px-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                      title="Open Camera QR / Barcode Scanner"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Scan</span>
                    </button>
                  </div>
                </div>

                {/* Live Syntax Validation Indicator */}
                {refNumber.trim().length > 0 && (
                  <div className="pt-1 flex items-center justify-between text-[11px] animate-in fade-in">
                    {activeBank.refPattern.test(refNumber.trim()) ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Valid {activeBank.shortName} reference pattern</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 font-mono text-[10px]">
                        Hint: {activeBank.refHint}
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-slate-400">
                      {refNumber.trim().length} chars
                    </span>
                  </div>
                )}
              </div>

              {/* CBE 8-digit Account Suffix Field (shown when CBE is selected) */}
              {activeBank.requiresAccountSuffix && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>{activeBank.accountSuffixLabel}</span>
                    <span className="text-[10px] font-normal text-purple-700 font-mono">
                      (Store: {tenant.defaultCbeSuffix})
                    </span>
                  </label>
                  <input
                    type="text"
                    value={accountSuffix}
                    onChange={(e) => setAccountSuffix(e.target.value)}
                    placeholder={activeBank.accountSuffixPlaceholder}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-600 rounded-2xl font-mono text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-colors"
                  />
                </div>
              )}

              {/* Amount & Optional Customer Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span>Amount (ETB)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-600 rounded-2xl font-mono text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-colors tabular-nums"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Customer Name</span>
                  </label>
                  <input
                    type="text"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="e.g. Yohannes T."
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-600 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-colors"
                  />
                </div>
              </div>

              {/* Optional Context Tag (Table / Register / Product) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span>Optional Order / Context Tag</span>
                  </label>
                  <span className="text-[10px] text-slate-400 italic">e.g. Table 4, Jacket #12</span>
                </div>
                <input
                  type="text"
                  value={contextTag}
                  onChange={(e) => setContextTag(e.target.value)}
                  placeholder="e.g. Table 4 or Reg 2"
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-600 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-colors"
                />

                {/* Context Suggestion chips */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {contextSuggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setContextTag(tag)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                        contextTag === tag
                          ? 'bg-purple-100 text-purple-800 border-purple-300 font-semibold'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Validation Error Banner */}
              {validationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-red-700 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Primary Verification Action */}
              <button
                type="button"
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full h-13 bg-purple-700 hover:bg-purple-800 active:scale-[0.99] disabled:opacity-75 text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {isVerifying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Querying Bank Gateway...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Verify & Authorize Payment</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Camera Scanner Modal */}
      {showScanner && (
        <CameraScannerModal
          onScanResult={handleScannedCode}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Fraud Alert Modal */}
      {fraudTx && (
        <FraudAlertModal
          transaction={fraudTx}
          onDismiss={() => setFraudTx(null)}
        />
      )}

      {/* Staff Switch PIN Modal */}
      {showPinModal && (
        <StaffPinModal
          staffList={staffList}
          activeStaff={activeStaff}
          onSelectStaff={(staff) => {
            onStaffChange(staff);
            setShowPinModal(false);
          }}
          onClose={() => setShowPinModal(false)}
        />
      )}
    </div>
  );
};
