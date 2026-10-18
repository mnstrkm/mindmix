import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { vi, expect, it } from 'vitest';
import NumericPad from './NumericPad';
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
it('retains leading zeroes, permits correction, and never opens a system input', () => {
  const confirm = vi.fn();
  function Example() { const [value, setValue] = useState(''); return <NumericPad value={value} onChange={setValue} onConfirm={() => confirm(value)} />; }
  const { container } = render(<Example />);
  fireEvent.click(screen.getByRole('button', { name: '0' }));
  fireEvent.click(screen.getByRole('button', { name: '2' }));
  expect(screen.getByLabelText('answer')).toHaveTextContent('02');
  fireEvent.click(screen.getByRole('button', { name: 'backspace' }));
  fireEvent.click(screen.getByRole('button', { name: '3' }));
  fireEvent.click(screen.getByRole('button', { name: 'confirm' }));
  expect(confirm).toHaveBeenCalledWith('03');
  expect(container.querySelector('input')).toBeNull();
});
