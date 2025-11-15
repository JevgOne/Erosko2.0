'use client';

import ProfileCard from './ProfileCard';
import type { ProfileCardGridProps } from '@/types/profile-card';

export default function ProfileCardGrid({ cards, onFavoriteToggle }: ProfileCardGridProps) {
  const handleFavoriteToggle = async (id: string, isFavorite: boolean) => {
    // Call parent handler if provided
    onFavoriteToggle?.(id, isFavorite);

    // TODO: API call to save to database
    console.log(`Profile ${id} favorite state:`, isFavorite);
  };

  return (
    <div className="profile-cards-container">
      <div className="profile-cards-grid">
        {cards.map((card) => (
          <ProfileCard
            key={card.id}
            card={card}
            onFavoriteToggle={handleFavoriteToggle}
          />
        ))}
      </div>
    </div>
  );
}
