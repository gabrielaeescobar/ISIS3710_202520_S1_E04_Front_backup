'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/components/locale-provider';
import { saveAuthSession, type AuthUser } from '@/lib/auth-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error('NEXT_PUBLIC_API_URL no está definida');
}

export default function Register() {
  const router = useRouter();
  const { translate } = useLocale();

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    correo: '',
    usuario: '',
    contraseña: '',
    pais: '',
    moneda: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (
        !form.nombre ||
        !form.apellido ||
        !form.fechaNacimiento ||
        !form.correo ||
        !form.usuario ||
        !form.contraseña
      ) {
        setError(
          translate(
            'auth.completeFields',
            'Por favor completa todos los campos obligatorios.',
          ),
        );
        setLoading(false);
        return;
      }

      const nombreCompleto = `${form.nombre.trim()} ${form.apellido.trim()}`.trim();
      const monedaBaseUsuario = (form.moneda || 'USD').toUpperCase();

      const payload = {
        nombre: nombreCompleto,
        username: form.usuario.trim(),
        email: form.correo.trim(),
        contrasena: form.contraseña.trim(),
        monedaBaseUsuario,
        fotoPerfilUrl: '/userDefault.png',
      };

      if (!API_URL) {
        throw new Error('NEXT_PUBLIC_API_URL no está definida');
      }

      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('Error register:', res.status, text);
        setError(
          translate(
            'auth.errorCreateUser',
            'Error al crear el usuario (revisa si el correo ya existe).',
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
        translate('auth.serverError', 'Error al conectar con el servidor.'),
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
              {translate('auth.createAccount', 'Crear cuenta')}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
           

            <input
              name="nombre"
              placeholder={translate('auth.name', 'Nombre(s)*')}
              value={form.nombre}
              onChange={handleChange}
              className="rounded-md border px-3 py-2 text-sm focus:border-[#93c5fd] focus:ring-2 focus:ring-[#93c5fd55] transition"
              required
            />
            <input
              name="apellido"
              placeholder={translate('auth.lastName', 'Apellido(s)*')}
              value={form.apellido}
              onChange={handleChange}
              className="rounded-md border px-3 py-2 text-sm focus:border-[#93c5fd] focus:ring-2 focus:ring-[#93c5fd55] transition"
              required
            />
            <input
              type="date"
              name="fechaNacimiento"
              placeholder={translate('auth.birthdate', 'Fecha nacimiento*')}
              value={form.fechaNacimiento}
              onChange={handleChange}
              className="rounded-md border px-3 py-2 text-sm focus:border-[#93c5fd] focus:ring-2 focus:ring-[#93c5fd55] transition col-span-2 sm:col-span-1"
              required
            />
            <input
              name="correo"
              type="email"
              placeholder={translate('auth.email', 'Correo*')}
              value={form.correo}
              onChange={handleChange}
              className="rounded-md border px-3 py-2 text-sm focus:border-[#93c5fd] focus:ring-2 focus:ring-[#93c5fd55] transition"
              required
            />
            <input
              name="usuario"
              placeholder={translate('auth.username', 'Usuario*')}
              value={form.usuario}
              onChange={handleChange}
              className="rounded-md border px-3 py-2 text-sm focus:border-[#93c5fd] focus:ring-2 focus:ring-[#93c5fd55] transition"
              required
            />
            <input
              name="contraseña"
              type="password"
              placeholder={translate('auth.password', 'Contraseña*')}
              value={form.contraseña}
              onChange={handleChange}
              className="rounded-md border px-3 py-2 text-sm focus:border-[#93c5fd] focus:ring-2 focus:ring-[#93c5fd55] transition"
              required
            />
            <input
              name="pais"
              placeholder={translate('auth.country', 'País')}
              value={form.pais}
              onChange={handleChange}
              className="rounded-md border px-3 py-2 text-sm focus:border-[#93c5fd] focus:ring-2 focus:ring-[#93c5fd55] transition"
            />
            <input
              name="moneda"
              placeholder={translate(
                'auth.currency',
                'Moneda (USD, COP, ...)',
              )}
              value={form.moneda}
              onChange={handleChange}
              className="rounded-md border px-3 py-2 text-sm focus:border-[#93c5fd] focus:ring-2 focus:ring-[#93c5fd55] transition"
            />

            {error && (
              <div className="col-span-2 text-sm text-red-600 font-semibold pt-1">
                {error}
              </div>
            )}

            <div className="col-span-2 flex flex-col gap-2 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md border border-[#c6e99a] bg-[#D8F1B0] text-[#1f2937] font-semibold py-2 shadow-sm hover:brightness-95 active:translate-y-px disabled:opacity-60"
              >
                {loading
                  ? translate('auth.creatingAccount', 'Creando cuenta…')
                  : translate('auth.register', 'Crear cuenta')}
              </button>

              <Link
                href="/loginOrRegister"
                className="block text-center w-full rounded-md border bg-[#eee9e6] text-[#3b3b3b] font-semibold py-2 shadow-sm hover:brightness-95 active:translate-y-px"
              >
                {translate('auth.back', 'Regresar')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
