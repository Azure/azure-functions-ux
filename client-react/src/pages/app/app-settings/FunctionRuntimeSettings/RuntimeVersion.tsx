import React, { useContext, useState } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { FormAppSetting, AppSettingsFormProps, LoadingStates } from '../AppSettings.types';
import { PermissionsContext } from '../Contexts';
import { addOrUpdateFormAppSetting, findFormAppSettingValue, removeFormAppSetting } from '../AppSettingsFormData';
import { CommonConstants } from '../../../../utils/CommonConstants';
import DropdownNoFormik from '../../../../components/form-controls/DropDownnoFormik';
import { IDropdownOption, MessageBarType } from 'office-ui-fabric-react';
import { RuntimeExtensionMajorVersions } from '../../../../models/functions/runtime-extension';
import { FunctionsRuntimeVersionHelper } from '../../../../utils/FunctionsRuntimeVersionHelper';
import { isLinuxApp } from '../../../../utils/arm-utils';
import { HostStates } from '../../../../models/functions/host-status';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';

const isVersionChangeSafe = (newVersion: RuntimeExtensionMajorVersions, oldVersion: RuntimeExtensionMajorVersions | null) => {
  if (oldVersion === RuntimeExtensionMajorVersions.custom || newVersion === RuntimeExtensionMajorVersions.custom) {
    // If the user is setting a customer version, we assume they know what they're doing.
    return true;
  }

  switch (oldVersion) {
    case RuntimeExtensionMajorVersions.v1:
      // For V1, changing major versions is not supported.
      return newVersion === RuntimeExtensionMajorVersions.v1;
    case RuntimeExtensionMajorVersions.v2:
    case RuntimeExtensionMajorVersions.v3:
      // For V2 and V3, switching between V2 and V3 is supported.
      return newVersion === RuntimeExtensionMajorVersions.v2 || newVersion === RuntimeExtensionMajorVersions.v3;
    case null:
      return true;
    default:
      return false;
  }
};

const RuntimeVersion: React.FC<AppSettingsFormProps & WithTranslation> = props => {
  const [pendingVersion, setPendingVersion] = useState<RuntimeExtensionMajorVersions | undefined>(undefined);
  const { t, values, initialValues, asyncData, setFieldValue } = props;
  const { app_write, editable, saving } = useContext(PermissionsContext);
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
      return t('loadingFailed');
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

    return [
      {
        key: RuntimeExtensionMajorVersions.v1,
        text: RuntimeExtensionMajorVersions.v1,
        disabled: isLinuxApp(values.site),
      },
      {
        key: RuntimeExtensionMajorVersions.v2,
        text: RuntimeExtensionMajorVersions.v2,
      },
      {
        key: RuntimeExtensionMajorVersions.v3,
        text: RuntimeExtensionMajorVersions.v3,
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

  const isExistingFunctionsWarningNeeded = (newVersion: RuntimeExtensionMajorVersions) =>
    hasFunctions && !isVersionChangeSafe(newVersion, getRuntimeVersionInUse());

  const onDropDownChange = (newVersion: RuntimeExtensionMajorVersions) => {
    if (isExistingFunctionsWarningNeeded(newVersion)) {
      setPendingVersion(newVersion);
    } else {
      updateDropDownValue(newVersion);
    }
  };

  const onVersionChangeConfirm = () => {
    updateDropDownValue(pendingVersion!);
    setPendingVersion(undefined);
  };

  const onVersionChangeDismiss = () => {
    setPendingVersion(undefined);
  };

  const updateDropDownValue = (newVersion: RuntimeExtensionMajorVersions) => {
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

  const customVersionMessage =
    runtimeMajorVersion === RuntimeExtensionMajorVersions.custom ? t('functionsRuntimeVersionCustomInfo') : undefined;

  const existingFunctionsMessage = isExistingFunctionsWarningNeeded(runtimeMajorVersion)
    ? t('functionsRuntimeVersionExistingFunctionsWarning').format(getRuntimeVersionInUse(), runtimeMajorVersion)
    : undefined;

  return (
    <>
      {app_write && editable ? (
        <>
          <ConfirmDialog
            primaryActionButton={{
              title: t('continue'),
              onClick: onVersionChangeConfirm,
            }}
            defaultActionButton={{
              title: t('cancel'),
              onClick: onVersionChangeDismiss,
            }}
            title={t('functionsRuntimeVersionExistingFunctionsConfirmationTitle')}
            content={t('functionsRuntimeVersionExistingFunctionsConfirmationMessage').format(getRuntimeVersionInUse(), pendingVersion)}
            hidden={!pendingVersion}
            onDismiss={onVersionChangeDismiss}
          />
          {existingFunctionsMessage && (
            <CustomBanner
              id="function-app-settings-runtime-version-message"
              message={existingFunctionsMessage}
              type={MessageBarType.warning}
              undocked={true}
            />
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
            infoBubbleMessage={customVersionMessage}
          />
        </>
      ) : (
        <DropdownNoFormik
          onChange={() => null}
          options={[]}
          disabled={true}
          label={t('runtimeVersion')}
          id="function-app-settings-runtime-version"
        />
      )}
    </>
  );
};

export default withTranslation('translation')(RuntimeVersion);
