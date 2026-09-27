import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Play, 
  ExternalLink, 
  MessageSquare, 
  Calendar, 
  Share2, 
  Sparkles, 
  Film, 
  X,
  Lightbulb,
  Music2,
  Check
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { VideoItem } from '../types';
import { useApp } from '../context/AppContext';
import { getYoutubeThumbnail, getYoutubeWatchUrl } from '../utils/youtube';

interface VideoSectionProps {
  onOpenComments: (video: VideoItem) => void;
}

export const VideoSection: React.FC<VideoSectionProps> = ({ onOpenComments }) => {
  const { settings, setIsSuggestModalOpen } = useApp();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // Listen to visible videos
    const q = query(
      collection(db, 'videos'),
      where('visible', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: VideoItem[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...(doc.data() as Omit<VideoItem, 'id'>) });
        });
        setVideos(items);
        setLoading(false);
      },
      (error) => {
        console.warn('Firestore videos query error (may need fallback if indexing):', error);
        // Fallback without orderBy if composite index needed
        const simpleQ = query(collection(db, 'videos'), where('visible', '==', true));
        onSnapshot(simpleQ, (snap) => {
          const items: VideoItem[] = [];
          snap.forEach((doc) => {
            items.push({ id: doc.id, ...(doc.data() as Omit<VideoItem, 'id'>) });
          });
          items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setVideos(items);
          setLoading(false);
        });
      }
    );

    return () => unsubscribe();
  }, []);

  const handleOpenVideo = (video: VideoItem) => {
    const url = video.youtubeUrl || getYoutubeWatchUrl(video.youtubeVideoId);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async (e: React.MouseEvent, video: VideoItem) => {
    e.stopPropagation();
    const url = video.youtubeUrl || getYoutubeWatchUrl(video.youtubeVideoId);
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: `Check out "${video.title}" on SR Bidasar:`,
          url: url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(video.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const filteredVideos = videos.filter((v) =>
    v.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="space-y-8">
      
      {/* Hero Banner with Title, Tagline, & Suggest Remix CTA */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-[#0d0f1a] to-[#090a0f] border border-white/10 p-6 sm:p-10 text-center shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(225,29,72,0.12),transparent_50%)]" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OFFICIAL REMIX PLATFORM</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Feel The Rhythm With{' '}
            <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-amber-200 bg-clip-text text-transparent">
              {settings.websiteName || 'SR BIDASAR'}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
            {settings.aboutText ||
              'Stream the hottest viral remixes, bass boosted tracks, and DJ bootlegs. Have a favorite song in mind? Send your remix suggestion directly to the studio!'}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsSuggestModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition-all active:scale-95"
            >
              <Lightbulb className="w-4 h-4" />
              <span>💡 Suggest a Remix</span>
            </button>
          </div>
        </div>
      </section>

      {/* Search Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-amber-400" />
            <span>Featured Videos</span>
            {!loading && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5">
                {videos.length} {videos.length === 1 ? 'Video' : 'Videos'}
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any card to watch the original video on YouTube
          </p>
        </div>

        {/* 4. SEARCH BOX */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos by title..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="rounded-2xl bg-slate-900/50 border border-white/5 overflow-hidden animate-pulse"
            >
              <div className="aspect-video bg-slate-800" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State: "No videos found." */}
      {!loading && filteredVideos.length === 0 && (
        <div className="py-16 text-center rounded-3xl bg-slate-900/40 border border-white/5 p-8 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 border border-white/5">
            <Music2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-200">No videos found.</h3>
            <p className="text-xs text-slate-400">
              {searchQuery
                ? `No videos matching "${searchQuery}". Try a different keyword.`
                : 'No videos have been added yet. Stay tuned for new releases!'}
            </p>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-white/10 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Videos Grid */}
      {!loading && filteredVideos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => {
            const thumbUrl = video.thumbnailUrl || getYoutubeThumbnail(video.youtubeVideoId, 'hq');
            const formattedDate = video.createdAt
              ? new Date(video.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : null;

            return (
              <div
                key={video.id}
                onClick={() => handleOpenVideo(video)}
                className="group relative flex flex-col rounded-2xl bg-gradient-to-b from-[#11131f] to-[#0c0e17] border border-white/10 hover:border-amber-500/50 overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                  <img
                    src={thumbUrl}
                    alt={video.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback to hqdefault if maxres fails
                      e.currentTarget.src = getYoutubeThumbnail(video.youtubeVideoId, 'mq');
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl shadow-rose-900/50 group-hover:scale-110 group-hover:bg-rose-500 transition-all duration-300 ring-4 ring-white/20">
                      <Play className="w-6 h-6 fill-white translate-x-0.5" />
                    </div>
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-rose-400 border border-rose-500/20 flex items-center gap-1">
                      <Film className="w-3 h-3" /> YOUTUBE
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-slate-300 border border-white/10">
                      HD
                    </span>
                  </div>

                  {/* Date Badge on Bottom Left of Thumbnail */}
                  {formattedDate && (
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] text-slate-300 border border-white/5">
                      <Calendar className="w-2.5 h-2.5 text-amber-400" />
                      <span>{formattedDate}</span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <h3 className="font-bold text-white text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                    {video.title}
                  </h3>

                  {/* Card Bottom Actions */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                    
                    {/* Watch on YouTube button */}
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:text-amber-300 transition-colors">
                      <span>Watch Video</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>

                    {/* Secondary Actions: Comments & Share */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenComments(video);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="View & Post Comments"
                        aria-label="Comments"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => handleShare(e, video)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Share link"
                        aria-label="Share"
                      >
                        {copiedId === video.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
