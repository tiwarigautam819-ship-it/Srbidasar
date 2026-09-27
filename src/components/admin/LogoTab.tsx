import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Check, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  FileImage
} from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { useApp } from '../../context/AppContext';
import { Logo } from '../Logo';
import { compressLogoImage } from '../../utils/image';

const PRESET_LOGOS = [
  {
    name: 'Gold Crown DJ',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Neon Turntable',
    url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Electro Studio',
    url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&auto=format&fit=crop&q=80',
  },
];

export const LogoTab: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressedDataUrl, setCompressedDataUrl] = useState<string | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [fileStats, setFileStats] = useState<{ originalSize: string; compressedSize: string } | null>(null);

  const [customUrlInput, setCustomUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP, etc.).');
      return;
    }

    try {
      setSelectedFile(file);
      // Auto compress & resize to max 400x400 to prevent Firestore document limits
      const { dataUrl, blob } = await compressLogoImage(file, 400, 0.85);
      setCompressedDataUrl(dataUrl);
      setCompressedBlob(blob);
      setFileStats({
        originalSize: formatFileSize(file.size),
        compressedSize: formatFileSize(blob.size),
      });
    } catch (err: any) {
      console.error('Compression error:', err);
      setError('Failed to process image. Try a different file.');
    }
  };

  const handleApplyLogo = async () => {
    if (!compressedDataUrl && !customUrlInput.trim()) {
      setError('Please select an image file or enter an image URL.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const finalLogoUrl = customUrlInput.trim() || compressedDataUrl || '';

      await updateSettings({ logoUrl: finalLogoUrl });

      setSuccess(true);
      setSelectedFile(null);
      setCompressedDataUrl(null);
      setCompressedBlob(null);
      setFileStats(null);
      setCustomUrlInput('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving logo:', err);
      setError(err?.message || 'Failed to update website logo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectPreset = async (presetUrl: string) => {
    setUploading(true);
    setError(null);
    try {
      await updateSettings({ logoUrl: presetUrl });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err: any) {
      setError(err?.message || 'Failed to apply preset logo.');
    } finally {
      setUploading(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!window.confirm('Reset website logo to official default dynamic badge?')) return;
    setUploading(true);
    try {
      await updateSettings({ logoUrl: '' });
      setSelectedFile(null);
      setCompressedDataUrl(null);
      setCustomUrlInput('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to reset logo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <span>Logo Management</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Change and customize the official logo throughout the entire website
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Website logo updated successfully! It is now active across all pages.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Upload & Choose Form */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4 shadow-xl">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Upload Logo from Mobile / PC</span>
          </h4>

          {/* File Dropzone */}
          <div className="relative border-2 border-dashed border-white/15 hover:border-amber-400/50 rounded-2xl p-6 text-center transition-colors cursor-pointer group bg-slate-950/40">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="space-y-2 pointer-events-none">
              <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileImage className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-200">
                Tap to Choose Photo or Drag Image Here
              </p>
              <p className="text-[11px] text-slate-500">
                Any image format supported (Auto-optimized for instant loading)
              </p>
            </div>
          </div>

          {/* Compression Stats Badge */}
          {fileStats && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
              <span>Optimized: {fileStats.originalSize} → {fileStats.compressedSize}</span>
              <span className="text-[10px] font-bold bg-emerald-500/20 px-2 py-0.5 rounded">Ready to Apply</span>
            </div>
          )}

          {/* Or Direct Image URL */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Or Paste Image URL</span>
            </label>
            <input
              type="url"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              placeholder="https://example.com/logo.jpg"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Apply Button */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleApplyLogo}
              disabled={uploading || (!compressedDataUrl && !customUrlInput.trim())}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 font-bold text-white text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-40"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Logo to Website...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>SAVE & UPDATE LOGO</span>
                </>
              )}
            </button>

            {settings.logoUrl && (
              <button
                type="button"
                onClick={handleResetToDefault}
                disabled={uploading}
                className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Reset to default brand icon"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Preset Logos */}
          <div className="pt-4 border-t border-white/5 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Or Pick A Pro DJ Artwork Preset:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_LOGOS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset.url)}
                  disabled={uploading}
                  className="group relative rounded-xl overflow-hidden aspect-square border border-white/10 hover:border-amber-400 focus:outline-none transition-all active:scale-95"
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-center">
                    <span className="text-[9px] font-bold text-white leading-tight">
                      Use This
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4 shadow-xl">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Live Logo Preview</span>
          </h4>

          <div className="p-8 rounded-2xl bg-[#090a0f] border border-white/5 flex flex-col items-center justify-center gap-4 text-center">
            {/* Show new selection if available */}
            {compressedDataUrl || customUrlInput ? (
              <div className="space-y-2">
                <img
                  src={compressedDataUrl || customUrlInput}
                  alt="New Logo Preview"
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-amber-500 mx-auto shadow-2xl"
                />
                <span className="text-xs text-amber-400 font-semibold block">
                  ✨ New Logo Preview (Click "Save & Update Logo" to apply)
                </span>
              </div>
            ) : settings.logoUrl ? (
              <div className="space-y-2">
                <img
                  src={settings.logoUrl}
                  alt="Current Active Logo"
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-emerald-500/50 mx-auto shadow-2xl"
                />
                <span className="text-xs text-emerald-400 font-semibold block">
                  ✅ Current Active Website Logo
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <Logo size="lg" className="mx-auto w-20 h-20" />
                <span className="text-xs text-slate-400 font-medium block">
                  Official Default Dynamic Badge
                </span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-[11px] text-slate-400 max-w-xs leading-relaxed">
              When saved, this logo immediately updates across the top navigation bar, mobile bottom header, and the footer copyright section.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
