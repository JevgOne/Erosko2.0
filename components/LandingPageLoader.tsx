import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface LandingPageLoaderProps {
  path: string;
}

export default async function LandingPageLoader({ path }: LandingPageLoaderProps) {
  const page = await prisma.staticPage.findUnique({
    where: { path, published: true },
  });

  if (!page) {
    notFound();
  }

  // Increment view count (async, don't await to avoid blocking)
  prisma.staticPage.update({
    where: { id: page.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-primary-900/20 to-transparent py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            {page.h1}
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            {page.seoDescription}
          </p>
        </div>
      </div>

      {/* SEO Content */}
      {page.content && (
        <div className="container mx-auto px-4 py-12">
          <div
            className="prose prose-invert max-w-none
            prose-headings:text-white
            prose-p:text-gray-300
            prose-a:text-primary-400 prose-a:hover:text-primary-300
            prose-strong:text-white
            prose-ul:text-gray-300
            prose-ol:text-gray-300"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      )}

      {/* Keywords for SEO */}
      {page.keywords && (
        <div className="container mx-auto px-4 pb-12">
          <div className="glass rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-400 mb-3">
              Klíčová slova:
            </h2>
            <div className="flex flex-wrap gap-2">
              {page.keywords.split(',').map((keyword, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-primary-500/10 text-primary-300 text-sm rounded-lg border border-primary-500/20"
                >
                  {keyword.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to generate metadata
export async function getLandingPageMetadata(path: string) {
  const page = await prisma.staticPage.findUnique({
    where: { path, published: true },
  });

  if (!page) {
    return {
      title: 'Page Not Found | EROSKO.CZ',
    };
  }

  return {
    title: page.seoTitle,
    description: page.seoDescription,
    keywords: page.keywords || undefined,
    openGraph: {
      title: page.seoTitle,
      description: page.seoDescription,
      images: page.ogImageUrl ? [page.ogImageUrl] : [],
    },
  };
}
