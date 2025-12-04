'use client';

import { z } from 'zod';
import { useLocale } from '@/components/locale-provider';
import type { ViajeFormData } from './viajeSchema';

export function useViajeSchema() {
  const { translate } = useLocale();

  return z
    .object({
      nombre: z
        .string()
        .min(
          6,
          translate(
            'errors.nombre.min',
            'El nombre debe tener al menos 6 caracteres',
          ),
        ),

      descripcion: z
        .string()
        .max(
          280,
          translate(
            'errors.descripcion.max',
            'Máximo 280 caracteres',
          ),
        )
        .optional(),

      fechaIni: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          translate(
            'errors.fecha.format',
            'Formato inválido. Use YYYY-MM-DD',
          ),
        ),

      fechaFin: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          translate(
            'errors.fecha.format',
            'Formato inválido. Use YYYY-MM-DD',
          ),
        ),

      imagenViajeUrl: z.string().optional(),

      presupuestoInicial: z
        .number()
        .positive(
          translate(
            'errors.presupuesto.positive',
            'Debe ser mayor que 0',
          ),
        ),

      monedaBase: z.enum(['USD', 'COP', 'EUR'], {
        message: translate(
          'errors.moneda.invalid',
          'Moneda inválida (solo USD, COP o EUR)',
        ),
      }),

      grupoId: z
        .number()
        .int()
        .positive(
          translate(
            'errors.grupo.required',
            'Debe especificar el grupo dueño del viaje',
          ),
        ),

      destinoId: z
        .number()
        .int()
        .positive(
          translate(
            'errors.destino.required',
            'Debe especificar la ubicación destino',
          ),
        ),
    })
}

export type { ViajeFormData } from './viajeSchema';
