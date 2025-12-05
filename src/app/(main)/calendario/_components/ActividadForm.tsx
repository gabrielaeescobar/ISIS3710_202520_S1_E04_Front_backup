'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocale } from '@/components/locale-provider';
import { getAuthUser } from '@/lib/auth-client';
import UbicacionSearch from '@/components/UbicacionSearch';
import type { Actividad, ActividadCreate, UbicacionRef } from '../model/actividades.interfaces';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida');
}

// Schema
const actividadSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  horInicio: z.string().regex(/^\d{2}:\d{2}$/, "Hora de inicio inválida (formato HH:mm)"),
  horFin: z.string().regex(/^\d{2}:\d{2}$/, "Hora de fin inválida (formato HH:mm)"),
  precioPorPersona: z.coerce.number().min(0).optional().nullable(),
  numeroPersonas: z.coerce.number().int().min(1).optional().nullable(),
  intensidad: z.enum(["BAJA", "MEDIA", "ALTA"]).optional().nullable(),
  descripcion: z.string().optional().nullable(),
  viajeId: z.coerce.number().int().positive(),
  usuarioPagadorId: z.coerce.number().int().positive(),
  ubicacionId: z.coerce.number().int().positive(),
});

type ActividadFormValues = z.input<typeof actividadSchema>;

interface ActividadFormProps {
  viajeId: number;
  monedaBase: string;
  /**
   * Tamaño del grupo asociado al viaje
   */
  grupoSize?: number;
  defaultValues?: Partial<Actividad>;
  onSubmit: (values: ActividadCreate) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  submitLabel?: string;
}

