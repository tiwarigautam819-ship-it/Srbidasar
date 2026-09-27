import React, { useEffect, useState } from 'react';
import { 
  Link2, 
  ExternalLink, 
  Instagram, 
  Youtube, 
  Facebook, 
  Send, 
  Globe, 
  Music, 
  Radio, 
  Share2,
  Sparkles,
  Loader2
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LinkItem } from '../types';
import { useApp } from '../context/AppContext';

export const getLinkIcon = (iconName?: string) => {
  const normalized = (iconName || '').toLowerCase();
  if (normalized.includes('instagram')) return <Instagram className="w-6 h-6 text-pink-500" />;
  if (normalized.includes('youtube')) return <Youtube className="w-6 h-6 text-red-500" />;
  if (normalized.includes('facebook')) return <Facebook className="w-6 h-6 text-blue-500" />;
  if (normalized.includes('telegram') || normalized.includes('tg')) return <Send className="w-6 h-6 text-sky-400" />;
  if (normalized.includes('music') || normalized.includes('spotify') || normalized.includes('song')) return <Music className="w-6 h-6 text-emerald-400" />;
  if (normalized.includes('radio') || normalized.includes('dj') || normalized.includes('live')) return <Radio className="w-6 h-6 text-amber-400" />;
  return <Globe className="w-6 h-6 text-indigo-400" />;
};

export const LinksSection: React.FC = () => {
  const { settings } = useApp();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'links'),
      where('visible', '==', true),
      orderBy('order', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: LinkItem[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...(doc.data() as Omit<LinkItem, 'id'>) });
        });
        setLinks(items);
        setLoading(false);
      },
      (error) => {
        console.warn('Links query error (fallback without order):', error);
        const simpleQ = query(collection(db, 'links'), where('visible', '==', true));
        onSnapshot(simpleQ, (snap) => {
          const items: LinkItem[] = [];
          snap.forEach((doc) => {
            items.push({ id: doc.id, ...(doc.data() as Omit<LinkItem, 'id'>) });
          });
          items.sort((a, b) => (a.order || 0) - (b.order || 0));
          setLinks(items);
          setLoading(false);
        });
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Link2 className="w-3.5 h-3.5" />
          <span>OFFICIAL SOCIAL & STREAMING LINKS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Connect With {settings.websiteName || 'SR BIDASAR'}
        </h1>
        <p className="text-sm text-slate-300 max-w-lg mx-auto">
          Follow our official channels across social media, streaming apps, and community groups for the newest track drops.
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-amber-400" />
          <span className="text-xs">Loading official links...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && links.length === 0 && (
        <div className="text-center py-16 rounded-3xl bg-slate-900/40 border border-white/5 p-8 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <Link2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Additional Links Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            The administrator has not published any custom links yet. Check back soon!
          </p>
        </div>
      )}

      {/* Links List */}
      {!loading && links.length > 0 && (
        <div className="space-y-4">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#111422] to-[#0c0e18] border border-white/10 hover:border-amber-500/50 hover:from-[#15192c] hover:to-[#0f1220] transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-amber-500/10 active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  {getLinkIcon(link.icon || link.title)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-amber-300 transition-colors flex items-center gap-2">
                    <span>{link.title}</span>
                  </h3>
                  {link.description && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {link.description}
                    </p>
                  )}
                  <span className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors truncate max-w-xs block font-mono mt-0.5">
                    {link.url}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pl-3">
                <span className="hidden sm:inline-block text-xs font-semibold text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Visit
                </span>
                <div className="w-9 h-9 rounded-xl bg-white/5 group-hover:bg-amber-500 text-slate-400 group-hover:text-white flex items-center justify-center transition-all">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

    </div>
  );
};
