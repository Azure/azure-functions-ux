import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'office-ui-fabric-react';

export interface TemplateDetailProps {}

const TemplateDetail: React.FC<TemplateDetailProps> = props => {
  const { t } = useTranslation();

  return (
    <>
      <h3>{t('detail')}</h3>
      <p>
        {t('detailDescription')}
        {/* TODO(krmitta): Add learn more link */}
        <Link>{t('learnMore')}</Link>
      </p>
    </>
  );
};

export default TemplateDetail;
