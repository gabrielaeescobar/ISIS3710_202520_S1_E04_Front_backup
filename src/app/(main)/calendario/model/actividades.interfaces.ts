// Interfaces Actividades

export interface UbicacionRef {
  idUbicacion: number;
  nombreLugar: string;
  direccion?: string | null;
  lat?: number;
  lng?: number;
}

export interface UsuarioPagadorRef {
  id: number;
  nombre: string;
  username?: string;
  email?: string;
}

export interface ViajeRef {
  id: number;
  nombre: string;
  fechaIni?: string;
  fechaFin?: string;
}

// Actividad completa
export interface Actividad {
  idActividad: number;
  nombre: string;
  fecha: string; // "YYYY-MM-DD"
  horInicio: string; // "HH:mm" o "HH:mm:ss"
  horFin: string; // "HH:mm" o "HH:mm:ss"
  precioPorPersona?: number | string | null;
  precioTotal?: number | string | null;
  intensidad?: "BAJA" | "MEDIA" | "ALTA" | null;
  descripcion?: string | null;
  viajeId: number;
  usuarioPagadorId: number;
  ubicacionId: number;
  viaje?: ViajeRef;
  usuarioPagador?: UsuarioPagadorRef;
  ubicacion?: UbicacionRef;
}

// Payload para crear una actividad
export interface ActividadCreate {
  nombre: string;
  fecha: string; // "YYYY-MM-DD"
  horInicio: string; // "HH:mm"
  horFin: string; // "HH:mm"
  precioPorPersona?: number;
  precioTotal?: number;
  intensidad?: "BAJA" | "MEDIA" | "ALTA";
  descripcion?: string;
  viajeId: number;
  usuarioPagadorId: number;
  ubicacionId: number;
}

// Payload para actualizar una actividad 
export interface ActividadUpdate {
  nombre?: string;
  fecha?: string;
  horInicio?: string;
  horFin?: string;
  precioPorPersona?: number;
  precioTotal?: number;
  intensidad?: "BAJA" | "MEDIA" | "ALTA" | null;
  descripcion?: string;
  viajeId?: number;
  usuarioPagadorId?: number;
  ubicacionId?: number;
}

export function actividadToEvento(actividad: Actividad): {
  id: string;
  nombre: string;
  fecha: Date | string;
  hora: string;
  descripcion?: string;
  grupoId?: number | null;
  viajeId?: number;
  ubicacion?: string;
  lat?: number;
  lng?: number;
  precio?: number;
  dificultad?: "Fácil" | "Moderado" | "Exigente";
  notas?: string;
} {
  // Mapear intensidad a dificultad
  const intensidadToDificultad = (intensidad?: "BAJA" | "MEDIA" | "ALTA" | null): "Fácil" | "Moderado" | "Exigente" | undefined => {
    if (!intensidad) return undefined;
    switch (intensidad) {
      case "BAJA": return "Fácil";
      case "MEDIA": return "Moderado";
      case "ALTA": return "Exigente";
      default: return undefined;
    }
  };

  // Convertir precio a numero
  const precio = actividad.precioPorPersona
    ? (typeof actividad.precioPorPersona === 'string'
        ? parseFloat(actividad.precioPorPersona)
        : actividad.precioPorPersona)
    : actividad.precioTotal
      ? (typeof actividad.precioTotal === 'string'
          ? parseFloat(actividad.precioTotal)
          : actividad.precioTotal)
      : undefined;

  return {
    id: String(actividad.idActividad),
    nombre: actividad.nombre,
    fecha: actividad.fecha,
    hora: actividad.horInicio.split(':').slice(0, 2).join(':'), // Solo HH:mm
    descripcion: actividad.descripcion || undefined,
    grupoId: null,
    viajeId: actividad.viajeId,
    ubicacion: actividad.ubicacion?.nombreLugar || actividad.ubicacion?.direccion || undefined,
    lat: actividad.ubicacion?.lat,
    lng: actividad.ubicacion?.lng,
    precio,
    dificultad: intensidadToDificultad(actividad.intensidad),
    notas: actividad.descripcion || undefined,
  };
}





