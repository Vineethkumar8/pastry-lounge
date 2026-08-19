import { render, screen } from '@testing-library/react';
import App from './App';

test('renders bakery heading', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /Pastry Lounge/i })).toBeInTheDocument();
});
