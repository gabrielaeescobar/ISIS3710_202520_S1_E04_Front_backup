import { NextRequest, NextResponse } from 'next/server';
import type { Reserva } from '@/app/(main)/reservas/model/reserva.interfaces';
import { translateServer, getLocaleFromHeaders } from '@/lib/i18n-server';


// Base de datos simulada en memoria
const DB_INITIAL: Reserva[] = [
  // Reservas para Viaje 1: Familia Marruecos (creado_por: 101)
  {
    id: 1,
    viaje_id: 1,
    tipo: 'vuelo',
    nombre: 'Vuelo Madrid - Marrakech',
    descripcion: 'Vuelo de ida a Marruecos',
    fecha_inicio: '2025-08-20',
    fecha_fin: '2025-08-20',
    hora_salida: '08:30',
    hora_llegada: '09:45',
    ubicacion_origen: 'Madrid (MAD)',
    ubicacion_destino: 'Marrakech (RAK)',
    numero_reserva: 'IB5678',
    proveedor: 'Iberia',
    precio_total: 320,
    moneda: 'USD',
    estado: 'confirmada',
    notas: 'Check-in online disponible 24h antes. Maleta incluida.',
    creado_por: 101,
    creado_en: '2025-01-15T10:00:00Z',
    actualizado_en: '2025-01-15T10:00:00Z'
  },
  {
    id: 2,
    viaje_id: 1,
    tipo: 'vuelo',
    nombre: 'Vuelo Marrakech - Madrid',
    descripcion: 'Vuelo de regreso',
    fecha_inicio: '2025-08-27',
    fecha_fin: '2025-08-27',
    hora_salida: '16:20',
    hora_llegada: '19:35',
    ubicacion_origen: 'Marrakech (RAK)',
    ubicacion_destino: 'Madrid (MAD)',
    numero_reserva: 'IB5679',
    proveedor: 'Iberia',
    precio_total: 320,
    moneda: 'USD',
    estado: 'confirmada',
    notas: 'Check-in online disponible 24h antes. Maleta incluida.',
    creado_por: 101,
    creado_en: '2025-01-15T10:15:00Z',
    actualizado_en: '2025-01-15T10:15:00Z'
  },
  {
    id: 3,
    viaje_id: 1,
    tipo: 'hotel',
    nombre: 'Riad Dar Kawa',
    descripcion: 'Riad tradicional en la Medina',
    fecha_inicio: '2025-08-20',
    fecha_fin: '2025-08-23',
    hora_salida: '11:00',
    ubicacion_destino: 'Medina, Marrakech',
    numero_reserva: 'DK2025',
    proveedor: 'Booking.com',
    precio_total: 180,
    moneda: 'USD',
    estado: 'confirmada',
    notas: 'Riad tradicional con desayuno incluido. 3 noches.',
    creado_por: 101,
    creado_en: '2025-01-15T10:30:00Z',
    actualizado_en: '2025-01-15T10:30:00Z'
  },
  {
    id: 4,
    viaje_id: 1,
    tipo: 'hotel',
    nombre: 'Campamento del Sahara',
    descripcion: 'Noche en el desierto',
    fecha_inicio: '2025-08-23',
    fecha_fin: '2025-08-24',
    hora_salida: '10:00',
    ubicacion_destino: 'Desierto del Sahara',
    numero_reserva: 'SAH2025',
    proveedor: 'Sahara Desert Tours',
    precio_total: 120,
    moneda: 'USD',
    estado: 'confirmada',
    notas: 'Tienda tradicional con cena y desayuno incluidos.',
    creado_por: 101,
    creado_en: '2025-01-15T11:00:00Z',
    actualizado_en: '2025-01-15T11:00:00Z'
  },
  {
    id: 5,
    viaje_id: 1,
    tipo: 'hotel',
    nombre: 'Hotel Atlas Essaouira',
    descripcion: 'Hotel en la costa atlántica',
    fecha_inicio: '2025-08-24',
    fecha_fin: '2025-08-27',
    hora_salida: '11:00',
    ubicacion_destino: 'Essaouira, Marruecos',
    numero_reserva: 'ATL2025',
    proveedor: 'Hotel Atlas',
    precio_total: 150,
    moneda: 'USD',
    estado: 'confirmada',
    notas: 'Hotel frente al mar con desayuno incluido. 3 noches.',
    creado_por: 101,
    creado_en: '2025-01-15T11:30:00Z',
    actualizado_en: '2025-01-15T11:30:00Z'
  },
  // Reservas para Viaje 2: Erasmus Londres (creado_por: 102)
  {
    id: 6,
    viaje_id: 2,
    tipo: 'vuelo',
    nombre: 'Vuelo Madrid - Londres',
    descripcion: 'Vuelo de ida a Londres',
    fecha_inicio: '2025-09-26',
    fecha_fin: '2025-09-26',
    hora_salida: '07:15',
    hora_llegada: '08:45',
    ubicacion_origen: 'Madrid (MAD)',
    ubicacion_destino: 'Londres (LHR)',
    numero_reserva: 'IB7890',
    proveedor: 'Iberia',
    precio_total: 280,
    moneda: 'USD',
    estado: 'confirmada',
    notas: 'Check-in online disponible 24h antes.',
    creado_por: 102,
    creado_en: '2025-02-01T09:00:00Z',
    actualizado_en: '2025-02-01T09:00:00Z'
  },
  {
    id: 7,
    viaje_id: 2,
    tipo: 'vuelo',
    nombre: 'Vuelo Londres - Madrid',
    descripcion: 'Vuelo de regreso',
    fecha_inicio: '2025-10-08',
    fecha_fin: '2025-10-08',
    hora_salida: '19:30',
    hora_llegada: '23:00',
    ubicacion_origen: 'Londres (LHR)',
    ubicacion_destino: 'Madrid (MAD)',
    numero_reserva: 'IB7891',
    proveedor: 'Iberia',
    precio_total: 280,
    moneda: 'USD',
    estado: 'confirmada',
    notas: 'Check-in online disponible 24h antes.',
    creado_por: 102,
    creado_en: '2025-02-01T09:15:00Z',
    actualizado_en: '2025-02-01T09:15:00Z'
  },
  {
    id: 8,
    viaje_id: 2,
    tipo: 'hotel',
    nombre: 'Hotel Russell Square',
    descripcion: 'Hotel en el centro de Londres',
    fecha_inicio: '2025-09-26',
    fecha_fin: '2025-10-08',
    hora_salida: '11:00',
    ubicacion_destino: 'Russell Square, Londres',
    numero_reserva: 'RS2025',
    proveedor: 'Booking.com',
    precio_total: 840,
    moneda: 'USD',
    estado: 'confirmada',
    notas: 'Hotel céntrico con desayuno incluido. 12 noches.',
    creado_por: 102,
    creado_en: '2025-02-01T10:00:00Z',
    actualizado_en: '2025-02-01T10:00:00Z'
  },
  // Reservas para Viaje 3: Cartagena en familia (creado_por: 101)
  {
    id: 9,
    viaje_id: 3,
    tipo: 'vuelo',
    nombre: 'Vuelo Madrid - Cartagena',
    descripcion: 'Vuelo de ida a Cartagena',
    fecha_inicio: '2025-12-29',
    fecha_fin: '2025-12-29',
    hora_salida: '14:20',
    hora_llegada: '18:45',
    ubicacion_origen: 'Madrid (MAD)',
    ubicacion_destino: 'Cartagena (CTG)',
    numero_reserva: 'IB8901',
    proveedor: 'Iberia',
    precio_total: 450,
    moneda: 'USD',
    estado: 'confirmada',
    notas: 'Check-in online disponible 24h antes.',
    creado_por: 101,
    creado_en: '2025-03-15T11:00:00Z',
    actualizado_en: '2025-03-15T11:00:00Z'
  },
  {
    id: 10,
    viaje_id: 3,
    tipo: 'vuelo',
    nombre: 'Vuelo Cartagena - Madrid',
    descripcion: 'Vuelo de regreso',
    fecha_inicio: '2026-01-08',
    fecha_fin: '2026-01-08',
    hora_salida: '20:15',
    hora_llegada: '09:30+1',
    ubicacion_origen: 'Cartagena (CTG)',
    ubicacion_destino: 'Madrid (MAD)',
    numero_reserva: 'IB8902',
    proveedor: 'Iberia',
    precio_total: 450,
    moneda: 'USD',
    estado: 'confirmada',
    notas: 'Vuelo nocturno con llegada al día siguiente.',
    creado_por: 101,
    creado_en: '2025-03-15T11:15:00Z',
    actualizado_en: '2025-03-15T11:15:00Z'
  },
  {
    id: 11,
    viaje_id: 3,
    tipo: 'hotel',
    nombre: 'Hotel Santa Clara',
    descripcion: 'Hotel boutique en el centro histórico',
    fecha_inicio: '2025-12-29',
    fecha_fin: '2026-01-08',
    hora_salida: '11:00',
    ubicacion_destino: 'Centro Histórico, Cartagena',
    numero_reserva: 'SC2025',
    proveedor: 'Hotel Santa Clara',
    precio_total: 1200000,
    moneda: 'COP',
    estado: 'confirmada',
    notas: 'Hotel de lujo con spa incluido. 10 noches.',
    creado_por: 101,
    creado_en: '2025-03-15T12:00:00Z',
    actualizado_en: '2025-03-15T12:00:00Z'
  },
  // Reservas para Viaje 4: Ruta Toscana (creado_por: 103)
  {
    id: 12,
    viaje_id: 4,
    tipo: 'vuelo',
    nombre: 'Vuelo Madrid - Florencia',
    descripcion: 'Vuelo de ida a Florencia',
    fecha_inicio: '2026-04-10',
    fecha_fin: '2026-04-10',
    hora_salida: '06:45',
    hora_llegada: '09:15',
    ubicacion_origen: 'Madrid (MAD)',
    ubicacion_destino: 'Florencia (FLR)',
    numero_reserva: 'IB9012',
    proveedor: 'Iberia',
    precio_total: 180,
    moneda: 'USD',
    estado: 'confirmada',
    notas: 'Vuelo directo a Florencia.',
    creado_por: 103,
    creado_en: '2025-04-01T08:00:00Z',
    actualizado_en: '2025-04-01T08:00:00Z'
  },
  {
    id: 13,
    viaje_id: 4,
    tipo: 'vuelo',
    nombre: 'Vuelo Florencia - Madrid',
    descripcion: 'Vuelo de regreso',
    fecha_inicio: '2026-04-18',
    fecha_fin: '2026-04-18',
    hora_salida: '21:30',
    hora_llegada: '23:45',
    ubicacion_origen: 'Florencia (FLR)',
    ubicacion_destino: 'Madrid (MAD)',
    numero_reserva: 'IB9013',
    proveedor: 'Iberia',
    precio_total: 180,
    moneda: 'USD',
    estado: 'confirmada',
    notas: 'Vuelo nocturno de regreso.',
    creado_por: 103,
    creado_en: '2025-04-01T08:15:00Z',
    actualizado_en: '2025-04-01T08:15:00Z'
  },
  {
    id: 14,
    viaje_id: 4,
    tipo: 'hotel',
    nombre: 'Hotel Brunelleschi',
    descripcion: 'Hotel histórico en el centro de Florencia',
    fecha_inicio: '2026-04-10',
    fecha_fin: '2026-04-18',
    hora_salida: '11:00',
    ubicacion_destino: 'Centro de Florencia',
    numero_reserva: 'BR2026',
    proveedor: 'Hotel Brunelleschi',
    precio_total: 640,
    moneda: 'USD',
    estado: 'confirmada',
    notas: 'Hotel de 4 estrellas con desayuno incluido. 8 noches.',
    creado_por: 103,
    creado_en: '2025-04-01T09:00:00Z',
    actualizado_en: '2025-04-01T09:00:00Z'
  },
  // Reservas para Viaje 5: Nueva York Express (creado_por: 104)
  {
    id: 15,
    viaje_id: 5,
    tipo: 'vuelo',
    nombre: 'Vuelo Madrid - Nueva York',
    descripcion: 'Vuelo de ida a Nueva York',
    fecha_inicio: '2025-11-12',
    fecha_fin: '2025-11-12',
    hora_salida: '13:30',
    hora_llegada: '16:45',
    ubicacion_origen: 'Madrid (MAD)',
    ubicacion_destino: 'Nueva York (JFK)',
    numero_reserva: 'IB0123',
    proveedor: 'Iberia',
    precio_total: 420,
    moneda: 'USD',
    estado: 'confirmada',
    notas: 'Vuelo directo a JFK.',
    creado_por: 104,
    creado_en: '2025-05-10T10:00:00Z',
    actualizado_en: '2025-05-10T10:00:00Z'
  },
  {
    id: 16,
    viaje_id: 5,
    tipo: 'vuelo',
    nombre: 'Vuelo Nueva York - Madrid',
    descripcion: 'Vuelo de regreso',
    fecha_inicio: '2025-11-18',
    fecha_fin: '2025-11-18',
    hora_salida: '23:55',
    hora_llegada: '12:30+1',
    ubicacion_origen: 'Nueva York (JFK)',
    ubicacion_destino: 'Madrid (MAD)',
    numero_reserva: 'IB0124',
    proveedor: 'Iberia',
    precio_total: 420,
    moneda: 'USD',
    estado: 'confirmada',
    notas: 'Vuelo nocturno con llegada al día siguiente.',
    creado_por: 104,
    creado_en: '2025-05-10T10:15:00Z',
    actualizado_en: '2025-05-10T10:15:00Z'
  },
  {
    id: 17,
    viaje_id: 5,
    tipo: 'hotel',
    nombre: 'Hotel Times Square',
    descripcion: 'Hotel en el corazón de Manhattan',
    fecha_inicio: '2025-11-12',
    fecha_fin: '2025-11-18',
    hora_salida: '11:00',
    ubicacion_destino: 'Times Square, Nueva York',
    numero_reserva: 'TS2025',
    proveedor: 'Booking.com',
    precio_total: 480,
    moneda: 'USD',
    estado: 'confirmada',
    notas: 'Hotel céntrico sin desayuno. 6 noches.',
    creado_por: 104,
    creado_en: '2025-05-10T11:00:00Z',
    actualizado_en: '2025-05-10T11:00:00Z'
  },
  // Reservas para Viaje 6: Tokio y Kioto (creado_por: 101)
  {
    id: 18,
    viaje_id: 6,
    tipo: 'vuelo',
    nombre: 'Vuelo Madrid - Tokio',
    descripcion: 'Vuelo de ida a Tokio',
    fecha_inicio: '2026-03-20',
    fecha_fin: '2026-03-21',
    hora_salida: '12:45',
    hora_llegada: '08:30+1',
    ubicacion_origen: 'Madrid (MAD)',
    ubicacion_destino: 'Tokio (NRT)',
    numero_reserva: 'IB1234',
    proveedor: 'Iberia',
    precio_total: 680,
    moneda: 'USD',
    estado: 'confirmada',
    notas: 'Vuelo directo con llegada al día siguiente.',
    creado_por: 101,
    creado_en: '2025-06-01T12:00:00Z',
    actualizado_en: '2025-06-01T12:00:00Z'
  },
  {
    id: 19,
    viaje_id: 6,
    tipo: 'vuelo',
    nombre: 'Vuelo Tokio - Madrid',
    descripcion: 'Vuelo de regreso',
    fecha_inicio: '2026-03-29',
    fecha_fin: '2026-03-30',
    hora_salida: '11:25',
    hora_llegada: '17:15+1',
    ubicacion_origen: 'Tokio (NRT)',
    ubicacion_destino: 'Madrid (MAD)',
    numero_reserva: 'IB1235',
    proveedor: 'Iberia',
    precio_total: 680,
    moneda: 'USD',
    estado: 'confirmada',
    notas: 'Vuelo directo con llegada al día siguiente.',
    creado_por: 101,
    creado_en: '2025-06-01T12:15:00Z',
    actualizado_en: '2025-06-01T12:15:00Z'
  },
  {
    id: 20,
    viaje_id: 6,
    tipo: 'hotel',
    nombre: 'Hotel Park Hyatt Tokyo',
    descripcion: 'Hotel de lujo en Shinjuku',
    fecha_inicio: '2026-03-21',
    fecha_fin: '2026-03-29',
    hora_salida: '11:00',
    ubicacion_destino: 'Shinjuku, Tokio',
    numero_reserva: 'PHT2026',
    proveedor: 'Park Hyatt',
    precio_total: 2400,
    moneda: 'USD',
    estado: 'confirmada',
    notas: 'Hotel de 5 estrellas con desayuno incluido. 8 noches.',
    creado_por: 101,
    creado_en: '2025-06-01T13:00:00Z',
    actualizado_en: '2025-06-01T13:00:00Z'
  }
];

