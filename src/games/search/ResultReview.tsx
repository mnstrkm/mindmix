import { useTranslation } from 'react-i18next';
import type { SearchTask } from './logic';
import Arrow from './Arrow';

export default function ResultReview({ task, selected }: { task: SearchTask; selected: number }) {
  const { t } = useTranslation('search');
  return <section className="result-review" aria-label={t('reviewTitle')}>
    <h3>{t('reviewTitle')}</h3>
    <div className="review-grid" style={{ gridTemplateColumns: `repeat(${task.columns}, minmax(0, 1fr))` }}>
      {task.cells.map((direction, index) => {
        const status = index === task.targetIndex ? 'correct' : index === selected ? 'wrong' : 'empty';
        return <span key={index} className={`review-cell review-${status}`} role="img" aria-label={t('reviewCell', { row: Math.floor(index / task.columns) + 1, column: index % task.columns + 1, direction: t(`directions.${direction}`), status: t(`reviewStates.${status}`) })}>
          <Arrow direction={direction} />
          {status !== 'empty' && <small className="review-marker" aria-hidden="true">{status === 'correct' ? '✓' : '×'}</small>}
        </span>;
      })}
    </div>
    <p className="review-legend">{t('reviewLegend')}</p>
  </section>;
}
