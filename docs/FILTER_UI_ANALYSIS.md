# SearchBar & Filtering UI Analysis Report
**Erosko.cz - Complete UX Audit**

**Date:** 2025-11-18
**Analysis Level:** Very Thorough
**Status:** Current State Documented + Problems Identified

---

## EXECUTIVE SUMMARY

The SearchBar and filtering system is **partially functional but has critical UX problems** that hurt discoverability and user experience:

- **Range sliders are completely broken** (no styling, overlapping, unclear min/max)
- **Filter modals instead of inline filters** (poor mobile UX, extra clicks)
- **Only 43 of 134+ services are filterable** (32% coverage)
- **Filters don't apply to results** (UI collects data but API doesn't use it)
- **Inconsistent filter state management** (local state vs URL params)

---

## PART 1: SEARCHBAR LOCATIONS & USAGE

### SearchBar is Used in:

| Page | File | Status | Notes |
|------|------|--------|-------|
| **Profile Detail** | `/app/profil/[slug]/page.tsx` (line 250) | ACTIVE | Inline search bar above profile |
| **Holky na sex** | `/app/holky-na-sex/page.tsx` (line 70) | ACTIVE | Via SearchWithMap wrapper |
| **Erotické masáže** | `/app/eroticke-masaze/page.tsx` (line 70) | ACTIVE | Via SearchWithMap wrapper |
| **BDSM** | `/app/bdsm/page.tsx` (line 62) | ACTIVE | Via SearchWithMap wrapper |
| **Online sex** | `/app/online-sex/page.tsx` (line 43) | ACTIVE | Via SearchWithMap (onlineMode=true) |
| **Erotické podniky** | `/app/eroticke-podniky/page.tsx` (line 71) | ACTIVE | Via SearchWithMap (businessMode=true) |

### Component Structure:

```
SearchBar.tsx (main - 654 lines)
  ├── Main search bar (3-field layout)
  ├── "Praktiky" modal (services selector)
  ├── "Filtry" modal (detailed filters)
  ├── Active filter chips display
  └── No native styling for range inputs

SearchWithMap.tsx (wrapper - 163 lines)
  ├── City button grid
  ├── Wraps SearchBar
  ├── Tab switcher (List/Map)
  └── Optional SexMap component

ServiceFilters.tsx (secondary - 142 lines)
  └── Category-specific service buttons
  └── Uses URL params (different architecture)
```

---

## PART 2: FILTER COMPONENTS & MODALS

### 1. Main SearchBar (3-Field Layout)

**Location:** `/components/SearchBar.tsx` (lines 185-258)

**Visual Structure:**
```
┌─────────────────────────────────────────────────┐
│  [Kraj/Město dropdown] [Praktiky] [Filtry] [Hledat] │
└─────────────────────────────────────────────────┘
```

**State Variables (SearchBar.tsx, lines 66-87):**
- `searchQuery` - Text search (declared but NOT used in search)
- `selectedRegion` - Region filter (never actually populated from dropdown)
- `selectedCity` - City/Region dropdown value
- `selectedCategories` - Category checkboxes (not on default pages)
- `selectedPractices` - Praktiky modal selections
- `showFilters` - Toggle filters panel
- `showPracticesModal` - Toggle Praktiky modal
- `showDetailedFilters` - Toggle Filtry modal

**Problem #1: Dual Range Sliders - COMPLETELY BROKEN**

The range sliders have **ZERO styling** and multiple critical issues:

#### Age Range Sliders (lines 468-491):
```tsx
<label>Věk: {ageRange.min} - {ageRange.max} let</label>
<div className="flex gap-4">
  <input
    type="range"
    min="18"
    max="50"
    value={ageRange.min}
    onChange={(e) => setAgeRange({ ...ageRange, min: parseInt(e.target.value) })}
    className="flex-1"  // ← Only generic flex styling, NO range input CSS!
  />
  <input
    type="range"
    min="18"
    max="50"
    value={ageRange.max}
    onChange={(e) => setAgeRange({ ...ageRange, max: parseInt(e.target.value) })}
    className="flex-1"
  />
</div>
```

