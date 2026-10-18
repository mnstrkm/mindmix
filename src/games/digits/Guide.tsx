import { useTranslation } from 'react-i18next';
import { GuideFrame } from '../../shared/ui/GuideFrame';
export default function Guide() {
  const { t } = useTranslation('digits');
  return <GuideFrame caption={t('example')}><span className="guide-chip">4 0 7</span><span>→</span><span className="guide-chip guide-hidden">• • •</span><span>→</span><span className="guide-chip guide-selected">4 0 7 ✓</span></GuideFrame>;
}
