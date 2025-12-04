'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ViajeForm from '@/app/(main)/viajes/ui/ViajeForm';
import type { Viaje } from '@/app/(main)/viajes/model/viaje.interfaces';
import type { ViajeFormData } from '@/app/(main)/viajes/validation/viajeSchema';
import { useLocale } from '@/components/locale-provider';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida');
}

export default function EditarViajePage() {
  const { viajeId } = useParams<{ viajeId: string }>();
  const router = useRouter();
  const { translate } = useLocale();

  const [viajeDefaultValues, setViajeDefaultValues] =
    useState<Partial<ViajeFormData> | null>(null);
  const [viajeNoEncontrado, setViajeNoEncontrado] = useState(false);

  useEffect(() => {
    if (!viajeId) return;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/viajes/${viajeId}`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          if (res.status === 404) {
            setViajeNoEncontrado(true);
          } else {
            console.error('Error al obtener viaje para editar:', res.status);
          }
          return;
        }

        const viajeEncontrado: Viaje = await res.json();

        const fechaIni =
          viajeEncontrado.fechaIni ?? viajeEncontrado.fecha_ini ?? '';
        const fechaFin =
          viajeEncontrado.fechaFin ?? viajeEncontrado.fecha_fin ?? '';

        const presupuesto = Number(
          viajeEncontrado.presupuestoInicial ??
            (typeof viajeEncontrado.presupuesto_inicial === 'number'
              ? viajeEncontrado.presupuesto_inicial
              : 0),
        );

        const moneda =
          (viajeEncontrado.monedaBase ??
            viajeEncontrado.moneda_base ??
            'COP') as ViajeFormData['monedaBase'];

        const grupoId =
          viajeEncontrado.grupo?.id ??
          viajeEncontrado.grupo_id ??
          0;

        const destinoId =
          typeof viajeEncontrado.destino === 'string'
            ? 0
            : viajeEncontrado.destino?.idUbicacion ?? 0;

        setViajeDefaultValues({
          nombre: viajeEncontrado.nombre,
          descripcion: viajeEncontrado.descripcion ?? '',
          fechaIni,
          fechaFin,
          imagenViajeUrl:
            viajeEncontrado.imagenViajeUrl ??
            viajeEncontrado.imagen_url ??
            '',
          presupuestoInicial: presupuesto,
          monedaBase: moneda,
          grupoId,
          destinoId,
        });
      } catch (error) {
        console.error(
          translate(
            'errors.trip.load',
            'Error cargando información del viaje:',
          ),
          error,
        );
      }
    })();
  }, [viajeId, translate]);

  const handleActualizarViaje = async (formData: ViajeFormData) => {
    const payload: Partial<ViajeFormData> = {
      nombre: formData.nombre,
      descripcion: formData.descripcion ?? undefined,
      fechaIni: formData.fechaIni,
      fechaFin: formData.fechaFin,
      imagenViajeUrl: formData.imagenViajeUrl ?? undefined,
      presupuestoInicial: formData.presupuestoInicial,
      monedaBase: formData.monedaBase,
      grupoId: formData.grupoId,
      destinoId: formData.destinoId,
    };

    const response = await fetch(`${API_URL}/viajes/${viajeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let message = translate(
        'errors.updateTrip',
        'No fue posible actualizar el viaje',
      );

      try {
        const responseData = await response.json();
        if (responseData?.message) {
          message = responseData.message;
        }
      } catch {
      }

      throw new Error(message);
    }

    router.push('/viajes');
  };

  if (viajeNoEncontrado) {
    return (
      <main className="app-content">
        <h1 className="page-title">
          {translate('viajes.notFound', 'Viaje no encontrado')}
        </h1>
        <button
          className="viaje-btn mt-4"
          onClick={() => router.push('/viajes')}
        >
          {translate('viajes.backToList', 'Volver a mis viajes')}
        </button>
      </main>
    );
  }

  if (!viajeDefaultValues) {
    return (
      <main className="app-content">
        <p className="viaje-desc">
          {translate(
            'viajes.loading',
            'Cargando información del viaje...',
          )}
        </p>
      </main>
    );
  }

  return (
    <main className="app-content">
      <h1 className="page-title">
        {translate('form.edit', 'Editar')}
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

      <ViajeForm
        onSubmit={handleActualizarViaje}
        defaultValues={viajeDefaultValues}
      />
    </main>
  );
}
