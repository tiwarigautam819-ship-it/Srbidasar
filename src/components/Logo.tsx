import React, { useState, useEffect } from 'react';
import { Disc3 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const { settings } = useApp();
  const [imageError, setImageError] = useState(false);

  // Reset error when logoUrl changes
  useEffect(() => {
    setImageError(false);
  }, [settings.logoUrl]);

  const dimensions = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
  }[size];

  if (settings.logoUrl && !imageError) {
    return (
      <img
        src={settings.logoUrl}
        alt={settings.websiteName || 'SR Bidasar'}
        className={`${dimensions} rounded-xl object-cover ring-1 ring-amber-500/30 shrink-0 ${className}`}
        onError={() => {
          setImageError(true);
        }}
      />
    );
  }

  return (
    <div
      className={`${dimensions} rounded-xl bg-gradient-to-tr from-amber-600 via-rose-600 to-indigo-600 flex items-center justify-center font-black tracking-wider text-white shadow-lg shadow-amber-500/20 ring-1 ring-white/20 select-none shrink-0 ${className}`}
    >
      <div className="flex items-center justify-center gap-0.5">
        <Disc3 className="w-5 h-5 animate-spin [animation-duration:8s] text-amber-200" />
      </div>
    </div>
  );
};
