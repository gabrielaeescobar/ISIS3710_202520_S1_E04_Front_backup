'use client';

import Link from "next/link";
import { z } from "zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale } from "@/components/locale-provider";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida');
}

export default function NuevoGrupoPage() {
  const { translate } = useLocale();

  const schema = z.object({
    nombre: z
      .string()
      .min(3, translate('groups.errors.nombre.min', 'Mínimo 3 caracteres')),
    descripcion: z
      .string()
      .min(5, translate('groups.errors.descripcion.min', 'Mínimo 5 caracteres')),
    foto: z
      .string()
      .optional()
      .transform((v) => v ?? "")
      .refine(
        (v) => v === "" || /^https?:\/\/.+/i.test(v),
        translate('groups.errors.foto.url', 'Debe ser una URL válida o dejarse vacío')
      ),
    integrantes: z.string().optional().transform((v) => v ?? ""),
  });

  type FormFields = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nombre: "", descripcion: "", foto: "", integrantes: "" },
  });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    const integrantesEmails = (data.integrantes || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      imagenGrupoUrl: data.foto || "https://default.com/grupoDefault.png",
      integrantesEmails: integrantesEmails.length > 0 ? integrantesEmails : undefined,
    };

    try {
      const res = await fetch(`${API_URL}/grupo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        console.error("Error creando grupo:", res.status, msg);
        alert(translate('groups.create.error', 'Error creando el grupo (revisa los emails)'));
        return;
      }

      const nuevoGrupo = await res.json();

      alert(translate('groups.create.success', '✅ Grupo creado con éxito'));
      reset();
      window.location.href = "/grupos";
    } catch (e) {
      console.error(e);
      alert(translate('groups.connection.error', 'Error de conexión con el servidor'));
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-gray-600">
          <Link href="/grupos" className="hover:underline">
            {translate('groups.nav', 'Grupos')}
          </Link>{" "}
          <span>›</span>{" "}
          <span className="font-medium">
            {translate('groups.new', 'Nuevo')}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border rounded-full px-4 py-2">
            <input
              className="outline-none text-sm w-56"
              placeholder={translate(
                'groups.search.placeholder',
                'Buscar en mis grupos'
              )}
            />
            <span className="text-lg">🔍</span>
          </div>
        </div>
      </div>
      <div className="mt-4 h-[1px] w-full bg-gray-200" />

      <div className="flex">
        <main className="flex-1 p-6 md:p-8">
          <div className="mt-6 flex items-center gap-2">
            <span className="text-2xl">🧭</span>
            <h1 className="text-2xl font-semibold">
              {translate('groups.form.title', 'Nuevo Grupo')}
            </h1>
          </div>

          <section className="mt-6 bg-blue-50 border border-blue-100 rounded-3xl p-5 md:p-6 max-w-4xl">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              {/* Nombre */}
              <div className="grid gap-1">
                <input
                  placeholder={translate(
                    'groups.form.name.placeholder',
                    'Nombre grupo'
                  )}
                  className="w-full rounded-full border px-4 py-2.5 shadow-sm"
                  {...register("nombre")}
                />
                {errors.nombre && (
                  <span className="text-xs text-red-600">
                    {errors.nombre.message}
                  </span>
                )}
              </div>

              {/* Descripción */}
              <div className="grid gap-1">
                <input
                  placeholder={translate(
                    'groups.form.description.placeholder',
                    'Descripción'
                  )}
                  className="w-full rounded-full border px-4 py-2.5 shadow-sm"
                  {...register("descripcion")}
                />
                {errors.descripcion && (
                  <span className="text-xs text-red-600">
                    {errors.descripcion.message}
                  </span>
                )}
              </div>

              {/* Foto / imagenGrupoUrl */}
              <div className="grid gap-1">
                <div className="relative">
                  <input
                    placeholder={translate(
                      'groups.form.photo.placeholder',
                      'Imagen (URL) o deja vacío para usar la imagen por defecto'
                    )}
                    className="w-full rounded-full border px-4 py-2.5 shadow-sm pr-10"
                    {...register("foto")}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    ⤴︎
                  </span>
                </div>
                {errors.foto && (
                  <span className="text-xs text-red-600">
                    {errors.foto.message}
                  </span>
                )}
              </div>

              {/* Integrantes (emails) */}
              <div className="grid gap-1">
                <input
                  placeholder={translate(
                    'groups.form.members.placeholder',
                    'Integrantes (emails separados por coma, ej: gaby@correo.com, otro@uniandes.edu.co)'
                  )}
                  className="w-full rounded-full border px-4 py-2.5 shadow-sm"
                  {...register("integrantes")}
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mx-auto block rounded-xl px-6 py-3 bg-lime-200 hover:bg-lime-300 transition text-lg text-slate-800 font-semibold disabled:opacity-60"
                >
                  {isSubmitting
                    ? translate('groups.form.creating', 'Creando…')
                    : translate('groups.form.create', 'Crear grupo')}
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
