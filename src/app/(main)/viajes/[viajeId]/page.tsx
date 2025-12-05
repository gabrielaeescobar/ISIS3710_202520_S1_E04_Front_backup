'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Clock,
  DollarSign,
  BarChart3,
  Trash2,
  Plus,
  Edit,
  Calendar as CalendarIcon,
} from 'lucide-react';
import type { Viaje } from '../model/viaje.interfaces';
import type { EventoUI } from '@/app/(main)/calendario/model/eventos.interfaces';
import type { Reserva } from '@/app/(main)/reservas/model/reserva.interfaces';
import { actividadToEvento } from '@/app/(main)/calendario/model/actividades.interfaces';
import MapaActividadesFuncional from '@/components/MapaActividadesFuncional';
import GastosTable from '@/components/GastosTable';
import ReservasList from '@/app/(main)/reservas/_components/ReservasList';
import { useLocale } from '@/components/locale-provider';
import { getAuthToken } from '@/lib/auth-client';
import { getCurrencySymbol } from '@/lib/currency';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida');
}

export default function ViajeDetailPage() {
  const { translate } = useLocale();
  const { viajeId } = useParams<{ viajeId: string }>();
  const [viaje, setViaje] = useState<Viaje | null>(null);
  const [eventos, setEventos] = useState<EventoUI[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const loadActividades = async (tripId?: string) => {
    const idToUse = tripId || viajeId;
    if (!idToUse) return;
    try {
      const res = await fetch(`${API_URL}/actividades/viaje/${idToUse}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const actividades = await res.json();
        const eventosData = Array.isArray(actividades) 
          ? actividades.map(actividadToEvento)
          : [];
        setEventos(eventosData);
      }
    } catch (error) {
      console.error(
        translate('errors.events.load', 'Error cargando actividades:'),
        error,
      );
    }
  };

  useEffect(() => {
    if (!viajeId) return;

    const loadViaje = async () => {
      try {
        const res = await fetch(`${API_URL}/viajes/${viajeId}`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          console.error(
            translate('errors.trip.load', 'Error cargando viaje:'),
            res.status,
          );
          return;
        }

        const data: Viaje = await res.json();
        setViaje(data);
      } catch (error) {
        console.error(
          translate('errors.trip.load', 'Error cargando viaje:'),
          error,
        );
      }
    };

    const loadReservas = async () => {
      try {
        const res = await fetch(`/api/reservas?viajeId=${viajeId}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status && data.data) {
            setReservas(data.data);
          }
        }
      } catch (error) {
        console.error(
          translate('errors.reservas.load', 'Error cargando reservas:'),
          error,
        );
      }
    };

    Promise.all([loadViaje(), loadActividades(), loadReservas()]).finally(() => {
      setLoading(false);
    });
  }, [viajeId, translate]);

  const parseLocalDate = (value: Date | string): Date => {
    if (value instanceof Date) return value;
    if (value && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(value);
  };

  useEffect(() => {
    if (eventos.length > 0 && !selectedDate) {
      const firstEventDate = parseLocalDate(eventos[0].fecha);
      setSelectedDate(firstEventDate);
    } else if (viaje && (viaje.fechaIni || viaje.fecha_ini) && !selectedDate) {
      const fecha = viaje.fechaIni ?? viaje.fecha_ini!;
      setSelectedDate(parseLocalDate(fecha));
    }
  }, [eventos, viaje, selectedDate]);

  const handleDeleteActividad = async (actividadId: string) => {
    if (!confirm(translate('viajes.activities.deleteConfirm', '¿Eliminar esta actividad?'))) return;
    
    try {
      const res = await fetch(`${API_URL}/actividades/${actividadId}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      
      if (res.ok) {
        // Recargar actividades
        loadActividades();
      } else {
        alert(translate('viajes.activities.deleteError', 'No se pudo eliminar la actividad'));
      }
    } catch (error) {
      console.error('Error eliminando actividad:', error);
      alert(translate('viajes.activities.deleteError', 'No se pudo eliminar la actividad'));
    }
  };

  const getDifficultyBars = (dificultad?: string) => {
    const levels = { Fácil: 1, Moderado: 2, Exigente: 3 };
    const level = dificultad
      ? levels[dificultad as keyof typeof levels] || 1
      : 1;
    return Array.from({ length: 3 }, (_, i) => (
      <div
        key={i}
        className={`h-2 w-4 rounded ${
          i < level ? 'bg-gray-600' : 'bg-gray-200'
        }`}
      />
    ));
  };

  const eventosDelDia = selectedDate
    ? eventos.filter((evento) => {
        const eventoDate = parseLocalDate(evento.fecha);
        return eventoDate.toDateString() === selectedDate.toDateString();
      })
    : [];

  const generateCalendarDays = () => {
    if (!viaje) return [];

    const fechaIniStr = viaje.fechaIni ?? viaje.fecha_ini;
    const fechaFinStr = viaje.fechaFin ?? viaje.fecha_fin;

    if (!fechaIniStr || !fechaFinStr) return [];

    const startDate = parseLocalDate(fechaIniStr);
    const endDate = parseLocalDate(fechaFinStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return [];

    const days: { date: Date; events: EventoUI[] }[] = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayEvents = eventos.filter((evento) => {
        const eventoDate = parseLocalDate(evento.fecha);
        return eventoDate.toDateString() === currentDate.toDateString();
      });

      days.push({
        date: new Date(currentDate),
        events: dayEvents,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const getCurrentMonthEvents = () => {
    if (!viaje) return [];

    const fechaIniStr = viaje.fechaIni ?? viaje.fecha_ini;
    const fechaFinStr = viaje.fechaFin ?? viaje.fecha_fin;

    if (!fechaIniStr || !fechaFinStr) return [];

    const startDate = parseLocalDate(fechaIniStr);
    const endDate = parseLocalDate(fechaFinStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return [];

    return eventos.filter((evento) => {
      const eventoDate = parseLocalDate(evento.fecha);
      return eventoDate >= startDate && eventoDate <= endDate;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {translate(
              'viajes.loading',
              'Cargando información del viaje...',
            )}
          </p>
        </div>
      </div>
    );
  }

  if (!viaje) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {translate('viajes.notFound', 'Viaje no encontrado')}
        </h2>
        <Link href="/viajes" className="text-blue-600 hover:text-blue-800">
          ← {translate('viajes.backToList', 'Volver a mis viajes')}
        </Link>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();

  const destinoNombre =
    typeof viaje.destino === 'string'
      ? viaje.destino
      : viaje.destino?.nombre ?? '';

  const imagenBanner =
    (viaje.imagenViajeUrl && viaje.imagenViajeUrl.trim()) ||
    (viaje.imagen_url && viaje.imagen_url.trim()) ||
    '';

  const fechaIniStr = viaje.fechaIni ?? viaje.fecha_ini;
  const fechaFinStr = viaje.fechaFin ?? viaje.fecha_fin;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner del viaje */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        {imagenBanner ? (
          <>
            <Image
              src={imagenBanner}
              alt={`${viaje.nombre} - ${destinoNombre}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
              onError={(e) => {
                console.error(
                  translate('errors.trip.load', 'Error cargando viaje:'),
                  e,
                );
              }}
            />
            {/* Overlay gradiente solo cuando hay imagen */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600" />
        )}

        {/* Contenido del banner - nombre del viaje y destino */}
        <div className="absolute bottom-6 left-6 text-white z-10">
          <h1 className="text-3xl md:text-4xl font-bold drop-shadow-lg mb-2">
            {viaje.nombre}
          </h1>
          <div className="flex items-center gap-2">
            <Image
              src="/logo_blanco_sin_fondo.png"
              alt="Layover"
              width={20}
              height={20}
              className="drop-shadow-lg"
            />
            <span className="text-lg font-medium drop-shadow-lg">
              {destinoNombre}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navegación */}
        <div className="mb-6">
          <Link
            href="/viajes"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← {translate('viajes.backToList', 'Volver a mis viajes')}
          </Link>
        </div>

        {/* Información del viaje */}
        <div className="mb-8">
          {viaje.descripcion && (
            <p className="text-gray-600 max-w-3xl leading-relaxed">
              {viaje.descripcion}
            </p>
          )}
        </div>

        {/* Layout principal mejorado */}
        <div className="space-y-8">
          {/* Primera fila: Calendario y Resumen del día */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendario compacto */}
            <div className="lg:col-span-1">
              <Card className="border rounded-2xl shadow-sm h-fit">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-blue-500" />
                      {translate(
                        'viajes.calendar.title',
                        'Calendario del viaje',
                      )}
                    </h2>
                    <div className="text-sm text-gray-500">
                      {fechaIniStr
                        ? new Date(fechaIniStr).getFullYear()
                        : '2025'}
                    </div>
                  </div>

                  {/* Días de la semana */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-gray-500 py-1"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendario */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => {
                      const isSelected =
                        selectedDate &&
                        day.date.toDateString() ===
                          selectedDate.toDateString();
                      const hasEvents = day.events.length > 0;
                      const isToday =
                        day.date.toDateString() ===
                        new Date().toDateString();

                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedDate(day.date)}
                          className={`
                            h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium relative
                            ${
                              isSelected
                                ? 'bg-[#d5efb8] text-black shadow-md'
                                : isToday
                                ? 'bg-blue-100 text-blue-700 font-semibold'
                                : 'hover:bg-gray-100'
                            }
                            ${hasEvents ? 'ring-2 ring-blue-400' : ''}
                          `}
                        >
                          {day.date.getDate()}
                          {hasEvents && (
                            <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumen del dia seleccionado */}
            <div className="lg:col-span-2">
              <Card className="border rounded-2xl shadow-sm h-fit">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">
                    {selectedDate
                      ? selectedDate.toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })
                      : translate(
                          'viajes.calendar.selectDate',
                          'Selecciona una fecha',
                        )}
                  </h2>

                  {eventosDelDia.length > 0 ? (
                    <div className="space-y-3">
                      {eventosDelDia.map((evento) => (
                        <div
                          key={evento.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {evento.nombre}
                            </div>
                            {evento.hora && (
                              <div className="text-sm text-gray-500">
                                {evento.hora}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">
                        {translate(
                          'viajes.day.noActivities',
                          'No hay actividades para esta fecha',
                        )}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
         {/* Segunda fila: Actividades principales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Detalles de la actividad principal */}
            <div className="lg:col-span-2">
              {eventosDelDia.length > 0 ? (
                eventosDelDia.map(evento => (
                  <Card key={evento.id} className="border rounded-2xl shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h2 className="text-2xl font-semibold text-gray-900">{evento.nombre}</h2>
                        <div className="flex items-center gap-2">
                          <Link href={`/calendario/${evento.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4 text-blue-500" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteActividad(evento.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {evento.descripcion && (
                        <p className="text-gray-600 mb-4 italic">{evento.descripcion}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {evento.ubicacion && (
                          <div className="flex items-center gap-3 text-gray-600">
                            <MapPin className="w-5 h-5 text-blue-500" />
                            <span>{evento.ubicacion}</span>
                          </div>
                        )}
                        
                        {evento.hora && (
                          <div className="flex items-center gap-3 text-gray-600">
                            <Clock className="w-5 h-5 text-green-500" />
                            <span>{evento.hora}</span>
                          </div>
                        )}
                        
                        {evento.precio && (
                          <div className="flex items-center gap-3 text-gray-600">
                            <DollarSign className="w-5 h-5 text-yellow-500" />
                            <span className="font-medium">
                              {evento.precio}/persona
                            </span>
                          </div>
                        )}
                        
                        {evento.dificultad && (
                          <div className="flex items-center gap-3 text-gray-600">
                            <BarChart3 className="w-5 h-5 text-orange-500" />
                            <span>{evento.dificultad}</span>
                            <div className="flex gap-1">
                              {getDifficultyBars(evento.dificultad)}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border rounded-2xl shadow-sm">
                  <CardContent className="p-6">
                    <div className="text-center py-12 text-gray-500">
                      <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">{translate('viajes.day.noActivities', 'No hay actividades para esta fecha')}</p>
                      <p className="text-sm mt-2">{translate('viajes.day.noActivities.suggest', 'Selecciona otra fecha o crea una nueva actividad')}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Columna derecha: Crear Actividad */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                {/* Botón crear actividad */}
                <Link href={`/calendario/nuevo?viajeId=${viajeId}`}>
                  <Button className="w-full bg-[#d5efb8] text-black hover:bg-[#c3e19e] text-lg py-6">
                    <Plus className="w-5 h-5 mr-2" />
                    {translate('viajes.actions.createActivity', 'Crear Actividad')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Tercera fila: Reservas del viaje */}
          <ReservasList 
            viajeId={viajeId} 
            monedaBase={viaje.monedaBase ?? viaje.moneda_base ?? 'USD'}
          />

          {/* Cuarta fila: Mapa de actividades */}
          <Card className="border rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  {translate('viajes.map.title', 'Mapa de Actividades')}
                </h2>
                <span className="text-sm text-gray-500">
                  {eventos.filter(e => e.ubicacion).length} {translate('viajes.map.locations', 'ubicaciones')}
                </span>
              </div>
              
              {/* Leyenda de colores */}
              {eventos.filter(e => e.ubicacion).length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-3">{translate('viajes.map.legend.title', 'Leyenda')}</h4>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-700">{translate('difficulty.none', 'Sin dificultad')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-blue-700">{translate('difficulty.easy', 'Fácil')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                      <span className="text-blue-700">{translate('difficulty.moderate', 'Moderado')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span className="text-blue-700">{translate('difficulty.hard', 'Exigente')}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="h-96 rounded-lg overflow-hidden border mb-6">
                <MapaActividadesFuncional eventos={eventos} className="h-full" />
              </div>
              
              {/* Leyenda de actividades */}
              {eventos.filter(e => e.ubicacion).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    {translate('viajes.map.activitiesLegend', 'Actividades')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {eventos
                      .filter(evento => evento.ubicacion)
                      .map((evento, index) => (
                        <div 
                          key={evento.id} 
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">
                              {evento.nombre}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{evento.ubicacion}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {evento.hora && (
                                <div className="flex items-center gap-1 text-xs text-blue-600">
                                  <Clock className="w-3 h-3" />
                                  <span>{evento.hora}</span>
                                </div>
                              )}
                              {evento.precio && (
                                <div className="flex items-center gap-1 text-xs text-green-600">
                                  <DollarSign className="w-3 h-3" />
                                  <span>{evento.precio}€</span>
                                </div>
                              )}
                              {evento.dificultad && (
                                <div className="flex items-center gap-1 text-xs">
                                  <BarChart3 className="w-3 h-3" />
                                  <span className={
                                    evento.dificultad === 'Fácil' ? 'text-green-600' :
                                    evento.dificultad === 'Moderado' ? 'text-yellow-600' :
                                    'text-red-600'
                                  }>
                                    {evento.dificultad}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {eventos.filter(e => e.ubicacion).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">{translate('viajes.map.noLocations.title', 'No hay ubicaciones registradas')}</p>
                  <p className="text-sm mt-2">{translate('viajes.map.noLocations.subtitle', 'Agrega ubicaciones a tus actividades para verlas en el mapa')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quinta fila: Gastos del viaje */}
          <GastosTable 
            viajeId={viajeId} 
            monedaBase={viaje.monedaBase ?? viaje.moneda_base ?? 'USD'}
            presupuestoInicial={
              viaje.presupuestoInicial 
                ? (typeof viaje.presupuestoInicial === 'string' 
                    ? parseFloat(viaje.presupuestoInicial) 
                    : viaje.presupuestoInicial)
                : (viaje.presupuesto_inicial ?? undefined)
            }
          />
        </div>
      </div>
    </div>
  );
}