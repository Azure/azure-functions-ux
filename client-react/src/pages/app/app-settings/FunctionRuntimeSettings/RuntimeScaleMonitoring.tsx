import { FormikProps, Field } from 'formik';
import React, { useContext } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppSettingsFormValues } from '../AppSettings.types';
import { PermissionsContext } from '../Contexts';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { isEqual } from 'lodash-es';
import { Links } from '../../../../utils/FwLinks';

const RuntimeScaleMonitoring: React.FC<FormikProps<AppSettingsFormValues> & WithTranslation> = props => {
  const { t, values, initialValues } = props;
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;

  if (!values.config) {
    return null;
  }

  return (
    <>
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
        disabled={disableAllControls}
        options={[
          {
            key: true,
            text: t('on'),
            disabled: !values.config.properties.reservedInstanceCount || !values.config.properties.vnetName,
          },
          {
            key: false,
            text: t('off'),
            disabled: false,
          },
        ]}
        vertical={false}
        notificationMessage={t('appFunctionSettings_runtimeScalingMonitoringMessage')}
        learnMoreLink={Links.runtimeScaleMonitoringLearnMore}
      />
    </>
  );
};

export default withTranslation('translation')(RuntimeScaleMonitoring);
