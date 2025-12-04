import React from 'react';
import { render, screen } from '@testing-library/react';
import Usuarios from '../page';

it('renderiza el texto "Usuarios"', () => {
  render(<Usuarios />);
  expect(screen.getByText('Usuarios')).toBeInTheDocument();
});
