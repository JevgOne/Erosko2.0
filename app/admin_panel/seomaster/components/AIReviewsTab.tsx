'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Star, Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  slug: string;
  city: string;
}

interface Business {
  id: string;
  name: string;
  slug: string;
  city: string;
}

export default function AIReviewsTab() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [reviewConfig, setReviewConfig] = useState({
    targetType: 'profile' as 'profile' | 'business',
    targetId: '',
    count: 3,
    tone: 'positive' as 'positive' | 'neutral' | 'mixed',
    language: 'czech',
  });

  // Fetch profiles and businesses
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profilesRes, businessesRes] = await Promise.all([
          fetch('/api/admin/profiles?approved=true'),
          fetch('/api/admin/businesses?approved=true'),
        ]);

        if (profilesRes.ok) {
          const profilesData = await profilesRes.json();
          setProfiles(profilesData.profiles || []);
        }

        if (businessesRes.ok) {
          const businessesData = await businessesRes.json();
          setBusinesses(businessesData.businesses || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateReviews = async () => {
    if (!reviewConfig.targetId) {
      setMessage({ type: 'error', text: 'Vyberte profil nebo podnik' });
      return;
    }

    setGenerating(true);
    setMessage(null);

    try {
      // Step 1: Generate AI reviews using Google Gemini
      const prompt = `Vygeneruj ${reviewConfig.count} realistické recenze v češtině pro escort profil nebo erotický podnik.

Požadavky:
- Různé délky (50-200 slov)
- Různá česká jména (Jan K., Petr M., Martin S., Lucie V., Tomáš B., atd.)
- Rating: ${reviewConfig.tone === 'positive' ? '4-5 hvězdiček' : reviewConfig.tone === 'neutral' ? '3-4 hvězdičky' : '2-5 hvězdiček (smíšené)'}
- Tón: ${reviewConfig.tone === 'positive' ? 'pozitivní, spokojení zákazníci' : reviewConfig.tone === 'neutral' ? 'neutrální, objektivní' : 'smíšený (některé pozitivní, některé s připomínkami)'}
- Zaměř se na: profesionalita, komunikace, vzhled, diskrétnost, čistota prostředí, přístup
- Piš jako skuteční zákazníci - různé styly psaní (formální, neformální, stručné, detailní)
- Buď autentický a věrohodný
- Používej běžné české fráze

DŮLEŽITÉ: Vrať výsledek jako validní JSON array ve formátu:
[
  {
    "name": "Jan K.",
    "rating": 5,
    "comment": "Text recenze...",
    "date": "2025-01-15"
  }
]

POUZE JSON, žádný další text!`;

      const aiResponse = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model: 'google', // Use Google Gemini (same as SEO Master)
        }),
      });

      if (!aiResponse.ok) {
        throw new Error('Failed to generate reviews');
      }

      const aiData = await aiResponse.json();

      // Parse AI response (it might be wrapped in markdown code blocks)
      let generatedReviews;
      try {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = aiData.result.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
        if (jsonMatch) {
          generatedReviews = JSON.parse(jsonMatch[1]);
        } else {
          // Try parsing directly
          generatedReviews = JSON.parse(aiData.result);
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Nepodařilo se zpracovat AI odpověď');
      }

      // Step 2: Save reviews to database
      const saveResponse = await fetch('/api/reviews/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: reviewConfig.targetType === 'profile' ? reviewConfig.targetId : null,
          businessId: reviewConfig.targetType === 'business' ? reviewConfig.targetId : null,
          reviews: generatedReviews,
          isAIGenerated: true,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save reviews');
      }

      const saveData = await saveResponse.json();

      setMessage({
        type: 'success',
        text: `Úspěšně vygenerováno a uloženo ${saveData.created} recenzí!`,
      });

      // Reset form
      setReviewConfig({ ...reviewConfig, targetId: '' });
    } catch (error: any) {
      console.error('Error generating reviews:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Chyba při generování recenzí',
      });
    } finally {
      setGenerating(false);
    }
  };

  const selectedTarget = reviewConfig.targetType === 'profile'
    ? profiles.find(p => p.id === reviewConfig.targetId)
    : businesses.find(b => b.id === reviewConfig.targetId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-primary-500 to-pink-500 p-3 rounded-xl">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI Recenze Generator</h2>
          <p className="text-gray-400 text-sm">
            Generujte realistické recenze pro vytvoření sociálního důkazu
          </p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`glass rounded-xl p-4 flex items-center gap-3 ${
            message.type === 'success' ? 'border-green-500/30' : 'border-red-500/30'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <p className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
            {message.text}
          </p>
        </div>
      )}

      {/* Configuration Form */}
      <div className="glass rounded-xl p-6 space-y-6">
        {/* Target Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Typ cíle</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setReviewConfig({ ...reviewConfig, targetType: 'profile', targetId: '' })}
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                reviewConfig.targetType === 'profile'
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-800/50 text-gray-400 hover:bg-dark-800'
              }`}
            >
              Profil
            </button>
            <button
              onClick={() => setReviewConfig({ ...reviewConfig, targetType: 'business', targetId: '' })}
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                reviewConfig.targetType === 'business'
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-800/50 text-gray-400 hover:bg-dark-800'
              }`}
            >
              Podnik
            </button>
          </div>
        </div>

        {/* Target Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Vyberte {reviewConfig.targetType === 'profile' ? 'profil' : 'podnik'}
          </label>
          <select
            value={reviewConfig.targetId}
            onChange={(e) => setReviewConfig({ ...reviewConfig, targetId: e.target.value })}
            className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
            disabled={loading}
          >
            <option value="">-- Vyberte --</option>
            {reviewConfig.targetType === 'profile'
              ? profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name} ({profile.city})
                  </option>
                ))
              : businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name} ({business.city})
                  </option>
                ))}
          </select>
        </div>

        {/* Number of Reviews */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Počet recenzí: {reviewConfig.count}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={reviewConfig.count}
            onChange={(e) => setReviewConfig({ ...reviewConfig, count: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {/* Tone Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Tón recenzí</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setReviewConfig({ ...reviewConfig, tone: 'positive' })}
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                reviewConfig.tone === 'positive'
                  ? 'bg-green-500 text-white'
                  : 'bg-dark-800/50 text-gray-400 hover:bg-dark-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Star className="w-4 h-4" fill="currentColor" />
                <span>Pozitivní</span>
              </div>
            </button>
            <button
              onClick={() => setReviewConfig({ ...reviewConfig, tone: 'neutral' })}
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                reviewConfig.tone === 'neutral'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-dark-800/50 text-gray-400 hover:bg-dark-800'
              }`}
            >
              Neutrální
            </button>
            <button
              onClick={() => setReviewConfig({ ...reviewConfig, tone: 'mixed' })}
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                reviewConfig.tone === 'mixed'
                  ? 'bg-orange-500 text-white'
                  : 'bg-dark-800/50 text-gray-400 hover:bg-dark-800'
              }`}
            >
              Smíšený
            </button>
          </div>
        </div>

        {/* Preview */}
        {selectedTarget && (
          <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-1">Náhled:</div>
            <div className="text-white font-medium">
              Vygenerovat {reviewConfig.count} {reviewConfig.tone === 'positive' ? 'pozitivní' : reviewConfig.tone === 'neutral' ? 'neutrální' : 'smíšené'}{' '}
              {reviewConfig.count === 1 ? 'recenzi' : reviewConfig.count < 5 ? 'recenze' : 'recenzí'} pro{' '}
              <span className="text-primary-400">{selectedTarget.name}</span>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={generateReviews}
          disabled={!reviewConfig.targetId || generating}
          className="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-pink-500 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generuji recenze...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generovat AI recenze
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="glass rounded-xl p-6 border-l-4 border-blue-500">
        <h3 className="font-semibold mb-2 text-blue-400">Jak to funguje?</h3>
        <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
          <li>Vyberte profil nebo podnik, pro který chcete generovat recenze</li>
          <li>Nastavte počet recenzí (1-10) a tón (pozitivní, neutrální, smíšený)</li>
          <li>AI vygeneruje realistické recenze v češtině s různými jmény a styly</li>
          <li>Recenze jsou automaticky označeny jako AI-generované pro transparentnost</li>
          <li>Recenze se zobrazí na detail stránce profilu/podniku</li>
        </ol>
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-xs text-yellow-400">
            <strong>Poznámka:</strong> AI recenze jsou označeny v databázi a slouží pro vytvoření sociálního důkazu a aktivity na novém webu.
          </p>
        </div>
      </div>
    </div>
  );
}
