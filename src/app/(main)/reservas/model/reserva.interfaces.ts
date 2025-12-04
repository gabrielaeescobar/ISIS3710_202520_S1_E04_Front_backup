import { useLocale } from '@/components/locale-provider';

export function useTiposReserva() {
  const { translate } = useLocale();
  
  return [
    { value: 'vuelo', label: translate('reservas.types.vuelo', 'Vuelo'), icon: '✈️' },
    { value: 'hotel', label: translate('reservas.types.hotel', 'Hotel'), icon: '🏨' },
    { value: 'transporte', label: translate('reservas.types.transporte', 'Transporte'), icon: '🚗' },
    { value: 'otro', label: translate('reservas.types.otro', 'Otro'), icon: '📋' }
  ] as const;
}

export function useEstadosReserva() {
  const { translate } = useLocale();
  
  return [
    { value: 'confirmada', label: translate('reservas.status.confirmada', 'Confirmada'), color: 'green' },
    { value: 'pendiente', label: translate('reservas.status.pendiente', 'Pendiente'), color: 'yellow' },
    { value: 'cancelada', label: translate('reservas.status.cancelada', 'Cancelada'), color: 'red' }
  ] as const;
}

export interface ReservaHotel {
  id?: number;
  idReserva?: number; 
  nombre: string;
  fechaCheckIn: string;
  fechaCheckOut: string;
  monto: number | string; 
  codigoReserva?: string;
  estrellas?: number;
  viajeId?: number;
  usuarioPagadorId?: number;
  ubicacionHotelId?: number; 
  ubicacion?: Ubicacion; 
}

export interface ReservaVuelo {
  id?: number;
  idReserva?: number; 
  aerolinea: string;
  clase: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  fechaSalida: string;
  horaSalida: string;
  fechaLlegada: string;
  horaLlegada: string;
  monto: number | string; 
  codigoReserva?: string;
  viajeId?: number;
  usuarioPagadorId?: number;
  origenId?: number;
  destinoId?: number;
  origen?: Ubicacion; 
  destino?: Ubicacion; 
}

export interface Reserva {
  id: number;
  viaje_id: number;
  tipo: 'vuelo' | 'hotel' | 'transporte' | 'otro';
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  hora_salida?: string;
  hora_llegada?: string;
  ubicacion_origen?: string;
  ubicacion_destino?: string;
  numero_reserva?: string;
  proveedor?: string;
  precio_total?: number;
  moneda?: string;
  estado: 'confirmada' | 'pendiente' | 'cancelada';
  notas?: string;
  creado_por: number;
  creado_en: string;
  actualizado_en: string;
}

export interface ReservaFormData {
  id?: number;
  viaje_id: number;
  tipo: 'vuelo' | 'hotel' | 'transporte' | 'otro';
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  hora_salida?: string;
  hora_llegada?: string;
  ubicacion_origen?: string;
  ubicacion_destino?: string;
  numero_reserva?: string;
  proveedor?: string;
  precio_total?: number;
  moneda?: string;
  estado: 'confirmada' | 'pendiente' | 'cancelada';
  notas?: string;
}

// Interface para ubicaciones
export interface Ubicacion {
  idUbicacion: number;
  nombreLugar: string;
  direccion?: string | null;
  lat?: number;
  lng?: number;
}
