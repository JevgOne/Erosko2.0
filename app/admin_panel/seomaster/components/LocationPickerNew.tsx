'use client';

import { useState } from 'react';
import { MapPin, ChevronDown, Lightbulb, Sparkles } from 'lucide-react';

// Mini Preview Component - Visual wireframe representation
function MiniPreview({ location }: { location: Location }) {
  const isHighlighted = (section: string) => location.section === section;

  return (
    <div className="space-y-3 text-base font-semibold">
      {/* Header */}
      <div className="h-10 bg-gray-700 rounded-lg flex items-center justify-center text-gray-200 shadow-md">
        Header
      </div>

      {/* Hero-top (Alert Bar) */}
      {location.page === 'homepage' && (
        <div className={`h-8 rounded-lg flex items-center justify-center transition-all text-sm ${
          isHighlighted('hero-top')
            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold animate-pulse ring-4 ring-yellow-400 shadow-xl'
            : 'bg-gray-800 text-gray-500'
        }`}>
          {isHighlighted('hero-top') ? '🎯 VÁŠ CONTENT!' : 'Alert'}
        </div>
      )}

      {/* Hero Section */}
      <div className="h-24 bg-gray-700 rounded-lg flex items-center justify-center text-gray-200 shadow-md">
        Hero / Search
      </div>

      {/* After-hero */}
      {location.page === 'homepage' && (
        <div className={`h-14 rounded-lg flex items-center justify-center transition-all text-sm ${
          isHighlighted('after-hero')
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold animate-pulse ring-4 ring-yellow-400 shadow-xl'
            : 'bg-gray-800 text-gray-500'
        }`}>
          {isHighlighted('after-hero') ? '🎯 VÁŠ CONTENT!' : 'CTA'}
        </div>
      )}

      {/* Filters for category pages */}
      {location.page !== 'homepage' && (
        <div className="h-14 bg-gray-700 rounded-lg flex items-center justify-center text-gray-200 shadow-md">
          Filters
        </div>
      )}

      {/* Main content for category pages */}
      {location.page !== 'homepage' && (
        <div className={`h-20 rounded-lg flex items-center justify-center transition-all text-sm ${
          isHighlighted('main') && location.page !== 'homepage'
            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold animate-pulse ring-4 ring-yellow-400 shadow-xl'
            : 'bg-gray-800 text-gray-500'
        }`}>
          {isHighlighted('main') && location.page !== 'homepage' ? '🎯 VÁŠ CONTENT!' : 'Info'}
        </div>
      )}

      {/* Profile Cards Grid */}
      <div className="grid grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-14 bg-gray-700 rounded-lg shadow-md"></div>
        ))}
      </div>

      {/* After-profiles */}
      {location.page === 'homepage' && (
        <div className={`h-14 rounded-lg flex items-center justify-center transition-all text-sm ${
          isHighlighted('after-profiles')
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold animate-pulse ring-4 ring-yellow-400 shadow-xl'
            : 'bg-gray-800 text-gray-500'
        }`}>
          {isHighlighted('after-profiles') ? '🎯 VÁŠ CONTENT!' : 'CTA'}
        </div>
      )}

      {/* Ad Banner */}
      {location.page === 'homepage' && (
        <div className="h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
          Ad
        </div>
      )}

      {/* Categories */}
      {location.page === 'homepage' && (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-700 rounded-lg shadow-md"></div>
          ))}
        </div>
      )}

      {/* Main section on homepage */}
      {location.page === 'homepage' && (
        <div className={`h-20 rounded-lg flex items-center justify-center transition-all text-sm ${
          isHighlighted('main') && location.page === 'homepage'
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold animate-pulse ring-4 ring-yellow-400 shadow-xl'
            : 'bg-gray-800 text-gray-500'
        }`}>
          {isHighlighted('main') && location.page === 'homepage' ? '🎯 VÁŠ CONTENT!' : 'SEO'}
        </div>
      )}

      {/* Trust Signals / How it Works */}
      {location.page === 'homepage' && (
        <>
          <div className="h-14 bg-gray-700 rounded-lg flex items-center justify-center text-gray-200 shadow-md">
            Trust Signals
          </div>
          <div className="h-14 bg-gray-700 rounded-lg flex items-center justify-center text-gray-200 shadow-md">
            How It Works
          </div>
        </>
      )}

      {/* Footer section */}
      {location.page === 'homepage' && (
        <div className={`h-14 rounded-lg flex items-center justify-center transition-all text-sm ${
          isHighlighted('footer')
            ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-bold animate-pulse ring-4 ring-yellow-400 shadow-xl'
            : 'bg-gray-800 text-gray-500'
        }`}>
          {isHighlighted('footer') ? '🎯 VÁŠ CONTENT!' : 'Newsletter'}
        </div>
      )}

      {/* Footer */}
      <div className="h-12 bg-gray-700 rounded-lg flex items-center justify-center text-gray-200 shadow-md">
        Footer
      </div>
    </div>
  );
}

