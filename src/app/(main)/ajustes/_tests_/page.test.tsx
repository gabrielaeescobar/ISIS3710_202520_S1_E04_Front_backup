/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPage from '../page';

// ---- Mocks tipados ----

// Mock de next/image (sin prop priority)
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

// Router
const pushMock = jest.fn<void, [string]>();
jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation');
  return {
    ...actual,
    useRouter: () => ({ push: (href: string) => pushMock(href) }),
  };
});

// useLocale: stateful usando React.useState dentro del mock para re-render
jest.mock('@/components/locale-provider', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react') as typeof import('react');
  type Locale = 'es' | 'en';
  return {
    __esModule: true,
    useLocale: (): {
      currentLocale: Locale;
      setCurrentLocale: (l: Locale) => void;
      translate: (k: string, fb?: string) => string;
    } => {
      // Por defecto ES, y permite setCurrentLocale que dispara re-render
      const [currentLocale, setCurrentLocale] = React.useState<Locale>('es');
      const translate = (_k: string, fb?: string): string => fb ?? '';
      return { currentLocale, setCurrentLocale, translate };
    },
  };
});

// ---- Tests ----

it('renderiza título y muestra locale actual (ES por defecto)', async () => {
  render(<SettingsPage />);
  expect(await screen.findByText(/Ajustes/i)).toBeInTheDocument();
  expect(screen.getByText(/Actual:/i)).toBeInTheDocument();
  expect(screen.getByText('ES')).toBeInTheDocument();
  // Botones de idioma visibles
  expect(screen.getByRole('button', { name: /Español/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /English/i })).toBeInTheDocument();
});

it('cambia el idioma al presionar English y refleja EN', async () => {
  render(<SettingsPage />);

  const esBtn = screen.getByRole('button', { name: /Español/i });
  const enBtn = screen.getByRole('button', { name: /English/i });

  // Estado inicial
  expect(esBtn).toHaveAttribute('aria-pressed', 'true');
  expect(enBtn).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByText('ES')).toBeInTheDocument();

  await userEvent.click(enBtn);

  // Tras cambiar
  expect(esBtn).toHaveAttribute('aria-pressed', 'false');
  expect(enBtn).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('EN')).toBeInTheDocument();
});

it('logout: elimina layover_user de localStorage y navega a /loginOrRegister', async () => {
  // Sembrar un valor previo
  localStorage.setItem('layover_user', JSON.stringify({ id: 'u1' }));

  render(<SettingsPage />);

  await userEvent.click(screen.getByRole('button', { name: /Cerrar Sesión/i }));

  expect(localStorage.getItem('layover_user')).toBeNull();
  expect(pushMock).toHaveBeenCalledWith('/loginOrRegister');
});
