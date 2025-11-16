# 🎯 SEO MASTER - Návod k použití AI SEO Systému

## 📍 Přístup k dashboardu

**URL:** https://erosko.cz/admin_panel/seo-master

**Přihlášení:** Použij své admin credentials

---

## ✅ Co systém dělá AUTOMATICKY

### 1. **Nové profily**
Když někdo vytvoří profil (inzerent nebo admin), AI automaticky vygeneruje:

- ✅ **META Title** (max 60 znaků)
  - Formát: `"{Jméno}, {věk} let - {kategorie} {město} | EROSKO.CZ"`
  - Příklad: `"Lucie, 25 let - holky na sex Praha | EROSKO.CZ"`

- ✅ **META Description** (3 varianty pro A/B testing, 150-160 znaků)
  - **Varianta A** (Emocionální): `"💋 Lucie (25 let) - holky na sex Praha. ✨ Ověřený profil. Klasik, orál, anál. 📞 Reálné fotky, diskrétní jednání."`
  - **Varianta B** (Faktická): `"Lucie nabízí profesionální služby v Praha. Klasik, orál bez, anál, escort. Kontakt a fotky na profilu."`
  - **Varianta C** (Benefity): `"Přímý kontakt s Lucie v Praha. Bez zprostředkovatele. Ověřený profil. Diskrétní jednání a reálné fotky."`

- ✅ **Keywords** (12-15 keywords)
  - Příklad: `"lucie praha, holky na sex praha, společnice praha, call girls praha, escort praha, diskrétní holky na sex praha, ověřená společnice praha"`

- ✅ **Quality Score** (0-100 bodů)
  - 🟢 **90-100**: Výborné SEO
  - 🔵 **75-89**: Dobré SEO
  - 🟡 **60-74**: Vyžaduje review
  - 🔴 **<60**: Špatné, nutno opravit

- ✅ **OG Image** (1200x630 pro social media)
  - Dynamický URL: `/api/seo/generate-og-image?name=Lucie&city=Praha&...`

- ✅ **ALT texty pro fotky**
  - Každá fotka dostane unikátní ALT text
  - Rotují se formáty:
    - `"Lucie, 25 let - holky na sex Praha - Ověřený profil"`
    - `"Fotka Lucie - společnice Praha"`
    - `"Lucie - holky na sex Praha - reálné fotky"`

**Kdy se generuje:**
- Ihned po vytvoření profilu (běží na pozadí, ~30 sekund)
- Neuživatel nic nečeká, profil se vytvoří okamžitě

### 2. **Nové podniky**
Stejný proces jako u profilů, akorát jiná pravidla:
- META title: `"{Název podniku} - {typ} {město} | EROSKO.CZ"`
- Description: Popis podniku, opening hours, vybavení
- Keywords: název, typ, město, služby

---

## 📊 Dashboard - Co vidíš

### **Statistiky (horní část)**

6 karet s real-time daty:

1. **Total Profiles**
   - Celkový počet profilů
   - Kolik má SEO / kolik chybí

2. **Coverage**
   - Procentuální pokrytí SEO
   - Progress bar

3. **Avg Quality Score**
   - Průměrná kvalita SEO (0-100)
   - Celkový rating AI generovaného obsahu

4. **Needs Review**
   - Počet profilů, které potřebují lidskou kontrolu
   - Profily s low quality nebo nikdy nebyly reviewed

5. **Low Quality**
   - Počet profilů se score < 70
   - Vyžadují opravu

6. **Photo ALT Quality**
   - Průměrná kvalita ALT textů
   - Samostatný score pro obrázky

### **Filtry**

- 🔍 **Search**: Hledej podle jména nebo města
- 📂 **Category**:
  - All Categories
  - 💋 Sex Holky
  - 💆 Masáže
  - ⛓️ BDSM
  - 📱 Online
  - 🏢 Podniky
- 📊 **Status**:
  - All Status
  - Missing SEO (nemá vůbec SEO)
  - Low Quality (<70)
  - Needs Review (nikdy nebylo checked)

### **Tabulka profilů**

Každý řádek zobrazuje:

| Sloupec | Co ukazuje |
|---------|------------|
| **Profile** | Jméno, věk, město, kategorie |
| **SEO Title** | Vygenerovaný META title (nebo "No SEO title") |
| **Quality** | Kruhový graf s číslem (0-100) |
| **Status** | 🤖 Auto / ✏️ Manual / ⚠️ Review / ❌ Missing |
| **Last Gen** | Kdy bylo SEO naposledy generováno |
| **Actions** | 👁️ View / ✏️ Edit |

