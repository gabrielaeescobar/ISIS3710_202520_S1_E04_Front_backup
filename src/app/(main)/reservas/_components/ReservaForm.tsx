'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, MapPin, DollarSign, Plane, Hotel, X } from 'lucide-react';
import { useLocale } from '@/components/locale-provider';
import { getAuthUser } from '@/lib/auth-client';
import UbicacionSearch from '@/components/UbicacionSearch';
import type { ReservaHotel, ReservaVuelo, Ubicacion } from '../model/reserva.interfaces';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida');
}

interface ReservaFormProps {
  viajeId: string;
  monedaBase: string; // Moneda base del viaje
  onReservaAdded: () => void;
  onCancel: () => void;
  reservaHotel?: ReservaHotel;
  reservaVuelo?: ReservaVuelo;
  tipo?: 'hotel' | 'vuelo';
}

export default function ReservaForm({ 
  viajeId, 
  monedaBase,
  onReservaAdded, 
  onCancel, 
  reservaHotel,
  reservaVuelo,
  tipo: tipoInicial = 'hotel'
}: ReservaFormProps) {
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState<'hotel' | 'vuelo'>(tipoInicial);
  const { translate } = useLocale();

  // Formulario Hotel
  const [formHotel, setFormHotel] = useState<ReservaHotel>({
    nombre: reservaHotel?.nombre || '',
    fechaCheckIn: reservaHotel?.fechaCheckIn || '',
    fechaCheckOut: reservaHotel?.fechaCheckOut || '',
    monto: reservaHotel?.monto || 0,
    codigoReserva: reservaHotel?.codigoReserva || '',
    estrellas: reservaHotel?.estrellas || undefined,
    viajeId: parseInt(viajeId),
    usuarioPagadorId: reservaHotel?.usuarioPagadorId || 0,
    ubicacionHotelId: reservaHotel?.ubicacionHotelId || 0,
  });

  // Formulario Vuelo
  const [formVuelo, setFormVuelo] = useState<ReservaVuelo>({
    aerolinea: reservaVuelo?.aerolinea || '',
    clase: reservaVuelo?.clase || 'ECONOMY',
    fechaSalida: reservaVuelo?.fechaSalida || '',
    horaSalida: reservaVuelo?.horaSalida || '',
    fechaLlegada: reservaVuelo?.fechaLlegada || '',
    horaLlegada: reservaVuelo?.horaLlegada || '',
    monto: reservaVuelo?.monto || 0,
    codigoReserva: reservaVuelo?.codigoReserva || '',
    viajeId: parseInt(viajeId),
    usuarioPagadorId: reservaVuelo?.usuarioPagadorId || 0,
    origenId: reservaVuelo?.origenId || 0,
    destinoId: reservaVuelo?.destinoId || 0,
  });


  // Obtener usuario actual
  useEffect(() => {
    const user = getAuthUser();
    if (user) {
      setFormHotel(prev => ({ ...prev, usuarioPagadorId: user.id }));
      setFormVuelo(prev => ({ ...prev, usuarioPagadorId: user.id }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = getAuthUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      if (tipo === 'hotel') {
        const url = reservaHotel?.id 
          ? `${API_URL}/reservas-hotel/${reservaHotel.id}`
          : `${API_URL}/reservas-hotel`;
        const method = reservaHotel?.id ? 'PATCH' : 'POST';

        const payload = {
          ...formHotel,
          usuarioPagadorId: user.id,
        };

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
          throw new Error(error.message || 'Error al guardar reserva de hotel');
        }

        onReservaAdded();
      } else {
        const url = reservaVuelo?.id 
          ? `${API_URL}/reservas-vuelo/${reservaVuelo.id}`
          : `${API_URL}/reservas-vuelo`;
        const method = reservaVuelo?.id ? 'PATCH' : 'POST';

        const payload = {
          ...formVuelo,
          usuarioPagadorId: user.id,
        };

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
          throw new Error(error.message || 'Error al guardar reserva de vuelo');
        }

        onReservaAdded();
      }
    } catch (error) {
      console.error('Error al guardar reserva:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar reserva');
    } finally {
      setLoading(false);
    }
  };

  const getMonedaSymbol = (moneda: string) => {
    switch (moneda) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'COP': return '$';
      case 'GBP': return '£';
      default: return moneda;
    }
  };

  return (
    <Card className="border rounded-2xl shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            {reservaHotel?.id || reservaVuelo?.id
              ? translate('reservas.form.editTitle', 'Editar Reserva')
              : translate('reservas.form.newTitle', 'Nueva Reserva')
            }
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant={tipo === 'hotel' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTipo('hotel')}
              className={tipo === 'hotel' ? 'bg-blue-500 hover:bg-blue-600' : ''}
            >
              <Hotel className="w-4 h-4 mr-1" />
              {translate('reservas.form.types.hotel', 'Hotel')}
            </Button>
            <Button
              variant={tipo === 'vuelo' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTipo('vuelo')}
              className={tipo === 'vuelo' ? 'bg-blue-500 hover:bg-blue-600' : ''}
            >
              <Plane className="w-4 h-4 mr-1" />
              {translate('reservas.form.types.vuelo', 'Vuelo')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tipo === 'hotel' ? (
            <>
              {/* Nombre del hotel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {translate('reservas.form.fields.nombre', 'Nombre del Hotel *')}
                </label>
                <Input
                  value={formHotel.nombre}
                  onChange={(e) => setFormHotel(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder={translate('reservas.form.fields.nombre.placeholder', 'Ej: Ibis Budget Paris')}
                  required
                />
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    {translate('reservas.form.fields.checkIn', 'Check-in *')}
                  </label>
                  <Input
                    type="date"
                    value={formHotel.fechaCheckIn}
                    onChange={(e) => setFormHotel(prev => ({ ...prev, fechaCheckIn: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    {translate('reservas.form.fields.checkOut', 'Check-out *')}
                  </label>
                  <Input
                    type="date"
                    value={formHotel.fechaCheckOut}
                    onChange={(e) => setFormHotel(prev => ({ ...prev, fechaCheckOut: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Ubicacion */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  {translate('reservas.form.fields.ubicacion', 'Ubicación del Hotel *')}
                </label>
                <UbicacionSearch
                  value={formHotel.ubicacionHotelId ?? 0}
                  onChange={(id) => setFormHotel(prev => ({ ...prev, ubicacionHotelId: id }))}
                  placeholder={translate('reservas.form.fields.ubicacion.placeholder', 'Buscar o crear ubicación del hotel...')}
                  required
                />
              </div>

              {/* Monto y codigo de reserva */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    {translate('reservas.form.fields.monto', 'Monto')} ({monedaBase})
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formHotel.monto}
                    onChange={(e) => setFormHotel(prev => ({ ...prev, monto: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {translate('reservas.form.fields.codigoReserva', 'Código de Reserva')}
                  </label>
                  <Input
                    value={formHotel.codigoReserva}
                    onChange={(e) => setFormHotel(prev => ({ ...prev, codigoReserva: e.target.value }))}
                    placeholder={translate('reservas.form.fields.codigoReserva.placeholder', 'Ej: ABC123')}
                  />
                </div>
              </div>

              {/* Estrellas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {translate('reservas.form.fields.estrellas', 'Estrellas')}
                </label>
                <select
                  value={formHotel.estrellas || ''}
                  onChange={(e) => setFormHotel(prev => ({ ...prev, estrellas: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{translate('reservas.form.fields.estrellas.unrated', 'Sin calificar')}</option>
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 
                        ? translate('reservas.form.fields.estrellas.singular', 'estrella')
                        : translate('reservas.form.fields.estrellas.plural', 'estrellas')
                      }
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Aerolinea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {translate('reservas.form.fields.aerolinea', 'Aerolínea *')}
                </label>
                <Input
                  value={formVuelo.aerolinea}
                  onChange={(e) => setFormVuelo(prev => ({ ...prev, aerolinea: e.target.value }))}
                  placeholder={translate('reservas.form.fields.aerolinea.placeholder', 'Ej: Air France')}
                  required
                />
              </div>

              {/* Clase */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {translate('reservas.form.fields.clase', 'Clase *')}
                </label>
                <select
                  value={formVuelo.clase}
                  onChange={(e) => setFormVuelo(prev => ({ ...prev, clase: e.target.value as ReservaVuelo['clase'] }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="ECONOMY">{translate('reservas.form.fields.clase.economy', 'Economy')}</option>
                  <option value="PREMIUM_ECONOMY">{translate('reservas.form.fields.clase.premiumEconomy', 'Premium Economy')}</option>
                  <option value="BUSINESS">{translate('reservas.form.fields.clase.business', 'Business')}</option>
                  <option value="FIRST">{translate('reservas.form.fields.clase.first', 'First')}</option>
                </select>
              </div>

              {/* Fechas y horas de salida */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    {translate('reservas.form.fields.fechaSalida', 'Fecha de Salida *')}
                  </label>
                  <Input
                    type="date"
                    value={formVuelo.fechaSalida}
                    onChange={(e) => setFormVuelo(prev => ({ ...prev, fechaSalida: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    {translate('reservas.form.fields.horaSalida', 'Hora de Salida *')}
                  </label>
                  <Input
                    type="time"
                    value={formVuelo.horaSalida}
                    onChange={(e) => setFormVuelo(prev => ({ ...prev, horaSalida: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Fechas y horas de llegada */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    {translate('reservas.form.fields.fechaLlegada', 'Fecha de Llegada *')}
                  </label>
                  <Input
                    type="date"
                    value={formVuelo.fechaLlegada}
                    onChange={(e) => setFormVuelo(prev => ({ ...prev, fechaLlegada: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    {translate('reservas.form.fields.horaLlegada', 'Hora de Llegada *')}
                  </label>
                  <Input
                    type="time"
                    value={formVuelo.horaLlegada}
                    onChange={(e) => setFormVuelo(prev => ({ ...prev, horaLlegada: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Origen y Destino */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    {translate('reservas.form.fields.origen', 'Origen *')}
                  </label>
                  <UbicacionSearch
                    value={formVuelo.origenId ?? 0}
                    onChange={(id) => setFormVuelo(prev => ({ ...prev, origenId: id }))}
                    placeholder={translate('reservas.form.fields.origen.placeholder', 'Buscar o crear ubicación de origen...')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    {translate('reservas.form.fields.destino', 'Destino *')}
                  </label>
                  <UbicacionSearch
                    value={formVuelo.destinoId ?? 0}
                    onChange={(id) => setFormVuelo(prev => ({ ...prev, destinoId: id }))}
                    placeholder={translate('reservas.form.fields.destino.placeholder', 'Buscar o crear ubicación de destino...')}
                    required
                  />
                </div>
              </div>

              {/* Monto y codigo de reserva */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    {translate('reservas.form.fields.monto', 'Monto')} ({monedaBase})
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formVuelo.monto}
                    onChange={(e) => setFormVuelo(prev => ({ ...prev, monto: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {translate('reservas.form.fields.codigoReserva', 'Código de Reserva')}
                  </label>
                  <Input
                    value={formVuelo.codigoReserva}
                    onChange={(e) => setFormVuelo(prev => ({ ...prev, codigoReserva: e.target.value }))}
                    placeholder={translate('reservas.form.fields.codigoReserva.placeholder.vuelo', 'Ej: AF5678')}
                  />
                </div>
              </div>
            </>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              {translate('reservas.form.cancel', 'Cancelar')}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {loading 
                ? translate('reservas.form.saving', 'Guardando...')
                : (reservaHotel?.id || reservaVuelo?.id
                    ? translate('reservas.form.update', 'Actualizar')
                    : translate('reservas.form.create', 'Crear Reserva')
                  )
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
