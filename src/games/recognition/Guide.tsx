import { useTranslation } from 'react-i18next';
import { GuideFrame } from '../../shared/ui/GuideFrame';
export default function Guide() {
  const { t } = useTranslation('recognition');
  return <GuideFrame caption={t('example')}><span className="guide-word"><b>{t('exampleWords.first')}</b><small>{t('new')}</small></span><span>→</span><span className="guide-word"><b>{t('exampleWords.second')}</b><small>{t('new')}</small></span><span>→</span><span className="guide-word guide-selected"><b>{t('exampleWords.first')}</b><small>{t('repeat')}</small></span></GuideFrame>;
}
