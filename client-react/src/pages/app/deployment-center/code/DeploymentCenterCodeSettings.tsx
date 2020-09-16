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
import { useTranslation } from 'react-i18next';
import { getCodeAppWorkflowInformation, isWorkflowOptionExistingOrAvailable } from '../utility/GitHubActionUtility';
import { getWorkflowFileName } from '../utility/DeploymentCenterUtility';
import DeploymentCenterCodeSourceKuduConfiguredView from './DeploymentCenterCodeSourceKuduConfiguredView';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { SiteStateContext } from '../../../../SiteState';
import { Link } from 'office-ui-fabric-react';
import DeploymentCenterBitbucketConfiguredView from '../bitbucket-provider/DeploymentCenterBitbucketConfiguredView';
import DeploymentCenterLocalGitConfiguredView from '../local-git-provider/DeploymentCenterLocalGitConfiguredView';
import DeploymentCenterExternalConfiguredView from '../external-provider/DeploymentCenterExternalConfiguredView';
import DeploymentCenterLocalGitProvider from '../local-git-provider/DeploymentCenterLocalGitProvider';
import DeploymentCenterExternalProvider from '../external-provider/DeploymentCenterExternalProvider';

const DeploymentCenterCodeSettings: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);

  const [githubActionExistingWorkflowContents, setGithubActionExistingWorkflowContents] = useState<string>('');
  const [workflowFilePath, setWorkflowFilePath] = useState<string>('');
  const [isPreviewFileButtonDisabled, setIsPreviewFileButtonDisabled] = useState(false);
  const [panelMessage, setPanelMessage] = useState('');

  const isDeploymentSetup = deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType !== ScmType.None;

  const isGitHubSource = formProps.values.sourceProvider === ScmType.GitHub;
  const isGitHubActionsBuild = formProps.values.buildProvider === BuildProvider.GitHubAction;
  const isGitHubActionsSetup =
    deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.GitHubAction;
  const isGitHubSourceSetup =
    deploymentCenterContext.siteConfig &&
    (deploymentCenterContext.siteConfig.properties.scmType === ScmType.GitHubAction ||
      deploymentCenterContext.siteConfig.properties.scmType === ScmType.GitHub);
  const isUsingExistingOrAvailableWorkflowConfig = isWorkflowOptionExistingOrAvailable(formProps.values.workflowOption);

  const isBitbucketSource = formProps.values.sourceProvider === ScmType.BitbucketGit;
  const isBitbucketSetup =
    deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.BitbucketGit;

  const isLocalGitSource = formProps.values.sourceProvider === ScmType.LocalGit;
  const isLocalGitSetup = deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.LocalGit;

  const isExternalGitSource = formProps.values.sourceProvider === ScmType.ExternalGit;
  const isExternalGitSetup =
    deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.ExternalGit;

  const getWorkflowFileContent = () => {
    if (deploymentCenterContext.siteDescriptor) {
      const runtimeInfoAvailable = formProps.values.runtimeStack && formProps.values.runtimeVersion;

      if (formProps.values.workflowOption === WorkflowOption.UseExistingWorkflowConfig) {
        return githubActionExistingWorkflowContents;
      } else if (
        (formProps.values.workflowOption === WorkflowOption.Add || formProps.values.workflowOption === WorkflowOption.Overwrite) &&
        runtimeInfoAvailable
      ) {
        const information = getCodeAppWorkflowInformation(
          formProps.values.runtimeStack,
          formProps.values.runtimeVersion,
          formProps.values.runtimeRecommendedVersion,
          formProps.values.branch,
          siteStateContext.isLinuxApp,
          formProps.values.gitHubPublishProfileSecretGuid,
          deploymentCenterContext.siteDescriptor.site,
          deploymentCenterContext.siteDescriptor.slot
        );
        return information.content;
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
    const runtimeInfoOmissionAllowed =
      formProps.values.workflowOption === WorkflowOption.UseAvailableWorkflowConfigs ||
      (formProps.values.workflowOption === WorkflowOption.UseExistingWorkflowConfig && githubActionExistingWorkflowContents);

    const formFilled =
      formProps.values.workflowOption !== WorkflowOption.None &&
      ((formProps.values.runtimeStack && formProps.values.runtimeVersion) || runtimeInfoOmissionAllowed);

    setIsPreviewFileButtonDisabled(formProps.values.workflowOption === WorkflowOption.None || !formFilled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formProps.values.workflowOption,
    githubActionExistingWorkflowContents,
    formProps.values.runtimeStack,
    formProps.values.runtimeVersion,
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
          {isBitbucketSetup && <DeploymentCenterBitbucketConfiguredView />}
          {isLocalGitSetup && <DeploymentCenterLocalGitConfiguredView />}
          {isExternalGitSetup && <DeploymentCenterExternalConfiguredView />}

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
                    isPreviewFileButtonDisabled={isPreviewFileButtonDisabled}
                    getWorkflowFileContent={getWorkflowFileContent}
                    workflowFilePath={workflowFilePath}
                    panelMessage={panelMessage}
                  />
                </>
              )}
            </>
          )}

          {isBitbucketSource && <DeploymentCenterBitbucketDataLoader formProps={formProps} />}
          {isLocalGitSource && <DeploymentCenterLocalGitProvider />}
          {isExternalGitSource && <DeploymentCenterExternalProvider formProps={formProps} />}
        </>
      )}
    </>
  );
};

export default DeploymentCenterCodeSettings;
