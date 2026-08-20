'use client';

import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Camera, X, CheckCircle2, AlertTriangle } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedCode: string) => void;
  title?: string;
}

export function QRScannerModal({ isOpen, onClose, onScanSuccess, title = 'Scan Physical Asset QR Code' }: QRScannerModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (err: any) {
      console.warn('Camera stream error, fallback to manual code entry:', err);
      setError('Camera access not available or blocked. Please type the asset serial number manually below.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScanSuccess(manualCode.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#173B72]" />
            <span>{title}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Viewport / Scanner Frame */}
        <div className="relative rounded-xl overflow-hidden bg-gray-950 aspect-video flex items-center justify-center border-2 border-[#173B72]/40">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Scanner Overlay Box */}
          <div className="absolute inset-0 border-2 border-emerald-400/80 m-8 rounded-lg pointer-events-none flex flex-col justify-between p-2 shadow-inner animate-pulse">
            <span className="text-[10px] text-emerald-300 font-mono font-bold bg-black/50 px-1 rounded w-max">
              ALIGN ASSET QR
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Manual Serial Code Fallback Input */}
        <form onSubmit={handleManualSubmit} className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Or Enter Asset / Venue Code Manually
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. LC4FRC-COMP-001 or LC-4F-RC"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full p-2.5 text-xs rounded-lg border border-gray-300 font-mono focus:ring-2 focus:ring-[#173B72] outline-hidden uppercase"
              />
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="px-4 py-2.5 rounded-lg bg-[#173B72] text-white font-bold text-xs hover:bg-[#1e4a8e] transition-colors disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </form>

        <div className="pt-2 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
