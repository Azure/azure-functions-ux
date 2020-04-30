import { Field } from 'formik';
import React, { useContext } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppSettingsFormProps } from '../AppSettings.types';
import { PermissionsContext } from '../Contexts';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { isEqual } from 'lodash-es';
import { Links } from '../../../../utils/FwLinks';
import { findFormAppSettingValue } from '../AppSettingsFormData';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { RuntimeExtensionMajorVersions } from '../../../../models/functions/runtime-extension';
import { FunctionsRuntimeVersionHelper } from '../../../../utils/FunctionsRuntimeVersionHelper';

const RuntimeScaleMonitoring: React.FC<AppSettingsFormProps & WithTranslation> = props => {
  const { t, values, initialValues, asyncData } = props;
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;

  const scaleMonitoringSupported = () => {
    let isSupported = false;
    const initialRuntimeVersion = findFormAppSettingValue(
      initialValues.appSettings,
      CommonConstants.AppSettingNames.functionsExtensionVersion
    );

    if (!!initialRuntimeVersion) {
      const exactRuntimeVersion = asyncData.functionsHostStatus.value && asyncData.functionsHostStatus.value.properties.version;
      const exactRuntimeVersionParsed = FunctionsRuntimeVersionHelper.parseExactRuntimeVersion(exactRuntimeVersion || null);
      const initialRuntimeVersionParsed = FunctionsRuntimeVersionHelper.parseConfiguredRuntimeVersion(initialRuntimeVersion);

      const supportedVersions = [RuntimeExtensionMajorVersions.v2, RuntimeExtensionMajorVersions.v3];
      supportedVersions.forEach(version => {
        if (initialRuntimeVersionParsed === version || exactRuntimeVersionParsed === version) {
          isSupported = true;
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
