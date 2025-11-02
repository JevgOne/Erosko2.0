'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UserRole } from '@prisma/client';
import { czechCities } from '@/lib/cities-data';
import {
  basicHolkyNaSexServices,
  basicMassageServices,
  basicBdsmServices,
  basicDigitalServices,
  holkyNaSexServices,
  massageTypes,
  massageExtraServices,
  bdsmServices,
  digitalServices,
  equipment,
} from '@/lib/services-data';

export default function RegistracePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Základní údaje
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'PROVIDER'>('USER');

  // Údaje pro poskytovatele
  const [profileType, setProfileType] = useState('SOLO');
  const [category, setCategory] = useState('HOLKY_NA_SEX');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedMassageTypes, setSelectedMassageTypes] = useState<string[]>([]);
  const [selectedExtraServices, setSelectedExtraServices] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  // Detailní údaje pro SOLO profil
  const [description, setDescription] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [pricePerHalfHour, setPricePerHalfHour] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bust, setBust] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [hairColor, setHairColor] = useState('');
  const [eyeColor, setEyeColor] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Otevírací doba pro PODNIK
  const [openingHours, setOpeningHours] = useState({
    monday: { from: '', to: '', closed: false },
    tuesday: { from: '', to: '', closed: false },
    wednesday: { from: '', to: '', closed: false },
    thursday: { from: '', to: '', closed: false },
    friday: { from: '', to: '', closed: false },
    saturday: { from: '', to: '', closed: false },
    sunday: { from: '', to: '', closed: false }
  });

  // Zkopírovat otevírací dobu na celý týden
  const copyToAllDays = (dayKey: string) => {
    const sourceDay = openingHours[dayKey as keyof typeof openingHours];
    const newHours = { ...openingHours };
    Object.keys(newHours).forEach(key => {
      newHours[key as keyof typeof openingHours] = { ...sourceDay };
    });
    setOpeningHours(newHours);
  };

  // Zkopírovat na další den
  const copyToNextDay = (dayKey: string) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const currentIndex = days.indexOf(dayKey);
    if (currentIndex < days.length - 1) {
      const sourceDay = openingHours[dayKey as keyof typeof openingHours];
      const nextDay = days[currentIndex + 1];
      setOpeningHours({
        ...openingHours,
        [nextDay]: { ...sourceDay }
      });
    }
  };

  // Filtrování měst
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const filteredCities = czechCities.filter(c =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  ).slice(0, 8);

  // Kontrola dostupnosti jména a telefonu
  const [businessNameAvailable, setBusinessNameAvailable] = useState<boolean | null>(null);
  const [phoneAvailable, setPhoneAvailable] = useState<boolean | null>(null);
  const [checkingBusinessName, setCheckingBusinessName] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);

  // useEffect pro kontrolu dostupnosti jména podniku
  useEffect(() => {
    if (profileType !== 'SOLO' && businessName.trim().length >= 3) {
      setCheckingBusinessName(true);
      const timer = setTimeout(async () => {
        try {
          const response = await fetch('/api/check-availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'businessName', value: businessName.trim() }),
          });
          const data = await response.json();
          setBusinessNameAvailable(data.isAvailable);
        } catch (error) {
          console.error('Error checking business name:', error);
        } finally {
          setCheckingBusinessName(false);
        }
      }, 800); // Debounce 800ms

      return () => clearTimeout(timer);
    } else {
      setBusinessNameAvailable(null);
      setCheckingBusinessName(false);
    }
  }, [businessName, profileType]);

  // useEffect pro kontrolu dostupnosti telefonu
  useEffect(() => {
    if (phone.trim().length >= 9) {
      setCheckingPhone(true);
      const timer = setTimeout(async () => {
        try {
          const response = await fetch('/api/check-availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'phone', value: phone.trim() }),
          });
          const data = await response.json();
          setPhoneAvailable(data.isAvailable);
        } catch (error) {
          console.error('Error checking phone:', error);
        } finally {
          setCheckingPhone(false);
        }
      }, 800); // Debounce 800ms

      return () => clearTimeout(timer);
    } else {
      setPhoneAvailable(null);
      setCheckingPhone(false);
    }
  }, [phone]);

  // Získat služby podle kategorie
  const getServicesForCategory = () => {
    // Pro podnik jen základní služby
    if (profileType !== 'SOLO') {
      switch (category) {
        case 'HOLKY_NA_SEX':
          return basicHolkyNaSexServices;
        case 'EROTICKE_MASERKY':
          return basicMassageServices;
        case 'DOMINA':
          return basicBdsmServices;
        case 'DIGITALNI_SLUZBY':
          return basicDigitalServices;
        default:
          return [];
      }
    }

    // Pro SOLO všechny služby
    switch (category) {
      case 'HOLKY_NA_SEX':
        return holkyNaSexServices;
      case 'DOMINA':
        return bdsmServices;
      case 'DIGITALNI_SLUZBY':
        return digitalServices;
      default:
        return [];
    }
  };

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleMassageTypeToggle = (type: string) => {
    setSelectedMassageTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleExtraServiceToggle = (service: string) => {
    setSelectedExtraServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleEquipmentToggle = (item: string) => {
    setSelectedEquipment(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalPhotos = photos.length + newFiles.length;

    if (totalPhotos > 10) {
      setError('Můžete nahrát maximálně 10 fotek');
      return;
    }

    setPhotos(prev => [...prev, ...newFiles]);

    // Vytvořit preview
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validace
    if (!email || !password) {
      setError('Email a heslo jsou povinné');
      return;
    }

    if (password !== confirmPassword) {
      setError('Hesla se neshodují');
      return;
    }

    if (password.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků');
      return;
    }

    if (role === 'PROVIDER') {
      if (!city || !phone) {
        setError('Vyplňte všechny povinné údaje profilu');
        return;
      }
      if (profileType === 'SOLO' && (!name || !age)) {
        setError('Vyplňte jméno a věk');
        return;
      }
      if (profileType !== 'SOLO') {
        if (!businessName) {
          setError('Vyplňte název podniku');
          return;
        }
        if (!description) {
          setError('Vyplňte popis podniku');
          return;
        }
        // Kontrola dostupnosti jména podniku
        if (businessNameAvailable === false) {
          setError('Název podniku je již použitý. Zvolte prosím jiný název.');
          return;
        }
      }
      // Kontrola dostupnosti telefonu
      if (phoneAvailable === false) {
        setError('Telefonní číslo je již registrováno. Použijte prosím jiné číslo.');
        return;
      }
    }

    setLoading(true);

    try {
      // Připravit služby podle kategorie (jen pro SOLO)
      let allServices: string[] = [];
      if (profileType === 'SOLO') {
        if (category === 'EROTICKE_MASERKY') {
          allServices = [...selectedMassageTypes, ...selectedExtraServices];
        } else {
          allServices = selectedServices;
        }
      }

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role,
          ...(role === 'PROVIDER' && {
            profile: {
              name: profileType === 'SOLO' ? name : businessName,
              age: profileType === 'SOLO' ? parseInt(age) : undefined,
              city,
              address,
              phone,
              profileType,
              category,
              businessName: profileType !== 'SOLO' ? businessName : null,
              services: profileType === 'SOLO' ? allServices : [],
              equipment: selectedEquipment,
              // Detailní údaje pro SOLO
              ...(profileType === 'SOLO' && {
                description,
                pricePerHour: pricePerHour ? parseInt(pricePerHour) : undefined,
                pricePerHalfHour: pricePerHalfHour ? parseInt(pricePerHalfHour) : undefined,
                height: height ? parseInt(height) : undefined,
                weight: weight ? parseInt(weight) : undefined,
                bust: bust ? parseInt(bust) : undefined,
                waist: waist ? parseInt(waist) : undefined,
                hips: hips ? parseInt(hips) : undefined,
                hairColor,
                eyeColor,
              }),
              // Detailní údaje pro PODNIK
              ...(profileType !== 'SOLO' && {
                description,
                openingHours: Object.fromEntries(
                  Object.entries(openingHours).map(([day, data]) => [
                    day,
                    data.closed ? 'Zavřeno' : data.from && data.to ? `${data.from}-${data.to}` : ''
                  ])
                ),
              }),
            },
          }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Chyba při registraci');
      }

      // Úspěšná registrace - přesměruj na přihlášení
      router.push('/prihlaseni?registered=true');
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
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">Registrace</span>
              </h1>
              <p className="text-gray-400">
                Vytvořte si účet na Erosko.cz
              </p>
            </div>

            <div className="glass rounded-3xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Krok 1: Základní údaje */}
                {step === 1 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Typ účtu
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => { setRole('PROVIDER'); setProfileType('SOLO'); }}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            role === 'PROVIDER' && profileType === 'SOLO'
                              ? 'border-primary-500 bg-primary-500/10'
                              : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="font-semibold mb-1">Solo dívka</div>
                          <div className="text-xs text-gray-400">
                            Nezávislá poskytovatelka služeb
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setRole('PROVIDER'); setProfileType('SALON'); }}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            role === 'PROVIDER' && profileType !== 'SOLO'
                              ? 'border-primary-500 bg-primary-500/10'
                              : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="font-semibold mb-1">Podnik</div>
                          <div className="text-xs text-gray-400">
                            Salon, agentura nebo privát
                          </div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-white/10 focus:border-primary-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium mb-2">
                        Heslo
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-white/10 focus:border-primary-500 focus:outline-none transition-colors"
                        required
                        minLength={6}
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                        Potvrzení hesla
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-white/10 focus:border-primary-500 focus:outline-none transition-colors"
                        required
                        minLength={6}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full gradient-primary py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                      Pokračovat →
                    </button>
                  </>
                )}

                {/* Krok 2: Údaje pro poskytovatele */}
                {step === 2 && role === 'PROVIDER' && (
                  <>
                    {profileType !== 'SOLO' && (
                      <div>
                        <label htmlFor="businessType" className="block text-sm font-medium mb-2">
                          Typ Podniku *
                        </label>
                        <div className="relative">
                          <select
                            id="businessType"
                            value={profileType}
                            onChange={(e) => {
                              const selectedType = e.target.value;
                              setProfileType(selectedType);

                              // Nastavit kategorii podle typu
                              const typeMap: { [key: string]: string } = {
                                'PRIVAT': 'HOLKY_NA_SEX',
                                'MASSAGE_SALON': 'EROTICKE_MASERKY',
                                'ESCORT_AGENCY': 'HOLKY_NA_SEX',
                                'DIGITAL_AGENCY': 'DIGITALNI_SLUZBY',
                                'SWINGERS_CLUB': 'EROTICKE_PODNIKY',
                                'NIGHT_CLUB': 'EROTICKE_PODNIKY',
                                'STRIP_CLUB': 'EROTICKE_PODNIKY',
                              };
                              setCategory(typeMap[selectedType] || 'HOLKY_NA_SEX');
                            }}
                            className="w-full px-4 py-3.5 pr-10 rounded-xl bg-gradient-to-br from-dark-800/80 to-dark-900/80 backdrop-blur-xl border border-white/10 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all hover:border-white/20 hover:shadow-lg hover:shadow-primary-500/5 cursor-pointer appearance-none text-white"
                            style={{
                              backgroundImage: 'linear-gradient(to bottom right, rgba(17, 24, 39, 0.8), rgba(0, 0, 0, 0.8))'
                            }}
                            required
                          >
                            <option value="" className="bg-dark-900 text-gray-400">Vyberte typ podniku...</option>
                            <option value="PRIVAT" className="bg-dark-900 text-white py-2">Erotický privát</option>
                            <option value="MASSAGE_SALON" className="bg-dark-900 text-white py-2">Erotické masáže</option>
                            <option value="ESCORT_AGENCY" className="bg-dark-900 text-white py-2">Escort Agentura</option>
                            <option value="DIGITAL_AGENCY" className="bg-dark-900 text-white py-2">Digitální Agentura</option>
                            <option value="SWINGERS_CLUB" className="bg-dark-900 text-white py-2">Swingers klub</option>
                            <option value="NIGHT_CLUB" className="bg-dark-900 text-white py-2">Night Club</option>
                            <option value="STRIP_CLUB" className="bg-dark-900 text-white py-2">Strip Club</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}

                    {profileType !== 'SOLO' && (
                      <div>
                        <label htmlFor="businessName" className="block text-sm font-medium mb-2">
                          Název podniku *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="businessName"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className={`w-full px-4 py-3 pr-10 rounded-xl bg-dark-800/50 backdrop-blur border ${
                              businessNameAvailable === false
                                ? 'border-red-500 focus:border-red-500'
                                : businessNameAvailable === true
                                ? 'border-green-500 focus:border-green-500'
                                : 'border-white/20 focus:border-primary-500'
                            } focus:outline-none transition-all hover:border-white/30`}
                            placeholder="např. Salon Paradise"
                            required
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            {checkingBusinessName && (
                              <div className="animate-spin h-5 w-5 border-2 border-primary-400 border-t-transparent rounded-full"></div>
                            )}
                            {!checkingBusinessName && businessNameAvailable === true && (
                              <span className="text-green-500 text-lg">✓</span>
                            )}
                            {!checkingBusinessName && businessNameAvailable === false && (
                              <span className="text-red-500 text-lg">✗</span>
                            )}
                          </div>
                        </div>
                        {businessNameAvailable === false && (
                          <p className="text-xs text-red-400 mt-1">Tento název je již použitý. Zvolte prosím jiný název.</p>
                        )}
                        {businessNameAvailable === true && (
                          <p className="text-xs text-green-400 mt-1">Název je volný ✓</p>
                        )}
                      </div>
                    )}

                    {profileType === 'SOLO' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Kategorie služeb *
                          </label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur border border-white/20 focus:border-primary-500 focus:outline-none transition-all hover:border-white/30 cursor-pointer"
                            required
                          >
                            <option value="">Vyberte kategorii</option>
                            <option value="HOLKY_NA_SEX">Holky na sex</option>
                            <option value="EROTICKE_MASERKY">Erotické masérky</option>
                            <option value="DOMINA">BDSM / Domina</option>
                            <option value="DIGITALNI_SLUZBY">Digitální služby (webcam, phone)</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-2">
                              Jméno / Přezdívka *
                            </label>
                            <input
                              type="text"
                              id="name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur border border-white/20 focus:border-primary-500 focus:outline-none transition-all hover:border-white/30"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="age" className="block text-sm font-medium mb-2">
                              Věk *
                            </label>
                            <input
                              type="number"
                              id="age"
                              value={age}
                              onChange={(e) => setAge(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur border border-white/20 focus:border-primary-500 focus:outline-none transition-all hover:border-white/30"
                              required
                              min="18"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <label htmlFor="city" className="block text-sm font-medium mb-2">
                        Město *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="city"
                          list="cities"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur border border-white/20 focus:border-primary-500 focus:outline-none transition-all hover:border-white/30"
                          placeholder="Začni psát město..."
                          required
                        />
                        <datalist id="cities">
                          {czechCities.map(c => (
                            <option key={c} value={c} />
                          ))}
                        </datalist>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">
                          {city && czechCities.includes(city) ? '✓' : '↓'}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Populární: Praha, Brno, Ostrava, Plzeň
                      </p>
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium mb-2">
                        Adresa *
                      </label>
                      <input
                        type="text"
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Např. Václavské náměstí 1"
                        className="w-full px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur border border-white/20 focus:border-primary-500 focus:outline-none transition-all hover:border-white/30"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">
                        Telefon *
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={`w-full px-4 py-3 pr-10 rounded-xl bg-dark-800/50 backdrop-blur border ${
                            phoneAvailable === false
                              ? 'border-red-500 focus:border-red-500'
                              : phoneAvailable === true
                              ? 'border-green-500 focus:border-green-500'
                              : 'border-white/20 focus:border-primary-500'
                          } focus:outline-none transition-all hover:border-white/30`}
                          placeholder="+420 123 456 789"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          {checkingPhone && (
                            <div className="animate-spin h-5 w-5 border-2 border-primary-400 border-t-transparent rounded-full"></div>
                          )}
                          {!checkingPhone && phoneAvailable === true && (
                            <span className="text-green-500 text-lg">✓</span>
                          )}
                          {!checkingPhone && phoneAvailable === false && (
                            <span className="text-red-500 text-lg">✗</span>
                          )}
                        </div>
                      </div>
                      {phoneAvailable === false && (
                        <p className="text-xs text-red-400 mt-1">Toto telefonní číslo je již registrováno. Použijte prosím jiné číslo.</p>
                      )}
                      {phoneAvailable === true && (
                        <p className="text-xs text-green-400 mt-1">Telefonní číslo je volné ✓</p>
                      )}
                    </div>

                    {/* Služby - jen pro SOLO */}
                    {profileType !== 'SOLO' ? (
                      // PODNIK - kompletní profil podniku
                      <>
                        {/* Popis podniku */}
                        <div>
                          <label htmlFor="businessDescription" className="block text-sm font-medium mb-2">
                            Popis podniku *
                          </label>
                          <textarea
                            id="businessDescription"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur border border-white/20 focus:border-primary-500 focus:outline-none transition-all hover:border-white/30"
                            rows={4}
                            placeholder="Popište váš podnik, nabízené služby a prostředí..."
                            required
                          />
                        </div>

                        {/* Vybavení */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Vybavení (volitelné)
                          </label>
                          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                            {equipment.map(item => (
                              <label
                                key={item}
                                className="flex items-center space-x-2 p-3 rounded-lg bg-dark-800/50 backdrop-blur border border-white/10 hover:border-primary-500 cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedEquipment.includes(item)}
                                  onChange={() => handleEquipmentToggle(item)}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm">{item}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Otevírací doba */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Otevírací doba (volitelné)
                          </label>
                          <div className="space-y-3">
                            {[
                              { key: 'monday', label: 'Pondělí' },
                              { key: 'tuesday', label: 'Úterý' },
                              { key: 'wednesday', label: 'Středa' },
                              { key: 'thursday', label: 'Čtvrtek' },
                              { key: 'friday', label: 'Pátek' },
                              { key: 'saturday', label: 'Sobota' },
                              { key: 'sunday', label: 'Neděle' }
                            ].map((day, index) => {
                              const dayData = openingHours[day.key as keyof typeof openingHours];
                              return (
                                <div key={day.key} className="glass rounded-xl p-4 border border-white/10">
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium">{day.label}</span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={dayData.closed}
                                        onChange={(e) => {
                                          setOpeningHours({
                                            ...openingHours,
                                            [day.key]: { ...dayData, closed: e.target.checked }
                                          });
                                        }}
                                        className="w-4 h-4"
                                      />
                                      <span className="text-xs text-gray-400">Zavřeno</span>
                                    </label>
                                  </div>

                                  {!dayData.closed && (
                                    <>
                                      <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                          <label className="block text-xs text-gray-400 mb-1">Od</label>
                                          <input
                                            type="time"
                                            value={dayData.from}
                                            onChange={(e) => {
                                              setOpeningHours({
                                                ...openingHours,
                                                [day.key]: { ...dayData, from: e.target.value }
                                              });
                                            }}
                                            className="w-full px-3 py-2 rounded-lg bg-dark-800/50 backdrop-blur border border-white/20 focus:border-primary-500 focus:outline-none transition-all text-sm"
                                          />
                                        </div>
                                        <span className="text-gray-400 pt-5">—</span>
                                        <div className="flex-1">
                                          <label className="block text-xs text-gray-400 mb-1">Do</label>
                                          <input
                                            type="time"
                                            value={dayData.to}
                                            onChange={(e) => {
                                              setOpeningHours({
                                                ...openingHours,
                                                [day.key]: { ...dayData, to: e.target.value }
                                              });
                                            }}
                                            className="w-full px-3 py-2 rounded-lg bg-dark-800/50 backdrop-blur border border-white/20 focus:border-primary-500 focus:outline-none transition-all text-sm"
                                          />
                                        </div>
                                      </div>

                                      {dayData.from && dayData.to && (
                                        <div className="flex gap-2 mt-2">
                                          {index < 6 && (
                                            <button
                                              type="button"
                                              onClick={() => copyToNextDay(day.key)}
                                              className="flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium transition-colors"
                                            >
                                              Použít na další den
                                            </button>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => copyToAllDays(day.key)}
                                            className="flex-1 px-3 py-2 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 text-xs font-medium transition-colors"
                                          >
                                            Použít na celý týden
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Fotky */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Fotky (maximálně 10)
                          </label>
                          <div className="space-y-4">
                            {/* Upload button */}
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-primary-500 transition-colors bg-dark-800/30">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                <p className="text-sm text-gray-400">
                                  Klikni pro nahrání fotek
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  PNG, JPG, WEBP (max. 5MB každá)
                                </p>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handlePhotoChange}
                                className="hidden"
                              />
                            </label>

                            {/* Photo previews */}
                            {photoPreviews.length > 0 && (
                              <div className="grid grid-cols-3 gap-4">
                                {photoPreviews.map((preview, index) => (
                                  <div key={index} className="relative group">
                                    <img
                                      src={preview}
                                      alt={`Preview ${index + 1}`}
                                      className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePhoto(index)}
                                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                          <p className="text-sm text-gray-300">
                            ℹ️ Profily a služby jednotlivých dívek přidáte až v admin panelu po dokončení registrace.
                          </p>
                        </div>
                      </>
                    ) : (
                      // SOLO - kompletní profil
                      <>
                        {/* Služby podle kategorie */}
                        {category === 'EROTICKE_MASERKY' ? (
                          <>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Typy masáží (vyberte alespoň jeden)
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {massageTypes.map(type => (
                                  <label
                                    key={type}
                                    className="flex items-center space-x-2 p-3 rounded-lg bg-dark-800/50 backdrop-blur border border-white/10 hover:border-primary-500 cursor-pointer transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedMassageTypes.includes(type)}
                                      onChange={() => handleMassageTypeToggle(type)}
                                      className="w-4 h-4"
                                    />
                                    <span className="text-sm">{type}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Extra služby (volitelné)
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {massageExtraServices.map(service => (
                                  <label
                                    key={service}
                                    className="flex items-center space-x-2 p-3 rounded-lg bg-dark-800/50 backdrop-blur border border-white/10 hover:border-primary-500 cursor-pointer transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedExtraServices.includes(service)}
                                      onChange={() => handleExtraServiceToggle(service)}
                                      className="w-4 h-4"
                                    />
                                    <span className="text-sm">{service}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Nabízené služby (vyberte alespoň jednu)
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {getServicesForCategory().map(service => (
                                <label
                                  key={service}
                                  className="flex items-center space-x-2 p-3 rounded-lg bg-dark-800/50 backdrop-blur border border-white/10 hover:border-primary-500 cursor-pointer transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedServices.includes(service)}
                                    onChange={() => handleServiceToggle(service)}
                                    className="w-4 h-4"
                                  />
                                  <span className="text-sm">{service}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Vybavení */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Vybavení (volitelné)
                          </label>
                          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                            {equipment.map(item => (
                              <label
                                key={item}
                                className="flex items-center space-x-2 p-3 rounded-lg bg-dark-800/50 backdrop-blur border border-white/10 hover:border-primary-500 cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedEquipment.includes(item)}
                                  onChange={() => handleEquipmentToggle(item)}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm">{item}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Fotky */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Fotky (maximálně 10)
                          </label>
                          <div className="space-y-4">
                            {/* Upload button */}
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-primary-500 transition-colors bg-dark-800/30">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                <p className="text-sm text-gray-400">
                                  Klikni pro nahrání fotek
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  PNG, JPG, WEBP (max. 5MB každá)
                                </p>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handlePhotoChange}
                                className="hidden"
                              />
                            </label>

                            {/* Photo previews */}
                            {photoPreviews.length > 0 && (
                              <div className="grid grid-cols-3 gap-4">
                                {photoPreviews.map((preview, index) => (
                                  <div key={index} className="relative group">
                                    <img
                                      src={preview}
                                      alt={`Preview ${index + 1}`}
                                      className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePhoto(index)}
                                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Popis */}
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium mb-2">
                            Popis (o mně, co nabízím)
                          </label>
                          <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur border border-white/20 focus:border-primary-500 focus:outline-none transition-all hover:border-white/30"
                            rows={4}
                            placeholder="Napiš něco o sobě a svých službách..."
                          />
                        </div>

                        {/* Ceny */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="pricePerHour" className="block text-sm font-medium mb-2">
                              Cena za hodinu (Kč)
                            </label>
                            <input
                              type="number"
                              id="pricePerHour"
                              value={pricePerHour}
                              onChange={(e) => setPricePerHour(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur border border-white/20 focus:border-primary-500 focus:outline-none transition-all hover:border-white/30"
                              placeholder="např. 3000"
                            />
                          </div>
                          <div>
                            <label htmlFor="pricePerHalfHour" className="block text-sm font-medium mb-2">
                              Cena za půl hodiny (Kč)
                            </label>
                            <input
                              type="number"
                              id="pricePerHalfHour"
                              value={pricePerHalfHour}
                              onChange={(e) => setPricePerHalfHour(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur border border-white/20 focus:border-primary-500 focus:outline-none transition-all hover:border-white/30"
                              placeholder="např. 2000"
                            />
                          </div>
                        </div>

                        {/* Fyzické údaje */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Fyzické údaje (volitelné)
                          </label>
                          <div className="grid grid-cols-3 gap-4">
                            <input
                              type="number"
                              value={height}
                              onChange={(e) => setHeight(e.target.value)}
                              className="px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur border border-white/20 focus:border-primary-500 focus:outline-none transition-all"
                              placeholder="Výška (cm)"
                            />
                            <input
                              type="number"
                              value={weight}
                              onChange={(e) => setWeight(e.target.value)}
                              className="px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur border border-white/20 focus:border-primary-500 focus:outline-none transition-all"
                              placeholder="Váha (kg)"
                            />
                            <input
                              type="number"
                              value={bust}
                              onChange={(e) => setBust(e.target.value)}
                              className="px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur border border-white/20 focus:border-primary-500 focus:outline-none transition-all"
                              placeholder="Prsa (cm)"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <input
                              type="number"
                              value={waist}
                              onChange={(e) => setWaist(e.target.value)}
                              className="px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur border border-white/20 focus:border-primary-500 focus:outline-none transition-all"
                              placeholder="Pas (cm)"
                            />
                            <input
                              type="number"
                              value={hips}
                              onChange={(e) => setHips(e.target.value)}
                              className="px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur border border-white/20 focus:border-primary-500 focus:outline-none transition-all"
                              placeholder="Boky (cm)"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <input
                              type="text"
                              value={hairColor}
                              onChange={(e) => setHairColor(e.target.value)}
                              className="px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur border border-white/20 focus:border-primary-500 focus:outline-none transition-all"
                              placeholder="Barva vlasů"
                            />
                            <input
                              type="text"
                              value={eyeColor}
                              onChange={(e) => setEyeColor(e.target.value)}
                              className="px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur border border-white/20 focus:border-primary-500 focus:outline-none transition-all"
                              placeholder="Barva očí"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 glass py-3 rounded-lg font-semibold hover:bg-white/5 transition-colors"
                      >
                        ← Zpět
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 gradient-primary py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {loading ? 'Registruji...' : 'Dokončit registraci'}
                      </button>
                    </div>
                  </>
                )}

                <div className="text-center text-sm text-gray-400">
                  Již máte účet?{' '}
                  <Link href="/prihlaseni" className="text-primary-400 hover:text-primary-300">
                    Přihlaste se
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
