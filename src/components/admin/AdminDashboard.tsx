import React, { useState } from 'react';
import { 
  Film, 
  Lightbulb, 
  MessageSquare, 
  Star, 
  Image as ImageIcon, 
  PhoneCall, 
  Link2, 
  Users, 
  Settings as SettingsIcon,
  LogOut,
  ArrowLeft,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { VideoTab } from './VideoTab';
import { SuggestionsTab } from './SuggestionsTab';
import { CommentsTab } from './CommentsTab';
import { RatingsTab } from './RatingsTab';
import { LogoTab } from './LogoTab';
import { ContactTab } from './ContactTab';
import { LinksTab } from './LinksTab';
import { AdminsTab } from './AdminsTab';
import { SettingsTab } from './SettingsTab';

export const AdminDashboard: React.FC = () => {
  const { currentUser, isSuperAdmin, logout } = useAuth();
  const { setActiveTab } = useApp();
  const [selectedSubTab, setSelectedSubTab] = useState<
    'videos' | 'suggestions' | 'comments' | 'ratings' | 'logo' | 'contact' | 'links' | 'admins' | 'settings'
  >('videos');

  const adminTabs = [
    { id: 'videos', label: 'Videos', icon: Film, emoji: '🎬' },
    { id: 'suggestions', label: 'Suggestions', icon: Lightbulb, emoji: '💡' },
    { id: 'comments', label: 'Comments', icon: MessageSquare, emoji: '💬' },
    { id: 'ratings', label: 'Ratings', icon: Star, emoji: '⭐' },
    { id: 'logo', label: 'Logo', icon: ImageIcon, emoji: '🖼️' },
    { id: 'contact', label: 'Contact', icon: PhoneCall, emoji: '📞' },
    { id: 'links', label: 'Links', icon: Link2, emoji: '🔗' },
    { id: 'admins', label: 'Admins', icon: Users, emoji: '👤' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, emoji: '⚙️' },
  ];

  const handleLogout = async () => {
    await logout();
    setActiveTab('videos');
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-in fade-in duration-200">
      
      {/* Top Header Card */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('videos')}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Return to Public Website"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Admin Control Center
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                isSuperAdmin 
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs sm:max-w-md">
              Logged in as <span className="font-mono text-slate-300">{currentUser?.email}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            onClick={() => setActiveTab('videos')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            View Live Site
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile-First 9 Tab Bar (Horizontal Scrollable on Mobile) */}
      <div className="overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10 min-w-max">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {selectedSubTab === 'videos' && <VideoTab />}
        {selectedSubTab === 'suggestions' && <SuggestionsTab />}
        {selectedSubTab === 'comments' && <CommentsTab />}
        {selectedSubTab === 'ratings' && <RatingsTab />}
        {selectedSubTab === 'logo' && <LogoTab />}
        {selectedSubTab === 'contact' && <ContactTab />}
        {selectedSubTab === 'links' && <LinksTab />}
        {selectedSubTab === 'admins' && <AdminsTab />}
        {selectedSubTab === 'settings' && <SettingsTab />}
      </div>

    </div>
  );
};
