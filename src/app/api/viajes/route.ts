import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { viajeSchema } from "@/app/(main)/viajes/validation/viajeSchema";
import { translateServer, getLocaleFromHeaders } from "@/lib/i18n-server";

// -------------------- Tipos internos de la API --------------------
// Lo que envía/recibe la API según el schema (camelCase)
type ViajePayload = z.infer<typeof viajeSchema>;

// Tipo que usamos dentro de este route (para mocks + memoria)
export interface ApiViaje {
  id: number;
  nombre: string;

  descripcion?: string | null;
  fechaIni: string;
  fechaFin: string;
  imagenViajeUrl?: string | null;
  presupuestoInicial: number;
  monedaBase: "EUR" | "USD" | "COP" | string;

  grupoId?: number | null;

  // Campo extra más "humano"
  destino?: string | null;
}

// -------------------- MOCKS --------------------
const MOCK_VIAJES: ApiViaje[] = [
  {
    id: 1,
    nombre: "Familia Marruecos",
    destino: "Marruecos",
    descripcion:
      "Recorrido por Marrakech, Essaouira y una noche en el desierto del Sahara.",
    fechaIni: "2025-08-20",
    fechaFin: "2025-08-27",
    imagenViajeUrl:
      "https://images.unsplash.com/photo-1527960299979-ae13298358b6?auto=format&fit=crop&q=80&w=1546",
    presupuestoInicial: 1500,
    monedaBase: "USD",
    grupoId: 10,
  },
  {
    id: 2,
    nombre: "Erasmus Londres",
    destino: "Reino Unido",
    descripcion:
      "Visita académica y cultural por Londres, museos y barrios históricos.",
    fechaIni: "2025-09-26",
    fechaFin: "2025-10-08",
    imagenViajeUrl:
      "https://images.unsplash.com/photo-1587726480710-003743795e40?auto=format&fit=crop&q=80&w=939",
    presupuestoInicial: 1800,
    monedaBase: "USD",
    grupoId: null,
  },
  {
    id: 3,
    nombre: "Cartagena en familia",
    destino: "Colombia",
    descripcion:
      "Descanso en el Centro Histórico y playas cercanas. Comida caribeña.",
    fechaIni: "2025-12-29",
    fechaFin: "2026-01-08",
    imagenViajeUrl:
      "https://images.unsplash.com/photo-1707504342190-d8e7e7759cb9?auto=format&fit=crop&q=80&w=1170",
    presupuestoInicial: 4_500_000,
    monedaBase: "COP",
    grupoId: 22,
  },
  {
    id: 4,
    nombre: "Ruta Toscana",
    destino: "Italia",
    descripcion:
      "Florencia, Siena y pueblos medievales. Comida, vino y paisajes.",
    fechaIni: "2026-04-10",
    fechaFin: "2026-04-18",
    imagenViajeUrl:
      "https://images.unsplash.com/photo-1694974247491-ea3f789292ce?auto=format&fit=crop&q=80&w=1170",
    presupuestoInicial: 1000,
    monedaBase: "USD",
    grupoId: 31,
  },
  {
    id: 5,
    nombre: "Nueva York Express",
    destino: "Estados Unidos",
    descripcion:
      "Broadway, Central Park y Museos. Escapada urbana intensa.",
    fechaIni: "2025-11-12",
    fechaFin: "2025-11-18",
    imagenViajeUrl:
      "https://images.unsplash.com/photo-1602087564121-ecda2f6c7ee9?auto=format&fit=crop&q=80&w=2067",
    presupuestoInicial: 1600,
    monedaBase: "USD",
    grupoId: null,
  },
  {
    id: 6,
    nombre: "Tokio y Kioto",
    destino: "Japón",
    descripcion:
      "Tecnología, templos y gastronomía. Contrastes entre tradición y modernidad.",
    fechaIni: "2026-03-20",
    fechaFin: "2026-03-29",
    imagenViajeUrl:
      "https://images.unsplash.com/photo-1581536763020-d2d7cfdd4df6?auto=format&fit=crop&q=80&w=1631",
    presupuestoInicial: 3000,
    monedaBase: "USD",
    grupoId: 15,
  },
];

// Viajes creados/actualizados en memoria durante la ejecución
const EXTRA_VIAJES: ApiViaje[] = [];
let lastId = 7;

function sortedData(): ApiViaje[] {
  return [...MOCK_VIAJES, ...EXTRA_VIAJES];
}

function ensureDates(parsed: ViajePayload, locale: "es" | "en" = "es"): void {
  if (parsed.fechaFin < parsed.fechaIni) {
    throw new Error(translateServer("errors.trip.invalidDates", locale));
  }
}

