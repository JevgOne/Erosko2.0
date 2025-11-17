# 📍 CONTENT BLOCKS - KDE SE ZOBRAZUJÍ NA EROSKO.CZ

## Homepage (/) - Přesné umístění Content Blocks

### 🎯 Vizuální mapa homepage:

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  📱 HEADER (Header.tsx)                                          │
│  - Logo EROSKO.CZ                                                │
│  - Navigace: Holky na sex, Masáže, BDSM, Online, Podniky        │
│  - Tlačítka: Přidat inzerát, Přihlásit se                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  🎨 HERO SECTION (Hero.tsx)                                      │
│  - Velký nadpis: "Objevte prémiové služby ve vaší oblasti"      │
│  - Search bar s city buttony                                     │
│  - Animované barevné pozadí (gradient balls)                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  👥 PROFILE CARDS (ProfileCardGrid.tsx)                          │
│  - Nadpis: "Všechny erotické profily"                           │
│  - Grid s 18 profily (fotky, jména, věk, hodnocení)             │
│  - Instagram-style layout                                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  📢 AD BANNER (AdBanner.tsx)                                     │
│  - Horizontal banner: "Propagujte svůj profil"                  │
│  - CTA button: "Více informací"                                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  🎯 CATEGORIES (Categories.tsx)                                  │
│  - 4 velké karty s ikonami:                                      │
│    • Erotické masáže (Sparkles icon, růžová)                    │
│    • Escort & Sex (Heart icon, červená)                         │
│    • Priváty (Home icon, modrá)                                 │
│    • BDSM & Domina (Flame icon, oranžová)                       │
│  - Každá karta má count profilů                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════╗
║  🎯 CONTENT BLOCKS - SEKCE "main"                               ║
║                                                                  ║
║  ✨ TADY SE ZOBRAZÍ CONTENT BLOCKS!                             ║
║                                                                  ║
║  V adminu vytvoř:                                                ║
║  - page: "homepage"                                              ║
║  - section: "main"                                               ║
║  - published: ANO                                                ║
║                                                                  ║
║  Příklad:                                                        ║
║  - SEO text "O Erosko.cz"                                        ║
║  - Speciální nabídka / akce                                      ║
║  - Video prezentace                                              ║
║  - Custom HTML blok                                              ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ✅ TRUST SIGNALS (TrustSignals.tsx)                            │
│  - Statistiky:                                                   │
│    • 500+ Ověřených profilů                                      │
│    • 10 000+ Spokojených klientů                                 │
│    • 100% Diskrétní služba                                       │
│  - 3 sloupce s ikonami a čísly                                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  📋 HOW IT WORKS (HowItWorks.tsx)                               │
│  - Nadpis: "Jak to funguje"                                     │
│  - 3 kroky:                                                      │
│    1. Vyberte službu                                             │
│    2. Kontaktujte poskytovatele                                  │
│    3. Užijte si službu                                           │
│  - Každý krok má ikonu a popis                                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════╗
║  🎯 CONTENT BLOCKS - SEKCE "footer"                             ║
║                                                                  ║
║  ✨ DRUHÁ EDITOVATELNÁ OBLAST!                                   ║
║                                                                  ║
║  V adminu vytvoř:                                                ║
║  - page: "homepage"                                              ║
║  - section: "footer"                                             ║
║  - published: ANO                                                ║
║                                                                  ║
║  Příklad:                                                        ║
║  - Newsletter subscribe form                                     ║
║  - Partner loga                                                  ║
║  - Disclaimer / legal text                                       ║
║  - CTA banner "Staň se členem"                                   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  🦶 FOOTER (Footer.tsx)                                          │
│  - Logo + popis webu                                             │
│  - Sloupce s odkazy:                                             │
│    • O nás                                                       │
│    • Kontakt                                                     │
│    • Podmínky použití                                            │
│    • Ochrana osobních údajů                                      │
│  - Social media ikony                                            │
│  - Copyright © 2024 EROSKO.CZ                                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Příklady Content Blocks na homepage

### PŘÍKLAD A: SEO Text v sekci "main"

