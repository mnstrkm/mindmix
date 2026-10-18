import { useTranslation } from 'react-i18next';
import { GuideFrame } from '../../shared/ui/GuideFrame';
export default function Guide() {
  const { t } = useTranslation('switch');
  return <GuideFrame caption={t('example')}><span className="guide-chip">{t('rules.color')}</span><span className="guide-orange guide-object">●<small>{t('colors.orange')}</small></span><span>→</span><span className="guide-word guide-selected">{t('right')}</span></GuideFrame>;
}