// Array mutable para operaciones
const DB = [...DB_INITIAL];

// GET: lista de reservas o reserva específica
export async function GET(request: NextRequest) {
  const locale = getLocaleFromHeaders(request.headers);
  
  try {
    const { searchParams } = new URL(request.url);
    const viajeId = searchParams.get('viajeId');
    const reservaId = searchParams.get('id');

    if (reservaId) {
      // Obtener reserva específica
      const reserva = DB.find(r => r.id === parseInt(reservaId));

      if (!reserva) {
        return NextResponse.json({
          status: false,
          message: translateServer('errors.reserva.notFound', locale)
        }, { status: 404 });
      }

      return NextResponse.json({
        status: true,
        data: reserva
      });
    }

    if (viajeId) {
      // Obtener reservas de un viaje específico
      const reservas = DB.filter(r => r.viaje_id === parseInt(viajeId))
                         .sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime());

      return NextResponse.json({
        status: true,
        data: reservas
      });
    }

    // Obtener todas las reservas
    const reservas = DB.sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime());

    return NextResponse.json({
      status: true,
      data: reservas
    });

  } catch (error) {
    console.error('Error en GET /api/reservas:', error);
    return NextResponse.json({
      status: false,
      message: translateServer('errors.generic', locale)
    }, { status: 500 });
  }
}

