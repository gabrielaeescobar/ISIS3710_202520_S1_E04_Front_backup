import React from 'react';
import { render, screen} from '@testing-library/react';
import HomePage from '../page';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (
    props: Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'priority'> & {
      priority?: boolean;
    },
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { priority, ...rest } = props;
    return React.createElement('img', rest);
  },
}));

jest.mock('@/components/locale-provider', () => ({
  __esModule: true,
  useLocale: (): {
    currentLocale: 'es' | 'en';
    setCurrentLocale: (l: 'es' | 'en') => void;
    translate: (k: string, fb?: string) => string;
  } => ({
    currentLocale: 'es',
    setCurrentLocale: () => {},
    translate: (_k: string, fb?: string) => fb ?? '',
  }),
}));

jest.mock('@/lib/auth-client', () => ({
  __esModule: true,
  getAuthUser: () => ({ id: 1, monedaBase: 'EUR' }),
  getAuthToken: () => 'test-token',
}));

interface MockResponse<T> {
  ok: boolean;
  json: () => Promise<T>;
}
type FetchMock = (input: string, init?: RequestInit) => Promise<MockResponse<unknown>>;
const setFetchMock = (impl: FetchMock) => {
  (global as unknown as { fetch: FetchMock }).fetch = impl;
};

const fixedNow = new Date('2025-10-20T00:00:00.000Z');

beforeAll(() => {
  process.env.NEXT_PUBLIC_API_URL = 'https://api.test';
  jest.useFakeTimers();
  jest.setSystemTime(fixedNow);
});

afterAll(() => {
  jest.useRealTimers();
});

afterEach(() => {
  jest.clearAllMocks();
});

it('muestra stats calculadas y listas de viajes/ reservas con datos desde el backend', async () => {
  const viajes = [
    {
      id: 1,
      nombre: 'París',
      destino: 'PAR',
      fechaIni: '2025-10-01',
      fechaFin: '2025-10-05',
    },
    {
      id: 2,
      nombre: 'Roma',
      destino: 'ROM',
      fechaIni: '2025-11-10',
      fechaFin: '2025-11-15',
    },
    {
      id: 3,
      nombre: 'Madrid',
      destino: 'MAD',
      fechaIni: '2025-12-01',
      fechaFin: '2025-12-03',
    },
    {
      id: 4,
      nombre: 'Lisboa',
      destino: 'LIS',
      fechaIni: '2026-01-10',
      fechaFin: '2026-01-20',
    },
  ];

  const gastos = [
    {
      idGasto: 1,
      concepto: 'Hotel',
      categoria: 'Comida',
      monto: 100,
      fecha: '2025-10-01',
      viajeId: 1,
      usuarioPagadorId: 1,
      moneda: 'EUR',
      grupoId: 1,
    },
    {
      idGasto: 2,
      concepto: 'Comida',
      categoria: 'Comida',
      monto: 50.5,
      fecha: '2025-10-02',
      viajeId: 1,
      usuarioPagadorId: 1,
      moneda: 'EUR',
      grupoId: 1,
    },
    {
      idGasto: 3,
      concepto: 'Taxi',
      categoria: 'Transporte',
      monto: 20,
      fecha: '2025-10-03',
      viajeId: 1,
      usuarioPagadorId: 1,
      moneda: 'EUR',
      grupoId: 1,
    },
  ];

  const reservasVuelo = [
    {
      idReserva: 11,
      aerolinea: 'Vuelo a Roma',
      fechaSalida: '2025-10-20',
      horaSalida: '10:00:00',
      destinoId: 100,
      estado: 'confirmada',
    },
  ];

  const reservasHotel = [
    {
      idReserva: 12,
      nombre: 'Hotel en Roma',
      fechaCheckIn: '2025-10-21',
      fechaCheckOut: '2025-10-22',
      ubicacionHotelId: 200,
      estado: 'pendiente',
    },
  ];

  const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;

  setFetchMock(async (url: string) => {
    if (url === `${apiUrl}/usuarios/1/viajes`) {
      return { ok: true, json: async () => viajes };
    }
    if (url === `${apiUrl}/gastos`) {
      return { ok: true, json: async () => gastos };
    }
    if (url === `${apiUrl}/reservas-vuelo`) {
      return { ok: true, json: async () => reservasVuelo };
    }
    if (url === `${apiUrl}/reservas-hotel`) {
      return { ok: true, json: async () => reservasHotel };
    }

    return { ok: false, json: async () => ({}) };
  });

  render(<HomePage />);

  expect(await screen.findByText(/Bienvenido a Layover/i)).toBeInTheDocument();

  expect(screen.getByText('Total Viajes')).toBeInTheDocument();
  expect(screen.getByText('4')).toBeInTheDocument();

  expect(screen.getByText('Gastos Totales')).toBeInTheDocument();
  expect(screen.getByText((t) => t.includes('€'))).toBeInTheDocument();

  expect(screen.getByText('Próximas Reservas')).toBeInTheDocument();
  // 2 reservas futuras en el mock
  expect(screen.getByText('2')).toBeInTheDocument();

  expect(screen.getByText('Eventos Hoy')).toBeInTheDocument();
  // 1 evento en la fecha fija
  expect(screen.getByText('1')).toBeInTheDocument();

  expect(screen.getByText('París')).toBeInTheDocument();
  expect(screen.getByText('Roma')).toBeInTheDocument();
  expect(screen.getByText('Madrid')).toBeInTheDocument();
});

it('muestra estados vacíos cuando el backend no devuelve datos', async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;

  setFetchMock(async (url: string) => {
    if (
      url === `${apiUrl}/usuarios/1/viajes` ||
      url === `${apiUrl}/gastos` ||
      url === `${apiUrl}/reservas-vuelo` ||
      url === `${apiUrl}/reservas-hotel`
    ) {
      return { ok: true, json: async () => [] };
    }
    return { ok: false, json: async () => ({}) };
  });

  render(<HomePage />);

  expect(await screen.findByText(/Bienvenido a Layover/i)).toBeInTheDocument();

  expect(screen.getByText('Total Viajes')).toBeInTheDocument();
  expect(screen.getByText('0')).toBeInTheDocument(); 
  expect(
    screen.getByText(/No tienes viajes recientes/i),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/No tienes reservas próximas/i),
  ).toBeInTheDocument();
});
