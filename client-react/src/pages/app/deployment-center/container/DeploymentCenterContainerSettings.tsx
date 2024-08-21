import React, { useState, useContext, useEffect } from 'react';
import DeploymentCenterContainerSource from './DeploymentCenterContainerSource';
import {
  ContainerRegistrySources,
  DeploymentCenterFieldProps,
  DeploymentCenterContainerFormData,
  WorkflowOption,
  AppType,
  PublishType,
} from '../DeploymentCenter.types';
import { ScmType } from '../../../../models/site/config';
import DeploymentCenterContainerRegistrySettings from './DeploymentCenterContainerRegistrySettings';
import DeploymentCenterContainerDockerHubSettings from './DeploymentCenterContainerDockerHubSettings';
import DeploymentCenterContainerPrivateRegistrySettings from './DeploymentCenterContainerPrivateRegistrySettings';
import DeploymentCenterGitHubDataLoader from '../github-provider/DeploymentCenterGitHubDataLoader';
import DeploymentCenterContainerAcrDataLoader from './DeploymentCenterContainerAcrDataLoader';
import DeploymentCenterGitHubWorkflowConfigSelector from '../github-provider/DeploymentCenterGitHubWorkflowConfigSelector';
import DeploymentCenterGitHubWorkflowConfigPreview from '../github-provider/DeploymentCenterGitHubWorkflowConfigPreview';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { useTranslation } from 'react-i18next';
import { getTelemetryInfo, getWorkflowFileName } from '../utility/DeploymentCenterUtility';
import { Guid } from '../../../../utils/Guid';
import DeploymentCenterContainerContinuousDeploymentSettings from './DeploymentCenterContainerContinuousDeploymentSettings';
import { DeploymentCenterConstants } from '../DeploymentCenterConstants';
import DeploymentCenterGitHubConfiguredView from '../github-provider/DeploymentCenterGitHubConfiguredView';
import DeploymentCenterContainerSettingsReadOnlyView from './DeploymentCenterContainerSettingsReadOnlyView';
import { SiteStateContext } from '../../../../SiteState';
import DeploymentCenterVstsBuildProvider from '../devops-provider/DeploymentCenterVstsBuildProvider';
import { ProgressIndicator } from '@fluentui/react';
import { AppOs } from '../../../../models/site/site';
import DeploymentCenterData from '../DeploymentCenter.data';
import { PortalContext } from '../../../../PortalContext';
import { CommonConstants } from '../../../../utils/CommonConstants';

