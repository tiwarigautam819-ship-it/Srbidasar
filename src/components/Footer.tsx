import React, { useState, useRef } from 'react';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

interface FooterProps {
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminLogin }) => {
  const { settings, setActiveTab } = useApp();
  const { isAdmin } = useAuth();

  // Hidden 7-click logo trigger in footer too
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    setActiveTab('videos');
    setClickCount((prev) => {
      const nextCount = prev + 1;
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
      if (nextCount >= 7) {
        onOpenAdminLogin();
        return 0;
      }
      clickTimerRef.current = setTimeout(() => {
        setClickCount(0);
      }, 2500);
      return nextCount;
    });
  };

  return (
    <footer className="mt-20 border-t border-white/10 bg-[#07080c] text-slate-400 py-10 pb-28 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
          
          {/* Brand info with 7-click secret trigger */}
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-3 text-center md:text-left cursor-pointer select-none"
            title="SR Bidasar"
          >
            <Logo size="md" />
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-base font-bold text-white tracking-wide">
                  {settings.websiteName || 'SR BIDASAR'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                  Verified Artist
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Official Remix, Mashup & DJ Production Portal
              </p>
            </div>
          </div>

          {/* Quick Links (Admin Area hidden from public view) */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-medium">
            <button
              onClick={() => setActiveTab('videos')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Videos
            </button>
            <button
              onClick={() => setActiveTab('rating')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Rate Us
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Contact
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Social Links
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Panel
              </button>
            )}
          </div>
        </div>

        {/* Required Copyright line */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-center sm:text-left font-medium">
            {settings.footerText || '© 2026 Gautam Tiwari from Nexora. All Rights Reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
};
