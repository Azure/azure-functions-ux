import React, { useContext } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { Field } from 'formik';
import { isEqual } from 'lodash-es';

import RadioButton from '../../../../components/form-controls/RadioButton';
import { RuntimeExtensionMajorVersions } from '../../../../models/functions/runtime-extension';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { FunctionsRuntimeVersionHelper } from '../../../../utils/FunctionsRuntimeVersionHelper';
import { Links } from '../../../../utils/FwLinks';
import { AppSettingsFormProps } from '../AppSettings.types';
import { findFormAppSettingValue } from '../AppSettingsFormData';
import { PermissionsContext } from '../Contexts';

const RuntimeScaleMonitoring: React.FC<AppSettingsFormProps & WithTranslation> = props => {
  const { t, values, initialValues, asyncData } = props;
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;

  const scaleMonitoringSupported = () => {
    let isSupported = true;
    const initialRuntimeVersion = findFormAppSettingValue(
      initialValues.appSettings,
      CommonConstants.AppSettingNames.functionsExtensionVersion
    );

    if (initialRuntimeVersion) {
      const exactRuntimeVersion = asyncData.functionsHostStatus.value && asyncData.functionsHostStatus.value.properties.version;
      const exactRuntimeVersionParsed = FunctionsRuntimeVersionHelper.parseExactRuntimeVersion(exactRuntimeVersion || null);
      const initialRuntimeVersionParsed = FunctionsRuntimeVersionHelper.parseConfiguredRuntimeVersion(initialRuntimeVersion);

      const nonSupportedVersions = [RuntimeExtensionMajorVersions.v1];
      nonSupportedVersions.forEach(version => {
        if (initialRuntimeVersionParsed === version || exactRuntimeVersionParsed === version) {
          isSupported = false;
        }
      });
    }

    return isSupported;
  };

  return (
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
          disabled: !values.config.properties.reservedInstanceCount || !scaleMonitoringSupported(),
        },
        {
          key: false,
          text: t('off'),
          disabled: false,
        },
      ]}
      infoBubbleMessage={t('appFunctionSettings_runtimeScalingMonitoringMessage')}
      learnMoreLink={Links.runtimeScaleMonitoringLearnMore}
      vertical={true}
    />
  );
};

export default withTranslation('translation')(RuntimeScaleMonitoring);
