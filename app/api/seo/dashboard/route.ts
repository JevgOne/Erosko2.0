import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { calculateSEOScore, getSEOGrade } from '@/lib/seo-scorer';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch all profiles
    const profiles = await prisma.profile.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        seoTitle: true,
        seoDescription: true,
        seoDescriptionA: true,
        seoDescriptionB: true,
        seoDescriptionC: true,
        seoKeywords: true,
        focusKeyword: true,
        secondaryKeywords: true,
        description: true,
        schemaMarkup: true,
        seoScore: true,
        seoLastGenerated: true,
        photos: {
          select: {
            alt: true,
            altQualityScore: true,
          },
        },
      },
    });

    // Fetch all businesses
    const businesses = await prisma.business.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        focusKeyword: true,
        secondaryKeywords: true,
        description: true,
        schemaMarkup: true,
        seoScore: true,
        seoLastGenerated: true,
        photos: {
          select: {
            alt: true,
            altQualityScore: true,
          },
        },
      },
    });

    // Fetch all static pages
    const staticPages = await prisma.staticPage.findMany({
      select: {
        id: true,
        path: true,
        seoTitle: true,
        seoDescription: true,
        keywords: true,
        focusKeyword: true,
        secondaryKeywords: true,
        content: true,
        schemaMarkup: true,
        seoScore: true,
        lastAnalyzed: true,
      },
    });

    const allPages = [
      ...profiles.map((p) => ({ ...p, type: 'profile', pageUrl: `/${p.slug}` })),
      ...businesses.map((b) => ({ ...b, type: 'business', pageUrl: `/${b.slug}` })),
      ...staticPages.map((s) => ({ ...s, type: 'static', pageUrl: s.path, name: s.path })),
    ];

    const totalPages = allPages.length;

    // Calculate scores for all pages
    let totalScore = 0;
    let optimizedPages = 0;
    const issuesFound: any[] = [];
    const topIssues: any[] = [];
    const recentlyOptimized: any[] = [];

    const scoreBreakdown = {
      metaTitles: 0,
      metaDescriptions: 0,
      contentQuality: 0,
      schemaMarkup: 0,
      imageOptimization: 0,
    };

    allPages.forEach((page: any) => {
      const { score, issues } = calculateSEOScore({
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        seoDescriptionA: page.seoDescriptionA,
        seoDescriptionB: page.seoDescriptionB,
        seoDescriptionC: page.seoDescriptionC,
        seoKeywords: page.seoKeywords,
        focusKeyword: page.focusKeyword,
        secondaryKeywords: page.secondaryKeywords,
        description: page.description || page.content,
        schemaMarkup: page.schemaMarkup,
        photos: page.photos || [],
      });

      totalScore += score.overall;
      scoreBreakdown.metaTitles += score.metaTitles;
      scoreBreakdown.metaDescriptions += score.metaDescriptions;
      scoreBreakdown.contentQuality += score.contentQuality;
      scoreBreakdown.schemaMarkup += score.schemaMarkup;
      scoreBreakdown.imageOptimization += score.imageOptimization;

      if (score.overall >= 70) {
        optimizedPages++;
      }

      // Collect critical issues
      issues.forEach((issue) => {
        if (issue.severity === 'critical') {
          topIssues.push({
            page: page.name,
            pageUrl: page.pageUrl,
            issue: issue.message,
            severity: issue.severity,
          });
        }
      });

      issuesFound.push(...issues);

      // Recently optimized
      if (page.seoLastGenerated || page.lastAnalyzed) {
        recentlyOptimized.push({
          page: page.name,
          pageUrl: page.pageUrl,
          score: score.overall,
          optimizedAt: page.seoLastGenerated || page.lastAnalyzed,
        });
      }
    });

    const avgScore = totalPages > 0 ? Math.round(totalScore / totalPages) : 0;

    // Average score breakdown
    Object.keys(scoreBreakdown).forEach((key) => {
      scoreBreakdown[key as keyof typeof scoreBreakdown] = totalPages > 0
        ? Math.round(scoreBreakdown[key as keyof typeof scoreBreakdown] / totalPages)
        : 0;
    });

    // Group issues by category
    const issuesByCategory: { [category: string]: { count: number; severity: string } } = {};
    issuesFound.forEach((issue) => {
      if (!issuesByCategory[issue.category]) {
        issuesByCategory[issue.category] = { count: 0, severity: issue.severity };
      }
      issuesByCategory[issue.category].count++;
      // Keep highest severity
      if (
        issue.severity === 'critical' ||
        (issue.severity === 'warning' && issuesByCategory[issue.category].severity === 'info')
      ) {
        issuesByCategory[issue.category].severity = issue.severity;
      }
    });

    const issuesByCategoryArray = Object.entries(issuesByCategory).map(([category, data]) => ({
      category,
      count: data.count,
      severity: data.severity as 'critical' | 'warning' | 'info',
    }));

    // Sort recently optimized by date
    recentlyOptimized.sort(
      (a, b) => new Date(b.optimizedAt).getTime() - new Date(a.optimizedAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: {
        totalPages,
        optimizedPages,
        issuesFound: issuesFound.length,
        overallScore: avgScore,
        scores: scoreBreakdown,
        issuesByCategory: issuesByCategoryArray,
        topIssues: topIssues.slice(0, 10),
        recentlyOptimized: recentlyOptimized.slice(0, 6),
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate dashboard' }, { status: 500 });
  }
}
