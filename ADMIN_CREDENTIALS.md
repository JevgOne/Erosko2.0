# 🔐 Přihlašovací údaje EROSKO.CZ

## Admin Panel
**URL:** https://www.erosko.cz/admin_panel

**Přihlášení:**
- **Email:** admin@erosko.cz
- **Telefon:** +420777888999
- **Heslo:** admin123

## Databáze
**Turso Database (Production):**
- **URL:** libsql://erosko20-jevgone.aws-ap-south-1.turso.io
- **Region:** India (aws-ap-south-1)
- **Profily:** 175
- **Služby:** 60
- **Propojení:** 1,287

## Statistiky
- ✅ Profily v databázi: **175**
- ✅ Služby: **60** (kategorizované)
- ✅ Praha profily: **32** (s městskými částmi 1-13)
- ✅ PRAKTIKY: 44 služeb
- ✅ DRUHY_MASAZI: 10 služeb
- ✅ EXTRA_SLUZBY: 6 služeb

## Environment Variables (Vercel)
Všechny jsou nastavené:
- ✅ TURSO_DATABASE_URL
- ✅ TURSO_AUTH_TOKEN
- ✅ AUTH_SECRET
- ✅ AUTH_TRUST_HOST
- ✅ NEXT_PUBLIC_APP_URL

## Poznámky
- Admin panel používá Turso databázi (stejnou jako web)
- Nové profily se ukládají do Turso
- Všechny změny jsou synchronizované
