import { NextRequest, NextResponse } from "next/server";
import { eventoCreateSchema } from "@/app/(main)/calendario/model/eventos.interfaces";
import type { Evento } from "@/app/(main)/calendario/model/eventos.interfaces";

let DB: Evento[] = [
  // Eventos para Viaje 1: Familia Marruecos (grupo_id: 10, creado_por: 101)
  {
    id: "1",
    nombre: "Visita a la Plaza Jemaa el-Fnaa",
    fecha: new Date("2025-08-20"),
    hora: "16:00",
    descripcion: "Explorar el corazón de Marrakech",
    grupoId: 10,
    viajeId: 1,
    ubicacion: "Plaza Jemaa el-Fnaa, Marrakech",
    precio: 0,
    dificultad: "Fácil",
    notas: "Mejor momento al atardecer. Cuidado con los vendedores.",
  },
  {
    id: "2",
    nombre: "Tour por los Zocos de Marrakech",
    fecha: new Date("2025-08-21"),
    hora: "10:00",
    descripcion: "Recorrido por los mercados tradicionales",
    grupoId: 10,
    viajeId: 1,
    ubicacion: "Zocos de Marrakech, Medina",
    precio: 25,
    dificultad: "Fácil",
    notas: "Incluye guía local. Duración: 3 horas.",
  },
  {
    id: "3",
    nombre: "Paseo en Camello",
    fecha: new Date("2025-08-22"),
    hora: "08:00",
    descripcion: "Recorrido por el desierto",
    grupoId: 10,
    viajeId: 1,
    ubicacion: "Desierto del Sahara",
    precio: 150,
    dificultad: "Exigente",
    notas: "Llevar protector solar y agua. Incluye desayuno.",
  },
  {
    id: "4",
    nombre: "Sandboarding en las dunas",
    fecha: new Date("2025-08-22"),
    hora: "14:00",
    descripcion: "Actividad de aventura en las dunas",
    grupoId: 10,
    viajeId: 1,
    ubicacion: "Desierto del Sahara",
    precio: 80,
    dificultad: "Moderado",
    notas: "Llevar protector solar y agua. Zapatillas cerradas. Bálsamo labial.",
  },
  {
    id: "5",
    nombre: "Visita al Palacio Bahía",
    fecha: new Date("2025-08-21"),
    hora: "14:00",
    descripcion: "Recorrido por el palacio histórico",
    grupoId: 10,
    viajeId: 1,
    ubicacion: "Palacio Bahía, Marrakech",
    precio: 20,
    dificultad: "Fácil",
    notas: "Incluye audioguía. Duración: 2 horas.",
  },
  {
    id: "6",
    nombre: "Visita a Essaouira",
    fecha: new Date("2025-08-25"),
    hora: "10:00",
    descripcion: "Excursión a la ciudad costera",
    grupoId: 10,
    viajeId: 1,
    ubicacion: "Essaouira, Marruecos",
    precio: 60,
    dificultad: "Fácil",
    notas: "Transporte incluido. Tiempo libre para explorar.",
  },
  // Eventos para Viaje 2: Erasmus Londres (sin grupo, creado_por: 102)
  {
    id: "7",
    nombre: "Visita al British Museum",
    fecha: new Date("2025-09-27"),
    hora: "10:00",
    descripcion: "Recorrido por las colecciones del museo",
    grupoId: null,
    viajeId: 2,
    ubicacion: "British Museum, Londres",
    precio: 0,
    dificultad: "Fácil",
    notas: "Entrada gratuita. Duración: 4 horas.",
  },
  {
    id: "8",
    nombre: "Paseo por Hyde Park",
    fecha: new Date("2025-09-28"),
    hora: "14:00",
    descripcion: "Relajación en el parque más famoso de Londres",
    grupoId: null,
    viajeId: 2,
    ubicacion: "Hyde Park, Londres",
    precio: 0,
    dificultad: "Fácil",
    notas: "Perfecto para hacer picnic y fotos.",
  },
  {
    id: "9",
    nombre: "Tour por Camden Market",
    fecha: new Date("2025-09-30"),
    hora: "11:00",
    descripcion: "Explorar el mercado alternativo más famoso",
    grupoId: null,
    viajeId: 2,
    ubicacion: "Camden Market, Londres",
    precio: 15,
    dificultad: "Fácil",
    notas: "Mucha comida callejera y souvenirs únicos.",
  },
  // Eventos para Viaje 3: Cartagena en familia (grupo_id: 22, creado_por: 101)
  {
    id: "10",
    nombre: "Tour por el Centro Histórico",
    fecha: new Date("2025-12-30"),
    hora: "09:00",
    descripcion: "Recorrido por la ciudad amurallada",
    grupoId: 22,
    viajeId: 3,
    ubicacion: "Centro Histórico, Cartagena",
    precio: 50000,
    dificultad: "Fácil",
    notas: "Incluye guía. Duración: 3 horas.",
  },
  {
    id: "11",
    nombre: "Playa de Bocagrande",
    fecha: new Date("2026-01-02"),
    hora: "08:00",
    descripcion: "Día de playa en la zona turística",
    grupoId: 22,
    viajeId: 3,
    ubicacion: "Bocagrande, Cartagena",
    precio: 0,
    dificultad: "Fácil",
    notas: "Llevar protector solar y agua.",
  },
  // Eventos para Viaje 4: Ruta Toscana (grupo_id: 31, creado_por: 103)
  {
    id: "12",
    nombre: "Visita a la Catedral de Florencia",
    fecha: new Date("2026-04-11"),
    hora: "10:00",
    descripcion: "Recorrido por el Duomo y la cúpula de Brunelleschi",
    grupoId: 31,
    viajeId: 4,
    ubicacion: "Duomo, Florencia",
    precio: 25,
    dificultad: "Moderado",
    notas: "Subir a la cúpula requiere reserva previa.",
  },
  {
    id: "13",
    nombre: "Degustación de vinos en Chianti",
    fecha: new Date("2026-04-13"),
    hora: "15:00",
    descripcion: "Tour por bodegas tradicionales",
    grupoId: 31,
    viajeId: 4,
    ubicacion: "Región de Chianti, Toscana",
    precio: 80,
    dificultad: "Fácil",
    notas: "Incluye transporte y degustación de 5 vinos.",
  },
  // Eventos para Viaje 5: Nueva York Express (sin grupo, creado_por: 104)
  {
    id: "14",
    nombre: "Musical en Broadway",
    fecha: new Date("2025-11-13"),
    hora: "20:00",
    descripcion: "Espectáculo en el distrito teatral",
    grupoId: null,
    viajeId: 5,
    ubicacion: "Broadway, Nueva York",
    precio: 120,
    dificultad: "Fácil",
    notas: "Entradas reservadas con anticipación.",
  },
  {
    id: "15",
    nombre: "Central Park en bicicleta",
    fecha: new Date("2025-11-15"),
    hora: "10:00",
    descripcion: "Recorrido por el parque más famoso de NYC",
    grupoId: null,
    viajeId: 5,
    ubicacion: "Central Park, Nueva York",
    precio: 35,
    dificultad: "Fácil",
    notas: "Alquiler de bicicleta incluido por 3 horas.",
  },
  // Eventos para Viaje 6: Tokio y Kioto (grupo_id: 15, creado_por: 101)
  {
    id: "16",
    nombre: "Templo Senso-ji",
    fecha: new Date("2026-03-21"),
    hora: "09:00",
    descripcion: "Visita al templo budista más antiguo de Tokio",
    grupoId: 15,
    viajeId: 6,
    ubicacion: "Asakusa, Tokio",
    precio: 0,
    dificultad: "Fácil",
    notas: "Entrada gratuita. Mejor horario temprano.",
  },
  {
    id: "17",
    nombre: "Templo Kiyomizu-dera",
    fecha: new Date("2026-03-25"),
    hora: "08:00",
    descripcion: "Recorrido por el templo de la madera pura",
    grupoId: 15,
    viajeId: 6,
    ubicacion: "Kioto, Japón",
    precio: 400,
    dificultad: "Moderado",
    notas: "Entrada al templo. Vista panorámica de Kioto.",
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const viajeId = searchParams.get("viajeId");
  const grupoId = searchParams.get("grupoId");
  
  if (id) {
    const evento = DB.find((e) => String(e.id) === id) ?? null;
    return NextResponse.json({ status: true, data: evento });
  }
  
  let filteredData = DB;
  
  if (viajeId) {
    filteredData = filteredData.filter(e => String(e.viajeId) === viajeId);
  }
  
  if (grupoId) {
    filteredData = filteredData.filter(e => String(e.grupoId) === grupoId);
  }
  
  return NextResponse.json({ status: true, data: filteredData });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = eventoCreateSchema.parse(body);
  const nuevo = { id: crypto.randomUUID(), ...parsed };
  DB.push(nuevo);
  return NextResponse.json({ status: true, data: nuevo }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id)
    return NextResponse.json({ status: false, error: "Error id" }, { status: 400 });

  const idx = DB.findIndex((e) => String(e.id) === id);
  if (idx === -1)
    return NextResponse.json({ status: false, error: "Error" }, { status: 404 });

  const body = await req.json();
  const parsed = eventoCreateSchema.partial().parse(body);
  DB[idx] = { ...DB[idx], ...parsed };
  return NextResponse.json({ status: true, data: DB[idx] });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id)
    return NextResponse.json({ status: false, error: "Error id" }, { status: 400 });

  DB = DB.filter((e) => String(e.id) !== id);
  return NextResponse.json({ status: true });
}
