import React, { useEffect, useState } from 'react';
import { 
  MessageSquare, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar, 
  Loader2, 
  Film 
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CommentItem } from '../../types';

export const CommentsTab: React.FC = () => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: CommentItem[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...(d.data() as Omit<CommentItem, 'id'>) });
        });
        setComments(items);
        setLoading(false);
      },
      () => {
        // Fallback without sort
        const simpleQ = collection(db, 'comments');
        onSnapshot(simpleQ, (snap) => {
          const items: CommentItem[] = [];
          snap.forEach((d) => {
            items.push({ id: d.id, ...(d.data() as Omit<CommentItem, 'id'>) });
          });
          items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setComments(items);
          setLoading(false);
        });
      }
    );

    return () => unsubscribe();
  }, []);

  const handleToggleVisibility = async (item: CommentItem) => {
    try {
      await updateDoc(doc(db, 'comments', item.id), {
        visible: !item.visible,
      });
    } catch (err) {
      console.error('Error toggling comment visibility:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this comment?')) return;
    try {
      await deleteDoc(doc(db, 'comments', id));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <span>Community Comments</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {comments.length}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Moderate, hide inappropriate messages, or delete spam
          </p>
        </div>
      </div>

      {loading && (
        <div className="py-12 flex justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </div>
      )}

      {!loading && comments.length === 0 && (
        <div className="py-12 text-center rounded-2xl bg-slate-900/40 border border-white/5 p-6 text-slate-400 text-sm">
          No comments posted yet.
        </div>
      )}

      {!loading && comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all ${
                item.visible
                  ? 'bg-slate-900/90 border-white/10 shadow-md'
                  : 'bg-slate-900/40 border-rose-500/20 opacity-70'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs uppercase">
                    {item.name ? item.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      {item.videoTitle && (
                        <span className="text-amber-400/80 flex items-center gap-1 truncate max-w-xs">
                          <Film className="w-2.5 h-2.5 shrink-0" />
                          {item.videoTitle}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.visible
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {item.visible ? 'VISIBLE' : 'HIDDEN'}
                  </span>

                  <button
                    onClick={() => handleToggleVisibility(item)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    title={item.visible ? 'Hide from public' : 'Show to public'}
                  >
                    {item.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="pt-2 text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                {item.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
