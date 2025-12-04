import React from 'react';
import { render, screen } from '@testing-library/react';
import CalendarioPage from '../page';


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
    translate: (k: string, fb?: string) => string;
  } => ({
    currentLocale: 'es',
    setCurrentLocale: () => {},
    translate: (_k: string, fb?: string) => fb ?? '',
  }),
}));

jest.mock('../_components/EventosList', () => ({
  __esModule: true,
  EventosList: () => <div data-testid="eventos-list">calendario</div>,
}));


it('renderiza título, botón de crear evento y la lista de eventos', () => {
  render(<CalendarioPage />);
  expect(screen.getByText('Tu Calendario')).toBeInTheDocument();

  const createBtn = screen.getByText('+ Crear evento');
  expect(createBtn).toBeInTheDocument();
  expect(createBtn.closest('a')).toHaveAttribute('href', '/calendario/nuevo');
  expect(screen.getByTestId('eventos-list')).toBeInTheDocument();
});
