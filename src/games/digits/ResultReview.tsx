import { useTranslation } from 'react-i18next';

export default function ResultReview({ sequence, answer }: { sequence: string; answer: string }) {
  const { t } = useTranslation('digits');
  return <section className="result-review" aria-label={t('reviewTitle')}>
    <h3>{t('reviewTitle')}</h3>
    <dl className="digit-review">
      <div><dt>{t('reviewExpected')}</dt><dd>
        <div className="digit-comparison" role="img" aria-label={t('sequence', { sequence: sequence.split('').join(' ') })}>
          {Array.from(sequence, (digit, index) => <span className="digit-value" aria-hidden="true" key={index}>{digit}</span>)}
        </div>
      </dd></div>
      <div><dt>{t('reviewAnswer')}</dt><dd><ol className="digit-comparison">
      {Array.from(sequence, (expected, index) => {
        const entered = answer[index];
        const status = entered === undefined ? 'missing' : entered === expected ? 'correct' : 'wrong';
        return <li key={index} className={`digit-value digit-answer digit-${status}`} aria-label={t('reviewDigit', { position: index + 1, expected, entered: entered ?? t('missing'), status: t(`reviewStates.${status}`) })}>
          <span aria-hidden="true">{entered ?? '—'}</span>
          <small aria-hidden="true">{status === 'correct' ? '✓' : '×'}</small>
        </li>;
      })}
      </ol></dd></div>
    </dl>
  </section>;
}
