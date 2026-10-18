import { useTranslation } from 'react-i18next';
interface Props { value: string; onChange: (value: string) => void; onConfirm: () => void; maxLength?: number; disabled?: boolean }
export default function NumericPad({ value, onChange, onConfirm, maxLength = 1000, disabled = false }: Props) {
  const { t } = useTranslation('common');
  return <div className="number-entry">
    <output className="number-output" aria-label={t('answer')} aria-live="polite">{value || '—'}</output>
    <div className="number-pad">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => <button key={digit} className="number-key" disabled={disabled || value.length >= maxLength} onClick={() => onChange(value + digit)}>{digit}</button>)}
      <button className="number-key" aria-label={t('backspace')} disabled={disabled || !value} onClick={() => onChange(value.slice(0, -1))}>⌫</button>
      <button className="number-key" disabled={disabled || value.length >= maxLength} onClick={() => onChange(value + '0')}>0</button>
      <button className="number-key confirm-key" aria-label={t('confirm')} disabled={disabled || !value} onClick={onConfirm}>✓</button>
    </div>
    <button className="button primary full-width" disabled={disabled || !value} onClick={onConfirm}>{t('confirm')}</button>
  </div>;
}
export { NumericPad };
