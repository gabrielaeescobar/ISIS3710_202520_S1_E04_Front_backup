'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ActividadForm } from '../_components/ActividadForm';
import type { ActividadCreate } from '../model/actividades.interfaces';
import { useLocale } from '@/components/locale-provider';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida');
}

function NuevoActividadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { translate } = useLocale();

  const [loading, setLoading] = useState(false);
  const [prefillDate, setPrefillDate] = useState<string | undefined>(undefined);
  const [viajeId, setViajeId] = useState<number | undefined>(undefined);
  const [monedaBase, setMonedaBase] = useState<string>('USD');
  const [loadingViaje, setLoadingViaje] = useState(true);
  const [grupoSize, setGrupoSize] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fechaParam = searchParams.get('fecha');
    const viajeIdParam = searchParams.get('viajeId');

    if (fechaParam) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(fechaParam)) {
        setPrefillDate(fechaParam);
      } else {
      const date = new Date(fechaParam);
      if (!isNaN(date.getTime())) {
          setPrefillDate(
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
              2,
              '0',
            )}-${String(date.getDate()).padStart(2, '0')}`,
          );
        }
      }
    }

    if (viajeIdParam) {
      const n = Number(viajeIdParam);
      if (Number.isFinite(n) && n > 0) {
        setViajeId(n);
        // Obtener moneda base
        loadViajeInfo(n);
      } else {
        setLoadingViaje(false);
      }
    } else {
      setLoadingViaje(false);
    }
  }, [searchParams]);

  const loadViajeInfo = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/viajes/${id}`, {
        cache: 'no-store',
      });

      if (res.ok) {
        const viaje = await res.json();
        setMonedaBase(viaje.monedaBase ?? viaje.moneda_base ?? 'USD');

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
    } catch (error) {
      console.error('Error cargando información del viaje:', error);
    } finally {
      setLoadingViaje(false);
    }
  };

  const onSubmit = async (values: ActividadCreate) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/actividades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(error.message || translate('eventos.create.error', 'Error creando actividad'));
      }

      if (viajeId) {
        router.push(`/viajes/${viajeId}`);
      } else {
        router.push('/calendario');
      }
      router.refresh();
    } catch (error) {
      console.error('Error creando actividad:', error);
      alert(error instanceof Error ? error.message : translate('eventos.create.error', 'Error creando actividad'));
    } finally {
      setLoading(false);
    }
  };

  if (loadingViaje || !viajeId) {
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
            {translate('eventos.create.title', 'Nueva Actividad')}
          </h1>
        </div>
        <Card className="border rounded-2xl shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center text-gray-500">
                {loadingViaje ? (
                  <>
                    <div className="w-8 h-8 mx-auto mb-2 text-gray-300 animate-spin">
                      <svg fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"/>
                      </svg>
                    </div>
                    <p>{translate('eventos.create.loading', 'Cargando...')}</p>
                  </>
                ) : (
                  <p>{translate('eventos.create.noViaje', 'Se requiere un viaje para crear una actividad')}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const defaults: Partial<ActividadCreate> = {
    ...(prefillDate ? { fecha: prefillDate } : {}),
    viajeId,
  };

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
          {translate('eventos.create.title', 'Nueva Actividad')}
        </h1>

        <div className="ml-auto">
          <Link
            href={viajeId ? `/viajes/${viajeId}` : '/calendario'}
            className="inline-flex items-center rounded-md bg-[#d5efb8] px-4 py-2 text-sm font-medium text-black hover:bg-[#c3e19e] transition-colors"
          >
            ← {translate('eventos.create.back', 'Volver')}
          </Link>
        </div>
      </div>

      <Card className="border rounded-2xl shadow-sm">
        <CardContent className="p-6 space-y-6">
          <ActividadForm
            viajeId={viajeId}
            monedaBase={monedaBase}
            grupoSize={grupoSize}
            defaultValues={Object.keys(defaults).length > 0 ? defaults as any : undefined}
            onSubmit={onSubmit}
            loading={loading}
            submitLabel={translate('eventos.create.submitLabel', 'Guardar actividad')}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function NuevoActividadPage() {
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
            Nueva Actividad
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
      <NuevoActividadContent />
    </Suspense>
  );
}
