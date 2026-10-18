import { useTranslation } from 'react-i18next';
import { GuideFrame } from '../../shared/ui/GuideFrame';
export default function Guide() {
  const { t } = useTranslation('spatial');
  return <GuideFrame caption={t('example')}><span className="guide-grid">{[true, false, false, true].map((marked, i) => <i key={i} className={marked ? 'guide-selected' : ''}>{marked ? '●' : ''}</i>)}</span><span>→</span><span className="guide-grid">{[0, 1, 2, 3].map(i => <i key={i} />)}</span><span>→</span><span className="guide-grid">{[true, false, false, true].map((marked, i) => <i key={i} className={marked ? 'guide-selected' : ''}>{marked ? '✓' : ''}</i>)}</span></GuideFrame>;
}
