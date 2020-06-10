import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { IDropdownOption, MessageBarType } from 'office-ui-fabric-react';
import { BuildProvider, ScmTypes } from '../../../../models/site/config';
import { Field } from 'formik';
import Dropdown from '../../../../components/form-controls/DropDown';
import {
  DeploymentCenterFieldProps,
  DeploymentCenterCodeFormData,
  BuildDropdownOption,
  StackAndVersion,
  RuntimeStacks,
} from '../DeploymentCenter.types';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { WebAppCreateStack } from '../../../../models/available-stacks';
import { setStackAndVersion } from '../utility/DeploymentCenterUtility';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { deploymentCenterInfoBannerDiv } from '../DeploymentCenter.styles';

const DeploymentCenterCodeBuild: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const [selectedBuild, setSelectedBuild] = useState<BuildProvider>(BuildProvider.None);
  const [selectedRuntime, setSelectedRuntime] = useState<string | undefined>(undefined);
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(undefined);
  const [runtimeStacksData, setRuntimeStacksData] = useState<WebAppCreateStack[]>([]);
  const [runtimeStackOptions, setRuntimeStackOptions] = useState<IDropdownOption[]>([]);
  const [runtimeVersionOptions, setRuntimeVersionOptions] = useState<IDropdownOption[]>([]);
  const [defaultStack, setDefaultStack] = useState<string>('');
  const [defaultVersion, setDefaultVersion] = useState<string>('');
  const [stackNotSupportedMessage, setStackNotSupportedMessage] = useState<string>('');
  const [stackMismatchMessage, setStackMismatchMessage] = useState<string>('');
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterData = new DeploymentCenterData();

  const isGitHubSource = formProps && formProps.values.sourceProvider === ScmTypes.GitHub;

  const fetchStacks = async () => {
    const runtimeStacksResponse = await deploymentCenterData.getRuntimeStacks(
      deploymentCenterContext.isLinuxApplication ? 'linux' : 'windows'
    );

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

  const updateSelectedBuild = (e: any, option: BuildDropdownOption) => {
    setSelectedBuild(option.buildType);
    if (formProps) {
      formProps.setFieldValue('buildProvider', option.buildType);
    }
  };

  const populateVersionDropdown = (selectedStack: string) => {
    const runtimeStack = runtimeStacksData.find(stack => stack.value.toLocaleLowerCase() === selectedStack);

    if (runtimeStack) {
      setRuntimeVersionOptions(
        runtimeStack.versions.map(version => {
          return { text: version.displayText, key: version.supportedPlatforms[0].runtimeVersion };
        })
      );
    }
  };

  const updateSelectedRuntime = (e: any, option: IDropdownOption) => {
    setSelectedRuntime(option.key.toString());

    // NOTE(michinoy): Show a warning message if the user selects a stack which does not match what their app is configured with.
    if (
      defaultStack &&
      option.key.toString() !== defaultStack.toLocaleLowerCase() &&
      !stackNotSupportedMessage &&
      deploymentCenterContext.siteDescriptor
    ) {
      const siteName = deploymentCenterContext.siteDescriptor.site;
      const slotName = deploymentCenterContext.siteDescriptor.slot;
      if (defaultStack.toLocaleLowerCase() === RuntimeStacks.aspnet) {
        setStackMismatchMessage(
          t('githubActionAspNetStackMismatchMessage', { appName: slotName ? `${siteName} (${slotName})` : siteName })
        );
      } else {
        setStackMismatchMessage(
          t('githubActionStackMismatchMessage', {
            appName: slotName ? `${siteName} (${slotName})` : siteName,
            stack: defaultStack,
          })
        );
      }
    } else {
      setStackMismatchMessage('');
    }

    populateVersionDropdown(option.key.toString());
  };

  const updateSelectedVersion = (e: any, option: IDropdownOption) => {
    setSelectedVersion(option.key.toString());
  };

  const buildOptions: BuildDropdownOption[] = [
    { key: BuildProvider.GitHubAction, text: t('deploymentCenterCodeSettingsBuildGitHubAction'), buildType: BuildProvider.GitHubAction },
    {
      key: BuildProvider.AppServiceBuildService,
      text: t('deploymentCenterCodeSettingsBuildKudu'),
      buildType: BuildProvider.AppServiceBuildService,
    },
  ];

  useEffect(() => {
    const defaultStackAndVersion: StackAndVersion = setStackAndVersion(
      deploymentCenterContext.isLinuxApplication,
      deploymentCenterContext.siteConfig,
      deploymentCenterContext.configMetadata,
      deploymentCenterContext.applicationSettings
    );
    setDefaultStack(defaultStackAndVersion.runtimeStack);
    setDefaultVersion(defaultStackAndVersion.runtimeVersion);
    fetchStacks();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => {
      if (formProps && formProps.values.sourceProvider !== ScmTypes.GitHub) {
        setSelectedBuild(BuildProvider.AppServiceBuildService);
        formProps.setFieldValue('buildProvider', BuildProvider.AppServiceBuildService);
      }

      if (formProps && formProps.values.sourceProvider === ScmTypes.GitHub) {
        setSelectedBuild(BuildProvider.GitHubAction);
        formProps.setFieldValue('buildProvider', BuildProvider.GitHubAction);
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    formProps ? [formProps.values.sourceProvider] : []
  );

  useEffect(() => {
    // NOTE(michinoy): Once the dropdown is populated, preselect stack that the user had selected during create.
    // If the users app was built using a stack that is not supported, show a warning message.
    if (
      selectedBuild === BuildProvider.GitHubAction &&
      defaultStack &&
      runtimeStackOptions.length >= 1 &&
      deploymentCenterContext.siteDescriptor
    ) {
      const appSelectedStack = runtimeStackOptions.filter(item => item.key.toString() === defaultStack.toLocaleLowerCase());

      const siteName = deploymentCenterContext.siteDescriptor.site;
      const slotName = deploymentCenterContext.siteDescriptor.slot;

      if (appSelectedStack && appSelectedStack.length === 1) {
        setStackNotSupportedMessage('');
        setStackMismatchMessage('');
        setSelectedRuntime(appSelectedStack[0].key.toString());
        populateVersionDropdown(appSelectedStack[0].key.toString());
      } else if (defaultStack.toLocaleLowerCase() === RuntimeStacks.aspnet) {
        setStackNotSupportedMessage(
          t('githubActionAspNetStackNotSupportedMessage', { appName: slotName ? `${siteName} (${slotName})` : siteName })
        );
      } else {
        setStackNotSupportedMessage(
          t('githubActionStackNotSupportedMessage', { appName: slotName ? `${siteName} (${slotName})` : siteName, stack: defaultStack })
        );
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtimeStackOptions, selectedBuild]);

  useEffect(() => {
    // NOTE(michinoy): once the stack versions dropdown is populated, default selection can be done in either of following ways:
    // 1. If the stack version is selected for the app and it exists in the list
    // 2. Select the first item in the list if the stack version does not exist (e.g. .NET Core) Or does not exist in the list (e.g. Node LTS)
    if (runtimeVersionOptions.length >= 1) {
      const appSelectedStackVersion = runtimeVersionOptions.filter(
        item => item.key.toString().toLocaleLowerCase() === defaultVersion.toLocaleLowerCase()
      );

      if (appSelectedStackVersion && appSelectedStackVersion.length === 1) {
        setSelectedVersion(appSelectedStackVersion[0].key.toString());
      } else {
        setSelectedVersion(runtimeVersionOptions[0].key.toString());
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtimeVersionOptions]);

  return (
    <>
      <h3>{t('deploymentCenterSettingsBuildTitle')}</h3>
      {formProps && formProps.values.buildProvider === BuildProvider.GitHubAction && (
        <>
          {stackNotSupportedMessage && (
            <div className={deploymentCenterInfoBannerDiv}>
              <CustomBanner message={stackNotSupportedMessage} type={MessageBarType.warning} />
            </div>
          )}
          {stackMismatchMessage && (
            <div className={deploymentCenterInfoBannerDiv}>
              <CustomBanner message={stackMismatchMessage} type={MessageBarType.warning} />
            </div>
          )}
        </>
      )}
      <Field
        id="deployment-center-container-settings-build-option"
        label={t('deploymentCenterSettingsBuildLabel')}
        name="buildProvider"
        component={Dropdown}
        displayInVerticalLayout={true}
        options={buildOptions}
        selectedKey={selectedBuild}
        onChange={updateSelectedBuild}
        required={true}
        disabled={!isGitHubSource}
      />
      {formProps && formProps.values.buildProvider === BuildProvider.GitHubAction && (
        <>
          <Field
            id="deployment-center-container-settings-runtime-option"
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
            id="deployment-center-container-settings-runtime-version-option"
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
      )}
    </>
  );
};

export default DeploymentCenterCodeBuild;
