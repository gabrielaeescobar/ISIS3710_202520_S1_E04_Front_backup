'use client';

import Image from 'next/image';
import ViajesList from './_components/ViajesList';
import { useLocale } from '@/components/locale-provider';

export default function ViajesPage() {
  const { translate } = useLocale();

  return (
    <div>
      <div className="page-title-row">
        <Image
          src="/logo_blanco.png"
          alt="Layover"
          width={28}
          height={28}
          className="page-title-icon"
          priority
        />
        <h1 className="page-title">
          {translate('viajes.title', 'Tus viajes')}
        </h1>
      </div>

      <ViajesList />
    </div>
  );
}
