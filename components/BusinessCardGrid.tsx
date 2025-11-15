'use client';

import { BusinessCard as BusinessCardType } from '@/types/business-card';
import BusinessCard from './BusinessCard';

interface BusinessCardGridProps {
  businesses: BusinessCardType[];
  onFavoriteToggle?: (id: string) => void;
}

export default function BusinessCardGrid({ businesses, onFavoriteToggle }: BusinessCardGridProps) {
  if (!businesses || businesses.length === 0) {
    return (
      <div className="business-cards-container">
        <p style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
          Zatím nejsou k dispozici žádné podniky.
        </p>
      </div>
    );
  }

  return (
    <div className="business-cards-container">
      <div className="business-cards-grid">
        {businesses.map((business) => (
          <BusinessCard
            key={business.id}
            business={business}
            onFavoriteToggle={onFavoriteToggle}
          />
        ))}
      </div>
    </div>
  );
}
