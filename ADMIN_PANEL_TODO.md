# Admin Panel - TODO Seznam

## ✅ Hotové funkce

### Autentizace
- ✅ Phone-based přihlášení (místo email)
- ✅ SMS verifikace pro reset hesla
- ✅ Admin účet: `+420 999 000 111` / `admin123`
- ✅ Middleware ochrana admin routy

### Admin Panel - Základní funkce
- ✅ Dashboard se statistikami
- ✅ Přehled uživatelů (rozbalovací)
- ✅ Přehled podniků
- ✅ Přehled profilů
- ✅ Schvalování/zamítání podniků a profilů
- ✅ Ověřování podniků a profilů
- ✅ **Mazání podniků** (včetně fotek z disku)
- ✅ **Mazání profilů** (včetně fotek z disku)

### Čekající změny (Pending Changes)
- ✅ Zobrazení všech čekajících změn
- ✅ **Náhled změn fotek** (červeně = smazat, zeleně = nové)
- ✅ Schvalování změn (aplikuje změny do DB + fotky)
- ✅ Zamítání změn
- ✅ Tracking počtu žádostí za měsíc

### API Endpointy
- ✅ `/api/admin/stats` - Statistiky
- ✅ `/api/admin/users` - Seznam uživatelů
- ✅ `/api/admin/businesses` - Seznam podniků
- ✅ `/api/admin/profiles` - Seznam profilů
- ✅ `/api/admin/pending-changes` - Čekající změny (GET + POST)
- ✅ `/api/admin/approve` - Schvalování/zamítání
- ✅ `/api/admin/verify` - Ověřování
- ✅ `/api/admin/businesses/delete` - Mazání podniků
- ✅ `/api/admin/profiles/delete` - Mazání profilů
- ✅ `/api/admin/businesses/edit` - Přímá editace podniků
- ✅ `/api/admin/profiles/edit` - Přímá editace profilů

---

## ❌ Co ZBÝVÁ dodělat

### 1. EDITACE PODNIKŮ (Vysoká priorita)

**Co je potřeba:**
- [ ] Tlačítko "Upravit" u podniků (řádek 824 v admin_panel/page.tsx má TODO)
- [ ] Modal s formulářem pro editaci podniku (podobný jako v inzerent_dashboard)
- [ ] Správa fotek v modalu:
  - [ ] Zobrazení existujících fotek
  - [ ] Kliknutí na fotku = označit ke smazání
  - [ ] Upload nových fotek
  - [ ] Preview nových fotek před uložením
  - [ ] HEIC validace
- [ ] State management pro editační formulář
- [ ] Propojení s API `/api/admin/businesses/edit`
- [ ] **Okamžité uložení** (bez pending changes - admin má plná práva)

**Kód k inspiraci:**
- Podívej se na `/app/inzerent_dashboard/page.tsx` řádky 438-540 (handleEditBusiness)
- Business edit modal v inzerent_dashboard (řádky cca 2000-2400)

---

### 2. EDITACE PROFILŮ (Vysoká priorita)

**Co je potřeba:**
- [ ] Tlačítko "Upravit" u profilů
- [ ] Modal s formulářem pro editaci profilu
- [ ] Všechna pole profilu (jméno, věk, město, telefon, popis, služby, ceny...)
- [ ] Správa fotek (stejně jako u podniků)
- [ ] Propojení s API `/api/admin/profiles/edit`
- [ ] **Okamžité uložení** (bez pending changes)

---

### 3. PŘIDÁVÁNÍ NOVÝCH PODNIKŮ (Vysoká priorita)

**Co je potřeba:**
- [ ] Tlačítko "Přidat nový podnik" v sekci Podniky
- [ ] Modal s formulářem pro vytvoření podniku
- [ ] Všechna pole:
  - [ ] Název podniku
  - [ ] Typ podniku (PRIVAT, SALON, ESCORT_AGENCY, atd.)
  - [ ] Telefon (bude součástí slug)
  - [ ] Email
  - [ ] Web
  - [ ] Adresa
  - [ ] Město
  - [ ] Popis
  - [ ] Otevírací doba
  - [ ] Vybavení (pro salony)
  - [ ] Fotky (upload + preview)
- [ ] Vytvoří nový API endpoint `/api/admin/businesses/create`
- [ ] Automatické generování slug (název-město-telefon)
- [ ] Nastavení vlastníka (výběr z existujících uživatelů NEBO vytvoření nového)
- [ ] **Okamžité vytvoření** (approved=true, verified=false)

---

### 4. PŘIDÁVÁNÍ NOVÝCH PROFILŮ (Vysoká priorita)

**Co je potřeba:**
- [ ] Tlačítko "Přidat nový profil" v sekci Profily
- [ ] Modal s formulářem pro vytvoření profilu
- [ ] Všechna pole:
  - [ ] Jméno
  - [ ] Věk
  - [ ] Telefon
  - [ ] Město
  - [ ] Adresa
  - [ ] Popis
  - [ ] Typ profilu (SOLO, nebo přiřazení k podniku)
  - [ ] Kategorie (HOLKY_NA_SEX, EROTICKE_MASERKY, DOMINA, atd.)
  - [ ] Služby (multi-select)
  - [ ] Ceny (hodinová sazba)
  - [ ] Parametry (výška, váha, prsa)
  - [ ] Fotky (upload + preview)
