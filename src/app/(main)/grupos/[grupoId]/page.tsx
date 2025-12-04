'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Grupo, Usuario } from '../model/group.interfaces';
import { useLocale } from '@/components/locale-provider';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida');
}

export default function GrupoDetailPage() {
  const { grupoId } = useParams<{ grupoId: string }>();
  const router = useRouter();
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);

  const { translate } = useLocale();

  useEffect(() => {
    if (!grupoId) return;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/grupo/${grupoId}`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          setError(
            translate('groups.loadError', 'Error al cargar el grupo.')
          );
          setLoading(false);
          return;
        }

        const json: Grupo = await res.json();
        setGrupo(json);
      } catch {
        setError(translate('groups.loadError', 'Error al cargar el grupo.'));
      } finally {
        setLoading(false);
      }
    })();
  }, [grupoId, translate]);

  const handleDelete = async () => {
    if (!grupo) return;
    if (!confirm(`¿Eliminar el grupo "${grupo.nombre}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/grupo/${grupo.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert(translate('groups.delete.success', 'Grupo eliminado'));
        router.push('/grupos');
      } else {
        alert(translate('groups.delete.error', 'Error al eliminar grupo'));
      }
    } catch {
      alert(translate('groups.connection.error', 'Error de conexión'));
    }
  };

  const handleAddMember = async () => {
    if (!grupo) return;

    const email = newMemberEmail.trim();
    if (!email) {
      setAddMemberError(
        translate(
          'groups.members.addEmpty',
          'Ingresa un email para agregar un integrante.'
        )
      );
      return;
    }

    setAddingMember(true);
    setAddMemberError(null);

    try {
      const res = await fetch(`${API_URL}/grupo/${grupo.id}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('Error al agregar integrante:', res.status, text);
        setAddMemberError(
          translate(
            'groups.members.addError',
            'No se pudo agregar el integrante (revisa el email).'
          )
        );
        return;
      }

      const updated: Grupo = await res.json();
      setGrupo(updated);
      setNewMemberEmail('');
    } catch (e) {
      console.error(e);
      setAddMemberError(
        translate(
          'groups.connection.error',
          'Error de conexión con el servidor'
        )
      );
    } finally {
      setAddingMember(false);
    }
  };

  if (loading)
    return (
      <p className="p-6 text-gray-600">
        {translate('groups.loading', 'Cargando grupo...')}
      </p>
    );

  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!grupo) return null;

  return (
    <main>
      {/* Migas de pan */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-gray-600">
          <Link href="/grupos" className="hover:underline">
            {translate('groups.nav', 'Grupos')}
          </Link>{' '}
          <span>›</span>{' '}
          <span className="font-medium">{grupo.nombre}</span>
        </div>
      </div>
      <div className="mt-4 h-[1px] w-full bg-gray-200" />

      {/* Titulo superior */}
      <div className="flex items-center justify-between mb-6 mt-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-[26px]">📍</span>
          {grupo.nombre}
        </h1>
        <button
          onClick={handleDelete}
          className="text-gray-500 hover:text-red-500 transition"
          title={translate('viajes.delete', 'Eliminar')}
        >
          🗑️
        </button>
      </div>

      {/* Tarjeta principal */}
      <div className="bg-[#E8F0FF] border border-[#c7dbff] rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold">{grupo.nombre}</h2>

        {/* Descripcion */}
        <p className="mt-1 text-gray-700">
          <span className="font-semibold">
            {translate('groups.description', 'Descripción:')}
          </span>
          <br />
          {grupo.descripcion ||
            translate('groups.description.none', 'Sin descripción.')}
        </p>

        {/* Miembros */}
        <div className="mt-4">
          <span className="font-semibold">
            {translate('groups.members', 'Miembros:')}
          </span>
          <div className="flex flex-col gap-2 mt-2">
            {grupo.integrantes && grupo.integrantes.length > 0 ? (
              grupo.integrantes.map((miembro: Usuario) => {
                const label =
                  miembro.email || miembro.nombre || `ID ${miembro.id}`;
                const key = miembro.id ?? miembro.email ?? label;

                return (
                  <div
                    key={key}
                    className="rounded-full border px-4 py-1.5 text-sm shadow-sm bg-white"
                  >
                    {label}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500">
                {translate(
                  'groups.members.none',
                  'No hay miembros registrados.'
                )}
              </p>
            )}
          </div>

          {/* Formulario para agregar integrante por email */}
          <div className="mt-4 flex flex-col gap-2 max-w-md">
            <label className="text-sm font-semibold">
              {translate(
                'groups.members.addLabel',
                'Agregar integrante por email'
              )}
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder={translate(
                  'groups.members.addPlaceholder',
                  'ej: gaby@uniandes.edu.co'
                )}
                className="flex-1 rounded-full border px-4 py-2.5 shadow-sm"
              />
              <button
                type="button"
                onClick={handleAddMember}
                disabled={addingMember}
                className="rounded-full bg-lime-200 px-4 py-2 text-sm font-semibold hover:bg-lime-300 disabled:opacity-60"
              >
                {addingMember
                  ? translate('groups.members.adding', 'Agregando…')
                  : translate('groups.members.add', 'Agregar')}
              </button>
            </div>
            {addMemberError && (
              <p className="text-xs text-red-600">{addMemberError}</p>
            )}
          </div>
        </div>

        {/* Viajes del grupo */}
        <div className="mt-6">
          <span className="font-semibold">
            {translate('groups.trips', 'Viajes del grupo:')}
          </span>
          {grupo.viajes && grupo.viajes.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-3">
              {grupo.viajes.map((viaje) => (
                <li
                  key={viaje.id}
                  className="rounded-xl bg-white border border-[#c7dbff] p-3 shadow-sm"
                >
                  <p className="font-semibold">{viaje.nombre}</p>
                  {viaje.descripcion && (
                    <p className="text-sm text-gray-600">
                      {viaje.descripcion}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 mt-1">
              {translate(
                'groups.trips.none',
                'Este grupo aún no tiene viajes registrados.'
              )}
            </p>
          )}
        </div>

        {/* Imagen */}
        {grupo.imagenGrupoUrl && (
          <div className="mt-6">
            <Image
              src={grupo.imagenGrupoUrl}
              alt={grupo.nombre}
              width={800}
              height={400}
              className="rounded-xl object-cover w-full max-h-[400px]"
            />
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <Link
          href="/grupos"
          className="rounded-full bg-[#E8F0FF] px-5 py-2 text-sm font-semibold border border-[#c7dbff] hover:brightness-95"
        >
          ← {translate('groups.backToList', 'Volver a grupos')}
        </Link>
      </div>
    </main>
  );
}
