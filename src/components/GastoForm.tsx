'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { useLocale } from '@/components/locale-provider';
import { getAuthUser } from '@/lib/auth-client';

interface GastoFormProps {
  viajeId: string;
  onGastoAdded?: () => void;
  onCancel?: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida');
}

export default function GastoForm({
  viajeId,
  onGastoAdded,
  onCancel,
}: GastoFormProps) {
  const [loading, setLoading] = useState(false);
  const { translate } = useLocale();
  const authUser = getAuthUser();

  const [formData, setFormData] = useState({
    concepto: '',
    monto: '',
    moneda: 'EUR' as 'EUR' | 'USD' | 'COP' | 'GBP', // solo para UI
    fecha: new Date().toISOString().split('T')[0],
    categoria: '',
    pagadoPor: authUser?.email ?? '', // si quieres dejarlo vacío, pon ''
  });

  const categorias = [
    translate('gastoForm.categories.transporte', 'Transporte'),
    translate('gastoForm.categories.alojamiento', 'Alojamiento'),
    translate('gastoForm.categories.comida', 'Comida'),
    translate('gastoForm.categories.actividades', 'Actividades'),
    translate('gastoForm.categories.compras', 'Compras'),
    translate('gastoForm.categories.otros', 'Otros'),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/gastos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          concepto: formData.concepto,
          categoria: formData.categoria,
          monto: parseFloat(formData.monto),
          fecha: formData.fecha,
          viajeId: parseInt(viajeId, 10),
          usuarioPagadorId: authUser?.id ?? 2, 
          pagadoPor: formData.pagadoPor || authUser?.email || undefined,
        }),
      });

      if (response.ok) {
        // Reset form
        setFormData({
          concepto: '',
          monto: '',
          moneda: 'EUR',
          fecha: new Date().toISOString().split('T')[0],
          categoria: '',
          pagadoPor: authUser?.email ?? '',
        });
        onGastoAdded?.();
      } else {
        console.error('Error creando gasto', await response.text());
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card className="border rounded-2xl shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            {translate('gastoForm.title', 'Agregar nuevo gasto')}
          </h3>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Concepto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {translate('gastoForm.fields.concepto', 'Concepto *')}
              </label>
              <Input
                type="text"
                value={formData.concepto}
                onChange={(e) =>
                  handleInputChange('concepto', e.target.value)
                }
                placeholder={translate(
                  'gastoForm.fields.concepto.placeholder',
                  'Ej: Vuelo Madrid - Barcelona',
                )}
                required
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {translate('gastoForm.fields.categoria', 'Categoría *')}
              </label>
              <select
                value={formData.categoria}
                onChange={(e) =>
                  handleInputChange('categoria', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">
                  {translate(
                    'gastoForm.fields.categoria.placeholder',
                    'Selecciona una categoría',
                  )}
                </option>
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>

            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {translate('gastoForm.fields.monto', 'Monto *')}
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.monto}
                onChange={(e) =>
                  handleInputChange('monto', e.target.value)
                }
                placeholder="0.00"
                required
              />
            </div>

            {/* Moneda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {translate('gastoForm.fields.moneda', 'Moneda')}
              </label>
              <select
                value={formData.moneda}
                onChange={(e) =>
                  handleInputChange('moneda', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="COP">COP ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {translate('gastoForm.fields.fecha', 'Fecha')}
              </label>
              <Input
                type="date"
                value={formData.fecha}
                onChange={(e) =>
                  handleInputChange('fecha', e.target.value)
                }
                required
              />
            </div>

            {/* Email del pagador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {translate(
                  'gastoForm.fields.pagadoPorEmail',
                  'Email de quien pagó',
                )}
              </label>
              <Input
                type="email"
                value={formData.pagadoPor}
                onChange={(e) =>
                  handleInputChange('pagadoPor', e.target.value)
                }
                placeholder="persona@correo.com"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                {translate('gastoForm.cancel', 'Cancelar')}
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {translate('gastoForm.saving', 'Guardando...')}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {translate('gastoForm.add', 'Agregar gasto')}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
