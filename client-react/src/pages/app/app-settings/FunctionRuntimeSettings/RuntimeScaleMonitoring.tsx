import { FormikProps, Field } from 'formik';
import React, { useContext } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppSettingsFormValues } from '../AppSettings.types';
import { PermissionsContext } from '../Contexts';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { isEqual } from 'lodash-es';
import { Links } from '../../../../utils/FwLinks';
import InfoBox from '../../../../components/InfoBox/InfoBox';

const DailyUsageQuota: React.FC<FormikProps<AppSettingsFormValues> & WithTranslation> = props => {
  const { t, values, initialValues } = props;
  const { app_write, editable, saving } = useContext(PermissionsContext);

  if (!values.config) {
    return null;
  }

  return (
    <>
      <InfoBox
        id="function-app-settings-runtime-scale-monitoring-info"
        type="Info"
        message={t('appFunctionSettings_runtimeScalingMonitoringMessage')}
        additionalInfoLink={{ url: Links.runtimeScaleMonitoringLearnMore, text: t('learnMore') }}
      />
      <Field
        name="config.properties.functionsRuntimeScaleMonitoringEnabled"
        dirty={
          !isEqual(
            values.config.properties.functionsRuntimeScaleMonitoringEnabled,
            initialValues.config.properties.functionsRuntimeScaleMonitoringEnabled
          )
        }
        component={RadioButton}
        label={t('appFunctionSettings_virtualNetworkTriggerSupport')}
        id="function-app-settings-runtime-scale-monitoring-enabled"
        disabled={!app_write || !editable || saving}
        options={[
          {
            key: true,
            text: t('enabled'),
            disabled: !values.config.properties.reservedInstanceCount || !values.config.properties.vnetName,
          },
          {
            key: false,
            text: t('disabled'),
            disabled: !!values.config.properties.vnetName,
          },
        ]}
        vertical={true}
      />
    </>
  );
};

export default withTranslation('translation')(DailyUsageQuota);
