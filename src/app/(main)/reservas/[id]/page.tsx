'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  Plane, 
  Hotel, 
  Car, 
  FileText, 
  Edit, 
  Trash2,
  ArrowLeft 
} from 'lucide-react';
import type { Reserva } from '../model/reserva.interfaces';
import ReservaForm from '../_components/ReservaForm';
import { useLocale } from '@/components/locale-provider';

export default function ReservaDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const { translate } = useLocale();


  useEffect(() => {
    if (!id) return;
    
    const loadReserva = async () => {
      try {
        const res = await fetch(`/api/reservas?id=${id}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.status && data.data) {
            setReserva(data.data);
          }
        }
      } catch (error) {
        console.error('Error cargando reserva:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReserva();
  }, [id]);

  const handleDelete = async () => {
     if (!confirm(translate('reservas.deleteConfirm', '¿Estás seguro de que quieres eliminar esta reserva?'))) {
      return;
    }

    try {
      const res = await fetch(`/api/reservas?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        router.push('/reservas');
      } else {
        console.error('Error eliminando reserva');
      }
    } catch (error) {
      console.error('Error eliminando reserva:', error);
    }
  };

  const handleReservaUpdated = () => {
    // Recargar la reserva
    const loadReserva = async () => {
      try {
        const res = await fetch(`/api/reservas?id=${id}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.status && data.data) {
            setReserva(data.data);
          }
        }
      } catch (error) {
        console.error('Error cargando reserva:', error);
      }
    };
    loadReserva();
    setEditing(false);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'vuelo':
        return <Plane className="w-6 h-6" />;
      case 'hotel':
        return <Hotel className="w-6 h-6" />;
      case 'transporte':
        return <Car className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getTipoEmoji = (tipo: string) => {
    switch (tipo) {
      case 'vuelo':
        return '';
      case 'hotel':
        return '';
      case 'transporte':
        return '';
      default:
        return '';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMonedaSymbol = (moneda: string) => {
    switch (moneda) {
      case 'EUR':
        return '€';
      case 'USD':
        return '$';
      case 'COP':
        return '$';
      case 'GBP':
        return '£';
      default:
        return moneda;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {translate('reservas.loading', 'Cargando reserva...')}
          </p>
       </div>
      </div>
    );
  }

  if (!reserva) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {translate('reservas.notFound', 'Reserva no encontrada')}
        </h2>
        <Link
  href="/calendario"
  className="text-blue-600 hover:text-blue-800"
>
  ← {translate('reservas.goToCalendar', 'Ir a Calendario')}
</Link>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner de la reserva */}
      <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Contenido del banner */}
        <div className="absolute bottom-6 left-6 text-white z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{getTipoEmoji(reserva.tipo)}</span>
            <h1 className="text-3xl md:text-4xl font-bold drop-shadow-lg">
              {reserva.nombre}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src="/logo_blanco_sin_fondo.png"
              alt="Layover"
              width={20}
              height={20}
              className="drop-shadow-lg"
            />
            <span className="text-lg font-medium drop-shadow-lg">
            {translate('reservas.tripNumber', 'Viaje')} #{reserva.viaje_id}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navegacion */}
        <div className="mb-6">
          <Link 
            href="/calendario" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {translate('reservas.goToCalendar', 'Ir a Calendario')}
          </Link>
        </div>

        {editing ? (
          <ReservaForm
            viajeId={reserva.viaje_id.toString()}
            onReservaAdded={handleReservaUpdated}
            onCancel={() => setEditing(false)} monedaBase={''}          />
        ) : (
          <Card className="border rounded-2xl shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{getTipoEmoji(reserva.tipo)}</div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">{reserva.nombre}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`${getEstadoColor(reserva.estado)}`}>
                        {translate(`reservas.status.${reserva.estado}`, reserva.estado)}
                      </Badge>
                      <Badge variant="outline">
                        {translate(`reservas.type.${reserva.tipo}`, reserva.tipo.charAt(0).toUpperCase() + reserva.tipo.slice(1))}         
                   </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {translate('reservas.edit', 'Editar')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {translate('reservas.delete', 'Eliminar')}
                  </Button>
                </div>
              </div>

              {reserva.descripcion && (
                <p className="text-gray-600 mb-6 italic">{reserva.descripcion}</p>
              )}

              {/* Informacion detallada */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Fechas */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    {translate('reservas.dates', 'Fechas')}
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">
                      {translate('reservas.startDate', 'Inicio')}:

                      </span>
                      <p className="font-medium">{formatDate(reserva.fecha_inicio)}</p>
                    </div>
                    {reserva.fecha_fin && (
                      <div>
                        <span className="text-sm text-gray-500">
                                  {translate('reservas.endDate', 'Fin')}:
                        </span>
                        <p className="font-medium">{formatDate(reserva.fecha_fin)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Horarios */}
                {(reserva.hora_salida || reserva.hora_llegada) && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-500" />
                      {translate('reservas.schedule', 'Horarios')}
                    </h3>
                    <div className="space-y-2">
                      {reserva.hora_salida && (
                        <div>
                          <span className="text-sm text-gray-500">
                              {translate('reservas.departure', 'Salida')}:
                          </span>
                          <p className="font-medium">{reserva.hora_salida}</p>
                        </div>
                      )}
                      {reserva.hora_llegada && (
                        <div>
                          <span className="text-sm text-gray-500">
                            {translate('reservas.arrival', 'Llegada')}:

                          </span>
                          <p className="font-medium">{reserva.hora_llegada}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Ubicaciones */}
                {(reserva.ubicacion_origen || reserva.ubicacion_destino) && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-orange-500" />
                      {translate('reservas.locations', 'Ubicaciones')}
                    </h3>
                    <div className="space-y-2">
                      {reserva.ubicacion_origen && (
                        <div>
                          <span className="text-sm text-gray-500">     
                              {translate('reservas.origin', 'Origen')}:
                          </span>
                          <p className="font-medium">{reserva.ubicacion_origen}</p>
                        </div>
                      )}
                      {reserva.ubicacion_destino && (
                        <div>
                          <span className="text-sm text-gray-500">

                               {translate('reservas.destination', 'Destino')}:

                          </span>
                          <p className="font-medium">{reserva.ubicacion_destino}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Detalles adicionales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {reserva.numero_reserva && (
                  <div>
                    <span className="text-sm text-gray-500">
                      {translate('reservas.reservationNumber', 'Número de Reserva')}
                    </span>
                    <p className="font-medium">{reserva.numero_reserva}</p>
                  </div>
                )}
                {reserva.proveedor && (
                  <div>
                    <span className="text-sm text-gray-500">
                      {translate('reservas.provider', 'Proveedor')}

                    </span>
                    <p className="font-medium">{reserva.proveedor}</p>
                  </div>
                )}
                {reserva.precio_total && reserva.precio_total > 0 && (
                  <div>
                    <span className="text-sm text-gray-500">
                     {translate('reservas.totalPrice', 'Precio Total')}
                    </span>
                    <p className="font-medium text-green-600">
                      {getMonedaSymbol(reserva.moneda || 'EUR')} {reserva.precio_total.toLocaleString()}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-500">
                       {translate('reservas.created', 'Creado')}
                  </span>
                  <p className="font-medium">
                    {new Date(reserva.creado_en).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>

              {reserva.notas && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                          {translate('reservas.notes', 'Notas')}
                  </h4>
                  <p className="text-gray-700">{reserva.notas}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
