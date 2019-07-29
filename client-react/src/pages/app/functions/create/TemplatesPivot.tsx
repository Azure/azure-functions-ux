import React, { useContext } from 'react';

import { useTranslation } from 'react-i18next';
import { Icon, Link, Stack } from 'office-ui-fabric-react';
// import { FormikProps } from 'formik';
import { infoIconStyle, learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { ThemeContext } from '../../../../ThemeContext';
import { Links } from '../../../../utils/FwLinks';

const TemplatesPivot: React.FC<any> = props => {
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  return (
    <>
      <h3>{t('applicationSettings')}</h3>
      <Stack horizontal verticalAlign="center">
        <Icon iconName="Info" className={infoIconStyle(theme)} />
        <p>
          {t('applicationSettingsInfoMessage')}
          <Link href={Links.applicationSettingsInfo} target="_blank" className={learnMoreLinkStyle}>
            {` ${t('learnMore')}`}
          </Link>
        </p>
      </Stack>
    </>
  );
};

export default TemplatesPivot;
