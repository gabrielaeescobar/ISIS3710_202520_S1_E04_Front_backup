'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ActividadForm } from '../../_components/ActividadForm';
import type { ActividadCreate, Actividad } from '../../model/actividades.interfaces';
import { useLocale } from '@/components/locale-provider';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida');
}

function EditarActividadContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { translate } = useLocale();
  const id = params.id;

  const [loading, setLoading] = useState(false);
  const [actividad, setActividad] = useState<Actividad | null>(null);
  const [loadingActividad, setLoadingActividad] = useState(true);
  const [viajeId, setViajeId] = useState<number | undefined>(undefined);
  const [monedaBase, setMonedaBase] = useState<string>('USD');
  const [grupoSize, setGrupoSize] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    (async () => {
      try {
        // Cargar la actividad primero
        const actividadRes = await fetch(`${API_URL}/actividades/${id}`, {
          cache: 'no-store',
        });

        if (!actividadRes.ok) {
          throw new Error(translate('eventos.detail.loadError', 'No se pudo cargar la actividad'));
        }

        const actividadData: Actividad = await actividadRes.json();
        setActividad(actividadData);
        
        // Obtener viajeId de diferentes formas posibles
        const viajeIdValue = actividadData.viajeId 
          ?? actividadData.viaje?.id 
          ?? (actividadData as any).viaje?.idViaje
          ?? undefined;
        
        if (!viajeIdValue) {
          throw new Error(translate('eventos.detail.noViaje', 'La actividad no tiene un viaje asociado'));
        }
        
        setViajeId(Number(viajeIdValue));

        // Cargar información del viaje para obtener moneda base y grupoSize
        try {
          const viajeRes = await fetch(`${API_URL}/viajes/${viajeIdValue}`, {
            cache: 'no-store',
          });
          
          if (viajeRes.ok) {
            const viaje = await viajeRes.json();
            const moneda = viaje.monedaBase ?? viaje.moneda_base ?? 'USD';
            setMonedaBase(moneda);

            const grupoId: number | undefined =
              viaje.grupo?.id ??
              viaje.grupo_id ??
              viaje.grupoId ??
              undefined;

            if (grupoId) {
              try {
                const grupoRes = await fetch(`${API_URL}/grupo/${grupoId}`, {
                  cache: 'no-store',
                });

                if (grupoRes.ok) {
                  const grupo = await grupoRes.json();

                  let integrantesCount: number | undefined;

                  if (Array.isArray(grupo.integrantes)) {
                    integrantesCount = grupo.integrantes.length;
                  } else if (Array.isArray(grupo.usuarios)) {
                    integrantesCount = grupo.usuarios.length;
                  } else if (typeof grupo.tamano === 'number') {
                    integrantesCount = grupo.tamano;
                  }

                  if (typeof integrantesCount === 'number' && integrantesCount > 0) {
                    setGrupoSize(integrantesCount);
                  }
                }
              } catch (e) {
                console.error('Error cargando información del grupo del viaje:', e);
              }
            }
          }
        } catch (e) {
          console.error('Error cargando información del viaje:', e);
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : translate('eventos.detail.unexpectedError', 'Error inesperado'));
      } finally {
        setLoadingActividad(false);
      }
    })();
  }, [id, translate]);

  const onSubmit = async (values: ActividadCreate) => {
    if (!id) return;
    
    setLoading(true);
    try {
      const updateData = {
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
        const errorText = await res.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Error desconocido' };
        }
        throw new Error(errorData.message || errorData.error || translate('eventos.detail.updateError', 'No se pudo actualizar'));
      }

      // Redirigir al viaje si existe, sino al calendario
      const redirectViajeId = viajeId ?? actividad?.viajeId;
      if (redirectViajeId) {
        router.push(`/viajes/${redirectViajeId}`);
      } else {
        router.push('/calendario');
      }
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : translate('eventos.detail.updateError', 'No se pudo actualizar'));
    } finally {
      setLoading(false);
    }
  };

  if (loadingActividad) {
    return (
      <div className="p-6 space-y-8">
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
            {translate('eventos.edit.title', 'Editar Actividad')}
          </h1>
        </div>
        <Card className="border rounded-2xl shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center text-gray-500">
                <div className="w-8 h-8 mx-auto mb-2 text-gray-300 animate-spin">
                  <svg fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"/>
                  </svg>
                </div>
                <p>{translate('eventos.edit.loading', 'Cargando actividad...')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !actividad) {
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
            {translate('eventos.edit.title', 'Editar Actividad')}
          </h1>
          <div className="ml-auto">
            <Link
              href="/calendario"
              className="inline-flex items-center rounded-md bg-[#d5efb8] px-4 py-2 text-sm font-medium text-black hover:bg-[#c3e19e] transition-colors"
            >
              ← {translate('eventos.edit.back', 'Volver')}
            </Link>
          </div>
        </div>
        <p className="text-red-600">{error ?? translate('eventos.detail.notFound', 'Actividad no encontrada')}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
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
          {translate('eventos.edit.title', 'Editar Actividad')}
        </h1>

        <div className="ml-auto">
          <Link
            href={actividad.viajeId ? `/viajes/${actividad.viajeId}` : '/calendario'}
            className="inline-flex items-center rounded-md bg-[#d5efb8] px-4 py-2 text-sm font-medium text-black hover:bg-[#c3e19e] transition-colors"
          >
            ← {translate('eventos.edit.back', 'Volver')}
          </Link>
        </div>
      </div>

      <Card className="border rounded-2xl shadow-sm">
        <CardContent className="p-6 space-y-6">
          <ActividadForm
            viajeId={actividad.viajeId}
            monedaBase={monedaBase}
            grupoSize={grupoSize}
            defaultValues={actividad}
            onSubmit={onSubmit}
            onCancel={() => router.push(actividad.viajeId ? `/viajes/${actividad.viajeId}` : '/calendario')}
            loading={loading}
            submitLabel={translate('eventos.edit.submitLabel', 'Actualizar actividad')}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function EditarActividadPage() {
  return (
    <Suspense fallback={
      <div className="p-6 space-y-8">
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
            Editar Actividad
          </h1>
          <div className="ml-auto">
            <Link
              href="/calendario"
              className="inline-flex items-center rounded-md bg-[#d5efb8] px-4 py-2 text-sm font-medium text-black hover:bg-[#c3e19e] transition-colors"
            >
              ← Volver
            </Link>
          </div>
        </div>
        <Card className="border rounded-2xl shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center text-gray-500">
                <div className="w-8 h-8 mx-auto mb-2 text-gray-300 animate-spin">
                  <svg fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"/>
                  </svg>
                </div>
                <p>Cargando...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <EditarActividadContent />
    </Suspense>
  );
}

