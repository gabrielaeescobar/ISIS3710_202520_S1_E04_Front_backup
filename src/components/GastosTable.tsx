'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, DollarSign, Calendar, User } from 'lucide-react';
import type { Gasto } from '@/app/(main)/gastos/model/gastosinterface';
import { mapApiGastoArray } from '@/app/(main)/gastos/model/gastosinterface';
import GastoForm from './GastoForm';
import { useLocale } from '@/components/locale-provider';

interface GastosTableProps {
  viajeId: string;
  monedaBase: string; // Moneda base del viaje
  presupuestoInicial?: number | string; // Presupuesto inicial del viaje
  className?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida');
}

// Tipo para representar un gasto unificado 
type GastoUnificado = 
  | (Gasto & { tipo: 'gasto' })
  | {
      idGasto: string;
      concepto: string;
      categoria: string;
      monto: number;
      fecha: string;
      moneda: string;
      viajeId: number;
      usuarioPagadorId: number;
      grupoId: number | null;
      pagadoPor?: string;
      tipo: 'actividad';
    };

export default function GastosTable({
  viajeId,
  monedaBase,
  presupuestoInicial,
  className = '',
}: GastosTableProps) {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [actividades, setActividades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const { translate } = useLocale();

  // carga inicial
  useEffect(() => {
    if (!viajeId) return;
    loadGastos();
  }, [viajeId]);

  const loadGastos = async () => {
    try {
      const [gastosRes, actividadesRes] = await Promise.all([
        fetch(`${API_URL}/gastos/viaje/${viajeId}`, {
          cache: 'no-store',
        }),
        fetch(`${API_URL}/actividades/viaje/${viajeId}`, {
        cache: 'no-store',
        }),
      ]);

      let gastosData: Gasto[] = [];
      let actividadesData: any[] = [];

      if (gastosRes.ok) {
        const json = await gastosRes.json();
        gastosData = mapApiGastoArray(json);
        setGastos(gastosData);
      } else {
        console.error('Error al llamar /gastos/viaje', await gastosRes.text());
      }

      if (actividadesRes.ok) {
        actividadesData = await actividadesRes.json();
        setActividades(Array.isArray(actividadesData) ? actividadesData : []);
      } else {
        console.error('Error al llamar /actividades/viaje', await actividadesRes.text());
      }

      // Calcular total en moneda base del viaje
      const totalGastos = gastosData
        .filter(g => g.moneda === monedaBase)
        .reduce((sum, g) => sum + g.monto, 0);
      
      const totalActividades = actividadesData
        .filter((a: any) => {
          // Las actividades usan la moneda base del viaje
          return a.precioTotal && (typeof a.precioTotal === 'number' ? a.precioTotal : parseFloat(a.precioTotal));
        })
        .reduce((sum: number, a: any) => {
          const precio = typeof a.precioTotal === 'number' ? a.precioTotal : parseFloat(a.precioTotal || '0');
          return sum + precio;
        }, 0);

      setTotal(totalGastos + totalActividades);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGastoAdded = () => {
    loadGastos();
    setShowForm(false);
  };

  const getCategoriaColor = (categoria: string) => {
    const colors: { [key: string]: string } = {
      Comida: 'bg-orange-100 text-orange-800',
      Compras: 'bg-pink-100 text-pink-800',
      'Transporte local': 'bg-blue-100 text-blue-800',
      'Impuestos y tasas': 'bg-red-100 text-red-800',
      'Seguro de viaje': 'bg-purple-100 text-purple-800',
      Otros: 'bg-gray-100 text-gray-800',
    };

    return colors[categoria] || 'bg-gray-100 text-gray-800';
  };

  const getMonedaSymbol = (moneda: string | undefined) => {
    const symbols: { [key: string]: string } = {
      EUR: '€',
      USD: '$',
      COP: '$',
      GBP: '£',
    };
    return moneda ? symbols[moneda] ?? moneda : '';
  };

  const formatMonto = (monto: number, moneda?: string) => {
    const monedaUsar = moneda || monedaBase;
    return `${getMonedaSymbol(monedaUsar)} ${monto.toLocaleString()}`;
  };

  const gastosUnificados: GastoUnificado[] = [
    ...gastos.map(g => ({ ...g, tipo: 'gasto' as const })),
    ...actividades
      .filter((a: any) => a.precioTotal)
      .map((a: any) => {
        const precio = typeof a.precioTotal === 'number' ? a.precioTotal : parseFloat(a.precioTotal || '0');
        return {
          idGasto: `actividad-${a.idActividad}`,
          concepto: a.nombre,
          categoria: 'Actividad',
          monto: precio,
          fecha: a.fecha,
          moneda: monedaBase,
          viajeId: a.viajeId,
          usuarioPagadorId: a.usuarioPagadorId,
          grupoId: null,
          pagadoPor: a.usuarioPagador?.nombre || a.usuarioPagador?.email,
          tipo: 'actividad' as const,
        };
      }),
  ].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  if (loading) {
    return (
      <Card className={`border rounded-2xl shadow-sm ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
            {translate('gastos.loading', 'Cargando gastos...')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border rounded-2xl shadow-sm ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            {translate('gastos.title', 'Gastos del viaje')}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {gastosUnificados.length} {translate('gastos.items', 'gastos')}
            </span>
            <Button
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => setShowForm(!showForm)}
            >
              <Plus className="w-4 h-4 mr-2" />
              {showForm
                ? translate('gastos.cancel', 'Cancelar')
                : translate('gastos.add', '+ Agregar gasto')}
            </Button>
          </div>
        </div>

        {/* Formulario para agregar gastos */}
        {showForm && (
          <div className="mb-6">
            <GastoForm
              viajeId={viajeId}
              onGastoAdded={handleGastoAdded}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {gastosUnificados.length > 0 ? (
          <>
            {/* Tabla de gastos */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-medium text-gray-700">
                      {translate('gastos.table.headers.gasto', 'Gasto')}
                    </th>
                    <th className="text-left py-4 px-4 font-medium text-gray-700">
                      {translate('gastos.table.headers.tipo', 'Tipo')}
                    </th>
                    <th className="text-left py-4 px-4 font-medium text-gray-700">
                      {translate(
                        'gastos.table.headers.categoria',
                        'Categoría',
                      )}
                    </th>
                    <th className="text-left py-4 px-4 font-medium text-gray-700">
                      {translate('gastos.table.headers.fecha', 'Fecha')}
                    </th>
                    <th className="text-right py-4 px-4 font-medium text-gray-700">
                      {translate('gastos.table.headers.valor', 'Valor')}
                    </th>
                    <th className="text-center py-4 px-4 font-medium text-gray-700">
                      {translate(
                        'gastos.table.headers.acciones',
                        'Acciones',
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {gastosUnificados.map((gasto) => {
                    // Formatear fecha sin problemas de zona horaria
                    const formatDate = (dateString: string) => {
                      if (dateString && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        const [year, month, day] = dateString.split('-').map(Number);
                        const date = new Date(year, month - 1, day);
                        return date.toLocaleDateString('es-ES');
                      }
                      return new Date(dateString).toLocaleDateString('es-ES');
                    };

                    return (
                    <tr
                      key={gasto.idGasto}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-6 bg-gray-300 rounded-full flex-shrink-0" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {gasto.concepto}
                            </div>
                            {gasto.pagadoPor && (
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <User className="w-3 h-3" />
                                {translate(
                                  'gastos.paidBy',
                                  'Pagado por',
                                )}{' '}
                                {gasto.pagadoPor}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant="outline"
                          className="text-xs bg-gray-50 text-gray-700 border-gray-200"
                        >
                            {gasto.tipo === 'actividad' 
                              ? translate('gastos.type.activity', 'Actividad')
                              : translate('gastos.type.trip', 'Gasto')
                            }
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          className={`text-xs ${getCategoriaColor(
                            gasto.categoria,
                          )}`}
                        >
                          {gasto.categoria}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                            {formatDate(gasto.fecha)}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-semibold text-gray-900">
                          {formatMonto(gasto.monto, gasto.moneda)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                            {gasto.tipo === 'actividad' ? (
                              <Link href={`/calendario/${gasto.idGasto.replace('actividad-', '')}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4 text-blue-500" />
                          </Button>
                              </Link>
                            ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                                className="h-8 w-8 p-0 hover:bg-blue-50"
                          >
                                <Edit className="w-4 h-4 text-blue-500" />
                          </Button>
                            )}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Resumen por categorias */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-4">
                {translate(
                  'gastos.summaryByCategory',
                  'Resumen por categorías',
                )}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {Object.entries(
                  gastosUnificados
                    .filter(g => g.moneda === monedaBase)
                    .reduce(
                    (acc: { [key: string]: number }, gasto) => {
                      acc[gasto.categoria] =
                          (acc[gasto.categoria] || 0) + gasto.monto;
                      return acc;
                    },
                    {},
                  ),
                ).map(([categoria, monto]) => (
                  <div
                    key={categoria}
                    className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Badge
                      className={`text-xs mb-3 ${getCategoriaColor(
                        categoria,
                      )}`}
                    >
                      {categoria}
                    </Badge>
                    <div className="text-lg font-semibold text-gray-900">
                      {getMonedaSymbol(monedaBase)}{' '}
                      {monto.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fila de total y presupuesto */}
            <div className="pt-6 border-t border-gray-200 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-green-500" />
                  <span className="font-semibold text-gray-900 text-lg">
                    {translate(
                      'gastos.total.title',
                      'Total del viaje',
                    )}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    {getMonedaSymbol(monedaBase)}{' '}
                    {total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-sm text-gray-500">
                    {monedaBase}
                  </div>
                </div>
              </div>
              
              {/* Presupuesto restante */}
              {presupuestoInicial !== undefined && presupuestoInicial !== null && (
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-700">
                      {translate(
                        'gastos.budget.remaining',
                        'Presupuesto restante',
                      )}
                    </span>
                  </div>
                  <div className="text-right">
                    {(() => {
                      const presupuesto = typeof presupuestoInicial === 'string' 
                        ? parseFloat(presupuestoInicial) 
                        : presupuestoInicial;
                      const restante = presupuesto - total;
                      const isNegative = restante < 0;
                      
                      return (
                        <>
                          <div className={`text-2xl font-bold ${isNegative ? 'text-red-600' : 'text-blue-600'}`}>
                            {getMonedaSymbol(monedaBase)}{' '}
                            {Math.abs(restante).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {translate(
                              'gastos.budget.initial',
                              'Presupuesto inicial',
                            )}: {getMonedaSymbol(monedaBase)}{' '}
                            {presupuesto.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                            {isNegative && (
                              <span className="text-red-600 ml-2">
                                ({translate('gastos.budget.over', 'Excedido')})
                              </span>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">
              {translate(
                'gastos.empty.title',
                'No hay gastos registrados',
              )}
            </p>
            <p className="text-sm mt-2">
              {translate(
                'gastos.empty.subtitle',
                'Agrega gastos para llevar un control de los costos del viaje',
              )}
            </p>
            <Button
              className="mt-4 bg-green-500 hover:bg-green-600 text-white"
              onClick={() => setShowForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              {translate(
                'gastos.empty.addFirst',
                'Agregar primer gasto',
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
