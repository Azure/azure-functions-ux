import React, { useState, useEffect, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IDropdownOption, MessageBarType } from 'office-ui-fabric-react';
import { BuildProvider } from '../../../../models/site/config';
import { Field } from 'formik';
import Dropdown from '../../../../components/form-controls/DropDown';
import {
  DeploymentCenterFieldProps,
  DeploymentCenterCodeFormData,
  RuntimeStackSetting,
  RuntimeVersionOptions,
} from '../DeploymentCenter.types';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { getRuntimeStackSetting, getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { deploymentCenterInfoBannerDiv, titleWithPaddingStyle } from '../DeploymentCenter.styles';
import { SiteStateContext } from '../../../../SiteState';
import { JavaContainers, WebAppRuntimes, WebAppStack } from '../../../../models/stacks/web-app-stacks';
import { RuntimeStacks } from '../../../../utils/stacks-utils';
import { FunctionAppRuntimes, FunctionAppStack } from '../../../../models/stacks/function-app-stacks';
import { AppStackOs } from '../../../../models/stacks/app-stacks';
import { KeyValue } from '../../../../models/portal-models';
import { PortalContext } from '../../../../PortalContext';
import { LogLevels } from '../../../../models/telemetry';

type StackSettings = WebAppRuntimes & JavaContainers | FunctionAppRuntimes;

const DeploymentCenterCodeBuildRuntimeAndVersion: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const [selectedRuntime, setSelectedRuntime] = useState<string | undefined>(undefined);
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(undefined);
  // NOTE(michinoy): Disabling preferred array literal rule to allow '.find' operation on the runtimeStacksData.
  // tslint:disable-next-line: prefer-array-literal
  const [runtimeStacksData, setRuntimeStacksData] = useState<Array<WebAppStack | FunctionAppStack>>([]);
  const [runtimeStackOptions, setRuntimeStackOptions] = useState<IDropdownOption[]>([]);
  const [runtimeVersionOptions, setRuntimeVersionOptions] = useState<IDropdownOption[]>([]);
  const [defaultStack, setDefaultStack] = useState<string>('');
  const [defaultVersion, setDefaultVersion] = useState<string>('');
  const [stackNotSupportedMessage, setStackNotSupportedMessage] = useState<string>('');
  const [stackMismatchMessage, setStackMismatchMessage] = useState<string>('');
  const [showNotSupportedWarningBar, setShowNotSupportedWarningBar] = useState(true);
  const [showMismatchWarningBar, setShowMismatchWarningBar] = useState(true);

  // NOTE(michinoy): aggregate a cache of os, runtimestack, minor version, and github action
  // recommended version mapping. This will make the look up post selection of dropdowns much
  // simpler.
  const gitHubActionRuntimeVersionMapping = useRef<KeyValue<string>>({});

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);
  const portalContext = useContext(PortalContext);
  const deploymentCenterData = new DeploymentCenterData();

  const closeStackNotSupportedWarningBanner = () => {
    setShowNotSupportedWarningBar(false);
  };

  const closeStackMismatchWarningBanner = () => {
    setShowMismatchWarningBar(false);
  };

  const fetchStacks = async () => {
    const appOs = siteStateContext.isLinuxApp ? AppStackOs.linux : AppStackOs.windows;

    portalContext.log(
      getTelemetryInfo(LogLevels.info, 'fetchStacks', 'submit', {
        appType: siteStateContext.isFunctionApp ? 'functionApp' : 'webApp',
        os: appOs,
      })
    );

    const runtimeStacksResponse = siteStateContext.isFunctionApp
      ? await deploymentCenterData.getFunctionAppRuntimeStacks(appOs)
      : await deploymentCenterData.getWebAppRuntimeStacks(appOs);

    if (runtimeStacksResponse.metadata.success) {
      // NOTE(michinoy): Disabling preferred array literal rule to allow '.map' operation on the runtimeStacksData.
      // tslint:disable-next-line: prefer-array-literal
      const runtimeStacks = runtimeStacksResponse.data as Array<WebAppStack | FunctionAppStack>;
      setRuntimeStacksData(runtimeStacks);
      setRuntimeStackOptions(
        runtimeStacks.map(stack => {
          return { text: stack.displayText, key: stack.value.toLocaleLowerCase() };
        })
      );
    } else {
      portalContext.log(
        getTelemetryInfo(LogLevels.error, 'runtimeStacksResponse', 'failed', {
          message: getErrorMessage(runtimeStacksResponse.metadata.error),
          errorAsString: JSON.stringify(runtimeStacksResponse.metadata.error),
        })
      );
    }
  };

  const populateVersionDropdown = (selectedStack: string) => {
    const runtimeStack = runtimeStacksData.find(stack => stack.value.toLocaleLowerCase() === selectedStack);

    if (runtimeStack) {
      const displayedVersions: IDropdownOption[] = [];

      runtimeStack.majorVersions.forEach(majorVersion => {
        majorVersion.minorVersions.forEach(minorVersion => {
          addGitHubActionRuntimeVersionMapping(selectedStack, minorVersion.value, minorVersion.stackSettings);

          let value = minorVersion.value;

          value =
            siteStateContext.isLinuxApp &&
            minorVersion.stackSettings.linuxRuntimeSettings &&
            minorVersion.stackSettings.linuxRuntimeSettings.runtimeVersion
              ? minorVersion.stackSettings.linuxRuntimeSettings.runtimeVersion
              : value;

          value =
            !siteStateContext.isLinuxApp &&
            minorVersion.stackSettings.windowsRuntimeSettings &&
            minorVersion.stackSettings.windowsRuntimeSettings.runtimeVersion
              ? minorVersion.stackSettings.windowsRuntimeSettings.runtimeVersion
              : value;

          displayedVersions.push({ text: minorVersion.displayText, key: value.toLocaleLowerCase() });
        });
      });

      setRuntimeVersionOptions(displayedVersions);
    }
  };

  const updateStackMismatchMessage = () => {
    if (deploymentCenterContext.siteDescriptor) {
      const siteName = deploymentCenterContext.siteDescriptor.site;
      const slotName = deploymentCenterContext.siteDescriptor.slot;
      setShowMismatchWarningBar(true);
      setStackMismatchMessage(
        t('githubActionStackMismatchMessage', {
          appName: slotName ? `${siteName} (${slotName})` : siteName,
          stack: defaultStack,
        })
      );
    } else {
      setStackMismatchMessage('');
    }
  };

  const updateSelectedRuntime = (e: any, option: IDropdownOption) => {
    setSelectedRuntime(option.key.toString());
    formProps.setFieldValue('runtimeStack', option.key.toString());

    // NOTE(michinoy): Show a warning message if the user selects a stack which does not match what their app is configured with.
    if (defaultStack && option.key.toString() !== defaultStack.toLocaleLowerCase() && !stackNotSupportedMessage) {
      updateStackMismatchMessage();
    } else {
      setStackMismatchMessage('');
    }

    populateVersionDropdown(option.key.toString());
  };

  const updateSelectedVersion = (e: any, option: IDropdownOption) => {
    setSelectedVersion(option.key.toString());

    formProps.setFieldValue('runtimeVersion', option.key.toString());
    formProps.setFieldValue(
      'runtimeRecommendedVersion',
      getRuntimeStackRecommendedVersion(formProps.values.runtimeStack, option.key.toString())
    );
  };

  const getRuntimeStackRecommendedVersion = (stackValue: string, runtimeVersionValue: string): string => {
    const key = generateGitHubActionRuntimeVersionMappingKey(siteStateContext.isLinuxApp, stackValue, runtimeVersionValue);

    return gitHubActionRuntimeVersionMapping.current[key] ? gitHubActionRuntimeVersionMapping.current[key] : runtimeVersionValue;
  };

  const setDefaultSelectedRuntimeVersion = () => {
    // NOTE(michinoy): once the stack versions dropdown is populated, default selection can be done in either of following ways:
    // 1. If the stack version is selected for the app and it exists in the list
    // 2. Select the first item in the list if the stack version does not exist (e.g. .NET Core) Or does not exist in the list (e.g. Node LTS)
    let defaultRuntimeVersion = defaultVersion;
    if (defaultRuntimeVersion.toLocaleLowerCase() === RuntimeVersionOptions.Java11) {
      defaultRuntimeVersion = '11.0';
    } else if (defaultRuntimeVersion.toLocaleLowerCase() === RuntimeVersionOptions.Java8) {
      defaultRuntimeVersion = '8.0';
    }

    if (runtimeVersionOptions.length >= 1) {
      const defaultRuntimeVersionOption = runtimeVersionOptions.filter(
        item => item.key.toString().toLocaleLowerCase() === defaultRuntimeVersion.toLocaleLowerCase()
      );

      if (defaultRuntimeVersionOption && defaultRuntimeVersionOption.length === 1) {
        setSelectedVersion(defaultRuntimeVersionOption[0].key.toString());
        formProps.setFieldValue('runtimeVersion', defaultRuntimeVersionOption[0].key.toString());
        formProps.setFieldValue(
          'runtimeRecommendedVersion',
          getRuntimeStackRecommendedVersion(formProps.values.runtimeStack, defaultRuntimeVersionOption[0].key.toString())
        );
      } else {
        setSelectedVersion(runtimeVersionOptions[0].key.toString());
        formProps.setFieldValue('runtimeVersion', runtimeVersionOptions[0].key.toString());
        formProps.setFieldValue(
          'runtimeRecommendedVersion',
          getRuntimeStackRecommendedVersion(formProps.values.runtimeStack, runtimeVersionOptions[0].key.toString())
        );
      }
    }
  };

  const updateStackNotSupportedMessage = () => {
    if (deploymentCenterContext.siteDescriptor) {
      const siteName = deploymentCenterContext.siteDescriptor.site;
      const slotName = deploymentCenterContext.siteDescriptor.slot;
      setShowNotSupportedWarningBar(true);
      setStackNotSupportedMessage(
        t('githubActionStackNotSupportedMessage', { appName: slotName ? `${siteName} (${slotName})` : siteName, stack: defaultStack })
      );
    } else {
      setStackNotSupportedMessage('');
    }
  };

  const setDefaultSelectedRuntimeStack = () => {
    // NOTE(michinoy): Once the dropdown is populated, preselect stack that the user had selected during create.
    // If the users app was built using a stack that is not supported, show a warning message.
    if (formProps.values.buildProvider === BuildProvider.GitHubAction && defaultStack && runtimeStackOptions.length >= 1) {
      const appSelectedStack = runtimeStackOptions.filter(item => item.key.toString() === defaultStack.toLocaleLowerCase());

      if (appSelectedStack && appSelectedStack.length === 1) {
        const appSelectedStackKey = appSelectedStack[0].key.toString();
        setStackNotSupportedMessage('');
        setStackMismatchMessage('');
        setSelectedRuntime(appSelectedStackKey);
        formProps.setFieldValue('runtimeStack', appSelectedStackKey);
        populateVersionDropdown(appSelectedStackKey);
      } else {
        updateStackNotSupportedMessage();
      }
    }
  };

  const setInitialDefaultValues = () => {
    const defaultStackAndVersion: RuntimeStackSetting =
      deploymentCenterContext.siteConfig && deploymentCenterContext.configMetadata && deploymentCenterContext.applicationSettings
        ? getRuntimeStackSetting(
            siteStateContext.isLinuxApp,
            siteStateContext.isFunctionApp,
            deploymentCenterContext.siteConfig,
            deploymentCenterContext.configMetadata,
            deploymentCenterContext.applicationSettings
          )
        : { runtimeStack: '', runtimeVersion: '' };
    setDefaultStack(defaultStackAndVersion.runtimeStack);
    setDefaultVersion(defaultStackAndVersion.runtimeVersion);
  };

  const addGitHubActionRuntimeVersionMapping = (stack: string, minorVersion: string, stackSettings: StackSettings) => {
    // NOTE(michinoy): Try our best to get the GitHub Action recommended version from the stacks API. At worst case,
    // select the minor version. Do not fail at this point, like this in case if a new stack is incorrectly added, we can
    // always fall back on the minor version instead of blocking or messing customers workflow file.
    const key = generateGitHubActionRuntimeVersionMappingKey(siteStateContext.isLinuxApp, stack, minorVersion);
    let version = minorVersion;

    if (stackSettings.linuxRuntimeSettings) {
      version = stackSettings.linuxRuntimeSettings.gitHubActionSettings.supportedVersion
        ? stackSettings.linuxRuntimeSettings.gitHubActionSettings.supportedVersion
        : minorVersion;
    } else if (stackSettings.windowsRuntimeSettings) {
      version = stackSettings.windowsRuntimeSettings.gitHubActionSettings.supportedVersion
        ? stackSettings.windowsRuntimeSettings.gitHubActionSettings.supportedVersion
        : minorVersion;
    }

    gitHubActionRuntimeVersionMapping.current[key] = version;
  };

  const generateGitHubActionRuntimeVersionMappingKey = (isLinuxApp: boolean, stack: string, minorVersion: string): string => {
    const os = isLinuxApp ? AppStackOs.linux : AppStackOs.windows;
    return `${os}-${stack.toLocaleLowerCase()}-${minorVersion.toLocaleLowerCase()}`;
  };

  useEffect(() => {
    formProps.setFieldValue('runtimeStack', '');
    formProps.setFieldValue('runtimeVersion', '');
    formProps.setFieldValue('runtimeRecommendedVersion', '');
    formProps.setFieldValue('javaContainer', '');

    setInitialDefaultValues();
    fetchStacks();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    formProps.setFieldValue('runtimeStack', '');
    formProps.setFieldValue('runtimeVersion', '');
    formProps.setFieldValue('runtimeRecommendedVersion', '');
    formProps.setFieldValue('javaContainer', '');

    setDefaultSelectedRuntimeStack();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtimeStackOptions, formProps.values.buildProvider]);

  useEffect(() => {
    formProps.setFieldValue('runtimeVersion', '');
    formProps.setFieldValue('runtimeRecommendedVersion', '');

    setDefaultSelectedRuntimeVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtimeVersionOptions]);

  useEffect(() => {
    // Set java container as needed.
    if (deploymentCenterContext.siteConfig && formProps.values.runtimeStack && formProps.values.runtimeStack === RuntimeStacks.java) {
      const siteConfigJavaContainer = siteStateContext.isLinuxApp
        ? deploymentCenterContext.siteConfig.properties.linuxFxVersion.toLowerCase().split('|')[0]
        : deploymentCenterContext.siteConfig.properties.javaContainer &&
          deploymentCenterContext.siteConfig.properties.javaContainer.toLowerCase();

      formProps.setFieldValue('javaContainer', siteConfigJavaContainer);
    } else {
      formProps.setFieldValue('javaContainer', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.runtimeStack]);

  const getCustomBanner = () => {
    return (
      <>
        {stackNotSupportedMessage && showNotSupportedWarningBar && (
          <div className={deploymentCenterInfoBannerDiv}>
            <CustomBanner
              message={stackNotSupportedMessage}
              type={MessageBarType.warning}
              onDismiss={closeStackNotSupportedWarningBanner}
            />
          </div>
        )}
        {stackMismatchMessage && showMismatchWarningBar && (
          <div className={deploymentCenterInfoBannerDiv}>
            <CustomBanner message={stackMismatchMessage} type={MessageBarType.warning} onDismiss={closeStackMismatchWarningBanner} />
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <h3 className={titleWithPaddingStyle}>{t('deploymentCenterSettingsBuildTitle')}</h3>
      {getCustomBanner()}
      <Field
        id="deployment-center-code-settings-runtime-option"
        label={t('deploymentCenterSettingsRuntimeLabel')}
        name="runtimeStack"
        component={Dropdown}
        displayInVerticalLayout={true}
        options={runtimeStackOptions}
        selectedKey={selectedRuntime}
        onChange={updateSelectedRuntime}
        required={true}
      />
      <Field
        id="deployment-center-code-settings-runtime-version-option"
        label={t('deploymentCenterSettingsRuntimeVersionLabel')}
        name="runtimeVersion"
        component={Dropdown}
        displayInVerticalLayout={true}
        options={runtimeVersionOptions}
        selectedKey={selectedVersion}
        onChange={updateSelectedVersion}
        required={true}
      />
    </>
  );
};

export default DeploymentCenterCodeBuildRuntimeAndVersion;
