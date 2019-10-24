import { FormikProps, Field } from 'formik';
import React, { useContext } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppSettingsFormValues } from '../AppSettings.types';
import { PermissionsContext } from '../Contexts';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { isEqual } from 'lodash-es';
import { settingsWrapper } from '../AppSettingsForm';
import { Stack, Icon, Link } from 'office-ui-fabric-react';
import { infoIconStyle, learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { Links } from '../../../../utils/FwLinks';
import { ThemeContext } from '../../../../ThemeContext';
import InfoBox from '../../../../components/InfoBox/InfoBox';

const DailyUsageQuota: React.FC<FormikProps<AppSettingsFormValues> & WithTranslation> = props => {
  const { t, values, initialValues } = props;
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const theme = useContext(ThemeContext);

  if (!values.config) {
    return null;
  }

  return (
    <>
      <h3>{t('Runtime scale monitoring')}</h3>
      <InfoBox
        id="runtime-version-info"
        type="Error"
        message={t('connectionStringsInfoMessage')}
        additionalInfoLink={{ url: Links.funcConnStringsLearnMore, text: t('learnMore') }}
      />
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
          name="config.properties.functionsRuntimeScaleMonitoringEnabled"
          dirty={
            !isEqual(
              values.config.properties.functionsRuntimeScaleMonitoringEnabled,
              initialValues.config.properties.functionsRuntimeScaleMonitoringEnabled
            )
          }
          component={RadioButton}
          label={t('Runtime scale monitoring')}
          id="function-app-settings-runtime-scale-monitoring-enabled"
          disabled={!app_write || !editable || saving}
          options={[
            {
              key: true,
              text: t('enabled'),
              disabled: !values.config.properties.reservedInstanceCount,
            },
            {
              key: false,
              text: t('disabled'),
              disabled: !!values.config.properties.vnetName,
            },
          ]}
          vertical={false}
        />
      </div>
    </>
  );
};

export default withTranslation('translation')(DailyUsageQuota);
