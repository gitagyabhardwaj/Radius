import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

/**
 * Aggregate rating + recent comments for a user (brand or creator),
 * meant for display on that user's own profile page. This is the piece
 * that actually surfaces the comments left via RatingWidget below —
 * without it, submitted ratings only ever showed back to the rater.
 */
export function ReviewsCard({
  userId,
  label = 'Reviews',
  dark = true,
}: {
  userId: string;
  label?: string;
  dark?: boolean;
}) {
  const summary = useQuery(api.ratings.getForUser, { userId: userId as any });

  const textMuted = dark ? 'text-zinc-500' : 'text-zinc-400';
  const textBase = dark ? 'text-zinc-200' : 'text-zinc-700';
  const cardBg = dark
    ? 'bg-zinc-900/60 border-zinc-850'
    : 'bg-zinc-50/60 border-zinc-150';

  if (!summary) return null;

  return (
    <div className={`p-4 rounded-xl border flex flex-col gap-3 ${cardBg}`}>
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-mono uppercase tracking-widest font-bold ${textMuted}`}>
          {label}
        </span>
        {summary.count > 0 ? (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`w-3.5 h-3.5 ${
                    n <= Math.round(summary.average) ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                  }`}
                />
              ))}
            </div>
            <span className={`text-xs font-bold ${textBase}`}>
              {summary.average} ({summary.count})
            </span>
          </div>
        ) : (
          <span className={`text-xs ${textMuted}`}>No reviews yet</span>
        )}
      </div>

      {summary.recent.length > 0 && (
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
          {summary.recent
            .filter((r) => r.comment)
            .map((r, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`w-3 h-3 ${
                        n <= r.stars ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs italic ${textMuted}`}>"{r.comment}"</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

/**
 * Star rating for the other side of a collab, shown once a submission has
 * been approved (i.e. the collab is closed and escrow has released).
 * Renders nothing if the current user isn't eligible to rate this
 * submission (e.g. it hasn't been approved yet, or they've already rated).
 */
export default function RatingWidget({
  submissionId,
  subjectLabel,
  dark = false,
}: {
  submissionId: string;
  subjectLabel: string;
  dark?: boolean;
}) {
  const status = useQuery(api.ratings.getMyRatingStatus, {
    submissionId: submissionId as any,
  });
  const submit = useMutation(api.ratings.submit);

  const [hoverStars, setHoverStars] = useState(0);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!status) return null;
  if (!status.canRate && !status.alreadyRated) return null;

  const textMuted = dark ? 'text-zinc-500' : 'text-zinc-400';
  const textBase = dark ? 'text-zinc-200' : 'text-zinc-700';

  if (status.alreadyRated && status.myRating) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className={`text-[11px] font-mono uppercase tracking-wide font-bold ${textMuted}`}>
          Your rating of {subjectLabel}
        </span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={`w-4 h-4 ${
                n <= status.myRating.stars ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
              }`}
            />
          ))}
        </div>
        {status.myRating.comment && (
          <p className={`text-xs italic ${textMuted}`}>"{status.myRating.comment}"</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className={`text-[11px] font-mono uppercase tracking-wide font-bold ${textMuted}`}>
        Rate {subjectLabel}
      </span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setStars(n)}
            onMouseEnter={() => setHoverStars(n)}
            onMouseLeave={() => setHoverStars(0)}
            className="cursor-pointer"
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                n <= (hoverStars || stars) ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
              }`}
            />
          </button>
        ))}
      </div>
      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional comment"
        maxLength={280}
        className={`text-xs rounded-lg px-3 py-1.5 border outline-none ${
          dark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-600'
            : 'bg-white border-zinc-200 text-zinc-700 placeholder:text-zinc-400'
        }`}
      />
      {error && <span className="text-[11px] text-rose-500">{error}</span>}
      <button
        type="button"
        disabled={stars === 0 || submitting}
        onClick={async () => {
          setSubmitting(true);
          setError(null);
          try {
            await submit({
              submissionId: submissionId as any,
              stars,
              comment: comment.trim() || undefined,
            });
          } catch (err: any) {
            setError(err?.message || 'Could not submit rating.');
          } finally {
            setSubmitting(false);
          }
        }}
        className="w-max py-1.5 px-3 bg-amber-400 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 text-xs font-bold rounded-lg transition-colors"
      >
        {submitting ? 'Submitting…' : 'Submit Rating'}
      </button>
    </div>
  );
}
