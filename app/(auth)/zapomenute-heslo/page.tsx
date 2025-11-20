'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ZapomenuteHesloPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'code' | 'password'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Phone step
  const [phone, setPhone] = useState('');

  // Code step
  const [verificationCode, setVerificationCode] = useState('');

  // Password step
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/sms/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          type: 'PASSWORD_RESET',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Chyba při odesílání SMS');
      }

      // SECURITY: Never display verification codes
      setSuccess('SMS kód byl odeslán na vaše telefonní číslo');

      setStep('code');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/sms/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          code: verificationCode,
          type: 'PASSWORD_RESET',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Neplatný ověřovací kód');
      }

      setSuccess('Kód ověřen! Nyní můžete nastavit nové heslo.');
      setStep('password');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Hesla se neshodují');
      return;
    }

    if (newPassword.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          verificationCode,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Chyba při změně hesla');
      }

      setSuccess('Heslo bylo úspěšně změněno! Přesměrování na přihlášení...');
      setTimeout(() => {
        router.push('/prihlaseni?reset=success');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Header />

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">Zapomenuté heslo</span>
              </h1>
              <p className="text-gray-400">
                {step === 'phone' && 'Zadejte telefonní číslo pro reset hesla'}
                {step === 'code' && 'Zadejte ověřovací kód z SMS'}
                {step === 'password' && 'Nastavte nové heslo'}
              </p>
            </div>

            <div className="glass rounded-3xl p-8">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg mb-6">
                  {success}
                </div>
              )}

              {/* Krok 1: Zadání telefonu */}
              {step === 'phone' && (
                <form onSubmit={handleSendCode} className="space-y-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      Telefonní číslo *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-white/10 focus:border-primary-500 focus:outline-none transition-colors"
                      placeholder="+420 123 456 789"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Na toto číslo odešleme ověřovací SMS kód
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !phone}
                    className="w-full gradient-primary py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? 'Odesílám SMS...' : 'Odeslat ověřovací kód'}
                  </button>

                  <div className="text-center text-sm text-gray-400">
                    Vzpomněli jste si?{' '}
                    <Link href="/prihlaseni" className="text-primary-400 hover:text-primary-300">
                      Přihlaste se
                    </Link>
                  </div>
                </form>
              )}

              {/* Krok 2: Ověření kódu */}
              {step === 'code' && (
                <form onSubmit={handleVerifyCode} className="space-y-6">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium mb-2">
                      Ověřovací kód *
                    </label>
                    <input
                      type="text"
                      id="code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-white/10 focus:border-primary-500 focus:outline-none transition-colors text-center text-2xl tracking-widest"
                      placeholder="123456"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Zadejte 6-místný kód z SMS
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || verificationCode.length !== 6}
                    className="w-full gradient-primary py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? 'Ověřuji...' : 'Ověřit kód'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setVerificationCode('');
                      setError('');
                      setSuccess('');
                    }}
                    className="w-full glass py-3 rounded-lg font-semibold hover:bg-white/5 transition-colors"
                  >
                    ← Zpět na zadání telefonu
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={loading}
                      className="text-sm text-primary-400 hover:text-primary-300 disabled:opacity-50"
                    >
                      Nepřišel vám SMS? Odeslat znovu
                    </button>
                  </div>
                </form>
              )}

              {/* Krok 3: Nové heslo */}
              {step === 'password' && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                      Nové heslo *
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-white/10 focus:border-primary-500 focus:outline-none transition-colors"
                      placeholder="Minimálně 6 znaků"
                      minLength={6}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                      Potvrzení hesla *
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-white/10 focus:border-primary-500 focus:outline-none transition-colors"
                      placeholder="Zadejte heslo znovu"
                      minLength={6}
                      required
                    />
                  </div>

                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-400">
                      Hesla se neshodují
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                    className="w-full gradient-primary py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? 'Měním heslo...' : 'Změnit heslo'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
