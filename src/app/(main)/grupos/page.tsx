'use client';
import Image from 'next/image';
import Link from 'next/link';

import GruposList from './_components/GruposList';
import { useLocale } from '@/components/locale-provider';
import { Search } from 'lucide-react';

export default function GruposPage() {
  const { translate } = useLocale();

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        

      </div>

      {/* Título + botón Crear nuevo grupo */}
      <div className="page-title-row mt-6">
        <Image
          src="/logo_blanco.png"
          alt="Layover"
          width={28}
          height={28}
          className="page-title-icon"
          priority
        />
        <h1 className="page-title">
          {translate('groups.title', 'Tus grupos')}
        </h1>
        <div>
          <Link
            href="/grupos/nuevo"
            className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-[#e8f3ff] px-4 py-2 font-semibold shadow-sm hover:bg-[#dff0ff] transition"
          >
            <span>
              {translate('groups.createNew', 'Crear nuevo grupo')}
            </span>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-black/10 bg-white">
              ＋
            </span>
          </Link>
        </div>
      </div>

      <GruposList />
    </div>
  );
}
