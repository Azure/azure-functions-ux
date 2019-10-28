import { FormikProps, Field } from 'formik';
import React, { useContext } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppSettingsFormValues } from '../AppSettings.types';
import { PermissionsContext } from '../Contexts';
import TextField from '../../../../components/form-controls/TextField';
import InfoBox from '../../../../components/InfoBox/InfoBox';

const onKeyDown = keyEvent => {
  const keyCode = keyEvent.charCode || keyEvent.keyCode;
  if (keyCode < 48 || keyCode > 57) {
    keyEvent.preventDefault();
  }
};

const DailyUsageQuota: React.FC<FormikProps<AppSettingsFormValues> & WithTranslation> = props => {
  const { t, values, initialValues } = props;
  const { app_write, editable, saving } = useContext(PermissionsContext);

  if (!values.site) {
    return null;
  }

  return (
    <>
      {!!values.site.properties.dailyMemoryTimeQuota && (
        <InfoBox id="function-app-settings-daily-memory-time-quota-info" type="Info" message={t('functionAppSettings_quotaInfo')} />
      )}
      {!values.site.properties.enabled && values.site.properties.siteDisabledReason === 1 && (
        <InfoBox
          id="function-app-settings-daily-memory-time-quota-warning"
          type="Warning"
          message={t('functionAppSettings_quotaWarning')}
        />
      )}
      <Field
        name="site.properties.dailyMemoryTimeQuota"
        dirty={values.site.properties.dailyMemoryTimeQuota !== initialValues.site.properties.dailyMemoryTimeQuota}
        component={TextField}
        onKeyPress={e => onKeyDown(e)}
        label={t('functionAppSettings_dailyUsageQuota')}
        id="function-app-settings-daily-memory-time-quota"
        disabled={!app_write || !editable || saving}
        style={{ marginLeft: '1px', marginTop: '1px' }}
      />
    </>
  );
};

export default withTranslation('translation')(DailyUsageQuota);