**Quality Score vizualizace:**
```
🟢 95   - Velký zelený kruh, číslo uprostřed
🔵 82   - Modrý kruh
🟡 68   - Žlutý kruh
🔴 45   - Červený kruh
```

---

## 🎯 Co můžeš dělat jako SEO Master

### **1. Bulk Regenerace**

**Postup:**
1. Vyber profily (checkbox)
2. Klikni **"Bulk Regenerate SEO"**
3. Potvrdíš
4. AI regeneruje SEO pro všechny vybrané profily (~30s per profil)

**Kdy použít:**
- Když změníš AI pravidla
- Když chceš aktualizovat staré SEO
- Když najdeš chybu v keywords

**Force mode:**
- Normálně: AI přeskočí profily s "Manual Override"
- Force: Regeneruje i manual override (použij opatrně!)

### **2. Review profilů**

**Co kontrolovat:**

✅ **Quality Score < 70** (červené/žluté)
- Otevři profil
- Zkontroluj META title - dává smysl?
- Zkontroluj description - je přitažlivá?
- Zkontroluj keywords - relevantní?

✅ **"Needs Review" status**
- Profily, které AI vygenerovalo, ale nikdo nezkontroloval
- Rychle projeď očima, jestli není chyba

✅ **Top profily** (verified, popular)
- Profily s nejvíc views
- VIP profily
- Zaslouží si extra pozornost

**Po reviewu:**
- Klikni **"Mark as Reviewed"** (datum se uloží)
- Nebo **"Edit SEO"** pokud chceš upravit

### **3. Manuální úpravy**

**Kdy upravit ručně:**
- Quality score < 70
- VIP profily
- Top earners
- Speciální případy (např. celebrity escort)

**Postup:**
1. Klikni **"Edit SEO"** u profilu
2. Uprav pole:
   - META title
   - Description A/B/C (nebo napiš vlastní)
   - Keywords
   - Vyber aktivní variantu (A/B/C)
3. **Zapni "Manual Override"** ✅ (důležité!)
4. Save

**Manual Override = 🔒**
- AI NIKDY nepřepíše tvoje změny
- Profil se přeskočí při bulk regeneraci
- Pouze ty můžeš upravit SEO

### **4. A/B Testing**

Každý profil má 3 varianty description:
- **A**: Emocionální (emoji, "Ověřený profil")
- **B**: Faktická (profesionální)
- **C**: Benefity ("Bez zprostředkovatele")

**Můžeš:**
1. Vybrat aktivní variantu (která se zobrazí)
2. Sledovat stats (až bude tracking):
   ```
   Variant A: 1240 impressions, 77 clicks (6.2% CTR)
   Variant B: 1180 impressions, 92 clicks (7.8% CTR) ← Winner!
   Variant C: 1195 impressions, 68 clicks (5.7% CTR)
   ```
3. Zvolit nejlepší variantu pro všechny profily

---

## 🧪 Jak otestovat systém

### **Test 1: Automatická generace**

1. **Vytvoř nový test profil:**
   - Jdi do admin panelu
   - Vytvoř profil: "TestGirl", 25, Praha, "Holky na sex"
   - Počkej ~30 sekund

2. **Zkontroluj v SEO Master dashboardu:**
   - Refresh stránku
   - Najdi "TestGirl" v tabulce
   - Měla by mít:
     - ✅ SEO Title: "TestGirl, 25 let - holky na sex Praha | EROSKO.CZ"
     - ✅ Quality Score: 80-95
     - ✅ Status: 🤖 Auto
     - ✅ Last Gen: "Just now"

3. **Klikni "View Profile"**
   - Zkontroluj, že META tags jsou v HTML
   - Otevři "View Page Source" (Ctrl+U)
   - Najdi: `<meta name="description" content="..."`

### **Test 2: OG Image**

1. **Zkopíruj OG image URL** z profilu
2. **Otevři v novém tabu:**
   ```
   https://erosko.cz/api/seo/generate-og-image?name=TestGirl&city=Praha&category=HOLKY_NA_SEX&age=25
   ```
3. **Měl by se zobrazit:**
   - 1200x630 obrázek
   - Dark mode Erosko design
   - Pink gradient
   - Jméno "TestGirl"
   - Město "Praha"
   - Badge "💋 Sex Holky"

### **Test 3: Bulk Regenerace**

1. **Vyber 3-5 profilů** (checkboxy)
2. **Klikni "Bulk Regenerate SEO"**
3. **Potvrdíš**
4. **Počkej ~2 minuty**
5. **Refresh dashboardu**
   - "Last Gen" by mělo být "Just now"
   - Quality scores mohly změnit

### **Test 4: Manual Override**

1. **Najdi profil s quality < 80**
2. **Klikni "Edit SEO"**
3. **Uprav META title:**
   - Změň na: "Vlastní SEO Title - Test Manual Override"
