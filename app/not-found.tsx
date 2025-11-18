import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl mb-8">Stránka nebyla nalezena</h2>
        <p className="text-gray-400 mb-8">
          Omlouváme se, ale hledaná stránka neexistuje.
        </p>
        <Link
          href="/"
          className="inline-block bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition"
        >
          Zpět na hlavní stránku
        </Link>
      </div>
      <Footer />
    </main>
  );
}
