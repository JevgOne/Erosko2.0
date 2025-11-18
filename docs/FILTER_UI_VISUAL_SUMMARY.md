# SearchBar & Filter UI - Visual Summary

**Quick Reference Guide for SearchBar Component Issues**

---

## CURRENT UI LAYOUT

### Homepage / Category Pages:
```
┌──────────────────────────────────────────────────────────────┐
│                    SEARCHBAR CONTAINER                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [Kraj/Město ▼]  [Praktiky] [Filtry] [Hledat]          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Active Filters (if any):                                    │
│  [🗺️ Praha ✕] [🗺️ Escort ✕] [Blonde ✕]                    │
└──────────────────────────────────────────────────────────────┘
```

### Profile Detail Page:
```
┌──────────────────────────────────────────────────────────────┐
│                    SEARCHBAR (inline)                        │
│  [Kraj/Město ▼]  [Praktiky] [Filtry] [Hledat]              │
└──────────────────────────────────────────────────────────────┘
                            ↓
            [Photo Gallery] [Details Panel]
```

---

## MODALS STRUCTURE

### "Praktiky" Modal (Services Selector)
```
┌─────────────────────────────────────┐
│ Vyberte praktiky              [✕]   │
├─────────────────────────────────────┤
│                                     │
│ ☐ Klasický sex    ☐ Orální sex      │
│ ☐ Anální sex      ☐ 69              │
│ ☐ French kiss     ☐ Striptýz        │
│ ☐ Masáž           ☐ Happy end        │
│ ... (grid 2-3 cols)                 │
│                                     │
├─────────────────────────────────────┤
│ [Vymazat vše]  [Použít filtry]      │
└─────────────────────────────────────┘
```

### "Filtry" Modal (Detailed Filters)
```
┌──────────────────────────────────────┐
│ Podrobné filtry                 [✕]  │
├──────────────────────────────────────┤
│                                      │
│ Barva vlasů:                         │
│ [Blond] [Hnědá] [Černá] [Zrzavá]    │
│                                      │
│ Barva očí:                           │
│ [Modré] [Zelené] [Hnědé] [Šedé]     │
│                                      │
│ Velikost prsou:                      │
│ [1] [2] [3] [4]                      │
│                                      │
│ Typ postavy:                         │
│ [Štíhlá] [Atletická] [Průměrná]      │
│ [Kulatá] [Plus size]                 │
│                                      │
│ Věk: 18-50 let                       │
│ [════●════] [════●════]  ← BROKEN   │
│                                      │
│ Výška: 150-190 cm                    │
│ [════●════] [════●════]  ← BROKEN   │
│                                      │
│ Váha: 45-90 kg                       │
│ [════●════] [════●════]  ← BROKEN   │
│                                      │
├──────────────────────────────────────┤
│ [Vymazat vše]  [Použít filtry]       │
└──────────────────────────────────────┘
```

---

## PROBLEMS VISUALIZATION

### Problem 1: Broken Range Sliders

**What It Looks Like Now:**
```
Věk: 18-50 let
[════●════] [════●════]
 min slider  max slider
(tiny, gray, unstyled)
```

**Issues:**
- No visible styling (browser defaults)
- Thumbs overlap when range is small
- Can't tell which controls min/max
- Can create invalid ranges (min > max)

**What It Should Look Like:**
```
Věk: 18-50 let
[────●───────●────]
      min      max
(clear, styled, labeled)
```

---

### Problem 2: Modals on Mobile

**Current (Fullscreen Modal):**
```
Screen before:
[Search] 
[Results Grid]

User taps "Filtry"
         ↓
[Fullscreen Modal - hides everything]
[Modal content scrolls vertically]
[Can't see results while filtering]

User taps "Użít filtry"
         ↓
Modal closes, back to results
```

**Better (Bottom Sheet Drawer):**
```
Screen before:
[Search]
[Results Grid]

User taps "Filtry"
         ↓
[Drawer slides up from bottom]
[Results visible below]
[User adjusts filters, sees updates]

User swipes down to close
         ↓
Results updated
```

---

### Problem 3: Limited Service Options

