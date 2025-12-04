'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReservasList from './_components/ReservasList';
import { useLocale } from '@/components/locale-provider';
import type { Viaje } from '@/app/(main)/viajes/model/viaje.interfaces';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida');
}

export default function ReservasPage() {
  const params = useParams();
  const viajeId = params.viajeId as string;
  const { translate } = useLocale();
  const [viaje, setViaje] = useState<Viaje | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!viajeId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_URL}/viajes/${viajeId}`, {
          cache: 'no-store',
        });

        if (res.ok) {
          const data: Viaje = await res.json();
          setViaje(data);
        }
      } catch (error) {
        console.error('Error cargando viaje:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [viajeId]);

  if (!viajeId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {translate('reservas.tripNotSpecified', 'Viaje no especificado')}
        </h2>
        <p className="text-gray-600">
          {translate('reservas.noTripSpecified', 'No se ha especificado un viaje para ver las reservas.')}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">
            {translate('reservas.loading', 'Cargando...')}
          </span>
        </div>
      </div>
    );
  }

  const monedaBase = viaje?.monedaBase ?? viaje?.moneda_base ?? 'USD';

  return (
    <div className="container mx-auto px-4 py-8">
      <ReservasList viajeId={viajeId} monedaBase={monedaBase} />
    </div>
  );
}

