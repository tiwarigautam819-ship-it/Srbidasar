import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  Loader2, 
  X,
  Play
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { VideoItem } from '../../types';
import { extractYouTubeId, getYoutubeThumbnail, getYoutubeWatchUrl } from '../../utils/youtube';

export const VideoTab: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add form state
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);

  // Edit modal state
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editVisible, setEditVisible] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Delete modal state
  const [deletingVideo, setDeletingVideo] = useState<VideoItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Preview extracted video ID
  const previewId = extractYouTubeId(youtubeUrl);

  useEffect(() => {
    const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: VideoItem[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...(d.data() as Omit<VideoItem, 'id'>) });
        });
        setVideos(items);
        setLoading(false);
      },
      () => {
        // Fallback without sort if index needed
        const simpleQ = collection(db, 'videos');
        onSnapshot(simpleQ, (snapshot) => {
          const items: VideoItem[] = [];
          snapshot.forEach((d) => {
            items.push({ id: d.id, ...(d.data() as Omit<VideoItem, 'id'>) });
          });
          items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setVideos(items);
          setLoading(false);
        });
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      setAddError('Invalid YouTube URL. Please provide a valid YouTube video or shorts link.');
      return;
    }
    if (!title.trim()) {
      setAddError('Please enter a title for the video.');
      return;
    }

    setAdding(true);

    try {
      const thumbnailUrl = getYoutubeThumbnail(videoId, 'maxres');
      const standardUrl = getYoutubeWatchUrl(videoId);

      await addDoc(collection(db, 'videos'), {
        youtubeUrl: standardUrl,
        youtubeVideoId: videoId,
        title: title.trim(),
        thumbnailUrl: thumbnailUrl,
        visible: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      setYoutubeUrl('');
      setTitle('');
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2500);
    } catch (err: any) {
      console.error('Error adding video:', err);
      setAddError(err?.message || 'Failed to save video to Firestore.');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleVisibility = async (video: VideoItem) => {
    try {
      const videoRef = doc(db, 'videos', video.id);
      await updateDoc(videoRef, {
        visible: !video.visible,
        updatedAt: Date.now(),
      });
    } catch (err: any) {
      console.error('Error toggling visibility:', err);
    }
  };

  const handleOpenEdit = (video: VideoItem) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditUrl(video.youtubeUrl);
    setEditVisible(video.visible);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    const videoId = extractYouTubeId(editUrl);
    if (!videoId) {
      alert('Invalid YouTube URL.');
      return;
    }

    setUpdating(true);
    try {
      const videoRef = doc(db, 'videos', editingVideo.id);
      await updateDoc(videoRef, {
        title: editTitle.trim(),
        youtubeUrl: getYoutubeWatchUrl(videoId),
        youtubeVideoId: videoId,
        thumbnailUrl: getYoutubeThumbnail(videoId, 'maxres'),
        visible: editVisible,
        updatedAt: Date.now(),
      });
      setEditingVideo(null);
    } catch (err) {
      console.error('Error updating video:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingVideo) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'videos', deletingVideo.id));
      setDeletingVideo(null);
    } catch (err) {
      console.error('Error deleting video:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* 15. ADD YOUTUBE VIDEO FORM */}
      <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-5 sm:p-7 space-y-5 shadow-xl">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <Film className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">Add YouTube Video</h3>
        </div>

        {addError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{addError}</span>
          </div>
        )}

        {addSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Video successfully added to Firestore!</span>
          </div>
        )}

        <form onSubmit={handleAddVideo} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                YouTube URL <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Supports standard watch URLs, youtu.be, and YouTube Shorts.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Video Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. SR Bidasar - Viral Bass Remix 2026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                required
              />
            </div>
          </div>

          {/* Auto Thumbnail Preview if URL valid */}
          {previewId && (
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-amber-500/30 flex items-center gap-4">
              <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-black shrink-0">
                <img
                  src={getYoutubeThumbnail(previewId, 'hq')}
                  alt="Thumbnail Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Play className="w-4 h-4 fill-white text-white" />
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Thumbnail Preview Detected
                </span>
                <p className="text-xs font-mono text-slate-300">
                  ID: {previewId}
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={adding}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 font-bold text-white text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {adding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Firebase...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>ADD VIDEO</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* ADDED VIDEOS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Added Videos</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {videos.length}
            </span>
          </h3>
        </div>

        {loading && (
          <div className="py-12 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          </div>
        )}

        {!loading && videos.length === 0 && (
          <div className="py-12 text-center rounded-2xl bg-slate-900/40 border border-white/5 p-6 text-slate-400 text-sm">
            No videos added yet. Paste a YouTube URL above to publish your first video!
          </div>
        )}

        {!loading && videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="flex flex-col sm:flex-row gap-3 p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-white/20 transition-all justify-between"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex gap-3">
                  <div className="relative w-28 sm:w-32 aspect-video rounded-xl overflow-hidden bg-black shrink-0">
                    <img
                      src={video.thumbnailUrl || getYoutubeThumbnail(video.youtubeVideoId, 'hq')}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    {!video.visible && (
                      <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                          HIDDEN
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-2">
                      {video.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className={`px-1.5 py-0.5 rounded font-semibold ${video.visible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                        {video.visible ? 'Public' : 'Hidden'}
                      </span>
                      <span>
                        {new Date(video.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex sm:flex-col justify-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  {/* Hide/Show Toggle */}
                  <button
                    onClick={() => handleToggleVisibility(video)}
                    className={`p-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
                      video.visible
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                    }`}
                    title={video.visible ? 'Hide from public site' : 'Show on public site'}
                  >
                    {video.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span className="sm:hidden">{video.visible ? 'Hide' : 'Show'}</span>
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEdit(video)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-amber-500/20 hover:text-amber-400 transition-colors flex items-center justify-center gap-1"
                    title="Edit video"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="sm:hidden">Edit</span>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setDeletingVideo(video)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-rose-500/20 hover:text-rose-400 transition-colors flex items-center justify-center gap-1"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sm:hidden">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0f111a] border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base">Edit Video Details</h3>
              <button
                onClick={() => setEditingVideo(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Video Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  YouTube URL
                </label>
                <input
                  type="text"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editVisible"
                  checked={editVisible}
                  onChange={(e) => setEditVisible(e.target.checked)}
                  className="rounded bg-slate-900 border-white/10 text-amber-500 focus:ring-0"
                />
                <label htmlFor="editVisible" className="text-xs text-slate-300 select-none">
                  Visible on public website
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#0f111a] border border-rose-500/30 p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-white text-base">Delete Video?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to permanently delete "{deletingVideo.title}"? This cannot be undone.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingVideo(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
