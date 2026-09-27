import React, { useEffect, useState } from 'react';
import { Star, Award, TrendingUp, Users, Calendar, ShieldAlert } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { RatingItem } from '../../types';

export const RatingsTab: React.FC = () => {
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'ratings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: RatingItem[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...(d.data() as Omit<RatingItem, 'id'>) });
        });
        setRatings(items);
        setLoading(false);
      },
      () => {
        const simpleQ = collection(db, 'ratings');
        onSnapshot(simpleQ, (snap) => {
          const items: RatingItem[] = [];
          snap.forEach((d) => {
            items.push({ id: d.id, ...(d.data() as Omit<RatingItem, 'id'>) });
          });
          items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setRatings(items);
          setLoading(false);
        });
      }
    );

    return () => unsubscribe();
  }, []);

  const total = ratings.length;
  const average = total > 0
    ? (ratings.reduce((acc, curr) => acc + (curr.rating || 0), 0) / total).toFixed(1)
    : '5.0';

  const starCounts = {
    5: ratings.filter((r) => r.rating === 5).length,
    4: ratings.filter((r) => r.rating === 4).length,
    3: ratings.filter((r) => r.rating === 3).length,
    2: ratings.filter((r) => r.rating === 2).length,
    1: ratings.filter((r) => r.rating === 1).length,
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span>Rating Statistics</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real community ratings recorded securely in Firebase Firestore
          </p>
        </div>

        {/* Security badge notice */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-[11px] font-semibold text-slate-300 border border-white/5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Tamper-Proof Public Ratings</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Average Score</span>
            <div className="text-2xl font-black text-white flex items-center gap-1">
              <span>{loading ? '...' : average}</span>
              <span className="text-amber-400 text-lg">⭐</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Reviews</span>
            <div className="text-2xl font-black text-white">
              {loading ? '...' : total}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">5-Star Satisfaction</span>
            <div className="text-2xl font-black text-white">
              {total > 0 ? `${Math.round((starCounts[5] / total) * 100)}%` : '100%'}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Star Distribution
        </h4>
        {[5, 4, 3, 2, 1].map((s) => {
          const c = starCounts[s as keyof typeof starCounts] || 0;
          const p = total > 0 ? Math.round((c / total) * 100) : 0;
          return (
            <div key={s} className="flex items-center gap-3 text-xs">
              <span className="w-12 font-medium text-slate-300 flex items-center gap-1">
                {s} <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              </span>
              <div className="flex-1 h-3 rounded-full bg-slate-950 overflow-hidden border border-white/5">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${p}%` }}
                />
              </div>
              <span className="w-16 text-right font-mono text-slate-400">
                {c} ({p}%)
              </span>
            </div>
          );
        })}
      </div>

      {/* Recent submissions list */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Recent Rating Submissions
        </h4>
        <div className="space-y-2">
          {ratings.slice(0, 10).map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <span className="font-semibold text-white">
                  {item.rating} Stars
                </span>
                {item.deviceId && (
                  <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                    ({item.deviceId})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
