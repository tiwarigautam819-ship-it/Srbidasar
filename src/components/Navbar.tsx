import React, { useState, useRef } from 'react';
import { 
  PlaySquare, 
  Star, 
  PhoneCall, 
  Link2, 
  Lightbulb, 
  ShieldCheck, 
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

interface NavbarProps {
  onOpenAdminLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdminLogin }) => {
  const { settings, activeTab, setActiveTab, setIsSuggestModalOpen } = useApp();
  const { isAdmin } = useAuth();

  // Hidden 7-click logo trigger for admin login
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleBrandClick = () => {
    setActiveTab('videos');

    // Count rapid clicks on the logo
    setClickCount((prev) => {
      const nextCount = prev + 1;

      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }

      if (nextCount >= 7) {
        // Trigger admin login modal after 7 clicks
        onOpenAdminLogin();
        return 0;
      }

      // Reset count if user stops clicking for 2.5 seconds
      clickTimerRef.current = setTimeout(() => {
        setClickCount(0);
      }, 2500);

      return nextCount;
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090a0f]/90 backdrop-blur-md border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Name & Logo with 7-Click Secret Trigger */}
          <button
            onClick={handleBrandClick}
            className="flex items-center gap-3 group text-left transition-transform active:scale-95 cursor-pointer select-none"
            aria-label="SR Bidasar Official"
            title="SR Bidasar"
          >
            <div className="relative">
              <Logo size="md" />
              {/* Subtle visual pulse feedback when clicking rapidly */}
              {clickCount > 2 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-rose-300 to-amber-200 bg-clip-text text-transparent">
                  {settings.websiteName || 'SR BIDASAR'}
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" /> OFFICIAL
                </span>
              </div>
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium tracking-wide">
                Remixes & Music Drops
              </span>
            </div>
          </button>

          {/* Desktop & Tablet Navigation (3 Main Options + Videos) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-full border border-white/10">
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'videos'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <PlaySquare className="w-4 h-4" />
              <span>Videos</span>
            </button>

            <button
              onClick={() => setActiveTab('rating')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'rating'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Rating</span>
            </button>

            <button
              onClick={() => setActiveTab('contact')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'contact'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>Contact</span>
            </button>

            <button
              onClick={() => setActiveTab('links')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'links'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>Links</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Suggest a Remix button */}
            <button
              onClick={() => setIsSuggestModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 text-amber-300 border border-amber-500/40 hover:border-amber-400 transition-all active:scale-95 shadow-sm"
              title="Suggest a song for next remix"
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span className="hidden xs:inline">Suggest Remix</span>
              <span className="xs:hidden">Suggest</span>
            </button>

            {/* Admin Panel Button - ONLY displayed when admin is already authenticated */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                  activeTab === 'admin'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                }`}
                title="Admin Panel"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Admin Panel</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
