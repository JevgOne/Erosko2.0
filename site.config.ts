/**
 * Site Configuration
 *
 * Změň tuto konfiguraci pro nový web.
 * Tento soubor obsahuje všechna specifická nastavení pro web.
 */

export const siteConfig = {
  // Základní info
  name: "Erosko.cz",
  title: "Erosko.cz - Escort služby a erotické inzeráty v ČR",
  description: "Najděte nejlepší escort služby, erotické masérky a doprovod v České republice. Ověřené profily s recenzemi.",
  url: "https://www.erosko.cz",

  // Social & SEO
  ogImage: "/og-image.png",
  keywords: [
    "escort",
    "escort praha",
    "erotické masáže",
    "doprovod",
    "escort služby",
    "české escort",
  ],

  // Branding - Barvy
  colors: {
    primary: "#E11D48",    // rose-600 - Hlavní barva webu
    secondary: "#1E293B",  // slate-800 - Sekundární barva
    accent: "#EC4899",     // pink-500 - Akcentní barva
  },

  // Kategorie - přizpůsob svému webu
  categories: [
    {
      slug: "holky-na-sex",
      name: "Holky na sex",
      description: "Nezávislé escort dívky a společnice",
      icon: "👩",
    },
    {
      slug: "eroticke-maserky",
      name: "Erotické masérky",
      description: "Profesionální erotické masáže",
      icon: "💆",
    },
    {
      slug: "escort-praha",
      name: "Escort Praha",
      description: "Escort služby v Praze",
      icon: "🏙️",
    },
    {
      slug: "trans-escort",
      name: "Trans escort",
      description: "Transgender escort služby",
      icon: "⚧️",
    },
    {
      slug: "gigolo",
      name: "Gigolo",
      description: "Mužský doprovod pro ženy",
      icon: "👨",
    },
    {
      slug: "agentury",
      name: "Agentury",
      description: "Escort agentury a salonky",
      icon: "🏢",
    },
  ],

  // Města
  cities: [
    "Praha",
    "Brno",
    "Ostrava",
    "Plzeň",
    "Liberec",
    "Olomouc",
    "České Budějovice",
    "Hradec Králové",
    "Karlovy Vary",
    "Pardubice",
  ],

  // Kontakt
  contact: {
    email: "info@erosko.cz",
    phone: "+420 XXX XXX XXX",
    address: "Praha, Česká republika",
  },

  // Social media
  social: {
    facebook: "https://facebook.com/erosko",
    twitter: "https://twitter.com/erosko",
    instagram: "https://instagram.com/erosko",
  },

  // Funkce
  features: {
    reviews: true,          // Povolit recenze
    ratings: true,          // Povolit hodnocení
    verification: true,     // Ověřené profily
    messaging: false,       // Zprávy mezi uživateli (zatím neimplementováno)
    favorites: true,        // Oblíbené profily
    premiumProfiles: true,  // Premium profily
  },

  // Business nastavení
  business: {
    commission: 10,         // % provize z plateb
    profilePrice: 299,      // Cena za profil/měsíc (Kč)
    premiumPrice: 599,      // Cena za premium profil/měsíc (Kč)
    currency: "CZK",
  },
}

export type SiteConfig = typeof siteConfig
