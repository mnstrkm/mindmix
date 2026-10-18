import { useTranslation } from 'react-i18next';
import { GuideFrame } from '../../shared/ui/GuideFrame';
export default function Guide() {
  const { t } = useTranslation('arithmetic');
  return <GuideFrame caption={t('example')}><span className="guide-chip">8 × 7 = ?</span><span>→</span><span className="guide-chip guide-selected">56 ✓</span></GuideFrame>;
}
