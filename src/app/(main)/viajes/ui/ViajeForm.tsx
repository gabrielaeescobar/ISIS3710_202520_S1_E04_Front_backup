'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import {
  useViajeSchema,
  type ViajeFormData,
} from '../validation/useViajeSchema';
import { useLocale } from '@/components/locale-provider';
import { getAuthUser, getAuthToken } from '@/lib/auth-client';
import UbicacionSearch from '@/components/UbicacionSearch';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error('NEXT_PUBLIC_API_URL no está definida');
}

interface Grupo {
  id: number;
  nombre: string;
}

interface ViajeFormProps {
  onSubmit: SubmitHandler<ViajeFormData>;
  defaultValues?: Partial<ViajeFormData>;
  isSubmitting?: boolean;
}

export default function ViajeForm({
  onSubmit,
  defaultValues,
  isSubmitting = false,
}: ViajeFormProps) {
  const { translate } = useLocale();
  const viajeSchema = useViajeSchema();

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loadingGrupos, setLoadingGrupos] = useState(true);

  // Cargar grupos del usuario
  useEffect(() => {
    const user = getAuthUser();

    if (!user || !API_URL) {
      setLoadingGrupos(false);
      return;
    }

    (async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(`${API_URL}/usuarios/${user.id}/grupos`, {
          cache: 'no-store',
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        });

        if (!res.ok) {
          console.error('Error al llamar /usuarios/:id/grupos', res.status);
          setLoadingGrupos(false);
          return;
        }

        const data: Grupo[] = await res.json();
        setGrupos(data);
      } catch (e) {
        console.error('Error obteniendo grupos del usuario', e);
      } finally {
        setLoadingGrupos(false);
      }
    })();
  }, []);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting: rhfSubmitting, isValid },
  } = useForm<ViajeFormData>({
    defaultValues: {
      nombre: '',
      descripcion: undefined,
      fechaIni: '',
      fechaFin: '',
      imagenViajeUrl: undefined,
      presupuestoInicial: 0,
      monedaBase: 'COP',
      grupoId: 0,
      destinoId: 0,
      ...defaultValues,
    },
    resolver: zodResolver(viajeSchema),
    mode: 'onChange',
  });

  const onSubmitWrapped: SubmitHandler<ViajeFormData> = async (data) => {
    try {
      await onSubmit(data);
      reset();
    } catch (err) {
      setError('root', {
        message:
          err instanceof Error
            ? err.message
            : translate('errors.genericSave', 'Error al guardar'),
      });
    }
  };

  const disabled = !isValid || rhfSubmitting || isSubmitting;
  const isEditMode =
    Boolean(defaultValues && Object.keys(defaultValues).length > 0);

  // Valor actual de destinoId para pasárselo a UbicacionSearch
  const destinoIdValue = watch('destinoId') ?? 0;

  return (
    <div className="flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <form
          className="viaje-form"
          onSubmit={handleSubmit(onSubmitWrapped)}
        >
          {/* Nombre */}
          <div className="form-field">
            <label htmlFor="nombre" className="form-label">
              {translate('form.fields.name.label', 'Nombre del viaje')}
            </label>
            <input
              id="nombre"
              type="text"
              placeholder={translate(
                'form.fields.name.placeholder',
                'Mínimo 6 caracteres',
              )}
              {...register('nombre')}
              className="form-input"
            />
            {errors.nombre && (
              <span className="form-error">{errors.nombre.message}</span>
            )}
          </div>

          {/* Descripcion */}
          <div className="form-field">
            <label htmlFor="descripcion" className="form-label">
              {translate('form.fields.descripcion.label', 'Descripción')}
            </label>
            <textarea
              id="descripcion"
              rows={3}
              placeholder={translate(
                'form.fields.descripcion.placeholder',
                'Opcional (máx. 280 caracteres)',
              )}
              {...register('descripcion')}
              className="form-input"
            />
            {errors.descripcion && (
              <span className="form-error">{errors.descripcion.message}</span>
            )}
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-field">
              <label htmlFor="fechaIni" className="form-label">
                {translate('form.fields.fecha_ini.label', 'Fecha inicio')}
              </label>
              <input
                id="fechaIni"
                type="date"
                {...register('fechaIni')}
                className="form-input"
              />
              {errors.fechaIni && (
                <span className="form-error">{errors.fechaIni.message}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="fechaFin" className="form-label">
                {translate('form.fields.fecha_fin.label', 'Fecha fin')}
              </label>
              <input
                id="fechaFin"
                type="date"
                {...register('fechaFin')}
                className="form-input"
              />
              {errors.fechaFin && (
                <span className="form-error">{errors.fechaFin.message}</span>
              )}
            </div>
          </div>

          {/* Presupuesto y moneda */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-field">
              <label htmlFor="presupuestoInicial" className="form-label">
                {translate('form.fields.presupuesto.label', 'Presupuesto')}
              </label>
              <input
                id="presupuestoInicial"
                type="number"
                step="0.01"
                {...register('presupuestoInicial', { valueAsNumber: true })}
                className="form-input"
              />
              {errors.presupuestoInicial && (
                <span className="form-error">
                  {errors.presupuestoInicial.message}
                </span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="monedaBase" className="form-label">
                {translate('form.fields.moneda.label', 'Moneda')}
              </label>
              <select
                id="monedaBase"
                {...register('monedaBase')}
                className="form-input"
              >
                <option value="COP">COP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
              {errors.monedaBase && (
                <span className="form-error">
                  {errors.monedaBase.message}
                </span>
              )}
            </div>
          </div>

          {/* Imagen */}
          <div className="form-field">
            <label htmlFor="imagenViajeUrl" className="form-label">
              {translate('form.fields.imagen.label', 'Imagen (URL)')}
            </label>
            <input
              id="imagenViajeUrl"
              type="url"
              placeholder="https://..."
              {...register('imagenViajeUrl')}
              className="form-input"
            />
            {errors.imagenViajeUrl && (
              <span className="form-error">
                {errors.imagenViajeUrl.message}
              </span>
            )}
          </div>

          {/* Grupo y Destino */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Grupo */}
            <div className="form-field">
              <label htmlFor="grupoId" className="form-label">
                {translate('form.fields.grupo.label', 'Grupo')}
              </label>

              <select
                id="grupoId"
                {...register('grupoId', { valueAsNumber: true })}
                className="form-input"
                disabled={loadingGrupos || !grupos.length}
              >
                <option value={0}>
                  {loadingGrupos
                    ? translate('form.fields.grupo.loading', 'Cargando grupos...')
                    : translate(
                        'form.fields.grupo.placeholder',
                        'Selecciona un grupo',
                      )}
                </option>

                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nombre}
                  </option>
                ))}
              </select>

              {!loadingGrupos && !grupos.length && (
                <p className="mt-1 text-xs text-gray-500">
                  {translate(
                    'form.fields.grupo.empty',
                    'No perteneces a ningún grupo.',
                  )}
                </p>
              )}

              {errors.grupoId && (
                <span className="form-error">{errors.grupoId.message}</span>
              )}
            </div>

            {/* Destino con UbicacionSearch */}
            <div className="form-field">
              <label htmlFor="destinoId" className="form-label">
                {translate('form.fields.destino.label', 'Destino')}
              </label>

              {/* hidden para que RHF tenga el campo registrado */}
              <input
                type="hidden"
                id="destinoId"
                {...register('destinoId', { valueAsNumber: true })}
              />

              <UbicacionSearch
                value={destinoIdValue || 0}
                onChange={(id) =>
                  setValue('destinoId', id, { shouldValidate: true })
                }
                placeholder={translate(
                  'form.fields.destino.placeholder',
                  'Buscar o crear destino...',
                )}
                required
              />

              {errors.destinoId && (
                <span className="form-error">{errors.destinoId.message}</span>
              )}
            </div>
          </div>

          {errors.root && (
            <span className="form-error">{errors.root.message}</span>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className={isEditMode ? 'viaje-btn-edit' : 'btn-save'}
              disabled={disabled}
            >
              {rhfSubmitting || isSubmitting
                ? translate('form.loading', 'Cargando...')
                : isEditMode
                ? translate('form.edit', 'Editar viaje')
                : translate('form.create', 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
