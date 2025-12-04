'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  gastoCreateSchema,
  type GastoCreate,
} from '../model/gastosinterface';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/components/locale-provider';
import { getAuthUser } from '@/lib/auth-client';

type FormValues = z.input<typeof gastoCreateSchema>;

interface Props {
  defaultValues?: Partial<GastoCreate>;
  onSubmit: (values: GastoCreate) => void;
  loading?: boolean;
  submitLabel?: string; 
}

export function GastoForm({
  defaultValues,
  onSubmit,
  loading,
  submitLabel,
}: Props) {
  const { translate } = useLocale();
  const authUser = getAuthUser();

  const initialFecha: string = (() => {
    const raw = defaultValues?.fecha as unknown;

    if (!raw) {
      return new Date().toISOString().slice(0, 10);
    }

    if (typeof raw === 'string') {
      return raw.slice(0, 10);
    }

    if (raw instanceof Date) {
      return raw.toISOString().slice(0, 10);
    }

    return new Date().toISOString().slice(0, 10);
  })();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(gastoCreateSchema),
    defaultValues: {
      concepto: defaultValues?.concepto ?? '',
      monto: defaultValues?.monto ?? 0,
      fecha: initialFecha,
      categoria: defaultValues?.categoria ?? '',
      viajeId: defaultValues?.viajeId ?? 1,
      usuarioPagadorId:
        defaultValues?.usuarioPagadorId ?? authUser?.id ?? 0,
      pagadoPor: defaultValues?.pagadoPor ?? authUser?.email ?? '',
    } as unknown as FormValues,
  });

  const submit: SubmitHandler<FormValues> = (values) => {
    const parsed: GastoCreate = gastoCreateSchema.parse(values);
    onSubmit(parsed);
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      id="form-gasto"
      className="space-y-6"
    >
      <input
        type="hidden"
        {...register('usuarioPagadorId', { valueAsNumber: true })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {translate('gastoForm.fields.concepto', 'Concepto')}
          </label>
          <Input
            {...register('concepto')}
            placeholder={translate(
              'gastoForm.fields.concepto.placeholder',
              'Ej: Hotel',
            )}
            className="mt-1"
          />
          {errors.concepto && (
            <p className="text-xs text-red-600 mt-1">
              {errors.concepto.message}
            </p>
          )}
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {translate('gastoForm.fields.categoria', 'Categoría')}
          </label>
          <Input
            {...register('categoria')}
            placeholder={translate(
              'gastoForm.fields.categoria.placeholder',
              'Ej: Comida, compras, transporte…',
            )}
            className="mt-1"
          />
          {errors.categoria && (
            <p className="text-xs text-red-600 mt-1">
              {errors.categoria.message}
            </p>
          )}
        </div>

        {/* Monto */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {translate('gastoForm.fields.monto', 'Monto')}
          </label>
          <Input
            type="number"
            step="0.01"
            {...register('monto', { valueAsNumber: true })}
            placeholder="250000"
            className="mt-1"
          />
          {errors.monto && (
            <p className="text-xs text-red-600 mt-1">
              {errors.monto.message}
            </p>
          )}
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {translate('gastoForm.fields.fecha', 'Fecha')}
          </label>
          <Input
            type="date"
            {...register('fecha')}
            className="mt-1"
          />
          {errors.fecha && (
            <p className="text-xs text-red-600 mt-1">
              {errors.fecha.message as string}
            </p>
          )}
        </div>

        {/* Viaje  */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {translate('gastoForm.fields.viaje', 'Viaje')}
          </label>
          <Input
            type="number"
            {...register('viajeId', { valueAsNumber: true })}
            placeholder={translate(
              'gastoForm.fields.viaje.placeholder',
              'ID del viaje',
            )}
            className="mt-1"
          />
          {errors.viajeId && (
            <p className="text-xs text-red-600 mt-1">
              {errors.viajeId.message}
            </p>
          )}
        </div>

        {/* Email del pagador */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            {translate(
              'gastoForm.fields.pagadoPorEmail',
              'Email de quien paga',
            )}
          </label>
          <Input
            type="email"
            {...register('pagadoPor')}
            placeholder="correo@ejemplo.com"
            className="mt-1"
          />
          {errors.pagadoPor && (
            <p className="text-xs text-red-600 mt-1">
              {errors.pagadoPor.message as string}
            </p>
          )}
        </div>
      </div>

      {submitLabel && (
        <p className="sr-only">{submitLabel}</p>
      )}
    </form>
  );
}