export function ActividadForm({
  viajeId: viajeIdProp,
  monedaBase,
  grupoSize,
  defaultValues,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = "Guardar",
}: ActividadFormProps) {
  const { translate } = useLocale();
  const user = getAuthUser();
  
  // Asegurar que viajeId sea siempre un número válido
  // Prioridad: viajeIdProp > defaultValues.viajeId
  const viajeIdFinal = (() => {
    // Prioridad 1: viajeIdProp (el que se pasa como prop)
    if (viajeIdProp && typeof viajeIdProp === 'number' && viajeIdProp > 0 && !isNaN(viajeIdProp)) {
      return viajeIdProp;
    }
    // Prioridad 2: defaultValues.viajeId
    if (defaultValues?.viajeId) {
      const num = Number(defaultValues.viajeId);
      if (!isNaN(num) && num > 0) {
        return num;
      }
    }
    // Si no hay ninguno válido, retornar 0 (pero esto debería ser un error)
    return 0;
  })();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
  } = useForm<ActividadFormValues>({
    resolver: zodResolver(actividadSchema),
    defaultValues: {
      nombre: defaultValues?.nombre || "",
      fecha: defaultValues?.fecha || "",
      horInicio: defaultValues?.horInicio 
        ? (typeof defaultValues.horInicio === 'string' 
            ? defaultValues.horInicio.split(':').slice(0, 2).join(':') 
            : "")
        : "",
      horFin: defaultValues?.horFin 
        ? (typeof defaultValues.horFin === 'string' 
            ? defaultValues.horFin.split(':').slice(0, 2).join(':') 
            : "")
        : "",
      precioPorPersona: defaultValues?.precioPorPersona 
        ? (typeof defaultValues.precioPorPersona === 'string' 
            ? parseFloat(defaultValues.precioPorPersona) 
            : defaultValues.precioPorPersona)
        : undefined,
      // Si se está editando una actividad existente y NO hay grupoSize, intentar inferir 
      // el número de personas a partir de precioTotal / precioPorPersona.
      // Si hay grupoSize, no inferir numeroPersonas (se usará grupoSize para calcular precioTotal).
      numeroPersonas:
        !grupoSize && defaultValues?.precioTotal && defaultValues?.precioPorPersona
        ? Math.round(
              (typeof defaultValues.precioTotal === 'string'
                ? parseFloat(defaultValues.precioTotal)
                : defaultValues.precioTotal) /
              (typeof defaultValues.precioPorPersona === 'string'
                ? parseFloat(defaultValues.precioPorPersona)
                : defaultValues.precioPorPersona),
          )
        : undefined,
      intensidad: defaultValues?.intensidad || undefined,
      descripcion: defaultValues?.descripcion || "",
      viajeId: (() => {
        // Prioridad: viajeIdFinal > defaultValues.viajeId
        if (viajeIdFinal > 0 && !isNaN(viajeIdFinal)) return viajeIdFinal;
        if (defaultValues?.viajeId) {
          const num = Number(defaultValues.viajeId);
          if (!isNaN(num) && num > 0) return num;
        }
        // Si no hay ninguno válido, retornar el viajeIdProp directamente (puede ser undefined pero no 0)
        return viajeIdProp || (defaultValues?.viajeId ? Number(defaultValues.viajeId) : 1);
      })(),
      usuarioPagadorId: defaultValues?.usuarioPagadorId ? Number(defaultValues.usuarioPagadorId) : (user?.id ? Number(user.id) : 0),
      ubicacionId: defaultValues?.ubicacionId ? Number(defaultValues.ubicacionId) : 0,
    },
    mode: "onChange",
  });

  // Establecer usuarioPagadorId solo una vez cuando se carga el usuario
  useEffect(() => {
    if (user && typeof user.id === 'number') {
      setValue('usuarioPagadorId', user.id);
    }
  }, [user?.id, setValue]);

  const submit: SubmitHandler<ActividadFormValues> = async (values) => {
    // Validar ubicacionId
    const ubicacionIdNum = typeof values.ubicacionId === 'number' ? values.ubicacionId : Number(values.ubicacionId);
    if (!ubicacionIdNum || ubicacionIdNum <= 0 || isNaN(ubicacionIdNum)) {
      alert(translate('eventos.form.errors.ubicacionRequired', 'Debes seleccionar una ubicación'));
      return;
    }

    // Validar viajeId
    const viajeIdNum = typeof values.viajeId === 'number' ? values.viajeId : Number(values.viajeId);
    if (!viajeIdNum || viajeIdNum <= 0 || isNaN(viajeIdNum)) {
      alert('Error: El viaje no es válido');
      return;
    }

    // Calcular precio Total
    let precioTotal: number | undefined = undefined;
    const participantes: number | undefined =
      typeof values.numeroPersonas === 'number' && values.numeroPersonas > 0
        ? values.numeroPersonas
        : (grupoSize && grupoSize > 0 ? grupoSize : undefined);

    if (values.precioPorPersona && participantes) {
      const precioPorPersonaNum = typeof values.precioPorPersona === 'number' 
        ? values.precioPorPersona 
        : Number(values.precioPorPersona);
      precioTotal = precioPorPersonaNum * participantes;
    }

    const parsed: ActividadCreate = {
      nombre: values.nombre,
      fecha: values.fecha,
      horInicio: values.horInicio,
      horFin: values.horFin,
      precioPorPersona: values.precioPorPersona ? (typeof values.precioPorPersona === 'number' ? values.precioPorPersona : Number(values.precioPorPersona)) : undefined,
      precioTotal,
      intensidad: values.intensidad || undefined,
      descripcion: values.descripcion || undefined,
      viajeId: viajeIdNum,
      usuarioPagadorId: typeof values.usuarioPagadorId === 'number' ? values.usuarioPagadorId : Number(values.usuarioPagadorId),
      ubicacionId: ubicacionIdNum,
    };
    
    await onSubmit(parsed);
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

  // Calcular ubicacionId usando watch de forma controlada
  const ubicacionIdValue = watch('ubicacionId') as number | undefined;


  const handleFormSubmit = handleSubmit(
    (data) => {
      submit(data);
    },
    (errors) => {
      const errorMessages = Object.entries(errors).map(([key, value]) => {
        return `${key}: ${value?.message || 'Error'}`;
      });
      alert('Errores de validación:\n' + errorMessages.join('\n'));
    }
  );

  return (
    <form id="form-actividad" onSubmit={handleFormSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
            {translate('eventos.form.fields.nombre', 'Nombre')} *
          </label>
          <Input 
            id="nombre"
            {...register("nombre")} 
          />
          {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre.message}</p>}
        </div>

        <div>
          <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
            {translate('eventos.form.fields.fecha', 'Fecha')} *
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
          <label htmlFor="horInicio" className="block text-sm font-medium text-gray-700">
            {translate('eventos.form.fields.horaInicio', 'Hora de Inicio')} *
          </label>
          <Input 
            id="horInicio"
            type="time" 
            {...register("horInicio")} 
          />
          {errors.horInicio && (
            <p className="text-xs text-red-600 mt-1">{errors.horInicio.message as string}</p>
          )}
        </div>

        <div>
          <label htmlFor="horFin" className="block text-sm font-medium text-gray-700">
            {translate('eventos.form.fields.horaFin', 'Hora de Fin')} *
          </label>
          <Input 
            id="horFin"
            type="time" 
            {...register("horFin")} 
          />
          {errors.horFin && (
            <p className="text-xs text-red-600 mt-1">{errors.horFin.message as string}</p>
          )}
        </div>

        <div>
          <label htmlFor="ubicacionId" className="block text-sm font-medium text-gray-700 mb-2">
            {translate('eventos.form.fields.ubicacion', 'Ubicación')} *
          </label>
          <UbicacionSearch
            value={ubicacionIdValue || 0}
            onChange={(id) => setValue('ubicacionId', id, { shouldValidate: true })}
            placeholder={translate('eventos.form.fields.ubicacion.placeholder', 'Buscar o crear ubicación...')}
            required
          />
          {errors.ubicacionId && (
            <p className="text-xs text-red-600 mt-1">{errors.ubicacionId.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {translate('eventos.form.fields.ubicacion.help', 'Escribe para buscar. Si no existe, se creará automáticamente.')}
          </p>
        </div>

        <div>
          <label htmlFor="precioPorPersona" className="block text-sm font-medium text-gray-700">
            {translate('eventos.form.fields.precioPorPersona', 'Precio por Persona')} {monedaBase ? `(${monedaBase})` : ''}
          </label>
          <Input 
            id="precioPorPersona"
            type="number" 
            step="0.01"
            {...register("precioPorPersona", { valueAsNumber: true })}
            placeholder={translate('eventos.form.fields.precioPorPersona.placeholder', '0.00')}
          />
          {errors.precioPorPersona && (
            <p className="text-xs text-red-600 mt-1">{errors.precioPorPersona.message}</p>
          )}
        </div>

        {!grupoSize || grupoSize <= 0 ? (
        <div>
          <label htmlFor="numeroPersonas" className="block text-sm font-medium text-gray-700">
            {translate('eventos.form.fields.numeroPersonas', 'Número de Personas')}
          </label>
          <Input 
            id="numeroPersonas"
            type="number" 
            min="1"
            step="1"
            {...register("numeroPersonas", { valueAsNumber: true })}
            placeholder={translate('eventos.form.fields.numeroPersonas.placeholder', '1')}
          />
          {errors.numeroPersonas && (
            <p className="text-xs text-red-600 mt-1">{errors.numeroPersonas.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {translate('eventos.form.fields.numeroPersonas.help', 'El precio total se calculará automáticamente')}
          </p>
        </div>
        ) : null}

        {/* El grupoSize se usa internamente para calcular precioTotal, pero no se muestra al usuario */}

        <div>
          <label htmlFor="intensidad" className="block text-sm font-medium text-gray-700">
            {translate('eventos.form.fields.dificultad', 'Intensidad')}
          </label>
          <select
            id="intensidad"
            {...register("intensidad")}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">
              {translate('eventos.form.fields.dificultad.placeholder', 'Seleccionar intensidad')}
            </option>
            <option value="BAJA">
              {translate('difficulty.easy', 'Baja')}
            </option>
            <option value="MEDIA">
              {translate('difficulty.moderate', 'Media')}
            </option>
            <option value="ALTA">
              {translate('difficulty.hard', 'Alta')}
            </option>
          </select>
          {errors.intensidad && (
            <p className="text-xs text-red-600 mt-1">{errors.intensidad.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
            {translate('eventos.form.fields.descripcion', 'Descripción')}
          </label>
          <textarea
            id="descripcion"
            {...register("descripcion")}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder={translate('eventos.form.fields.descripcion.placeholder', 'Descripción de la actividad')}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            {translate('eventos.form.cancel', 'Cancelar')}
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
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


