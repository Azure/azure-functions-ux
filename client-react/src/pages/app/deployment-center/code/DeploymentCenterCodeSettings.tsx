import React, { useContext, useState, useEffect } from 'react';
import { DeploymentCenterFieldProps, DeploymentCenterCodeFormData, WorkflowOption } from '../DeploymentCenter.types';
import DeploymentCenterGitHubDataLoader from '../github-provider/DeploymentCenterGitHubDataLoader';
import DeploymentCenterBitbucketDataLoader from '../bitbucket-provider/DeploymentCenterBitbucketDataLoader';
import { ScmType, BuildProvider } from '../../../../models/site/config';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterGitHubConfiguredView from '../github-provider/DeploymentCenterGitHubConfiguredView';
import DeploymentCenterCodeBuildConfiguredView from './DeploymentCenterCodeBuildConfiguredView';
import DeploymentCenterCodeSourceAndBuild from './DeploymentCenterCodeSourceAndBuild';
import DeploymentCenterGitHubWorkflowConfigSelector from '../github-provider/DeploymentCenterGitHubWorkflowConfigSelector';
import DeploymentCenterGitHubWorkflowConfigPreview from '../github-provider/DeploymentCenterGitHubWorkflowConfigPreview';
import DeploymentCenterCodeBuildRuntimeAndVersion from './DeploymentCenterCodeBuildRuntimeAndVersion';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { deploymentCenterConsole, panelBanner } from '../DeploymentCenter.styles';
import { MessageBarType, Link } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { getWorkflowInformation } from '../utility/GitHubActionUtility';
import { getWorkflowFileName } from '../utility/DeploymentCenterUtility';
import DeploymentCenterCodeSourceKuduConfiguredView from './DeploymentCenterCodeSourceKuduConfiguredView';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { SiteStateContext } from '../../../../SiteState';

const DeploymentCenterCodeSettings: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);

  const [githubActionExistingWorkflowContents, setGithubActionExistingWorkflowContents] = useState<string>('');
  const [workflowFilePath, setWorkflowFilePath] = useState<string>('');

  const isGitHubSource = formProps.values.sourceProvider === ScmType.GitHub;
  const isBitbucketSource = formProps.values.sourceProvider === ScmType.BitbucketGit;
  const isGitHubActionsBuild = formProps.values.buildProvider === BuildProvider.GitHubAction;
  const isDeploymentSetup = deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType !== ScmType.None;
  const isGitHubActionsSetup =
    deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.GitHubAction;
  const isGitHubSourceSetup =
    deploymentCenterContext.siteConfig &&
    (deploymentCenterContext.siteConfig.properties.scmType === ScmType.GitHubAction ||
      deploymentCenterContext.siteConfig.properties.scmType === ScmType.GitHub);
  const isUsingExistingOrAvailableWorkflowConfig =
    formProps.values.workflowOption === WorkflowOption.UseExistingWorkflowConfig ||
    formProps.values.workflowOption === WorkflowOption.UseAvailableWorkflowConfigs;

  const closeInfoBanner = () => {
    setShowInfoBanner(false);
  };

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
            {showInfoBanner && (
              <div className={panelBanner}>
                <CustomBanner
                  message={t('githubActionWorkflowOptionUseExistingMessage')}
                  type={MessageBarType.info}
                  onDismiss={closeInfoBanner}
                />
              </div>
            )}
            <pre className={deploymentCenterConsole}>{githubActionExistingWorkflowContents}</pre>
          </>
        );
      } else if (formProps.values.workflowOption === WorkflowOption.UseAvailableWorkflowConfigs) {
        return (
          <>
            {showInfoBanner && (
              <div className={panelBanner}>
                <CustomBanner
                  message={t('githubActionWorkflowOptionUseExistingMessageWithoutPreview')}
                  type={MessageBarType.info}
                  onDismiss={closeInfoBanner}
                />
              </div>
            )}
          </>
        );
      } else if (formProps.values.workflowOption === WorkflowOption.Add || formProps.values.workflowOption === WorkflowOption.Overwrite) {
        const information = getWorkflowInformation(
          formProps.values.runtimeStack,
          formProps.values.runtimeVersion,
          formProps.values.runtimeRecommendedVersion,
          formProps.values.branch,
          siteStateContext.isLinuxApp,
          formProps.values.gitHubPublishProfileSecretGuid,
          deploymentCenterContext.siteDescriptor.site,
          deploymentCenterContext.siteDescriptor.slot
        );
        return (
          <>
            {showInfoBanner && (
              <div className={panelBanner}>
                <CustomBanner
                  message={t('githubActionWorkflowOptionOverwriteIfConfigExists')}
                  type={MessageBarType.info}
                  onDismiss={closeInfoBanner}
                />
              </div>
            )}
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
          <p>
            <span id="deployment-center-settings-message">{t('deploymentCenterCodeSettingsDescription')}</span>
            <Link
              id="deployment-center-settings-learnMore"
              href={DeploymentCenterLinks.appServiceDocumentation}
              target="_blank"
              className={learnMoreLinkStyle}
              aria-labelledby="deployment-center-settings-message">
              {` ${t('learnMore')}`}
            </Link>
          </p>
          {!isGitHubActionsSetup && <DeploymentCenterCodeSourceKuduConfiguredView />}
          {isGitHubSourceSetup && <DeploymentCenterGitHubConfiguredView isGitHubActionsSetup={isGitHubActionsSetup} />}
          <DeploymentCenterCodeBuildConfiguredView />
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
                    setShowInfoBanner={setShowInfoBanner}
                    isPreviewFileButtonEnabled={isPreviewFileButtonEnabled}
                    workflowFilePath={workflowFilePath}
                  />
                </>
              )}
            </>
          )}

          {isBitbucketSource && <DeploymentCenterBitbucketDataLoader formProps={formProps} />}
        </>
      )}
    </>
  );
};

export default DeploymentCenterCodeSettings;
