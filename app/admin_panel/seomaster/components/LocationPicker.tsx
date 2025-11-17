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
    label: '🚨 Homepage - ÚPLNĚ NAHOŘE (Alert Bar)',
    description: '⚠️ Nad search barem - ideální pro URGENTNÍ oznámení, akce, důležité zprávy',
    visualPosition: `
┌─────────────────────────────┐
│ Header (logo, navigace)     │
├─────────────────────────────┤
│ 🎯 [VÁŠ CONTENT]           │ ← TADY!
│    Alert/Oznámení           │
├─────────────────────────────┤
│ Hero Sekce                  │
│ (vyhledávání)               │
└─────────────────────────────┘
    `
  },
  {
    page: 'homepage',
    section: 'after-hero',
    label: '🎯 Homepage - POD VYHLEDÁVÁNÍM',
    description: '📍 Hned pod search barem - super pro CTA "Přidat profil", trust badges, certifikáty',
    visualPosition: `
┌─────────────────────────────┐
│ Hero Sekce                  │
│ (search bar, city buttons)  │
├─────────────────────────────┤
│ 🎯 [VÁŠ CONTENT]           │ ← TADY!
│    CTA / Trust Badges       │
├─────────────────────────────┤
│ Profile Cards Grid          │
│ (18 profilů)                │
└─────────────────────────────┘
    `
  },
  {
    page: 'homepage',
    section: 'after-profiles',
    label: '👥 Homepage - PO PROFILECH',
    description: '💼 Pod gridem profilů - dobré pro "Staň se členem", "Přidej profil" CTA',
    visualPosition: `
┌─────────────────────────────┐
│ Profile Cards Grid          │
│ (18 profilů v gridu)        │
├─────────────────────────────┤
│ 🎯 [VÁŠ CONTENT]           │ ← TADY!
│    CTA Banner               │
├─────────────────────────────┤
│ Ad Banner                   │
│ "Propagujte svůj profil"    │
└─────────────────────────────┘
    `
  },
  {
    page: 'homepage',
    section: 'main',
    label: '⭐ Homepage - HLAVNÍ SEKCE (SEO)',
    description: '📝 Mezi Categories a Trust Signals - NEJLEPŠÍ místo pro SEO texty, popisky',
    visualPosition: `
┌─────────────────────────────┐
│ Categories                  │
│ (4 barevné karty)           │
├─────────────────────────────┤
│ 🎯 [VÁŠ CONTENT]           │ ← TADY!
│    SEO Text / Popis         │
├─────────────────────────────┤
│ Trust Signals               │
│ (500+ profilů, statistiky)  │
└─────────────────────────────┘
    `
  },
  {
    page: 'homepage',
    section: 'footer',
    label: '🦶 Homepage - PŘED PATIČKOU',
    description: '📧 Nad footerem - perfekt pro newsletter signup, promo banner, partneři',
    visualPosition: `
┌─────────────────────────────┐
│ How It Works                │
│ (3 kroky jak to funguje)    │
├─────────────────────────────┤
│ 🎯 [VÁŠ CONTENT]           │ ← TADY!
│    Newsletter / Partners    │
├─────────────────────────────┤
│ Footer (patička)            │
│ (odkazy, copyright)         │
└─────────────────────────────┘
    `
  },
  {
    page: 'holky-na-sex',
    section: 'main',
    label: '❤️ Stránka HOLKY NA SEX',
    description: '🔞 Mezi filtry a výsledky - SEO text specifický pro escort služby',
    visualPosition: `
┌─────────────────────────────┐
│ Search Bar & Filters        │
│ (město, služby, filtry)     │
├─────────────────────────────┤
│ 🎯 [VÁŠ CONTENT]           │ ← TADY!
│    SEO Text / Info          │
├─────────────────────────────┤
│ Escort Profiles Grid        │
│ (výsledky vyhledávání)      │
└─────────────────────────────┘
    `
  },
  {
    page: 'eroticke-masaze',
    section: 'main',
    label: '💆 Stránka EROTICKÉ MASÁŽE',
    description: '✨ Mezi filtry a výsledky - SEO text pro masáže, relaxaci',
    visualPosition: `
┌─────────────────────────────┐
│ Search Bar & Filters        │
│ (město, typy masáží)        │
├─────────────────────────────┤
│ 🎯 [VÁŠ CONTENT]           │ ← TADY!
│    Info o masážích          │
├─────────────────────────────┤
│ Masseuse Profiles Grid      │
│ (masérky v gridu)           │
└─────────────────────────────┘
    `
  },
  {
    page: 'bdsm',
    section: 'main',
    label: '🔥 Stránka BDSM & DOMINA',
    description: '⛓️ Mezi filtry a výsledky - Info o BDSM službách, bezpečnosti',
    visualPosition: `
┌─────────────────────────────┐
│ Search Bar & Filters        │
│ (město, BDSM praktiky)      │
├─────────────────────────────┤
│ 🎯 [VÁŠ CONTENT]           │ ← TADY!
│    BDSM Guide / Safety      │
├─────────────────────────────┤
│ Domina Profiles Grid        │
│ (dominy, submisivní)        │
└─────────────────────────────┘
    `
  },
  {
    page: 'online-sex',
    section: 'main',
    label: '📹 Stránka ONLINE SEX',
    description: '💻 Mezi kategoriemi a profily - Info o cam shows, OnlyFans, sexting',
    visualPosition: `
┌─────────────────────────────┐
│ Online Categories Tabs      │
│ (OnlyFans, Cam, Sexting)    │
├─────────────────────────────┤
│ 🎯 [VÁŠ CONTENT]           │ ← TADY!
│    Online Safety Info       │
├─────────────────────────────┤
│ Online Profiles Grid        │
│ (cam girls, creators)       │
└─────────────────────────────┘
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
            <div className="absolute z-50 w-full mt-2 bg-dark-800 rounded-xl border border-white/20 shadow-2xl max-h-96 overflow-y-auto">
              {AVAILABLE_LOCATIONS.map((location, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(location)}
                  className={`w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0 ${
                    location.page === value.page && location.section === value.section
                      ? 'bg-primary-500/20 border-l-4 border-l-primary-500'
                      : ''
                  }`}
                >
                  <div className="font-medium text-white text-base">{location.label}</div>
                  <div className="text-sm text-gray-300 mt-1">{location.description}</div>
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
      <div className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl p-6 border-2 border-primary-500/40 shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative">
            <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 bg-primary-500 rounded-full animate-ping"></div>
          </div>
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            📍 Live Preview - Kde se zobrazí
          </h3>
        </div>

        <div className="bg-black/60 rounded-xl p-6 font-mono text-base border-2 border-white/20 shadow-inner">
          <pre className="text-gray-100 whitespace-pre-wrap leading-loose font-semibold">{selectedLocation.visualPosition}</pre>
        </div>

        <div className="mt-5 p-5 bg-gradient-to-r from-blue-500/15 to-purple-500/15 border-2 border-blue-400/30 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-sm font-bold text-blue-100 mb-1">Co sem dát:</p>
              <p className="text-sm text-blue-200 leading-relaxed">{selectedLocation.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Info */}
      <div className="bg-dark-800/80 rounded-lg p-4 border border-white/10">
        <div className="text-xs text-gray-300 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-medium">Page:</span>
            <code className="px-2 py-1 bg-primary-500/20 text-primary-300 font-mono rounded">{value.page}</code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-medium">Section:</span>
            <code className="px-2 py-1 bg-primary-500/20 text-primary-300 font-mono rounded">{value.section}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