4. **Zapni "Manual Override"** ✅
5. **Save**
6. **Zkus "Bulk Regenerate"** s tímto profilem
7. **Mělo by přeskočit** (AI nezmění tvoje SEO)

### **Test 5: ALT texty**

1. **Vytvoř profil s fotkami**
2. **Počkej na SEO generaci**
3. **Klikni "View Profile"**
4. **Otevři DevTools → Elements**
5. **Najdi `<img>` tagy**
6. **Zkontroluj ALT atributy:**
   ```html
   <img src="..." alt="Lucie, 25 let - holky na sex Praha - Ověřený profil">
   <img src="..." alt="Fotka Lucie - společnice Praha">
   ```

---

## 📈 Quality Score - Co znamená

AI hodnotí SEO na základě 3 kritérií:

### **1. Keyword Inclusion (40 bodů)**
- Obsahuje správné keywords?
- Jméno + město ✅
- Kategorie + město ✅
- Long-tail keywords ✅

### **2. Length Optimization (30 bodů)**
- META title: 50-60 znaků (ideální)
- Description: 150-160 znaků (ideální)
- Keywords: 10-15 keywords

### **3. Uniqueness (30 bodů)**
- Není duplicitní?
- Není generic ("holky na sex" pro všechny)?
- Obsahuje unikátní prvky (jméno, město)?

**Příklad:**

🟢 **Score 95** - Výborné SEO:
```
Title: "Lucie, 25 let - holky na sex Praha ✓ | EROSKO.CZ" (58 znaků)
Description: "💋 Lucie (25 let) - holky na sex Praha. ✨ Ověřený profil. Klasik, orál bez, anál, escort. 📞 Reálné fotky, diskrétní jednání." (155 znaků)
Keywords: "lucie praha, holky na sex praha, společnice praha, call girls praha, escort praha, diskrétní holky na sex praha" (15 keywords)
```

🔴 **Score 45** - Špatné SEO:
```
Title: "Profil - Praha" (15 znaků - příliš krátké)
Description: "Nabízím služby v Praha." (25 znaků - příliš krátké)
Keywords: "praha, holky" (2 keywords - málo)
```

---

## 🚨 Co dělat, když...

### **"Quality Score je < 70"**
1. Otevři profil na edit
2. Zkontroluj, jestli má profil dost informací (věk, město, služby)
3. Zkus "Regenerate" jednou
4. Pokud stále < 70, uprav ručně a zapni Manual Override

### **"SEO Title je divný"**
1. Zkontroluj, jestli profil má správné údaje (jméno, věk, město)
2. AI používá to, co má k dispozici
3. Oprav údaje v profilu → Regenerate SEO

### **"Missing SEO"**
1. Profil byl vytvořen před implementací systému
2. Vyber ho a klikni "Regenerate"
3. AI vygeneruje SEO retroaktivně

### **"Duplikátní META titles"**
1. Použij dashboard filter: Status → "Duplicates" (když přidám tuto funkci)
2. Ručně uprav konfliktní profily
3. Zapni Manual Override

---

## ✅ Checklist pro SEO Mastera

**Denně:**
- [ ] Zkontroluj "Needs Review" (5 minut)
- [ ] Oprav profily s score < 70 (10 minut)

**Týdně:**
- [ ] Review top 10 profilů (nejvíc views)
- [ ] Zkontroluj nové profily z posledního týdne
- [ ] Sleduj avg quality score (měl by růst)

**Měsíčně:**
- [ ] A/B testing review (která varianta má lepší CTR?)
- [ ] Bulk regenerace starých profilů (>6 měsíců)
- [ ] Update AI pravidel (pokud najdeš pattern chyb)

---

## 🎯 Očekávané výsledky

**Po 1 týdnu:**
- ✅ 100% profilů má SEO
- ✅ Avg quality score: 80-85
- ✅ 0 "Missing SEO"

**Po 1 měsíci:**
- ✅ Avg quality score: 85-90
- ✅ Méně než 5% "Low Quality"
- ✅ Top profily mají manual override SEO

**Dlouhodobě:**
- ✅ Lepší ranking v Google
- ✅ Vyšší CTR v search results
- ✅ Více organic traffic

---

## 📞 Support

**Otázky k systému:**
- Napište zpět detaily o problému
- Screenshoty z dashboardu
- Příklady profilů, kde systém selhává

**Feature requests:**
- Landing pages management
- Duplicate detection
- Analytics dashboard
- A/B testing tracking
- Scheduled regeneration

---

**Verze:** 1.0
**Datum:** 2025-11-16
**Status:** ✅ Production ready
