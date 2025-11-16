'use client';

import { useState } from 'react';
import { Sparkles, Users, FileText } from 'lucide-react';
import ProfilesTab from './components/ProfilesTab';
import LandingPagesTab from './components/LandingPagesTab';

type Tab = 'profiles' | 'landing-pages';

export default function SEOMasterPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profiles');

  return (
    <div className="min-h-screen bg-dark-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-primary-400" />
          <h1 className="text-3xl font-bold gradient-text">SEO MASTER</h1>
        </div>
        <p className="text-gray-400">
          AI-powered SEO management • Google Gemini
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="glass rounded-xl p-2 mb-6 inline-flex gap-2">
        <button
          onClick={() => setActiveTab('profiles')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'profiles'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-5 h-5" />
          Profily & Podniky
        </button>
        <button
          onClick={() => setActiveTab('landing-pages')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'landing-pages'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-5 h-5" />
          Landing Pages
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'profiles' && <ProfilesTab />}
        {activeTab === 'landing-pages' && <LandingPagesTab />}
      </div>
    </div>
  );
}
