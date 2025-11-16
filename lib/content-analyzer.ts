/**
 * Content Analyzer for SEO Master
 * Analyzes content quality, readability, keyword density, and provides recommendations
 */

interface ContentAnalysisResult {
  wordCount: number;
  characterCount: number;
  keywordDensity: { [keyword: string]: number };
  readabilityScore: number;
  contentScore: number;
  suggestions: string[];
  warnings: string[];
  strengths: string[];
}

/**
 * Calculate keyword density in text
 */
export function calculateKeywordDensity(text: string, keywords: string[]): { [keyword: string]: number } {
  const normalizedText = text.toLowerCase();
  const words = normalizedText.split(/\s+/);
  const totalWords = words.length;
  const density: { [keyword: string]: number } = {};

  keywords.forEach((keyword) => {
    const normalizedKeyword = keyword.toLowerCase().trim();
    let count = 0;

    // Count exact keyword occurrences
    const keywordWords = normalizedKeyword.split(/\s+/);
    if (keywordWords.length === 1) {
      // Single word keyword
      count = words.filter((word) => word === normalizedKeyword).length;
    } else {
      // Multi-word keyword (phrase)
      const regex = new RegExp(`\\b${normalizedKeyword.replace(/\s+/g, '\\s+')}\\b`, 'gi');
      const matches = normalizedText.match(regex);
      count = matches ? matches.length : 0;
    }

    density[keyword] = totalWords > 0 ? (count / totalWords) * 100 : 0;
  });

  return density;
}

/**
 * Calculate Flesch Reading Ease Score (Czech-adapted)
 * Higher score = easier to read (0-100)
 * Adapted for Czech language characteristics
 */
