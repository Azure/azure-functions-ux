import { FormikProps, Field } from 'formik';
import React, { useContext } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppSettingsFormValues } from '../AppSettings.types';
import { PermissionsContext } from '../Contexts';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { isEqual } from 'lodash-es';
import { settingsWrapper } from '../AppSettingsForm';

const DailyUsageQuota: React.FC<FormikProps<AppSettingsFormValues> & WithTranslation> = props => {
  const { t, values, initialValues } = props;
  const { app_write, editable, saving } = useContext(PermissionsContext);

  if (!values.config) {
    return null;
  }

  return (
    <>
      <h3>{t('Runtime scale monitoring')}</h3>
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
