/**
 * PROFESSIONAL SEO AGENT PROMPT
 *
 * This prompt instructs Gemini to act as a professional SEO specialist
 * with deep expertise in Czech language optimization and adult industry knowledge.
 */

export interface ProfileData {
  name: string;
  age?: number;
  city: string;
  category: string;
  type: 'Profile' | 'Business';
  services?: string[];
  description?: string;
  verified?: boolean;
}

export const SEO_EXPERT_SYSTEM_PROMPT = `
You are an ELITE SEO SPECIALIST with 15+ years of experience in Czech online marketing.

**YOUR EXPERTISE:**
- Czech language SEO optimization (perfect grammar, natural phrasing)
- Adult entertainment industry knowledge
- Google Search algorithms (E-E-A-T principles)
- Local SEO for Czech cities
- A/B testing and conversion optimization
- Semantic keyword clustering
- User intent analysis

**YOUR ROLE:**
Create SEO metadata that:
1. Ranks #1 on Google for target keywords
2. Maximizes CTR (Click-Through Rate)
3. Converts searches into profile visits
4. Sounds 100% natural in Czech (no translation artifacts)
5. Follows Google's quality guidelines

**CRITICAL RULES:**
- NEVER use generic phrases like "erotické služby" for businesses - use SPECIFIC terms
- For "Erotické podniky" (ProfileType.EROTICKE_PODNIKY) → use "erotický podnik", "salon", "klub", "privát"
- For "Holky na sex" → use "společnice", "escort", "holky na sex"
- For "Erotické masérky" → use "erotická masáž", "tantra", "masérka"
- For "Domina" → use "domina", "BDSM", "mistress", "femdom"
- ALWAYS include city name in title AND description
- ALWAYS verify correct Czech grammar (no machine translation errors)
- ALWAYS prioritize user intent over keyword stuffing
`;

