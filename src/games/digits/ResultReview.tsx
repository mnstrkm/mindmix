import { useTranslation } from 'react-i18next';

export default function ResultReview({ sequence, answer }: { sequence: string; answer: string }) {
  const { t } = useTranslation('digits');
  return <section className="result-review" aria-label={t('reviewTitle')}>
    <h3>{t('reviewTitle')}</h3>
    <p className="review-legend">{t('reviewLegend')}</p>
    <ol className="digit-comparison">
      {Array.from(sequence, (expected, index) => {
        const entered = answer[index];
        const status = entered === undefined ? 'missing' : entered === expected ? 'correct' : 'wrong';
        return <li key={index} className={`digit-pair digit-${status}`} aria-label={t('reviewDigit', { position: index + 1, expected, entered: entered ?? t('missing'), status: t(`reviewStates.${status}`) })}>
          <span aria-hidden="true">{expected}</span>
          <span aria-hidden="true">{entered ?? '—'}</span>
          <small aria-hidden="true">{status === 'correct' ? '✓' : '×'}</small>
        </li>;
      })}
    </ol>
  </section>;
}
