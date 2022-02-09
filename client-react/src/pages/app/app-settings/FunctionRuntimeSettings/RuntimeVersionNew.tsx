// TODO (krmitta):  Rename the file after this version is tested
import { MessageBarType } from '@fluentui/react';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import DropdownNoFormik from '../../../../components/form-controls/DropDownnoFormik';
import { RuntimeExtensionMajorVersions } from '../../../../models/functions/runtime-extension';
import { SiteStateContext } from '../../../../SiteState';
import { CommonConstants } from '../../../../utils/CommonConstants';
import {
  filterFunctionAppStack,
  getFunctionAppStackObject,
  getFunctionAppStackVersion,
  isWindowsNodeApp,
} from '../../../../utils/stacks-utils';
import { AppSettingsFormProps, FormAppSetting } from '../AppSettings.types';
import { addOrUpdateFormAppSetting, removeFromAppSetting } from '../AppSettingsFormData';
import { FunctionAppStacksContext, PermissionsContext } from '../Contexts';

const RuntimeVersion: React.FC<AppSettingsFormProps> = props => {
  const { values, setFieldValue } = props;
  const { t } = useTranslation();

  const [stackSupportedRuntimeVersions, setStackSupportedRuntimeVersions] = useState<RuntimeExtensionMajorVersions[]>([]);
  const [selectedRuntimeVersion, setselectedRuntimeVersion] = useState<string>(RuntimeExtensionMajorVersions.custom);
  const [showPerformanceWarningBanner, setShowPerformanceWarningBanner] = useState(false);

  const { app_write, editable } = useContext(PermissionsContext);
  const siteStateContext = useContext(SiteStateContext);
  const functionAppStacksContext = useContext(FunctionAppStacksContext);

  const getCurrentRuntimeVersionFromAppSetting = () => {
    const appSettings = values.appSettings.filter(
      appSetting => appSetting.name === CommonConstants.AppSettingNames.functionsExtensionVersion
    );
    if (appSettings.length > 0) {
      return appSettings[0].value;
    }
    return '';
  };

  const getAndSetData = () => {
    const supportedExtensionVersionsFromStacksData = getSupportedExtensionVersions();
    let runtimeVersion = getCurrentRuntimeVersionFromAppSetting();
    let isCustomVersion = true;

    for (const extensionVersion of supportedExtensionVersionsFromStacksData) {
      if (runtimeVersion === extensionVersion) {
        isCustomVersion = false;
        break;
      }
    }

    if (isCustomVersion) {
      setShowPerformanceWarningBanner(true);
      runtimeVersion = RuntimeExtensionMajorVersions.custom;
      setStackSupportedRuntimeVersions([...supportedExtensionVersionsFromStacksData, RuntimeExtensionMajorVersions.custom]);
    } else {
      setShowPerformanceWarningBanner(false);
      setStackSupportedRuntimeVersions([...supportedExtensionVersionsFromStacksData]);
    }

    if (selectedRuntimeVersion !== runtimeVersion) {
      setselectedRuntimeVersion(runtimeVersion);
    }
  };

  const getBannerComponents = (): JSX.Element => {
    if (showPerformanceWarningBanner && stackSupportedRuntimeVersions.length > 0) {
      return (
        <CustomBanner
          message={t('functionSupportedRuntimeVersionNotConfiguredMessage').format(stackSupportedRuntimeVersions.join(','))}
          type={MessageBarType.warning}
        />
      );
    }
    if (!selectedRuntimeVersion) {
      return (
        <CustomBanner
          message={
            stackSupportedRuntimeVersions.length > 0
              ? t('functionsSupportedRuntimeVersionMissingWarningWithVersionList').format(stackSupportedRuntimeVersions.join(','))
              : t('functionsSupportedRuntimeVersionMissingWarning')
          }
          type={MessageBarType.warning}
        />
      );
    }

    return <></>;
  };

  const getSupportedExtensionVersions = (): RuntimeExtensionMajorVersions[] => {
    const currentStack = values.currentlySelectedStack;
    const isLinux = siteStateContext.isLinuxApp;
    const currentStackVersion = getFunctionAppStackVersion(values, isLinux, currentStack);

    const filteredStacks = filterFunctionAppStack(functionAppStacksContext, values, isLinux, currentStack);
    const stackObject = getFunctionAppStackObject(filteredStacks, isLinux, currentStack);

    if (!!stackObject) {
      for (const stackMajorVersion of stackObject.majorVersions) {
        for (const stackMinorVersion of stackMajorVersion.minorVersions) {
          const settings = isLinux
            ? stackMinorVersion.stackSettings.linuxRuntimeSettings
            : stackMinorVersion.stackSettings.windowsRuntimeSettings;
          if (!!settings) {
            const supportedFunctionsExtensionVersions = settings.supportedFunctionsExtensionVersions;
            if (isWindowsNodeApp(isLinux, currentStack)) {
              const nodeVersion = settings.appSettingsDictionary[CommonConstants.AppSettingNames.websiteNodeDefaultVersion];
              if (!!nodeVersion && nodeVersion === currentStackVersion) {
                return supportedFunctionsExtensionVersions;
              }
            } else if (settings.runtimeVersion === currentStackVersion) {
              return supportedFunctionsExtensionVersions;
            }
          }
        }
      }
    }
    return [];
  };

  const onDropdownChange = (newVersion?: string) => {
    if (!!newVersion) {
      let appSettings: FormAppSetting[] = [...values.appSettings];

      // Remove AZUREJOBS_EXTENSION_VERSION app setting (if present)
      appSettings = removeFromAppSetting(values.appSettings, CommonConstants.AppSettingNames.azureJobsExtensionVersion);
      appSettings = removeFromAppSetting(values.appSettings, CommonConstants.AppSettingNames.functionsWorkerRuntime);
      appSettings = addOrUpdateFormAppSetting(values.appSettings, CommonConstants.AppSettingNames.functionsWorkerRuntime, newVersion);

      setFieldValue('appSettings', appSettings);
    }
  };

  useEffect(() => {
    getAndSetData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.currentlySelectedStack, values.appSettings, values.config]);

  return (
    <>
      {app_write && editable ? (
        <>
          {getBannerComponents()}
          <DropdownNoFormik
            onChange={(_e, option) => onDropdownChange(!!option && option.key)}
            options={stackSupportedRuntimeVersions.map(version => ({
              key: version.toLocaleLowerCase(),
              text: version.toLocaleLowerCase(),
            }))}
            selectedKey={selectedRuntimeVersion}
            disabled={false}
            label={t('runtimeVersion')}
            id="function-app-settings-runtime-version"
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

export default RuntimeVersion;
