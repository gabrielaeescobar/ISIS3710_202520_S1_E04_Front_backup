export interface Usuario {
  id?: string; // opcional
  nombre: string;
  apellido: string;
  usuario: string;
  correo: string;
  pais: string;
  moneda: string; // "COP", "USD", etc.
  fechaNacimiento: {
    dia: number;
    mes: number;
    año: number;
  };
  fotoUrl?: string; // opcional
  contraseña: string
}
