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
import {
  getCodeWebAppWorkflowInformation,
  getCodeFunctionAppCodeWorkflowInformation,
  isWorkflowOptionExistingOrAvailable,
} from '../utility/GitHubActionUtility';
import { getWorkflowFileName } from '../utility/DeploymentCenterUtility';
import DeploymentCenterCodeSourceKuduConfiguredView from './DeploymentCenterCodeSourceKuduConfiguredView';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { SiteStateContext } from '../../../../SiteState';
import { Link, ProgressIndicator } from 'office-ui-fabric-react';
import DeploymentCenterBitbucketConfiguredView from '../bitbucket-provider/DeploymentCenterBitbucketConfiguredView';
import DeploymentCenterLocalGitConfiguredView from '../local-git-provider/DeploymentCenterLocalGitConfiguredView';
import DeploymentCenterExternalConfiguredView from '../external-provider/DeploymentCenterExternalConfiguredView';
import DeploymentCenterLocalGitProvider from '../local-git-provider/DeploymentCenterLocalGitProvider';
import DeploymentCenterExternalProvider from '../external-provider/DeploymentCenterExternalProvider';
import DeploymentCenterOneDriveDataLoader from '../onedrive-provider/DeploymentCenterOneDriveDataLoader';
import DeploymentCenterOneDriveConfiguredView from '../onedrive-provider/DeploymentCenterOneDriveConfiguredView';
import DeploymentCenterDropboxDataLoader from '../dropbox-provider/DeploymentCenterDropboxDataLoader';
import DeploymentCenterDropboxConfiguredView from '../dropbox-provider/DeploymentCenterDropboxConfiguredView';
import DeploymentCenterVstsBuildConfiguredView from '../devops-provider/DeploymentCenterVstsBuildConfiguredView';
import DeploymentCenterDevOpsDataLoader from '../devops-provider/DeploymentCenterDevOpsDataLoader';
import DeploymentCenterDevOpsKuduBuildConfiguredView from '../devops-provider/DeploymentCenterDevOpsKuduBuildConfiguredView';
import DeploymentCenterVstsBuildProvider from '../devops-provider/DeploymentCenterVstsBuildProvider';