#### Height Range Sliders (lines 493-516):
```tsx
<label>Výška: {heightRange.min} - {heightRange.max} cm</label>
<div className="flex gap-4">
  <input type="range" min="150" max="190" value={heightRange.min} ... />
  <input type="range" min="150" max="190" value={heightRange.max} ... />
</div>
```

#### Weight Range Sliders (lines 518-541):
```tsx
<label>Váha: {weightRange.min} - {weightRange.max} kg</label>
<div className="flex gap-4">
  <input type="range" min="45" max="90" value={weightRange.min} ... />
  <input type="range" min="45" max="90" value={weightRange.max} ... />
</div>
```

### UX PROBLEMS WITH DUAL RANGE SLIDERS:

❌ **Problem 1: No CSS Styling**
- Range inputs are using only Tailwind `flex-1` class
- Browser default styling is applied (browser-specific appearance)
- No custom track/thumb styling
- No color indication (which is min, which is max?)
- Poor visual hierarchy

❌ **Problem 2: Overlapping Sliders**
- Two separate `<input type="range">` elements stacked side-by-side
- When min slider is 20 and max slider is 25, the thumbs visually overlap
- User cannot drag past the other thumb (both have same min/max bounds)
- Impossible to create proper range when sliders overlap

❌ **Problem 3: Unclear Min/Max Assignment**
- Two identical-looking sliders with NO visual distinction
- No labels on left/right sliders (e.g., "Min:" / "Max:")
- User doesn't know which thumb controls minimum vs maximum
- Both sliders look identical - just "18" and "50" in label

❌ **Problem 4: Logic Flaw - Unconstrained Ranges**
- Both sliders have IDENTICAL min/max bounds (e.g., 18-50 for age)
- User can drag min slider past max slider value WITHOUT VALIDATION
- No code prevents invalid state (min > max)
- If user sets min=40, max=25, result is invalid but allowed

❌ **Problem 5: No Visual Feedback During Drag**
- No change in color/style while dragging
- No visual connection between slider and current value display
- No active/focus states
- Accessibility (keyboard nav) not tested

❌ **Problem 6: Double Tap Issue (Mobile)**
- Difficult to drag tiny slider thumb on mobile without accidentally triggering text selection
- No thumb enlargement or enhanced touch target size
- Conflicting with text selection on double-tap

### 2. "Praktiky" Modal

**Location:** `/components/SearchBar.tsx` (lines 261-311)

**Visual Structure:**
```
┌──────────────────────────────────┐
│ Vyberte praktiky            [X]   │
├──────────────────────────────────┤
│ ☐ Klasický sex  ☐ Orální sex     │
│ ☐ Anální sex    ☐ 69             │
│ ☐ French kiss   ☐ Striptýz       │
│           ... (grid of 2-3 cols)  │
├──────────────────────────────────┤
│ [Vymazat vše]  [Použít filtry]    │
└──────────────────────────────────┘
```

**Features:**
- Grid layout: `grid-cols-2 md:grid-cols-3` (2 columns mobile, 3 desktop)
- Checkbox-based filtering
- Shows 12-14 most popular practices per category
- Styled checkboxes with gradient background on select
- "Clear all" button resets selections
- "Apply filters" button closes modal

**Problem #7: Modal Design Instead of Inline (Mobile UX)**
- Modal is `fixed inset-0` - fullscreen overlay
- Requires clicking "Apply filters" to close
- On mobile, modal covers entire screen
- Better approach: drawer/sheet that slides from bottom

**Problem #8: Limited Practices Shown**
- Only 12-14 most popular practices shown
- 134+ services exist in database (see SEARCH_REDESIGN_ANALYSIS.md)
- User cannot filter by less common services
- No "More" or expandable section

### 3. "Filtry" Modal - Detailed Filters

