import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppSettings, VideoItem } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  websiteName: 'SR BIDASAR',
  logoUrl: '',
  whatsappUrl: 'https://wa.me/919876543210',
  contactEmail: 'tiwarigautam819@gmail.com',
  footerText: '© 2026 Gautam Tiwari from Nexora. All Rights Reserved.',
  aboutText: 'The official destination for all SR Bidasar original remixes, mashups, and songs. Explore, rate, and suggest the next viral remix!',
};

interface AppContextType {
  settings: AppSettings;
  settingsLoading: boolean;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  activeTab: 'videos' | 'rating' | 'contact' | 'links' | 'admin';
  setActiveTab: (tab: 'videos' | 'rating' | 'contact' | 'links' | 'admin') => void;
  isSuggestModalOpen: boolean;
  setIsSuggestModalOpen: (open: boolean) => void;
  commentingVideo: VideoItem | null;
  setCommentingVideo: (video: VideoItem | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial settings with localStorage cache fallback for zero lag
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const cached = localStorage.getItem('srbidasar_cached_settings');
      if (cached) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [settingsLoading, setSettingsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'videos' | 'rating' | 'contact' | 'links' | 'admin'>('videos');
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState<boolean>(false);
  const [commentingVideo, setCommentingVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    const settingsDocRef = doc(db, 'settings', 'general');
    const unsubscribe = onSnapshot(
      settingsDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as AppSettings;
          const merged = { ...DEFAULT_SETTINGS, ...data };
          setSettings(merged);
          try {
            localStorage.setItem('srbidasar_cached_settings', JSON.stringify(merged));
          } catch {}
        }
        setSettingsLoading(false);
      },
      (error) => {
        console.warn('Settings snapshot error:', error);
        setSettingsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated: AppSettings = {
      ...settings,
      ...newSettings,
    };

    // 1. Immediately apply to UI (zero waiting time!)
    setSettings(updated);
    try {
      localStorage.setItem('srbidasar_cached_settings', JSON.stringify(updated));
    } catch {}

    // 2. Persist to Firestore with non-blocking timeout
    try {
      const settingsDocRef = doc(db, 'settings', 'general');
      const savePromise = setDoc(settingsDocRef, updated, { merge: true });
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 3000));
      await Promise.race([savePromise, timeoutPromise]);
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        settingsLoading,
        updateSettings,
        activeTab,
        setActiveTab,
        isSuggestModalOpen,
        setIsSuggestModalOpen,
        commentingVideo,
        setCommentingVideo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
