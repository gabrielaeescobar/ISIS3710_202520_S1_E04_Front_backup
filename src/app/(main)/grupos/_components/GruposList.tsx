'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Grupo } from '../model/group.interfaces';
import { useLocale } from '@/components/locale-provider';
import { getAuthUser, getAuthToken } from '@/lib/auth-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida');
}

export default function GruposList() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const { translate } = useLocale();

  useEffect(() => {
    const user = getAuthUser();
    const token = getAuthToken();

    if (!user || !token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_URL}/grupo/mis-grupos`, {
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error('Error al llamar /grupo/mis-grupos', res.status);
          setLoading(false);
          return;
        }

        const json = await res.json();
        setGrupos(json as Grupo[]);
      } catch (e) {
        console.error('Error de red llamando /grupo/mis-grupos', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        {translate('groups.loading', 'Cargando grupos…')}
      </div>
    );
  }

  if (!grupos.length) {
    return (
      <div className="p-4 text-gray-500">
        {translate('groups.empty', 'Aún no estás en ningún grupo')}
      </div>
    );
  }

  return (
    <div className="viajes-grid">
      {grupos.map((grupo) => {
        const membersCount = Array.isArray(grupo.integrantes)
          ? grupo.integrantes.length
          : 0;

        return (
          <article key={grupo.id} className="viaje-card">
            {grupo.imagenGrupoUrl && grupo.imagenGrupoUrl.trim() && (
              <Image
                src={grupo.imagenGrupoUrl.trim()}
                alt={grupo.nombre}
                width={640}
                height={360}
                className="viaje-image w-full h-auto"
                priority={false}
              />
            )}

            <h3 className="viaje-title">{grupo.nombre}</h3>

            {grupo.descripcion && (
              <p className="viaje-desc">{grupo.descripcion}</p>
            )}

            <div className="viaje-meta">
              <p>
                <span className="viaje-meta-label">
                  {translate('groups.members.label', 'Miembros:')}
                </span>{' '}
                {membersCount}
              </p>
            </div>

            <div className="viaje-actions">
              <Link href={`/grupos/${grupo.id}`} className="viaje-btn">
                {translate('groups.moreInfo', 'Más información')}
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
