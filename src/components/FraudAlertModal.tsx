import React, { useEffect } from 'react';
import { 
  AlertTriangle, 
  X, 
  ShieldAlert, 
  Clock, 
  Building2, 
  UserX, 
  Hash, 
  CheckCircle,
  PhoneCall
} from 'lucide-react';
import { VerifiedTransaction } from '../types';
import { ETHIOPIAN_BANKS } from '../config/banks';
import { soundFX } from '../utils/audio';

interface FraudAlertModalProps {
  transaction: VerifiedTransaction;
  onDismiss: () => void;
}

export const FraudAlertModal: React.FC<FraudAlertModalProps> = ({
  transaction,
  onDismiss,
}) => {
  const bank = ETHIOPIAN_BANKS[transaction.bank] || ETHIOPIAN_BANKS.cbe;
  const fraud = transaction.fraudDetails;

  useEffect(() => {
    // Play alarming siren when modal opens
    soundFX.playFraudAlert();
  }, []);

  const firstSeenDate = fraud?.originalVerifiedAt 
    ? new Date(fraud.originalVerifiedAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Earlier Today';

  return (
    <div className="fixed inset-0 z-50 bg-red-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-red-600 animate-in zoom-in-95 duration-200">
        {/* Urgent Crimson Header */}
        <div className="bg-red-600 p-6 text-white text-center relative">
          <button 
            onClick={onDismiss}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full bg-red-700/50"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 bg-white text-red-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-3 animate-bounce">
            <ShieldAlert className="w-10 h-10 stroke-[2.5]" />
          </div>

          <h2 className="text-xl font-extrabold tracking-tight">
            FRAUD DETECTED
          </h2>
          <p className="text-xs text-red-100 font-medium mt-1">
            Reused / Recycled Reference Code Blocked
          </p>
        </div>

        {/* Core Warning Content */}
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 block mb-1">
              Do Not Release Goods or Clear Bill
            </span>
            <p className="text-sm font-semibold text-red-950 leading-snug">
              This payment screenshot is a duplicate. The funds were already claimed and verified in an earlier transaction!
            </p>
          </div>

          {/* Forensic Evidence Table */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Hash className="w-3.5 h-3.5 text-slate-400" /> Reference Number
              </span>
              <span className="font-mono font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded text-xs">
                {transaction.referenceNumber}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Target Provider
              </span>
              <span className="font-semibold text-slate-800">
                {bank.name}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Original Verification
              </span>
              <span className="font-mono text-slate-800 font-medium">
                Today at {firstSeenDate}
              </span>
            </div>

            {fraud && (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" /> First Cleared At
                  </span>
                  <span className="font-semibold text-slate-800 text-right">
                    {fraud.originalTenantName}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <UserX className="w-3.5 h-3.5 text-slate-400" /> Original Staff
                  </span>
                  <span className="font-medium text-slate-800">
                    {fraud.originalStaffName}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Original Value</span>
                  <span className="font-mono font-bold text-slate-900">
                    ETB {fraud.originalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-2">
            <button
              onClick={onDismiss}
              className="w-full h-12 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Acknowledge & Reject Customer</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  alert('Fraud Incident logged to system security ledger and exported in manager audit stream.');
                  onDismiss();
                }}
                className="h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>Flag Incident</span>
              </button>

              <button
                onClick={() => {
                  alert('Manager alerted: supervisor notified to inspect customer receipt at register.');
                }}
                className="h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
                <span>Call Manager</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
