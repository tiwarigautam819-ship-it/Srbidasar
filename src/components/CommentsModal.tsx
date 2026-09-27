import React, { useEffect, useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  User, 
  Calendar, 
  Film, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CommentItem, VideoItem } from '../types';

interface CommentsModalProps {
  video: VideoItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({ video, isOpen, onClose }) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);

    // Query visible comments for this video (or all visible if none selected)
    const constraints = [where('visible', '==', true)];
    if (video) {
      constraints.push(where('videoId', '==', video.id));
    }

    const q = query(
      collection(db, 'comments'),
      ...constraints,
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: CommentItem[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...(doc.data() as Omit<CommentItem, 'id'>) });
        });
        setComments(list);
        setLoading(false);
      },
      (err) => {
        console.warn('Comments query error (trying fallback):', err);
        // Fallback without orderBy
        const fallbackQ = query(
          collection(db, 'comments'),
          where('visible', '==', true)
        );
        onSnapshot(fallbackQ, (snap) => {
          const list: CommentItem[] = [];
          snap.forEach((doc) => {
            const data = doc.data() as Omit<CommentItem, 'id'>;
            if (!video || data.videoId === video.id) {
              list.push({ id: doc.id, ...data });
            }
          });
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setComments(list);
          setLoading(false);
        });
      }
    );

    return () => unsubscribe();
  }, [isOpen, video]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!commentText.trim()) {
      setError('Please write your comment.');
      return;
    }

    // Basic anti-spam: limit length & rapid consecutive clicks
    if (commentText.length > 500) {
      setError('Comment must be 500 characters or less.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, 'comments'), {
        name: name.trim(),
        comment: commentText.trim(),
        videoId: video ? video.id : 'general',
        videoTitle: video ? video.title : 'General Feedback',
        visible: true,
        createdAt: Date.now(),
      });

      setCommentText('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      console.error('Error adding comment:', err);
      setError(err?.message || 'Could not post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0f111a] border border-white/10 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">
                Comments
              </h3>
              {video ? (
                <p className="text-xs text-amber-400 font-medium truncate max-w-xs sm:max-w-md">
                  {video.title}
                </p>
              ) : (
                <p className="text-xs text-slate-400">Community Discussion</p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments Feed List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <span className="text-xs">Loading comments...</span>
            </div>
          )}

          {!loading && comments.length === 0 && (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">No comments yet</p>
              <p className="text-xs text-slate-500">Be the first to share your thoughts!</p>
            </div>
          )}

          {!loading &&
            comments.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-white/5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-white font-bold text-xs uppercase">
                      {item.name ? item.name.charAt(0) : 'U'}
                    </div>
                    <span className="font-semibold text-white text-xs sm:text-sm">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 pl-9 whitespace-pre-wrap leading-relaxed">
                  {item.comment}
                </p>
              </div>
            ))}
        </div>

        {/* Comment Form Bottom */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-950/90 space-y-3">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Comment posted successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Your Comment
              </label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
                placeholder="Write your comment..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 font-bold text-white text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Posting Comment...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>POST COMMENT</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
