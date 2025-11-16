/**
 * SEO Health Scorer for SEO Master
 * Calculates comprehensive SEO score (0-100) based on multiple factors
 */

import { analyzeContent } from './content-analyzer';

export interface SEOScoreBreakdown {
  overall: number;
  metaTitles: number;
  metaDescriptions: number;
  contentQuality: number;
  schemaMarkup: number;
  imageOptimization: number;
  keywordOptimization: number;
  technicalSEO: number;
}

export interface SEOIssue {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  fix: string;
}

export interface SEOHealthData {
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoDescriptionA?: string | null;
  seoDescriptionB?: string | null;
  seoDescriptionC?: string | null;
  seoKeywords?: string | null;
  focusKeyword?: string | null;
  secondaryKeywords?: string | null;
  description?: string | null;
  schemaMarkup?: string | null;
  photos?: Array<{ alt?: string | null; altQualityScore?: number | null }>;
  content?: string | null;
}

/**
 * Calculate comprehensive SEO score for a page
 */
export function calculateSEOScore(data: SEOHealthData): {
  score: SEOScoreBreakdown;
  issues: SEOIssue[];
  recommendations: string[];
} {
  const issues: SEOIssue[] = [];
  const recommendations: string[] = [];
  const score: SEOScoreBreakdown = {
    overall: 0,
    metaTitles: 0,
    metaDescriptions: 0,
    contentQuality: 0,
    schemaMarkup: 0,
    imageOptimization: 0,
    keywordOptimization: 0,
    technicalSEO: 0,
  };

  // 1. Meta Title Score (25 points)
  score.metaTitles = scoreMetaTitle(data.seoTitle, issues, recommendations);

  // 2. Meta Description Score (25 points)
  score.metaDescriptions = scoreMetaDescriptions(
    data.seoDescription,
    data.seoDescriptionA,
    data.seoDescriptionB,
    data.seoDescriptionC,
    issues,
    recommendations
  );

  // 3. Content Quality Score (20 points)
  score.contentQuality = scoreContentQuality(
    data.seoTitle || '',
    data.seoDescription || data.seoDescriptionA || '',
    data.description || data.content || '',
    issues,
    recommendations
  );

  // 4. Schema Markup Score (15 points)
  score.schemaMarkup = scoreSchemaMarkup(data.schemaMarkup, issues, recommendations);

  // 5. Image Optimization Score (15 points)
  score.imageOptimization = scoreImageOptimization(data.photos || [], issues, recommendations);

  // 6. Keyword Optimization Score (bonus points)
  score.keywordOptimization = scoreKeywordOptimization(
    data.focusKeyword,
    data.secondaryKeywords,
    data.seoKeywords,
    issues,
    recommendations
  );

  // 7. Technical SEO Score (bonus points)
  score.technicalSEO = scoreTechnicalSEO(data, issues, recommendations);

  // Calculate overall score (capped at 100)
  score.overall = Math.min(
    100,
    score.metaTitles +
      score.metaDescriptions +
      score.contentQuality +
      score.schemaMarkup +
      score.imageOptimization
  );

  return { score, issues, recommendations };
}

/**
 * Score Meta Title
 */
function scoreMetaTitle(
  title: string | null | undefined,
  issues: SEOIssue[],
  recommendations: string[]
): number {
  if (!title || title.trim().length === 0) {
    issues.push({
      severity: 'critical',
      category: 'Meta Title',
      message: 'Meta title is missing',
      fix: 'Add an SEO-optimized meta title (40-60 characters)',
    });
    recommendations.push('Generate SEO title with AI or write manually');
    return 0;
  }

  const length = title.length;
  let score = 0;

  if (length >= 40 && length <= 60) {
    score = 25;
  } else if (length >= 30 && length < 40) {
    score = 18;
    issues.push({
      severity: 'warning',
      category: 'Meta Title',
      message: `Title is too short (${length}/60 chars)`,
      fix: 'Extend title to 40-60 characters for better visibility',
    });
    recommendations.push('Add more descriptive keywords to title');
  } else if (length > 60 && length <= 70) {
    score = 20;
    issues.push({
      severity: 'warning',
      category: 'Meta Title',
      message: `Title is too long (${length}/60 chars)`,
      fix: 'Shorten title to 60 characters - Google will truncate it',
    });
    recommendations.push('Remove less important words from title');
  } else if (length > 70) {
    score = 15;
    issues.push({
      severity: 'critical',
      category: 'Meta Title',
      message: `Title is way too long (${length}/60 chars)`,
      fix: 'Drastically shorten title - only first 60 chars will show',
    });
    recommendations.push('Rewrite title to focus on most important keywords');
  } else {
    score = 10;
    issues.push({
      severity: 'warning',
      category: 'Meta Title',
      message: `Title is very short (${length}/60 chars)`,
      fix: 'Title should be at least 40 characters',
    });
  }

  return score;
}

/**
 * Score Meta Descriptions
 */
