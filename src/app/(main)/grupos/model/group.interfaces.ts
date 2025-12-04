export interface Usuario {
  id: number;
  nombre: string;
  email?: string;
}

export interface Viaje {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Grupo {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagenGrupoUrl: string | null;

  integrantes?: Usuario[];

  miembrosCount?: number;

  viajes: Viaje[];
}