const DeploymentCenterContainerSettings: React.FC<DeploymentCenterFieldProps<DeploymentCenterContainerFormData>> = props => {
  const { formProps, isDataRefreshing } = props;
  const { t } = useTranslation();
  const [githubActionExistingWorkflowContents, setGithubActionExistingWorkflowContents] = useState<string>('');
  const [workflowFilePath, setWorkflowFilePath] = useState<string>('');
  const [isPreviewFileButtonDisabled, setIsPreviewFileButtonDisabled] = useState(false);
  const [panelMessage, setPanelMessage] = useState('');
  const [showGitHubActionReadOnlyView, setShowGitHubActionReadOnlyView] = useState(false);
  const [showSourceSelectionOption, setShowSourceSelectionOption] = useState(false);

  // NOTE(michinoy): The serverUrl, image, username, and password are retrieved from  one of three sources:
  // acr, dockerHub, or privateRegistry.
  // These values are used in combination with GitHub Action workflow selection to show the preview panel for the
  // workflow file. Using useState hooks here to aggregate each property from their respective sources.
  const [serverUrl, setServerUrl] = useState('');
  const [image, setImage] = useState('');
  const [username, setUsername] = useState('');
  const [password, SetPassword] = useState('');

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);
  const portalContext = useContext(PortalContext);
  const deploymentCenterData = new DeploymentCenterData();

  const isGitHubActionSelected = formProps.values.scmType === ScmType.GitHubAction;
  const isVstsSelected = formProps.values.scmType === ScmType.Vsts;
  const isAcrConfigured = formProps.values.registrySource === ContainerRegistrySources.acr && !formProps.values.privateRegistryUsername;
  const isDockerHubConfigured = formProps.values.registrySource === ContainerRegistrySources.docker;
  const isPrivateRegistryConfigured = formProps.values.registrySource === ContainerRegistrySources.privateRegistry;

  const getWorkflowFileVariables = () => {
    const slotName = deploymentCenterContext.siteDescriptor?.slot ?? '';
    const siteName = deploymentCenterContext.siteDescriptor?.site ?? '';
    const loginServer = serverUrl.toLocaleLowerCase();

    // NOTE(stpelleg): For dockerHub the server URL contains /v1 at the end.
    // The server used in the image should not have that part.
    const server =
      loginServer.indexOf(DeploymentCenterConstants.dockerHubServerUrlHost) > -1
        ? DeploymentCenterConstants.dockerHubServerUrlHost
        : loginServer.replace(CommonConstants.DeploymentCenterConstants.https, '');
    return {
      siteName: slotName ? `${siteName}(${slotName})` : siteName,
      slotName: slotName || CommonConstants.production,
      branch: formProps.values.branch || CommonConstants.master,
      publishingProfileSecretName: `AzureAppService_PublishProfile_${formProps.values.gitHubPublishProfileSecretGuid}`,
      loginServer: loginServer,
      publishServer: server,
      image: image,
      containerUserSecretName: `AzureAppService_ContainerUsername_${formProps.values.gitHubContainerUsernameSecretGuid}`,
      containerPasswordSecretName: `AzureAppService_ContainerPassword_${formProps.values.gitHubContainerPasswordSecretGuid}`,
    };
  };

  const getWorkflowFileContent = async () => {
    if (deploymentCenterContext.siteDescriptor) {
      if (formProps.values.workflowOption === WorkflowOption.UseExistingWorkflowConfig) {
        return githubActionExistingWorkflowContents;
      } else if (formProps.values.workflowOption === WorkflowOption.Add || formProps.values.workflowOption === WorkflowOption.Overwrite) {
        const variables = getWorkflowFileVariables();
        const appType = siteStateContext.isFunctionApp ? AppType.FunctionApp : AppType.WebApp;
        const os = siteStateContext.isLinuxApp ? AppOs.linux : AppOs.windows;

        const getWorkflowFile = await deploymentCenterData.getWorkflowFile(appType, PublishType.Container, os, variables);
        if (getWorkflowFile.metadata.success) {
          return getWorkflowFile.data;
        } else {
          portalContext.log(
            getTelemetryInfo('error', 'getWorkflowFile', 'failed', {
              appType: appType,
              publishType: PublishType.Code,
              os: os,
              branch: variables.branch,
            })
          );
          return t('deploymentCenterWorkflowError');
        }
      }
    }

    return '';
  };

  useEffect(() => {
    if (formProps.values.workflowOption === WorkflowOption.UseExistingWorkflowConfig) {
      setPanelMessage(t('githubActionWorkflowOptionUseExistingMessage'));
    } else if (formProps.values.workflowOption === WorkflowOption.UseAvailableWorkflowConfigs) {
      setPanelMessage(t('githubActionWorkflowOptionUseExistingMessageWithoutPreview'));
    } else if (formProps.values.workflowOption === WorkflowOption.Add || formProps.values.workflowOption === WorkflowOption.Overwrite) {
      setPanelMessage(t('githubActionWorkflowOptionOverwriteIfConfigExists'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.workflowOption]);

  useEffect(() => {
    const useAvailableOrExisting =
      formProps.values.workflowOption === WorkflowOption.UseAvailableWorkflowConfigs ||
      (formProps.values.workflowOption === WorkflowOption.UseExistingWorkflowConfig && githubActionExistingWorkflowContents);

    const formFilled =
      (formProps.values.workflowOption !== WorkflowOption.None && serverUrl && username && password && image) || useAvailableOrExisting;

    setIsPreviewFileButtonDisabled(formProps.values.workflowOption === WorkflowOption.None || !formFilled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.workflowOption, githubActionExistingWorkflowContents, serverUrl, image, username, password]);

  useEffect(() => {
    if (formProps.values.registrySource === ContainerRegistrySources.acr) {
      setServerUrl(`https://${formProps.values.acrLoginServer}`);
    } else if (formProps.values.registrySource === ContainerRegistrySources.privateRegistry) {
      setServerUrl(formProps.values.privateRegistryServerUrl);
    } else {
      setServerUrl(DeploymentCenterConstants.dockerHubServerUrl);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.registrySource, formProps.values.acrLoginServer, formProps.values.privateRegistryServerUrl]);

  useEffect(() => {
    if (formProps.values.registrySource === ContainerRegistrySources.acr && formProps.values.acrImage) {
      setImage(formProps.values.acrImage);
    } else if (
      formProps.values.registrySource === ContainerRegistrySources.privateRegistry &&
      formProps.values.privateRegistryImageAndTag
    ) {
      const imageAndTagParts = formProps.values.privateRegistryImageAndTag.split(':');
      setImage(imageAndTagParts[0]);
    } else if (formProps.values.dockerHubImageAndTag) {
      const imageAndTagParts = formProps.values.dockerHubImageAndTag.split(':');
      setImage(imageAndTagParts[0]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formProps.values.registrySource,
    formProps.values.acrImage,
    formProps.values.dockerHubImageAndTag,
    formProps.values.privateRegistryImageAndTag,
  ]);

  useEffect(() => {
    if (formProps.values.registrySource === ContainerRegistrySources.acr) {
      setUsername(formProps.values.acrUsername);
    } else if (formProps.values.registrySource === ContainerRegistrySources.privateRegistry) {
      setUsername(formProps.values.privateRegistryUsername);
    } else {
      setUsername(formProps.values.dockerHubUsername);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formProps.values.registrySource,
    formProps.values.acrUsername,
    formProps.values.dockerHubUsername,
    formProps.values.privateRegistryUsername,
  ]);

  useEffect(() => {
    if (formProps.values.registrySource === ContainerRegistrySources.acr) {
      SetPassword(formProps.values.acrPassword);
    } else if (formProps.values.registrySource === ContainerRegistrySources.privateRegistry) {
      SetPassword(formProps.values.privateRegistryPassword);
    } else {
      SetPassword(formProps.values.dockerHubPassword);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formProps.values.registrySource,
    formProps.values.acrPassword,
    formProps.values.dockerHubPassword,
    formProps.values.privateRegistryPassword,
  ]);

  useEffect(() => {
    if (
      deploymentCenterContext.siteDescriptor &&
      (formProps.values.workflowOption === WorkflowOption.UseExistingWorkflowConfig ||
        formProps.values.workflowOption === WorkflowOption.Add ||
        formProps.values.workflowOption === WorkflowOption.Overwrite)
    ) {
      const workflowFileName = getWorkflowFileName(
        formProps.values.branch,
        deploymentCenterContext.siteDescriptor.site,
        deploymentCenterContext.siteDescriptor.slot
      );
      setWorkflowFilePath(`.github/workflows/${workflowFileName}`);
    } else {
      setWorkflowFilePath('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.workflowOption]);

  useEffect(() => {
    // NOTE(michinoy): In case of having GitHub Action based integrate for containers
    // the container registry username and password need to be added as secrets on
    // the GitHub repo.
    if (formProps.values.scmType === ScmType.GitHubAction) {
      formProps.setFieldValue(
        'gitHubPublishProfileSecretGuid',
        Guid.newGuid()
          .toLowerCase()
          .replace(/[-]/g, '')
      );

      formProps.setFieldValue(
        'gitHubContainerUsernameSecretGuid',
        Guid.newGuid()
          .toLowerCase()
          .replace(/[-]/g, '')
      );

      formProps.setFieldValue(
        'gitHubContainerPasswordSecretGuid',
        Guid.newGuid()
          .toLowerCase()
          .replace(/[-]/g, '')
      );
    } else {
      formProps.setFieldValue('gitHubPublishProfileSecretGuid', '');
      formProps.setFieldValue('gitHubContainerUsernameSecretGuid', '');
      formProps.setFieldValue('gitHubContainerPasswordSecretGuid', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.scmType]);

  useEffect(() => {
    const showReadOnlyView =
      !!deploymentCenterContext &&
      !!deploymentCenterContext.siteConfig &&
      deploymentCenterContext.siteConfig.properties.scmType === ScmType.GitHubAction;

    setShowGitHubActionReadOnlyView(showReadOnlyView);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext.siteConfig]);

  useEffect(() => {
    setShowSourceSelectionOption(!!siteStateContext);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteStateContext.isLinuxApp]);

  const renderSetupView = () => {
    return (
      <>
        {showSourceSelectionOption && <DeploymentCenterContainerSource formProps={formProps} />}

        {isGitHubActionSelected && (
          <>
            <DeploymentCenterGitHubDataLoader isGitHubActions={isGitHubActionSelected} formProps={formProps} />{' '}
            <DeploymentCenterGitHubWorkflowConfigSelector
              formProps={formProps}
              setGithubActionExistingWorkflowContents={setGithubActionExistingWorkflowContents}
            />
          </>
        )}

        {isVstsSelected && <DeploymentCenterVstsBuildProvider />}

        {!isVstsSelected && (
          <>
            <DeploymentCenterContainerRegistrySettings {...props} />

            {isAcrConfigured && <DeploymentCenterContainerAcrDataLoader {...props} />}

            {isDockerHubConfigured && <DeploymentCenterContainerDockerHubSettings {...props} />}

            {isPrivateRegistryConfigured && <DeploymentCenterContainerPrivateRegistrySettings {...props} />}

            {!isGitHubActionSelected && <DeploymentCenterContainerContinuousDeploymentSettings {...props} />}
          </>
        )}

        {isGitHubActionSelected && (
          <DeploymentCenterGitHubWorkflowConfigPreview
            isPreviewFileButtonDisabled={isPreviewFileButtonDisabled}
            getWorkflowFileContent={getWorkflowFileContent}
            workflowFilePath={workflowFilePath}
            panelMessage={panelMessage}
          />
        )}
      </>
    );
  };

  const renderGitHubActionReadOnlyView = () => {
    return (
      <>
        <DeploymentCenterGitHubConfiguredView formProps={formProps} />
        <DeploymentCenterContainerSettingsReadOnlyView />
      </>
    );
  };

  const getSettingsControls = () => (showGitHubActionReadOnlyView ? renderGitHubActionReadOnlyView() : renderSetupView());

  const getProgressIndicator = () => (
    <ProgressIndicator description={t('deploymentCenterSettingsLoading')} ariaValueText={t('deploymentCenterSettingsLoadingAriaValue')} />
  );

  return isDataRefreshing ? getProgressIndicator() : getSettingsControls();
};

export default DeploymentCenterContainerSettings;