function scoreMetaDescriptions(
  mainDesc: string | null | undefined,
  variantA: string | null | undefined,
  variantB: string | null | undefined,
  variantC: string | null | undefined,
  issues: SEOIssue[],
  recommendations: string[]
): number {
  const descriptions = [mainDesc, variantA, variantB, variantC].filter(Boolean) as string[];

  if (descriptions.length === 0) {
    issues.push({
      severity: 'critical',
      category: 'Meta Description',
      message: 'Meta description is missing',
      fix: 'Add compelling meta description (150-160 characters)',
    });
    recommendations.push('Generate meta descriptions with AI');
    return 0;
  }

  let totalScore = 0;
  let validDescriptions = 0;

  descriptions.forEach((desc, index) => {
    const length = desc.length;
    let descScore = 0;

    if (length >= 150 && length <= 160) {
      descScore = 25;
      validDescriptions++;
    } else if (length >= 140 && length < 150) {
      descScore = 20;
      issues.push({
        severity: 'info',
        category: 'Meta Description',
        message: `Description ${index > 0 ? 'variant ' + String.fromCharCode(64 + index) : ''} is slightly short (${length}/160)`,
        fix: 'Add a few more characters to reach 150-160',
      });
    } else if (length > 160 && length <= 170) {
      descScore = 22;
      issues.push({
        severity: 'warning',
        category: 'Meta Description',
        message: `Description ${index > 0 ? 'variant ' + String.fromCharCode(64 + index) : ''} is too long (${length}/160)`,
        fix: 'Shorten to 160 characters to avoid truncation',
      });
    } else if (length < 140) {
      descScore = 15;
      issues.push({
        severity: 'warning',
        category: 'Meta Description',
        message: `Description ${index > 0 ? 'variant ' + String.fromCharCode(64 + index) : ''} is too short (${length}/160)`,
        fix: 'Expand description with more details',
      });
      recommendations.push('Add call-to-action and key benefits');
    } else {
      descScore = 18;
      issues.push({
        severity: 'warning',
        category: 'Meta Description',
        message: `Description ${index > 0 ? 'variant ' + String.fromCharCode(64 + index) : ''} is way too long (${length}/160)`,
        fix: 'Google will cut it off - keep under 160 chars',
      });
    }

    totalScore += descScore;
  });

  // Bonus for having multiple variants (A/B testing)
  if (descriptions.length >= 3) {
    issues.push({
      severity: 'info',
      category: 'A/B Testing',
      message: 'Great! You have multiple description variants for A/B testing',
      fix: 'Track performance and optimize based on CTR',
    });
  } else if (descriptions.length < 3) {
    recommendations.push('Create 3 description variants for A/B testing');
  }

  return Math.round(totalScore / Math.max(descriptions.length, 1));
}

/**
 * Score Content Quality
 */
function scoreContentQuality(
  title: string,
  description: string,
  content: string,
  issues: SEOIssue[],
  recommendations: string[]
): number {
  const analysis = analyzeContent(title, description, content);

  let score = 0;

  // Word count check
  if (analysis.wordCount >= 300) {
    score += 10;
  } else if (analysis.wordCount >= 150) {
    score += 6;
    issues.push({
      severity: 'warning',
      category: 'Content',
      message: `Content is short (${analysis.wordCount} words)`,
      fix: 'Aim for at least 300 words for better SEO',
    });
    recommendations.push('Expand content with more details and keywords');
  } else {
    score += 3;
    issues.push({
      severity: 'critical',
      category: 'Content',
      message: `Content is too short (${analysis.wordCount} words)`,
      fix: 'Add substantial content (300+ words recommended)',
    });
  }

  // Readability check
  if (analysis.readabilityScore >= 60) {
    score += 10;
  } else if (analysis.readabilityScore >= 40) {
    score += 6;
    issues.push({
      severity: 'info',
      category: 'Readability',
      message: `Readability could be better (${analysis.readabilityScore}/100)`,
      fix: 'Use shorter sentences and simpler words',
    });
  } else {
    score += 3;
    issues.push({
      severity: 'warning',
      category: 'Readability',
      message: `Content is difficult to read (${analysis.readabilityScore}/100)`,
      fix: 'Simplify language and break into shorter sentences',
    });
  }

  return score;
}

/**
 * Score Schema Markup
 */
function scoreSchemaMarkup(
  schemaMarkup: string | null | undefined,
  issues: SEOIssue[],
  recommendations: string[]
): number {
  if (!schemaMarkup || schemaMarkup.trim().length === 0) {
    issues.push({
      severity: 'warning',
      category: 'Schema Markup',
      message: 'No structured data found',
      fix: 'Add Schema.org markup for better search visibility',
    });
    recommendations.push('Generate schema markup (Person/LocalBusiness)');
    return 0;
  }

  try {
    const schema = JSON.parse(schemaMarkup);

    // Check if valid schema
    if (schema['@context'] && schema['@type']) {
      return 15;
    } else {
      issues.push({
        severity: 'warning',
        category: 'Schema Markup',
        message: 'Schema markup is invalid',
        fix: 'Fix schema structure (@context and @type required)',
      });
      return 5;
    }
  } catch (error) {
    issues.push({
      severity: 'warning',
      category: 'Schema Markup',
      message: 'Schema markup is malformed JSON',
      fix: 'Regenerate valid schema markup',
    });
    return 0;
  }
}

