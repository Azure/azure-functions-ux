import React, { useState, useEffect, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DeploymentCenterFieldProps,
  DeploymentCenterCodeFormData,
  RuntimeStackSetting,
  RuntimeVersionOptions,
  RuntimeStackOptions,
  DotnetRuntimeVersion,
  JavaContainers,
} from '../DeploymentCenter.types';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import {
  getDefaultVersionDisplayName,
  getJavaContainerDisplayName,
  getRuntimeStackDisplayName,
  getRuntimeStackSetting,
  getTelemetryInfo,
} from '../utility/DeploymentCenterUtility';
import { deploymentCenterInfoBannerDiv, titleWithPaddingStyle } from '../DeploymentCenter.styles';
import { SiteStateContext } from '../../../../SiteState';
import { JavaContainers as JavaContainersInterface, WebAppRuntimes, WebAppStack } from '../../../../models/stacks/web-app-stacks';
import { RuntimeStacks } from '../../../../utils/stacks-utils';
import { FunctionAppRuntimes, FunctionAppStack } from '../../../../models/stacks/function-app-stacks';
import { AppStackOs } from '../../../../models/stacks/app-stacks';
import { PortalContext } from '../../../../PortalContext';
import { ArmArray } from '../../../../models/arm-obj';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { KeyValue } from '../../../../models/portal-models';
import { Field } from 'formik';
import { IDropdownOption, MessageBarType } from '@fluentui/react';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
// import { BuildProvider } from '../../../../models/site/config';
import Dropdown from '../../../../components/form-controls/DropDown';

type StackSettings = (WebAppRuntimes & JavaContainersInterface) | FunctionAppRuntimes;

