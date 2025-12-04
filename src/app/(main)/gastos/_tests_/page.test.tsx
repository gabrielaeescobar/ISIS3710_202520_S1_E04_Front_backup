import React from 'react';
import { render, screen } from '@testing-library/react';
import GastosPage from '../page';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (
    props: Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'priority'> & { priority?: boolean }
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { priority, ...rest } = props;
    return React.createElement('img', rest);
  },
}));


jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

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

jest.mock('../_components/GastosResumen', () => ({
  __esModule: true,
  default: (props: { userName: string }) => (
    <div data-testid="gastos-resumen">Resumen de {props.userName}</div>
  ),
}));

jest.mock('../_components/GastosList', () => ({
  __esModule: true,
  default: () => <div data-testid="gastos-list">Lista de gastos</div>,
}));

it('renderiza el título, el botón y los componentes de gastos', () => {
  render(<GastosPage />);

  expect(screen.getByText('Tus Gastos')).toBeInTheDocument();

  const newExpenseBtn = screen.getByText('+ Nuevo gasto');
  expect(newExpenseBtn).toBeInTheDocument();
  expect(newExpenseBtn.closest('a')).toHaveAttribute('href', '/gastos/nuevo');

  expect(screen.getByTestId('gastos-resumen')).toHaveTextContent('Juliana');
  expect(screen.getByTestId('gastos-list')).toBeInTheDocument();
});
