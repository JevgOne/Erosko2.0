'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Target,
  FileText,
  Image as ImageIcon,
  Code2,
  Link2,
  Search,
} from 'lucide-react';

interface DashboardStats {
  totalPages: number;
  optimizedPages: number;
  issuesFound: number;
  overallScore: number;
  scores: {
    metaTitles: number;
    metaDescriptions: number;
    contentQuality: number;
    schemaMarkup: number;
    imageOptimization: number;
  };
  issuesByCategory: {
    category: string;
    count: number;
    severity: 'critical' | 'warning' | 'info';
  }[];
  topIssues: {
    page: string;
    pageUrl: string;
    issue: string;
    severity: 'critical' | 'warning' | 'info';
  }[];
  recentlyOptimized: {
    page: string;
    pageUrl: string;
    score: number;
    optimizedAt: string;
  }[];
}

export default function DashboardTab() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/seo/dashboard');
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-primary-400" />
          <span>Loading SEO Dashboard...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20 text-gray-400">
        Failed to load dashboard data
      </div>
    );
  }

  // Calculate optimization percentage
  const optimizationPercent = stats.totalPages > 0
    ? Math.round((stats.optimizedPages / stats.totalPages) * 100)
    : 0;

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Get severity color
  const getSeverityColor = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'info': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    }
  };

  const getSeverityIcon = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'info': return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text mb-1">SEO Health Dashboard</h2>
          <p className="text-gray-400">Complete overview of your site's SEO performance</p>
        </div>
        <button
          onClick={fetchDashboard}
          disabled={refreshing}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Overall Score - Big Circle */}
      <div className="glass rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Overall SEO Health Score</h3>
            <p className="text-sm text-gray-400 mb-4">
              Based on meta tags, content quality, schema markup, and image optimization
            </p>

            {/* Progress Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Optimized Pages</span>
                <span className="font-medium">
                  {stats.optimizedPages} / {stats.totalPages} ({optimizationPercent}%)
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full transition-all"
                  style={{ width: `${optimizationPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Score Circle */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-40 h-40">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-gray-700"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - stats.overallScore / 100)}`}
                  className={`${getScoreColor(stats.overallScore)} transition-all duration-1000`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`text-4xl font-bold ${getScoreColor(stats.overallScore)}`}>
                  {stats.overallScore}
                </div>
                <div className="text-sm text-gray-400">/ 100</div>
              </div>
            </div>
            <div className={`text-sm font-medium ${getScoreColor(stats.overallScore)}`}>
              {stats.overallScore >= 90 && 'Excellent'}
              {stats.overallScore >= 70 && stats.overallScore < 90 && 'Good'}
              {stats.overallScore >= 50 && stats.overallScore < 70 && 'Fair'}
              {stats.overallScore < 50 && 'Needs Work'}
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Meta Titles */}
        <div className="glass rounded-xl p-6 card-hover">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-semibold text-sm">Meta Titles</h3>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <div className={`text-3xl font-bold ${getScoreColor(stats.scores.metaTitles)}`}>
              {stats.scores.metaTitles}
            </div>
            <div className="text-sm text-gray-400 mb-1">/25</div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`${getScoreBgColor(stats.scores.metaTitles)} h-2 rounded-full`}
              style={{ width: `${(stats.scores.metaTitles / 25) * 100}%` }}
            />
          </div>
        </div>

        {/* Meta Descriptions */}
        <div className="glass rounded-xl p-6 card-hover">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-semibold text-sm">Descriptions</h3>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <div className={`text-3xl font-bold ${getScoreColor(stats.scores.metaDescriptions)}`}>
              {stats.scores.metaDescriptions}
            </div>
            <div className="text-sm text-gray-400 mb-1">/25</div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`${getScoreBgColor(stats.scores.metaDescriptions)} h-2 rounded-full`}
              style={{ width: `${(stats.scores.metaDescriptions / 25) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Quality */}
        <div className="glass rounded-xl p-6 card-hover">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="font-semibold text-sm">Content</h3>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <div className={`text-3xl font-bold ${getScoreColor(stats.scores.contentQuality)}`}>
              {stats.scores.contentQuality}
            </div>
            <div className="text-sm text-gray-400 mb-1">/20</div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`${getScoreBgColor(stats.scores.contentQuality)} h-2 rounded-full`}
              style={{ width: `${(stats.scores.contentQuality / 20) * 100}%` }}
            />
          </div>
        </div>

        {/* Schema Markup */}
        <div className="glass rounded-xl p-6 card-hover">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <Code2 className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="font-semibold text-sm">Schema</h3>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <div className={`text-3xl font-bold ${getScoreColor(stats.scores.schemaMarkup)}`}>
              {stats.scores.schemaMarkup}
            </div>
            <div className="text-sm text-gray-400 mb-1">/15</div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`${getScoreBgColor(stats.scores.schemaMarkup)} h-2 rounded-full`}
              style={{ width: `${(stats.scores.schemaMarkup / 15) * 100}%` }}
            />
          </div>
        </div>

        {/* Image Optimization */}
        <div className="glass rounded-xl p-6 card-hover">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-pink-500/20">
              <ImageIcon className="w-5 h-5 text-pink-400" />
            </div>
            <h3 className="font-semibold text-sm">Images</h3>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <div className={`text-3xl font-bold ${getScoreColor(stats.scores.imageOptimization)}`}>
              {stats.scores.imageOptimization}
            </div>
            <div className="text-sm text-gray-400 mb-1">/15</div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`${getScoreBgColor(stats.scores.imageOptimization)} h-2 rounded-full`}
              style={{ width: `${(stats.scores.imageOptimization / 15) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Issues Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues by Category */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Issues by Category
          </h3>
          <div className="space-y-3">
            {stats.issuesByCategory.length > 0 ? (
              stats.issuesByCategory.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-3 glass rounded-lg">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(issue.severity)}
                    <span className="text-sm font-medium">{issue.category}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-sm border ${getSeverityColor(issue.severity)}`}>
                    {issue.count} issues
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                <p>No issues found! Great job!</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Issues */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-400" />
            Top Priority Issues
          </h3>
          <div className="space-y-3">
            {stats.topIssues.length > 0 ? (
              stats.topIssues.slice(0, 5).map((issue, index) => (
                <div key={index} className="p-3 glass rounded-lg">
                  <div className="flex items-start gap-2 mb-1">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1">
                      <div className="text-sm font-medium mb-1">{issue.page}</div>
                      <div className="text-xs text-gray-400">{issue.issue}</div>
                    </div>
                  </div>
                  <a
                    href={issue.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1 mt-2"
                  >
                    <Link2 className="w-3 h-3" />
                    View page
                  </a>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                <p>All clear! No critical issues.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recently Optimized */}
      {stats.recentlyOptimized.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Recently Optimized Pages
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.recentlyOptimized.map((page, index) => (
              <div key={index} className="glass rounded-lg p-4 card-hover">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium truncate flex-1">{page.page}</span>
                  <span className={`text-lg font-bold ml-2 ${getScoreColor(page.score)}`}>
                    {page.score}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  {new Date(page.optimizedAt).toLocaleDateString('cs-CZ')}
                </div>
                <a
                  href={page.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
                >
                  <Search className="w-3 h-3" />
                  View page
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
