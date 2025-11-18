'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ProfileCardProps } from '@/types/profile-card';

export default function ProfileCard({ card, onFavoriteToggle }: ProfileCardProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(card.isFavorite || false);

  const handleCardClick = () => {
    const slug = card.slug || card.id;
    router.push(`/profil/${slug}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isFavorite;
    setIsFavorite(newState);
    onFavoriteToggle?.(card.id, newState);
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanPhone = card.phone.replace(/\s/g, '');

    if (typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      window.location.href = `tel:${cleanPhone}`;
    } else {
      navigator.clipboard.writeText(card.phone);
      // TODO: Show toast notification "Telefon zkopírován"
    }
  };

  return (
    <div
      className="profile-card group"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
    >
      {/* Image Wrapper */}
      <div className="card-image-wrapper">
        <Image
          src={card.imageUrl}
          alt={card.imageAlt}
          fill
          className="card-image"
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 340px"
          quality={85}
          loading="lazy"
        />

        {/* Status Indicators */}
        <div className="status-indicators">
          <div className="status-left">
            {card.isNew && (
              <div className="badge-new">
                NOVÉ
              </div>
            )}
          </div>

          <button
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
          >
            {isFavorite ? '♥' : '♡'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="card-content">
        {/* Header - NAME FIRST */}
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-title">
              {card.isOnline && <span className="online-dot" />}

              {card.category === 'EROTICKÝ PODNIK'
                ? card.name.split(' ')[0]
                : card.age ? `${card.name.split(' ')[0]}, ${card.age}` : card.name.split(' ')[0]
              }

              {card.isVerified && (
                <span className="verified-badge">✓</span>
              )}
            </div>
          </div>
        </div>

        {/* Category Tag - SECOND */}
        <span className="category-tag">{card.category}</span>

        {/* Subtitle */}
        <div className="card-subtitle">
          {card.profileType.type === 'studio' ? (
            <>
              Pracuje v{' '}
              <Link
                href={card.profileType.studioUrl!}
                onClick={(e) => e.stopPropagation()}
                className="studio-link"
              >
                {card.profileType.studioName}
              </Link>
            </>
          ) : (
            <>
              {card.profileType.soloDescription}
              {card.businessInfo?.girlsCount && (
                <> · {card.businessInfo.girlsCount} holek</>
              )}
            </>
          )}
        </div>

        {/* Meta Info */}
        <div className="card-meta">
          <div className="meta-row">
            <span className="meta-icon">📍</span>
            <span>
              {card.location.city}
              {card.location.area && `, ${card.location.area}`}
            </span>
          </div>

          <div className="meta-row">
            <span className="rating-star">★</span>
            <span className="rating-value">{card.rating.average.toFixed(1)}</span>
            <span className="rating-count">({card.rating.count} recenzí)</span>
          </div>
        </div>

        {/* Divider */}
        <div className="divider" />

        {/* Phone CTA */}
        <button className="phone-cta" onClick={handlePhoneClick}>
          <span>📱</span>
          {card.phone}
        </button>
      </div>
    </div>
  );
}
