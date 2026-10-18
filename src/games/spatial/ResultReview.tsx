import { useTranslation } from 'react-i18next';

export default function ResultReview({ pattern, selected, rows, columns }: { pattern: readonly number[]; selected: readonly number[]; rows: number; columns: number }) {
  const { t } = useTranslation('spatial');
  return <section className="result-review" aria-label={t('reviewTitle')}>
    <h3>{t('reviewTitle')}</h3>
    <div className="review-grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {Array.from({ length: rows * columns }, (_, cell) => {
        const expected = pattern.includes(cell);
        const chosen = selected.includes(cell);
        const status = expected ? chosen ? 'correct' : 'missed' : chosen ? 'wrong' : 'empty';
        return <span key={cell} className={`review-cell review-${status}`} role="img" aria-label={t('reviewCell', { row: Math.floor(cell / columns) + 1, column: cell % columns + 1, status: t(`reviewStates.${status}`) })}>
          <span aria-hidden="true">{status === 'correct' ? '✓' : status === 'missed' ? '○' : status === 'wrong' ? '×' : '·'}</span>
        </span>;
      })}
    </div>
    <p className="review-legend">{t('reviewLegend')}</p>
  </section>;
}