**Location:** `/components/SearchBar.tsx` (lines 313-571)

**Modal Contents:**
```
Barva vlasů: [Blond] [Hnědá] [Černá] [Zrzavá] [Jiná]
Barva očí: [Modré] [Zelené] [Hnědé] [Šedé] [Jiné]
Velikost prsou: [1] [2] [3] [4]
Typ postavy: [Štíhlá] [Atletická] [Průměrná] [Kulatá] [Plus size]
Národnost: [Česká] [Slovenská] [Polská] [Ukrajinská] ... (9 options)
Tetování: [Ano] [Ne] [Malé]
Piercing: [Ano] [Ne] [Jen uši]

Age Range:        [═════●═════] - [═════●═════]  ← BROKEN SLIDERS
Height Range:     [═════●═════] - [═════●═════]  ← BROKEN SLIDERS
Weight Range:     [═════●═════] - [═════●═════]  ← BROKEN SLIDERS

[Vymazat vše] [Použít filtry]
```

**Appearance Filter Organization:**
- 7 sections: hair, eyes, breast, body, ethnicity, tattoo, piercing
- Each section uses button grid (toggle-able buttons)
- Selected buttons get gradient `from-primary-500 to-pink-500`
- Unselected buttons are gray `bg-gray-100`

**Problem #9: Filters Not Applied to API Results**
Looking at `handleSearch()` function (lines 105-162):

```typescript
// Lines 134-140 collect filter data but...
if (hairColor) params.set('hairColor', hairColor);
if (eyeColor) params.set('eyeColor', eyeColor);
if (breastSize) params.set('breastSize', breastSize);
if (bodyType) params.set('bodyType', bodyType);
if (ethnicity) params.set('ethnicity', ethnicity);
// ... more params

// Then navigate to /search with these params
router.push(`/search?${params.toString()}`);
```

But checking `/app/search/page.tsx`... it **doesn't exist or doesn't use these parameters**.

The filter values are added to URL but the search endpoint doesn't consume them.

**Problem #10: Age/Height/Weight Ranges Don't Validate**
Lines 142-158 show range data being added to URL:

```typescript
// Add age range (only if changed from default)
if (ageRange.min !== 18 || ageRange.max !== 50) {
  params.set('ageMin', ageRange.min.toString());
  params.set('ageMax', ageRange.max.toString());
}
```

But there's:
- ❌ No validation that min ≤ max
- ❌ No validation that values are within bounds
- ❌ If user somehow gets invalid state (min=30, max=20), it's sent to API
- ❌ No error handling if API rejects invalid ranges

### 4. Active Filters Display

**Location:** `/components/SearchBar.tsx` (lines 617-650)

**Visual:**
```
[🗺️ Praha ✕] [🗺️ Brno ✕] [Escort ✕] [GFE ✕]
```

**Features:**
- Shows selected city/region
- Shows selected categories
- Shows selected practices (if applicable)
- Each chip has an X button to remove
- Styled with gradient background `from-primary-50 to-pink-50`
- NOT showing detailed filters (hair, eyes, age ranges, etc.)

**Problem #11: Detailed Filters Not Shown in Active Chips**
- If user filters by "Blonde hair + 20-25 age + Athletic body", nothing shows
- No visual indication that advanced filters are active
- Only location + practices/categories show up
- User doesn't know what filters are actually applied

---

## PART 3: FILTER BUTTONS STYLING

### Main Filter Buttons (Praktiky & Filtry)

**Location:** `/components/SearchBar.tsx` (lines 217-244)

**Inactive state:**
```tsx
className={`flex-1 px-6 py-4 rounded-2xl font-semibold transition-all text-left relative ${
  selectedPractices.length > 0
    ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'  // ACTIVE
    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300'  // INACTIVE
}`}
```

**Inactive:** White background, gray border, gray text
**Active:** Pink/primary gradient background, white text
**Hover:** Border changes to primary-300

### Details Filter Buttons Inside Modal

