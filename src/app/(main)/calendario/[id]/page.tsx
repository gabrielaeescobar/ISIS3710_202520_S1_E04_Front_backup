'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Zap, User } from 'lucide-react';
import type { Actividad, ActividadCreate, ActividadUpdate } from '../model/actividades.interfaces';
import { actividadToEvento } from '../model/actividades.interfaces';
import { ActividadForm } from '../_components/ActividadForm';
import { useLocale } from '@/components/locale-provider';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida');
}

export default function ActividadDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [actividad, setActividad] = useState<Actividad | null>(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [monedaBase, setMonedaBase] = useState<string>('USD');
  const { translate } = useLocale();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/actividades/${id}`, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(translate('eventos.detail.loadError', 'No se pudo cargar la actividad'));
        }
        const actividadData: Actividad = await res.json();
        setActividad(actividadData);
        
        // Cargar información del viaje para obtener moneda base
        if (actividadData.viajeId) {
          try {
            const viajeRes = await fetch(`${API_URL}/viajes/${actividadData.viajeId}`, {
              cache: 'no-store',
            });
            if (viajeRes.ok) {
              const viaje = await viajeRes.json();
              setMonedaBase(viaje.monedaBase ?? viaje.moneda_base ?? 'USD');
            }
          } catch (e) {
            console.error('Error cargando información del viaje:', e);
          }
        }
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : translate('eventos.detail.unexpectedError', 'Error inesperado'));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, translate]);

  const onDelete = async (): Promise<void> => {
    if (!confirm(translate('eventos.detail.deleteConfirm', '¿Eliminar esta actividad?'))) return;
    
    try {
      const res = await fetch(`${API_URL}/actividades/${id}`, { method: 'DELETE' });
      if (res.ok) {
        // Redirigir al viaje si existe, sino al calendario
        if (actividad?.viajeId) {
          router.push(`/viajes/${actividad.viajeId}`);
        } else {
          router.push('/calendario');
        }
        return;
      }
      alert(translate('eventos.detail.deleteError', 'No se pudo eliminar'));
    } catch (error) {
      console.error('Error eliminando actividad:', error);
      alert(translate('eventos.detail.deleteError', 'No se pudo eliminar'));
    }
  };

  const onUpdate = async (values: ActividadCreate): Promise<void> => {
    try {
      const updateData: ActividadUpdate = {
        nombre: values.nombre,
        fecha: values.fecha,
        horInicio: values.horInicio,
        horFin: values.horFin,
        precioPorPersona: values.precioPorPersona,
        precioTotal: values.precioTotal,
        intensidad: values.intensidad,
        descripcion: values.descripcion,
        ubicacionId: values.ubicacionId,
        usuarioPagadorId: values.usuarioPagadorId,
      };

      const res = await fetch(`${API_URL}/actividades/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Error desconocido' }));
        alert(error.message || translate('eventos.detail.updateError', 'No se pudo actualizar'));
        return;
      }

      const updated: Actividad = await res.json();
      setActividad(updated);
      setEdit(false);
    } catch (error) {
      console.error('Error actualizando actividad:', error);
      alert(translate('eventos.detail.updateError', 'No se pudo actualizar'));
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="page-title-row mb-2 gap-3 items-center">
          <div className="w-7 h-7 rounded bg-gray-200 animate-pulse" />
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="ml-auto h-8 w-28 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (err || !actividad) {
    return (
      <div className="p-6 space-y-4">
        <div className="page-title-row mb-2 gap-3 items-center">
          <Image
            src="/logo_blanco.png"
            alt="Layover"
            width={28}
            height={28}
            className="page-title-icon"
            priority
          />
          <h1 className="page-title text-2xl font-semibold text-gray-900">
            {translate('eventos.detail.title', 'Detalle de la actividad')}
          </h1>
          <div className="ml-auto">
            <Link
              href={actividad?.viajeId ? `/viajes/${actividad.viajeId}` : '/calendario'}
              className="inline-flex items-center rounded-md bg-[#d5efb8] px-4 py-2 text-sm font-medium text-black hover:bg-[#c3e19e] transition-colors"
            >
              ← {translate('eventos.detail.back', 'Volver')}
            </Link>
          </div>
        </div>
        <p className="text-red-600">{err ?? translate('eventos.detail.notFound', 'Actividad no encontrada')}</p>
      </div>
    );
  }

  const evento = actividadToEvento(actividad);
  const getMonedaSymbol = (moneda: string) => {
    switch (moneda) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'COP': return '$';
      case 'GBP': return '£';
      default: return moneda;
    }
  };

  const intensidadToDificultad = (intensidad?: "BAJA" | "MEDIA" | "ALTA" | null) => {
    if (!intensidad) return undefined;
    switch (intensidad) {
      case "BAJA": return translate('difficulty.easy', 'Fácil');
      case "MEDIA": return translate('difficulty.moderate', 'Moderado');
      case "ALTA": return translate('difficulty.hard', 'Exigente');
      default: return undefined;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="page-title-row mb-2 gap-3 items-center">
        <Image
          src="/logo_blanco.png"
          alt="Layover"
          width={28}
          height={28}
          className="page-title-icon"
          priority
        />
        <h1 className="page-title text-2xl font-semibold text-gray-900">
          {translate('eventos.detail.title', 'Detalle de la actividad')}
        </h1>

        <div className="ml-auto flex gap-3">
          <Link
            href={actividad.viajeId ? `/viajes/${actividad.viajeId}` : '/calendario'}
            className="inline-flex items-center rounded-md bg-[#d5efb8] px-4 py-2 text-sm font-medium text-black hover:bg-[#c3e19e] transition-colors"
          >
            ← {translate('eventos.detail.back', 'Volver')}
          </Link>

          {!edit && (
            <>
              <Button
                className="bg-[#d5efb8] text-black hover:bg-[#c3e19e]"
                onClick={() => setEdit(true)}
              >
                {translate('eventos.detail.edit', 'Editar')}
              </Button>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={onDelete}
              >
                {translate('eventos.detail.delete', 'Eliminar')}
              </Button>
            </>
          )}
        </div>
      </div>
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-6 space-y-4">
          {!edit ? (
            <>
              <div className="text-xl font-semibold">{actividad.nombre}</div>
              <div className="text-gray-700">
                {/* Formatear fecha  */}
                {(() => {
                  const [year, month, day] = actividad.fecha.split('-').map(Number);
                  const date = new Date(year, month - 1, day);
                  return date.toLocaleDateString('es-ES');
                })()}
                {actividad.horInicio ? ` · ${actividad.horInicio.split(':').slice(0, 2).join(':')}` : ''}
                {actividad.horFin ? ` - ${actividad.horFin.split(':').slice(0, 2).join(':')}` : ''}
              </div>
              {actividad.descripcion && (
                <p className="text-gray-700">{actividad.descripcion}</p>
              )}
              <div className="text-sm text-gray-500 space-y-2">
                {actividad.viajeId && (
                  <div>
                    {translate('eventos.detail.trip', 'Viaje')}: {actividad.viajeId}
                    {actividad.viaje?.nombre && ` - ${actividad.viaje.nombre}`}
                  </div>
                )}
                {actividad.ubicacion && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>{actividad.ubicacion.nombreLugar} {actividad.ubicacion.direccion ? `- ${actividad.ubicacion.direccion}` : ''}</span>
                  </div>
                )}
                {(actividad.precioTotal || actividad.precioPorPersona) && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    <span>
                      {actividad.precioTotal 
                        ? `${getMonedaSymbol(monedaBase)} ${typeof actividad.precioTotal === 'string' ? parseFloat(actividad.precioTotal).toLocaleString() : actividad.precioTotal.toLocaleString()} ${translate('eventos.detail.total', 'total')}`
                        : actividad.precioPorPersona
                          ? `${getMonedaSymbol(monedaBase)} ${typeof actividad.precioPorPersona === 'string' ? parseFloat(actividad.precioPorPersona).toLocaleString() : actividad.precioPorPersona.toLocaleString()} ${translate('eventos.detail.perPerson', '/persona')}`
                          : ''
                      }
                    </span>
                  </div>
                )}
                {actividad.intensidad && (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span>{intensidadToDificultad(actividad.intensidad)}</span>
                  </div>
                )}
                {actividad.usuarioPagador && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>{translate('eventos.detail.paidBy', 'Pagado por')}: {actividad.usuarioPagador.nombre}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <ActividadForm
              viajeId={actividad.viajeId}
              monedaBase={monedaBase}
              defaultValues={actividad}
              onSubmit={onUpdate}
              onCancel={() => setEdit(false)}
              submitLabel={translate('eventos.detail.updateEvent', 'Actualizar actividad')}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
