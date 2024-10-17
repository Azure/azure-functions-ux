import { Link, MessageBarType, ProgressIndicator } from '@fluentui/react';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PortalContext } from '../../../../PortalContext';
import { SiteStateContext } from '../../../../SiteState';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { BuildProvider, ScmType } from '../../../../models/site/config';
import { AppOs } from '../../../../models/site/site';
import { CommonConstants, ExperimentationConstants } from '../../../../utils/CommonConstants';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import { LogCategories } from '../../../../utils/LogCategories';
import { usePortalLogging } from '../../../../utils/hooks/usePortalLogging';
import DeploymentCenterData from '../DeploymentCenter.data';
import {
  AppType,
  DeploymentCenterCodeFormData,
  DeploymentCenterFieldProps,
  PublishType,
  RuntimeStackOptions,
  WorkflowOption,
} from '../DeploymentCenter.types';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { DeploymentCenterAuthenticationSettings } from '../authentication/DeploymentCenterAuthenticationSettings';
import { DeploymentCenterPublishingContext } from '../authentication/DeploymentCenterPublishingContext';
import DeploymentCenterBitbucketConfiguredView from '../bitbucket-provider/DeploymentCenterBitbucketConfiguredView';
import DeploymentCenterBitbucketDataLoader from '../bitbucket-provider/DeploymentCenterBitbucketDataLoader';
import DeploymentCenterDevOpsDataLoader from '../devops-provider/DeploymentCenterDevOpsDataLoader';
import DeploymentCenterDevOpsKuduBuildConfiguredView from '../devops-provider/DeploymentCenterDevOpsKuduBuildConfiguredView';
import DeploymentCenterVstsBuildConfiguredView from '../devops-provider/DeploymentCenterVstsBuildConfiguredView';
import DeploymentCenterVstsBuildProvider from '../devops-provider/DeploymentCenterVstsBuildProvider';
import DeploymentCenterExternalConfiguredView from '../external-provider/DeploymentCenterExternalConfiguredView';
import DeploymentCenterExternalProvider from '../external-provider/DeploymentCenterExternalProvider';
import DeploymentCenterGitHubConfiguredView from '../github-provider/DeploymentCenterGitHubConfiguredView';
import DeploymentCenterGitHubDataLoader from '../github-provider/DeploymentCenterGitHubDataLoader';
import DeploymentCenterGitHubWorkflowConfigPreview from '../github-provider/DeploymentCenterGitHubWorkflowConfigPreview';
import DeploymentCenterGitHubWorkflowConfigSelector from '../github-provider/DeploymentCenterGitHubWorkflowConfigSelector';
import DeploymentCenterLocalGitConfiguredView from '../local-git-provider/DeploymentCenterLocalGitConfiguredView';
import DeploymentCenterLocalGitProvider from '../local-git-provider/DeploymentCenterLocalGitProvider';
import { getTelemetryInfo, getWorkflowFileName, isFtpsDirty } from '../utility/DeploymentCenterUtility';
import { getRuntimeVersion, isWorkflowOptionExistingOrAvailable } from '../utility/GitHubActionUtility';
import DeploymentCenterCodeBuildConfiguredView from './DeploymentCenterCodeBuildConfiguredView';
import DeploymentCenterCodeBuildRuntimeAndVersion from './DeploymentCenterCodeBuildRuntimeAndVersion';
import DeploymentCenterCodeSourceAndBuild from './DeploymentCenterCodeSourceAndBuild';
import DeploymentCenterCodeSourceKuduConfiguredView from './DeploymentCenterCodeSourceKuduConfiguredView';

