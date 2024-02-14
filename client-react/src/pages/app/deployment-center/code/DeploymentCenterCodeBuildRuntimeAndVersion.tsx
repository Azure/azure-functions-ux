import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DeploymentCenterFieldProps,
  DeploymentCenterCodeFormData,
  RuntimeStackSetting,
  RuntimeVersionOptions,
  RuntimeStackOptions,
  DotnetRuntimeVersion,
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
import { titleWithPaddingStyle } from '../DeploymentCenter.styles';
import { SiteStateContext } from '../../../../SiteState';
import { JavaContainers as JavaContainersInterface, WebAppRuntimes, WebAppStack } from '../../../../models/stacks/web-app-stacks';
import { RuntimeStacks } from '../../../../utils/stacks-utils';
import { FunctionAppRuntimes, FunctionAppStack } from '../../../../models/stacks/function-app-stacks';
import { AppStackOs } from '../../../../models/stacks/app-stacks';
import { PortalContext } from '../../../../PortalContext';
import { ArmArray } from '../../../../models/arm-obj';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { KeyValue } from '../../../../models/portal-models';
import { Link } from '@fluentui/react';
import { AppSettingsTabs } from '../../app-settings/AppSettings.types';

type StackSettings = (WebAppRuntimes & JavaContainersInterface) | FunctionAppRuntimes;

const DeploymentCenterCodeBuildRuntimeAndVersion: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  // NOTE(michinoy): Disabling preferred array literal rule to allow '.find' operation on the runtimeStacksData.
  // tslint:disable-next-line: prefer-array-literal
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
    } else {
      portalContext.log(
        getTelemetryInfo('error', 'runtimeStacksResponse', 'failed', {
          message: getErrorMessage(runtimeStacksResponse.metadata.error),
          errorAsString: JSON.stringify(runtimeStacksResponse.metadata.error),
        })
      );
    }
  };

  const setDefaultValues = () => {
    const defaultStackAndVersion: RuntimeStackSetting = getRuntimeStackSetting(
      siteStateContext.isLinuxApp,
      siteStateContext.isFunctionApp,
      siteStateContext.isKubeApp,
      siteStateContext.isWordPressApp,
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
    const curStack = formProps.values.runtimeStack
      ? formProps.values.runtimeStack === 'dotnet-isolated'
        ? 'dotnet'
        : formProps.values.runtimeStack
      : '';
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

  const openConfigurationBlade = async () => {
    const response = await portalContext.openFrameBlade({
      detailBlade: 'SiteConfigSettingsFrameBladeReact',
      detailBladeInputs: {
        id: deploymentCenterContext.resourceId,
        data: {
          tab: AppSettingsTabs.generalSettings,
        },
      },
    });

    if (response) {
      deploymentCenterContext.refresh();
    }
  };

  const initializeFormValues = () => {
    formProps.setFieldValue('runtimeStack', '');
    formProps.setFieldValue('runtimeVersion', '');
    formProps.setFieldValue('runtimeRecommendedVersion', '');
    formProps.setFieldValue('javaContainer', '');
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

  return (
    <>
      <h3 className={titleWithPaddingStyle}>{t('deploymentCenterSettingsBuildTitle')}</h3>

      {!defaultStack || !defaultVersion ? (
        <ReactiveFormControl id="deployment-center-code-settings-runtime-stack" label={t('deploymentCenterSettingsRuntimeLabel')} required>
          <div>
            {t('deploymentCenterConfigureRuntimeMessage')}
            <Link id="deployment-center-code-settings-configure-runtime-link" onClick={openConfigurationBlade}>
              {t('deploymentCenterConfigureRuntimeLink')}
            </Link>
          </div>
        </ReactiveFormControl>
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

          {javaContainer && (
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
