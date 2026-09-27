import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Check, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  Database,
  Film,
  Link2
} from 'lucide-react';
import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useApp } from '../../context/AppContext';
import { getYoutubeThumbnail, getYoutubeWatchUrl } from '../../utils/youtube';

export const SettingsTab: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const [websiteName, setWebsiteName] = useState(settings.websiteName || 'SR BIDASAR');
  const [footerText, setFooterText] = useState(
    settings.footerText || '© 2026 Gautam Tiwari from Nexora. All Rights Reserved.'
  );
  const [aboutText, setAboutText] = useState(
    settings.aboutText ||
      'Official music and remix video hub for SR Bidasar. Watch our latest tracks, rate your favorite drops, and submit your remix suggestions.'
  );

  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [success, setSuccess] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteName.trim()) {
      setError('Website Name cannot be empty.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateSettings({
        websiteName: websiteName.trim(),
        footerText: footerText.trim(),
        aboutText: aboutText.trim(),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err: any) {
      console.error('Error updating settings:', err);
      setError(err?.message || 'Failed to update settings in Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const handleSeedSampleData = async () => {
    if (!window.confirm('Populate starter YouTube remix videos, community links, and ratings into Firebase Firestore?')) return;
    setSeeding(true);
    setSeedSuccess(null);

    try {
      // 1. Starter sample videos
      const sampleVideos = [
        {
          id: 'dQw4w9WgXcQ',
          title: 'SR Bidasar - Desert Beat Mega Bass Remix',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        },
        {
          id: '9bZkp7q19f0',
          title: 'SR Bidasar - Viral Dholak Drop Extended Club Mix',
          url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
        },
        {
          id: 'kJQP7kiw5Fk',
          title: 'SR Bidasar - Midnight Electro Bass Mashup 2026',
          url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
        },
      ];

      for (const vid of sampleVideos) {
        await addDoc(collection(db, 'videos'), {
          youtubeUrl: vid.url,
          youtubeVideoId: vid.id,
          title: vid.title,
          thumbnailUrl: getYoutubeThumbnail(vid.id, 'hq'),
          visible: true,
          createdAt: Date.now() - Math.floor(Math.random() * 50000000),
          updatedAt: Date.now(),
        });
      }

      // 2. Starter sample links
      const sampleLinks = [
        {
          title: 'Official Instagram',
          url: 'https://instagram.com/srbidasar',
          description: 'Follow for exclusive remix clips, reels & studio stories',
          icon: 'instagram',
          visible: true,
          order: 0,
        },
        {
          title: 'YouTube Channel',
          url: 'https://youtube.com/@srbidasar',
          description: 'Subscribe for weekly official HD remixes & audio drops',
          icon: 'youtube',
          visible: true,
          order: 1,
        },
        {
          title: 'Telegram DJ VIP Channel',
          url: 'https://t.me/srbidasarmusic',
          description: 'Join the community group for FLAC audio downloads & announcements',
          icon: 'telegram',
          visible: true,
          order: 2,
        },
      ];

      for (const link of sampleLinks) {
        await addDoc(collection(db, 'links'), {
          ...link,
          createdAt: Date.now(),
        });
      }

      // 3. Starter sample initial ratings
      const sampleRatings = [5, 5, 5, 4, 5, 4, 5, 5];
      for (const r of sampleRatings) {
        await addDoc(collection(db, 'ratings'), {
          rating: r,
          deviceId: 'sample_seed',
          createdAt: Date.now() - Math.floor(Math.random() * 80000000),
        });
      }

      setSeedSuccess('Successfully seeded initial remix videos, social links, and ratings into Firestore!');
      setTimeout(() => setSeedSuccess(null), 4000);
    } catch (err: any) {
      console.error('Error seeding data:', err);
      setError(err?.message || 'Failed to seed sample data.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-amber-400" />
            <span>General Platform Settings</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure branding text, footer copyright, and database initialization
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
          <Check className="w-4 h-4 shrink-0" />
          <span>Platform settings saved to Firestore!</span>
        </div>
      )}

      {seedSuccess && (
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{seedSuccess}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSaveSettings} className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Website Brand Name
          </label>
          <input
            type="text"
            value={websiteName}
            onChange={(e) => setWebsiteName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-amber-400 transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            About / Subtitle Tagline
          </label>
          <textarea
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Footer Copyright Text
          </label>
          <input
            type="text"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
            required
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Required: © 2026 Gautam Tiwari from Nexora. All Rights Reserved.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 font-bold text-white text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>SAVE PLATFORM SETTINGS</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Database Seeder Section for initial showcase setup */}
      <div className="p-6 rounded-3xl bg-indigo-950/20 border border-indigo-500/20 space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-400" />
          <h4 className="text-sm font-bold text-white">Starter Data Seeder</h4>
        </div>
        <p className="text-xs text-slate-300">
          Want to populate sample YouTube remix videos, community links, and starter ratings into Firestore for instant showcase? Click below:
        </p>

        <button
          type="button"
          onClick={handleSeedSampleData}
          disabled={seeding}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {seeding ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Seeding Firestore Collections...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>SEED STARTER SHOWCASE DATA</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