// POST: crear nueva reserva
export async function POST(request: NextRequest) {
  const locale = getLocaleFromHeaders(request.headers);
  
  try {
    const body = await request.json();
    const {
      viaje_id,
      tipo,
      nombre,
      descripcion,
      fecha_inicio,
      fecha_fin,
      hora_salida,
      hora_llegada,
      ubicacion_origen,
      ubicacion_destino,
      numero_reserva,
      proveedor,
      precio_total,
      moneda,
      estado,
      notas,
      creado_por
    } = body;

    // Validaciones básicas
    if (!viaje_id || !tipo || !nombre || !fecha_inicio || !estado) {
      return NextResponse.json({
        status: false,
        message: translateServer('errors.reserva.missingFields', locale)
      }, { status: 400 });
    }

    // Generar nuevo ID
    const newId = Math.max(...DB.map(r => r.id), 0) + 1;
    const now = new Date().toISOString();

    const nuevaReserva: Reserva = {
      id: newId,
      viaje_id,
      tipo,
      nombre,
      descripcion,
      fecha_inicio,
      fecha_fin,
      hora_salida,
      hora_llegada,
      ubicacion_origen,
      ubicacion_destino,
      numero_reserva,
      proveedor,
      precio_total,
      moneda: moneda || 'EUR',
      estado,
      notas,
      creado_por: creado_por || 1,
      creado_en: now,
      actualizado_en: now
    };

    DB.push(nuevaReserva);

    return NextResponse.json({
      status: true,
      data: nuevaReserva,
      message: translateServer('success.reserva.created', locale)
    });

  } catch (error) {
    console.error('Error en POST /api/reservas:', error);
    return NextResponse.json({
      status: false,
      message: translateServer('errors.generic', locale)
    }, { status: 500 });
  }
}

