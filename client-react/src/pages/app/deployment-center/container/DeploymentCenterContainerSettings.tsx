import React, { useState, useContext, useEffect } from 'react';
import DeploymentCenterContainerSource from './DeploymentCenterContainerSource';
import {
  ContainerRegistrySources,
  DeploymentCenterFieldProps,
  DeploymentCenterContainerFormData,
  WorkflowOption,
} from '../DeploymentCenter.types';
import { ScmType } from '../../../../models/site/config';
import DeploymentCenterContainerRegistrySettings from './DeploymentCenterContainerRegistrySettings';
import DeploymentCenterContainerDockerHubSettings from './DeploymentCenterContainerDockeHubSettings';
import DeploymentCenterContainerPrivateRegistrySettings from './DeploymentCenterContainerPrivateRegistrySettings';
import DeploymentCenterGitHubDataLoader from '../github-provider/DeploymentCenterGitHubDataLoader';
import DeploymentCenterContainerAcrDataLoader from './DeploymentCenterContainerAcrDataLoader';
import DeploymentCenterGitHubWorkflowConfigSelector from '../github-provider/DeploymentCenterGitHubWorkflowConfigSelector';
import DeploymentCenterGitHubWorkflowConfigPreview from '../github-provider/DeploymentCenterGitHubWorkflowConfigPreview';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { useTranslation } from 'react-i18next';
import { getWorkflowFileName } from '../utility/DeploymentCenterUtility';
import { Guid } from '../../../../utils/Guid';
import { getContainerAppWorkflowInformation } from '../utility/GitHubActionUtility';

const DeploymentCenterContainerSettings: React.FC<DeploymentCenterFieldProps<DeploymentCenterContainerFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const [githubActionExistingWorkflowContents, setGithubActionExistingWorkflowContents] = useState<string>('');
  const [workflowFilePath, setWorkflowFilePath] = useState<string>('');
  const [isPreviewFileButtonDisabled, setIsPreviewFileButtonDisabled] = useState(false);
  const [workflowFileContent, setWorkflowFileContent] = useState('');
  const [panelMessage, setPanelMessage] = useState('');

  const deploymentCenterContext = useContext(DeploymentCenterContext);

  const isGitHubActionEnabled = formProps.values.scmType === ScmType.GitHubAction;
  const isAcrConfigured = formProps.values.registrySource === ContainerRegistrySources.acr;
  const isDockerHubConfigured = formProps.values.registrySource === ContainerRegistrySources.docker;
  const isPrivateRegistryConfigured = formProps.values.registrySource === ContainerRegistrySources.privateRegistry;

  useEffect(() => {
    if (deploymentCenterContext.siteDescriptor) {
      if (formProps.values.workflowOption === WorkflowOption.UseExistingWorkflowConfig) {
        setPanelMessage(t('githubActionWorkflowOptionUseExistingMessage'));
        setWorkflowFileContent(githubActionExistingWorkflowContents);
      } else if (formProps.values.workflowOption === WorkflowOption.UseAvailableWorkflowConfigs) {
        setPanelMessage(t('githubActionWorkflowOptionUseExistingMessageWithoutPreview'));
      } else if (formProps.values.workflowOption === WorkflowOption.Add || formProps.values.workflowOption === WorkflowOption.Overwrite) {
        const information = getContainerAppWorkflowInformation(
          formProps.values.serverUrl,
          formProps.values.image,
          formProps.values.branch,
          formProps.values.gitHubPublishProfileSecretGuid,
          formProps.values.gitHubContainerUsernameSecretGuid,
          formProps.values.gitHubContainerPasswordSecretGuid,
          deploymentCenterContext.siteDescriptor.site,
          deploymentCenterContext.siteDescriptor.slot
        );
        setPanelMessage(t('githubActionWorkflowOptionOverwriteIfConfigExists'));
        setWorkflowFileContent(information.content);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    deploymentCenterContext.siteDescriptor,
    formProps.values.workflowOption,
    formProps.values.serverUrl,
    formProps.values.image,
    formProps.values.branch,
  ]);

  useEffect(() => {
    const imageOmissionAllowed =
      formProps.values.workflowOption === WorkflowOption.UseAvailableWorkflowConfigs ||
      formProps.values.workflowOption === WorkflowOption.UseExistingWorkflowConfig;

    const formFilled =
      formProps.values.workflowOption !== WorkflowOption.None &&
      formProps.values.serverUrl &&
      formProps.values.username &&
      formProps.values.password &&
      (formProps.values.image || imageOmissionAllowed);

    setIsPreviewFileButtonDisabled(formProps.values.workflowOption === WorkflowOption.None || !formFilled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formProps.values.workflowOption,
    formProps.values.serverUrl,
    formProps.values.username,
    formProps.values.password,
    formProps.values.image,
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

  return (
    <>
      <DeploymentCenterContainerSource />

      {isGitHubActionEnabled && (
        <>
          <DeploymentCenterGitHubDataLoader formProps={formProps} />{' '}
          <DeploymentCenterGitHubWorkflowConfigSelector
            formProps={formProps}
            setGithubActionExistingWorkflowContents={setGithubActionExistingWorkflowContents}
          />
        </>
      )}

      <DeploymentCenterContainerRegistrySettings {...props} />

      {isAcrConfigured && <DeploymentCenterContainerAcrDataLoader {...props} />}

      {isDockerHubConfigured && <DeploymentCenterContainerDockerHubSettings {...props} />}

      {isPrivateRegistryConfigured && <DeploymentCenterContainerPrivateRegistrySettings {...props} />}

      {isGitHubActionEnabled && (
        <DeploymentCenterGitHubWorkflowConfigPreview
          isPreviewFileButtonDisabled={isPreviewFileButtonDisabled}
          workflowFilePath={workflowFilePath}
          workflowFileContent={workflowFileContent}
          panelMessage={panelMessage}
        />
      )}
    </>
  );
};

export default DeploymentCenterContainerSettings;
