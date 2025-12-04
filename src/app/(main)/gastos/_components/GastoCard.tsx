'use client';

import { useState } from "react";
import type { Gasto } from "../model/gastosinterface";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/locale-provider";

interface Props {
  gasto: Gasto;
  onChanged?: (g: Gasto) => void;
}

export function GastoCard({ gasto, onChanged }: Props) {
  const [current, setCurrent] = useState<Gasto>(gasto);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { translate } = useLocale();

  const [form, setForm] = useState({
    concepto: current.concepto,
    monto: String(current.monto),
    moneda: current.moneda ?? '',
    fecha: new Date(current.fecha).toISOString().slice(0, 10),
    categoria: current.categoria,
    grupoId: current.grupoId ? String(current.grupoId) : '',
    viajeId: current.viajeId ? String(current.viajeId) : "",
    pagadoPor: current.pagadoPor ?? '',
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gastos?id=${current.idGasto}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concepto: form.concepto,
          monto: Number(form.monto),
          moneda: form.moneda,
          fecha: new Date(form.fecha),
          categoria: form.categoria,
          grupoId: form.grupoId ? Number(form.grupoId) : undefined,
          viajeId: form.viajeId ? Number(form.viajeId) : undefined,
          usuarioPagadorId: current.usuarioPagadorId,
          pagadoPor: form.pagadoPor || undefined, // email del pagador
        }),
      });
      if (!res.ok)
        throw new Error(
          translate(
            'gastoCard.errors.updateFailed',
            'No se pudo actualizar',
          ),
        );
      const json = await res.json();
      const updated: Gasto = json.data;
      setCurrent(updated);
      onChanged?.(updated);
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (
      !confirm(
        translate(
          'gastoCard.deleteConfirm',
          '¿Eliminar este gasto?',
        ),
      )
    )
      return;
    setLoading(true);
    try {
      const res = await fetch(`/api/gastos?id=${current.idGasto}`, {
        method: "DELETE",
      });
      if (!res.ok)
        throw new Error(
          translate(
            'gastoCard.errors.deleteFailed',
            'No se pudo eliminar',
          ),
        );
      window.location.href = "/gastos";
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6 space-y-5">
        {!editing ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold truncate">
                  {current.concepto}
                </h2>
                <p className="text-sm text-gray-500">
                  {current.categoria}
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-base font-semibold text-gray-900">
                  {current.monto} {current.moneda}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(current.fecha).toLocaleDateString("es-ES")}
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              {current.pagadoPor ? (
                <>
                  {translate(
                    'gastoCard.paidBy',
                    'Pagado por (email):',
                  )}{' '}
                  <span className="font-medium text-gray-800">
                    {current.pagadoPor}
                  </span>
                </>
              ) : (
                "—"
              )}
              {current.grupoId && (
                <span className="ml-2">
                  • Grupo: {current.grupoId}
                </span>
              )}
              {current.viajeId && (
                <span className="ml-2">
                  • Viaje: {current.viajeId}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-[#d5efb8] text-black hover:bg-[#c3e19e]"
                onClick={() => setEditing(true)}
              >
                {translate('gastoCard.edit', 'Editar')}
              </Button>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={onDelete}
                disabled={loading}
              >
                {translate('gastoCard.delete', 'Eliminar')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {translate(
                    'gastoCard.fields.concepto',
                    'Concepto',
                  )}
                </label>
                <Input
                  name="concepto"
                  value={form.concepto}
                  onChange={onChange}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {translate(
                    'gastoCard.fields.categoria',
                    'Categoría',
                  )}
                </label>
                <Input
                  name="categoria"
                  value={form.categoria}
                  onChange={onChange}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {translate(
                    'gastoCard.fields.monto',
                    'Monto',
                  )}
                </label>
                <Input
                  name="monto"
                  type="number"
                  step="0.01"
                  value={form.monto}
                  onChange={onChange}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {translate(
                    'gastoCard.fields.moneda',
                    'Moneda',
                  )}
                </label>
                <Input
                  name="moneda"
                  value={form.moneda}
                  onChange={onChange}
                  placeholder="EUR | USD | COP | GBP"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {translate(
                    'gastoCard.fields.fecha',
                    'Fecha',
                  )}
                </label>
                <Input
                  name="fecha"
                  type="date"
                  value={form.fecha}
                  onChange={onChange}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {translate(
                    'gastoCard.fields.grupo',
                    'Grupo',
                  )}
                </label>
                <Input
                  name="grupoId"
                  type="number"
                  value={form.grupoId}
                  onChange={onChange}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {translate(
                    'gastoCard.fields.viaje',
                    'Viaje (opcional)',
                  )}
                </label>
                <Input
                  name="viajeId"
                  type="number"
                  value={form.viajeId}
                  onChange={onChange}
                  placeholder={translate(
                    'gastoCard.fields.viaje.placeholder',
                    'ID del viaje',
                  )}
                  className="mt-1"
                />
              </div>

              {/* Email del pagador */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  {translate(
                    'gastoCard.fields.pagadoPorEmail',
                    'Email de quien paga',
                  )}
                </label>
                <Input
                  name="pagadoPor"
                  type="email"
                  value={form.pagadoPor}
                  onChange={onChange}
                  placeholder="correo@ejemplo.com"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={onSave}
                disabled={loading}
                className="bg-[#d5efb8] text-black hover:bg-[#c3e19e]"
              >
                {loading
                  ? translate('gastoCard.saving', 'Guardando...')
                  : translate('gastoCard.save', 'Guardar')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditing(false)}
                disabled={loading}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                {translate('gastoCard.cancel', 'Cancelar')}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
