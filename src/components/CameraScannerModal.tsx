import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  X, 
  Camera, 
  Zap, 
  Upload, 
  AlertCircle, 
  Sparkles,
  QrCode
} from 'lucide-react';
import { BankProvider } from '../types';
import { soundFX } from '../utils/audio';

interface CameraScannerModalProps {
  onScanResult: (result: { code: string; bank?: BankProvider }) => void;
  onClose: () => void;
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  onScanResult,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);

  // Helper to parse scanned content
  const parseScannedCode = useCallback((raw: string): { code: string; bank?: BankProvider } => {
    const text = raw.trim();

    // Check CBE FT code
    if (/FT[A-Z0-9]{8,14}/i.test(text)) {
      const match = text.match(/FT[A-Z0-9]{8,14}/i);
      return { code: match ? match[0].toUpperCase() : text, bank: 'cbe' };
    }

    // Check Telebirr URL or 10-digit
    if (text.includes('telebirr') || /^[0-9]{10}$/.test(text)) {
      const match = text.match(/[0-9]{10}/);
      return { code: match ? match[0] : text, bank: 'telebirr' };
    }

    // Check Awash AWB
    if (/AWB[A-Z0-9]{6,12}/i.test(text)) {
      const match = text.match(/AWB[A-Z0-9]{6,12}/i);
      return { code: match ? match[0].toUpperCase() : text, bank: 'awash' };
    }

    // Check BOA
    if (/BOA[A-Z0-9]{6,12}/i.test(text)) {
      const match = text.match(/BOA[A-Z0-9]{6,12}/i);
      return { code: match ? match[0].toUpperCase() : text, bank: 'abyssinia' };
    }

    // Check Dashen DSH
    if (/DSH[A-Z0-9]{6,12}/i.test(text)) {
      const match = text.match(/DSH[A-Z0-9]{6,12}/i);
      return { code: match ? match[0].toUpperCase() : text, bank: 'dashen' };
    }

    // Check CoOP
    if (/CO[OP|P][A-Z0-9]{6,12}/i.test(text)) {
      const match = text.match(/CO[OP|P][A-Z0-9]{6,12}/i);
      return { code: match ? match[0].toUpperCase() : text, bank: 'coop' };
    }

    // Generic uppercase
    return { code: text.toUpperCase() };
  }, []);

  const handleDetected = useCallback((rawText: string) => {
    if (!isScanning) return;
    setIsScanning(false);
    soundFX.playScanBeep();
    const result = parseScannedCode(rawText);
    onScanResult(result);
  }, [isScanning, onScanResult, parseScannedCode]);

  // Start Camera Stream
  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setHasCameraPermission(false);
          setErrorMessage('Camera access not supported on this browser.');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (!active) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setHasCameraPermission(true);
      } catch (err) {
        console.warn('Camera error:', err);
        setHasCameraPermission(false);
        setErrorMessage('Camera access was denied or device has no camera.');
      }
    }

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Frame detection loop with BarcodeDetector API if available
  useEffect(() => {
    let frameId: number;

    const checkBarcode = async () => {
      // @ts-expect-error - BarcodeDetector is a modern browser API
      if (window.BarcodeDetector && videoRef.current && videoRef.current.readyState === 4 && isScanning) {
        try {
          // @ts-expect-error - BarcodeDetector instantiation
          const detector = new window.BarcodeDetector({ formats: ['qr_code', 'code_128', 'ean_13', 'data_matrix'] });
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0 && barcodes[0].rawValue) {
            handleDetected(barcodes[0].rawValue);
            return;
          }
        } catch {
          // Ignore and continue loop
        }
      }

      if (isScanning) {
        frameId = requestAnimationFrame(checkBarcode);
      }
    };

    frameId = requestAnimationFrame(checkBarcode);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isScanning, handleDetected]);

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && 'applyConstraints' in track) {
      try {
        const next = !torchOn;
        // @ts-expect-error - torch is an experimental constraint
        await track.applyConstraints({ advanced: [{ torch: next }] });
        setTorchOn(next);
      } catch (e) {
        console.warn('Torch constraint failed:', e);
      }
    }
  };

  // Mock scan trigger for instant testing
  const triggerQuickSample = (sampleText: string) => {
    handleDetected(sampleText);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between animate-in fade-in duration-200">
      {/* Top Controls */}
      <div className="p-4 flex items-center justify-between text-white z-10">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-semibold tracking-tight">Receipt Scanner</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTorch}
            className={`p-2.5 rounded-full ${torchOn ? 'bg-amber-400 text-black' : 'bg-white/20 text-white'} backdrop-blur-md transition-colors`}
            title="Toggle Flash"
          >
            <Zap className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30 transition-colors"
            title="Close scanner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Viewfinder Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {hasCameraPermission === false ? (
          <div className="p-6 text-center text-white max-w-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 mx-auto flex items-center justify-center text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold">Camera Unavailable</h3>
            <p className="text-xs text-slate-300">
              {errorMessage || 'Allow camera permission or test using simulated receipt samples below.'}
            </p>
          </div>
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Framing Reticle */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
          <div className="w-64 h-64 border-2 border-dashed border-white/60 rounded-3xl relative flex items-center justify-center shadow-2xl">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-purple-500 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-purple-500 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-purple-500 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-purple-500 rounded-br-xl" />

            {/* Sweeping laser line */}
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse absolute" />

            <div className="text-center px-4">
              <QrCode className="w-8 h-8 text-white/50 mx-auto mb-1 animate-pulse" />
              <p className="text-[11px] font-medium text-white/90 drop-shadow-md">
                Align QR Code or Barcode
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Interactive Toolbar & Instant Sample Triggers */}
      <div className="p-4 bg-slate-900/95 border-t border-slate-800 text-white space-y-3 z-10 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Auto-detects CBE FT & Telebirr QR</span>
          </span>
          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
            LIVE POS
          </span>
        </div>

        {/* Quick Test Chips (Extremely useful for review without paper receipts) */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Tap to test simulated scanner capture:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => triggerQuickSample('FT2428198734')}
              className="py-2 px-3 bg-purple-900/60 hover:bg-purple-900 border border-purple-700/50 rounded-xl text-left transition-colors"
            >
              <div className="text-[11px] font-bold text-purple-200">CBE Receipt QR</div>
              <div className="text-[10px] font-mono text-purple-400 truncate">FT2428198734</div>
            </button>

            <button
              onClick={() => triggerQuickSample('1010948218')}
              className="py-2 px-3 bg-sky-900/60 hover:bg-sky-900 border border-sky-700/50 rounded-xl text-left transition-colors"
            >
              <div className="text-[11px] font-bold text-sky-200">Telebirr Slip QR</div>
              <div className="text-[10px] font-mono text-sky-400 truncate">1010948218</div>
            </button>
          </div>
        </div>

        {/* Image File Fallback */}
        <label className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.99] rounded-xl text-xs font-medium text-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-700">
          <Upload className="w-4 h-4 text-slate-400" />
          <span>Upload Receipt Screenshot</span>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                // Simulate decoding from image
                triggerQuickSample('FT2428198734');
              }
            }} 
          />
        </label>
      </div>
    </div>
  );
};
