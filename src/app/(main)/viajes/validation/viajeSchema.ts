import { z } from 'zod';

export interface ViajeFormData {
  nombre: string;
  descripcion?: string;
  fechaIni: string;
  fechaFin: string;
  imagenViajeUrl?: string;
  presupuestoInicial: number;
  monedaBase: 'COP' | 'USD' | 'EUR';
  grupoId: number;
  destinoId: number;
}

export const viajeSchema = z
  .object({
    nombre: z
      .string()
      .min(6, 'El nombre debe tener al menos 6 caracteres'),

    descripcion: z
      .string()
      .max(280, 'Máximo 280 caracteres')
      .optional(),

    fechaIni: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        'Formato inválido. Use YYYY-MM-DD',
      ),

    fechaFin: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        'Formato inválido. Use YYYY-MM-DD',
      ),

    imagenViajeUrl: z.string().optional(),

    presupuestoInicial: z
      .number()
      .positive('Debe ser mayor que 0'),

    monedaBase: z.enum(['USD', 'COP', 'EUR'], {
      message: 'Moneda inválida (solo USD, COP o EUR)',
    }),

    grupoId: z
      .number()
      .int()
      .positive('Debe ser un id de grupo válido'),

    destinoId: z
      .number()
      .int()
      .positive('Debe ser un id de destino válido'),
  });
