'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, MapPin, DollarSign, Edit, Trash2, Plane, Hotel } from 'lucide-react';
import type { ReservaHotel, ReservaVuelo, Ubicacion } from '../model/reserva.interfaces';
import ReservaForm from './ReservaForm';
import { useLocale } from '@/components/locale-provider';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida');
}

interface ReservasListProps {
  viajeId: string;
  monedaBase: string; // Moneda base del viaje
  className?: string;
}

type ReservaUnificada = 
  | ({ tipo: 'hotel' } & ReservaHotel)
  | ({ tipo: 'vuelo' } & ReservaVuelo);

export default function ReservasList({ viajeId, monedaBase, className = '' }: ReservasListProps) {
  const [reservasHotel, setReservasHotel] = useState<ReservaHotel[]>([]);
  const [reservasVuelo, setReservasVuelo] = useState<ReservaVuelo[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Map<number, Ubicacion>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReserva, setEditingReserva] = useState<ReservaUnificada | null>(null);
  const [tipoForm, setTipoForm] = useState<'hotel' | 'vuelo'>('hotel');
  const { translate } = useLocale();

  useEffect(() => {
    if (!viajeId) return;
    
    loadReservas();
  }, [viajeId]);
    
    const loadReservas = async () => {
      try {
      const [hotelRes, vueloRes, ubicacionesRes] = await Promise.all([
        fetch(`${API_URL}/reservas-hotel/viaje/${viajeId}`, { cache: 'no-store' }),
        fetch(`${API_URL}/reservas-vuelo/viaje/${viajeId}`, { cache: 'no-store' }),
        fetch(`${API_URL}/ubicaciones`, { cache: 'no-store' }),
      ]);

      if (hotelRes.ok) {
        const data = await hotelRes.json();
        setReservasHotel(Array.isArray(data) ? data : []);
      }

      if (vueloRes.ok) {
        const data = await vueloRes.json();
        setReservasVuelo(Array.isArray(data) ? data : []);
      }

      if (ubicacionesRes.ok) {
        const ubicacionesData: Ubicacion[] = await ubicacionesRes.json();
        const ubicacionesMap = new Map<number, Ubicacion>();
        ubicacionesData.forEach((u) => {
          ubicacionesMap.set(u.idUbicacion, u);
        });
        setUbicaciones(ubicacionesMap);
      }
      } catch (error) {
        console.error('Error cargando reservas:', error);
      } finally {
        setLoading(false);
      }
    };

  const handleReservaAdded = () => {
    loadReservas();
    setShowForm(false);
    setEditingReserva(null);
  };

  const handleEdit = (reserva: ReservaUnificada) => {
    setEditingReserva(reserva);
    setTipoForm(reserva.tipo);
    setShowForm(true);
  };

  const handleDelete = async (reserva: ReservaUnificada) => {
    if (!confirm(translate('reservas.deleteConfirm', '¿Estás seguro de que quieres eliminar esta reserva?'))) {
      return;
    }

    try {
      const endpoint = reserva.tipo === 'hotel' 
        ? `${API_URL}/reservas-hotel/${reserva.id}`
        : `${API_URL}/reservas-vuelo/${reserva.id}`;

      const res = await fetch(endpoint, {
        method: 'DELETE'
      });

      if (res.ok) {
        if (reserva.tipo === 'hotel') {
          setReservasHotel(prev => prev.filter(r => r.id !== reserva.id));
        } else {
          setReservasVuelo(prev => prev.filter(r => r.id !== reserva.id));
        }
      } else {
        console.error('Error eliminando reserva');
        alert('Error al eliminar la reserva');
      }
    } catch (error) {
      console.error('Error eliminando reserva:', error);
      alert('Error al eliminar la reserva');
    }
  };

  const getMonedaSymbol = (moneda: string) => {
    switch (moneda) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'COP': return '$';
      case 'GBP': return '£';
      default: return moneda;
    }
  };

  const formatDate = (dateString: string) => {
    // Parsear la fecha manualmente para evitar problemas de zona horaria
    // Si la fecha viene como "YYYY-MM-DD", la tratamos como fecha local
    if (dateString && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month es 0-indexed
      return date.toLocaleDateString('es-ES');
    }
    // Fallback para otros formatos
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  // Combinar todas las reservas para mostrar
  const todasLasReservas: ReservaUnificada[] = [
    ...reservasHotel.map(r => ({ tipo: 'hotel' as const, ...r })),
    ...reservasVuelo.map(r => ({ tipo: 'vuelo' as const, ...r }))
  ].sort((a, b) => {
    const fechaA = a.tipo === 'hotel' ? a.fechaCheckIn : a.fechaSalida;
    const fechaB = b.tipo === 'hotel' ? b.fechaCheckIn : b.fechaSalida;
    // Comparar fechas sin conversión de zona horaria
    return fechaA.localeCompare(fechaB);
  });

  if (loading) {
    return (
      <Card className={`border rounded-2xl shadow-sm ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">
               {translate('reservas.list.loading', 'Cargando reservas...')}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card className="border rounded-2xl shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Hotel className="w-5 h-5 text-blue-500" />
              {translate('reservas.list.title', 'Reservas del Viaje')}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {todasLasReservas.length} {translate('reservas.list.count', 'reservas')}
              </span>
              <div className="flex gap-2">
              <Button 
                size="sm" 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => {
                    setTipoForm('hotel');
                    setEditingReserva(null);
                    setShowForm(!showForm);
                  }}
              >
                  <Hotel className="w-4 h-4 mr-2" />
                  {translate('reservas.list.addHotel', '+ Hotel')}
                </Button>
                <Button 
                  size="sm" 
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => {
                    setTipoForm('vuelo');
                    setEditingReserva(null);
                    setShowForm(!showForm);
                  }}
                >
                  <Plane className="w-4 h-4 mr-2" />
                  {translate('reservas.list.addVuelo', '+ Vuelo')}
                </Button>
                {showForm && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingReserva(null);
                    }}
                  >
                    {translate('reservas.list.cancel', 'Cancelar')}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Formulario para agregar/editar reservas */}
          {showForm && (
            <div className="mb-6">
              <ReservaForm 
                viajeId={viajeId} 
                monedaBase={monedaBase}
                onReservaAdded={handleReservaAdded}
                onCancel={() => {
                  setShowForm(false);
                  setEditingReserva(null);
                }}
                reservaHotel={editingReserva?.tipo === 'hotel' ? editingReserva : undefined}
                reservaVuelo={editingReserva?.tipo === 'vuelo' ? editingReserva : undefined}
                tipo={tipoForm}
              />
            </div>
          )}

          {todasLasReservas.length > 0 ? (
            <div className="space-y-4">
              {todasLasReservas.map(reserva => (
                <div key={`${reserva.tipo}-${reserva.id}`} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {reserva.tipo === 'hotel' ? (
                        <Hotel className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Plane className="w-5 h-5 text-green-500" />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {reserva.tipo === 'hotel' ? reserva.nombre : `${reserva.aerolinea} - ${reserva.clase}`}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {reserva.tipo === 'hotel' 
                              ? translate('reservas.types.hotel', 'Hotel')
                              : translate('reservas.types.vuelo', 'Vuelo')
                            }
                          </Badge>
                          {reserva.tipo === 'hotel' && reserva.estrellas && (
                          <Badge variant="outline" className="text-xs">
                              ⭐ {reserva.estrellas}
                          </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-50"
                        onClick={() => handleEdit(reserva)}
                      >
                        <Edit className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-50"
                        onClick={() => handleDelete(reserva)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reserva.tipo === 'hotel' ? (
                      <>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>
                              <strong>{translate('reservas.list.checkIn', 'Check-in')}:</strong> {formatDate(reserva.fechaCheckIn)}
                        </span>
                      </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>
                              <strong>{translate('reservas.list.checkOut', 'Check-out')}:</strong> {formatDate(reserva.fechaCheckOut)}
                            </span>
                          </div>
                        </div>

                        {(reserva.ubicacion || reserva.ubicacionHotelId) && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 text-orange-500" />
                              <span>
                                <strong>{translate('reservas.list.location', 'Ubicación')}:</strong>{' '}
                                {reserva.ubicacion?.nombreLugar ?? 
                                 (reserva.ubicacionHotelId ? (ubicaciones.get(reserva.ubicacionHotelId)?.nombreLugar ?? `ID ${reserva.ubicacionHotelId}`) : '-')}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          {reserva.codigoReserva && (
                            <div className="text-sm">
                              <span className="text-gray-500">
                                {translate('reservas.list.reservationNumber', 'Reserva')}:
                              </span>
                              <span className="ml-1 font-medium">{reserva.codigoReserva}</span>
                            </div>
                          )}
                          {(() => {
                            const montoNum = typeof reserva.monto === 'string' ? parseFloat(reserva.monto) : reserva.monto;
                            return montoNum > 0 && (
                              <div className="text-sm">
                                <span className="text-gray-500">
                                  {translate('reservas.list.price', 'Precio')}:
                                </span>
                                <span className="ml-1 font-medium">
                                  {getMonedaSymbol(monedaBase)} {montoNum.toLocaleString()}
                                </span>
                              </div>
                            );
                          })()}
                    </div>
                      </>
                    ) : (
                      <>
                      <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span>
                              <strong>{translate('reservas.list.departure', 'Salida')}:</strong> {formatDate(reserva.fechaSalida)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-green-500" />
                            <span>
                              <strong>{translate('reservas.list.departureTime', 'Hora')}:</strong> {formatTime(reserva.horaSalida)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span>
                              <strong>{translate('reservas.list.arrival', 'Llegada')}:</strong> {formatDate(reserva.fechaLlegada)}
                            </span>
                             </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-green-500" />
                            <span>
                              <strong>{translate('reservas.list.arrivalTime', 'Hora')}:</strong> {formatTime(reserva.horaLlegada)}
                            </span>
                         </div>
                      </div>

                      <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-orange-500" />
                            <span>
                              <strong>{translate('reservas.list.origin', 'Origen')}:</strong>{' '}
                              {reserva.origen?.nombreLugar ?? 
                               (reserva.origenId ? (ubicaciones.get(reserva.origenId)?.nombreLugar ?? `ID ${reserva.origenId}`) : '-')}
                            </span>
                      </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-orange-500" />
                            <span>
                              <strong>{translate('reservas.list.destination', 'Destino')}:</strong>{' '}
                              {reserva.destino?.nombreLugar ?? 
                               (reserva.destinoId ? (ubicaciones.get(reserva.destinoId)?.nombreLugar ?? `ID ${reserva.destinoId}`) : '-')}
                            </span>
                  </div>
                  </div>

                        <div className="space-y-2">
                          {reserva.codigoReserva && (
                      <div className="text-sm">
                        <span className="text-gray-500">
                          {translate('reservas.list.reservationNumber', 'Reserva')}:
                          </span>
                              <span className="ml-1 font-medium">{reserva.codigoReserva}</span>
                      </div>
                    )}
                          {(() => {
                            const montoNum = typeof reserva.monto === 'string' ? parseFloat(reserva.monto) : reserva.monto;
                            return montoNum > 0 && (
                              <div className="text-sm">
                                <span className="text-gray-500">
                                  {translate('reservas.list.price', 'Precio')}:
                                </span>
                                <span className="ml-1 font-medium">
                                  {getMonedaSymbol(monedaBase)} {montoNum.toLocaleString()}
                                </span>
                              </div>
                            );
                          })()}
                  </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Hotel className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">
                {translate('reservas.list.empty.title', 'No hay reservas registradas')}
                </p>
              <p className="text-sm mt-2">
                  {translate('reservas.list.empty.subtitle', 'Agrega reservas para organizar tu viaje')}
              </p>
              <div className="flex gap-2 justify-center mt-4">
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => {
                    setTipoForm('hotel');
                    setShowForm(true);
                  }}
                >
                  <Hotel className="w-4 h-4 mr-2" />
                  {translate('reservas.list.addHotel', '+ Hotel')}
                </Button>
              <Button 
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => {
                    setTipoForm('vuelo');
                    setShowForm(true);
                  }}
              >
                  <Plane className="w-4 h-4 mr-2" />
                  {translate('reservas.list.addVuelo', '+ Vuelo')}
              </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