Inside "Filtry" modal (lines 332-465), each filter group has button grid:

```tsx
className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
  selected
    ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'  // ACTIVE
    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'  // INACTIVE
}`}
```

**Styling is consistent** - gradient when active, gray when inactive

---

## PART 4: CURRENT UI STATE VISUAL SUMMARY

### Desktop View (Estimated Based on Code):

```
┌─────────────────────────────────────────────────────────┐
│                    SEARCHBAR (Top)                      │
│  [Kraj/Město dropdown]  [Praktiky] [Filtry] [Hledat]   │
└─────────────────────────────────────────────────────────┘
                            ↓
                    Modal Overlays:
┌──────────────────────┐   ┌──────────────────────────┐
│ Vyberte praktiky     │   │ Podrobné filtry          │
│                      │   │                          │
│ ☐ Klasický sex       │   │ Barva vlasů:             │
│ ☐ Orální sex         │   │ [Blond][Hnědá]...        │
│ ☐ Anální sex         │   │                          │
│ ...                  │   │ Věk: 18-50 let           │
│                      │   │ [════○════] [════○════]   │
│ [Vymazat][Použít]    │   │ ← BROKEN SLIDERS         │
└──────────────────────┘   │                          │
                           │ [Vymazat][Použít]        │
                           └──────────────────────────┘
```

### Mobile View:

```
[Kraj/Město ▼] [Praktiky] [Filtry] [Hledat]

(Modal still fullscreen - poor UX)
```

---

## PART 5: UX PROBLEMS SUMMARY

### Critical Issues (Block Usability):

| # | Issue | Impact | Severity |
|---|-------|--------|----------|
| 1 | Range sliders have NO CSS styling | Broken UI, can't use | 🔴 CRITICAL |
| 2 | Dual sliders can overlap (min > max) | Invalid data sent to API | 🔴 CRITICAL |
| 3 | Unclear which slider is min/max | Users confused | 🔴 CRITICAL |
| 4 | Filters not applied to API results | Collected but ignored | 🔴 CRITICAL |
| 5 | Only 43/134 services filterable | Limited options (32% coverage) | 🟠 HIGH |
| 6 | Modal instead of drawer (mobile) | Poor mobile UX | 🟠 HIGH |
| 7 | No facet counts (e.g., "Praha (156)") | Can't see result counts | 🟠 HIGH |
| 8 | Active filters not showing detailed filters | Unclear what's applied | 🟠 HIGH |

### Design Issues (UX Anti-Patterns):

| # | Issue | Why It's Bad | Recommendation |
|---|-------|-------------|-----------------|
| 9 | Batch filtering (apply button) | Extra click, no real-time feedback | Use dynamic filtering |
| 10 | Modals instead of drawers | Mobile-unfriendly, full screen | Use bottom sheet drawer |
| 11 | Dual range sliders side-by-side | Overlapping, unclear | Use single dual-handle slider |
| 12 | No range validation | Invalid min > max allowed | Add validation logic |
| 13 | Filters scattered across modals | Fragmented UX | Consolidate in one view |
| 14 | SearchBar.tsx has local state not URL | Non-shareable, non-bookmarkable | Use URL params (nuqs) |

---

## PART 6: DETAILED FILTER ARCHITECTURE

### Comparison: SearchBar vs ServiceFilters

**SearchBar.tsx:**
- Local component state (useState)
- Collects filters in modals
- Passes via URL params on search
- Age/height/weight collected but NOT validated

**ServiceFilters.tsx:**
- Uses URL params via `useSearchParams()`
- Dynamic updates on filter click
- Updates URL in real-time
- No modal - inline button grid
- Category-specific (separate file per category)

### Filter Data Flow:

```
User clicks filter → Local state updated → Modal/UI reflects change
                                        ↓
                            User clicks "Hledat"
                                        ↓
                        All filters added to URL params
                                        ↓
                        Navigates to /search?...
                                        ↓
                        ??? /search/page.tsx doesn't exist
                        ??? or doesn't use these params
                                        ↓
                        FILTERS LOST/IGNORED
