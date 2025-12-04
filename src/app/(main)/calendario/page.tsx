'use client'
import Image from "next/image";
import Link from "next/link";
import { EventosList } from "./_components/EventosList";
import { useLocale } from "@/components/locale-provider";

export default function CalendarioPage() {
  const { translate } = useLocale();

  return (
    <div className="p-6 space-y-6">
      <div className="page-title-row mb-2 gap-3 items-center">
        <Image
          src="/logo_blanco.png"
          alt="Layover"
          width={28}
          height={28}
          className="page-title-icon"
          priority
        />

        <h1 className="page-title text-2xl font-semibold text-gray-900">
          {translate('calendar.title', 'Tu Calendario')}
        </h1>

        
      </div>
      <EventosList />
    </div>
  );
}