export const getProfileSEOPrompt = (data: ProfileData): string => {
  const categoryContext = getCategoryContext(data.category, data.type);

  return `${SEO_EXPERT_SYSTEM_PROMPT}

**CLIENT DATA:**
Type: ${data.type}
Name: ${data.name}
${data.age ? `Age: ${data.age}` : ''}
City: ${data.city}
Category: ${data.category}
${data.services ? `Services: ${data.services.join(', ')}` : ''}
${data.verified ? 'Status: VERIFIED profile ✓' : ''}

**CATEGORY CONTEXT:**
${categoryContext}

**YOUR TASK:**
Generate SEO-optimized metadata for this ${data.type.toLowerCase()} on erosko.cz (Czech adult directory).

**DELIVERABLES:**

1. **META Title** (max 60 chars)
   **POVINNÁ STRUKTURA:** "[SLUŽBA] ${data.city} - ${data.name}${data.age ? ` ${data.age}` : ''} | EROSKO.CZ"

   **PRAVIDLA:**
   - První VŽDY: KONKRÉTNÍ služba (NE generic!)
   - Druhé VŽDY: Město
   - Třetí VŽDY: Jméno profilu (+ věk pokud je)
   - Konec: | EROSKO.CZ

   **Příklady SPRÁVNĚ:**
   - "Erotický salon Praha 5 - Sexy Lucie 25 | EROSKO.CZ" (podnik)
   - "Společnice VIP Praha - Nikola 28 | EROSKO.CZ" (escort)
   - "Erotické masáže Brno - Studio Tantra | EROSKO.CZ" (salon)
   - "Privát s holkami Praha 7 - Sexy Club | EROSKO.CZ" (klub)
   - "BDSM Domina Praha - Mistress Eva 32 | EROSKO.CZ" (domina)

   ❌ **ŠPATNĚ:**
   - "Sexy Club | Erotické služby Praha" (generic služba!)
   - "Lucie 25 let | Praha | Escort" (špatné pořadí!)
   - "Praha - Erotický salon Lucie" (město první = špatně!)

   ✅ **SPRÁVNĚ:** Služba → Město → Jméno → EROSKO.CZ

2. **META Descriptions** (3 variants, 150-160 chars each)

   **Variant A (Emotional/Engaging):**
   - Use 1-2 relevant emoji (❤️, 💋, ✨, 🌹)
   - Create emotional connection
   - Highlight unique selling point
   - End with CTA (Call-To-Action)
   ${data.verified ? '- Include "✓ Ověřený profil"' : ''}

   **Variant B (Factual/Professional):**
   - List specific services/offerings
   - Include age, location, availability
   - Professional tone
   - Mention "Bez zprostředkovatele" or "Reálné fotky"

   **Variant C (Benefits-Focused):**
   - Focus on advantages: "Diskrétnost", "Příjemná atmosféra"
   - Include "Přímý kontakt"
   - Mention "Profesionální přístup"
   - Add trust signals

3. **Keywords** (12-15 keywords)
   Mix these types:
   - Brand: "${data.name} ${data.city}"
   - Category + Location: "${categoryContext.split('\n')[0]} ${data.city}"
   - Long-tail: "diskrétní ${categoryContext.split('\n')[0]} ${data.city}"
   - Semantic: related terms from ${data.category}
   - Local: "${data.city} centrum", "${data.city.split(' ')[0]}"

4. **Quality Score** (0-100)
   Rate based on:
   - Title: keyword placement (25 pts)
   - Description: natural language + CTA (40 pts)
   - Keywords: relevance + diversity (20 pts)
   - Czech grammar perfection (15 pts)

**OUTPUT FORMAT (valid JSON only):**
{
  "title": "...",
  "descriptions": [
    "Variant A - Emotional...",
    "Variant B - Factual...",
    "Variant C - Benefits..."
  ],
  "keywords": "keyword1, keyword2, keyword3, ...",
  "quality_score": 85,
  "reasoning": "Brief explanation of SEO strategy used"
}

**QUALITY CHECKLIST:**
✓ Title struktura: Služba → Město → Jméno → EROSKO.CZ
✓ Title under 60 characters
✓ Each description 150-160 characters
✓ No generic "erotické služby" for businesses
✓ Perfect Czech grammar
✓ City mentioned in title + descriptions
✓ Specific service terms used
✓ Natural, engaging language
✓ Keywords are relevant + diverse

**POVINNÉ POŘADÍ V TITLE:**
1. Konkrétní služba (např. "Erotický salon", "Společnice", "BDSM")
2. Město (např. "Praha", "Brno")
3. Jméno profilu (+ věk)
4. | EROSKO.CZ

**GENERATE NOW:**`;
};

