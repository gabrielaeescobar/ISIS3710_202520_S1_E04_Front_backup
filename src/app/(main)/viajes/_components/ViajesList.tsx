'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Calendar, DollarSign } from 'lucide-react';
import type { Viaje } from '../model/viaje.interfaces';
import { useLocale } from '@/components/locale-provider';
import { getAuthUser, getAuthToken } from '@/lib/auth-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida');
}

function formatDate(fecha: string | null | undefined) {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getCurrencySymbol(moneda?: string | null) {
  if (!moneda) return '';
  switch (moneda) {
    case 'EUR':
      return '€';
    case 'USD':
      return '$';
    case 'COP':
      return '$';
    case 'GBP':
      return '£';
    default:
      return '';
  }
}

export default function ViajesList() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [loading, setLoading] = useState(true);
  const { translate } = useLocale();

  useEffect(() => {
    const user = getAuthUser();

    if (!user) {
      console.error('No hay usuario autenticado, no se pueden cargar viajes');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const token = getAuthToken();

        const res = await fetch(`${API_URL}/usuarios/${user.id}/viajes`, {
          cache: 'no-store',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!res.ok) {
          console.error(
            'Error al llamar /usuarios/:id/viajes en el back',
            res.status,
          );
          setLoading(false);
          return;
        }

        const json: Viaje[] = await res.json();
        setViajes(json);
        console.log('Viajes del usuario recibidos desde el back:', json);
      } catch (e) {
        console.error(
          'Error de red llamando /usuarios/:id/viajes en el back',
          e,
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <section>
        <div className="viajes-boton-viaje">
          <Link
            href="/viajes/nuevo"
            className="crear-viaje-button"
            aria-label={translate('viajes.createNew', 'Crear nuevo viaje')}
          >
            <span>{translate('viajes.createNew', 'Crear nuevo viaje')}</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              className="crear-viaje-icon"
            >
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </Link>
        </div>

        <p className="mt-4 text-gray-500">
          {translate('viajes.loading', 'Cargando viajes...')}
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="viajes-boton-viaje">
        <Link
          href="/viajes/nuevo"
          className="crear-viaje-button"
          aria-label={translate('viajes.createNew', 'Crear nuevo viaje')}
        >
          <span>{translate('viajes.createNew', 'Crear nuevo viaje')}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            className="crear-viaje-icon"
          >
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </Link>
      </div>

      {/* Mensaje cuando el usuario no tiene viajes*/}
      {!viajes.length && (
        <p className="mt-4 text-gray-500">
          {translate(
            'viajes.emptyUserTrips',
            'Aún no tienes viajes asociados a tus grupos.',
          )}
        </p>
      )}

      <div className="viajes-grid">
        {viajes.map((viaje) => {
          const imagen =
            (viaje.imagenViajeUrl && viaje.imagenViajeUrl.trim()) ||
            (viaje.imagen_url && viaje.imagen_url.trim()) ||
            '';

          const destinoNombre =
            typeof viaje.destino === 'string'
              ? viaje.destino
              : viaje.destino?.nombre ?? '';

          const fechaIniRaw = viaje.fechaIni ?? viaje.fecha_ini ?? '';
          const fechaFinRaw = viaje.fechaFin ?? viaje.fecha_fin ?? '';

          const fechaIni = formatDate(fechaIniRaw);
          const fechaFin = formatDate(fechaFinRaw);

          // presupuesto bruto como number
          const presupuestoRaw =
            viaje.presupuestoInicial ??
            (viaje.presupuesto_inicial != null
              ? Number(viaje.presupuesto_inicial)
              : 0);

          const presupuestoNumber = Number(presupuestoRaw) || 0;

          const moneda = viaje.monedaBase ?? viaje.moneda_base ?? '';
          const symbol = getCurrencySymbol(moneda);

          const presupuestoFormatted =
            presupuestoNumber > 0
              ? presupuestoNumber.toLocaleString('en-US', {
                  maximumFractionDigits: 0,
                })
              : '';

          return (
            <article key={viaje.id} className="viaje-card">
              {imagen ? (
                <Image
                  src={imagen}
                  alt={destinoNombre || viaje.nombre}
                  width={640}
                  height={360}
                  className="viaje-image w-full h-auto"
                  unoptimized
                />
              ) : (
                <div className="viaje-image" aria-label="Sin imagen" />
              )}

              <h3 className="viaje-title">
                {viaje.nombre}
                {destinoNombre && ` - ${destinoNombre}`}
              </h3>
              {viaje.descripcion && (
                <p className="viaje-desc">{viaje.descripcion}</p>
              )}

              <div className="viaje-meta space-y-1 mt-2">
                {/* Fechas */}
                <div className="flex items-center text-sm text-gray-600 gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">
                    {translate('viajes.dates', 'Dates')}:
                  </span>
                  <span>
                    {fechaIni} {fechaFin && '–'} {fechaFin}
                  </span>
                </div>

                {/* Presupuesto */}
                <div className="flex items-center text-sm text-gray-600 gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">
                    {translate('viajes.budget', 'Budget')}:
                  </span>
                  <span>
                    {symbol && `${symbol} `}
                    {presupuestoFormatted}
                    {moneda && ` ${moneda}`}
                  </span>
                </div>
              </div>

              <div className="viaje-actions">
                <Link href={`/viajes/${viaje.id}`} className="viaje-btn">
                  {translate('viajes.moreInfo', 'Más información')}
                </Link>
              </div>

              <div className="viaje-actions-secondary">
                <Link
                  href={`/viajes/editar/${viaje.id}`}
                  className="viaje-btn-update"
                >
                  {translate('viajes.edit', 'Editar')}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
