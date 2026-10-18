import { useTranslation } from 'react-i18next';
import { GuideFrame } from '../../shared/ui/GuideFrame';
function Arrow({ angle = 0 }: { angle?: number }) { return <svg viewBox="0 0 48 48"><path d="M24 4 43 23H31V44H17V23H5Z" fill="currentColor" transform={`rotate(${angle} 24 24)`} /></svg>; }
export default function Guide() {
  const { t } = useTranslation('search');
  return <GuideFrame caption={t('example')}><span className="guide-pad"><Arrow /></span><span>→</span><span className="guide-grid">{[90, 0, 180, 270].map(angle => <i key={angle} className={angle === 0 ? 'guide-selected' : ''}><Arrow angle={angle} /></i>)}</span></GuideFrame>;
}
