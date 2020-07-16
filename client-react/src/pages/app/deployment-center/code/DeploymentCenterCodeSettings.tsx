import React, { useContext, useState, useEffect } from 'react';
import { DeploymentCenterFieldProps, DeploymentCenterCodeFormData, WorkflowOption } from '../DeploymentCenter.types';
import DeploymentCenterGitHubDataLoader from '../github-provider/DeploymentCenterGitHubDataLoader';
import { ScmType, BuildProvider } from '../../../../models/site/config';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterGitHubReadOnly from '../github-provider/DeploymentCenterGitHubReadOnly';
import DeploymentCenterCodeBuildReadOnly from './DeploymentCenterCodeBuildReadOnly';
import DeploymentCenterCodeSourceAndBuild from './DeploymentCenterCodeSourceAndBuild';
import DeploymentCenterGitHubWorkflowConfigSelector from '../github-provider/DeploymentCenterGitHubWorkflowConfigSelector';
import DeploymentCenterGitHubWorkflowConfigPreview from '../github-provider/DeploymentCenterGitHubWorkflowConfigPreview';
import DeploymentCenterCodeBuildRuntimeAndVersion from './DeploymentCenterCodeBuildRuntimeAndVersion';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { deploymentCenterConsole, panelBanner } from '../DeploymentCenter.styles';
import { MessageBarType } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { getWorkflowInformation } from '../utility/GitHubActionUtility';
import { getWorkflowFileName } from '../utility/DeploymentCenterUtility';

const DeploymentCenterCodeSettings: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const deploymentCenterContext = useContext(DeploymentCenterContext);

  const [githubActionExistingWorkflowContents, setGithubActionExistingWorkflowContents] = useState<string>('');
  const [workflowFilePath, setWorkflowFilePath] = useState<string>('');

  const isGitHubSource = formProps.values.sourceProvider === ScmType.GitHub;
  const isGitHubActionsBuild = formProps.values.buildProvider === BuildProvider.GitHubAction;
  const isDeploymentSetup = deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType !== ScmType.None;
  const isUsingExistingOrAvailableWorkflowConfig =
    formProps.values.workflowOption === WorkflowOption.UseExistingWorkflowConfig ||
    formProps.values.workflowOption === WorkflowOption.UseAvailableWorkflowConfigs;

  const isPreviewFileButtonEnabled = () => {
    if (
      formProps.values.workflowOption === WorkflowOption.UseAvailableWorkflowConfigs ||
      formProps.values.workflowOption === WorkflowOption.UseExistingWorkflowConfig
    ) {
      return true;
    }
    if (formProps.values.workflowOption === WorkflowOption.Add || formProps.values.workflowOption === WorkflowOption.Overwrite) {
      if (formProps.values.runtimeStack && formProps.values.runtimeVersion) {
        return true;
      }
    }

    return false;
  };

  const getPreviewPanelContent = () => {
    if (deploymentCenterContext.siteDescriptor) {
      if (formProps.values.workflowOption === WorkflowOption.UseExistingWorkflowConfig) {
        return (
          <>
            <div className={panelBanner}>
              <CustomBanner message={t('githubActionWorkflowOptionUseExistingMessage')} type={MessageBarType.info} />
            </div>
            <pre className={deploymentCenterConsole}>{githubActionExistingWorkflowContents}</pre>
          </>
        );
      } else if (formProps.values.workflowOption === WorkflowOption.UseAvailableWorkflowConfigs) {
        return (
          <div className={panelBanner}>
            <CustomBanner message={t('githubActionWorkflowOptionUseExistingMessageWithoutPreview')} type={MessageBarType.info} />
          </div>
        );
      } else if (formProps.values.workflowOption === WorkflowOption.Add || formProps.values.workflowOption === WorkflowOption.Overwrite) {
        const information = getWorkflowInformation(
          formProps.values.runtimeStack,
          formProps.values.runtimeVersion,
          formProps.values.runtimeRecommendedVersion,
          formProps.values.branch,
          deploymentCenterContext.isLinuxApplication,
          formProps.values.gitHubPublishProfileSecretGuid,
          deploymentCenterContext.siteDescriptor.site,
          deploymentCenterContext.siteDescriptor.slot
        );
        return (
          <>
            <div className={panelBanner}>
              <CustomBanner message={t('githubActionWorkflowOptionOverwriteIfConfigExists')} type={MessageBarType.info} />
            </div>
            <pre className={deploymentCenterConsole}>{information.content}</pre>
          </>
        );
      }
    }
  };

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

  return (
    <>
      {isDeploymentSetup ? (
        <>
          <DeploymentCenterGitHubReadOnly />
          <DeploymentCenterCodeBuildReadOnly />
        </>
      ) : (
        <>
          <DeploymentCenterCodeSourceAndBuild formProps={formProps} />
          {isGitHubSource && (
            <>
              <DeploymentCenterGitHubDataLoader formProps={formProps} />
              {isGitHubActionsBuild && (
                <>
                  <DeploymentCenterGitHubWorkflowConfigSelector
                    formProps={formProps}
                    setGithubActionExistingWorkflowContents={setGithubActionExistingWorkflowContents}
                  />
                  {!isUsingExistingOrAvailableWorkflowConfig && <DeploymentCenterCodeBuildRuntimeAndVersion formProps={formProps} />}
                  <DeploymentCenterGitHubWorkflowConfigPreview
                    getPreviewPanelContent={getPreviewPanelContent}
                    isPreviewFileButtonEnabled={isPreviewFileButtonEnabled}
                    workflowFilePath={workflowFilePath}
                  />
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default DeploymentCenterCodeSettings;
