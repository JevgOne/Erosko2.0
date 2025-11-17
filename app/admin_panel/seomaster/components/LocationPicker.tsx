'use client';

import { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';

interface Location {
  page: string;
  section: string;
  label: string;
  description: string;
  visualPosition: string;
}

const AVAILABLE_LOCATIONS: Location[] = [
  {
    page: 'homepage',
    section: 'hero-top',
    label: '🔝 Homepage - Nad vyhledáváním',
    description: 'Zobrazí se úplně nahoře, nad search barem (ideální pro urgentní oznámení)',
    visualPosition: `
Header (navigace)
    ↓
🎯 [VÁŠ CONTENT TADY]
    ↓
Hero (search bar)
    `
  },
  {
    page: 'homepage',
    section: 'after-hero',
    label: '📍 Homepage - Pod vyhledáváním',
    description: 'Mezi search barem a profily (ideální pro CTA nebo trust badges)',
    visualPosition: `
Hero (search bar)
    ↓
🎯 [VÁŠ CONTENT TADY]
    ↓
Profile Cards (grid)
    `
  },
  {
    page: 'homepage',
    section: 'after-profiles',
    label: '👥 Homepage - Pod profily',
    description: 'Mezi profily a bannerem (ideální pro "Přidat profil" CTA)',
    visualPosition: `
Profile Cards (grid)
    ↓
🎯 [VÁŠ CONTENT TADY]
    ↓
Ad Banner
    `
  },
  {
    page: 'homepage',
    section: 'main',
    label: '⭐ Homepage - Hlavní sekce',
    description: 'Mezi Categories a Trust Signals (ideální pro SEO text)',
    visualPosition: `
Categories (4 karty)
    ↓
🎯 [VÁŠ CONTENT TADY]
    ↓
Trust Signals
    `
  },
  {
    page: 'homepage',
    section: 'footer',
    label: '🦶 Homepage - Před patičkou',
    description: 'Před footer sekcí (ideální pro newsletter nebo promo banner)',
    visualPosition: `
How It Works
    ↓
🎯 [VÁŠ CONTENT TADY]
    ↓
Footer (patička)
    `
  },
  {
    page: 'holky-na-sex',
    section: 'main',
    label: '❤️ Holky na sex - Hlavní',
    description: 'Na stránce Holky na sex mezi obsahem',
    visualPosition: `
Search & Filters
    ↓
🎯 [VÁŠ CONTENT TADY]
    ↓
Profile Results
    `
  },
  {
    page: 'eroticke-masaze',
    section: 'main',
    label: '💆 Erotické masáže - Hlavní',
    description: 'Na stránce Erotické masáže mezi obsahem',
    visualPosition: `
Search & Filters
    ↓
🎯 [VÁŠ CONTENT TADY]
    ↓
Masseuse Results
    `
  },
  {
    page: 'bdsm',
    section: 'main',
    label: '🔥 BDSM - Hlavní',
    description: 'Na stránce BDSM mezi obsahem',
    visualPosition: `
Search & Filters
    ↓
🎯 [VÁŠ CONTENT TADY]
    ↓
BDSM Results
    `
  },
  {
    page: 'online-sex',
    section: 'main',
    label: '📹 Online Sex - Hlavní',
    description: 'Na stránce Online Sex mezi obsahem',
    visualPosition: `
Online Categories
    ↓
🎯 [VÁŠ CONTENT TADY]
    ↓
Online Profiles
    `
  },
];

interface LocationPickerProps {
  value: { page: string; section: string };
  onChange: (page: string, section: string) => void;
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLocation = AVAILABLE_LOCATIONS.find(
    loc => loc.page === value.page && loc.section === value.section
  ) || AVAILABLE_LOCATIONS[3]; // Default to main

  const handleSelect = (location: Location) => {
    onChange(location.page, location.section);
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Location Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">
          📍 Umístění na webu <span className="text-red-400">*</span>
        </label>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary-400" />
              <span>{selectedLocation.label}</span>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-2 glass rounded-xl border border-white/10 max-h-96 overflow-y-auto">
              {AVAILABLE_LOCATIONS.map((location, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(location)}
                  className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 ${
                    location.page === value.page && location.section === value.section
                      ? 'bg-primary-500/10'
                      : ''
                  }`}
                >
                  <div className="font-medium text-white">{location.label}</div>
                  <div className="text-sm text-gray-400 mt-1">{location.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-2">
          Vyberte, kde se má content block zobrazit na webu
        </p>
      </div>

      {/* Visual Preview */}
      <div className="glass rounded-xl p-6 border-2 border-primary-500/20">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
          <h3 className="text-sm font-bold text-primary-400 uppercase">Live Preview Pozice</h3>
        </div>

        <div className="bg-dark-800/50 rounded-lg p-4 font-mono text-sm">
          <pre className="text-gray-300 whitespace-pre-wrap">{selectedLocation.visualPosition}</pre>
        </div>

        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-300">
            💡 <strong>Tip:</strong> {selectedLocation.description}
          </p>
        </div>
      </div>

      {/* Technical Info */}
      <div className="glass rounded-lg p-4">
        <div className="text-xs text-gray-400 space-y-1">
          <div>
            <span className="text-gray-500">Page:</span>{' '}
            <code className="text-primary-400 font-mono">{value.page}</code>
          </div>
          <div>
            <span className="text-gray-500">Section:</span>{' '}
            <code className="text-primary-400 font-mono">{value.section}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
