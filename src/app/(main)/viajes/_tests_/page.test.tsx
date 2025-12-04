import React from 'react';
import { render, screen } from '@testing-library/react';
import ViajesPage from '../page';

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

jest.mock('../_components/ViajesList', () => ({
  __esModule: true,
  default: () => <div data-testid="viajes-list">lista</div>,
}));


it('renderiza el título y el componente ViajesList', () => {
  render(<ViajesPage />);
  expect(screen.getByText('Tus viajes')).toBeInTheDocument();
  const logo = screen.getByAltText('Layover');
  expect(logo).toBeInTheDocument();
  expect(screen.getByTestId('viajes-list')).toBeInTheDocument();
});
