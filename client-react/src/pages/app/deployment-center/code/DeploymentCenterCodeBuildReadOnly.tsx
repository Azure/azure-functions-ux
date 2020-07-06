import React, { useEffect, useContext, useState } from 'react';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { AppOs } from '../../../../models/site/site';
import LogService from '../../../../utils/LogService';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { WebAppCreateStack } from '../../../../models/available-stacks';
import { LogCategories } from '../../../../utils/LogCategories';
import { RuntimeStackSetting } from '../DeploymentCenter.types';
import { getRuntimeStackSetting } from '../utility/DeploymentCenterUtility';
import { useTranslation } from 'react-i18next';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { ScmType } from '../../../../models/site/config';

const DeploymentCenterCodeBuildReadOnly: React.FC<{}> = () => {
  const { t } = useTranslation();
  const [defaultStack, setDefaultStack] = useState<string>(t('loading'));
  const [defaultVersion, setDefaultVersion] = useState<string>(t('loading'));

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContext = useContext(DeploymentCenterContext);

  const fetchData = async () => {
    const runtimeStacksResponse = await deploymentCenterData.getRuntimeStacks(
      deploymentCenterContext.isLinuxApplication ? AppOs.linux : AppOs.windows
    );

    if (runtimeStacksResponse.metadata.success) {
      setDefaultValues(runtimeStacksResponse.data);
    } else {
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterFetchRuntimeStacks',
        `Failed to get runtime stacks with error: ${getErrorMessage(runtimeStacksResponse.metadata.error)}`
      );
    }
  };

  const getDefaultVersion = (appSelectedStack: WebAppCreateStack, defaultVersionKey: string) => {
    if (appSelectedStack.versions.length >= 1) {
      const defaultRuntimeVersionOption = appSelectedStack.versions.filter(
        version => version.supportedPlatforms[0].runtimeVersion.toLocaleLowerCase() === defaultVersionKey.toLocaleLowerCase()
      );

      if (defaultRuntimeVersionOption && defaultRuntimeVersionOption.length === 1) {
        setDefaultVersion(defaultRuntimeVersionOption[0].displayText);
      }
    }
  };

  const setDefaultValues = (runtimeStacksData: WebAppCreateStack[]) => {
    const defaultStackAndVersionKeys: RuntimeStackSetting =
      deploymentCenterContext.siteConfig && deploymentCenterContext.configMetadata && deploymentCenterContext.applicationSettings
        ? getRuntimeStackSetting(
            deploymentCenterContext.isLinuxApplication,
            deploymentCenterContext.siteConfig,
            deploymentCenterContext.configMetadata,
            deploymentCenterContext.applicationSettings
          )
        : { runtimeStack: '', runtimeVersion: '' };

    if (runtimeStacksData.length >= 1) {
      const appSelectedStack = runtimeStacksData.filter(
        stack => stack.value.toLocaleLowerCase() === defaultStackAndVersionKeys.runtimeStack.toLocaleLowerCase()
      );
      if (appSelectedStack && appSelectedStack.length === 1) {
        setDefaultStack(appSelectedStack[0].displayText);
        getDefaultVersion(appSelectedStack[0], defaultStackAndVersionKeys.runtimeVersion);
      }
    }
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showRuntimeAndVersion = () => {
    if (deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType !== ScmType.Vsts) {
      return (
        <>
          <ReactiveFormControl id="deployment-center-code-settings-runtime" label={t('deploymentCenterSettingsRuntimeLabel')}>
            <div>{defaultStack}</div>
          </ReactiveFormControl>
          <ReactiveFormControl
            id="deployment-center-code-settings-runtime-version"
            label={t('deploymentCenterSettingsRuntimeVersionLabel')}>
            <div>{defaultVersion}</div>
          </ReactiveFormControl>
        </>
      );
    }
  };

  const getBuildProvider = () => {
    let buildProviderString = t('none');
    if (deploymentCenterContext.siteConfig) {
      if (deploymentCenterContext.siteConfig.properties.scmType === ScmType.GitHubAction) {
        buildProviderString = t('deploymentCenterCodeSettingsBuildGitHubAction');
      } else if (deploymentCenterContext.siteConfig.properties.scmType === ScmType.Vsts) {
        buildProviderString = t('vstsBuildServerTitle');
      } else {
        buildProviderString = t('deploymentCenterCodeSettingsBuildKudu');
      }
    }

    return (
      <ReactiveFormControl id="deployment-center-code-settings-build" label={t('deploymentCenterSettingsBuildLabel')}>
        <div>{buildProviderString}</div>
      </ReactiveFormControl>
    );
  };

  return (
    <>
      <h3>{t('deploymentCenterSettingsBuildTitle')}</h3>
      {getBuildProvider()}
      {showRuntimeAndVersion()}
    </>
  );
};

export default DeploymentCenterCodeBuildReadOnly;
