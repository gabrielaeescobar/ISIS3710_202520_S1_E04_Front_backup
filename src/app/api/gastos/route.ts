import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { translateServer, getLocaleFromHeaders } from '@/lib/i18n-server';

function createGastoCreateSchema(locale: 'es' | 'en') {
  return z.object({
    concepto: z.string().min(1, translateServer('validation.gasto.concepto.required', locale)),
    monto: z.coerce.number().positive(translateServer('validation.gasto.monto.positive', locale)),
    moneda: z.enum(["COP", "USD", "EUR", "GBP"]),
    fecha: z.coerce.date(),                
    categoria: z.string().min(1, translateServer('validation.gasto.categoria.required', locale)),
    grupoId: z.coerce.number().int().positive(translateServer('validation.gasto.grupoId.positive', locale)),
    viajeId: z.coerce.number().int().positive(translateServer('validation.gasto.viajeId.positive', locale)).optional(),
    pagadoPor: z.string().min(1, translateServer('validation.gasto.pagadoPor.required', locale)).optional(),
  });
}

type GastoCreate = z.infer<ReturnType<typeof createGastoCreateSchema>>;
type Gasto = GastoCreate & { id: string };

const DB: Gasto[] = [
  { id: "1", concepto: "Vuelos", monto: 1200, moneda: "EUR", fecha: new Date("2025-08-20"), categoria: "Transporte", grupoId: 1, viajeId: 1, pagadoPor: "María" },
  { id: "2", concepto: "Hotel",  monto: 800,  moneda: "EUR", fecha: new Date("2025-08-21"), categoria: "Alojamiento", grupoId: 1, viajeId: 1, pagadoPor: "Gabriela" },
  { id: "3", concepto: "Comidas", monto: 150,  moneda: "EUR", fecha: new Date("2025-08-21"), categoria: "Comida",      grupoId: 2, viajeId: 2, pagadoPor: "Santiago" },
];

export async function GET(req: NextRequest) {
  
  const { searchParams } = new URL(req.url);
  const grupoId = searchParams.get("grupoId");
  const viajeId = searchParams.get("viajeId");
  
  let filteredData = DB;
  
  if (grupoId) {
    filteredData = filteredData.filter(g => String(g.grupoId) === grupoId);
  }
  
  if (viajeId) {
    filteredData = filteredData.filter(g => String(g.viajeId) === viajeId);
  }
  
  return NextResponse.json({ status: true, count: filteredData.length, data: filteredData });
}

export async function POST(request: NextRequest) {
  const locale = getLocaleFromHeaders(request.headers);
  
  try {
    const body = await request.json();
    const gastoCreateSchema = createGastoCreateSchema(locale);
    const parsed = gastoCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { 
          status: false, 
          message: translateServer('errors.gasto.validation', locale),
          error: parsed.error.flatten() 
        },
        { status: 400 }
      );
    }

    const newGasto: Gasto = { id: String(Date.now()), ...parsed.data };
    DB.push(newGasto);
    
    return NextResponse.json({ 
      status: true, 
      message: translateServer('success.gasto.created', locale),
      data: newGasto 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error en POST /api/gastos:', error);
    return NextResponse.json({
      status: false,
      message: translateServer('errors.gasto.create', locale)
    }, { status: 500 });
  }
}

// PATCH /api/gastos?id=123
export async function PATCH(req: NextRequest) {
  const locale = getLocaleFromHeaders(req.headers);
  
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { 
          status: false, 
          message: translateServer('errors.gasto.missingId', locale)
        }, 
        { status: 400 }
      );
    }

    const body = await req.json();
    const gastoCreateSchema = createGastoCreateSchema(locale);
    const parsed = gastoCreateSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { 
          status: false, 
          message: translateServer('errors.gasto.validation', locale),
          error: parsed.error.flatten() 
        },
        { status: 400 }
      );
    }

    const idx = DB.findIndex(g => String(g.id) === String(id));
    
    if (idx === -1) {
      return NextResponse.json(
        { 
          status: false, 
          message: translateServer('errors.gasto.notFound', locale)
        }, 
        { status: 404 }
      );
    }

    // Actualizar gasto con datos validados
    DB[idx] = { ...DB[idx], ...parsed.data };
    
    return NextResponse.json(
      { 
        status: true, 
        message: translateServer('success.gasto.updated', locale),
        data: DB[idx] 
      }, 
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error en PATCH /api/gastos:', error);
    return NextResponse.json({
      status: false,
      message: translateServer('errors.gasto.update', locale)
    }, { status: 500 });
  }
}

// DELETE /api/gastos?id=123
export async function DELETE(req: NextRequest) {
  const locale = getLocaleFromHeaders(req.headers);
  
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { 
          status: false, 
          message: translateServer('errors.gasto.missingId', locale)
        }, 
        { status: 400 }
      );
    }

    const idx = DB.findIndex(g => String(g.id) === String(id));
    
    if (idx === -1) {
      return NextResponse.json(
        { 
          status: false, 
          message: translateServer('errors.gasto.notFound', locale)
        }, 
        { status: 404 }
      );
    }

    const deleted = DB.splice(idx, 1)[0];
    
    return NextResponse.json(
      { 
        status: true, 
        message: translateServer('success.gasto.deleted', locale),
        data: deleted 
      }, 
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error en DELETE /api/gastos:', error);
    return NextResponse.json({
      status: false,
      message: translateServer('errors.gasto.delete', locale)
    }, { status: 500 });
  }
}