- [ ] Vytvoří nový API endpoint `/api/admin/profiles/create`
- [ ] Automatické generování slug
- [ ] Nastavení vlastníka (výběr z existujících uživatelů NEBO vytvoření nového)
- [ ] **Okamžité vytvoření** (approved=true, verified=false)

---

### 5. VYLEPŠENÍ REGISTRACE (Střední priorita)

**Co je potřeba vylepšit:**
- [ ] **SMS verifikace při registraci** (teď je jen při resetu hesla)
- [ ] Lepší UX při registraci podniku vs SOLO profilu
- [ ] Validace duplicitních telefonních čísel
- [ ] Validace HEIC fotek už při výběru (ne až při submitu)
- [ ] Lepší feedback při uploadu fotek (progress bar)
- [ ] Preview fotek před odesláním registrace

**Současný problém:**
- Uživatelé se mohou zaregistrovat bez SMS verifikace
- Profily/podniky jdou hned do schváleného stavu (`approved=1`)
- Není to bezpečné pro produkci

**Co upravit:**
1. `/app/(auth)/registrace/page.tsx` - Přidat SMS verifikaci
2. `/app/api/register/route.ts` - Nastavit `approved=false` a `verified=false` po registraci
3. Admin pak musí profily/podniky schválit ručně

---

### 6. DALŠÍ VYLEPŠENÍ (Nízká priorita)

**Nice-to-have features:**
- [ ] Hromadné operace (vybrat více podniků a schválit/smazat najednou)
- [ ] Export dat do CSV/Excel
- [ ] Filtrování podniků/profilů (podle města, typu, schválení, atd.)
- [ ] Vyhledávání v seznamech
- [ ] Třídění sloupců
- [ ] Stránkování (pokud bude hodně záznamů)
- [ ] Historie změn (audit log - kdo co kdy změnil)
- [ ] Notifikace na nové čekající změny
- [ ] Bulk upload fotek
- [ ] Integrace s Twilio pro real SMS (teď je dev mode)

---

## 📋 Prioritizace práce

### NEJVYŠŠÍ PRIORITA (udělat jako první):
1. **Editace podniků** (modal + fotky)
2. **Editace profilů** (modal + fotky)
3. **Přidávání nových podniků**
4. **Přidávání nových profilů**

### STŘEDNÍ PRIORITA (potom):
5. **Vylepšení registrace** (SMS verifikace, schvalování)

### NÍZKÁ PRIORITA (můžeme odložit):
6. **Další vylepšení** (hromadné operace, export, filtry)

---

## 🔧 Technické poznámky

### Struktura modalu pro editaci

Modal by měl obsahovat:
```typescript
// State
const [editingBusiness, setEditingBusiness] = useState<any>(null);
const [businessFormData, setBusinessFormData] = useState({ /* všechna pole */ });
const [businessPhotos, setBusinessPhotos] = useState<File[]>([]);
const [businessPhotosPreviews, setBusinessPhotosPreviews] = useState<string[]>([]);
const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);
const [showEditBusinessModal, setShowEditBusinessModal] = useState(false);

// Handler pro otevření modalu
const handleEditBusiness = (business: any) => {
  setEditingBusiness(business);
  setBusinessFormData({
    name: business.name || '',
    description: business.description || '',
    phone: business.phone || '',
    // ... další pole
  });
  setBusinessPhotos([]);
  setBusinessPhotosPreviews([]);
  setPhotosToDelete([]);
  setShowEditBusinessModal(true);
};

// Handler pro uložení
const handleSaveBusinessEdit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Convert photos to base64
  const photoPromises = businessPhotos.map((file) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  });
  const base64Photos = await Promise.all(photoPromises);

  // Prepare data
  const data = {
    ...businessFormData,
    photoChanges: {
      photosToDelete: photosToDelete.length > 0 ? photosToDelete : undefined,
      newPhotos: base64Photos.length > 0 ? base64Photos : undefined,
    },
  };

  // Send to API
  const response = await fetch('/api/admin/businesses/edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ businessId: editingBusiness.id, data }),
  });

  if (response.ok) {
    alert('Podnik úspěšně upraven!');
    setShowEditBusinessModal(false);
    fetchAdminData(); // Reload
  }
};
```

### API Endpointy jsou připravené

Endpointy `/api/admin/businesses/edit` a `/api/admin/profiles/edit` už existují a jsou plně funkční:
- Přijímají `businessId/profileId` a `data`
- `data` může obsahovat `photoChanges.photosToDelete` a `photoChanges.newPhotos`
- Automaticky mažou staré fotky z disku
- Automaticky ukládají nové fotky
- Okamžitě aplikují změny (bez pending changes)

---

## 📝 Shrnutí

**Co máme:**
- Plně funkční základ admin panelu
- API pro všechny CRUD operace
- Schvalování čekajících změn (včetně fotek!)
- Mazání podniků/profilů

**Co nám chybí:**
- **UI modaly** pro editaci a přidávání
- **Formuláře** s všemi poli
- **Správa fotek** v modalech
- **Vylepšení registrace** (SMS verifikace)

Většina logiky už je hotová, zbývá jen vytvořit UI komponenty (modaly + formuláře).

---

## 🎯 Až se vrátíš, začneme s:

1. **Vytvořením editačního modalu pro podniky** v admin_panel/page.tsx
2. Postupně přidáme stejný modal pro profily
3. Pak modaly pro přidávání nových záznamů
4. Na závěr vylepšíme registraci

Všechny změny jsou uložené v gitu v commitu `409ffba` s názvem "WIP: Admin panel s částečnou funkcionalitou".
