import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, Smartphone, Check, X } from 'lucide-react';
import { storage } from '../utils/storage';

interface OfflinePwaBarProps {
  onQueueSynced: () => void;
}

export const OfflinePwaBar: React.FC<OfflinePwaBarProps> = ({ onQueueSynced }) => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [queueCount, setQueueCount] = useState<number>(0);
  const [showPwaHelp, setShowPwaHelp] = useState<boolean>(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online) {
        // Auto-sync when internet comes back
        const synced = storage.syncOfflineQueue();
        if (synced > 0) {
          onQueueSynced();
        }
      }
      setQueueCount(storage.getOfflineQueueCount());
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    setQueueCount(storage.getOfflineQueueCount());

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [onQueueSynced]);

  const handleManualSync = () => {
    const synced = storage.syncOfflineQueue();
    setQueueCount(0);
    if (synced > 0) {
      onQueueSynced();
    }
  };

  return (
    <>
      {/* Offline Alert Strip */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between sticky top-0 z-40 shadow-xs">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-slate-950 shrink-0" />
            <span>Cellular Dropout / Offline Mode: Receipts queuing locally ({queueCount} pending sync)</span>
          </div>
          <button
            onClick={handleManualSync}
            className="py-1 px-2.5 bg-black text-white rounded-lg text-[10px] font-semibold hover:bg-slate-900 transition-colors"
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* PWA Home Screen Installation Guide Modal */}
      {showPwaHelp && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Add to Home Screen (PWA)</h3>
              </div>
              <button 
                onClick={() => setShowPwaHelp(false)} 
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Equip cashiers with 1-tap launch from their phone home screen without opening browser tabs:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">iOS Safari:</span>
                <span className="text-slate-600">
                  Tap the <span className="font-semibold text-purple-700">Share button</span> (square with arrow) at the bottom, then scroll and select <span className="font-semibold text-purple-700">"Add to Home Screen"</span>.
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Android Chrome:</span>
                <span className="text-slate-600">
                  Tap the <span className="font-semibold text-purple-700">three dots (⋮)</span> in the top right corner, then select <span className="font-semibold text-purple-700">"Install app"</span> or <span className="font-semibold text-purple-700">"Add to Home screen"</span>.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowPwaHelp(false)}
              className="w-full h-10 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