**Currently Shown:**
```
Praktiky Modal:
[12-14 checkboxes visible]

Examples:
✓ Klasický sex
✓ Orální sex
✓ Anální sex
✓ 69
✓ French kiss
... (only popular ones)

User cannot find: Fisting, Rimming, Facesitting, etc.
```

**Database Has:**
```
50+ escort services
14 massage types
10 massage extras
29 BDSM practices
31 online services
────────────────
134+ TOTAL

But only 43 are filterable (32% coverage)
```

---

### Problem 4: Detailed Filters Disappear

**User Selects:**
```
Filtry modal:
[Blonde hair selected]
[20-25 age range selected]
[Athletic body selected]
User clicks "Použít filtry"
```

**What's Shown After:**
```
Active Filters Display:
[🗺️ Praha ✕] [Escort ✕]

WHERE ARE: Blonde, Age 20-25, Athletic?
They're NOT shown in active filters chip!
```

---

## FILE REFERENCES

### Main Components:

| File | Lines | Purpose | Status |
|------|-------|---------|--------|
| SearchBar.tsx | 1-654 | Main filter UI | ACTIVE |
| SearchWithMap.tsx | 1-163 | Wrapper | ACTIVE |
| ServiceFilters.tsx | 1-142 | Secondary filters | ACTIVE |
| globals.css | 1-42 | Global styles | LACKS RANGE INPUT CSS |
| tailwind.config.ts | 1-98 | Theme | NO RANGE STYLING |

### Key Line References:

**SearchBar.tsx:**
- Lines 66-87: State variables
- Lines 85-87: Range state (BROKEN - no validation)
- Lines 105-162: handleSearch (params added but not used)
- Lines 217-244: Filter buttons styling
- Lines 261-311: Praktiky modal
- Lines 313-571: Filtry modal
- Lines 468-541: Range sliders (NO CSS STYLING)
- Lines 617-650: Active filter chips (INCOMPLETE)

---

## CRITICAL ISSUES AT A GLANCE

| # | Issue | Evidence | Fix Time |
|---|-------|----------|----------|
| 1 | Range sliders have NO CSS | Lines 474-540 in SearchBar.tsx | 2 hours |
| 2 | Can't set min > max | No validation in onChange | 30 mins |
| 3 | Active filters incomplete | Lines 617-650 don't show detailed filters | 1 hour |
| 4 | Filters ignored by API | handleSearch() adds params but /search doesn't exist | 2+ hours |
| 5 | Limited services shown | Only 12-14 of 50+ practices | 3+ hours |
| 6 | Mobile UX poor | Modals instead of drawers | 4 hours |

---

## QUICK FIX PRIORITY LIST

### IMMEDIATE (Do First):
1. Add CSS styling for range inputs (~2 hrs)
   - File: `/app/globals.css`
   - Add input[type="range"] rules

2. Add min/max validation (~30 mins)
   - File: `/components/SearchBar.tsx`
   - Add checks in onChange handlers

3. Show detailed filters in active chips (~1 hr)
   - File: `/components/SearchBar.tsx`
   - Update lines 617-650

### MEDIUM (Next Week):
4. Replace with proper dual-range slider (~4 hrs)
5. Make modals into drawers (~2 hrs)
6. Expand services list (~3 hrs)

### LONG-TERM (Refactor):
7. Fix API integration (SearchBar → /search → API)
8. Implement real-time dynamic filtering
9. Add facet counts

---

## TESTING CHECKLIST

After fixes, test:

- [ ] Desktop: Range sliders visible and styled
- [ ] Desktop: Can drag both min and max sliders
- [ ] Desktop: Label updates in real-time
- [ ] Desktop: Can't set invalid range (min > max)
- [ ] Mobile: Sliders touch-friendly (larger thumbs)
- [ ] Mobile: No text selection when dragging
- [ ] All Browsers: Chrome, Firefox, Safari, Edge
- [ ] Active filters: Show all selected values
- [ ] Modal close: Works with button AND Escape key
- [ ] Dropdown: City selection works
- [ ] Search: Navigation to /search works

---

**Document Version:** 1.0
**Created:** 2025-11-18
**Purpose:** Quick visual reference for SearchBar issues
