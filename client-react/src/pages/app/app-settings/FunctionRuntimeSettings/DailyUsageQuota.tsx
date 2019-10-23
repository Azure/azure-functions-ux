import { FormikProps, Field } from 'formik';
import React, { useContext } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppSettingsFormValues } from '../AppSettings.types';
import { PermissionsContext } from '../Contexts';
import TextField from '../../../../components/form-controls/TextField';
import { settingsWrapper } from '../AppSettingsForm';
import { ThemeContext } from '../../../../ThemeContext';
import { Stack, Icon, Link } from 'office-ui-fabric-react';
import { infoIconStyle, learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { Links } from '../../../../utils/FwLinks';

const DailyUsageQuota: React.FC<FormikProps<AppSettingsFormValues> & WithTranslation> = props => {
  const { t, values, initialValues } = props;
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const theme = useContext(ThemeContext);

  if (!values.site) {
    return null;
  }

  return (
    <>
      <h3>{t('Usage quota')}</h3>
      <Stack horizontal verticalAlign="center">
        <Icon iconName="Info" className={infoIconStyle(theme)} />
        <p>
          <span id="connection-strings-info-message">{t('connectionStringsInfoMessage')}</span>
          <span id="func-conn-strings-info-text">{` ${t('funcConnStringsInfoText')} `}</span>
          <Link
            id="func-conn-strings-info-learnMore"
            href={Links.funcConnStringsLearnMore}
            target="_blank"
            className={learnMoreLinkStyle}
            aria-labelledby="connection-strings-info-message func-conn-strings-info-text func-conn-strings-info-learnMore">
            {` ${t('learnMore')}`}
          </Link>
        </p>
      </Stack>
      <div className={settingsWrapper}>
        <Field
          name="site.properties.dailyMemoryTimeQuota"
          dirty={values.site.properties.dailyMemoryTimeQuota !== initialValues.site.properties.dailyMemoryTimeQuota}
          component={TextField}
          label={t('dailyUsageQuotaLabel')}
          id="function-app-settings-daily-memory-time-quota"
          disabled={!app_write || !editable || saving}
          style={{ marginLeft: '1px', marginTop: '1px' }}
        />
        {!values.site.properties.enabled && values.site.properties.siteDisabledReason === 1 && <div>WARNING</div>}
      </div>
    </>
  );
};

export default withTranslation('translation')(DailyUsageQuota);
