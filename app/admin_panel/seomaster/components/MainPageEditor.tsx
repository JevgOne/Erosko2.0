'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, Globe, FileText, Hash, Type, AlignLeft } from 'lucide-react';

interface MainPageEditorProps {
  pageId: string;
  initialData: {
    path: string;
    type: string;
    seoTitle: string;
    seoDescription: string;
    h1: string;
    keywords: string;
    focusKeyword: string;
    secondaryKeywords: string;
    content: string;
    published: boolean;
    seoScore: number;
  };
}

export default function MainPageEditor({ pageId, initialData }: MainPageEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(initialData);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch(`/api/admin/static-pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Změny úspěšně uloženy!');
        router.push('/admin_panel/seomaster?tab=main-pages');
        router.refresh();
      } else {
        alert('Chyba při ukládání: ' + (data.error || 'Neznámá chyba'));
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Chyba při ukládání změn');
    } finally {
      setSaving(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CATEGORY: 'Kategorie',
      CITY: 'Město',
      COMBINATION: 'Kombinace',
      FILTER: 'Filtr',
      CUSTOM: 'Vlastní',
      OTHER: 'Ostatní',
    };
    return labels[type] || type;
  };

  const getTitleLength = () => formData.seoTitle.length;
  const getDescriptionLength = () => formData.seoDescription.length;

  const getTitleColor = () => {
    const len = getTitleLength();
    if (len >= 50 && len <= 60) return 'text-green-400';
    if (len >= 40 && len <= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getDescriptionColor = () => {
    const len = getDescriptionLength();
    if (len >= 150 && len <= 160) return 'text-green-400';
    if (len >= 120 && len <= 200) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-dark p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin_panel/seomaster?tab=main-pages')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Editace SEO Metadat</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-gray-400 font-mono text-sm">{formData.path}</span>
                <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs font-medium">
                  {getTypeLabel(formData.type)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open(`http://localhost:3000${formData.path}`, '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              Náhled
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Ukládám...' : 'Uložit změny'}
            </button>
          </div>
        </div>

        {/* SEO Score */}
        <div className="bg-dark-lighter border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">SEO Skóre</h3>
              <p className="text-sm text-gray-400 mt-1">Celkové hodnocení optimalizace</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary-400">{formData.seoScore}%</div>
              <div className="text-sm text-gray-500 mt-1">z 100</div>
            </div>
          </div>
        </div>

        {/* SEO Title */}
        <div className="bg-dark-lighter border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Type className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">SEO Title</h3>
          </div>
          <input
            type="text"
            value={formData.seoTitle}
            onChange={(e) => handleChange('seoTitle', e.target.value)}
            placeholder="Zadejte SEO title..."
            className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-400">
              Optimální délka: 50-60 znaků
            </p>
            <span className={`text-sm font-medium ${getTitleColor()}`}>
              {getTitleLength()} znaků
            </span>
          </div>
        </div>

        {/* SEO Description */}
        <div className="bg-dark-lighter border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlignLeft className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">SEO Description</h3>
          </div>
          <textarea
            value={formData.seoDescription}
            onChange={(e) => handleChange('seoDescription', e.target.value)}
            placeholder="Zadejte SEO description..."
            rows={3}
            className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-400">
              Optimální délka: 150-160 znaků
            </p>
            <span className={`text-sm font-medium ${getDescriptionColor()}`}>
              {getDescriptionLength()} znaků
            </span>
          </div>
        </div>

        {/* H1 Heading */}
        <div className="bg-dark-lighter border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">H1 Nadpis</h3>
          </div>
          <input
            type="text"
            value={formData.h1}
            onChange={(e) => handleChange('h1', e.target.value)}
            placeholder="Zadejte H1 nadpis..."
            className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
          <p className="text-sm text-gray-400 mt-2">
            Hlavní nadpis stránky, měl by obsahovat klíčová slova
          </p>
        </div>

        {/* Keywords */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Focus Keyword */}
          <div className="bg-dark-lighter border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-5 h-5 text-primary-400" />
              <h3 className="text-lg font-semibold text-white">Hlavní klíčové slovo</h3>
            </div>
            <input
              type="text"
              value={formData.focusKeyword}
              onChange={(e) => handleChange('focusKeyword', e.target.value)}
              placeholder="např. holky na sex"
              className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
            <p className="text-sm text-gray-400 mt-2">
              Primární keyword pro SEO optimalizaci
            </p>
          </div>

          {/* Secondary Keywords */}
          <div className="bg-dark-lighter border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-white">Vedlejší klíčová slova</h3>
            </div>
            <input
              type="text"
              value={formData.secondaryKeywords}
              onChange={(e) => handleChange('secondaryKeywords', e.target.value)}
              placeholder="escort, společnice, erotika"
              className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
            <p className="text-sm text-gray-400 mt-2">
              Oddělené čárkami
            </p>
          </div>
        </div>

        {/* All Keywords */}
        <div className="bg-dark-lighter border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">Meta Keywords</h3>
          </div>
          <textarea
            value={formData.keywords}
            onChange={(e) => handleChange('keywords', e.target.value)}
            placeholder="holky na sex, escort, společnice, erotické služby..."
            rows={2}
            className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
          />
          <p className="text-sm text-gray-400 mt-2">
            Všechna klíčová slova oddělená čárkami
          </p>
        </div>

        {/* Content */}
        <div className="bg-dark-lighter border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">Obsah stránky</h3>
          </div>
          <textarea
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="Zadejte text pro SEO optimalizaci stránky..."
            rows={8}
            className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none font-mono text-sm"
          />
          <p className="text-sm text-gray-400 mt-2">
            Dlouhý popisný text pro lepší SEO
          </p>
        </div>

        {/* Published Status */}
        <div className="bg-dark-lighter border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Publikovat</h3>
              <p className="text-sm text-gray-400 mt-1">
                Zveřejnit stránku na webu
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => handleChange('published', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>

        {/* Save Button Bottom */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => router.push('/admin_panel/seomaster?tab=main-pages')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Zrušit
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Ukládám...' : 'Uložit změny'}
          </button>
        </div>
      </div>
    </div>
  );
}