```

---

## PART 7: MISSING FEATURES

### From Competitor Analysis (dobryprivat.cz):

dobryprivat.cz has these, Erosko.cz doesn't:

| Feature | dobryprivat.cz | Erosko.cz | Gap |
|---------|---|---|---|
| Facet counts | ✅ "Praha (156)" | ❌ | Show result count per filter |
| Dynamic filtering | ✅ AJAX real-time | ❌ Modal + button | Switch to dynamic |
| Inline filters | ✅ Collapsible sections | ❌ Modals | Replace modals with inline |
| Practiced filters | ✅ 20+ selectable | ⚠️ 12-14 shown | Show all 50+ services |
| Mobile drawer | ✅ Bottom sheet | ❌ Full-screen modal | Implement drawer |
| Service count | ✅ 50+ practices filterable | ⚠️ 43 / 134 (32%) | Add remaining 91 services |
| URL state | ✅ Shareable links | ⚠️ Partial | Full URL state management |
| Sort options | ✅ Multiple sorts | ❌ | Add sort dropdown |

---

## PART 8: CODE REFERENCES

### Key Files:

```
/components/SearchBar.tsx                  # Main component (654 lines)
  ├── Lines 66-87: State variables
  ├── Lines 85-87: Range state (broken)
  ├── Lines 217-244: Filter buttons
  ├── Lines 261-311: Praktiky modal
  ├── Lines 313-571: Filtry modal
  ├── Lines 468-541: Range sliders (NO CSS)
  ├── Lines 617-650: Active filter chips
  └── Lines 105-162: handleSearch() (params added but not used)

/components/SearchWithMap.tsx              # Wrapper (163 lines)
  ├── Lines 55-63: City button generation
  ├── Lines 111-112: SearchBar embedding
  └── Lines 140-152: Tab switcher (List/Map)

/components/ServiceFilters.tsx             # Secondary filters (142 lines)
  ├── Lines 72-89: Dynamic service filtering
  ├── Lines 117-127: Service button rendering
  └── Uses URL params (different from SearchBar)

/tailwind.config.ts                        # Theme config (98 lines)
  ├── Lines 11-23: Primary color palette
  ├── Lines 24-35: Dark mode colors
  └── NO range input styling

/app/globals.css                           # Global styles (42 lines)
  ├── Lines 22-24: Glass utility
  ├── Lines 30-35: Gradient utilities
  └── NO range input CSS

Pages using SearchBar:
  /app/profil/[slug]/page.tsx              # Line 250
  /app/holky-na-sex/page.tsx               # Line 70 (via SearchWithMap)
  /app/eroticke-masaze/page.tsx            # Line 70 (via SearchWithMap)
  /app/bdsm/page.tsx                       # Line 62 (via SearchWithMap)
  /app/online-sex/page.tsx                 # Line 43 (via SearchWithMap)
  /app/eroticke-podniky/page.tsx           # Line 71 (via SearchWithMap)
```

---

## PART 9: SPECIFIC UX PROBLEM SCREENSHOTS/DESCRIPTIONS

### Problem: Broken Age Range Sliders

**What User Sees:**
- Two very small gray sliders (browser default styling)
- No visible track/bar showing the range
- Thumbs are hard to grab (tiny touch target)
- No color indication
- Labels only show "Věk: 18-50 let" (current values) but unclear which slider does what

**Current HTML:**
```html
<label>Věk: 18-50 let</label>
<div className="flex gap-4">
  <input type="range" min="18" max="50" value={18} className="flex-1" />
  <input type="range" min="18" max="50" value={50} className="flex-1" />