const DeploymentCenterCodeSettings: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps, isDataRefreshing } = props;
  const { t } = useTranslation();

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);

  const [githubActionExistingWorkflowContents, setGithubActionExistingWorkflowContents] = useState<string>('');
  const [workflowFilePath, setWorkflowFilePath] = useState<string>('');
  const [isPreviewFileButtonDisabled, setIsPreviewFileButtonDisabled] = useState(false);
  const [panelMessage, setPanelMessage] = useState('');
  const [siteConfigScmType, setSiteConfigScmType] = useState<ScmType | undefined>(undefined);
  const [shouldLoadSetupView, setShouldLoadSetupView] = useState(false);
  const [isKuduBuild, setIsKuduBuild] = useState(false);
  const [isVstsBuild, setIsVstsBuild] = useState(false);
  const [isGitHubActionsBuild, setIsGitHubActionsBuild] = useState(false);
  const [isGitHubActionsSetup, setIsGitHubActionsSetup] = useState(false);
  const [isGitHubSource, setIsGitHubSource] = useState(false);
  const [isGitHubSourceSetup, setIsGitHubSourceSetup] = useState(false);
  const [isBitbucketSource, setIsBitbucketSource] = useState(false);
  const [isBitbucketSetup, setIsBitbucketSetup] = useState(false);
  const [isLocalGitSource, setIsLocalGitSource] = useState(false);
  const [isLocalGitSetup, setIsLocalGitSetup] = useState(false);
  const [isExternalGitSource, setIsExternalGitSource] = useState(false);
  const [isExternalGitSetup, setIsExternalGitSetup] = useState(false);
  const [isOneDriveSource, setIsOneDriveSource] = useState(false);
  const [isOneDriveSetup, setIsOneDriveSetup] = useState(false);
  const [isDropboxSource, setIsDropboxSource] = useState(false);
  const [isDropboxSetup, setIsDropboxSetup] = useState(false);
  const [isVsoSource, setIsVsoSource] = useState(false);
  const [isVstsSetup, setIsVstsSetup] = useState(false);
  const [isTfsOrVsoSetup, setIsTfsOrVsoSetup] = useState(false);
  const [isUsingExistingOrAvailableWorkflowConfig, setIsUsingExistingOrAvailableWorkflowConfig] = useState(false);

  useEffect(() => {
    setSiteConfigScmType(deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext.siteConfig, deploymentCenterContext.configMetadata]);

  useEffect(() => {
    setShouldLoadSetupView(!!siteConfigScmType && siteConfigScmType !== ScmType.None);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteConfigScmType, deploymentCenterContext.siteConfig, deploymentCenterContext.configMetadata]);

  useEffect(() => {
    setIsKuduBuild(formProps.values.buildProvider === BuildProvider.AppServiceBuildService);
    setIsVstsBuild(formProps.values.buildProvider === BuildProvider.Vsts);
    setIsGitHubActionsBuild(formProps.values.buildProvider === BuildProvider.GitHubAction);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.buildProvider]);

  useEffect(() => {
    setIsGitHubSource(formProps.values.sourceProvider === ScmType.GitHub);
    setIsBitbucketSource(formProps.values.sourceProvider === ScmType.BitbucketGit);
    setIsLocalGitSource(formProps.values.sourceProvider === ScmType.LocalGit);
    setIsExternalGitSource(formProps.values.sourceProvider === ScmType.ExternalGit);
    setIsOneDriveSource(formProps.values.sourceProvider === ScmType.OneDrive);
    setIsDropboxSource(formProps.values.sourceProvider === ScmType.Dropbox);
    setIsVsoSource(formProps.values.sourceProvider === ScmType.Vso);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.sourceProvider]);

  useEffect(() => {
    setIsGitHubActionsSetup(siteConfigScmType === ScmType.GitHubAction);
    setIsGitHubSourceSetup(siteConfigScmType === ScmType.GitHubAction || siteConfigScmType === ScmType.GitHub);
    setIsBitbucketSetup(siteConfigScmType === ScmType.BitbucketGit);
    setIsLocalGitSetup(siteConfigScmType === ScmType.LocalGit);
    setIsExternalGitSetup(siteConfigScmType === ScmType.ExternalGit);
    setIsOneDriveSetup(siteConfigScmType === ScmType.OneDrive);
    setIsDropboxSetup(siteConfigScmType === ScmType.Dropbox);
    setIsVstsSetup(siteConfigScmType === ScmType.Vsts);
    setIsTfsOrVsoSetup(siteConfigScmType === ScmType.Tfs || siteConfigScmType === ScmType.Vso);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteConfigScmType, deploymentCenterContext.configMetadata]);

  const getWorkflowFileContent = () => {
    if (deploymentCenterContext.siteDescriptor) {
      const runtimeInfoAvailable = formProps.values.runtimeStack && formProps.values.runtimeVersion;

      if (formProps.values.workflowOption === WorkflowOption.UseExistingWorkflowConfig) {
        return githubActionExistingWorkflowContents;
      } else if (
        (formProps.values.workflowOption === WorkflowOption.Add || formProps.values.workflowOption === WorkflowOption.Overwrite) &&
        runtimeInfoAvailable
      ) {
        const information = siteStateContext.isFunctionApp
          ? getCodeFunctionAppCodeWorkflowInformation(
              formProps.values.runtimeStack,
              formProps.values.runtimeVersion,
              formProps.values.runtimeRecommendedVersion,
              formProps.values.branch,
              siteStateContext.isLinuxApp,
              formProps.values.gitHubPublishProfileSecretGuid,
              deploymentCenterContext.siteDescriptor.site,
              deploymentCenterContext.siteDescriptor.slot
            )
          : getCodeWebAppWorkflowInformation(
              formProps.values.runtimeStack,
              formProps.values.runtimeVersion,
              formProps.values.runtimeRecommendedVersion,
              formProps.values.branch,
              siteStateContext.isLinuxApp,
              formProps.values.gitHubPublishProfileSecretGuid,
              deploymentCenterContext.siteDescriptor.site,
              deploymentCenterContext.siteDescriptor.slot,
              formProps.values.javaContainer
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

    setIsUsingExistingOrAvailableWorkflowConfig(isWorkflowOptionExistingOrAvailable(formProps.values.workflowOption));
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

  const getSettingsControls = () => (
    <>
      {shouldLoadSetupView ? (
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
          {!isGitHubActionsSetup && !isVstsSetup && <DeploymentCenterCodeSourceKuduConfiguredView formProps={formProps} />}
          {isGitHubSourceSetup && <DeploymentCenterGitHubConfiguredView formProps={formProps} />}
          {isBitbucketSetup && <DeploymentCenterBitbucketConfiguredView formProps={formProps} />}
          {isLocalGitSetup && <DeploymentCenterLocalGitConfiguredView />}
          {isExternalGitSetup && <DeploymentCenterExternalConfiguredView formProps={formProps} />}
          {isOneDriveSetup && <DeploymentCenterOneDriveConfiguredView formProps={formProps} />}
          {isDropboxSetup && <DeploymentCenterDropboxConfiguredView formProps={formProps} />}
          {isVstsSetup && <DeploymentCenterVstsBuildConfiguredView />}
          {isTfsOrVsoSetup && <DeploymentCenterDevOpsKuduBuildConfiguredView formProps={formProps} />}

          {!isTfsOrVsoSetup && <DeploymentCenterCodeBuildConfiguredView />}
        </>
      ) : (
        <div>
          <DeploymentCenterCodeSourceAndBuild formProps={formProps} />

          {isGitHubActionsBuild && (
            <>
              <DeploymentCenterGitHubDataLoader isGitHubActions={isGitHubActionsBuild} formProps={formProps} />
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
          {isKuduBuild && (
            <>
              {isGitHubSource && <DeploymentCenterGitHubDataLoader formProps={formProps} />}
              {isBitbucketSource && <DeploymentCenterBitbucketDataLoader formProps={formProps} />}
              {isLocalGitSource && <DeploymentCenterLocalGitProvider />}
              {isExternalGitSource && <DeploymentCenterExternalProvider formProps={formProps} />}
              {isOneDriveSource && <DeploymentCenterOneDriveDataLoader formProps={formProps} />}
              {isDropboxSource && <DeploymentCenterDropboxDataLoader formProps={formProps} />}
              {isVsoSource && <DeploymentCenterDevOpsDataLoader formProps={formProps} />}
            </>
          )}
          {isVstsBuild && <DeploymentCenterVstsBuildProvider />}
        </div>
      )}
    </>
  );

  const getProgressIndicator = () => (
    <ProgressIndicator description={t('deploymentCenterSettingsLoading')} ariaValueText={t('deploymentCenterSettingsLoadingAriaValue')} />
  );

  return <>{isDataRefreshing ? getProgressIndicator() : getSettingsControls()}</>;
};

export default DeploymentCenterCodeSettings;
