'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Search, 
  MapPin, 
  Clock,
  Plane,
  Hotel,
  Car,
} from 'lucide-react';
import { useLocale } from '@/components/locale-provider';
import Link from 'next/link';
import Image from 'next/image';
import { getAuthUser, getAuthToken } from '@/lib/auth-client';
import type { Viaje as ViajeApi } from '@/app/(main)/viajes/model/viaje.interfaces';
import {
  mapApiGastoArray,
  type Gasto as GastoApi,
} from '@/app/(main)/gastos/model/gastosinterface';
import { convertAmount, formatAmount, normalizeCurrency } from '@/lib/currency';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida');
}

interface ViajeCard {
  id: number;
  nombre: string;
  destino: string;
  fecha_ini: string;
  fecha_fin: string;
  descripcion?: string;
  estado: 'planificando' | 'confirmado' | 'en_curso' | 'completado';
}

type ReservaTipo = 'vuelo' | 'hotel';

interface ReservaResumen {
  id: number;
  nombre: string;
  tipo: ReservaTipo;
  fecha_inicio: string;
  ubicacion_destino: string;
  estado: 'confirmada' | 'pendiente' | 'cancelada';
}

interface DashboardStats {
  totalViajes: number;
  gastosTotales: number;
  proximasReservas: number;
  eventosHoy: number;
}

