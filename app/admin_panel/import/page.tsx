'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import Header from '@/components/Header';

export default function ContentImportPage() {
  const router = useRouter();
  const [businessUrl, setBusinessUrl] = useState('');
  const [processImages, setProcessImages] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleImport = async () => {
    if (!businessUrl.trim()) {
      setError('Zadejte URL podniku');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/import-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessUrl,
          processImages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import selhal');
      }

      setSuccess(data.message);
      setResult(data);
      setBusinessUrl('');

    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || 'Chyba při importu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/admin_panel')}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Zpět na Admin Panel
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">Import Obsahu</h1>
            <p className="text-gray-400">AI-powered import podniků a profilů z externích zdrojů</p>
          </div>

          {/* Import Form */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL podniku
              </label>
              <input
                type="url"
                value={businessUrl}
                onChange={(e) => setBusinessUrl(e.target.value)}
                placeholder="https://example.com/podnik/..."
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                disabled={loading}
              />
              <p className="text-sm text-gray-400 mt-2">
                Vložte URL stránky podniku pro import všech dat včetně profilů
              </p>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={processImages}
                  onChange={(e) => setProcessImages(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-primary-500 focus:ring-2 focus:ring-primary-500"
                  disabled={loading}
                />
                <span className="text-sm">Zpracovat obrázky (detekce a odstranění vodoznaků)</span>
              </label>
              <p className="text-sm text-gray-400 mt-1 ml-6">
                AI automaticky detekuje a odstraní vodoznaky z fotek
              </p>
            </div>

            <button
              onClick={handleImport}
              disabled={loading || !businessUrl.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Importuji...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Spustit Import
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-400 font-medium mb-1">Chyba při importu</h3>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && result && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                <div>
                  <h3 className="text-green-400 font-medium text-lg mb-1">Import úspěšný!</h3>
                  <p className="text-green-300">{success}</p>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">ID podniku:</span>
                  <span className="text-white font-mono">{result.businessId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Importované profily:</span>
                  <span className="text-white font-medium">{result.profileIds?.length || 0}</span>
                </div>
                {result.profileIds && result.profileIds.length > 0 && (
                  <div className="pt-2 border-t border-slate-700">
                    <p className="text-xs text-gray-400 mb-1">ID profilů:</p>
                    <div className="flex flex-wrap gap-1">
                      {result.profileIds.map((id: string) => (
                        <span key={id} className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-gray-300">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => router.push('/admin_panel')}
                  className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                >
                  Zpět na Admin Panel
                </button>
                <button
                  onClick={() => {
                    setSuccess(null);
                    setResult(null);
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Importovat další
                </button>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300 space-y-2">
                <p className="font-medium">Jak funguje AI import:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-200">
                  <li>Gemini AI analyzuje HTML stránky a extrahuje strukturovaná data</li>
                  <li>Automaticky detekuje informace o podniku (název, adresa, telefon, otevírací doba)</li>
                  <li>Najde všechny profily spojené s podnikem</li>
                  <li>Gemini Vision API detekuje vodoznaky na fotkách a odstraní je</li>
                  <li>Mapuje služby na naši databázi služeb</li>
                  <li>Vytvoří podnik a profily v systému (vyžaduje schválení adminem)</li>
                </ul>
                <p className="text-xs text-blue-400 mt-2">
                  ⚠️ Import může trvat 1-5 minut v závislosti na počtu profilů a fotek
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
