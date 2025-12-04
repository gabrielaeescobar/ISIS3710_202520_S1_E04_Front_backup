'use client';

import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventoCreateSchema, type EventoCreate } from "../model/eventos.interfaces";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocale } from '@/components/locale-provider';

type FormValues = z.input<typeof eventoCreateSchema>;

function toYMD(v?: string | Date): string {
  const d = !v ? new Date() : (typeof v === "string" ? new Date(v) : v);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export function EventoForm({
  defaultValues,
  onSubmit,
  loading,
  submitLabel = "Guardar",
}: {
  defaultValues?: Partial<EventoCreate>;
  onSubmit: (v: EventoCreate) => void;
  loading?: boolean;
  submitLabel?: string;
}) {
  const { translate } = useLocale();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid } 
  } = useForm<FormValues>({
    resolver: zodResolver(eventoCreateSchema),
    defaultValues: {
      nombre: defaultValues?.nombre ?? "",
      fecha: toYMD(defaultValues?.fecha),
      hora: defaultValues?.hora ?? "",
      descripcion: defaultValues?.descripcion ?? "",
      grupoId: defaultValues?.grupoId ?? 1,
      viajeId: defaultValues?.viajeId ?? undefined,
      ubicacion: defaultValues?.ubicacion ?? "",
      precio: defaultValues?.precio ?? undefined,
      dificultad: defaultValues?.dificultad ?? undefined,
      notas: defaultValues?.notas ?? "",
    } as FormValues,
    mode: "onChange" 
  });

  const submit: SubmitHandler<FormValues> = (values) => {
    console.log("Form values:", values); 
    const parsed: EventoCreate = eventoCreateSchema.parse(values);
    onSubmit(parsed);
  };

  return (
    <form id="form-evento" onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
            {translate('eventos.form.fields.nombre', 'Nombre')}
          </label>
          <Input 
            id="nombre"
            {...register("nombre")} 
          />
          {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre.message}</p>}
        </div>

        <div>
          <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
            {translate('eventos.form.fields.fecha', 'Fecha')}
          </label>
          <Input 
            id="fecha"
            type="date" 
            {...register("fecha")} 
          />
          {errors.fecha && (
            <p className="text-xs text-red-600 mt-1">{errors.fecha.message as string}</p>
          )}
        </div>

        <div>
          <label htmlFor="hora" className="block text-sm font-medium text-gray-700">
            {translate('eventos.form.fields.hora', 'Hora')}
          </label>
          <Input 
            id="hora"
            type="time" 
            {...register("hora")} 
          />
        </div>

        <div>
          <label htmlFor="grupoId" className="block text-sm font-medium text-gray-700">
            {translate('eventos.form.fields.grupoId', 'Grupo')}
          </label>
          <Input 
            id="grupoId"
            type="number" 
            {...register("grupoId", { valueAsNumber: true })} 
          />
          {errors.grupoId && <p className="text-xs text-red-600 mt-1">{errors.grupoId.message}</p>}
        </div>

        <div>
          <label htmlFor="viajeId" className="block text-sm font-medium text-gray-700">
            {translate('eventos.form.fields.viajeId', 'Viaje (opcional)')}
          </label>
          <Input 
            id="viajeId"
            type="number" 
            {...register("viajeId", { valueAsNumber: true })} 
            placeholder={translate('eventos.form.fields.viajeId.placeholder', 'ID del viaje')} 
          />
          {errors.viajeId && <p className="text-xs text-red-600 mt-1">{errors.viajeId.message}</p>}
        </div>

        <div>
          <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700">
            {translate('eventos.form.fields.ubicacion', 'Ubicación')}
          </label>
          <Input 
            id="ubicacion"
            {...register("ubicacion")} 
            placeholder={translate('eventos.form.fields.ubicacion.placeholder', 'Ej: Desierto del Sahara')}           
          />
        </div>

        <div>
          <label htmlFor="precio" className="block text-sm font-medium text-gray-700">
            {translate('eventos.form.fields.precio', 'Precio (€)')}
          </label>
          <Input 
            id="precio"
            type="number" 
            step="0.01"
            {...register("precio", { valueAsNumber: true })}
            placeholder={translate('eventos.form.fields.precio.placeholder', '150')}          
          />
          {errors.precio && <p className="text-xs text-red-600 mt-1">{errors.precio.message}</p>}
        </div>

        <div>
          <label htmlFor="dificultad" className="block text-sm font-medium text-gray-700">
            {translate('eventos.form.fields.dificultad', 'Dificultad')}
          </label>
          <select
            id="dificultad"
            {...register("dificultad")}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">
              {translate('eventos.form.fields.dificultad.placeholder', 'Seleccionar dificultad')}
            </option>
            <option value="Fácil">              
              {translate('difficulty.easy', 'Fácil')}
            </option>
            <option value="Moderado">
              {translate('difficulty.moderate', 'Moderado')}
            </option>
            <option value="Exigente">
              {translate('difficulty.hard', 'Exigente')}
            </option>
          </select>
          {errors.dificultad && <p className="text-xs text-red-600 mt-1">{errors.dificultad.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
            {translate('eventos.form.fields.descripcion', 'Descripción')}
          </label>
          <Input 
            id="descripcion"
            {...register("descripcion")} 
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notas" className="block text-sm font-medium text-gray-700">
            {translate('eventos.form.fields.notas', 'Notas')}
          </label>
          <textarea
            id="notas"
            {...register("notas")}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder={translate('eventos.form.fields.notas.placeholder', 'Ej: Llevar protector solar y agua. Incluye desayuno.')}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading || !isValid}
          className="bg-[#d5efb8] text-black hover:bg-[#c3e19e]"
        >
          {loading 
            ? translate('eventos.form.saving', 'Guardando...') 
            : submitLabel
          }
        </Button>
      </div>
    </form>
  );
}