import React from 'react';
import { render, screen } from '@testing-library/react';

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

jest.mock('../_components/ReservasList', () => ({
  __esModule: true,
  default: (props: { viajeId: string }) => (
    <div data-testid="reservas-list">viajeId={props.viajeId}</div>
  ),
}));

function renderWithParams(params: Record<string, string>) {
  jest.isolateModules(() => {
    jest.doMock('next/navigation', () => ({
      __esModule: true,
      useParams: () => params,
    }));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReservasPage = require('../page').default as React.ComponentType;
    render(<ReservasPage />);
  });
}

it('muestra mensaje cuando no hay viajeId en los params', () => {
  renderWithParams({});
  expect(screen.getByText('Viaje no especificado')).toBeInTheDocument();
  expect(
    screen.getByText(/No se ha especificado un viaje para ver las reservas\./i)
  ).toBeInTheDocument();
});

it('renderiza ReservasList con el viajeId correcto cuando existe', () => {
  renderWithParams({ viajeId: '123' });
  expect(screen.getByTestId('reservas-list')).toHaveTextContent('viajeId=123');
});