// PUT: actualizar reserva
export async function PUT(request: NextRequest) {
  const locale = getLocaleFromHeaders(request.headers);
  
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({
        status: false,
        message: translateServer('errors.reserva.missingId', locale)
      }, { status: 400 });
    }

    const reservaIndex = DB.findIndex(r => r.id === id);
    
    if (reservaIndex === -1) {
      return NextResponse.json({
        status: false,
        message: translateServer('errors.reserva.notFound', locale)
      }, { status: 404 });
    }

    // Actualizar reserva
    DB[reservaIndex] = {
      ...DB[reservaIndex],
      ...updateData,
      actualizado_en: new Date().toISOString()
    };

    return NextResponse.json({
      status: true,
      data: DB[reservaIndex],
      message: translateServer('success.reserva.updated', locale)
    });

  } catch (error) {
    console.error('Error en PUT /api/reservas:', error);
    return NextResponse.json({
      status: false,
      message: translateServer('errors.generic', locale)
    }, { status: 500 });
  }
}

// DELETE: eliminar reserva
export async function DELETE(request: NextRequest) {
  const locale = getLocaleFromHeaders(request.headers);
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        status: false,
        message: translateServer('errors.reserva.missingId', locale)
      }, { status: 400 });
    }

    const reservaIndex = DB.findIndex(r => r.id === parseInt(id));
    
    if (reservaIndex === -1) {
      return NextResponse.json({
        status: false,
        message: translateServer('errors.reserva.notFound', locale)
      }, { status: 404 });
    }

    DB.splice(reservaIndex, 1);

    return NextResponse.json({
      status: true,
      message: translateServer('success.reserva.deleted', locale)
    });

  } catch (error) {
    console.error('Error en DELETE /api/reservas:', error);
    return NextResponse.json({
      status: false,
      message: translateServer('errors.generic', locale)
    }, { status: 500 });
  }
}