'use client';

import Link from "next/link";
import Image from "next/image";
import GastosResumen from "./_components/GastosResumen";
import GastosList from "./_components/GastosList";
import { useLocale } from "@/components/locale-provider";


export default function GastosPage() {
  const { translate } = useLocale();

  return (
    <div className="p-6 space-y-8">

      <div className="page-title-row mb-4 gap-3 items-center">
        <div className="flex items-center gap-3">
          <Image
            src="/logo_blanco.png"
            alt="Layover"
            width={28}
            height={28}
            className="page-title-icon"
            priority
          />
          <h1 className="page-title text-2xl font-semibold text-gray-900">
            {translate('gastos.page.title', 'Tus Gastos')}
          </h1>
        </div>

        <div className="ml-auto">
          <Link
            href="/gastos/nuevo"
            className="inline-flex items-center rounded-md bg-[#d5efb8] px-4 py-2 text-sm font-medium text-black hover:bg-[#c3e19e] transition-colors"
          >
            {translate('gastos.page.newExpense', '+ Nuevo gasto')}
          </Link>
        </div>
      </div>

 
      <div className="space-y-10">
        <GastosResumen />
        <GastosList />
      </div>
    </div>
  );
}
