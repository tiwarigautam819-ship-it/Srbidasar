import React, { useEffect, useState } from 'react';
import { 
  Lightbulb, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Loader2, 
  Music,
  Check
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
import { SuggestionItem } from '../../types';

export const SuggestionsTab: React.FC = () => {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'suggestions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: SuggestionItem[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...(d.data() as Omit<SuggestionItem, 'id'>) });
        });
        setSuggestions(items);
        setLoading(false);
      },
      () => {
        // Fallback without orderBy
        const simpleQ = collection(db, 'suggestions');
        onSnapshot(simpleQ, (snap) => {
          const items: SuggestionItem[] = [];
          snap.forEach((d) => {
            items.push({ id: d.id, ...(d.data() as Omit<SuggestionItem, 'id'>) });
          });
          items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setSuggestions(items);
          setLoading(false);
        });
      }
    );

    return () => unsubscribe();
  }, []);

  const handleToggleStatus = async (item: SuggestionItem) => {
    try {
      const nextStatus = item.status === 'reviewed' ? 'pending' : 'reviewed';
      await updateDoc(doc(db, 'suggestions', item.id), {
        status: nextStatus,
      });
    } catch (err) {
      console.error('Error updating suggestion status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this suggestion?')) return;
    try {
      await deleteDoc(doc(db, 'suggestions', id));
    } catch (err) {
      console.error('Error deleting suggestion:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <span>Remix Suggestions</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {suggestions.length}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Songs and remix ideas requested by the community
          </p>
        </div>
      </div>

      {loading && (
        <div className="py-12 flex justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </div>
      )}

      {!loading && suggestions.length === 0 && (
        <div className="py-12 text-center rounded-2xl bg-slate-900/40 border border-white/5 p-6 text-slate-400 text-sm">
          No remix suggestions received yet.
        </div>
      )}

      {!loading && suggestions.length > 0 && (
        <div className="space-y-3">
          {suggestions.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                item.status === 'reviewed'
                  ? 'bg-slate-900/40 border-white/5 opacity-75'
                  : 'bg-slate-900/90 border-amber-500/20 shadow-lg'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base">
                      {item.songName}
                    </h4>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      item.status === 'reviewed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {item.status === 'reviewed' ? 'Reviewed' : 'Pending Review'}
                  </span>

                  <button
                    onClick={() => handleToggleStatus(item)}
                    className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                      item.status === 'reviewed'
                        ? 'bg-slate-800 text-slate-300 hover:text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                    title={item.status === 'reviewed' ? 'Mark as Pending' : 'Mark as Reviewed'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {item.status === 'reviewed' ? 'Reopen' : 'Mark Reviewed'}
                    </span>
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete suggestion"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Suggestion Body */}
              <div className="pt-3 space-y-2">
                <p className="text-xs sm:text-sm text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-white/5 whitespace-pre-wrap">
                  "{item.suggestion}"
                </p>

                {item.youtubeUrl && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Reference link:</span>
                    <a
                      href={item.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline flex items-center gap-1 font-mono truncate max-w-md"
                    >
                      <span>{item.youtubeUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
