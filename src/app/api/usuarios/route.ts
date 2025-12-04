import { Usuario } from "@/app/(main)/usuarios/model/usuario.interfaces";
import { NextRequest, NextResponse } from "next/server";

const defaultFoto = "/userDefault.png";

const mockUsuarios: Usuario[] = [
  {
    nombre: "Gabriela",
    apellido: "Escobar",
    usuario: "g.escobar23",
    correo: "g.escobar23@correo.com",
    pais: "Colombia",
    moneda: "COP",
    fechaNacimiento: {
      dia: 4,
      mes: 10,
      año: 2004,
    },
    fotoUrl: defaultFoto,
    contraseña: "Layover1234*"
  },
  {
    nombre: "Mariana",
    apellido: "Escobar",
    usuario: "m.escobar",
    correo: "m.escobar@correo.com",
    pais: "Colombia",
    moneda: "COP",
    fechaNacimiento: {
      dia: 8,
      mes: 9,
      año: 2002,
    },
    fotoUrl: defaultFoto,
    contraseña: "Layover1234*"

  },
  {
    nombre: "Jairo",
    apellido: "Escobar",
    usuario: "j.escobar",
    correo: "j.escobar@correo.com",
    pais: "Colombia",
    moneda: "COP",
    fechaNacimiento: {
      dia: 10,
      mes: 8,
      año: 1974,
    },
    fotoUrl: defaultFoto,
    contraseña: "Layover1234*"

  },
  {
    nombre: "Claudia",
    apellido: "Rojas",
    usuario: "c.rojas",
    correo: "c.rojas@correo.com",
    pais: "Colombia",
    moneda: "COP",
    fechaNacimiento: {
      dia: 29,
      mes: 3,
      año: 1975,
    },
    fotoUrl: defaultFoto,
    contraseña: "Layover1234*"

  },
  {
    nombre: "María Paula",
    apellido: "Gómez",
    usuario: "mp.gomez",
    correo: "mp.gomez@correo.com",
    pais: "México",
    moneda: "USD",
    fechaNacimiento: {
      dia: 25,
      mes: 2,
      año: 2002,
    },
    fotoUrl: defaultFoto,
    contraseña: "Layover1234*"

  },
  {
    nombre: "Felipe",
    apellido: "Rojas",
    usuario: "f.rojas",
    correo: "f.rojas@correo.com",
    pais: "Argentina",
    moneda: "EUR",
    fechaNacimiento: {
      dia: 19,
      mes: 11,
      año: 2001,
    },
    fotoUrl: defaultFoto,
    contraseña: "Layover1234*"

  },
  {
    nombre: "Pablo",
    apellido: "Mesa",
    usuario: "p.mesa",
    correo: "p.mesa@correo.com",
    pais: "Colombia",
    moneda: "COP",
    fechaNacimiento: {
      dia: 12,
      mes: 5,
      año: 2003,
    },
    fotoUrl: defaultFoto,
    contraseña: "Layover1234*"
  
  },
];

export async function GET() {
  return NextResponse.json({
    status: true,
    count: mockUsuarios.length,
    data: mockUsuarios,
  });
}

export async function POST(request: NextRequest) {
  const user = await request.json();
  const newUser = { ...user, id: Math.random(), fotoUrl: defaultFoto };
  return NextResponse.json({ status: true, data: newUser });
}
