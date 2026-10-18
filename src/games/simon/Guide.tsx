import { useTranslation } from 'react-i18next';
import { GuideFrame } from '../../shared/ui/GuideFrame';
export default function Guide() {
  const { t } = useTranslation('simon');
  return <GuideFrame caption={t('example')}><span className="guide-pad guide-blue">●</span><span className="guide-pad guide-orange">▲</span><span>→</span><span className="guide-pad guide-blue guide-selected">●</span><span className="guide-pad guide-orange guide-selected">▲</span></GuideFrame>;
}
