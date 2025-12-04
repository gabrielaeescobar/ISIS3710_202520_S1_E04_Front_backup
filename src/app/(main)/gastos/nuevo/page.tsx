'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GastoForm } from '../_components/GastoForm';
import type { GastoCreate } from '../model/gastosinterface';
import { useLocale } from '@/components/locale-provider';
import { getAuthUser, getAuthToken } from '@/lib/auth-client';

export default function NuevoGastoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { translate } = useLocale();

  const onSubmit = async (values: GastoCreate) => {
    const authUser = getAuthUser();
    if (!authUser) {
      alert(
        translate(
          'nuevoGasto.loginRequired',
          'Debes iniciar sesión para registrar gastos.',
        ),
      );
      return;
    }

    const payload: GastoCreate = {
      ...values,
      usuarioPagadorId: authUser.id,
    };

    setLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/gastos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error creando gasto');
      router.push('/gastos');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
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
          {translate('nuevoGasto.page.title', 'Nuevo gasto')}
        </h1>
        <div className="ml-auto">
          <Link
            href="/gastos"
            className="inline-flex items-center rounded-md bg-[#d5efb8] px-4 py-2 text-sm font-medium text-black hover:bg-[#c3e19e] transition-colors"
          >
            {translate('nuevoGasto.backButton', '← Volver')}
          </Link>
        </div>
      </div>

      <Card className="border rounded-2xl shadow-sm">
        <CardContent className="p-6 space-y-6">
          <GastoForm
            onSubmit={onSubmit}
            loading={loading}
            submitLabel={translate(
              'nuevoGasto.saveExpense',
              'Guardar gasto',
            )}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="submit"
              form="form-gasto"
              disabled={loading}
              className="bg-[#d5efb8] text-black hover:bg-[#c3e19e]"
            >
              {loading
                ? translate('nuevoGasto.saving', 'Guardando...')
                : translate(
                    'nuevoGasto.saveExpense',
                    'Guardar gasto',
                  )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