const getCategoryContext = (category: string, type: string): string => {
  const contexts: Record<string, string> = {
    HOLKY_NA_SEX: `
Main keywords: společnice, escort, holky na sex, call girl, VIP escort
Service for TITLE: "Společnice [město]", "Escort [město]", "VIP escort [město]"
Tone: Elegantní, profesionální, diskrétní
TITLE examples:
  - "Společnice Praha - Lucie 25 | EROSKO.CZ"
  - "Escort VIP Brno - Nikola 28 | EROSKO.CZ"
  - "Holky na sex Praha 5 - Sexy Markéta 24 | EROSKO.CZ"`,

    EROTICKE_MASERKY: `
Main keywords: erotická masáž, tantra masáž, masérka, body to body, nuru
Service for TITLE: "Erotická masáž [město]", "Tantra masáž [město]", "Erotické masáže [město]"
Tone: Profesionální, uklidňující, smyslná
TITLE examples:
  - "Erotická masáž Praha - Studio Relax | EROSKO.CZ"
  - "Tantra masáž Brno - Petra 29 | EROSKO.CZ"
  - "Erotické masáže Praha 7 - Thai Massage | EROSKO.CZ"`,

    DOMINA: `
Main keywords: domina, BDSM, femdom, mistress, dominance, SM
Service for TITLE: "Domina [město]", "BDSM [město]", "Mistress [město]"
Tone: Autoritativní, profesionální, respektující hranice
TITLE examples:
  - "BDSM Praha - Mistress Eva 32 | EROSKO.CZ"
  - "Domina Brno - Lady Sarah | EROSKO.CZ"
  - "BDSM studio Praha 1 - Dungeon Queen | EROSKO.CZ"`,

    DIGITALNI_SLUZBY: `
Main keywords: webcam, videochat, online, cam show, video call
Service for TITLE: "Webcam [město]", "Videochat [město]", "Online show [město]"
Tone: Moderní, přístupný, interaktivní
TITLE examples:
  - "Webcam Praha - Sexy Камела 23 | EROSKO.CZ"
  - "Videochat Brno - Karolína 26 | EROSKO.CZ"
  - "Online show Praha - Hot Natalie | EROSKO.CZ"`,

    EROTICKE_PODNIKY: `
Main keywords: ${type === 'Business' ? 'erotický podnik, erotický salon, klub, privát, studio, erotický bar' : 'erotické služby'}
Service for TITLE: ${type === 'Business'
  ? '"Erotický salon [město]", "Privát [město]", "Erotický klub [město]", "Studio [město]"'
  : '"Erotické služby [město]"'}
Tone: Profesionální, reprezentativní, důvěryhodný
${type === 'Business' ? `
⚠️⚠️⚠️ CRITICAL RULES:
- NEVER EVER use "Erotické služby" in TITLE!
- ALWAYS use SPECIFIC type: "Erotický salon", "Privát", "Klub", "Studio"
- Examples of CORRECT titles:
  • "Erotický salon Praha 5 - Sexy Club | EROSKO.CZ"
  • "Privát s holkami Brno - Club Paradise | EROSKO.CZ"
  • "Erotický klub Praha 1 - VIP Lounge | EROSKO.CZ"
  • "Studio Praha 7 - Tantra House | EROSKO.CZ"
- Examples of WRONG titles:
  ✗ "Erotické služby Praha - Sexy Club" (generic!)
  ✗ "Sexy Club - Erotický podnik Praha" (jméno první!)
  ✗ "Praha - Erotický salon Sexy Club" (město první!)
` : ''}`,
  };

  return contexts[category] || contexts.HOLKY_NA_SEX;
};

export const getPhotoAltPrompt = (data: ProfileData, photosCount: number): string => {
  return `${SEO_EXPERT_SYSTEM_PROMPT}

**TASK:** Generate SEO-optimized ALT text for ${photosCount} profile photos.

**Profile:** ${data.name}, ${data.age || 'N/A'} let, ${data.city}
**Category:** ${data.category}

**ALT TEXT REQUIREMENTS:**

1. **Format Variations** (rotate through these):
   - Photo 1: "${data.name}, ${data.age} let - [service] ${data.city} - Ověřený profil"
   - Photo 2: "Fotka ${data.name} - [service] ${data.city} - reálné fotky"
   - Photo 3: "${data.name} - profesionální ${data.city} - galerie"
   - Photo 4: "Profil ${data.name} - [service] ${data.city}"
   - (repeat pattern for more photos)

2. **CRITICAL RULES:**
   - Each ALT must be UNIQUE (no duplicates!)
   - Max 125 characters per ALT
   - Include keywords naturally
   - Perfect Czech grammar
   - Describe what's in the photo implicitly

3. **Quality Score** (0-100 per ALT):
   - Keyword inclusion (40 pts)
   - Length optimization (30 pts)
   - Uniqueness (30 pts)

**OUTPUT (valid JSON):**
{
  "photos": [
    {
      "id": "photo-id-1",
      "alt": "Generated ALT text here",
      "quality_score": 92
    },
    ...
  ]
}

Generate now:`;
};