**Vytvoř v adminu:**
```
Identifier: seo_intro
Type: RICH_TEXT
Page: homepage
Section: main
Published: ✅ ANO
Order: 0
Content:
```
```html
<div class="bg-gradient-to-br from-dark-lighter to-dark-800 rounded-2xl p-8 border border-white/10">
  <h2 class="text-3xl font-bold text-white mb-4">
    🔥 Největší ověřená databáze escort služeb v ČR
  </h2>
  <p class="text-gray-300 text-lg mb-4">
    Erosko.cz je prémiová platforma propojující klienty s profesionálními
    poskytovateli erotických služeb. Všechny profily jsou ověřené, s reálnými
    fotkami a kontakty bez zprostředkovatelů.
  </p>
  <ul class="space-y-2 text-gray-400">
    <li>✅ Přes 500+ ověřených profilů z celé České republiky</li>
    <li>✅ Diskrétní a bezpečné propojení bez agentury</li>
    <li>✅ Reálné fotky, recenze a hodnocení od klientů</li>
    <li>✅ Praha, Brno, Ostrava a všechna další města</li>
  </ul>
</div>
```

**Zobrazí se:**
```
Categories (4 karty)
    ↓
[TVŮJ SEO TEXT TADY] ← Content Block!
    ↓
Trust Signals (statistiky)
```

---

### PŘÍKLAD B: Promo Banner v sekci "footer"

**Vytvoř v adminu:**
```
Identifier: vip_promo
Type: RICH_TEXT
Page: homepage
Section: footer
Published: ✅ ANO
Order: 0
Content:
```
```html
<div class="bg-gradient-to-r from-primary-500 via-pink-500 to-purple-500 rounded-2xl p-10 text-center shadow-2xl">
  <div class="max-w-2xl mx-auto">
    <h3 class="text-3xl font-bold text-white mb-4">
      💎 Zvýšte viditelnost svého profilu
    </h3>
    <p class="text-white/90 text-lg mb-6">
      VIP členství vám zajistí TOP pozici ve výsledcích vyhledávání,
      zvýrazněný profil a přístup k prémiové podpoře.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/vip" class="px-8 py-4 bg-white text-primary-500 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors">
        Zjistit více o VIP
      </a>
      <a href="/kontakt" class="px-8 py-4 bg-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/30 transition-colors">
        Kontaktujte nás
      </a>
    </div>
  </div>
</div>
```

**Zobrazí se:**
```
How It Works (3 kroky)
    ↓
[PROMO BANNER TADY] ← Content Block!
    ↓
Footer (patička)
```

---

### PŘÍKLAD C: Video v sekci "main"

**Vytvoř v adminu:**
```
Identifier: intro_video
Type: VIDEO
Page: homepage
Section: main
Published: ✅ ANO
Order: 1
Content: https://www.youtube.com/embed/VIDEO_ID
```

**Zobrazí se:**
- Video iframe mezi Categories a Trust Signals

---

## 📊 Jak přidat více Content Blocks na jedno místo?

**Pomocí Order:**
```
Block 1: identifier="welcome",     section="main", order=0  ← První
Block 2: identifier="seo_text",    section="main", order=1  ← Druhý
Block 3: identifier="promo",       section="main", order=2  ← Třetí
```

Všechny se zobrazí pod sebou v pořadí podle `order` hodnoty!

---

## 🔧 Chceš Content Blocks JINDE na homepage?

### Možné nové lokace:

1. **Mezi Hero a Profile Cards:**
   - Ideální pro: Speciální oznámení, urgent banery

2. **Mezi Profile Cards a AdBanner:**
   - Ideální pro: CTA "Přidat profil", registrace

3. **Mezi AdBanner a Categories:**
   - Ideální pro: Trust badges, certifikáty

4. **Do Hero sekce (nahoře):**
   - Ideální pro: Alert bar, flash sale

**Řekni mi, kam chceš přidat Content Block sekci a já to přidám!**

---

## 📝 Quick Start Guide

### Jak vytvořit svůj první Content Block:

1. **Otevři Admin:**
   - https://erosko.cz/admin_panel/seomaster
   - Klikni na tab "Content Blocks"

2. **Klikni "Nový Content Block"**

3. **Vyplň:**
   ```
   Identifier: test_homepage_main
   Title: Můj testovací blok
   Type: RICH_TEXT
   Page: homepage
   Section: main
   Published: ✅ ANO
   Order: 0
   Content:
   ```
   ```html
   <div class="bg-primary-500/10 border border-primary-500/20 rounded-xl p-6">
     <h3 class="text-xl font-bold text-white mb-2">
       🎉 Test Content Block
     </h3>
     <p class="text-gray-300">
       Pokud tohle vidíš, Content Blocks fungují perfektně!
     </p>
   </div>
   ```

4. **Ulož a refresh homepage** - mělo by se zobrazit mezi Categories a Trust Signals!

---

**Verze:** 1.0
**Datum:** 2025-11-17
**Status:** Production Ready ✅
