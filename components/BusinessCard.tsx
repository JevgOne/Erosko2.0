'use client';

import { useState } from 'react';
import { BusinessCard as BusinessCardType } from '@/types/business-card';

interface BusinessCardProps {
  business: BusinessCardType;
  onFavoriteToggle?: (id: string) => void;
}

export default function BusinessCard({ business, onFavoriteToggle }: BusinessCardProps) {
  const [showAllHours, setShowAllHours] = useState(false);
  const [isFavorite, setIsFavorite] = useState(business.isFavorite || false);

  // Get current day in Czech format
  const getCurrentDay = () => {
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ] as const;
    return days[new Date().getDay()];
  };

  const currentDay = getCurrentDay();

  // Check if currently open
  const isCurrentlyOpen = (): boolean => {
    if (business.is24_7) return true;
    if (!business.openingHours) return false;

    const todayHours = business.openingHours[currentDay];
    if (!todayHours || todayHours === 'Zavřeno') return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [open, close] = todayHours.split('-').map((time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    });

    // Handle overnight hours (e.g., 20:00-04:00)
    if (close < open) {
      return currentTime >= open || currentTime < close;
    }

    return currentTime >= open && currentTime < close;
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    onFavoriteToggle?.(business.id);
  };

  const handleCardClick = () => {
    // Use slug directly without encoding (already ASCII-safe)
    window.location.href = `/eroticke-podniky/${business.slug}`;
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      salon: 'Salon',
      privat: 'Privát',
      bdsm: 'BDSM',
      online: 'Online',
    };
    return labels[type] || type;
  };

  const dayLabels: Record<string, string> = {
    monday: 'Po',
    tuesday: 'Út',
    wednesday: 'St',
    thursday: 'Čt',
    friday: 'Pá',
    saturday: 'So',
    sunday: 'Ne',
  };

  return (
    <div className="business-card" onClick={handleCardClick}>
      {/* Image wrapper */}
      <div className="business-card-image-wrapper">
        <img
          src={business.imageUrl}
          alt={business.imageAlt}
          className="business-card-image"
        />

        {/* Status indicators overlay */}
        <div className="business-status-indicators">
          <div className="business-status-left">
            <span className={`business-badge-type ${business.type}`}>
              {getTypeLabel(business.type)}
            </span>
          </div>

          <button
            className={`business-favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
            aria-label="Přidat do oblíbených"
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
      </div>

      {/* Card content */}
      <div className="business-card-content">
        {/* Category tag */}
        <span className="business-category-tag">{business.category}</span>

        {/* Header */}
        <div className="business-card-header">
          <h3 className="business-card-title">
            {business.isOnline && <span className="business-online-dot" />}
            {business.name}
            {business.isVerified && (
              <span className="business-verified-badge" title="Ověřený profil">
                ✓
              </span>
            )}
          </h3>
          <p className="business-card-subtitle">
            {business.location.city}
            {business.girlsCount && (
              <span className="business-girls-count">
                👥 {business.girlsCount} {business.girlsCount === 1 ? 'dívka' : 'dívky'}
              </span>
            )}
            {business.onlineNow && (
              <span className="business-girls-count">
                🟢 {business.onlineNow} online
              </span>
            )}
          </p>
        </div>

        {/* Meta info */}
        <div className="business-card-meta">
          <div className="business-meta-row">
            <span className="business-rating-star">⭐</span>
            <span className="business-rating-value">{business.rating.average.toFixed(1)}</span>
            <span className="business-rating-count">({business.rating.count})</span>
          </div>
          {business.location.area && (
            <div className="business-meta-row">
              <span className="business-meta-icon">📍</span>
              <span>{business.location.area}</span>
            </div>
          )}
        </div>

        {/* Opening hours */}
        {business.openingHours && (
          <div className="business-opening-hours">
            <div className="business-hours-list">
              {/* Show today's hours with status */}
              <div className="business-hours-row">
                <span className="business-hours-day today">
                  {dayLabels[currentDay]}
                </span>
                <span className="business-hours-time today">
                  {business.openingHours[currentDay]}
                </span>
                {business.is24_7 ? (
                  <span className="business-status-open" style={{ marginLeft: '8px' }}>
                    <span className="business-status-dot" />
                    24/7
                  </span>
                ) : isCurrentlyOpen() ? (
                  <span className="business-status-open" style={{ marginLeft: '8px' }}>
                    <span className="business-status-dot" />
                    Otevřeno
                  </span>
                ) : (
                  <span className="business-status-closed" style={{ marginLeft: '8px' }}>
                    <span className="business-status-dot" />
                    Zavřeno
                  </span>
                )}
              </div>

              {/* Expandable week view */}
              {showAllHours && business.openingHours && (
                <div className="business-hours-details show">
                  {Object.entries(business.openingHours)
                    .filter(([day]) => day !== currentDay)
                    .map(([day, hours]) => (
                      <div key={day} className="business-hours-row">
                        <span className="business-hours-day">
                          {dayLabels[day]}
                        </span>
                        <span className="business-hours-time">{hours}</span>
                      </div>
                    ))}
                </div>
              )}

              <button
                className="business-hours-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllHours(!showAllHours);
                }}
              >
                {showAllHours ? 'Skrýt' : 'Zobrazit celý týden'}
              </button>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="business-divider" />

        {/* Phone CTA */}
        <a
          href={`tel:${business.phone}`}
          className="business-phone-cta"
          onClick={(e) => e.stopPropagation()}
        >
          {business.phone}
        </a>
      </div>
    </div>
  );
}
