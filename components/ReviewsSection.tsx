'use client';

import { Star, ThumbsUp } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  text: string;
  helpful?: number;
  isAI?: boolean;
}

interface ReviewStats {
  total: number;
  average: string;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ReviewsSectionProps {
  profileId?: string;
  businessId?: string;
}

export default function ReviewsSection({
  profileId,
  businessId,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    average: '0.0',
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);

  // Fetch reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      if (!profileId && !businessId) {
        setLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams();
        if (profileId) params.set('profileId', profileId);
        if (businessId) params.set('businessId', businessId);

        const response = await fetch(`/api/reviews?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews || []);
          setStats(data.stats || { total: 0, average: '0.0', breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [profileId, businessId]);

  const handleAddReview = () => {
    // TODO: Implement review submission to API
    console.log('Add review for:', profileId || businessId);
    // Example: submitReview({ profileId, rating, text })
  };

  const handleHelpful = (reviewIndex: number) => {
    // TODO: Implement helpful vote API call
    console.log('Mark helpful:', reviewIndex);
  };

  // Calculate rating breakdown percentages
  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = stats.breakdown[stars as keyof typeof stats.breakdown] || 0;
    const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
    return { stars, count, percentage };
  });

  if (loading) {
    return (
      <div className="glass rounded-2xl p-8 mb-8">
        <div className="text-center text-gray-400">Načítání recenzí...</div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Star className="w-7 h-7 text-yellow-400" fill="currentColor" />
          Hodnocení a recenze ({stats.total})
        </h2>
        <button
          onClick={handleAddReview}
          className="px-6 py-3 bg-gradient-to-r from-primary-500 to-pink-500 rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Přidat hodnocení
        </button>
      </div>

      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-white/10">
        {/* Overall Rating */}
        <div className="text-center md:col-span-1">
          <div className="text-6xl font-bold mb-2">{stats.average}</div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-6 h-6 text-yellow-400" fill="currentColor" />
            ))}
          </div>
          <p className="text-gray-400">Na základě {stats.total} hodnocení</p>
        </div>

        {/* Rating Breakdown */}
        <div className="md:col-span-2 space-y-2">
          {ratingBreakdown.map((item) => (
            <div key={item.stars} className="flex items-center gap-3">
              <span className="text-sm font-medium w-12">{item.stars} hvězd</span>
              <div className="flex-1 h-3 bg-dark-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-400 w-12 text-right">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index} className="bg-dark-800/50 rounded-xl p-5 border border-white/5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold mb-1">{review.name}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleHelpful(index)}
                  className="flex items-center gap-1 text-gray-400 hover:text-primary-400 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  {review.helpful && <span className="text-xs">{review.helpful}</span>}
                </button>
              </div>
              <p className="text-gray-300">{review.text}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Zatím žádné recenze</p>
            <button
              onClick={handleAddReview}
              className="px-6 py-3 glass rounded-xl font-medium hover:bg-white/10 transition-all"
            >
              Buďte první, kdo přidá hodnocení
            </button>
          </div>
        )}
      </div>

      {/* Show More Button */}
      {reviews.length > 0 && stats.total > reviews.length && (
        <div className="text-center mt-6">
          <button className="px-6 py-3 glass rounded-xl font-medium hover:bg-white/10 transition-all">
            Zobrazit všechna hodnocení ({stats.total})
          </button>
        </div>
      )}
    </div>
  );
}
