import React, { useContext } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { FormAppSetting, AppSettingsFormProps, LoadingStates } from '../AppSettings.types';
import { PermissionsContext } from '../Contexts';
import { addOrUpdateFormAppSetting, findFormAppSettingValue, removeFormAppSetting } from '../AppSettingsFormData';
import { CommonConstants } from '../../../../utils/CommonConstants';
import DropdownNoFormik from '../../../../components/form-controls/DropDownnoFormik';
import { IDropdownOption, MessageBarType, MessageBar } from 'office-ui-fabric-react';
import { RuntimeExtensionMajorVersions } from '../../../../models/functions/runtime-extension';
import { messageBannerStyle } from '../AppSettings.styles';
import { ThemeContext } from '../../../../ThemeContext';
import { FunctionsRuntimeVersionHelper } from '../../../../utils/FunctionsRuntimeVersionHelper';
import { isLinuxApp } from '../../../../utils/arm-utils';
import { HostStates } from '../../../../models/functions/host-status';

const RuntimeVersion: React.FC<AppSettingsFormProps & WithTranslation> = props => {
  const { t, values, initialValues, asyncData, setFieldValue } = props;
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const theme = useContext(ThemeContext);
  const disableAllControls = !app_write || !editable || saving;

  const initialRuntimeVersion =
    findFormAppSettingValue(initialValues.appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion) || '';
  const initialRuntimeMajorVersion = FunctionsRuntimeVersionHelper.getFunctionsRuntimeMajorVersion(initialRuntimeVersion);

  const runtimeVersion = findFormAppSettingValue(values.appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion);
  const runtimeMajorVersion = FunctionsRuntimeVersionHelper.getFunctionsRuntimeMajorVersion(runtimeVersion);

  const hasCustomRuntimeVersion = runtimeMajorVersion === RuntimeExtensionMajorVersions.custom;
  let [waitingOnFunctionsApi, hasFunctions, failedToGetFunctions] = [false, false, false];

  switch (asyncData.functionsCount.loadingState) {
    case LoadingStates.loading:
      // The functions call hasn't completed, so we don't know the functions count. Keep the control disabled until the call completes or fails.
      waitingOnFunctionsApi = true;
      break;
    case LoadingStates.complete:
      // The functions call completed successfully. If the function count > 0 , prevent the user from changing major versions.
      hasFunctions = !!asyncData.functionsCount.value;
      break;
    case LoadingStates.failed:
      // The functions call failed, so we don't know the functions count. To be safe, prevent the user from changing major versions.
      failedToGetFunctions = true;
      break;
  }

  const getPlaceHolder = (): string => {
    if (waitingOnFunctionsApi && !hasCustomRuntimeVersion) {
      return t('loading');
    }

    if (failedToGetFunctions) {
      return t('loadingFiled');
    }

    return '';
  };

  const getRuntimeVersionInUse = () => {
    let runtimeVersionInUse: RuntimeExtensionMajorVersions | null = null;

    if (
      asyncData.functionsHostStatus.loadingState === LoadingStates.complete &&
      asyncData.functionsHostStatus.value &&
      asyncData.functionsHostStatus.value.properties.state !== HostStates.error
    ) {
      // Try to get the current running major version from the result of the host status call.
      runtimeVersionInUse = FunctionsRuntimeVersionHelper.parseExactRuntimeVersion(asyncData.functionsHostStatus.value!.properties.version);
    }

    if (!runtimeVersionInUse) {
      // We weren't able to determine the major version because the host status call failed or returned a null/invalid value.
      // Try to get the intended major version based off of the FUNCTIONS_EXTENSION_VERSION value configured
      runtimeVersionInUse = FunctionsRuntimeVersionHelper.parseConfiguredRuntimeVersion(initialRuntimeVersion);
    }

    return runtimeVersionInUse;
  };

  const getOptions = (): IDropdownOption[] => {
    if (hasCustomRuntimeVersion) {
      return [
        {
          key: RuntimeExtensionMajorVersions.custom,
          text: t('custom'),
        },
      ];
    }

    const runtimeVersionInUse = getRuntimeVersionInUse();
    const disableV1 =
      hasFunctions &&
      (runtimeVersionInUse === RuntimeExtensionMajorVersions.v2 || runtimeVersionInUse === RuntimeExtensionMajorVersions.v3);
    const disableV2AndV3 = hasFunctions && runtimeVersionInUse === RuntimeExtensionMajorVersions.v1;

    return [
      {
        key: RuntimeExtensionMajorVersions.v1,
        text: RuntimeExtensionMajorVersions.v1,
        disabled: isLinuxApp(values.site) || disableV1,
      },
      {
        key: RuntimeExtensionMajorVersions.v2,
        text: RuntimeExtensionMajorVersions.v2,
        disabled: disableV2AndV3,
      },
      {
        key: RuntimeExtensionMajorVersions.v3,
        text: RuntimeExtensionMajorVersions.v3,
        disabled: disableV2AndV3,
      },
    ];
  };

  const dropDownDisabled = (): boolean => waitingOnFunctionsApi || failedToGetFunctions || hasCustomRuntimeVersion;

  const getNodeVersionForRuntime = version => {
    switch (version) {
      case RuntimeExtensionMajorVersions.v2:
        return CommonConstants.NodeVersions.v2;
      case RuntimeExtensionMajorVersions.v3:
        return CommonConstants.NodeVersions.v3;
      default:
        return CommonConstants.NodeVersions.default;
    }
  };

  const onDropDownChange = (newVersion: RuntimeExtensionMajorVersions) => {
    let appSettings: FormAppSetting[] = [...values.appSettings];

    // Remove AZUREJOBS_EXTENSION_VERSION app setting (if present)
    appSettings = removeFormAppSetting(values.appSettings, CommonConstants.AppSettingNames.azureJobsExtensionVersion);

    if (newVersion === RuntimeExtensionMajorVersions.v1) {
      // If functions extension version is V1, remove FUNCTIONS_WORKER_RUNTIME app setting (if present)
      appSettings = removeFormAppSetting(values.appSettings, CommonConstants.AppSettingNames.functionsWorkerRuntime);
    } else {
      // If functions extension version is not V1, restore the initial value for FUNCTIONS_WORKER_RUNTIME app setting (if present)
      const initialWorkerRuntime = findFormAppSettingValue(
        initialValues.appSettings,
        CommonConstants.AppSettingNames.functionsWorkerRuntime
      );
      if (initialWorkerRuntime) {
        appSettings = addOrUpdateFormAppSetting(
          values.appSettings,
          CommonConstants.AppSettingNames.functionsWorkerRuntime,
          initialWorkerRuntime
        );
      }
    }

    // Add or update WEBSITE_NODE_DEFAULT_VERSION app setting
    const nodeVersion = getNodeVersionForRuntime(newVersion);
    appSettings = addOrUpdateFormAppSetting(values.appSettings, CommonConstants.AppSettingNames.websiteNodeDefaultVersion, nodeVersion);

    // Add or update FUNCTIONS_EXTENSION_VERSION app setting
    appSettings = addOrUpdateFormAppSetting(values.appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion, newVersion);

    setFieldValue('appSettings', appSettings);
  };

  return (
    <>
      {app_write && editable && (
        <>
          {hasFunctions && (
            <MessageBar
              id="function-app-settings-runtime-version-message"
              isMultiline={true}
              className={messageBannerStyle(theme, MessageBarType.warning)}
              messageBarType={MessageBarType.warning}>
              {t('functionsRuntimeVersionExistingFunctionsWarning')}
            </MessageBar>
          )}
          <DropdownNoFormik
            placeHolder={getPlaceHolder()}
            selectedKey={runtimeMajorVersion}
            dirty={runtimeMajorVersion !== initialRuntimeMajorVersion}
            onChange={(event, option) => onDropDownChange(option ? option.key : undefined)}
            options={getOptions()}
            disabled={disableAllControls || dropDownDisabled()}
            label={t('runtimeVersion')}
            id="function-app-settings-runtime-version"
            infoBubbleMessage={
              runtimeMajorVersion === RuntimeExtensionMajorVersions.custom ? t('functionsRuntimeVersionCustomInfo') : undefined
            }
          />
        </>
      )}
    </>
  );
};

export default withTranslation('translation')(RuntimeVersion);
