'use client';

import { Star, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Review {
  id: string;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
  profile: {
    id: string;
    slug: string;
    name: string;
    city: string;
    photos: { url: string }[];
  };
}

export default function LatestReviews({ reviews }: { reviews: Review[] }) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="py-16 bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <MessageSquare className="w-8 h-8 text-pink-500" />
          <h2 className="text-3xl font-bold">Nejnovější Recenze</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.slice(0, 6).map((review) => (
            <Link
              key={review.id}
              href={`/profil/${review.profile.slug}`}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition group"
            >
              <div className="flex items-start gap-4 mb-4">
                {review.profile.photos[0]?.url && (
                  <Image
                    src={review.profile.photos[0].url}
                    alt={review.profile.name}
                    width={60}
                    height={60}
                    className="rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-bold group-hover:text-pink-500 transition">
                    {review.profile.name}
                  </h3>
                  <p className="text-sm text-gray-400">{review.profile.city}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-gray-300 text-sm line-clamp-3">
                {review.comment}
              </p>

              <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                <span>{review.authorName}</span>
                <span>
                  {new Date(review.createdAt).toLocaleDateString('cs-CZ')}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {reviews.length > 6 && (
          <div className="text-center mt-8">
            <Link
              href="/recenze"
              className="inline-block bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition"
            >
              Zobrazit všechny recenze
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
