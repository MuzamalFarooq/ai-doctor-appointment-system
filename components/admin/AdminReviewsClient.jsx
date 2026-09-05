'use client';
import { useState } from 'react';
import { 
  Star, Search, Trash2, MessageSquare, User, Stethoscope, 
  AlertTriangle, CheckCircle, ShieldAlert 
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { RatingStars } from '@/components/ui/RatingStars';
import { deleteReview } from '@/actions/admin.actions';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export function AdminReviewsClient({ reviews: initialReviews }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [search, setSearch] = useState('');
  const [starFilter, setStarFilter] = useState('ALL');
  const [loadingId, setLoadingId] = useState(null);

  const filtered = reviews
    .filter(r => {
      if (starFilter === 'ALL') return true;
      return Math.floor(r.rating) === parseInt(starFilter, 10);
    })
    .filter(r => {
      const q = search.toLowerCase();
      const patientName = r.patient?.user?.name?.toLowerCase() || '';
      const doctorName = r.doctor?.user?.name?.toLowerCase() || '';
      const comment = r.comment?.toLowerCase() || '';
      return patientName.includes(q) || doctorName.includes(q) || comment.includes(q);
    });

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const starCounts = {
    5: reviews.filter(r => Math.floor(r.rating) === 5).length,
    4: reviews.filter(r => Math.floor(r.rating) === 4).length,
    3: reviews.filter(r => Math.floor(r.rating) === 3).length,
    2: reviews.filter(r => Math.floor(r.rating) === 2).length,
    1: reviews.filter(r => Math.floor(r.rating) === 1).length,
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this review? Doctor rating will be recalculated.')) return;
    setLoadingId(id);
    const res = await deleteReview(id);
    if (res?.error) toast.error(res.error);
    else {
      toast.success('Review removed successfully');
      setReviews(prev => prev.filter(r => r.id !== id));
    }
    setLoadingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 dark:text-white">
          Doctor Reviews & Feedback
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Monitor patient satisfaction, moderate comments, and maintain community guidelines
        </p>
      </div>

      {/* Summary Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700">
          <p className="text-5xl font-black text-gray-900 dark:text-white">{avgRating}</p>
          <div className="flex items-center gap-1 my-2">
            <RatingStars rating={parseFloat(avgRating)} size="md" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Based on {reviews.length} total patient reviews</p>
        </div>

        <div className="md:col-span-2 space-y-2 py-2">
          {[5, 4, 3, 2, 1].map(stars => {
            const count = starCounts[stars] || 0;
            const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="font-semibold text-gray-600 dark:text-gray-300 w-12">{stars} Stars</span>
                <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-10 text-right text-gray-500">{count} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search & Rating Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search feedback or doctor..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', '5', '4', '3', '2', '1'].map(st => (
            <button
              key={st}
              onClick={() => setStarFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                starFilter === st
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {st === 'ALL' ? 'All Ratings' : `${st} Stars`}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">No Reviews Found</h3>
          <p className="text-sm text-gray-500 mt-1">No reviews match your selected filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(review => (
            <div
              key={review.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar src={review.patient?.user?.image} name={review.patient?.user?.name || 'Patient'} size="md" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{review.patient?.user?.name || 'Anonymous Patient'}</p>
                    <p className="text-xs text-gray-400">
                      Reviewed on {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                    <RatingStars rating={review.rating} size="sm" />
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 ml-1">{review.rating}</span>
                  </div>

                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={loadingId === review.id}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    title="Moderate / Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-primary-500" />
                  Review for: <strong className="text-gray-800 dark:text-gray-200">{review.doctor?.user?.name || 'Doctor'}</strong> ({review.doctor?.specialization})
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200 mt-2">
                  "{review.comment || 'No written comment provided.'}"
                </p>
              </div>

              {review.reply && (
                <div className="ml-6 p-3 rounded-xl bg-primary-50/50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/40 text-xs">
                  <p className="font-semibold text-primary-700 dark:text-primary-300 flex items-center gap-1 mb-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Doctor's Reply:
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">{review.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
