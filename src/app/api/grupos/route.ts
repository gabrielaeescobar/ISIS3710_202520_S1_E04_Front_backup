import { Grupo } from "@/app/(main)/grupos/model/group.interfaces";
import { NextRequest, NextResponse } from "next/server";

const mockGrupos: Grupo[] = 

[]
//     id: 1,
//     nombre: "Familia",
//     descripcion:
//       "Grupo familiar de los Escobar para coordinar viajes, gastos y eventos.",
//     imagenGrupoUrl:
//       "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1200&auto=format&fit=crop",
//     integrantes: ["g.escobar23", "m.escobar", "j.escobar", "c.rojas"],
//     viajes: [],
//   },
//   {
//     id: 2,
//     nombre: "Erasmus",
//     descripcion:
//       "Amigos del intercambio: organización de vuelos, hospedaje y planes.",
//     imagenGrupoUrl:
//       "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop",
//     integrantes: ["g.escobar23", "mp.gomez", "f.rojas", "p.mesa"],
//     viajes: [],
//   },
//   {
//     id: 3,
//     nombre: "Amigas",
//     descripcion:
//       "Chat de amigas para planear salidas, cumpleaños y viajes cortos.",
//     imagenGrupoUrl: "/grupoDefault.png",
//     integrantes: ["g.escobar23", "m.escobar", "mp.gomez"],
//     viajes: [],
//   },
// ];

// const EXTRA_GRUPOS: Grupo[] = [];
// let lastId = Math.max(...mockGrupos.map((g) => g.id), 0);

// function sorted(): Grupo[] {
//   return [...mockGrupos, ...EXTRA_GRUPOS];
// }

// export async function GET(request: NextRequest) {
//   const { searchParams } = new URL(request.url);
//   const onlyExtra = searchParams.get("extra") === "true";

//   const grupos = onlyExtra ? EXTRA_GRUPOS : sorted();
//   return NextResponse.json({ status: true, count: grupos.length, data: grupos });
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();

//     const nombre = String(body?.nombre ?? "").trim();
//     const descripcion = String(body?.descripcion ?? "").trim();
//     let foto = String(body?.foto ?? "").trim();

//     if (!foto || foto === "https://default.com") {
//       foto = "/grupoDefault.png";
//     }

//     const rawIntegrantes: unknown[] = Array.isArray(body?.integrantes)
//       ? body.integrantes
//       : [];
//     const integrantes: string[] = Array.from(
//       new Set(
//         rawIntegrantes
//           .map((u) => (typeof u === "string" ? u : String(u)))
//           .map((s) => s.trim())
//           .filter((s): s is string => s.length > 0)
//       )
//     );

//     if (!nombre) {
//       return NextResponse.json(
//         { status: false, message: "Error" },
//         { status: 400 }
//       );
//     }

//     const nuevo: Grupo = {
//       id: ++lastId, nombre, descripcion, imagenGrupoUrl: foto, integrantes,
//       viajes: []
//     };
//     EXTRA_GRUPOS.push(nuevo);
//     return NextResponse.json({ status: true, data: nuevo }, { status: 201 });
//   } catch {
//     return NextResponse.json(
//       { status: false, message: "Error" },
//       { status: 400 }
//     );
//   }