const DeploymentCenterCodeSettings: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps, isDataRefreshing } = props;
  const { t } = useTranslation();

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);
  const portalContext = useContext(PortalContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const deploymentCenterData = new DeploymentCenterData();

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
  const [isUnsupportedSource, setIsUnsupportedSource] = useState(false);
  const [isVsoSource, setIsVsoSource] = useState(false);
  const [isVstsSetup, setIsVstsSetup] = useState(false);
  const [isTfsOrVsoSetup, setIsTfsOrVsoSetup] = useState(false);
  const [isUsingExistingOrAvailableWorkflowConfig, setIsUsingExistingOrAvailableWorkflowConfig] = useState(false);
  const [isRemoveEnvEnabled, setIsRemoveEnvEnabled] = useState(false);
  useEffect(() => {
    let isSubscribed = true;

    portalContext?.getBooleanFlight(ExperimentationConstants.FlightVariable.removeDeployEnvironment).then(hasFlightEnabled => {
      if (isSubscribed) {
        setIsRemoveEnvEnabled(hasFlightEnabled);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [portalContext]);

  const log = usePortalLogging();

  useEffect(() => {
    setSiteConfigScmType(deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType);
  }, [deploymentCenterContext.siteConfig, deploymentCenterContext.configMetadata]);

  useEffect(() => {
    const loadSetupView = !!siteConfigScmType && siteConfigScmType !== ScmType.None;
    if (loadSetupView && formProps.dirty && !isFtpsDirty(formProps, deploymentCenterPublishingContext)) {
      formProps.resetForm();
    }
    setShouldLoadSetupView(loadSetupView);
  }, [
    siteConfigScmType,
    deploymentCenterContext.siteConfig,
    deploymentCenterContext.configMetadata,
    formProps,
    deploymentCenterPublishingContext,
  ]);

  useEffect(() => {
    setIsKuduBuild(formProps.values.buildProvider === BuildProvider.AppServiceBuildService);
    setIsVstsBuild(formProps.values.buildProvider === BuildProvider.Vsts);
    setIsGitHubActionsBuild(formProps.values.buildProvider === BuildProvider.GitHubAction);
  }, [formProps.values.buildProvider]);

  useEffect(() => {
    const sourceProvider = formProps.values.sourceProvider;
    setIsGitHubSource(sourceProvider === ScmType.GitHub);
    setIsBitbucketSource(sourceProvider === ScmType.BitbucketGit);
    setIsLocalGitSource(sourceProvider === ScmType.LocalGit);
    setIsExternalGitSource(sourceProvider === ScmType.ExternalGit);
    setIsVsoSource(formProps.values.sourceProvider === ScmType.Vso);

    const unsupportedSourceConfigured = sourceProvider === ScmType.Dropbox || sourceProvider === ScmType.OneDrive;
    if (unsupportedSourceConfigured) {
      log(
        getTelemetryInfo('error', LogCategories.deploymentCenter, 'UnsupportedSourceConfigured', {
          message: `Unsupported source configured: '${sourceProvider}'`,
        })
      );
    }

    setIsUnsupportedSource(sourceProvider === ScmType.Dropbox || sourceProvider === ScmType.OneDrive);
  }, [formProps.values.sourceProvider, log]);

  useEffect(() => {
    setIsGitHubActionsSetup(siteConfigScmType === ScmType.GitHubAction);
    setIsGitHubSourceSetup(siteConfigScmType === ScmType.GitHubAction || siteConfigScmType === ScmType.GitHub);
    setIsBitbucketSetup(siteConfigScmType === ScmType.BitbucketGit);
    setIsLocalGitSetup(siteConfigScmType === ScmType.LocalGit);
    setIsExternalGitSetup(siteConfigScmType === ScmType.ExternalGit);
    setIsVstsSetup(siteConfigScmType === ScmType.Vsts);
    setIsTfsOrVsoSetup(siteConfigScmType === ScmType.Tfs || siteConfigScmType === ScmType.Vso);
  }, [siteConfigScmType, deploymentCenterContext.configMetadata]);

  const getWorkflowFileVariables = () => {
    const slotName = deploymentCenterContext.siteDescriptor?.slot ?? '';
    const siteName = deploymentCenterContext.siteDescriptor?.site ?? '';

    const variables = {
      siteName: slotName ? `${siteName}(${slotName})` : siteName,
      slotName: slotName || CommonConstants.Production,
      runtimeVersion: getRuntimeVersion(
        siteStateContext.isLinuxApp,
        formProps.values.runtimeVersion,
        formProps.values.runtimeRecommendedVersion
      ),
      branch: formProps.values.branch || CommonConstants.master,
      publishingProfileSecretName: `AzureAppService_PublishProfile_${formProps.values.gitHubPublishProfileSecretGuid}`,
    };

    if (formProps.values.runtimeStack === RuntimeStackOptions.Java) {
      variables['javaContainer'] = formProps.values.javaContainer;
    }

    if (isRemoveEnvEnabled) {
      variables['isRemoveEnvEnabled'] = true;
    }

    if (siteStateContext.isFlexConsumptionApp) {
      variables['isFlexConsumption'] = true;
    }

    return variables;
  };

  const getWorkflowFileContent = async () => {
    if (deploymentCenterContext.siteDescriptor) {
      const runtimeInfoAvailable = formProps.values.runtimeStack && formProps.values.runtimeVersion;

      if (formProps.values.workflowOption === WorkflowOption.UseExistingWorkflowConfig) {
        return githubActionExistingWorkflowContents;
      } else if (
        (formProps.values.workflowOption === WorkflowOption.Add || formProps.values.workflowOption === WorkflowOption.Overwrite) &&
        runtimeInfoAvailable
      ) {
        const variables = getWorkflowFileVariables();
        const appType = siteStateContext.isFunctionApp ? AppType.FunctionApp : AppType.WebApp;
        const os = siteStateContext.isLinuxApp ? AppOs.linux : AppOs.windows;
        const authType = formProps.values.authType;
        const apiVersion = CommonConstants.ApiVersions.workflowApiVersion20221001;

        const getWorkflowFile = await deploymentCenterData.getWorkflowFile(
          appType,
          PublishType.Code,
          os,
          variables,
          formProps.values.runtimeStack,
          authType,
          apiVersion
        );
        if (getWorkflowFile.metadata.success) {
          return getWorkflowFile.data;
        } else {
          portalContext.log(
            getTelemetryInfo('error', 'getWorkflowFile', 'failed', {
              appType: appType,
              publishType: PublishType.Code,
              os: os,
              runtimeVersion: variables.runtimeVersion,
              branch: variables.branch,
              runtimeStack: formProps.values.runtimeStack,
              authType,
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

    setIsUsingExistingOrAvailableWorkflowConfig(isWorkflowOptionExistingOrAvailable(formProps.values.workflowOption));
  }, [formProps.values.workflowOption]);

  useEffect(() => {
    const runtimeInfoOmissionAllowed =
      formProps.values.workflowOption === WorkflowOption.UseAvailableWorkflowConfigs ||
      (formProps.values.workflowOption === WorkflowOption.UseExistingWorkflowConfig && githubActionExistingWorkflowContents);

    const authTypeFormFilled = !!formProps.values.authType;

    const formFilled =
      formProps.values.workflowOption !== WorkflowOption.None &&
      ((formProps.values.runtimeStack && formProps.values.runtimeVersion) || runtimeInfoOmissionAllowed) &&
      authTypeFormFilled;

    setIsPreviewFileButtonDisabled(formProps.values.workflowOption === WorkflowOption.None || !formFilled);
  }, [
    formProps.values.workflowOption,
    githubActionExistingWorkflowContents,
    formProps.values.runtimeStack,
    formProps.values.runtimeVersion,
    formProps.values.authType,
    formProps.values.authIdentity,
  ]);

  useEffect(() => {
    if (
      deploymentCenterContext.siteDescriptor &&
      formProps.values.branch &&
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
  }, [deploymentCenterContext.siteDescriptor, formProps.values.branch, formProps.values.workflowOption]);

  const getSettingsControls = () => (
    <>
      {shouldLoadSetupView ? (
        <>
          <p>
            <span id="deployment-center-settings-message">{t('deploymentCenterCodeSettingsDescription')}</span>
            <Link
              id="deployment-center-settings-learnMore"
              href={DeploymentCenterLinks.configureDeploymentSource}
              target="_blank"
              className={learnMoreLinkStyle}
              aria-labelledby="deployment-center-settings-message">
              {` ${t('learnMore')}`}
            </Link>
          </p>
          {isUnsupportedSource && (
            <CustomBanner
              id="deployment-center-oneDrive-warning"
              message={t('deploymentCenterOneDriveDropboxWarning')}
              type={MessageBarType.warning}
              learnMoreLink={DeploymentCenterLinks.oneDriveDropboxRetirement}
              learnMoreLinkAriaLabel={t('deploymentCenterOneDriveDropboxLinkAriaLabel')}
            />
          )}
          {!isGitHubActionsSetup && !isVstsSetup && <DeploymentCenterCodeSourceKuduConfiguredView formProps={formProps} />}
          {isGitHubSourceSetup && <DeploymentCenterGitHubConfiguredView formProps={formProps} />}
          {isBitbucketSetup && <DeploymentCenterBitbucketConfiguredView formProps={formProps} />}
          {isLocalGitSetup && <DeploymentCenterLocalGitConfiguredView />}
          {isExternalGitSetup && <DeploymentCenterExternalConfiguredView formProps={formProps} />}
          {isVstsSetup && <DeploymentCenterVstsBuildConfiguredView formProps={formProps} />}
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
              <DeploymentCenterAuthenticationSettings formProps={formProps} />
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
