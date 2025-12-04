'use client'
import Image from "next/image";
import Link from "next/link";
import { useLocale } from '@/components/locale-provider';

export default function LoginOrRegister() {
  const { currentLocale, setCurrentLocale, translate } = useLocale();
  return (
    <main
      className="min-h-dvh w-full grid place-items-center"
      style={{
        // Degradado
        background:
          "radial-gradient(60% 60% at 50% 45%, var(--layover-from) 0%, #cfe1ff 35%, #d7efc7 70%, var(--layover-to) 100%)",
      }}
    >

      {/* Selector de idioma */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex gap-2 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-sm border">
          <button
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              currentLocale === 'es' 
                ? 'bg-[#3166B2] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setCurrentLocale('es')}
          >
            ES
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              currentLocale === 'en' 
                ? 'bg-[#3166B2] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setCurrentLocale('en')}
          >
            EN
          </button>
        </div>
      </div>

      <div className="w-full max-w-xl px-6 text-center">
        <div className="flex flex-col items-center gap-6">
          <Image
            src="/logo_blanco_sin_fondo.png"
            alt="Layover"
            width={120}
            height={120}
            priority
          />

          <h1 className="text-5xl md:text-6xl font-semibold text-white drop-shadow">
            Layover
          </h1>

          <div className="mt-2 flex flex-col gap-4 w-full max-w-xs mx-auto">
            <Link
              href="/login"
              className="inline-block rounded-xl bg-white/95 text-[#3b82f6] border border-[#c7dbff] px-6 py-3 font-semibold shadow-[0_2px_8px_rgba(0,0,0,.12)] hover:bg-white active:translate-y-px"
            >
              {translate('auth.login', 'Iniciar sesión')}
            </Link>

            <Link
              href="/register"
              className="inline-block rounded-xl bg-white/95 text-[#3b82f6] border border-[#c7dbff] px-6 py-3 font-semibold shadow-[0_2px_8px_rgba(0,0,0,.12)] hover:bg-white active:translate-y-px"
            >
              {translate('auth.register', 'Crear cuenta')}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
