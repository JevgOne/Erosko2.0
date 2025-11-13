# Firebase Setup pro erosko.cz

## Kroky k vytvoření Firebase projektu

### 1. Vytvoř nový Firebase projekt

1. Jdi na https://console.firebase.google.com
2. Klikni na **"Add project"** (Přidat projekt)
3. Zadej název: **erosko-cz**
4. Pokračuj přes wizard (můžeš vypnout Google Analytics)

### 2. Aktivuj Firebase Storage

1. V levém menu klikni na **"Storage"**
2. Klikni na **"Get started"**
3. Začni v **test mode** (později upravíš security rules)
4. Vyber region: **europe-west3** (Frankfurt - nejblíž ČR)

### 3. Stáhni Service Account

1. V levém menu klikni na **⚙️ (nastavení)** > **"Project settings"**
2. Přejdi na záložku **"Service accounts"**
3. Klikni na **"Generate new private key"**
4. Stáhne se soubor `erosko-cz-firebase-adminsdk-xxxxx.json`
5. **Přejmenuj ho na:** `firebase-service-account.json`
6. **Přesuň ho do:** `/Users/Radim/Projects/erosko.cz/scrapers/`

⚠️ **DŮLEŽITÉ:** Tento soubor obsahuje tajné klíče! NIKDY ho necommituj do gitu!

### 4. Nastav Security Rules pro Storage

V Firebase Console > Storage > Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profiles/{profileSlug}/{allPaths=**} {
      // Všichni můžou číst fotky
      allow read: if true;

      // Jen authenticated users můžou nahrávat
      allow write: if request.auth != null;
    }
  }
}
```

### 5. Spusť upload fotek

Po dokončení kroků 1-4:

```bash
cd /Users/Radim/Projects/erosko.cz/scrapers
npm run upload:firebase
```

Script nahraje **975 fotek** (~58 MB) do Firebase Storage.

---

## Struktura souborů v Storage

```
profiles/
├── adriana/
│   ├── adriana-0-1762711148351.jpg
│   ├── adriana-1-1762711148351.jpg
│   └── ...
├── adrianka/
│   ├── adrianka-0-1762711148466.jpg
│   └── ...
└── ...
```

---

## Veřejné URL fotek

Po uploadu budou fotky dostupné na:

```
https://storage.googleapis.com/erosko-cz.appspot.com/profiles/{profileSlug}/{filename}
```

---

## Náklady

**Firebase Storage Free Tier:**
- ✅ 5 GB uložiště zdarma
- ✅ 1 GB download/den zdarma
- ✅ 20,000 operací/den zdarma

**Tvoje data:**
- 975 fotek = 58 MB
- Perfektně v rámci free tieru!

---

## Troubleshooting

### "Service account not found"
```bash
ls -la /Users/Radim/Projects/erosko.cz/scrapers/firebase-service-account.json
```

Pokud soubor neexistuje, vrať se ke kroku 3.

### "Permission denied"
Zkontroluj Storage Rules (krok 4).

### "Quota exceeded"
Překročen free tier - zkontroluj Firebase Console > Usage.
