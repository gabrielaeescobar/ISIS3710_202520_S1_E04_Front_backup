// eventos.interfaces.ts
import { z } from "zod";

export const eventoCreateSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  fecha: z.union([z.string(), z.date()]).transform((v) =>
    typeof v === "string" ? new Date(v) : v
  ),
  hora: z.string().optional(),
  descripcion: z.string().optional(),
  grupoId: z.coerce.number().min(1, "Grupo es requerido").nullable(),
  viajeId: z.coerce.number().optional().nullable(),
  ubicacion: z.string().optional(),
  precio: z.coerce.number().min(0, "Precio debe ser positivo").optional().nullable(),
  dificultad: z.enum(["Fácil", "Moderado", "Exigente"]).optional().nullable(),
  notas: z.string().optional(),
});

export type EventoCreate = z.output<typeof eventoCreateSchema>;
export type Evento = EventoCreate & { id: string };

export interface EventoUI {
  id: string;
  nombre: string;
  fecha: string | Date;                           
  hora?: string;
  descripcion?: string;
  grupoId?: number | null;                        
  viajeId?: number | null;
  ubicacion?: string;
  precio?: number | null;
  dificultad?: "Fácil" | "Moderado" | "Exigente" | null;
  notas?: string;
}
