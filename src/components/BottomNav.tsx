import React from 'react';
import { PlaySquare, Star, PhoneCall, Link2, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const { isAdmin } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0e17]/95 backdrop-blur-lg border-t border-white/10 px-2 py-1.5 safe-area-bottom">
      <div className="flex items-center justify-around">
        
        {/* Videos / Home */}
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
            activeTab === 'videos'
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PlaySquare className={`w-5 h-5 transition-transform ${activeTab === 'videos' ? 'scale-110 text-amber-400' : ''}`} />
          <span className="text-[11px] mt-0.5">Videos</span>
          {activeTab === 'videos' && (
            <span className="absolute bottom-0 w-6 h-0.5 bg-amber-400 rounded-full" />
          )}
        </button>

        {/* 1. Rating */}
        <button
          onClick={() => setActiveTab('rating')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
            activeTab === 'rating'
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Star className={`w-5 h-5 transition-transform ${activeTab === 'rating' ? 'scale-110 fill-amber-400 text-amber-400' : ''}`} />
          <span className="text-[11px] mt-0.5">Rating</span>
          {activeTab === 'rating' && (
            <span className="absolute bottom-0 w-6 h-0.5 bg-amber-400 rounded-full" />
          )}
        </button>

        {/* 2. Contact */}
        <button
          onClick={() => setActiveTab('contact')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
            activeTab === 'contact'
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PhoneCall className={`w-5 h-5 transition-transform ${activeTab === 'contact' ? 'scale-110 text-amber-400' : ''}`} />
          <span className="text-[11px] mt-0.5">Contact</span>
          {activeTab === 'contact' && (
            <span className="absolute bottom-0 w-6 h-0.5 bg-amber-400 rounded-full" />
          )}
        </button>

        {/* 3. Links */}
        <button
          onClick={() => setActiveTab('links')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
            activeTab === 'links'
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Link2 className={`w-5 h-5 transition-transform ${activeTab === 'links' ? 'scale-110 text-amber-400' : ''}`} />
          <span className="text-[11px] mt-0.5">Links</span>
          {activeTab === 'links' && (
            <span className="absolute bottom-0 w-6 h-0.5 bg-amber-400 rounded-full" />
          )}
        </button>

        {/* Admin (Only if Admin is logged in) */}
        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
              activeTab === 'admin'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className={`w-5 h-5 transition-transform ${activeTab === 'admin' ? 'scale-110 text-emerald-400' : ''}`} />
            <span className="text-[11px] mt-0.5">Admin</span>
            {activeTab === 'admin' && (
              <span className="absolute bottom-0 w-6 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>
        )}

      </div>
    </nav>
  );
};