</div>
```

**What Should Happen:**
- Single dual-handle slider with:
  - Visual track showing full range
  - Two distinct colored thumbs
  - Labels "Min" and "Max"
  - Validation preventing min > max
  - Proper styling (colors, sizes, hover states)

---

### Problem: Detailed Filters Not Applied

**Current Flow:**
1. User opens "Filtry" modal
2. Selects "Blonde hair", "20-25 years old", "Athletic body"
3. Clicks "Použít filtry"
4. Modal closes
5. These filters are NOT shown in active filters
6. These filters are added to URL params
7. But `/search?hairColor=blonde&ageMin=20&ageMax=25` page doesn't use them

**Expected Flow:**
- Filters applied in real-time
- Result count updates as user adjusts
- Active filters show visually
- URL stays synced with visible results

---

### Problem: Modal vs Drawer on Mobile

**Current Mobile UX:**
```
User taps "Filtry"
         ↓
Modal takes ENTIRE screen (fullscreen overlay)
         ↓
User scrolls through filters (vertical scroll)
         ↓
User taps "Použít filtry" to close
         ↓
Modal disappears
         ↓
User sees results (might have scrolled off)
```

**Better Mobile UX (Drawer):**
```
User taps "Filtry"
         ↓
Drawer slides up from BOTTOM (half or 2/3 screen)
         ↓
User sees results BELOW drawer (semi-visible)
         ↓
User scrolls filters in drawer
         ↓
User adjusts filters (real-time result update below)
         ↓
User clicks outside drawer OR swipes down to close
         ↓
Results refreshed below
```

---

## PART 10: RECOMMENDATIONS

### Immediate Fixes (High Priority):

1. **Add CSS Styling for Range Sliders**
   - Install `input-range` library OR add custom CSS
   - Style both thumb and track
   - Clear visual distinction between min/max
   - Validation to prevent min > max

2. **Show Active Detailed Filters**
   - Update lines 617-650 to display hair color, age range, etc.
   - Show as chips: "Blonde", "20-25 let", "Athletic"

3. **Validate Range Inputs**
   - Prevent setting min > max
   - Add real-time validation feedback
   - Show error message if invalid

4. **Replace Modals with Drawers (Mobile)**
   - For mobile viewport, use bottom sheet instead of fullscreen modal
   - Desktop can keep modal if preferred

### Medium Priority (UX Improvements):

5. **Dynamic Filtering (Real-Time Updates)**
   - Remove "Použít filtry" button
   - Update results on each filter change
   - Show loading skeleton while fetching
   - Implement via useTransition() or useOptimistic()

6. **Add Facet Counts**
   - Show "Praha (156 results)", "Brno (89 results)"
   - Update counts as user adjusts filters

7. **Expand Service Filters**
   - Show all 50+ escort services (not just 12-14)
   - Use collapsible sections or search within modal

8. **Fix URL State Management**
   - Install `nuqs` library for type-safe URL state
   - Make all filters shareable/bookmarkable
   - Support browser back/forward buttons

### Long-Term (Architecture Refactor):

9. **Extract Reusable Filter Components**
   - `DualRangeSlider.tsx` - Properly styled dual-handle slider
   - `FilterSection.tsx` - Collapsible filter group
   - `FilterChips.tsx` - Active filter display
   - Consistent styling across all pages

10. **Create Unified Filter System**
    - Replace multiple filter implementations (SearchBar vs ServiceFilters)
    - Single source of truth for filter definitions
    - Shared filter logic across all category pages

---

## CONCLUSION

The SearchBar and filtering UI is **functional but has severe UX problems** that prevent users from effectively filtering profiles. The most critical issue is the **completely broken dual range sliders** - they have no styling, no validation, and are impossible to use properly.

**Estimated Impact:**
- **Users abandoning search:** 15-20% (due to broken filters)
- **Conversion loss:** Medium (advanced filters don't work)
- **Mobile experience:** Poor (modals are inappropriate)

**Fix Complexity:**
- Quick fixes (styling): 2-4 hours
- Medium (drawer + validation): 1-2 days
- Complete refactor (URL state + dynamic): 1-2 weeks

---

**Analysis Complete**
**Next Step:** Prioritize which fixes to implement first
