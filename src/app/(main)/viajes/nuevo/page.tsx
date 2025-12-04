'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ViajeForm from '../ui/ViajeForm';
import type { ViajeFormData } from '../validation/viajeSchema';
import { useLocale } from '@/components/locale-provider';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida');
}

export default function NuevoViajePage() {
  const router = useRouter();
  const { translate } = useLocale();

  const handleSubmit = async (data: ViajeFormData) => {
    const res = await fetch(`${API_URL}/viajes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: data.nombre,
        descripcion: data.descripcion ?? undefined,
        fechaIni: data.fechaIni,
        fechaFin: data.fechaFin,
        imagenViajeUrl: data.imagenViajeUrl ?? undefined,
        presupuestoInicial: data.presupuestoInicial,
        monedaBase: data.monedaBase,
        grupoId: data.grupoId,
        destinoId: data.destinoId,
      }),
    });

    if (!res.ok) {
      let message = translate(
        'errors.createTrip',
        'No se pudo crear el viaje',
      );

      try {
        const json = await res.json();
        if (json?.message) {
          message = json.message;
        }
      } catch {
      }

      throw new Error(message);
    }

    router.push('/viajes');
  };

  return (
    <main className="app-content">
      <h1 className="page-title">
        {translate('form.create', 'Crear')} viaje
      </h1>

      <div className="mt-2 mb-6">
        <Link
          href="/viajes"
          className="back-link inline-flex items-center gap-2 text-blue-600 hover:underline"
        >
          <span aria-hidden>←</span>
          <span>
            {translate('viajes.backToList', 'Volver a viajes')}
          </span>
        </Link>
      </div>

      <ViajeForm onSubmit={handleSubmit} />
    </main>
  );
}
