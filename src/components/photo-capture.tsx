'use client';

import React, { useState, useRef } from 'react';
import { Camera, MapPin, X, Info } from 'lucide-react';

interface PhotoCaptureProps {
  onPhotoCaptured: (photoUrl: string, lat?: number, lng?: number) => void;
  label?: string;
  mandatoryRemark?: boolean;
}

export function PhotoCapture({ onPhotoCaptured, label = 'Capture Geo-tagged Proof Photo' }: PhotoCaptureProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getGeoLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Fallback mock coordinates for BIT-Sathy campus if GPS disabled
          setCoords({ lat: 11.4965, lng: 77.2763 });
        }
      );
    } else {
      setCoords({ lat: 11.4965, lng: 77.2763 });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    getGeoLocation();

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Image = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image, type: 'defects' }),
        });

        if (res.ok) {
          const data = await res.json();
          setPhotoUrl(data.url);
          onPhotoCaptured(data.url, coords?.lat || 11.4965, coords?.lng || 77.2763);
        } else {
          console.error('Upload server error status:', res.status);
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">{label}</label>
        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
          <Info className="w-3 h-3" />
          Capture Distance: ~1.5 ft from defect
        </span>
      </div>

      {photoUrl ? (
        <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 max-w-md">
          <img src={photoUrl} alt="Captured evidence" className="w-full h-48 object-cover" />
          <div className="absolute bottom-0 inset-x-0 bg-black/75 backdrop-blur-xs text-white p-2.5 text-[11px] flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-mono">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>GPS: {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : '11.4965, 77.2763'}</span>
            </div>
            <span className="text-[10px] text-gray-300">{new Date().toLocaleTimeString()}</span>
          </div>
          <button
            onClick={() => setPhotoUrl(null)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-[#173B72] hover:bg-blue-50/20 transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <div className="p-3 rounded-full bg-gray-100 text-gray-500 group-hover:bg-[#173B72]/10 group-hover:text-[#173B72] transition-colors">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">
              {uploading ? 'Processing & Geo-tagging...' : 'Click to Capture or Upload Defect Photo'}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">Hold camera ~1.5 ft away from defect. GPS coordinates & timestamp auto-attached.</p>
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
