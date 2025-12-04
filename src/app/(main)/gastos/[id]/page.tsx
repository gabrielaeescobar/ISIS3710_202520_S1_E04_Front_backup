"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Gasto } from "../model/gastosinterface";
import { mapApiGastoArray } from "../model/gastosinterface";
import { GastoCard } from "../_components/GastoCard";
import { useLocale } from "@/components/locale-provider";

export default function GastoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const [gasto, setGasto] = useState<Gasto | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const { translate } = useLocale();

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await fetch(`/api/gastos?id=${id}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(
            translate(
              "gastoDetalle.errors.loadFailed",
              "No se pudo cargar el gasto"
            )
          );
        }

        // Mapear la respuesta genérica a Gasto[]
        const json: { data: unknown[] } = await res.json();
        const gastos = mapApiGastoArray(json.data);

        // Buscar el gasto por idGasto (no por id)
        const data =
          gastos.find((g) => String(g.idGasto) === String(id)) ?? null;

        setGasto(data);
      } catch (e) {
        const errorMessage =
          e instanceof Error
            ? e.message
            : translate(
                "gastoDetalle.errors.unexpected",
                "Error inesperado"
              );
        setErr(errorMessage);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, translate]);

  if (loading)
    return (
      <div className="p-6">
        <div className="page-title-row mb-4 gap-3 items-center">
          <div className="w-7 h-7 rounded-md bg-gray-200 animate-pulse" />
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );

  if (err)
    return (
      <div className="p-6 space-y-4">
        <Header />
        <p className="text-red-600">
          {translate("gastoDetalle.error", "Error:")} {err}
        </p>
      </div>
    );

  if (!gasto)
    return (
      <div className="p-6 space-y-4">
        <Header />
        <p className="text-red-600">
          {translate("gastoDetalle.notFound", "Gasto no encontrado")}
        </p>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <Header />
      <div className="w-full">
        <GastoCard gasto={gasto} onChanged={setGasto} />
      </div>
    </div>
  );
}

function Header() {
  const { translate } = useLocale();
  return (
    <div className="page-title-row mb-2 gap-3 items-center">
      <Image
        src="/logo_blanco.png"
        alt="Layover"
        width={28}
        height={28}
        className="page-title-icon"
        priority
      />
      <h1 className="page-title text-2xl font-semibold text-gray-900">
        {translate("gastoDetalle.title", "Detalle del gasto")}
      </h1>
      <div className="ml-auto">
        <Link
          href="/gastos"
          className="inline-flex items-center rounded-md bg-[#d5efb8] px-4 py-2 text-sm font-medium text-black hover:bg-[#c3e19e] transition-colors"
        >
          {translate("gastoDetalle.backButton", "← Volver")}
        </Link>
      </div>
    </div>
  );
}
