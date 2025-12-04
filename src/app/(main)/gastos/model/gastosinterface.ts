import { z } from 'zod';

export const GASTO_CATEGORIAS = [
  'Comida',
  'Compras',
  'Transporte local',
  'Impuestos y tasas',
  'Seguro de viaje',
  'Otros',
] as const;

export type GastoCategoria = (typeof GASTO_CATEGORIAS)[number] | string;

export interface Gasto {
  idGasto: number;
  concepto: string;
  categoria: GastoCategoria;
  monto: number;
  fecha: string;

  viajeId: number;
  usuarioPagadorId: number;

  moneda?: 'EUR' | 'USD' | 'COP' | 'GBP' | string;
  grupoId?: number | null;
  pagadoPor?: string | null;
}

export const gastoCreateSchema = z.object({
  concepto: z.string().min(1, 'El concepto es obligatorio'),
  categoria: z
    .enum(GASTO_CATEGORIAS)
    .or(z.string().min(1, 'La categoría es obligatoria')),
  monto: z.number().positive('El monto debe ser mayor que 0'),
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (use YYYY-MM-DD)'),
  viajeId: z.number().int().positive('Debe indicar el viaje'),

  usuarioPagadorId: z
    .number()
    .int()
    .positive('Debe indicar el usuario pagador'),

  pagadoPor: z
    .string()
    .email('Debe ser un email válido')
    .optional(),
});

export type GastoCreate = z.infer<typeof gastoCreateSchema>;

type ApiGastoRaw = {
  idGasto?: number;
  id?: number;
  concepto?: string;
  categoria?: string;
  monto?: string | number;
  fecha?: string | Date;

  viaje?: {
    id?: number;
    grupo?: { id?: number | null } | null;
    monedaBase?: 'EUR' | 'USD' | 'COP' | 'GBP' | string;
  } | null;

  viajeId?: number;
  grupoId?: number | null;

  usuarioPagador?: {
    id?: number;
    nombre?: string;
    username?: string;
    email?: string;
  } | null;

  usuarioPagadorId?: number;

  moneda?: 'EUR' | 'USD' | 'COP' | 'GBP' | string;
  pagadoPor?: string;
};

export function mapApiGasto(api: ApiGastoRaw): Gasto {
  const viajeId = api.viaje?.id ?? api.viajeId ?? 0;
  const grupoId = api.viaje?.grupo?.id ?? api.grupoId ?? null;

  const moneda = (api.viaje?.monedaBase ?? api.moneda ?? 'EUR') as Gasto['moneda'];

  const usuarioPagadorId =
    api.usuarioPagador?.id ?? api.usuarioPagadorId ?? 0;


  const pagadoPor =
    api.pagadoPor ??
    api.usuarioPagador?.email ??
    null;

  const fechaStr =
    typeof api.fecha === 'string'
      ? api.fecha
      : api.fecha
      ? new Date(api.fecha).toISOString()
      : new Date().toISOString();

  return {
    idGasto: api.idGasto ?? api.id ?? 0,
    concepto: api.concepto ?? '',
    categoria: api.categoria ?? '',
    monto:
      typeof api.monto === 'number'
        ? api.monto
        : Number(api.monto ?? 0),

    fecha: fechaStr,
    viajeId,
    usuarioPagadorId,
    moneda,
    grupoId,
    pagadoPor,
  };
}

export function mapApiGastoArray(arr: unknown[] | null | undefined): Gasto[] {
  return (arr ?? []).map((item) => mapApiGasto(item as ApiGastoRaw));
}
