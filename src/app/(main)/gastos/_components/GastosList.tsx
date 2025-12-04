'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Gasto } from "../model/gastosinterface";
import { mapApiGastoArray } from "../model/gastosinterface";
import { useLocale } from "@/components/locale-provider";
import { getAuthUser } from "@/lib/auth-client";
import { convertAmount, formatAmount, normalizeCurrency } from "@/lib/currency";

type ListItem = {
  id: string;
  titulo: string;
  detalle: string;
  monto: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida');
}

export default function GastosList() {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { translate } = useLocale();
  const authUser = typeof window !== "undefined" ? getAuthUser() : null;
  const preferredCurrency = normalizeCurrency(authUser?.monedaBase ?? "USD");

  useEffect(() => {
    cargarGastos();
  }, []);

  const cargarGastos = async () => {
    try {
      const user = getAuthUser();
      
      const [gRes, aRes, rvRes, rhRes, vRes] = await Promise.all([
        fetch(`${API_URL}/gastos`, { cache: "no-store" }),
        fetch(`${API_URL}/actividades`, { cache: "no-store" }),
        fetch(`${API_URL}/reservas-vuelo`, { cache: "no-store" }),
        fetch(`${API_URL}/reservas-hotel`, { cache: "no-store" }),
        user
          ? fetch(`${API_URL}/usuarios/${user.id}/viajes`, { cache: "no-store" })
          : Promise.resolve({ ok: false } as Response),
      ]);

      const gastosData: Gasto[] = gRes.ok ? mapApiGastoArray(await gRes.json()) : [];
      const actividadesData: any[] = aRes.ok ? (await aRes.json()) : [];
      const reservasVueloData: any[] = rvRes.ok ? (await rvRes.json()) : [];
      const reservasHotelData: any[] = rhRes.ok ? (await rhRes.json()) : [];
      const viajesData: any[] = vRes.ok ? (await vRes.json()) : [];

      // Mapa viajeId y moneda del viaje
      const viajeCurrency = new Map<number, string>();
      for (const v of viajesData) {
        const id = v.id ?? v.idViaje;
        if (!id) continue;
        const moneda = v.monedaBase ?? v.moneda_base ?? preferredCurrency;
        viajeCurrency.set(id, normalizeCurrency(moneda));
      }

      const allItems: ListItem[] = [];

      // Gastos
      for (const g of gastosData) {
        const converted = convertAmount(g.monto, g.moneda ?? "EUR", preferredCurrency);
        allItems.push({
          id: `gasto-${g.idGasto}`,
          titulo: g.concepto,
          detalle: `${g.categoria} · ${new Date(g.fecha).toLocaleDateString("es-ES")}`,
          monto: formatAmount(converted, preferredCurrency),
        });
      }

      // Actividades
      for (const a of actividadesData) {
        const viajeId = a.viajeId ?? a.viaje_id ?? a.viaje?.id;
        if (!viajeId) continue;
        const rawTotal = typeof a.precioTotal === "number" ? a.precioTotal : a.precioTotal ? parseFloat(a.precioTotal) : undefined;
        if (!rawTotal || Number.isNaN(rawTotal)) continue;
        const monedaActividad = viajeCurrency.get(viajeId) ?? preferredCurrency;
        const converted = convertAmount(rawTotal, monedaActividad, preferredCurrency);
        allItems.push({
          id: `actividad-${a.idActividad}`,
          titulo: a.nombre,
          detalle: `Actividad · ${new Date(a.fecha).toLocaleDateString("es-ES")}`,
          monto: formatAmount(converted, preferredCurrency),
        });
      }

      // Reservas de vuelo
      for (const r of reservasVueloData) {
        const viajeId = r.viajeId ?? r.viaje_id ?? r.viaje?.idViaje;
        const rawMonto = typeof r.monto === "number" ? r.monto : r.monto ? parseFloat(r.monto) : typeof r.precio_total === "number" ? r.precio_total : r.precio_total ? parseFloat(r.precio_total) : undefined;
        if (!rawMonto || Number.isNaN(rawMonto)) continue;
        const monedaReserva = r.moneda ?? (viajeId ? viajeCurrency.get(viajeId) : undefined) ?? preferredCurrency;
        const converted = convertAmount(rawMonto, monedaReserva, preferredCurrency);
        allItems.push({
          id: `vuelo-${r.idReserva ?? r.id}`,
          titulo: r.aerolinea ?? "Vuelo",
          detalle: `Vuelo · ${new Date(r.fechaSalida).toLocaleDateString("es-ES")}`,
          monto: formatAmount(converted, preferredCurrency),
        });
      }

      // Reservas de hotel
      for (const r of reservasHotelData) {
        const viajeId = r.viajeId ?? r.viaje_id ?? r.viaje?.idViaje;
        const rawMonto = typeof r.monto === "number" ? r.monto : r.monto ? parseFloat(r.monto) : typeof r.precio_total === "number" ? r.precio_total : r.precio_total ? parseFloat(r.precio_total) : undefined;
        if (!rawMonto || Number.isNaN(rawMonto)) continue;
        const monedaReserva = r.moneda ?? (viajeId ? viajeCurrency.get(viajeId) : undefined) ?? preferredCurrency;
        const converted = convertAmount(rawMonto, monedaReserva, preferredCurrency);
        allItems.push({
          id: `hotel-${r.idReserva ?? r.id}`,
          titulo: r.nombre ?? "Hotel",
          detalle: `Hotel · ${new Date(r.fechaCheckIn).toLocaleDateString("es-ES")}`,
          monto: formatAmount(converted, preferredCurrency),
        });
      }

      // Ordenar por fecha (más recientes primero)
      allItems.sort((a, b) => {
        const fechaA = a.detalle.split("·")[1]?.trim();
        const fechaB = b.detalle.split("·")[1]?.trim();
        if (!fechaA || !fechaB) return 0;
        return new Date(fechaB.split("/").reverse().join("-")).getTime() - new Date(fechaA.split("/").reverse().join("-")).getTime();
      });

      setItems(allItems);
    } catch (e) {
      console.error('Error de red llamando /gastos', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-3 md:p-4">
        {translate('gastosList.loading', 'Cargando gastos…')}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="px-4 py-3 text-sm text-muted-foreground border-b">
        {translate('gastosList.total', 'Total:')} {items.length}
      </div>
      <div className="divide-y">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => router.push(`/gastos/${it.id}`)}
            className="w-full text-left flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex flex-col">
              <span className="font-medium">{it.titulo}</span>
              <span className="text-sm text-gray-500">{it.detalle}</span>
            </div>
            <span className="font-semibold text-[15px] text-[#2e7d32]">
              {it.monto}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
