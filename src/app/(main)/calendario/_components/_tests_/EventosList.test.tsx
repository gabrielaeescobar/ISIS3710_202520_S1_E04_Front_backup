
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { EventosList, buildDateUrl, buildEventUrl } from '../EventosList';

jest.mock('@fullcalendar/react', () => ({
  __esModule: true,
  default: (props: { events?: unknown[] }) => (
    <div data-testid="mock-calendar">
      <p data-testid="event-count">{Array.isArray(props.events) ? props.events.length : 0}</p>
    </div>
  ),
}));

jest.mock('@fullcalendar/daygrid', () => ({}));
jest.mock('@fullcalendar/interaction', () => ({ __esModule: true, default: {} }));

interface MockResponse<T> {
  json: () => Promise<T>;
}

describe('EventosList', () => {
  beforeEach(() => {
    global.fetch = jest.fn((url: string): Promise<MockResponse<{ data: unknown[] }>> => {
      if (url.includes('/api/eventos')) {
        return Promise.resolve({
          json: async () => ({
            data: [
              { id: '1', nombre: 'Vuelo a Madrid', fecha: '2025-08-19', hora: '10:00', viajeId: 1 },
            ],
          }),
        });
      }
      if (url.includes('/api/reservas')) {
        return Promise.resolve({
          json: async () => ({
            data: [
              { id: 5, nombre: 'Hotel Las Flores', fecha_inicio: '2025-08-20', tipo: 'hotel', viaje_id: 1 },
            ],
          }),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza y combina eventos + reservas', async () => {
    render(<EventosList />);
    await waitFor(() => {
      expect(screen.getByTestId('mock-calendar')).toBeInTheDocument();
    });
    expect(screen.getByTestId('event-count')).toHaveTextContent('2');
  });

  it('buildDateUrl genera la URL correcta', () => {
    expect(buildDateUrl('2025-08-19')).toBe('/calendario/nuevo?fecha=2025-08-19');
  });

  it('buildEventUrl genera URL de evento y reserva correctamente', () => {
    expect(buildEventUrl('evento-123', 'evento')).toBe('/calendario/123');
    expect(buildEventUrl('reserva-77', 'reserva')).toBe('/reservas/77');
  });
});
