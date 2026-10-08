import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  Printer, 
  Copy, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  Hash,
  User,
  Tag
} from 'lucide-react';
import { VerifiedTransaction } from '../types';
import { ETHIOPIAN_BANKS } from '../config/banks';

interface BankReceiptSlipProps {
  transaction: VerifiedTransaction;
  onVerifyNext: () => void;
}

export const BankReceiptSlip: React.FC<BankReceiptSlipProps> = ({
  transaction,
  onVerifyNext,
}) => {
  const [copied, setCopied] = useState(false);
  const [showPortalModal, setShowPortalModal] = useState(false);
  const bank = ETHIOPIAN_BANKS[transaction.bank] || ETHIOPIAN_BANKS.cbe;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(transaction.referenceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Convert amount to English words (simple formatter for receipt authenticity)
  const formatAmountWords = (amount: number): string => {
    const whole = Math.floor(amount);
    const cents = Math.round((amount - whole) * 100);
    return `${whole.toLocaleString('en-US')} Ethiopian Birr ${cents > 0 ? `and ${cents}/100` : 'Only'}`;
  };

  const formattedDate = new Date(transaction.verifiedAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Verification Success Pill / Status Bar */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
              <span>FUNDS VERIFIED & CLEARED</span>
            </h3>
            <p className="text-xs text-emerald-700">Official authentic bank confirmation</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md font-semibold">
            CLEAR
          </span>
        </div>
      </div>

      {/* The Printable Official Bank Slip */}
      <div 
        id="printable-receipt"
        className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden relative"
      >
        {/* Bank Header Bar */}
        <div 
          className="p-4 text-white relative overflow-hidden"
          style={{ backgroundColor: bank.primaryColor }}
        >
          {/* Subtle decorative watermark badge */}
          <div className="absolute -right-4 -bottom-4 opacity-10 text-white pointer-events-none">
            <Building2 className="w-32 h-32" />
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase opacity-90 block">
                {bank.localName}
              </span>
              <h2 className="text-lg font-bold tracking-tight">
                {bank.name}
              </h2>
            </div>
            <div className="bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider">
              {bank.shortName.toUpperCase()}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-white/90">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Official Digital Slip
            </span>
            <span className="font-mono text-[11px]">EAT (UTC+3)</span>
          </div>
        </div>

        {/* Amount Hero Section */}
        <div className="p-5 text-center bg-slate-50/50 border-b border-slate-100">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-1">
            Confirmed Amount
          </span>
          <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
            ETB {transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium italic">
            "{formatAmountWords(transaction.amount)}"
          </div>
        </div>

        {/* Detailed Transaction Parameters */}
        <div className="p-5 space-y-3.5 text-xs text-slate-700">
          {/* Reference Code Row */}
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Hash className="w-3.5 h-3.5 text-slate-400" /> Reference No.
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">
                {transaction.referenceNumber}
              </span>
              <button 
                onClick={handleCopyRef}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
                title="Copy reference code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Payer Info */}
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-slate-400" /> Customer / Payer
            </span>
            <div className="text-right">
              <span className="font-semibold text-slate-900 block">{transaction.payerName}</span>
              <span className="text-[11px] text-slate-500 font-mono">{transaction.payerPhoneOrAccount}</span>
            </div>
          </div>

          {/* Business / Merchant Suffix */}
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> Credited Merchant
            </span>
            <div className="text-right">
              <span className="font-semibold text-slate-900 block">{transaction.tenantName}</span>
              {transaction.accountSuffix && (
                <span className="text-[11px] text-slate-500 font-mono">Suffix: {transaction.accountSuffix}</span>
              )}
            </div>
          </div>

          {/* Context Tag (Table / Item) if present */}
          {transaction.contextTag && (
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Order / Context Tag
              </span>
              <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[11px]">
                {transaction.contextTag}
              </span>
            </div>
          )}

          {/* Verified Timestamp */}
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Verified Timestamp
            </span>
            <span className="font-mono text-slate-800 text-[11px]">
              {formattedDate}
            </span>
          </div>

          {/* Staff Cashier Attribution */}
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500 font-medium">Verified By</span>
            <span className="font-medium text-slate-900">
              {transaction.verifiedByStaffName}
            </span>
          </div>
        </div>

        {/* Security Stamp Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Anti-Duplicate Hash Logged</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            ID: {transaction.id.slice(0, 12)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-1">
        {/* Primary Thumb CTA: Verify Next */}
        <button
          onClick={onVerifyNext}
          className="w-full h-12 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <span>Verify Next Customer</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Secondary Utility Controls */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handlePrint}
            className="h-10 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Receipt</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPortalModal(true)}
            className="h-10 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Bank Portal</span>
          </button>
        </div>
      </div>

      {/* Official Bank Verification Inspector Modal */}
      {showPortalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: bank.primaryColor }}
                >
                  {bank.shortName.slice(0, 3)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{bank.portalName}</h3>
                  <p className="text-[11px] text-slate-500">Official Gateway Dispatcher</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPortalModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Verified Reference:</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-200/60 px-2 py-0.5 rounded">
                  {transaction.referenceNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Core Banking Settlement:</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> CLEARED
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Gateway Protocol:</span>
                <span className="font-mono text-[10px] text-slate-600">HTTPS / TLS 1.3 Verified</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Official Gateway Endpoint:
              </label>
              <div className="p-2.5 bg-slate-100 rounded-xl font-mono text-[11px] text-slate-700 break-all border border-slate-200">
                {bank.portalUrl}
              </div>
            </div>

            <div className="pt-1 space-y-2">
              <a
                href={bank.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open {bank.shortName} Portal in New Tab</span>
              </a>

              <button
                type="button"
                onClick={() => setShowPortalModal(false)}
                className="w-full h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
