export interface ViajeGrupoRef {
  id: number;
  nombre?: string;
}

export interface ViajeDestinoRef {
  idUbicacion: number;
  nombre: string;
  [key: string]: unknown;
}

export interface Viaje {
  id: number;
  nombre: string;

  descripcion?: string | null;
  fechaIni: string;
  fechaFin: string;
  imagenViajeUrl?: string | null;
  presupuestoInicial: string;
  monedaBase: 'EUR' | 'USD' | 'COP' | string;

  grupo?: ViajeGrupoRef | null;

  destino?: ViajeDestinoRef | string | null;

  // ----------------------------------------------------
  fecha_ini?: string;
  fecha_fin?: string;
  imagen_url?: string;
  presupuesto_inicial?: number;
  moneda_base?: 'EUR' | 'USD' | 'COP' | string;
  grupo_id?: number | null;
  creado_por?: number;
}
