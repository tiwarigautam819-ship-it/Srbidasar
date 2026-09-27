import React, { useEffect, useState } from 'react';
import { 
  Star, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Users, 
  TrendingUp, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { collection, onSnapshot, addDoc, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { RatingItem } from '../types';
import { useApp } from '../context/AppContext';

export const RatingSection: React.FC = () => {
  const { settings } = useApp();
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStars, setSelectedStars] = useState<number>(5);
  const [hoveredStars, setHoveredStars] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasAlreadyRated, setHasAlreadyRated] = useState(false);
  const [lastUserRating, setLastUserRating] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check localStorage for duplicate check
  useEffect(() => {
    const existing = localStorage.getItem('srbidasar_rated');
    if (existing) {
      setHasAlreadyRated(true);
      setLastUserRating(parseInt(existing, 10) || 5);
    }
  }, []);

  // Listen to Firestore ratings collection
  useEffect(() => {
    const q = query(collection(db, 'ratings'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: RatingItem[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...(doc.data() as Omit<RatingItem, 'id'>) });
        });
        setRatings(items);
        setLoading(false);
      },
      (error) => {
        console.warn('Error reading ratings:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Stats calculation
  const totalCount = ratings.length;
  const averageRating = totalCount > 0
    ? (ratings.reduce((acc, curr) => acc + (curr.rating || 0), 0) / totalCount).toFixed(1)
    : '5.0';

  const starCounts = {
    5: ratings.filter((r) => r.rating === 5).length,
    4: ratings.filter((r) => r.rating === 4).length,
    3: ratings.filter((r) => r.rating === 3).length,
    2: ratings.filter((r) => r.rating === 2).length,
    1: ratings.filter((r) => r.rating === 1).length,
  };

  const handleRatingSubmit = async () => {
    if (hasAlreadyRated) {
      setErrorMessage('You have already submitted a rating. Thank you for your support!');
      return;
    }

    if (selectedStars < 1 || selectedStars > 5) {
      setErrorMessage('Please select between 1 and 5 stars.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      // Generate anonymous device identifier
      let deviceId = localStorage.getItem('srbidasar_device_id');
      if (!deviceId) {
        deviceId = 'dev_' + Math.random().toString(36).substring(2, 12);
        localStorage.setItem('srbidasar_device_id', deviceId);
      }

      await addDoc(collection(db, 'ratings'), {
        rating: selectedStars,
        deviceId,
        createdAt: Date.now(),
      });

      localStorage.setItem('srbidasar_rated', selectedStars.toString());
      setSubmitted(true);
      setHasAlreadyRated(true);
      setLastUserRating(selectedStars);
    } catch (err: any) {
      console.error('Error submitting rating:', err);
      setErrorMessage(err?.message || 'Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const ratingDescriptions: Record<number, string> = {
    1: '⭐ Needs Improvement',
    2: '⭐⭐ Fair & Developing',
    3: '⭐⭐⭐ Good Tracks',
    4: '⭐⭐⭐⭐ Very Good / Great Bass',
    5: '⭐⭐⭐⭐⭐ Legendary Masterpiece!',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>OFFICIAL COMMUNITY RATING</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Rate {settings.websiteName || 'SR BIDASAR'}
        </h1>
        <p className="text-sm text-slate-300 max-w-lg mx-auto">
          Your feedback keeps the music alive! Let us know how much you enjoy our remix drops and production quality.
        </p>
      </div>

      {/* Main Score & Distribution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Overall Score Card */}
        <div className="md:col-span-5 rounded-3xl bg-gradient-to-b from-[#141624] to-[#0c0e18] border border-amber-500/20 p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-xl shadow-amber-500/5 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-inner">
            <Award className="w-8 h-8" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-5xl sm:text-6xl font-black text-white tracking-tight">
              {loading ? '...' : averageRating}
            </span>
            <span className="text-2xl font-bold text-amber-400">⭐</span>
          </div>

          {/* Star Icons representation */}
          <div className="flex items-center gap-1 my-3">
            {[1, 2, 3, 4, 5].map((star) => {
              const numAvg = parseFloat(averageRating);
              const filled = numAvg >= star;
              return (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    filled ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                  }`}
                />
              );
            })}
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {loading ? 'Loading...' : `${totalCount} ${totalCount === 1 ? 'Rating' : 'Ratings'}`}
            </span>
          </div>
        </div>

        {/* Rating Breakdown Distribution Bar Chart */}
        <div className="md:col-span-7 rounded-3xl bg-[#0f111d] border border-white/10 p-6 flex flex-col justify-center space-y-3 shadow-lg">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            Rating Breakdown
          </h3>

          {[5, 4, 3, 2, 1].map((starNum) => {
            const count = starCounts[starNum as keyof typeof starCounts] || 0;
            const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : starNum === 5 ? 100 : 0;

            return (
              <div key={starNum} className="flex items-center gap-3 text-xs">
                <span className="w-8 font-semibold text-slate-300 flex items-center gap-1">
                  <span>{starNum}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                </span>

                {/* Progress track */}
                <div className="flex-1 h-3 rounded-full bg-slate-800/80 overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-700"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <span className="w-12 text-right font-medium text-slate-400">
                  {count} <span className="text-[10px] text-slate-500">({percentage}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Submit Rating Card */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-[#111320] border border-white/10 p-6 sm:p-8 text-center space-y-5 shadow-xl">
        {hasAlreadyRated ? (
          <div className="py-6 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Thank You For Your Rating!</h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              You rated SR Bidasar <span className="text-amber-400 font-bold">{lastUserRating} ⭐ Stars</span>. Your review has been saved to Firebase Firestore.
            </p>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-xl font-bold text-white">Give Your Rating</h3>
              <p className="text-xs text-slate-400 mt-1">
                Tap on a star to select your rating (1 to 5 stars)
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-center gap-2 max-w-md mx-auto">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Large Interactive Star Buttons */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = (hoveredStars !== null ? hoveredStars : selectedStars) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedStars(star)}
                    onMouseEnter={() => setHoveredStars(star)}
                    onMouseLeave={() => setHoveredStars(null)}
                    aria-label={`Rate ${star} star`}
                    className="p-2 sm:p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-white/5 hover:border-amber-400/50 transition-all duration-200 active:scale-90 group focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <Star
                      className={`w-7 h-7 sm:w-10 sm:h-10 transition-all duration-200 ${
                        isActive
                          ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                          : 'text-slate-600 group-hover:text-slate-400'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Selected Star Description */}
            <div className="h-6">
              <span className="text-xs sm:text-sm font-semibold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                {ratingDescriptions[hoveredStars !== null ? hoveredStars : selectedStars]}
              </span>
            </div>

            {/* Submit Button */}
            <div className="max-w-xs mx-auto pt-2">
              <button
                type="button"
                onClick={handleRatingSubmit}
                disabled={submitting}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 font-bold text-white text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Rating...</span>
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 fill-white" />
                    <span>SUBMIT RATING</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
};
