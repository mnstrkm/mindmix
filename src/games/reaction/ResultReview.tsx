import { useTranslation } from 'react-i18next';
import type { Language } from '../../app/types';

export default function ResultReview({ times, language }: { times: readonly number[]; language: Language }) {
  const { t } = useTranslation('reaction');
  const rounded = times.map(time => Math.round(time));
  const fastest = Math.min(...rounded);
  return <section className="result-review reaction-review" aria-label={t('stats.measurements')}>
    <h3>{t('stats.measurements')}</h3>
    <ol className="trial-list">{rounded.map((time, index) => <li key={index} className={time === fastest ? 'fastest-trial' : ''}>
      <span>{t('trialNumber', { number: index + 1 })}</span>
      <strong>{time.toLocaleString(language)} {t('unit')}</strong>
      {time === fastest && <small>{t('fastestLabel')}</small>}
    </li>)}</ol>
  </section>;
}
