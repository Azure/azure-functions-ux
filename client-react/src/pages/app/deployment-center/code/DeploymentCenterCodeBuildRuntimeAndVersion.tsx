import React, { useState, useEffect, useContext } from 'react';
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
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { getRuntimeStackSetting } from '../utility/DeploymentCenterUtility';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { deploymentCenterInfoBannerDiv } from '../DeploymentCenter.styles';
import { AppOs } from '../../../../models/site/site';
import { SiteStateContext } from '../../../../SiteState';
import { WebAppStack } from '../../../../models/stacks/web-app-stacks';

const DeploymentCenterCodeBuildRuntimeAndVersion: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const [selectedRuntime, setSelectedRuntime] = useState<string | undefined>(undefined);
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(undefined);
  const [runtimeStacksData, setRuntimeStacksData] = useState<WebAppStack[]>([]);
  const [runtimeStackOptions, setRuntimeStackOptions] = useState<IDropdownOption[]>([]);
  const [runtimeVersionOptions, setRuntimeVersionOptions] = useState<IDropdownOption[]>([]);
  const [defaultStack, setDefaultStack] = useState<string>('');
  const [defaultVersion, setDefaultVersion] = useState<string>('');
  const [stackNotSupportedMessage, setStackNotSupportedMessage] = useState<string>('');
  const [stackMismatchMessage, setStackMismatchMessage] = useState<string>('');
  const [showNotSupportedWarningBar, setShowNotSupportedWarningBar] = useState(true);
  const [showMismatchWarningBar, setShowMismatchWarningBar] = useState(true);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);
  const deploymentCenterData = new DeploymentCenterData();

  const closeStackNotSupportedWarningBanner = () => {
    setShowNotSupportedWarningBar(false);
  };

  const closeStackMismatchWarningBanner = () => {
    setShowMismatchWarningBar(false);
  };

  const fetchStacks = async () => {
    const appOs = siteStateContext.isLinuxApp ? AppOs.linux : AppOs.windows;
    const runtimeStacksResponse = await deploymentCenterData.getRuntimeStacks(appOs);

    if (runtimeStacksResponse.metadata.success) {
      setRuntimeStacksData(runtimeStacksResponse.data);
      setRuntimeStackOptions(
        runtimeStacksResponse.data.map(stack => {
          return { text: stack.displayText, key: stack.value.toLocaleLowerCase() };
        })
      );
    } else {
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterFetchRuntimeStacks',
        `Failed to get runtime stacks with error: ${getErrorMessage(runtimeStacksResponse.metadata.error)}`
      );
    }
  };

  const populateVersionDropdown = (selectedStack: string) => {
    const runtimeStack = runtimeStacksData.find(stack => stack.value.toLocaleLowerCase() === selectedStack);

    if (runtimeStack) {
      let displayedVersions: IDropdownOption[] = [];

      runtimeStack.majorVersions.forEach(majorVersion => {
        majorVersion.minorVersions.forEach(minorVersion => {
          if (
            minorVersion.stackSettings.windowsRuntimeSettings &&
            minorVersion.stackSettings.windowsRuntimeSettings.gitHubActionSettings.isSupported
          ) {
            displayedVersions.push({ text: minorVersion.displayText, key: minorVersion.value });
          }

          if (
            minorVersion.stackSettings.linuxRuntimeSettings &&
            minorVersion.stackSettings.linuxRuntimeSettings.gitHubActionSettings.isSupported
          ) {
            displayedVersions.push({ text: minorVersion.displayText, key: minorVersion.value });
          }
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
    const runtimeStack = runtimeStacksData.find(stack => stack.value.toLocaleLowerCase() === selectedRuntime);
    if (runtimeStack) {
      const runtimeStackVersion = runtimeStack.majorVersions.find(version => version.minorVersions[0].value === runtimeVersionValue);
      if (runtimeStackVersion && runtimeStackVersion.minorVersions.length > 0) {
        if (runtimeStackVersion.minorVersions[0].stackSettings.windowsRuntimeSettings) {
          const recommendedVersion =
            runtimeStackVersion.minorVersions[0].stackSettings.windowsRuntimeSettings.gitHubActionSettings.supportedVersion;
          return recommendedVersion ? recommendedVersion : '';
        }
        if (runtimeStackVersion.minorVersions[0].stackSettings.linuxRuntimeSettings) {
          const recommendedVersion =
            runtimeStackVersion.minorVersions[0].stackSettings.linuxRuntimeSettings.gitHubActionSettings.supportedVersion;
          return recommendedVersion ? recommendedVersion : '';
        }
      }
    }
    return '';
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
            deploymentCenterContext.siteConfig,
            deploymentCenterContext.configMetadata,
            deploymentCenterContext.applicationSettings
          )
        : { runtimeStack: '', runtimeVersion: '' };
    setDefaultStack(defaultStackAndVersion.runtimeStack);
    setDefaultVersion(defaultStackAndVersion.runtimeVersion);
  };

  useEffect(() => {
    formProps.setFieldValue('runtimeStack', '');
    formProps.setFieldValue('runtimeVersion', '');
    formProps.setFieldValue('runtimeRecommendedVersion', '');

    setInitialDefaultValues();
    fetchStacks();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    formProps.setFieldValue('runtimeStack', '');
    formProps.setFieldValue('runtimeVersion', '');
    formProps.setFieldValue('runtimeRecommendedVersion', '');

    setDefaultSelectedRuntimeStack();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtimeStackOptions, formProps.values.buildProvider]);

  useEffect(() => {
    formProps.setFieldValue('runtimeVersion', '');
    formProps.setFieldValue('runtimeRecommendedVersion', '');

    setDefaultSelectedRuntimeVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtimeVersionOptions]);

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
      <h3>{t('deploymentCenterSettingsBuildTitle')}</h3>
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
