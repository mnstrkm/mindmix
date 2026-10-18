import { useTranslation } from 'react-i18next';
import { GuideFrame } from '../../shared/ui/GuideFrame';
export default function Guide() {
  const { t } = useTranslation('reaction');
  return <GuideFrame caption={t('example')}><span className="guide-chip guide-wait">{t('waiting')}</span><span>→</span><span className="guide-chip guide-selected">{t('now')}</span><span>→</span><span className="guide-chip">260 {t('unit')}</span></GuideFrame>;
}
