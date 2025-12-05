'use client';

import { useState, useEffect, type ComponentType } from 'react';
import dynamic from 'next/dynamic';
import dayGridPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es';
import interactionPlugin from '@fullcalendar/interaction';
import type { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import { useLocale } from '@/components/locale-provider';
import { getAuthUser, getAuthToken } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

type CalendarEvent = { 
  id: string; 
  title: string; 
  start: string; 
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: {
    tipo: 'vuelo' | 'hotel' | 'actividad';
    viajeId?: number;
  };
};

interface ReservaVueloApi {
  idReserva: number;
  aerolinea: string;
  fechaSalida: string;
  horaSalida: string;
  viaje?: {
    idViaje: number;
  };
}

interface ReservaHotelApi {
  idReserva: number;
  nombre: string;
  fechaCheckIn: string;
  viaje?: {
    idViaje: number;
  };
}

interface ActividadApi {
  idActividad: number;
  nombre: string;
  fecha: string;
  horInicio: string;
  viajeId?: number;
  viaje_id?: number;
  viaje?: {
    id: number;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida');
}

export const EventosList = () => {
  const [eventos, setEventos] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { translate } = useLocale();
  const router = useRouter();

  useEffect(() => {
    const user = getAuthUser();

    if (!user) {
      console.error('No hay usuario autenticado, no se pueden cargar eventos');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const token = getAuthToken();
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

        // Primero obtener los viajes del usuario para filtrar
        const viajesRes = await fetch(`${API_URL}/usuarios/${user.id}/viajes`, {
          cache: 'no-store',
          headers: authHeaders,
        });

        let viajesIds: Set<number> = new Set();
        if (viajesRes.ok) {
          const viajesJson: unknown = await viajesRes.json();
          const viajesData: Array<{ id: number }> = Array.isArray(viajesJson)
            ? (viajesJson as Array<{ id: number }>)
            : [];
          viajesData.forEach((v) => {
            if (v.id) viajesIds.add(v.id);
          });
        }

        // Si no hay viajes, no hay eventos que mostrar
        if (viajesIds.size === 0) {
          setEventos([]);
          setLoading(false);
          return;
        }

        const [vuelosRes, hotelesRes, actividadesRes] = await Promise.all([
          fetch(`${API_URL}/reservas-vuelo`, {
            cache: 'no-store',
            headers: authHeaders,
          }),
          fetch(`${API_URL}/reservas-hotel`, {
            cache: 'no-store',
            headers: authHeaders,
          }),
          fetch(`${API_URL}/actividades`, {
            cache: 'no-store',
            headers: authHeaders,
          }),
        ]);

        if (!vuelosRes.ok) {
          console.error(
            'Error al llamar /reservas-vuelo en el back',
            vuelosRes.status,
          );
        }
        if (!hotelesRes.ok) {
          console.error(
            'Error al llamar /reservas-hotel en el back',
            hotelesRes.status,
          );
        }
        if (!actividadesRes.ok) {
          console.error(
            'Error al llamar /actividades en el back',
            actividadesRes.status,
          );
        }

        const vuelosJson: unknown = vuelosRes.ok ? await vuelosRes.json() : [];
        const hotelesJson: unknown = hotelesRes.ok ? await hotelesRes.json() : [];
        const actividadesJson: unknown = actividadesRes.ok ? await actividadesRes.json() : [];

        const vuelosData: ReservaVueloApi[] = Array.isArray(vuelosJson)
          ? (vuelosJson as ReservaVueloApi[])
          : [];

        const hotelesData: ReservaHotelApi[] = Array.isArray(hotelesJson)
          ? (hotelesJson as ReservaHotelApi[])
          : [];

        const actividadesData: ActividadApi[] = Array.isArray(actividadesJson)
          ? (actividadesJson as ActividadApi[])
          : [];

        // Filtrar solo los eventos que pertenecen a los viajes del usuario
        const vuelosFiltrados = vuelosData.filter((v) => {
          const viajeId = v.viaje?.idViaje;
          return viajeId && viajesIds.has(viajeId);
        });

        const hotelesFiltrados = hotelesData.filter((h) => {
          const viajeId = h.viaje?.idViaje;
          return viajeId && viajesIds.has(viajeId);
        });

        const actividadesFiltradas = actividadesData.filter((a) => {
          // Intentar obtener viajeId de diferentes formas posibles
          const viajeId = a.viajeId ?? a.viaje_id ?? a.viaje?.id;
          return viajeId && viajesIds.has(viajeId);
        });

        const vuelosMapped: CalendarEvent[] = vuelosFiltrados.map((v) => ({
          id: `vuelo-${v.idReserva}`,
          title: `✈️ ${v.aerolinea} (Viaje ${v.viaje?.idViaje ?? ''})`,
          start: `${v.fechaSalida}T${v.horaSalida}`,
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb',
          extendedProps: {
            tipo: 'vuelo',
            viajeId: v.viaje?.idViaje,
          },
        }));

        const hotelesMapped: CalendarEvent[] = hotelesFiltrados.map((h) => ({
          id: `hotel-${h.idReserva}`,
          title: `🏨 ${h.nombre} (Viaje ${h.viaje?.idViaje ?? ''})`,
          start: `${h.fechaCheckIn}T10:00:00`,
          backgroundColor: '#10b981',
          borderColor: '#059669',
          extendedProps: {
            tipo: 'hotel',
            viajeId: h.viaje?.idViaje,
          },
        }));

        const actividadesMapped: CalendarEvent[] = actividadesFiltradas.map((a) => {
          const viajeId = a.viajeId ?? a.viaje_id ?? a.viaje?.id;
          return {
            id: `actividad-${a.idActividad}`,
            title: `${a.nombre}${viajeId ? ` (Viaje ${viajeId})` : ''}`,
            start: `${a.fecha}T${a.horInicio}`,
            backgroundColor: '#f97316',
            borderColor: '#ea580c',
            extendedProps: {
              tipo: 'actividad',
              viajeId,
            },
          };
        });

        const todosEventos = [
          ...vuelosMapped,
          ...hotelesMapped,
          ...actividadesMapped,
        ];

        setEventos(todosEventos);
      } catch (e) {
        console.error('Error de red llamando a los endpoints de eventos', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const FullCalendar = dynamic(
    () => import('@fullcalendar/react'),
    { ssr: false },
  ) as ComponentType<CalendarOptions>;

  const handleEventClick = (info: EventClickArg) => {
    const id = info.event.id;

    if (id.startsWith('vuelo-')) {
      const vueloId = id.replace('vuelo-', '');
      // Detalle de reserva de vuelo 
      router.push(`/reservas/${vueloId}`);
      return;
    }

    if (id.startsWith('hotel-')) {
      const hotelId = id.replace('hotel-', '');
      // Detalle de reserva de hotel 
      router.push(`/reservas/${hotelId}`);
      return;
    }

    if (id.startsWith('actividad-')) {
      const actividadId = id.replace('actividad-', '');
      // Detalle de actividad
      router.push(`/calendario/${actividadId}`);
      return;
    }
  };

  if (loading) {
    return (
      <section>
        <p className="mt-4 text-gray-500">
          {translate('calendario.loading', 'Cargando eventos...')}
        </p>
      </section>
    );
  }

  return (
    <section>
      {!eventos.length && (
        <p className="mt-4 text-gray-500">
          {translate(
            'calendario.emptyUserEvents',
            'Aún no tienes eventos asociados a tus viajes.',
          )}
        </p>
      )}

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
        locales={[esLocale]}
        locale="es"
        events={eventos}
        aspectRatio={2}
        eventClick={handleEventClick}
      />
    </section>
  );
};
