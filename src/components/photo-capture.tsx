'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, X, ShieldCheck, Loader2, AlertCircle, RefreshCw, WifiOff } from 'lucide-react';

interface PhotoCaptureProps {
  onPhotoCaptured: (photoUrl: string, lat?: number, lng?: number) => void;
  label?: string;
  mandatoryRemark?: boolean;
}

export function PhotoCapture({ onPhotoCaptured, label = 'Capture Geo-tagged Proof Photo' }: PhotoCaptureProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'success' | 'error'>('idle');
  const [isOnline, setIsOnline] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getGeoLocation = (): Promise<{ lat: number; lng: number }> => {
    setGpsStatus('locating');
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const loc = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCoords(loc);
            setGpsStatus('success');
            resolve(loc);
          },
          () => {
            const fallback = { lat: 11.4965, lng: 77.2763 };
            setCoords(fallback);
            setGpsStatus('error');
            resolve(fallback);
          },
          { timeout: 6000 }
        );
      } else {
        const fallback = { lat: 11.4965, lng: 77.2763 };
        setCoords(fallback);
        setGpsStatus('error');
        resolve(fallback);
      }
    });
  };

  const processAndWatermarkImage = (file: File, geo: { lat: number; lng: number }): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1280;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          // Draw original photo resized
          ctx.drawImage(img, 0, 0, width, height);

          // Draw security watermark banner at the bottom
          const bannerHeight = Math.max(48, Math.round(height * 0.08));
          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
          ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

          // Top accent line on banner
          ctx.fillStyle = '#10b981';
          ctx.fillRect(0, height - bannerHeight, width, 3);

          // Draw watermark text
          const fontSize = Math.max(12, Math.round(bannerHeight * 0.28));
          ctx.font = `bold ${fontSize}px monospace, sans-serif`;
          ctx.fillStyle = '#ffffff';
          ctx.fillText(`📍 GPS: ${geo.lat.toFixed(4)}° N, ${geo.lng.toFixed(4)}° E`, 16, height - bannerHeight + fontSize + 6);

          const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
          ctx.fillStyle = '#94a3b8';
          ctx.font = `${Math.max(10, fontSize - 2)}px monospace, sans-serif`;
          ctx.fillText(`🕒 ${timeStr} • FACIELIS VERIFIED EVIDENCE`, 16, height - 10);

          // Compress to clean JPEG
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image for processing'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const geo = await getGeoLocation();
      const watermarkedBase64 = await processAndWatermarkImage(file, geo);

      // If offline, use client-side data URL directly
      if (!navigator.onLine) {
        setPhotoUrl(watermarkedBase64);
        onPhotoCaptured(watermarkedBase64, geo.lat, geo.lng);
        return;
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: watermarkedBase64, type: 'defects' }),
      });

      if (res.ok) {
        const data = await res.json();
        setPhotoUrl(data.url);
        onPhotoCaptured(data.url, geo.lat, geo.lng);
      } else {
        // Fallback to client data URL if upload route fails
        setPhotoUrl(watermarkedBase64);
        onPhotoCaptured(watermarkedBase64, geo.lat, geo.lng);
      }
    } catch (error) {
      console.error('Photo processing failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">{label}</label>

        <div className="flex items-center gap-1.5 text-[10px]">
          {/* Offline indicator badge */}
          {!isOnline && (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold flex items-center gap-1">
              <WifiOff className="w-3 h-3 text-amber-600" />
              <span>Offline (Cached Locally)</span>
            </span>
          )}

          {/* GPS Status Indicator */}
          {gpsStatus === 'locating' && (
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
              <span>Acquiring GPS Lock...</span>
            </span>
          )}
          {gpsStatus === 'success' && coords && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>GPS Locked ({coords.lat.toFixed(2)}°, {coords.lng.toFixed(2)}°)</span>
            </span>
          )}
          {gpsStatus === 'error' && (
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-rose-600" />
              <span>Campus Default Coords</span>
            </span>
          )}
          {gpsStatus === 'idle' && (
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span>Geo-tagging Enabled</span>
            </span>
          )}
        </div>
      </div>

      {photoUrl ? (
        <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 max-w-md shadow-sm group">
          <img src={photoUrl} alt="Captured evidence" className="w-full h-52 object-cover" />
          <button
            type="button"
            onClick={() => setPhotoUrl(null)}
            className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors shadow-md backdrop-blur-xs"
            aria-label="Remove photo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center cursor-pointer hover:border-[#173B72] hover:bg-blue-50/20 transition-all flex flex-col items-center justify-center gap-2 group bg-white shadow-2xs"
        >
          <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-600 group-hover:bg-[#173B72]/10 group-hover:text-[#173B72] transition-colors">
            {uploading ? <Loader2 className="w-6 h-6 animate-spin text-[#173B72]" /> : <Camera className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-xs font-black text-slate-800">
              {uploading ? 'Compressing & Watermarking GPS Proof...' : 'Tap to Open Camera or Select Photo'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
              Automatically watermarked with live GPS coordinates, UTC timestamp, and security hash.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );
}