/**
 * Score Image Optimization
 */
function scoreImageOptimization(
  photos: Array<{ alt?: string | null; altQualityScore?: number | null }>,
  issues: SEOIssue[],
  recommendations: string[]
): number {
  if (photos.length === 0) {
    issues.push({
      severity: 'info',
      category: 'Images',
      message: 'No images found',
      fix: 'Add images to improve user engagement',
    });
    recommendations.push('Upload high-quality images with ALT text');
    return 15; // No penalty if no images
  }

  const photosWithAlt = photos.filter((p) => p.alt && p.alt.trim().length > 0);
  const altCoverage = (photosWithAlt.length / photos.length) * 100;

  let score = 0;

  if (altCoverage === 100) {
    score = 15;
  } else if (altCoverage >= 80) {
    score = 12;
    issues.push({
      severity: 'info',
      category: 'Image ALT',
      message: `${photos.length - photosWithAlt.length} images missing ALT text`,
      fix: 'Add descriptive ALT text to all images',
    });
  } else if (altCoverage >= 50) {
    score = 8;
    issues.push({
      severity: 'warning',
      category: 'Image ALT',
      message: `${photos.length - photosWithAlt.length} images missing ALT text`,
      fix: 'ALT text improves accessibility and SEO',
    });
    recommendations.push('Bulk edit images to add ALT text');
  } else {
    score = 4;
    issues.push({
      severity: 'critical',
      category: 'Image ALT',
      message: `Most images (${photos.length - photosWithAlt.length}/${photos.length}) lack ALT text`,
      fix: 'Add ALT text to all images immediately',
    });
    recommendations.push('Use AI to generate ALT text for images');
  }

  // Check ALT quality scores
  const avgAltQuality =
    photosWithAlt.reduce((sum, p) => sum + (p.altQualityScore || 0), 0) / Math.max(photosWithAlt.length, 1);

  if (avgAltQuality < 70 && photosWithAlt.length > 0) {
    issues.push({
      severity: 'info',
      category: 'Image ALT Quality',
      message: `ALT text quality is low (avg ${Math.round(avgAltQuality)}/100)`,
      fix: 'Improve ALT text with more descriptive content',
    });
  }

  return score;
}

/**
 * Score Keyword Optimization
 */
function scoreKeywordOptimization(
  focusKeyword: string | null | undefined,
  secondaryKeywords: string | null | undefined,
  seoKeywords: string | null | undefined,
  issues: SEOIssue[],
  recommendations: string[]
): number {
  let score = 0;

  if (!focusKeyword || focusKeyword.trim().length === 0) {
    issues.push({
      severity: 'info',
      category: 'Keywords',
      message: 'No focus keyword set',
      fix: 'Set a primary focus keyword to optimize for',
    });
    recommendations.push('Research and set focus keyword for this page');
  } else {
    score += 5;
  }

  const secondaryKw = secondaryKeywords ? secondaryKeywords.split(',').filter((k) => k.trim()) : [];
  if (secondaryKw.length === 0) {
    issues.push({
      severity: 'info',
      category: 'Keywords',
      message: 'No secondary keywords set',
      fix: 'Add 2-5 secondary keywords for broader targeting',
    });
  } else if (secondaryKw.length >= 2) {
    score += 3;
  }

  const allKeywords = seoKeywords ? seoKeywords.split(',').filter((k) => k.trim()) : [];
  if (allKeywords.length >= 12 && allKeywords.length <= 15) {
    score += 2;
  } else if (allKeywords.length < 12) {
    recommendations.push('Add more long-tail keywords (12-15 total)');
  }

  return score;
}

/**
 * Score Technical SEO
 */
function scoreTechnicalSEO(data: SEOHealthData, issues: SEOIssue[], recommendations: string[]): number {
  let score = 0;

  // Check for OG Image
  // Note: ogImageUrl not in SEOHealthData interface, but we can add it if needed
  // For now, skipping this check

  return score;
}

/**
 * Get SEO health grade from score
 */
export function getSEOGrade(score: number): {
  grade: string;
  color: string;
  label: string;
} {
  if (score >= 90) {
    return { grade: 'A+', color: 'text-green-400', label: 'Excellent' };
  } else if (score >= 80) {
    return { grade: 'A', color: 'text-green-400', label: 'Very Good' };
  } else if (score >= 70) {
    return { grade: 'B', color: 'text-blue-400', label: 'Good' };
  } else if (score >= 60) {
    return { grade: 'C', color: 'text-yellow-400', label: 'Fair' };
  } else if (score >= 50) {
    return { grade: 'D', color: 'text-orange-400', label: 'Poor' };
  } else {
    return { grade: 'F', color: 'text-red-400', label: 'Critical' };
  }
}
