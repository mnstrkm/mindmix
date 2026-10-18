import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
export function GuideFrame({ children, caption }: { children: ReactNode; caption: string }) {
  const { t } = useTranslation('common');
  return <figure className="guide"><h3>{t('example')}</h3><div className="guide-visual" aria-hidden="true">{children}</div><figcaption>{caption}</figcaption></figure>;
}
