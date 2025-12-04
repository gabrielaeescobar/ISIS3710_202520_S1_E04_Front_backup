import React from 'react';
import { render, screen } from '@testing-library/react';
import GruposPage from '../page';
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

jest.mock('../_components/GruposList', () => ({
  __esModule: true,
  default: () => <div data-testid="grupos-list">list</div>,
}));



it('renderiza título, links y buscador con placeholder', () => {
  render(<GruposPage />);

  
  expect(screen.getByText('Tus grupos')).toBeInTheDocument();

  
  const crumb = screen.getByRole('link', { name: 'Grupos' });
  expect(crumb).toBeInTheDocument();
  expect(crumb).toHaveAttribute('href', '/grupos');

  const create = screen.getByRole('link', { name: /Crear nuevo grupo/i });
  expect(create).toBeInTheDocument();
  expect(create).toHaveAttribute('href', '/grupos/nuevo');

  const input = screen.getByPlaceholderText('Buscar en mis grupos') as HTMLInputElement;
  expect(input).toBeInTheDocument();

  expect(screen.getByTestId('grupos-list')).toBeInTheDocument();
});
