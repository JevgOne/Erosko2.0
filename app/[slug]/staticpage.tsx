import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

// Generate SEO metadata
export async function generateStaticPageMetadata(path: string): Promise<Metadata | null> {
  const page = await prisma.staticPage.findUnique({
    where: { path },
    select: {
      seoTitle: true,
      seoDescription: true,
      keywords: true,
      ogImageUrl: true,
      h1: true,
    },
  });

  if (!page) return null;

  return {
    title: page.seoTitle,
    description: page.seoDescription,
    keywords: page.keywords || undefined,
    openGraph: {
      title: page.seoTitle,
      description: page.seoDescription,
      images: page.ogImageUrl ? [{ url: page.ogImageUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.seoTitle,
      description: page.seoDescription,
      images: page.ogImageUrl ? [page.ogImageUrl] : [],
    },
    alternates: {
      canonical: `https://erosko.cz${path}`,
    },
  };
}

export default async function StaticPageView({ params }: Props) {
  const path = `/${params.slug}`;

  const page = await prisma.staticPage.findUnique({
    where: { path },
  });

  if (!page || !page.published) {
    notFound();
  }

  // Increment view count
  prisma.staticPage
    .update({
      where: { id: page.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {}); // Fire and forget

  return (
    <main className="min-h-screen bg-dark-950">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* H1 Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-center bg-gradient-to-r from-primary-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            {page.h1}
          </h1>

          {/* Content */}
          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-8 md:p-12">
              <div
                className="prose prose-invert prose-lg max-w-none
                  prose-headings:text-white prose-headings:font-bold
                  prose-p:text-gray-300 prose-p:leading-relaxed
                  prose-a:text-primary-400 prose-a:no-underline hover:prose-a:text-primary-300
                  prose-strong:text-white prose-strong:font-semibold
                  prose-ul:text-gray-300 prose-ol:text-gray-300
                  prose-li:text-gray-300
                  prose-img:rounded-xl prose-img:shadow-lg"
                dangerouslySetInnerHTML={{ __html: page.content || '' }}
              />
            </div>
          </div>

          {/* SEO Text (if needed) */}
          {page.content && page.content.length < 300 && (
            <div className="max-w-4xl mx-auto mt-8">
              <div className="glass rounded-2xl p-6 bg-dark-800/30">
                <p className="text-sm text-gray-400 leading-relaxed">
                  {page.seoDescription}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
