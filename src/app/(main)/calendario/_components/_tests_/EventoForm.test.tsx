import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventoForm } from '../EventoForm';
import type { EventoCreate } from '../../model/eventos.interfaces';

jest.mock('@/components/locale-provider', () => ({
  __esModule: true,
  useLocale: (): {
    currentLocale: 'es' | 'en';
    setCurrentLocale: (l: 'es' | 'en') => void;
    translate: (key: string, fallback?: string) => string;
  } => ({
    currentLocale: 'es',
    setCurrentLocale: () => {},
    translate: (_key: string, fallback?: string) => fallback ?? '',
  }),
}));

describe('EventoForm', () => {
  it('inicia deshabilitado si el formulario no es válido', () => {
    const onSubmit = jest.fn((v: EventoCreate) => v);
    render(<EventoForm onSubmit={onSubmit} submitLabel="Guardar" />);

    const submitBtn = screen.getByRole('button', { name: /guardar/i });
    expect(submitBtn).toBeDisabled();
  });

  it('envía datos parseados por zod con tipos correctos', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn((v: EventoCreate) => v);

    render(<EventoForm onSubmit={onSubmit} submitLabel="Guardar" />);

    await user.type(screen.getByLabelText(/nombre/i), 'Tour Museo');
    await user.clear(screen.getByLabelText(/fecha/i));
    await user.type(screen.getByLabelText(/fecha/i), '2025-10-22');
    await user.type(screen.getByLabelText(/hora/i), '14:30');

    const grupoInput = screen.getByLabelText(/grupo/i);
    await user.clear(grupoInput);
    await user.type(grupoInput, '2');

    await user.type(screen.getByLabelText(/viaje \(opcional\)/i), '5');
    await user.type(screen.getByLabelText(/ubicación/i), 'Madrid');
    await user.type(screen.getByLabelText(/precio/i), '120.50');
    await user.selectOptions(screen.getByLabelText(/dificultad/i), 'Moderado');
    await user.type(screen.getByLabelText(/descripción/i), 'Entrada general');
    await user.type(screen.getByLabelText(/notas/i), 'Estar 15 min antes');

    const submitBtn = screen.getByRole('button', { name: /guardar/i });
    await waitFor(() => expect(submitBtn).toBeEnabled());

    await user.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0] as EventoCreate;

    expect(payload.nombre).toBe('Tour Museo');
    expect(payload.fecha instanceof Date).toBe(true);
    
    const ymd = (payload.fecha as Date).toISOString().slice(0, 10);
    expect(ymd).toBe('2025-10-22');

    expect(payload.hora).toBe('14:30');
    expect(payload.grupoId).toBe(2);
    expect(payload.viajeId).toBe(5);
    expect(payload.ubicacion).toBe('Madrid');
    expect(payload.precio).toBeCloseTo(120.5, 5);
    expect(payload.dificultad).toBe('Moderado');
    expect(payload.descripcion).toBe('Entrada general');
    expect(payload.notas).toBe('Estar 15 min antes');
  });
});
