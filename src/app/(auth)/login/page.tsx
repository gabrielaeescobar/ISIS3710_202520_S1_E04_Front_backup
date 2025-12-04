'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from '@/components/locale-provider';
import { saveAuthSession, type AuthUser } from '@/lib/auth-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error('NEXT_PUBLIC_API_URL no está definida');
}

export default function Login() {
  const router = useRouter();
  const { translate } = useLocale();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!API_URL) {
        throw new Error('NEXT_PUBLIC_API_URL no está definida');
      }

      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          contrasena: password.trim(),
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('Error login:', res.status, text);
        setError(
          translate(
            'auth.invalidCredentials',
            'Correo o contraseña incorrectos.',
          ),
        );
        setLoading(false);
        return;
      }

      const data = await res.json();
      const user: AuthUser = data.user ?? data;
      const token: string | undefined = data.accessToken;

      saveAuthSession(user, token);

      router.push('/home');
    } catch (e) {
      console.error(e);
      setError(
        translate(
          'auth.serverError',
          'Error al conectar con el servidor de autenticación.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-dvh w-full grid place-items-center"
      style={{
        background:
          'radial-gradient(60% 60% at 50% 45%, var(--layover-from) 0%, #cfe1ff 35%, #d7efc7 70%, var(--layover-to) 100%)',
      }}
    >
      <div className="w-full max-w-md px-4">
        <div className="mx-auto rounded-2xl bg-white/95 border border-[#e5e7eb] shadow-[0_6px_24px_rgba(0,0,0,.08)] p-6 md:p-7">
          <div className="flex flex-col items-center gap-1 mb-4">
            <Image
              src="/logo_blanco_sin_fondo.png"
              alt="Layover"
              width={56}
              height={56}
              className="opacity-90"
              priority
            />
            <h1 className="text-[28px] font-semibold text-[#3166B2] leading-tight">
              Layover
            </h1>
            <p className="text-sm text-[#3166B2] font-semibold">
              {translate('auth.login', 'Iniciar sesión')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-[#93c5fd] focus:ring-2 focus:ring-[#93c5fd55] transition"
              placeholder={translate('auth.email', 'Correo*')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />

            <input
              type="password"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-[#93c5fd] focus:ring-2 focus:ring-[#93c5fd55] transition"
              placeholder={translate('auth.password', 'Contraseña*')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="text-sm text-red-600 font-semibold pt-1">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md border border-[#c6e99a] bg-[#D8F1B0] text-[#1f2937] font-semibold py-2 shadow-sm hover:brightness-95 active:translate-y-px disabled:opacity-60"
            >
              {loading
                ? translate('auth.loggingIn', 'Iniciando sesión…')
                : translate('auth.login', 'Iniciar sesión')}
            </button>

            <Link
              href="/loginOrRegister"
              className="block text-center w-full rounded-md border bg-[#eee9e6] text-[#3b3b3b] font-semibold py-2 shadow-sm hover:brightness-95 active:translate-y-px"
            >
              {translate('auth.back', 'Regresar')}
            </Link>
          </form>
        </div>
      </div>
    </main>
  );
}
