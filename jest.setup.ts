import '@testing-library/jest-dom';
import React from 'react';
jest.mock('next/image', () => ({
  __esModule: true,
  default: (
    props: Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'priority'> & { priority?: boolean }
  ) => {
    // Sacamos `priority` del DOM para evitar el warning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { priority, ...rest } = props;
    return React.createElement('img', rest);
  },
}));

jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation');
  return {
    ...actual,
    useRouter: () => ({ push: (_: string) => {}, refresh: () => {}, back: () => {} }),
    useParams: (): Record<string, string> => ({}),
    useSearchParams: () => {
      const usp = new URLSearchParams();
      return { get: (k: string) => usp.get(k), toString: () => usp.toString() };
    },
  };
});
