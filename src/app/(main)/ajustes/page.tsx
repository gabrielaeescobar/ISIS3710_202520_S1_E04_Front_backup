'use client';

import { useLocale } from '@/components/locale-provider';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { currentLocale, setCurrentLocale, translate } = useLocale();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('layover_user');
    router.push('/loginOrRegister');
  };

  return (
    <div className="p-6">
      <div>
        <div className="page-title-row mb-4 gap-3 items-center">
          <Image
            src="/logo_blanco.png" 
            alt="Layover"
            width={28}
            height={28}
            className="page-title-icon"
            priority
          />
          <h1 className="text-2xl font-bold">
            {translate('nav.settings', 'Ajustes')}
          </h1>
        </div>
        
        <div className="mb-8">
          <label className="block mb-2">
            {translate('settings.language', 'Idioma')}
          </label>
          <div className="flex gap-3">
            <button
              className="viaje-btn"
              onClick={() => setCurrentLocale('es')}
              aria-pressed={currentLocale === 'es'}
            >
              {translate('settings.spanish', 'Español')}
            </button>
            <button
              className="viaje-btn"
              onClick={() => setCurrentLocale('en')}
              aria-pressed={currentLocale === 'en'}
            >
              {translate('settings.english', 'English')}
            </button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {translate('settings.current', 'Actual:')} <b>{currentLocale.toUpperCase()}</b>
          </p>
        </div>

        <div className="flex justify-start">
          <button
            onClick={handleLogout}
            className="bg-[#9ca3af] hover:bg-[#6b7280] text-white py-2 px-4 rounded-full text-sm transition-colors"
          >
            {translate('settings.logout', 'Cerrar Sesión')}
          </button>
        </div>
      </div>
    </div>
  );
}