const DeploymentCenterCodeBuildRuntimeAndVersion: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  // NOTE(michinoy): Disabling preferred array literal rule to allow '.find' operation on the runtimeStacksData.
  // tslint:disable-next-line: prefer-array-literal
  const [selectedRuntime, setSelectedRuntime] = useState<string | undefined>(undefined);
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(undefined);
  const [runtimeStackOptions, setRuntimeStackOptions] = useState<IDropdownOption[]>([]);
  const [runtimeVersionOptions, setRuntimeVersionOptions] = useState<IDropdownOption[]>([]);
  const [javaContainerOptions, setJavaContainerOptions] = useState<IDropdownOption[]>([]);
  const [stackMismatchMessage, setStackMismatchMessage] = useState<string>('');
  const [showMismatchWarningBar, setShowMismatchWarningBar] = useState(true);
  const gitHubActionRuntimeVersionMapping = useRef<KeyValue<string>>({});
  const [runtimeStacksData, setRuntimeStacksData] = useState<Array<WebAppStack | FunctionAppStack>>([]);
  const [defaultStack, setDefaultStack] = useState<string>('');
  const [defaultVersion, setDefaultVersion] = useState<string>('');
  const [javaContainer, setJavaContainer] = useState<string>('');

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);
  const portalContext = useContext(PortalContext);
  const deploymentCenterData = new DeploymentCenterData();

  const fetchStacks = async () => {
    const appOs = siteStateContext.isLinuxApp || siteStateContext.isKubeApp ? AppStackOs.linux : AppStackOs.windows;

    portalContext.log(
      getTelemetryInfo('info', 'fetchStacks', 'submit', {
        appType: siteStateContext.isFunctionApp ? 'functionApp' : 'webApp',
        os: appOs,
      })
    );

    const runtimeStacksResponse = siteStateContext.isFunctionApp
      ? await deploymentCenterData.getFunctionAppRuntimeStacks(appOs)
      : await deploymentCenterData.getWebAppRuntimeStacks(appOs);

    if (runtimeStacksResponse.metadata.success) {
      const runtimeStacks = (runtimeStacksResponse.data as ArmArray<WebAppStack | FunctionAppStack>).value.map(stack => stack.properties);
      setRuntimeStacksData(runtimeStacks);
      setRuntimeStackOptions(
        runtimeStacks.map(stack => {
          return { text: stack.displayText, key: stack.value.toLocaleLowerCase() };
        })
      );
    } else {
      portalContext.log(
        getTelemetryInfo('error', 'runtimeStacksResponse', 'failed', {
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
          let value = minorVersion.value;
          value =
            (siteStateContext.isLinuxApp || siteStateContext.isKubeApp) &&
            minorVersion.stackSettings.linuxRuntimeSettings &&
            minorVersion.stackSettings.linuxRuntimeSettings.runtimeVersion
              ? minorVersion.stackSettings.linuxRuntimeSettings.runtimeVersion
              : value;
          value =
            !siteStateContext.isLinuxApp &&
            !siteStateContext.isKubeApp &&
            minorVersion.stackSettings.windowsRuntimeSettings &&
            minorVersion.stackSettings.windowsRuntimeSettings.runtimeVersion
              ? minorVersion.stackSettings.windowsRuntimeSettings.runtimeVersion
              : value;

          addGitHubActionRuntimeVersionMapping(
            selectedStack,
            value.toLocaleLowerCase(),
            minorVersion.stackSettings,
            gitHubActionRuntimeVersionMapping.current
          );
          displayedVersions.push({ text: minorVersion.displayText, key: value.toLocaleLowerCase() });
        });
      });

      setRuntimeVersionOptions(displayedVersions);
    }
  };

  const populateJavaContainerDropdown = () => {
    const items = [
      { key: JavaContainers.JavaSE, text: getJavaContainerDisplayName(JavaContainers.JavaSE) },
      { key: JavaContainers.JBoss, text: getJavaContainerDisplayName(JavaContainers.JBoss) },
      { key: JavaContainers.Tomcat, text: getJavaContainerDisplayName(JavaContainers.Tomcat) },
    ];

    setJavaContainerOptions(items);
  };

  const updateJavaContainer = () => {
    if (deploymentCenterContext.siteConfig && formProps.values.runtimeStack && formProps.values.runtimeStack === RuntimeStacks.java) {
      const siteConfigJavaContainer = siteStateContext.isLinuxApp
        ? deploymentCenterContext.siteConfig.properties.linuxFxVersion.toLowerCase().split('|')[0]
        : deploymentCenterContext.siteConfig.properties.javaContainer &&
          deploymentCenterContext.siteConfig.properties.javaContainer.toLowerCase();

      formProps.setFieldValue('javaContainer', siteConfigJavaContainer);
      setJavaContainer(getJavaContainerDisplayName(siteConfigJavaContainer));
    } else {
      formProps.setFieldValue('javaContainer', '');
      setJavaContainer('');
    }
  };

  const setGitHubActionsRecommendedVersion = () => {
    // NOTE(michinoy): Try our best to get the GitHub Action recommended version from the stacks API. At worst case,
    // select the minor version. Do not fail at this point, like this in case if a new stack is incorrectly added, we can
    // always fall back on the minor version instead of blocking or messing customers workflow file.
    const gitHubActionRuntimeVersionMapping: KeyValue<string> = {};
    const curStack = formProps.values.runtimeStack || '';
    const runtimeStack = runtimeStacksData.find(stack => stack.value.toLocaleLowerCase() === curStack);

    if (runtimeStack) {
      runtimeStack.majorVersions.forEach(majorVersion => {
        majorVersion.minorVersions.forEach(minorVersion => {
          let value = minorVersion.value;

          value =
            (siteStateContext.isLinuxApp || siteStateContext.isKubeApp) &&
            minorVersion.stackSettings.linuxRuntimeSettings &&
            minorVersion.stackSettings.linuxRuntimeSettings.runtimeVersion
              ? minorVersion.stackSettings.linuxRuntimeSettings.runtimeVersion
              : value;

          value =
            !siteStateContext.isLinuxApp &&
            !siteStateContext.isKubeApp &&
            minorVersion.stackSettings.windowsRuntimeSettings &&
            minorVersion.stackSettings.windowsRuntimeSettings.runtimeVersion
              ? minorVersion.stackSettings.windowsRuntimeSettings.runtimeVersion
              : value;

          addGitHubActionRuntimeVersionMapping(
            curStack,
            value.toLocaleLowerCase(),
            minorVersion.stackSettings,
            gitHubActionRuntimeVersionMapping
          );
        });
      });
    }

    //Note (stpelleg): Java is different
    let curVersion = formProps.values.runtimeVersion || '';
    if (curVersion === '11.0') {
      curVersion = '11';
    } else if (curVersion === '8.0') {
      curVersion = '8';
    }

    const key = generateGitHubActionRuntimeVersionMappingKey(siteStateContext.isLinuxApp, curStack, curVersion);
    const version = gitHubActionRuntimeVersionMapping[key] ? gitHubActionRuntimeVersionMapping[key] : curVersion;
    formProps.setFieldValue('runtimeRecommendedVersion', version);
  };

  const addGitHubActionRuntimeVersionMapping = (
    stack: string,
    minorVersion: string,
    stackSettings: StackSettings,
    gitHubActionRuntimeVersionMapping: KeyValue<string>
  ) => {
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

      //NOTE(stpelleg): Need to get Dotnet version from runtime settings if ASPNET
      if (!!stack && stack.toLocaleLowerCase() === RuntimeStackOptions.Dotnet) {
        const dotnetversion =
          !!stackSettings.windowsRuntimeSettings && !!stackSettings.windowsRuntimeSettings.runtimeVersion
            ? stackSettings.windowsRuntimeSettings.runtimeVersion
            : '';
        if (!!dotnetversion && (dotnetversion === DotnetRuntimeVersion.aspNetv4 || dotnetversion === DotnetRuntimeVersion.aspNetv2)) {
          version = dotnetversion;
        }
      }
    }

    gitHubActionRuntimeVersionMapping[key] = version;
  };

  const generateGitHubActionRuntimeVersionMappingKey = (isLinuxApp: boolean, stack: string, minorVersion: string): string => {
    const os = isLinuxApp ? AppStackOs.linux : AppStackOs.windows;
    return `${os}-${stack.toLocaleLowerCase()}-${minorVersion.toLocaleLowerCase()}`;
  };

  const getRuntimeStackRecommendedVersion = (stackValue: string, runtimeVersionValue: string): string => {
    const key = generateGitHubActionRuntimeVersionMappingKey(siteStateContext.isLinuxApp, stackValue, runtimeVersionValue);

    return gitHubActionRuntimeVersionMapping.current[key] || runtimeVersionValue;
  };

  const initializeFormValues = () => {
    formProps.setFieldValue('runtimeStack', '');
    formProps.setFieldValue('runtimeVersion', '');
    formProps.setFieldValue('runtimeRecommendedVersion', '');
    formProps.setFieldValue('javaContainer', '');
  };

  const setDefaultValues = () => {
    const defaultStackAndVersion: RuntimeStackSetting = getRuntimeStackSetting(
      siteStateContext.isLinuxApp,
      siteStateContext.isFunctionApp,
      siteStateContext.isKubeApp,
      deploymentCenterContext.siteConfig,
      deploymentCenterContext.configMetadata,
      deploymentCenterContext.applicationSettings
    );

    //Note (stpelleg): Java is different
    if (defaultStackAndVersion.runtimeVersion.toLocaleLowerCase() === RuntimeVersionOptions.Java17) {
      defaultStackAndVersion.runtimeVersion = '17.0';
    } else if (defaultStackAndVersion.runtimeVersion.toLocaleLowerCase() === RuntimeVersionOptions.Java11) {
      defaultStackAndVersion.runtimeVersion = '11.0';
    } else if (
      defaultStackAndVersion.runtimeVersion.toLocaleLowerCase() === RuntimeVersionOptions.Java8 ||
      defaultStackAndVersion.runtimeVersion.toLocaleLowerCase() === RuntimeVersionOptions.Java8Linux
    ) {
      defaultStackAndVersion.runtimeVersion = '8.0';
    }

    formProps.setFieldValue('runtimeStack', defaultStackAndVersion.runtimeStack);
    formProps.setFieldValue('runtimeVersion', defaultStackAndVersion.runtimeVersion.toLocaleLowerCase());

    setDefaultStack(getRuntimeStackDisplayName(defaultStackAndVersion.runtimeStack));
    setDefaultVersion(getDefaultVersionDisplayName(defaultStackAndVersion.runtimeVersion, siteStateContext.isLinuxApp));
  };

  const updateSelectedRuntime = (e: any, option: IDropdownOption) => {
    setSelectedRuntime(option.key.toString());
    formProps.setFieldValue('runtimeStack', option.key.toString());

    // NOTE(michinoy): Show a warning message if the user selects a stack which does not match what their app is configured with.
    if (defaultStack && option.key.toString() !== defaultStack.toLocaleLowerCase()) {
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

    if (selectedRuntime === RuntimeStackOptions.Java) {
      populateJavaContainerDropdown();
    }
  };

  const updateSelectedJavaContainer = (e: any, option: IDropdownOption) => {
    setJavaContainer(option.key.toString());

    formProps.setFieldValue('javaContainer', option.key.toString());
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

  const closeStackMismatchWarningBanner = () => {
    setShowMismatchWarningBar(false);
  };

  useEffect(() => {
    initializeFormValues();
    fetchStacks();
    setDefaultValues();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!!defaultStack && runtimeStacksData.length > 0) {
      updateJavaContainer();
      setGitHubActionsRecommendedVersion();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultStack, runtimeStacksData]);

  const getCustomBanner = () => {
    return (
      <>
        {stackMismatchMessage && showMismatchWarningBar && (
          <div className={deploymentCenterInfoBannerDiv}>
            <CustomBanner
              id="stack-mismatch-message"
              message={stackMismatchMessage}
              type={MessageBarType.warning}
              onDismiss={closeStackMismatchWarningBanner}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <h3 className={titleWithPaddingStyle}>{t('deploymentCenterSettingsBuildTitle')}</h3>

      {getCustomBanner()}

      {!defaultStack && !defaultVersion ? (
        <>
          <Field
            label={t('deploymentCenterSettingsRuntimeLabel')}
            placeholder={t('deploymentCenterRuntimeStackPlaceholder')}
            name="runtimeStack"
            component={Dropdown}
            displayInVerticalLayout={true}
            options={runtimeStackOptions}
            selectedKey={selectedRuntime}
            onChange={updateSelectedRuntime}
            required={true}
            aria-required={true}
          />
          <Field
            label={t('deploymentCenterSettingsRuntimeVersionLabel')}
            placeholder={t('deploymentCenterRuntimeVersionPlaceholder')}
            name="runtimeVersion"
            component={Dropdown}
            displayInVerticalLayout={true}
            options={runtimeVersionOptions}
            selectedKey={selectedVersion}
            onChange={updateSelectedVersion}
            required={true}
            aria-required={true}
          />

          {selectedRuntime === RuntimeStackOptions.Java && (
            <Field
              label={t('javaContainer')}
              placeholder={t('deploymentCenterJavaContainerPlaceholder')}
              name="javaContainer"
              component={Dropdown}
              displayInVerticalLayout={true}
              options={javaContainerOptions}
              selectedKey={javaContainer}
              onChange={updateSelectedJavaContainer}
              required={true}
              aria-required={true}
            />
          )}
        </>
      ) : (
        <>
          <ReactiveFormControl id="deployment-center-code-settings-runtime-stack" label={t('deploymentCenterSettingsRuntimeLabel')}>
            <div>{defaultStack}</div>
          </ReactiveFormControl>

          <ReactiveFormControl
            id="deployment-center-code-settings-runtime-version"
            label={t('deploymentCenterSettingsRuntimeVersionLabel')}>
            <div>{defaultVersion}</div>
          </ReactiveFormControl>

          {!!javaContainer && (
            <ReactiveFormControl id="deployment-center-code-settings-java-container" label={t('deploymentCenterJavaWebServerStack')}>
              <div>{javaContainer}</div>
            </ReactiveFormControl>
          )}
        </>
      )}
    </>
  );
};

export default DeploymentCenterCodeBuildRuntimeAndVersion;