export function calculateReadabilityScore(text: string): number {
  if (!text || text.length === 0) return 0;

  // Count sentences
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = sentences.length || 1;

  // Count words
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length || 1;

  // Count syllables (approximation for Czech)
  let syllableCount = 0;
  words.forEach((word) => {
    // Count vowels as approximation for syllables in Czech
    const vowels = word.match(/[aeiouyáéíóúůýě]/gi);
    syllableCount += vowels ? vowels.length : 1;
  });

  // Flesch Reading Ease formula (adapted)
  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllableCount / wordCount;

  const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

  // Clamp between 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Analyze content length and structure
 */
export function analyzeContentLength(text: string): {
  wordCount: number;
  characterCount: number;
  score: number;
  feedback: string;
} {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;
  const characterCount = text.length;

  let score = 0;
  let feedback = '';

  // Optimal word count for SEO: 300-1000 words
  if (wordCount < 150) {
    score = 30;
    feedback = 'Content is too short. Add more detail (aim for 300+ words).';
  } else if (wordCount < 300) {
    score = 60;
    feedback = 'Content is acceptable but could be longer for better SEO.';
  } else if (wordCount <= 1000) {
    score = 100;
    feedback = 'Excellent content length for SEO!';
  } else if (wordCount <= 1500) {
    score = 85;
    feedback = 'Good content length, but ensure it stays focused.';
  } else {
    score = 70;
    feedback = 'Content is very long. Consider breaking into sections.';
  }

  return { wordCount, characterCount, score, feedback };
}

/**
 * Extract potential LSI (Latent Semantic Indexing) keywords
 * These are contextually related terms
 */
export function extractLSIKeywords(text: string, primaryKeyword: string): string[] {
  const normalizedText = text.toLowerCase();
  const words = normalizedText.split(/\s+/).filter((w) => w.length > 3);

  // Remove stop words (Czech)
  const stopWords = [
    'a', 'aby', 'ale', 'ani', 'aniž', 'až', 'bez', 'bude', 'budem', 'budeš', 'by', 'byl', 'byla',
    'byli', 'bylo', 'být', 'co', 'což', 'další', 'do', 'ho', 'i', 'já', 'jak', 'jako', 'je',
    'jeho', 'její', 'jejich', 'jen', 'jenom', 'jestli', 'jestliže', 'ještě', 'jí', 'již', 'jsem',
    'jsi', 'jsme', 'jsou', 'jste', 'k', 'kam', 'kde', 'kdo', 'kdy', 'když', 'ke', 'která', 'které',
    'který', 'ku', 'má', 'máte', 'mé', 'mí', 'mít', 'mně', 'mnou', 'mnohý', 'moc', 'mohl', 'mohou',
    'moje', 'moji', 'možná', 'můj', 'my', 'na', 'nad', 'nám', 'námi', 'naše', 'naši', 'ne', 'nebo',
    'nebyl', 'nebylo', 'nech', 'nechat', 'nějak', 'nějací', 'nejsi', 'není', 'nějak', 'nejsou',
    'nemají', 'nemá', 'než', 'nic', 'ním', 'nimi', 'nový', 'o', 'od', 'ohledně', 'on', 'ona', 'oni',
    'ono', 'ony', 'pak', 'po', 'pod', 'podle', 'pokud', 'pouze', 'pořád', 'potom', 'pozdě', 'před',
    'přede', 'přes', 'přese', 'při', 'pro', 's', 'se', 'si', 'sice', 'jsou', 'skoro', 'smějí', 'smí',
    'snad', 'spolu', 'stále', 'ta', 'tady', 'tak', 'takhle', 'taky', 'takže', 'tam', 'tamhle', 'tamto',
    'tě', 'tebe', 'tebou', 'ted', 'tedy', 'ten', 'tento', 'té', 'těm', 'těmi', 'ti', 'tím', 'tímto',
    'to', 'tobě', 'tohle', 'toto', 'tu', 'tuto', 'tvá', 'tvé', 'tvoje', 'tvůj', 'ty', 'také', 'u',
    'už', 'v', 've', 'vám', 'vámi', 'váš', 'vaše', 'vaši', 've', 'vedle', 'velmi', 'více', 'vlastně',
    'všechen', 'všechno', 'všichni', 'vůbec', 'vy', 'vždy', 'z', 'za', 'zač', 'zatímco', 'ze', 'zpět',
    'že',
  ];

  const filteredWords = words.filter((word) => !stopWords.includes(word));

  // Count word frequency
  const frequency: { [word: string]: number } = {};
  filteredWords.forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Sort by frequency and return top keywords
  const sortedKeywords = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map((entry) => entry[0]);

  return sortedKeywords;
}

/**
 * Find internal linking opportunities
 */
export function findInternalLinkingOpportunities(
  content: string,
  availablePages: Array<{ title: string; url: string; keywords: string[] }>
): Array<{ keyword: string; suggestedPage: string; url: string }> {
  const normalizedContent = content.toLowerCase();
  const opportunities: Array<{ keyword: string; suggestedPage: string; url: string }> = [];

  availablePages.forEach((page) => {
    page.keywords.forEach((keyword) => {
      const normalizedKeyword = keyword.toLowerCase().trim();
      if (normalizedContent.includes(normalizedKeyword)) {
        opportunities.push({
          keyword,
          suggestedPage: page.title,
          url: page.url,
        });
      }
    });
  });

  return opportunities.slice(0, 5); // Return top 5 opportunities
}

/**
 * Complete content analysis
 */
export function analyzeContent(
  title: string,
  description: string,
  content: string,
  focusKeyword?: string,
  secondaryKeywords?: string[]
): ContentAnalysisResult {
  const fullText = `${title} ${description} ${content}`;

  // Word and character count
  const words = fullText.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;
  const characterCount = fullText.length;

  // Keyword density
  const allKeywords = [focusKeyword, ...(secondaryKeywords || [])].filter(Boolean) as string[];
  const keywordDensity = calculateKeywordDensity(fullText, allKeywords);

  // Readability
  const readabilityScore = calculateReadabilityScore(fullText);

  // Content length analysis
  const lengthAnalysis = analyzeContentLength(fullText);

  // Calculate overall content score
  let contentScore = 0;
  const suggestions: string[] = [];
  const warnings: string[] = [];
  const strengths: string[] = [];

  // Title checks (25 points)
  if (title.length >= 40 && title.length <= 60) {
    contentScore += 25;
    strengths.push('Title length is optimal');
  } else if (title.length < 40) {
    contentScore += 10;
    warnings.push('Title is too short');
    suggestions.push('Extend title to 40-60 characters');
  } else {
    contentScore += 15;
    warnings.push('Title is too long');
    suggestions.push('Shorten title to 60 characters or less');
  }

  // Description checks (25 points)
  if (description.length >= 150 && description.length <= 160) {
    contentScore += 25;
    strengths.push('Description length is perfect');
  } else if (description.length < 150) {
    contentScore += 15;
    warnings.push('Description is too short');
    suggestions.push('Extend description to 150-160 characters');
  } else {
    contentScore += 20;
    warnings.push('Description is slightly long');
  }

  // Content length (20 points)
  const lengthScore = (lengthAnalysis.score / 100) * 20;
  contentScore += lengthScore;
  if (lengthScore < 15) {
    warnings.push(lengthAnalysis.feedback);
    suggestions.push('Add more content for better SEO');
  } else {
    strengths.push(lengthAnalysis.feedback);
  }

  // Keyword density (15 points)
  if (focusKeyword) {
    const density = keywordDensity[focusKeyword] || 0;
    if (density >= 1 && density <= 3) {
      contentScore += 15;
      strengths.push(`Focus keyword density is optimal (${density.toFixed(2)}%)`);
    } else if (density < 1) {
      contentScore += 5;
      warnings.push(`Focus keyword "${focusKeyword}" appears too rarely (${density.toFixed(2)}%)`);
      suggestions.push(`Use "${focusKeyword}" more (aim for 1-3% density)`);
    } else {
      contentScore += 8;
      warnings.push(`Focus keyword "${focusKeyword}" is overused (${density.toFixed(2)}%)`);
      suggestions.push('Reduce keyword density to avoid over-optimization');
    }
  }

  // Readability (15 points)
  if (readabilityScore >= 60) {
    contentScore += 15;
    strengths.push(`Good readability score (${readabilityScore}/100)`);
  } else if (readabilityScore >= 40) {
    contentScore += 10;
    suggestions.push('Improve readability with shorter sentences');
  } else {
    contentScore += 5;
    warnings.push('Content is difficult to read');
    suggestions.push('Use simpler language and shorter sentences');
  }

  return {
    wordCount,
    characterCount,
    keywordDensity,
    readabilityScore,
    contentScore: Math.round(contentScore),
    suggestions,
    warnings,
    strengths,
  };
}

/**
 * Check for duplicate content issues
 */
export function checkDuplicateContent(
  text: string,
  existingTexts: string[],
  threshold: number = 0.7
): { isDuplicate: boolean; similarity: number; duplicateIndex?: number } {
  const normalizedText = text.toLowerCase().trim();

  for (let i = 0; i < existingTexts.length; i++) {
    const normalizedExisting = existingTexts[i].toLowerCase().trim();
    const similarity = calculateSimilarity(normalizedText, normalizedExisting);

    if (similarity >= threshold) {
      return { isDuplicate: true, similarity, duplicateIndex: i };
    }
  }

  return { isDuplicate: false, similarity: 0 };
}

/**
 * Calculate text similarity (simple algorithm)
 */
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.split(/\s+/));
  const words2 = new Set(text2.split(/\s+/));

  const intersection = new Set([...words1].filter((word) => words2.has(word)));
  const union = new Set([...words1, ...words2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}