export default function HomePage() {
  const { translate } = useLocale();
  const [stats, setStats] = useState<DashboardStats>({
    totalViajes: 0,
    gastosTotales: 0,
    proximasReservas: 0,
    eventosHoy: 0,
  });
  const [viajesRecientes, setViajesRecientes] = useState<ViajeCard[]>([]);
  const [proximasReservas, setProximasReservas] = useState<ReservaResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferredCurrency, setPreferredCurrency] = useState<string>('USD');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = getAuthUser();

      if (!user) {
        console.error('No hay usuario autenticado, no se puede cargar el dashboard');
        setLoading(false);
        return;
      }

      const token = getAuthToken();
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

      const userCurrency = normalizeCurrency(user.monedaBase ?? 'USD');
      setPreferredCurrency(userCurrency);

      // Cargar datos reales del backend en paralelo
      const [viajesRes, gastosRes, reservasVueloRes, reservasHotelRes, actividadesRes] =
        await Promise.all([
          fetch(`${API_URL}/usuarios/${user.id}/viajes`, {
            cache: 'no-store',
            headers: authHeaders,
          }),
          fetch(`${API_URL}/gastos`, {
            cache: 'no-store',
            headers: authHeaders,
          }),
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

      const viajesJson: ViajeApi[] = viajesRes.ok ? await viajesRes.json() : [];
      const gastosJson: unknown[] = gastosRes.ok ? await gastosRes.json() : [];
      const reservasVueloJson: unknown[] = reservasVueloRes.ok
        ? await reservasVueloRes.json()
        : [];
      const reservasHotelJson: unknown[] = reservasHotelRes.ok
        ? await reservasHotelRes.json()
        : [];
      const actividadesJson: unknown[] = actividadesRes.ok
        ? await actividadesRes.json()
        : [];

      const gastosMapped: GastoApi[] = Array.isArray(gastosJson)
        ? mapApiGastoArray(gastosJson)
        : [];

      const viajeCurrency = new Map<number, string>();
      for (const v of viajesJson) {
        const moneda =
          v.monedaBase ?? v.moneda_base ?? userCurrency;
        viajeCurrency.set(v.id, normalizeCurrency(moneda));
      }

      // Estadisticas
      let gastosTotales = gastosMapped.reduce((sum, g) => {
        return (
          sum +
          convertAmount(g.monto, g.moneda ?? 'EUR', userCurrency)
        );
      }, 0);

      // Calcular reservas y eventos
      const hoyStr = new Date().toISOString().split('T')[0];

      type ReservaVueloApi = {
        idReserva: number;
        aerolinea: string;
        fechaSalida: string;
        horaSalida: string;
        origenId?: number;
        destinoId?: number;
        estado?: 'confirmada' | 'pendiente' | 'cancelada';
      };

      type ReservaHotelApi = {
        idReserva: number;
        nombre: string;
        fechaCheckIn: string;
        fechaCheckOut?: string;
        ubicacionHotelId?: number;
        estado?: 'confirmada' | 'pendiente' | 'cancelada';
        monto?: number;
        moneda?: string;
        viajeId?: number;
      };

      const vuelos: ReservaVueloApi[] = Array.isArray(reservasVueloJson)
        ? (reservasVueloJson as ReservaVueloApi[])
        : [];
      const hoteles: ReservaHotelApi[] = Array.isArray(reservasHotelJson)
        ? (reservasHotelJson as ReservaHotelApi[])
        : [];

      // Incluir actividades y reservas en el total de gastos
      const actividadesArr: any[] = Array.isArray(actividadesJson)
        ? actividadesJson
        : [];

      for (const a of actividadesArr) {
        const viajeId = a.viajeId ?? a.viaje_id ?? a.viaje?.id;
        const rawTotal =
          typeof a.precioTotal === 'number'
            ? a.precioTotal
            : a.precioTotal
            ? parseFloat(a.precioTotal)
            : undefined;

        if (!rawTotal || Number.isNaN(rawTotal)) continue;

        const monedaActividad =
          (viajeId && viajeCurrency.get(viajeId)) ?? userCurrency;

        gastosTotales += convertAmount(
          rawTotal,
          monedaActividad,
          userCurrency,
        );
      }

      const processReservaMonto = (arr: any[]) => {
        for (const r of arr) {
          const viajeId = r.viajeId ?? r.viaje_id ?? r.viaje?.idViaje;
          const rawMonto =
            typeof r.monto === 'number'
              ? r.monto
              : r.monto
              ? parseFloat(r.monto)
              : typeof r.precio_total === 'number'
              ? r.precio_total
              : r.precio_total
              ? parseFloat(r.precio_total)
              : undefined;

          if (!rawMonto || Number.isNaN(rawMonto)) continue;

          const monedaReserva =
            r.moneda ??
            (viajeId ? viajeCurrency.get(viajeId) : undefined) ??
            userCurrency;

          gastosTotales += convertAmount(
            rawMonto,
            monedaReserva,
            userCurrency,
          );
        }
      };

      processReservaMonto(vuelos);
      processReservaMonto(hoteles);

      const reservasNormalizadas: ReservaResumen[] = [
        ...vuelos.map((v) => ({
          id: v.idReserva,
          nombre: v.aerolinea,
          tipo: 'vuelo' as const,
          fecha_inicio: v.fechaSalida,
          ubicacion_destino: v.destinoId ? `Destino ${v.destinoId}` : '',
          estado: v.estado ?? 'confirmada',
        })),
        ...hoteles.map((h) => ({
          id: h.idReserva,
          nombre: h.nombre,
          tipo: 'hotel' as const,
          fecha_inicio: h.fechaCheckIn,
          ubicacion_destino: h.ubicacionHotelId
            ? `Hotel ${h.ubicacionHotelId}`
            : '',
          estado: h.estado ?? 'confirmada',
        })),
      ];

      const eventosHoy = reservasNormalizadas.filter(
        (r) => r.fecha_inicio === hoyStr,
      ).length;

      const reservasFuturas = reservasNormalizadas.filter((r) => {
        return r.fecha_inicio >= hoyStr;
      }).length;

      setStats({
        totalViajes: viajesJson.length,
        gastosTotales,
        proximasReservas: reservasFuturas,
        eventosHoy,
      });

      // Viajes proximos
      const ahora = new Date().toISOString().split('T')[0];

      // Viajes futuros
      const viajesFuturos = viajesJson.filter((v) => {
        const fechaIni = v.fechaIni ?? v.fecha_ini ?? '';
        return fechaIni && fechaIni >= ahora;
      });

      // Ordenar por fecha de inicio
      const viajesOrdenados = [...viajesFuturos].sort((a, b) => {
        const aFecha = a.fechaIni ?? a.fecha_ini ?? '';
        const bFecha = b.fechaIni ?? b.fecha_ini ?? '';
        return aFecha.localeCompare(bFecha);
      });

      const recientes: ViajeCard[] = viajesOrdenados.slice(0, 3).map((v) => {
        const fechaIni = v.fechaIni ?? v.fecha_ini ?? '';
        const fechaFin = v.fechaFin ?? v.fecha_fin ?? '';

        let estado: ViajeCard['estado'] = 'planificando';
        if (fechaFin && fechaFin < ahora) {
          estado = 'completado';
        } else if (fechaIni && fechaIni > ahora) {
          estado = 'planificando';
        } else if (fechaIni && fechaFin && fechaIni <= ahora && fechaFin >= ahora) {
          estado = 'en_curso';
        } else {
          estado = 'confirmado';
        }

        const destinoNombre =
          typeof v.destino === 'string'
            ? v.destino
            : v.destino?.nombre ?? '';

        return {
          id: v.id,
          nombre: v.nombre,
          destino: destinoNombre,
          fecha_ini: fechaIni,
          fecha_fin: fechaFin,
          descripcion: v.descripcion ?? undefined,
          estado,
        };
      });

      setViajesRecientes(recientes);

      // Proximas reservas
      const proximas = reservasNormalizadas
        .filter((r) => r.fecha_inicio >= hoyStr)
        .sort(
          (a, b) =>
            new Date(a.fecha_inicio).getTime() -
            new Date(b.fecha_inicio).getTime(),
        )
        .slice(0, 3);

      setProximasReservas(proximas);

    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'vuelo':
        return <Plane className="w-4 h-4" />;
      case 'hotel':
        return <Hotel className="w-4 h-4" />;
      case 'transporte':
        return <Car className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Sin fecha';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="page-title-row">
        <Image
          src="/logo_blanco.png"
          alt="Layover"
          width={28}
          height={28}
          className="page-title-icon"
          priority
        />
        <h1 className="page-title">
          {translate('home.welcome', 'Bienvenido a Layover')}
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {translate('home.stats.totalTrips', 'Total Viajes')}
            </CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViajes}</div>
            <p className="text-xs text-muted-foreground">
              {translate('home.stats.tripsDescription', 'Viajes planificados')}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {translate('home.stats.upcomingReservations', 'Próximas Reservas')}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.proximasReservas}</div>
            <p className="text-xs text-muted-foreground">
              {translate('home.stats.reservationsDescription', 'En los próximos días')}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {translate('home.stats.todayEvents', 'Eventos Hoy')}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.eventosHoy}</div>
            <p className="text-xs text-muted-foreground">
              {translate('home.stats.eventsDescription', 'Eventos programados')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Viajes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {translate('home.recentTrips.title', 'Viajes')}
            </CardTitle>
            <Link href="/viajes">
              <Button variant="ghost" size="sm">
                {translate('home.recentTrips.viewAll', 'Ver todos')}
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {viajesRecientes.length > 0 ? (
              <div className="space-y-4">
                {viajesRecientes.map((viaje) => (
                  <div key={viaje.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{viaje.nombre}</h4>
                        <p className="text-xs text-muted-foreground">{viaje.destino}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(viaje.fecha_ini)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {viaje.estado}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{translate('home.recentTrips.empty', 'No tienes viajes')}</p>
                <Link href="/viajes/nuevo">
                  <Button variant="outline" size="sm" className="mt-2">
                    {translate('home.recentTrips.createFirst', 'Crear primer viaje')}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Proximas Reservas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {translate('home.upcomingReservations.title', 'Próximas Reservas')}
            </CardTitle>
            <Link href="/calendario">
              <Button variant="ghost" size="sm">
                {translate('home.upcomingReservations.viewCalendar', 'Ver calendario')}
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {proximasReservas.length > 0 ? (
              <div className="space-y-4">
                {proximasReservas.map((reserva) => (
                  <div key={reserva.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        {getTipoIcon(reserva.tipo)}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{reserva.nombre}</h4>
                        <p className="text-xs text-muted-foreground">{reserva.ubicacion_destino}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(reserva.fecha_inicio)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{translate('home.upcomingReservations.empty', 'No tienes reservas próximas')}</p>
                <Link href="/calendario/nuevo">
                  <Button variant="outline" size="sm" className="mt-2">
                    {translate('home.upcomingReservations.createFirst', 'Crear primera reserva')}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}