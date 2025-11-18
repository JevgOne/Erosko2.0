'use client';

import { useEffect, useState } from 'react';
import StatsBanner from './StatsBanner';
import NewProfiles from './NewProfiles';
import LatestReviews from './LatestReviews';
import PopularProfiles from './PopularProfiles';

interface HomepageData {
  latestReviews: any[];
  newestProfiles: any[];
  popularProfiles: any[];
  stats: {
    totalProfiles: number;
    totalBusinesses: number;
    totalReviews: number;
    totalViews: number;
  };
}

export default function DynamicHomepageContent() {
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/homepage');
        const data = await response.json();
        setHomepageData(data);
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="animate-pulse">
          {/* Stats Banner Skeleton */}
          <div className="py-12 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-12 w-12 bg-gray-800 rounded-full mx-auto mb-3"></div>
                  <div className="h-8 bg-gray-800 rounded w-20 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-800 rounded w-32 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!homepageData) {
    return null;
  }

  return (
    <>
      {/* Stats Banner */}
      <StatsBanner stats={homepageData.stats} />

      {/* New Profiles Section */}
      <NewProfiles profiles={homepageData.newestProfiles} />

      {/* Latest Reviews Section */}
      <LatestReviews reviews={homepageData.latestReviews} />

      {/* Popular Profiles Section */}
      <PopularProfiles profiles={homepageData.popularProfiles} />
    </>
  );
}
