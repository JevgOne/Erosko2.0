'use client';

import { Users, Building2, MessageSquare, Eye } from 'lucide-react';

interface Stats {
  totalProfiles: number;
  totalBusinesses: number;
  totalReviews: number;
  totalViews: number;
}

export default function StatsBanner({ stats }: { stats: Stats }) {
  if (!stats) return null;

  const items = [
    {
      icon: Users,
      label: 'Aktivních profilů',
      value: stats.totalProfiles.toLocaleString('cs-CZ'),
      color: 'text-pink-500',
    },
    {
      icon: Building2,
      label: 'Ověřených podniků',
      value: stats.totalBusinesses.toLocaleString('cs-CZ'),
      color: 'text-blue-500',
    },
    {
      icon: MessageSquare,
      label: 'Recenzí',
      value: stats.totalReviews.toLocaleString('cs-CZ'),
      color: 'text-green-500',
    },
    {
      icon: Eye,
      label: 'Celkových zobrazení',
      value: stats.totalViews.toLocaleString('cs-CZ'),
      color: 'text-purple-500',
    },
  ];

  return (
    <section className="py-12 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-y border-pink-500/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <div key={index} className="text-center">
              <item.icon className={`w-12 h-12 mx-auto mb-3 ${item.color}`} />
              <div className="text-3xl font-bold mb-1">{item.value}</div>
              <div className="text-gray-400 text-sm">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