// Helper: convertir del payload validado (viajeSchema) al formato de la API
function payloadToApi(parsed: ViajePayload, id: number): ApiViaje {
  return {
    id,
    nombre: parsed.nombre,
    descripcion: parsed.descripcion ?? null,
    fechaIni: parsed.fechaIni,
    fechaFin: parsed.fechaFin,
    imagenViajeUrl: parsed.imagenViajeUrl ?? null,
    presupuestoInicial: parsed.presupuestoInicial,
    monedaBase: parsed.monedaBase,
    grupoId: parsed.grupoId ?? null,
    destino: null, // si luego tienes destinoId -> puedes mapearlo a nombre
  };
}

// -------------------- GET: lista de viajes o viaje específico --------------------
export async function GET(request: NextRequest) {
  const locale = getLocaleFromHeaders(request.headers);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const data = sortedData();
    const viaje = data.find((v) => v.id === parseInt(id));

    if (!viaje) {
      return NextResponse.json(
        {
          status: false,
          message: translateServer("errors.trip.notFound", locale),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: true, data: viaje });
  }

  const data = sortedData();
  return NextResponse.json({ status: true, count: data.length, data });
}

// -------------------- POST: crear nuevo viaje --------------------
export async function POST(request: NextRequest) {
  const locale = getLocaleFromHeaders(request.headers);

  try {
    const payload = await request.json();
    const parsed = viajeSchema.parse(payload); // camelCase validado
    ensureDates(parsed, locale);

    const nuevo = payloadToApi(parsed, ++lastId);
    EXTRA_VIAJES.push(nuevo);

    return NextResponse.json({ status: true, data: nuevo }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        {
          status: false,
          message: translateServer("errors.trip.validation", locale),
          errors: err.issues,
        },
        { status: 400 }
      );
    }
    if (err instanceof Error) {
      return NextResponse.json(
        {
          status: false,
          message:
            err.message ?? translateServer("errors.trip.create", locale),
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        status: false,
        message: translateServer("errors.trip.unknown", locale),
      },
      { status: 400 }
    );
  }
}

// -------------------- PUT: actualizar viaje existente --------------------
const updateSchema = viajeSchema.extend({ id: z.number().int().positive() });

export async function PUT(request: NextRequest) {
  const locale = getLocaleFromHeaders(request.headers);

  try {
    const payload = await request.json();
    const parsed = updateSchema.parse(payload); // incluye id
    ensureDates(parsed, locale);

    // Actualizar primero en EXTRA_VIAJES (datos creados en runtime)
    const iExtra = EXTRA_VIAJES.findIndex((v) => v.id === parsed.id);
    if (iExtra !== -1) {
      EXTRA_VIAJES[iExtra] = payloadToApi(parsed, parsed.id);
      return NextResponse.json({
        status: true,
        data: EXTRA_VIAJES[iExtra],
      });
    }

    // Luego en MOCK_VIAJES (si corresponde)
    const iMock = MOCK_VIAJES.findIndex((v) => v.id === parsed.id);
    if (iMock === -1) {
      return NextResponse.json(
        {
          status: false,
          message: translateServer("errors.trip.notFound", locale),
        },
        { status: 404 }
      );
    }

    MOCK_VIAJES[iMock] = payloadToApi(parsed, parsed.id);
    return NextResponse.json({ status: true, data: MOCK_VIAJES[iMock] });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        {
          status: false,
          message: translateServer("errors.trip.validation", locale),
          errors: err.issues,
        },
        { status: 400 }
      );
    }
    if (err instanceof Error) {
      return NextResponse.json(
        {
          status: false,
          message:
            err.message ?? translateServer("errors.trip.update", locale),
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        status: false,
        message: translateServer("errors.trip.unknown", locale),
      },
      { status: 400 }
    );
  }
}

// -------------------- Tipos exportados para el front (si los necesitas) --------------------
export interface ViajeGrupoRef {
  id: number;
  nombre?: string;
}

export interface ViajeDestinoRef {
  idUbicacion: number;
  nombre: string;
  [key: string]: unknown;
}

// Este Viaje es básicamente el mismo que ApiViaje, pero lo dejamos separado
export interface Viaje {
  id: number;
  nombre: string;

  descripcion?: string | null;
  fechaIni: string;
  fechaFin: string;
  imagenViajeUrl?: string | null;
  presupuestoInicial: number;
  monedaBase: "EUR" | "USD" | "COP" | string;

  grupoId?: number | null;
  destino?: string | null;
}
