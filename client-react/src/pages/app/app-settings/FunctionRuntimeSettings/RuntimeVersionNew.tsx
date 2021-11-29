// TODO (krmitta):  Rename the file after this version is tested
import React, { useContext, useEffect, useState } from 'react';
import { RuntimeExtensionMajorVersions } from '../../../../models/functions/runtime-extension';
import { SiteStateContext } from '../../../../SiteState';
import { CommonConstants } from '../../../../utils/CommonConstants';
import {
  filterFunctionAppStack,
  getFunctionAppStackObject,
  getFunctionAppStackVersion,
  isWindowsNodeApp,
} from '../../../../utils/stacks-utils';
import { AppSettingsFormProps } from '../AppSettings.types';
import { FunctionAppStacksContext } from '../Contexts';

const RuntimeVersion: React.FC<AppSettingsFormProps> = props => {
  const { values } = props;

  const [stackSupportedRuntimeVersions, setStackSupportedRuntimeVersions] = useState<RuntimeExtensionMajorVersions[]>([]);
  const [selectedRuntimeVersion, setselectedRuntimeVersion] = useState<string>(RuntimeExtensionMajorVersions.custom);

  const siteStateContext = useContext(SiteStateContext);
  const functionAppStacksContext = useContext(FunctionAppStacksContext);

  const getCurrentRuntimeVersionFromAppSetting = () => {
    const supportedRuntimeVersions = getSupportedExtensionVersions();
    const appSettings = values.appSettings;
    const runtimeVersionFromAppSetting =
      !!appSettings && appSettings[CommonConstants.AppSettingNames.functionsExtensionVersion]
        ? appSettings[CommonConstants.AppSettingNames.functionsExtensionVersion]
        : '';
    for (const runtimeVersion of supportedRuntimeVersions) {
      if (runtimeVersionFromAppSetting === runtimeVersion) {
        return runtimeVersionFromAppSetting;
      }
    }
    return RuntimeExtensionMajorVersions.custom;
  };

  const getAndSetData = () => {
    const supportedExtensionVersionsFromStacksData = getSupportedExtensionVersions();
    const runtimeVersion = getCurrentRuntimeVersionFromAppSetting();
    if (selectedRuntimeVersion !== runtimeVersion) {
      setselectedRuntimeVersion(runtimeVersion);
    }

    if (runtimeVersion === RuntimeExtensionMajorVersions.custom) {
      setStackSupportedRuntimeVersions([...supportedExtensionVersionsFromStacksData, RuntimeExtensionMajorVersions.custom]);
    } else {
      setStackSupportedRuntimeVersions([...supportedExtensionVersionsFromStacksData]);
    }
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

  useEffect(() => {
    getAndSetData();
    console.log(stackSupportedRuntimeVersions);
    console.log(selectedRuntimeVersion);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.currentlySelectedStack, values.appSettings, values.config]);

  return <></>;
};

export default RuntimeVersion;
