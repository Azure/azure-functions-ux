import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { IDropdownOption } from 'office-ui-fabric-react';
import { BuildProvider, ScmTypes } from '../../../../models/site/config';
import { Field } from 'formik';
import Dropdown from '../../../../components/form-controls/DropDown';
import {
  DeploymentCenterFieldProps,
  DeploymentCenterCodeFormData,
  BuildDropdownOption,
  JavaVersions,
  RuntimeStacks,
  JavaContainers,
} from '../DeploymentCenter.types';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { WebAppCreateStack } from '../../../../models/available-stacks';

const DeploymentCenterCodeBuild: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const [selectedBuild, setSelectedBuild] = useState<BuildProvider>(BuildProvider.None);
  const [selectedRuntime, setSelectedRuntime] = useState<string | undefined>(undefined);
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(undefined);
  const [runtimeStacksData, setRuntimeStacksData] = useState<WebAppCreateStack[]>([]);
  const [runtimeOptions, setRuntimeOptions] = useState<IDropdownOption[]>([]);
  const [versionOptions, setVersionOptions] = useState<IDropdownOption[]>([]);
  const [defaultStack, setDefaultStack] = useState<string>('');
  const [defaultVersion, setDefaultVersion] = useState<string>('');
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterData = new DeploymentCenterData();

  const isGitHubSource = formProps && formProps.values.sourceProvider === ScmTypes.GitHub;

  const setStackAndVersion = () => {
    if (deploymentCenterContext.isLinuxApplication) {
      setStackAndVersionForLinux();
    } else {
      setStackAndVersionForWindows();
    }
  };

  const setStackAndVersionForWindows = () => {
    let stack = '';
    let stackVersion = '';
    if (deploymentCenterContext.configMetadata && deploymentCenterContext.configMetadata['CURRENT_STACK']) {
      const metadataStack = deploymentCenterContext.configMetadata['CURRENT_STACK'].toLowerCase();

      // NOTE(michinoy): Java is special, so need to handle it carefully. Also in this case, use
      // the string 'java' rather than any of the constants defined as it is not related to any of the
      // defined constants.
      if (metadataStack === 'java') {
        stack =
          deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.javaVersion === JavaVersions.WindowsVersion8
            ? RuntimeStacks.java8
            : RuntimeStacks.java11;
      } else {
        stack = metadataStack;
      }
    }

    if (deploymentCenterContext.applicationSettings && stack === RuntimeStacks.node) {
      stackVersion = deploymentCenterContext.applicationSettings.properties['WEBSITE_NODE_DEFAULT_VERSION'];
    } else if (deploymentCenterContext.siteConfig && stack === RuntimeStacks.python) {
      stackVersion = deploymentCenterContext.siteConfig.properties.pythonVersion;
    } else if (deploymentCenterContext.siteConfig && (stack === RuntimeStacks.java8 || stack === RuntimeStacks.java11)) {
      stackVersion = `${deploymentCenterContext.siteConfig.properties.javaVersion}|${
        deploymentCenterContext.siteConfig.properties.javaContainer
      }|${deploymentCenterContext.siteConfig.properties.javaContainerVersion}`;
    } else if (stack === '') {
      stackVersion = '';
    }

    setDefaultStack(stack);
    setDefaultVersion(stackVersion);
  };

  const setStackAndVersionForLinux = () => {
    let stack = '';
    let stackVersion = '';

    const linuxFxVersionParts =
      deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.linuxFxVersion
        ? deploymentCenterContext.siteConfig.properties.linuxFxVersion.split('|')
        : [];
    const runtimeStack = linuxFxVersionParts.length > 0 ? linuxFxVersionParts[0].toLocaleLowerCase() : '';

    // NOTE(michinoy): Java is special, so need to handle it carefully.
    if (runtimeStack === JavaContainers.JavaSE || runtimeStack === JavaContainers.Tomcat) {
      const fxVersionParts =
        deploymentCenterContext.siteConfig && !!deploymentCenterContext.siteConfig.properties.linuxFxVersion
          ? deploymentCenterContext.siteConfig.properties.linuxFxVersion.split('-')
          : [];
      const fxStack = fxVersionParts.length === 2 ? fxVersionParts[1].toLocaleLowerCase() : '';
      if (fxStack === JavaVersions.LinuxVersion8 || fxStack === JavaVersions.LinuxVersion11) {
        stack = fxStack === JavaVersions.LinuxVersion8 ? RuntimeStacks.java8 : RuntimeStacks.java11;
      } else {
        stack = '';
      }
    } else {
      stack = runtimeStack;
    }

    stackVersion =
      deploymentCenterContext.siteConfig && !!deploymentCenterContext.siteConfig.properties.linuxFxVersion
        ? deploymentCenterContext.siteConfig.properties.linuxFxVersion
        : '';

    setDefaultStack(stack);
    setDefaultVersion(stackVersion);
  };

  const fetchStacks = async () => {
    const runtimeStacksResponse = await deploymentCenterData.getRuntimeStacks(
      deploymentCenterContext.isLinuxApplication ? 'linux' : 'windows'
    );

    if (runtimeStacksResponse.metadata.success) {
      setRuntimeStacksData(runtimeStacksResponse.data);
      setRuntimeOptions(
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
      setVersionOptions(
        runtimeStack.versions.map(version => {
          return { text: version.displayText, key: version.supportedPlatforms[0].runtimeVersion };
        })
      );
    }
  };

  const updateSelectedRuntime = (e: any, option: IDropdownOption) => {
    setSelectedRuntime(option.key.toString());
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
    setStackAndVersion();
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
    if (defaultStack && runtimeOptions.length >= 1) {
      const appSelectedStack = runtimeOptions.filter(item => item.key.toString() === defaultStack.toLocaleLowerCase());
      if (appSelectedStack && appSelectedStack.length === 1) {
        // this.stackNotSupportedMessage = '';
        setSelectedRuntime(appSelectedStack[0].key.toString());
        populateVersionDropdown(appSelectedStack[0].key.toString());
      }
      // else if (defaultStack.toLocaleLowerCase() === RuntimeStacks.aspnet) {
      //   this.stackNotSupportedMessage = this._translateService.instant(PortalResources.githubActionAspNetStackNotSupportedMessage, {
      //     appName: this.wizard.slotName ? `${this.wizard.siteName} (${this.wizard.slotName})` : this.wizard.siteName,
      //   });
      // }
      // else {
      //   this.stackNotSupportedMessage = this._translateService.instant(PortalResources.githubActionStackNotSupportedMessage, {
      //     appName: this.wizard.slotName ? `${this.wizard.siteName} (${this.wizard.slotName})` : this.wizard.siteName,
      //     stack: this.wizard.stack,
      //   });
      // }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtimeOptions]);

  useEffect(() => {
    // NOTE(michinoy): once the stack versions dropdown is populated, default selection can be done in either of following ways:
    // 1. If the stack version is selected for the app and it exists in the list
    // 2. Select the first item in the list if the stack version does not exist (e.g. .NET Core) Or does not exist in the list (e.g. Node LTS)
    if (versionOptions.length >= 1) {
      const appSelectedStackVersion = versionOptions.filter(
        item => item.key.toString().toLocaleLowerCase() === defaultVersion.toLocaleLowerCase()
      );

      if (appSelectedStackVersion && appSelectedStackVersion.length === 1) {
        console.log('Hit');
        setSelectedVersion(appSelectedStackVersion[0].key.toString());
      } else {
        console.log('No hit');
        setSelectedVersion(versionOptions[0].key.toString());
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versionOptions]);

  return (
    <>
      <h3>{t('deploymentCenterSettingsBuildTitle')}</h3>
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
            options={runtimeOptions}
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
            options={versionOptions}
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
