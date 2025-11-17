'use client';

import { useState } from 'react';
import {
  Sparkles,
  Users,
  FileText,
  Globe,
  BarChart3,
  ArrowRight,
  FileCode,
  Layout,
} from 'lucide-react';
import DashboardTab from './components/DashboardTab';
import ProfilesTab from './components/ProfilesTab';
import LandingPagesTab from './components/LandingPagesTab';
import AllPagesTab from './components/AllPagesTab';
import RedirectsTab from './components/RedirectsTab';
import RobotsTxtTab from './components/RobotsTxtTab';
import ContentBlocksTab from './components/ContentBlocksTab';
import MainPagesTab from './components/MainPagesTab';

type Tab = 'dashboard' | 'profiles' | 'landing-pages' | 'main-pages' | 'all-pages' | 'redirects' | 'robots' | 'content-blocks';

export default function SEOMasterPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

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
      <div className="glass rounded-xl p-2 mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'dashboard'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          Dashboard
        </button>
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
        <button
          onClick={() => setActiveTab('main-pages')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'main-pages'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layout className="w-5 h-5" />
          Hlavní Stránky
        </button>
        <button
          onClick={() => setActiveTab('all-pages')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'all-pages'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Globe className="w-5 h-5" />
          Všechny Stránky
        </button>
        <button
          onClick={() => setActiveTab('redirects')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'redirects'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ArrowRight className="w-5 h-5" />
          Redirects
        </button>
        <button
          onClick={() => setActiveTab('robots')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'robots'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileCode className="w-5 h-5" />
          robots.txt
        </button>
        <button
          onClick={() => setActiveTab('content-blocks')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'content-blocks'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-5 h-5" />
          Content Blocks
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'profiles' && <ProfilesTab />}
        {activeTab === 'landing-pages' && <LandingPagesTab />}
        {activeTab === 'main-pages' && <MainPagesTab />}
        {activeTab === 'all-pages' && <AllPagesTab />}
        {activeTab === 'redirects' && <RedirectsTab />}
        {activeTab === 'robots' && <RobotsTxtTab />}
        {activeTab === 'content-blocks' && <ContentBlocksTab />}
      </div>
    </div>
  );
}
