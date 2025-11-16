'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Save,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle,
  Info,
  Target,
  Code2,
  BarChart3,
  Lightbulb,
} from 'lucide-react';
import { analyzeContent } from '@/lib/content-analyzer';

interface SEOEditModalEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    id: string;
    name: string;
    slug: string;
    city: string;
    age?: number;
    category?: string;
    description?: string;
    seoTitle: string | null;
    seoDescriptionA: string | null;
    seoDescriptionB: string | null;
    seoDescriptionC: string | null;
    seoKeywords: string | null;
    focusKeyword?: string | null;
    secondaryKeywords?: string | null;
    seoActiveVariant: string;
    seoManualOverride: boolean;
    seoQualityScore: number | null;
    schemaMarkup?: string | null;
    photos?: Array<{ id: string; alt: string | null; altQualityScore: number | null }>;
  };
  onSave: () => void;
}

export default function SEOEditModalEnhanced({
  isOpen,
  onClose,
  profile,
  onSave,
}: SEOEditModalEnhancedProps) {
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSchemaPreview, setShowSchemaPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'keywords' | 'schema' | 'analysis'>('basic');

  const [formData, setFormData] = useState({
    seoTitle: profile.seoTitle || '',
    seoDescriptionA: profile.seoDescriptionA || '',
    seoDescriptionB: profile.seoDescriptionB || '',
    seoDescriptionC: profile.seoDescriptionC || '',
    seoKeywords: profile.seoKeywords || '',
    focusKeyword: profile.focusKeyword || '',
    secondaryKeywords: profile.secondaryKeywords || '',
    seoActiveVariant: profile.seoActiveVariant || 'A',
    schemaMarkup: profile.schemaMarkup || '',
  });

  // Real-time content analysis
  const [contentAnalysis, setContentAnalysis] = useState<any>(null);

  useEffect(() => {
    if (formData.seoTitle || formData.seoDescriptionA) {
      const activeDesc =
        formData[`seoDescription${formData.seoActiveVariant}` as keyof typeof formData] || '';
      const analysis = analyzeContent(
        formData.seoTitle,
        activeDesc as string,
        profile.description || '',
        formData.focusKeyword,
        formData.secondaryKeywords.split(',').filter((k) => k.trim())
      );
      setContentAnalysis(analysis);
    }
  }, [formData, profile.description]);

  // Handle save
  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/seo-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id,
          seoData: {
            ...formData,
            seoManualOverride: true,
          },
          manualOverride: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('SEO data saved successfully!');
        onSave();
        onClose();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save SEO data');
    } finally {
      setSaving(false);
    }
  };

  // Generate schema markup
  const handleGenerateSchema = async () => {
    try {
      const response = await fetch('/api/seo/generate-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: profile.id }),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({ ...formData, schemaMarkup: JSON.stringify(data.schema, null, 2) });
        alert('Schema markup generated!');
      }
    } catch (error) {
      console.error('Generate schema failed:', error);
      alert('Failed to generate schema');
    }
  };

  if (!isOpen) return null;

  const activeDescription =
    formData[`seoDescription${formData.seoActiveVariant}` as keyof typeof formData] || '';

  // Keyword density calculation
  const calculateDensity = (keyword: string) => {
    if (!keyword || !formData.seoTitle) return 0;
    const text = `${formData.seoTitle} ${activeDescription}`.toLowerCase();
    const count = (text.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    const words = text.split(/\s+/).length;
    return words > 0 ? ((count / words) * 100).toFixed(2) : '0';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass rounded-xl max-w-5xl w-full my-8">
        {/* Header */}
        <div className="sticky top-0 bg-dark-900/95 backdrop-blur-sm border-b border-white/10 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold gradient-text mb-1">Advanced SEO Editor</h2>
            <p className="text-sm text-gray-400">{profile.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-white/10 px-6">
          <div className="flex gap-2">
            {[
              { id: 'basic', label: 'Basic SEO', icon: Eye },
              { id: 'keywords', label: 'Keywords', icon: Target },
              { id: 'schema', label: 'Schema', icon: Code2 },
              { id: 'analysis', label: 'Analysis', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-primary-400 border-b-2 border-primary-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-240px)] overflow-y-auto">
          {/* Basic SEO Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              {/* SEO Title */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  SEO Title <span className="text-gray-500">({formData.seoTitle.length}/60)</span>
                </label>
                <input
                  type="text"
                  maxLength={60}
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                  placeholder="SEO optimized title..."
                />
                <div className="mt-1 flex items-center gap-2">
                  {formData.seoTitle.length >= 40 && formData.seoTitle.length <= 60 && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Perfect length
                    </span>
                  )}
                  {formData.seoTitle.length < 40 && formData.seoTitle.length > 0 && (
                    <span className="text-xs text-yellow-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Too short
                    </span>
                  )}
                  {formData.seoTitle.length > 60 && (
                    <span className="text-xs text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Too long - will be cut off
                    </span>
                  )}
                </div>
              </div>

              {/* Active Variant */}
              <div>
                <label className="block text-sm font-medium mb-2">Active Description</label>
                <div className="flex gap-2">
                  {['A', 'B', 'C'].map((variant) => (
                    <button
                      key={variant}
                      onClick={() => setFormData({ ...formData, seoActiveVariant: variant })}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        formData.seoActiveVariant === variant
                          ? 'bg-primary-500 text-white'
                          : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
                      }`}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Variants */}
              {['A', 'B', 'C'].map((variant) => (
                <div key={variant}>
                  <label className="block text-sm font-medium mb-2">
                    Description {variant}{' '}
                    <span className="text-gray-500">
                      ({formData[`seoDescription${variant}` as keyof typeof formData]?.length || 0}/160)
                    </span>
                  </label>
                  <textarea
                    maxLength={160}
                    rows={3}
                    value={(formData[`seoDescription${variant}` as keyof typeof formData] as string) || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [`seoDescription${variant}`]: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none resize-none"
                    placeholder={`Variant ${variant}...`}
                  />
                </div>
              ))}

              {/* Google Preview */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Hide' : 'Show'} Google Preview
              </button>

              {showPreview && (
                <div className="glass rounded-lg p-4 border border-white/10">
                  <div className="text-xs text-gray-500 mb-1">https://erosko.cz/{profile.slug}</div>
                  <div className="text-xl text-blue-600 mb-1 font-normal hover:underline cursor-pointer">
                    {formData.seoTitle || 'No title'}
                  </div>
                  <div className="text-sm text-gray-300">{activeDescription || 'No description'}</div>
                </div>
              )}
            </div>
          )}

          {/* Keywords Tab */}
          {activeTab === 'keywords' && (
            <div className="space-y-4">
              {/* Focus Keyword */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Focus Keyword <span className="text-gray-400">(Primary)</span>
                </label>
                <input
                  type="text"
                  value={formData.focusKeyword}
                  onChange={(e) => setFormData({ ...formData, focusKeyword: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                  placeholder="e.g., escort Praha"
                />
                {formData.focusKeyword && (
                  <div className="mt-2 glass rounded-lg p-3">
                    <div className="text-sm text-gray-400 mb-2">Keyword Usage:</div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Density:</span>{' '}
                        <span className="text-primary-400 font-medium">
                          {calculateDensity(formData.focusKeyword)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Optimal:</span>{' '}
                        <span className="text-green-400">1-3%</span>
                      </div>
                      {parseFloat(calculateDensity(formData.focusKeyword)) >= 1 &&
                        parseFloat(calculateDensity(formData.focusKeyword)) <= 3 && (
                          <span className="text-green-400 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Perfect!
                          </span>
                        )}
                    </div>
                  </div>
                )}
              </div>

              {/* Secondary Keywords */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Secondary Keywords <span className="text-gray-400">(Comma separated)</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.secondaryKeywords}
                  onChange={(e) => setFormData({ ...formData, secondaryKeywords: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none resize-none"
                  placeholder="keyword1, keyword2, keyword3"
                />
                {formData.secondaryKeywords && (
                  <div className="mt-2 text-sm text-gray-400">
                    {formData.secondaryKeywords.split(',').filter((k) => k.trim()).length} keywords
                  </div>
                )}
              </div>

              {/* All Keywords */}
              <div>
                <label className="block text-sm font-medium mb-2">All SEO Keywords</label>
                <textarea
                  rows={4}
                  value={formData.seoKeywords}
                  onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none resize-none"
                  placeholder="All comma-separated keywords..."
                />
              </div>

              {/* Keyword Tips */}
              <div className="glass rounded-lg p-4 border border-blue-500/30 bg-blue-500/10">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-400 mb-2">Keyword Tips</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Use focus keyword in title and description</li>
                      <li>• Aim for 1-3% keyword density</li>
                      <li>• Include location-based keywords (city name)</li>
                      <li>• Add 2-5 secondary keywords for broader reach</li>
                      <li>• Use natural language - avoid keyword stuffing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schema Tab */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Schema.org Structured Data</h3>
                  <p className="text-sm text-gray-400">JSON-LD markup for search engines</p>
                </div>
                <button
                  onClick={handleGenerateSchema}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate
                </button>
              </div>

              <textarea
                rows={15}
                value={formData.schemaMarkup}
                onChange={(e) => setFormData({ ...formData, schemaMarkup: e.target.value })}
                className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none resize-none font-mono text-sm"
                placeholder='{"@context": "https://schema.org", ...}'
              />

              {formData.schemaMarkup && (
                <button
                  onClick={() => setShowSchemaPreview(!showSchemaPreview)}
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {showSchemaPreview ? 'Hide' : 'Show'} Formatted Preview
                </button>
              )}

              {showSchemaPreview && formData.schemaMarkup && (
                <div className="glass rounded-lg p-4">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(JSON.parse(formData.schemaMarkup), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === 'analysis' && contentAnalysis && (
            <div className="space-y-4">
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Content Score</h3>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-700"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - contentAnalysis.contentScore / 100)}`}
                        className="text-primary-400"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">{contentAnalysis.contentScore}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-2">
                      Word Count: <span className="text-white">{contentAnalysis.wordCount}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Readability: <span className="text-white">{contentAnalysis.readabilityScore}/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths */}
              {contentAnalysis.strengths.length > 0 && (
                <div className="glass rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {contentAnalysis.strengths.map((strength: string, i: number) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-green-400">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {contentAnalysis.warnings.length > 0 && (
                <div className="glass rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Warnings
                  </h4>
                  <ul className="space-y-2">
                    {contentAnalysis.warnings.map((warning: string, i: number) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-yellow-400">⚠</span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {contentAnalysis.suggestions.length > 0 && (
                <div className="glass rounded-lg p-4">
                  <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Suggestions
                  </h4>
                  <ul className="space-y-2">
                    {contentAnalysis.suggestions.map((suggestion: string, i: number) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-blue-400">→</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-dark-900/95 backdrop-blur-sm border-t border-white/10 p-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 gradient-primary rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