interface Location {
  page: string;
  section: string;
  label: string;
  shortDesc: string;
  fullDesc: string;
  category: 'urgent' | 'cta' | 'seo' | 'content' | 'footer';
  categoryLabel: string;
  categoryColor: string;
  examples: string[];
  visualPosition: string;
  screenshot?: string; // URL to thumbnail/screenshot
}

const AVAILABLE_LOCATIONS: Location[] = [
  {
    page: 'homepage',
    section: 'hero-top',
    label: '🚨 ÚPLNĚ NAHOŘE - Alert Bar',
    shortDesc: 'Nad search barem',
    fullDesc: 'První věc co návštěvníci uvidí. Perfektní pro urgentní zprávy, akce, důležitá oznámení.',
    category: 'urgent',
    categoryLabel: 'URGENTNÍ',
    categoryColor: 'bg-red-500',
    examples: [
      '🔥 Black Friday: -50% na všechny VIP profily do půlnoci!',
      '⚠️ Důležité: Změna provozní doby během svátků',
      '🎉 Novinka: Nyní s video hovory!',
      '⏰ Letní akce: Registrace zdarma jen tento týden'
    ],
    visualPosition: `
╔════════════════════╗
║ Header             ║
╠════════════════════╣
║ 🎯 VÁŠ CONTENT!   ║
║   (Alert Bar)     ║
╠════════════════════╣
║ Hero / Search     ║
╚════════════════════╝`
  },
  {
    page: 'homepage',
    section: 'after-hero',
    label: '🎯 POD VYHLEDÁVÁNÍM - CTA Zóna',
    shortDesc: 'Hned pod search barem',
    fullDesc: 'Vysoká viditelnost po vyhledávání. Ideální pro call-to-action tlačítka, trust badges.',
    category: 'cta',
    categoryLabel: 'CALL TO ACTION',
    categoryColor: 'bg-blue-500',
    examples: [
      '💎 Přidejte si profil ZDARMA - Za 5 minut!',
      '✅ Ověřené profily • Diskrétní • Bezpečné',
      '🎯 Staňte se VIP členem a získejte více klientů',
      '🔒 100% Diskrétnost zaručena • SSL šifrování'
    ],
    visualPosition: `
╔════════════════════╗
║ Hero / Search     ║
╠════════════════════╣
║ 🎯 VÁŠ CONTENT!   ║
║   (CTA Banner)    ║
╠════════════════════╣
║ Profile Cards     ║
╚════════════════════╝`
  },
  {
    page: 'homepage',
    section: 'after-profiles',
    label: '👥 PO PROFILECH - Členství CTA',
    shortDesc: 'Pod gridem profilů',
    fullDesc: 'Vidí to lidé, kteří scrollují profily. Super pro registraci, členství, VIP nabídky.',
    category: 'cta',
    categoryLabel: 'CALL TO ACTION',
    categoryColor: 'bg-blue-500',
    examples: [
      '💼 Máte escort služby? Přidejte se k nám!',
      '⭐ Upgrade na VIP - 3x více klientů garantováno',
      '📸 Profesionální foto? Zvýšíme vaši viditelnost!',
      '🚀 Získejte TOP pozici ve výsledcích vyhledávání'
    ],
    visualPosition: `
╔════════════════════╗
║ Profile Cards     ║
╠════════════════════╣
║ 🎯 VÁŠ CONTENT!   ║
║   (CTA Banner)    ║
╠════════════════════╣
║ Ad Banner         ║
╚════════════════════╝`
  },
  {
    page: 'homepage',
    section: 'main',
    label: '⭐ HLAVNÍ SEKCE - SEO Content',
    shortDesc: 'Mezi Categories a Trust Signals',
    fullDesc: 'NEJLEPŠÍ místo pro SEO texty! Google to miluje. Pište sem popisky, keywordy, "o nás".',
    category: 'seo',
    categoryLabel: 'SEO OPTIMALIZACE',
    categoryColor: 'bg-green-500',
    examples: [
      '📝 "Erosko.cz je největší ověřená databáze escort služeb v ČR..."',
      '🔍 SEO text s keywords: "holky na sex Praha", "erotické masáže Brno"',
      '✨ "Přes 500+ ověřených profilů • Reálné fotky • Bez agentury"',
      '📊 Dlouhý popisný text o službách (200-300 slov)'
    ],
    visualPosition: `
╔════════════════════╗
║ Categories        ║
╠════════════════════╣
║ 🎯 VÁŠ CONTENT!   ║
║   (SEO Text)      ║
╠════════════════════╣
║ Trust Signals     ║
╚════════════════════╝`
  },
  {
    page: 'homepage',
    section: 'footer',
    label: '🦶 PŘED PATIČKOU - Newsletter',
    shortDesc: 'Nad footerem',
    fullDesc: 'Poslední šance oslovit návštěvníka před odchodem. Newsletter, partneři, social links.',
    category: 'footer',
    categoryLabel: 'FOOTER OBLAST',
    categoryColor: 'bg-purple-500',
    examples: [
      '📧 Newsletter: "Získejte exkluzivní nabídky na email"',
      '🤝 Loga partnerů: SafePay, SSL, Verified badges',
      '💬 "Sledujte nás na sociálních sítích" + ikony',
      '🎁 "Staňte se partnerem - Affiliate program"'
    ],
    visualPosition: `
╔════════════════════╗
║ How It Works      ║
╠════════════════════╣
║ 🎯 VÁŠ CONTENT!   ║
║   (Newsletter)    ║
╠════════════════════╣
║ Footer            ║
╚════════════════════╝`
  },
  {
    page: 'holky-na-sex',
    section: 'main',
    label: '❤️ HOLKY NA SEX - Info Text',
    shortDesc: 'Na stránce kategorie',
    fullDesc: 'Mezi filtry a výsledky. SEO text specifický pro escort - bezpečnost, diskrétnost, jak to funguje.',
    category: 'content',
    categoryLabel: 'OBSAH STRÁNKY',
    categoryColor: 'bg-pink-500',
    examples: [
      '💋 "Najděte nejlepší escort služby v Praze a okolí..."',
      '🔒 "Diskrétní schůzky s ověřenými profesionálkami"',
      '✨ Popis služeb: GFE, Overnight, Dinner Date...',
      '📱 "Jak objednat: 1) Vyber profil 2) Zavolej 3) Domluv se"'
    ],
    visualPosition: `
╔════════════════════╗
║ Search & Filters  ║
╠════════════════════╣
║ 🎯 VÁŠ CONTENT!   ║
║   (Info Text)     ║
╠════════════════════╣
║ Profiles Grid     ║
╚════════════════════╝`
  },
  {
    page: 'eroticke-masaze',
    section: 'main',
    label: '💆 MASÁŽE - Info Text',
    shortDesc: 'Na stránce masáží',
    fullDesc: 'Info o druzích masáží - tantra, nuru, body-to-body. Relaxace, benefit, ceny.',
    category: 'content',
    categoryLabel: 'OBSAH STRÁNKY',
    categoryColor: 'bg-pink-500',
    examples: [
      '✨ "Erotické masáže v Praze - Tantra, Nuru, Body-to-body"',
      '🧘 "Relaxace pro tělo i mysl s profesionálními masérkami"',
      '💆 Typy masáží: Klasická, Erotická, Happy End...',
      '💰 "Ceny od 1500 Kč/hod - Diskrétní prostory"'
    ],
    visualPosition: `
╔════════════════════╗
║ Search & Filters  ║
╠════════════════════╣
║ 🎯 VÁŠ CONTENT!   ║
║   (Info Text)     ║
╠════════════════════╣
║ Profiles Grid     ║
╚════════════════════╝`
  },
  {
    page: 'bdsm',
    section: 'main',
    label: '🔥 BDSM - Safety Guide',
    shortDesc: 'Na stránce BDSM',
    fullDesc: 'Info o BDSM praktikách, bezpečnosti, safe words, aftercare. Důležité!',
    category: 'content',
    categoryLabel: 'OBSAH STRÁNKY',
    categoryColor: 'bg-pink-500',
    examples: [
      '⛓️ "BDSM v Praze - Dominy, Submisivní, Bondage..."',
      '🔒 "Bezpečnost první: Safe words, hranice, aftercare"',
      '💡 "Co je BDSM? Vysvětlení pro začátečníky"',
      '⚠️ "Pravidla bezpečné hry - SSC, RACK, PRICK"'
    ],
    visualPosition: `
╔════════════════════╗
║ Search & Filters  ║
╠════════════════════╣
║ 🎯 VÁŠ CONTENT!   ║
║   (Info Text)     ║
╠════════════════════╣
║ Profiles Grid     ║
╚════════════════════╝`
  },
  {
    page: 'online-sex',
    section: 'main',
    label: '📹 ONLINE SEX - Platform Info',
    shortDesc: 'Na stránce online služeb',
    fullDesc: 'Info o cam shows, OnlyFans, sexting. Jak to funguje, bezpečné platby.',
    category: 'content',
    categoryLabel: 'OBSAH STRÁNKY',
    categoryColor: 'bg-pink-500',
    examples: [
      '💻 "Nejlepší české cam girls na OnlyFans a Fansly"',
      '📹 "Live video hovory, sexting, custom content"',
      '💳 "Bezpečné platby - PayPal, Krypto, Revolut"',
      '🎥 "Jak funguje cam show? Průvodce pro začátečníky"'
    ],
    visualPosition: `
╔════════════════════╗
║ Online Categories ║
╠════════════════════╣
║ 🎯 VÁŠ CONTENT!   ║
║   (Info Text)     ║
╠════════════════════╣
║ Profiles Grid     ║
╚════════════════════╝`
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
  ) || AVAILABLE_LOCATIONS[3];

  const handleSelect = (location: Location) => {
    onChange(location.page, location.section);
    setIsOpen(false);
  };

  const getCategoryBadge = (category: string, color: string, label: string) => (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${color} text-white text-xs font-bold rounded-full`}>
      {label}
    </span>
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-lg font-bold text-white mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-400" />
          📍 KDE se má Content Block zobrazit?
          <span className="text-red-400">*</span>
        </label>

        <div className="relative">
          {/* Main Selector Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-5 py-4 bg-dark-800 border-2 border-primary-500/30 rounded-xl text-white hover:border-primary-500/60 transition-all shadow-lg"
          >
            <div className="flex items-center gap-4 flex-1">
              <div>
                <div className="text-left">
                  <div className="font-bold text-base text-white mb-1">{selectedLocation.label}</div>
                  <div className="text-sm text-gray-400">{selectedLocation.shortDesc}</div>
                </div>
              </div>
              {getCategoryBadge(selectedLocation.category, selectedLocation.categoryColor, selectedLocation.categoryLabel)}
            </div>
            <ChevronDown className={`w-6 h-6 text-primary-400 transition-transform flex-shrink-0 ml-4 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown List */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-dark-800 rounded-xl border-2 border-white/20 shadow-2xl max-h-[500px] overflow-y-auto">
              {AVAILABLE_LOCATIONS.map((location, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(location)}
                  className={`w-full text-left px-5 py-4 hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0 ${
                    location.page === value.page && location.section === value.section
                      ? 'bg-primary-500/20 border-l-4 border-l-primary-500'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-bold text-white text-base mb-1">{location.label}</div>
                      <div className="text-sm text-gray-300">{location.shortDesc}</div>
                    </div>
                    {getCategoryBadge(location.category, location.categoryColor, location.categoryLabel)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Visual Preview Box */}
      <div className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl p-6 border-2 border-primary-500/40 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative">
            <div className="w-4 h-4 bg-primary-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-4 h-4 bg-primary-500 rounded-full animate-ping"></div>
          </div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            📍 LIVE PREVIEW - Přesná pozice
          </h3>
          {getCategoryBadge(selectedLocation.category, selectedLocation.categoryColor, selectedLocation.categoryLabel)}
        </div>

        {/* Live Mini Preview - FULL WIDTH */}
        <div className="mb-5">
          {/* Visual Wireframe Preview - HUGE, FULL WIDTH */}
          <div className="bg-gradient-to-b from-dark-900 to-black rounded-xl p-8 border-2 border-primary-500/30 shadow-2xl">
            <div className="text-lg text-gray-200 mb-6 text-center font-bold">🎨 Vizuální náhled - Kde se zobrazí</div>
            <div className="max-w-md mx-auto">
              <MiniPreview location={selectedLocation} />
            </div>
          </div>

          {/* ASCII Diagram - Smaller, below */}
          <details className="mt-4">
            <summary className="cursor-pointer text-gray-400 text-sm hover:text-gray-300 transition-colors">
              📋 Technický diagram (klikni pro zobrazení)
            </summary>
            <div className="bg-black/60 rounded-xl p-6 font-mono text-xs border-2 border-white/20 shadow-inner mt-2">
              <pre className="text-gray-100 whitespace-pre leading-tight font-bold">{selectedLocation.visualPosition}</pre>
            </div>
          </details>
        </div>

        {/* Full Description */}
        <div className="mb-5 p-5 bg-blue-500/10 border-2 border-blue-400/30 rounded-xl">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-blue-300 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-base font-bold text-blue-100 mb-2">Použití:</p>
              <p className="text-sm text-blue-200 leading-relaxed">{selectedLocation.fullDesc}</p>
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="p-5 bg-gradient-to-r from-purple-500/15 to-pink-500/15 border-2 border-purple-400/30 rounded-xl">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-purple-300 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-base font-bold text-purple-100 mb-3">💡 Příklady co sem dát:</p>
              <div className="space-y-2">
                {selectedLocation.examples.map((example, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-purple-300 mt-1">•</span>
                    <span className="text-sm text-purple-100 leading-relaxed">{example}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Info */}
      <div className="bg-dark-800/80 rounded-lg p-4 border border-white/20">
        <p className="text-xs text-gray-400 mb-2 font-bold">🔧 Technické hodnoty:</p>
        <div className="flex gap-3">
          <div className="flex-1">
            <span className="text-gray-500 text-xs">Page:</span>
            <code className="block mt-1 px-3 py-2 bg-primary-500/20 text-primary-300 font-mono text-sm rounded">
              {value.page}
            </code>
          </div>
          <div className="flex-1">
            <span className="text-gray-500 text-xs">Section:</span>
            <code className="block mt-1 px-3 py-2 bg-primary-500/20 text-primary-300 font-mono text-sm rounded">
              {value.section}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
