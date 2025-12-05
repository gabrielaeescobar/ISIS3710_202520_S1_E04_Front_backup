'use client';

import { useEffect, useMemo, useState } from "react";
import type { Gasto } from "../model/gastosinterface";
import { mapApiGastoArray } from "../model/gastosinterface";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";
import { useLocale } from "@/components/locale-provider";
import { getAuthUser } from "@/lib/auth-client";
import { convertAmount, formatAmount, normalizeCurrency } from "@/lib/currency";

type Props = { userName?: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida');
}

export default function GastosResumen({ userName }: Props) {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [actividades, setActividades] = useState<any[]>([]);
  const [reservasVuelo, setReservasVuelo] = useState<any[]>([]);
  const [reservasHotel, setReservasHotel] = useState<any[]>([]);
  const [viajes, setViajes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { translate } = useLocale();
  const authUser = typeof window !== "undefined" ? getAuthUser() : null;
  const preferredCurrency = normalizeCurrency(authUser?.monedaBase ?? "USD");
  
  const displayUserName = userName ?? authUser?.nombre ?? authUser?.username ?? "Usuario";

  useEffect(() => {
    (async () => {
      try {
        const user = getAuthUser();

        const [gRes, aRes, rvRes, rhRes, vRes] = await Promise.all([
          fetch(`${API_URL}/gastos`, { cache: "no-store" }),
          fetch(`${API_URL}/actividades`, { cache: "no-store" }),
          fetch(`${API_URL}/reservas-vuelo`, { cache: "no-store" }),
          fetch(`${API_URL}/reservas-hotel`, { cache: "no-store" }),
          user
            ? fetch(`${API_URL}/usuarios/${user.id}/viajes`, {
                cache: "no-store",
              })
            : Promise.resolve({ ok: false } as Response),
        ]);

        if (gRes.ok) {
          const json = await gRes.json();
          setGastos(mapApiGastoArray(json));
        } else {
          console.error("Error al llamar /gastos", gRes.status);
        }

        if (aRes.ok) {
          const json = await aRes.json();
          setActividades(Array.isArray(json) ? json : []);
        } else {
          console.error("Error al llamar /actividades", aRes.status);
        }

        if (rvRes.ok) {
          const json = await rvRes.json();
          setReservasVuelo(Array.isArray(json) ? json : []);
        } else {
          console.error("Error al llamar /reservas-vuelo", rvRes.status);
        }

        if (rhRes.ok) {
          const json = await rhRes.json();
          setReservasHotel(Array.isArray(json) ? json : []);
        } else {
          console.error("Error al llamar /reservas-hotel", rhRes.status);
        }

        if (vRes.ok) {
          const json = await vRes.json();
          setViajes(Array.isArray(json) ? json : []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { total, totalUsuario, porViaje } = useMemo(() => {
    // Crear Set con los IDs de los viajes del usuario para filtrar
    const viajesIds: Set<number> = new Set();
    for (const v of viajes) {
      const id = v.id;
      if (id) viajesIds.add(id);
    }

    // mapa viajeId y moneda del viaje
    const viajeCurrency = new Map<number, string>();
    for (const v of viajes) {
      const id = v.id;
      if (!id) continue;
      const moneda =
        v.monedaBase ?? v.moneda_base ?? preferredCurrency;
      viajeCurrency.set(id, normalizeCurrency(moneda));
    }

    // Filtrar gastos que pertenecen a los viajes del usuario
    const gastosFiltrados = gastos.filter((g) => {
      const viajeId = g.viajeId;
      return viajeId && viajesIds.has(viajeId);
    });

    // Convertir todos los gastos filtrados a la moneda preferida 
    const converted = gastosFiltrados.map((g) => ({
      ...g,
      montoPreferido: convertAmount(g.monto, g.moneda ?? "EUR", preferredCurrency),
    }));

    let total = converted.reduce((acc, g) => acc + g.montoPreferido, 0);

    // Intentar identificar al usuario por email 
    const currentEmail = authUser?.email?.toLowerCase() ?? displayUserName.toLowerCase();

    let totalUsuario = converted
      .filter((g) => (g.pagadoPor?.toLowerCase() ?? "") === currentEmail)
      .reduce((acc, g) => acc + g.montoPreferido, 0);

    // Agrupar por viaje
    const byViaje = new Map<number, { nombre: string; total: number }>();
    for (const g of converted) {
      const viajeId = g.viajeId;
      if (!viajeId) continue;
      const viaje = viajes.find((v) => (v.id ?? v.idViaje) === viajeId);
      const nombreViaje = viaje?.nombre ?? `Viaje ${viajeId}`;
      const current = byViaje.get(viajeId) ?? { nombre: nombreViaje, total: 0 };
      byViaje.set(viajeId, { ...current, total: current.total + g.montoPreferido });
    }

    // Filtrar y procesar actividades que pertenecen a los viajes del usuario
    const actividadesFiltradas = actividades.filter((a) => {
      const viajeId = a.viajeId ?? a.viaje_id ?? a.viaje?.id;
      return viajeId && viajesIds.has(viajeId);
    });

    for (const a of actividadesFiltradas) {
      const viajeId = a.viajeId ?? a.viaje_id ?? a.viaje?.id;

      const rawTotal =
        typeof a.precioTotal === "number"
          ? a.precioTotal
          : a.precioTotal
          ? parseFloat(a.precioTotal)
          : undefined;

      if (!rawTotal || Number.isNaN(rawTotal)) continue;

      const monedaActividad =
        viajeCurrency.get(viajeId) ?? preferredCurrency;

      const montoPreferido = convertAmount(
        rawTotal,
        monedaActividad,
        preferredCurrency,
      );

      const pagadoPor =
        (a.usuarioPagador?.email as string | undefined)?.toLowerCase() ??
        undefined;

      if (pagadoPor && pagadoPor === currentEmail) {
        totalUsuario += montoPreferido;
      }

      total += montoPreferido;
      if (viajeId) {
        const viaje = viajes.find((v) => (v.id ?? v.idViaje) === viajeId);
        const nombreViaje = viaje?.nombre ?? `Viaje ${viajeId}`;
        const current = byViaje.get(viajeId) ?? { nombre: nombreViaje, total: 0 };
        byViaje.set(viajeId, { ...current, total: current.total + montoPreferido });
      }
    }

    // Reservas de vuelo y hotel
    const processReservaArray = (arr: any[]) => {
      // Filtrar reservas que pertenecen a los viajes del usuario
      const reservasFiltradas = arr.filter((r) => {
        const viajeId = r.viajeId ?? r.viaje_id ?? r.viaje?.idViaje ?? r.viaje?.id;
        return viajeId && viajesIds.has(viajeId);
      });

      for (const r of reservasFiltradas) {
        const viajeId = r.viajeId ?? r.viaje_id ?? r.viaje?.idViaje ?? r.viaje?.id;
        const rawMonto =
          typeof r.monto === "number"
            ? r.monto
            : r.monto
            ? parseFloat(r.monto)
            : typeof r.precio_total === "number"
            ? r.precio_total
            : r.precio_total
            ? parseFloat(r.precio_total)
            : undefined;

        if (!rawMonto || Number.isNaN(rawMonto)) continue;

        const monedaReserva =
          r.moneda ??
          (viajeId ? viajeCurrency.get(viajeId) : undefined) ??
          preferredCurrency;

        const montoPreferido = convertAmount(
          rawMonto,
          monedaReserva,
          preferredCurrency,
        );

        const pagadoPor =
          (r.usuarioPagador?.email as string | undefined)?.toLowerCase() ??
          undefined;

        if (pagadoPor && pagadoPor === currentEmail) {
          totalUsuario += montoPreferido;
        }

        total += montoPreferido;

        // Agregar a la agrupación por viaje
        if (viajeId) {
          const viaje = viajes.find((v) => (v.id ?? v.idViaje) === viajeId);
          const nombreViaje = viaje?.nombre ?? `Viaje ${viajeId}`;
          const current = byViaje.get(viajeId) ?? { nombre: nombreViaje, total: 0 };
          byViaje.set(viajeId, { ...current, total: current.total + montoPreferido });
        }
      }
    };

    processReservaArray(reservasVuelo);
    processReservaArray(reservasHotel);

    const porViaje = Array.from(byViaje.values()).map((v) => ({
      name: v.nombre,
      value: v.total,
    }));

    return {
      total,
      totalUsuario,
      porViaje,
    };
  }, [gastos, actividades, reservasVuelo, reservasHotel, viajes, authUser, displayUserName, preferredCurrency, translate]);

  if (loading) {
    return (
      <div className="p-3 md:p-4">
        {translate('gastosResumen.loading', 'Cargando resumen…')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm min-h-[120px] flex flex-col justify-between">
          <div className="text-sm text-gray-600 mb-1">
            {translate('gastosResumen.totalExpenses', 'Total gastos')}
          </div>
          <div className="text-3xl font-semibold tracking-tight">
            {formatAmount(total, preferredCurrency)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {translate('gastosResumen.currency', 'Moneda:')} {preferredCurrency}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm min-h-[120px] flex flex-col justify-between">
          <div className="text-sm text-gray-600 mb-1">
            {translate('gastosResumen.spentByYou', 'Gastado por ti')}
          </div>
          <div className="text-3xl font-semibold tracking-tight">
            {formatAmount(totalUsuario, preferredCurrency)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {translate('gastosResumen.user', 'Usuario:')} {displayUserName}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm min-h-[120px] flex flex-col justify-between">
          <div className="text-sm text-gray-600 mb-1">
            {translate('gastosResumen.tripsGroups', 'Viajes (grupos)')}
          </div>
          <div className="text-3xl font-semibold tracking-tight">{porViaje.length}</div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">
            {translate('gastosResumen.expensesByTrip', 'Gastos por viaje')}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {translate('gastosResumen.currency', 'Moneda:')} {preferredCurrency}
          </p>
        </div>
        {porViaje.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={porViaje}
                margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
                barSize={42}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(v: number) =>
                    formatAmount(v, preferredCurrency)
                  }
                  cursor={{ fill: "rgba(159,192,49,0.08)" }}
                />
                <Bar
                  dataKey="value"
                  fill="#d5efb8"
                  radius={[10, 10, 4, 4]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-gray-400">
            <p>{translate('gastosResumen.noData', 'No hay datos para mostrar')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
