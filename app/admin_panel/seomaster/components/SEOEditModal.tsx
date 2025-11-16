'use client';

import { useState } from 'react';
import { X, Save, RefreshCw, Eye } from 'lucide-react';

interface SEOEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    id: string;
    name: string;
    slug: string;
    seoTitle: string | null;
    seoDescriptionA: string | null;
    seoDescriptionB: string | null;
    seoDescriptionC: string | null;
    seoKeywords: string | null;
    seoActiveVariant: string;
    seoManualOverride: boolean;
  };
  onSave: () => void;
}

export default function SEOEditModal({ isOpen, onClose, profile, onSave }: SEOEditModalProps) {
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    seoTitle: profile.seoTitle || '',
    seoDescriptionA: profile.seoDescriptionA || '',
    seoDescriptionB: profile.seoDescriptionB || '',
    seoDescriptionC: profile.seoDescriptionC || '',
    seoKeywords: profile.seoKeywords || '',
    seoActiveVariant: profile.seoActiveVariant || 'A',
    seoManualOverride: profile.seoManualOverride || false,
  });

  // Handle save
  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/seo-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id,
          ...formData,
          seoManualOverride: true, // Mark as manual edit
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ SEO data saved successfully!');
        onSave();
        onClose();
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('❌ Failed to save SEO data');
    } finally {
      setSaving(false);
    }
  };

  // Handle regenerate
  const handleRegenerate = async () => {
    if (!confirm('Regenerate SEO data? This will overwrite current values.')) {
      return;
    }

    try {
      setRegenerating(true);
      const response = await fetch('/api/admin/seo-regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileIds: [profile.id],
          force: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ SEO regenerated successfully!');
        onSave();
        onClose();
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Regenerate failed:', error);
      alert('❌ Failed to regenerate SEO');
    } finally {
      setRegenerating(false);
    }
  };

  if (!isOpen) return null;

  // Get active description
  const activeDescription = formData[`seoDescription${formData.seoActiveVariant}` as keyof typeof formData] as string;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-dark-900/95 backdrop-blur-sm border-b border-white/10 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold gradient-text mb-1">Edit SEO</h2>
            <p className="text-sm text-gray-400">{profile.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
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
              className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              placeholder="SEO optimized title..."
            />
          </div>

          {/* Active Variant Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Active Description Variant</label>
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
                  Variant {variant}
                </button>
              ))}
            </div>
          </div>

          {/* Description Variants */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Description A (Emotional) <span className="text-gray-500">({formData.seoDescriptionA.length}/160)</span>
              </label>
              <textarea
                maxLength={160}
                rows={3}
                value={formData.seoDescriptionA}
                onChange={(e) => setFormData({ ...formData, seoDescriptionA: e.target.value })}
                className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none"
                placeholder="Emotional variant with emoji..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description B (Factual) <span className="text-gray-500">({formData.seoDescriptionB.length}/160)</span>
              </label>
              <textarea
                maxLength={160}
                rows={3}
                value={formData.seoDescriptionB}
                onChange={(e) => setFormData({ ...formData, seoDescriptionB: e.target.value })}
                className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none"
                placeholder="Factual description with services..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description C (Benefits) <span className="text-gray-500">({formData.seoDescriptionC.length}/160)</span>
              </label>
              <textarea
                maxLength={160}
                rows={3}
                value={formData.seoDescriptionC}
                onChange={(e) => setFormData({ ...formData, seoDescriptionC: e.target.value })}
                className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none"
                placeholder="Benefits focused (Bez zprostředkovatele, Přímý kontakt)..."
              />
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Keywords <span className="text-gray-500">(comma separated)</span>
            </label>
            <textarea
              rows={3}
              value={formData.seoKeywords}
              onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
              className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none"
              placeholder="keyword1, keyword2, keyword3, ..."
            />
          </div>

          {/* Google Preview */}
          <div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors mb-3"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Hide' : 'Show'} Google Preview
            </button>

            {showPreview && (
              <div className="glass rounded-lg p-4 border border-white/10">
                <div className="max-w-xl">
                  {/* Google Snippet */}
                  <div className="text-xs text-gray-500 mb-1">
                    https://erosko.cz/{profile.slug}
                  </div>
                  <div className="text-xl text-blue-600 mb-1 font-normal hover:underline cursor-pointer">
                    {formData.seoTitle || 'No title'}
                  </div>
                  <div className="text-sm text-gray-300">
                    {activeDescription || 'No description'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Manual Override Badge */}
          {formData.seoManualOverride && (
            <div className="glass rounded-lg p-3 border border-blue-500/30 bg-blue-500/10">
              <div className="text-sm text-blue-400">
                ✏️ This profile has manual SEO overrides
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-dark-900/95 backdrop-blur-sm border-t border-white/10 p-6 flex items-center justify-between">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
            Regenerate with AI
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
