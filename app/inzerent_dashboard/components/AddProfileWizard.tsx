'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check, ImageIcon } from 'lucide-react';
import { Category } from '@prisma/client';

interface Business {
  id: string;
  name: string;
  phone: string;
  city: string;
  profileType: string;
}

interface Service {
  id: string;
  name: string;
  category: string;
}

interface AddProfileWizardProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business | null;
  availableServices: Service[];
  onSubmit: (formData: any) => Promise<void>;
}

const CATEGORIES = [
  { value: 'HOLKY_NA_SEX', label: 'Holky na sex', icon: '💋' },
  { value: 'EROTICKE_MASERKY', label: 'Erotické masérky', icon: '💆‍♀️' },
  { value: 'DOMINA', label: 'Domina', icon: '👠' },
  { value: 'DIGITALNI_SLUZBY', label: 'Digitální služby', icon: '📱' },
];

const ROLES = [
  'Studentka', 'Školačka', 'MILF', 'Zralá žena', 'Holka odvedle',
  'Modelka', 'Fitness', 'Businesswoman', 'Sekretářka', 'Domina',
  'Submisivní', 'Sugar Baby', 'Pornohvězda', 'Umělkyně', 'Tanečnice'
];

export default function AddProfileWizard({
  isOpen,
  onClose,
  business,
  availableServices,
  onSubmit
}: AddProfileWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    category: '' as Category | '',
    description: '',

    // Physical attributes
    height: '',
    weight: '',
    bust: '',
    hairColor: '',
    eyeColor: '',
    breastType: '',
    bodyType: '',

    // Additional info
    role: '',
    nationality: '',
    orientation: '',
    tattoos: '',
    piercing: '',
    languages: [] as string[],

    // Services
    services: [] as string[],
    offersEscort: false,
    travels: false,

    // Photos
    photos: [] as File[],
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageToggle = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - formData.photos.length;
    const filesToAdd = files.slice(0, remaining);

    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...filesToAdd]
    }));
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const getServicesByCategory = (category: string) => {
    const categoryMap: Record<string, string[]> = {
      'escort': ['PRAKTIKY'],
      'massage': ['DRUHY_MASAZI', 'EXTRA_SLUZBY'],
      'bdsm': ['BDSM_PRAKTIKY'],
      'online': ['ONLINE_SLUZBY']
    };
    const categories = categoryMap[category] || [];
    return availableServices.filter(s => categories.includes(s.category));
  };

  const getAvailableServiceTabs = () => {
    if (!business) return ['escort', 'massage', 'bdsm', 'online'];

    const typeMap: Record<string, string[]> = {
      'PRIVAT': ['escort'],
      'ESCORT_AGENCY': ['escort'],
      'MASSAGE_SALON': ['massage'],
      'DIGITAL_AGENCY': ['online'],
      'SWINGERS_CLUB': ['escort', 'bdsm'],
      'NIGHT_CLUB': ['escort'],
      'STRIP_CLUB': ['escort'],
      'SOLO': ['escort', 'massage', 'bdsm', 'online'],
    };

    return typeMap[business.profileType] || ['escort'];
  };

  const [activeServiceTab, setActiveServiceTab] = useState(getAvailableServiceTabs()[0]);

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.age && formData.category;
      case 2:
        return true; // Physical attributes are optional
      case 3:
        return true; // Services are optional
      case 4:
        return true; // Photos are optional
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="glass rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Přidat nový profil</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm transition-all ${
                      step < currentStep
                        ? 'bg-green-500 text-white'
                        : step === currentStep
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {step < currentStep ? <Check className="w-4 h-4" /> : step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`h-0.5 flex-1 transition-all ${
                        step < currentStep ? 'bg-green-500' : 'bg-white/10'
                      }`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Step labels */}
          <div className="grid grid-cols-4 gap-2 mt-2">
            <div className={`text-xs text-center ${currentStep === 1 ? 'text-primary-400 font-medium' : 'text-gray-400'}`}>
              Základní údaje
            </div>
            <div className={`text-xs text-center ${currentStep === 2 ? 'text-primary-400 font-medium' : 'text-gray-400'}`}>
              Fyzické vlastnosti
            </div>
            <div className={`text-xs text-center ${currentStep === 3 ? 'text-primary-400 font-medium' : 'text-gray-400'}`}>
              Služby
            </div>
            <div className={`text-xs text-center ${currentStep === 4 ? 'text-primary-400 font-medium' : 'text-gray-400'}`}>
              Fotografie
            </div>
          </div>

          {/* Business info */}
          {business && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-xs text-blue-300">
                <strong>Podnik:</strong> {business.name} · <strong>Tel:</strong> {business.phone} · <strong>Město:</strong> {business.city}
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Jméno <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                  placeholder="Např. Adéla"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Věk <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="18"
                  max="99"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                  placeholder="18"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Kategorie <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value as Category })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.category === cat.value
                          ? 'border-primary-500 bg-primary-500/20'
                          : 'border-white/10 hover:border-white/20 bg-white/5'
                      }`}
                    >
                      <div className="text-3xl mb-2">{cat.icon}</div>
                      <div className="text-sm font-medium">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Popis
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors resize-none"
                  placeholder="Napište něco o sobě..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Physical Attributes */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Výška (cm)</label>
                  <input
                    type="number"
                    min="140"
                    max="200"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                    placeholder="165"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Váha (kg)</label>
                  <input
                    type="number"
                    min="40"
                    max="150"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                    placeholder="55"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Poprsí</label>
                  <input
                    type="text"
                    value={formData.bust}
                    onChange={(e) => setFormData({ ...formData, bust: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                    placeholder="85C"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                >
                  <option value="">Vyberte...</option>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Barva vlasů</label>
                  <select
                    value={formData.hairColor}
                    onChange={(e) => setFormData({ ...formData, hairColor: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                  >
                    <option value="">Vyberte...</option>
                    <option value="Blonde">Blond</option>
                    <option value="Brunette">Hnědé</option>
                    <option value="Black">Černé</option>
                    <option value="Red">Rezavé</option>
                    <option value="Other">Jiné</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Barva očí</label>
                  <select
                    value={formData.eyeColor}
                    onChange={(e) => setFormData({ ...formData, eyeColor: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                  >
                    <option value="">Vyberte...</option>
                    <option value="Blue">Modré</option>
                    <option value="Green">Zelené</option>
                    <option value="Brown">Hnědé</option>
                    <option value="Gray">Šedé</option>
                    <option value="Other">Jiné</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Jazyky</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Čeština', 'Angličtina', 'Němčina', 'Ruština', 'Slovenština', 'Polština', 'Španělština', 'Francouzština'].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleLanguageToggle(lang)}
                      className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                        formData.languages.includes(lang)
                          ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                          : 'border-white/10 hover:bg-white/5'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tetování</label>
                  <select
                    value={formData.tattoos}
                    onChange={(e) => setFormData({ ...formData, tattoos: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                  >
                    <option value="">Vyberte...</option>
                    <option value="Yes">Ano</option>
                    <option value="No">Ne</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Piercing</label>
                  <select
                    value={formData.piercing}
                    onChange={(e) => setFormData({ ...formData, piercing: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                  >
                    <option value="">Vyberte...</option>
                    <option value="Yes">Ano</option>
                    <option value="No">Ne</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Services */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">
                  Nabízené služby (volitelné)
                </label>

                {/* Service tabs */}
                {getAvailableServiceTabs().length > 1 && (
                  <div className="flex gap-2 mb-4 bg-white/5 p-1 rounded-lg">
                    {getAvailableServiceTabs().map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveServiceTab(tab)}
                        className={`flex-1 px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                          activeServiceTab === tab
                            ? 'bg-primary-500 text-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {tab === 'escort' && 'Escort'}
                        {tab === 'massage' && 'Masáže'}
                        {tab === 'bdsm' && 'BDSM'}
                        {tab === 'online' && 'Online'}
                      </button>
                    ))}
                  </div>
                )}

                {/* Services grid */}
                <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto p-2 bg-white/5 rounded-lg">
                  {getServicesByCategory(activeServiceTab).map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleServiceToggle(service.id)}
                      className={`px-3 py-2 rounded-lg border transition-all text-sm text-left ${
                        formData.services.includes(service.id)
                          ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                          : 'border-white/10 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      {service.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.offersEscort}
                    onChange={(e) => setFormData({ ...formData, offersEscort: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Nabízí escort</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.travels}
                    onChange={(e) => setFormData({ ...formData, travels: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Dojíždí</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Photos */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">
                  Fotografie (max 10)
                </label>

                {/* Upload button */}
                <div className="mb-4">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2 px-6 py-8 bg-white/5 border-2 border-dashed border-white/20 rounded-lg hover:border-primary-400 hover:bg-white/10 transition-all">
                      <ImageIcon className="w-6 h-6" />
                      <span>Klikněte pro výběr fotek</span>
                    </div>
                  </label>
                </div>

                {/* Photo preview */}
                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-5 gap-3">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Fotka ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Nahráno: {formData.photos.length}/10 fotek
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
              disabled={loading}
            >
              <ChevronLeft className="w-4 h-4" />
              Zpět
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            disabled={loading}
          >
            Zrušit
          </button>
          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex-1 px-6 py-3 gradient-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Další
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !isStepValid()}
              className="flex-1 px-6 py-3 gradient-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Přidávám...' : 'Přidat profil'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
