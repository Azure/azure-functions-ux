import React, { useContext, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IDropdownOption, DropdownMenuItemType, Link, MessageBarType } from '@fluentui/react';
import { BuildProvider, ScmType } from '../../../../models/site/config';
import { Field } from 'formik';
import Dropdown from '../../../../components/form-controls/DropDown';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { deploymentCenterInfoBannerDiv, additionalTextFieldControl } from '../DeploymentCenter.styles';
import {
  DeploymentCenterFieldProps,
  DeploymentCenterCodeFormData,
  BuildChoiceGroupOption,
  RuntimeStackOptions,
  RuntimeStackSetting,
  AuthType,
} from '../DeploymentCenter.types';
import { Guid } from '../../../../utils/Guid';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import DeploymentCenterCodeBuildCallout from './DeploymentCenterCodeBuildCallout';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { SiteStateContext } from '../../../../SiteState';
import { PortalContext } from '../../../../PortalContext';
import { getRuntimeStackSetting, getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { DeploymentCenterPublishingContext } from '../authentication/DeploymentCenterPublishingContext';
import { BroadcastMessageId } from '../../../../models/portal-models';
import { ExperimentationConstants } from '../../../../utils/CommonConstants';

const DeploymentCenterCodeSourceAndBuild: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const scenarioService = new ScenarioService(t);

  const [selectedBuild, setSelectedBuild] = useState<BuildProvider>(BuildProvider.None);
  const [selectedBuildChoice, setSelectedBuildChoice] = useState<BuildProvider>(BuildProvider.None);
  const [isCalloutVisible, setIsCalloutVisible] = useState(false);
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [basicAuthErrorMessage, setBasicAuthErrorMessage] = useState();

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const siteStateContext = useContext(SiteStateContext);
  const portalContext = useContext(PortalContext);

  const isFlexFunctionAppAndHasVsoProvider = useMemo(() => {
    return siteStateContext.isFlexConsumptionApp && formProps.values.sourceProvider === ScmType.Vso;
  }, [siteStateContext.isFlexConsumptionApp, formProps.values.sourceProvider]);

  const toggleIsCalloutVisible = () => {
    setSelectedBuildChoice(selectedBuild);
    setIsCalloutVisible(!isCalloutVisible);
  };

  const getInProductionSlot = () => {
    return !(deploymentCenterContext.siteDescriptor && deploymentCenterContext.siteDescriptor.slot);
  };

  const closeInfoBanner = () => {
    setShowInfoBanner(false);
  };

  const getSourceOptions = (): IDropdownOption[] => [...getContinuousDeploymentOptions(), ...getManualDeploymentOptions()];

  const getContinuousDeploymentOptions = (): IDropdownOption[] => {
    const continuousDeploymentOptions: IDropdownOption[] = [];

    if (scenarioService.checkScenario(ScenarioIds.githubSource, { site: siteStateContext.site }).status !== 'disabled') {
      continuousDeploymentOptions.push({ key: ScmType.GitHub, text: t('deploymentCenterCodeSettingsSourceGitHub') });
    }

    if (scenarioService.checkScenario(ScenarioIds.bitbucketSource, { site: siteStateContext.site }).status !== 'disabled') {
      continuousDeploymentOptions.push({ key: ScmType.BitbucketGit, text: t('deploymentCenterCodeSettingsSourceBitbucket') });
    }

    if (scenarioService.checkScenario(ScenarioIds.localGitSource, { site: siteStateContext.site }).status !== 'disabled') {
      continuousDeploymentOptions.push({ key: ScmType.LocalGit, text: t('deploymentCenterCodeSettingsSourceLocalGit') });
    }

    if (scenarioService.checkScenario(ScenarioIds.vstsKuduSource, { site: siteStateContext.site }).status !== 'disabled') {
      continuousDeploymentOptions.push({ key: ScmType.Vso, text: t('deploymentCenterCodeSettingsSourceAzureRepos') });
    }

    return continuousDeploymentOptions.length > 0
      ? [
          {
            key: 'continuousDeploymentHeader',
            text: t('deploymentCenterCodeSettingsSourceContinuousDeploymentHeader'),
            itemType: DropdownMenuItemType.Header,
          },
          ...continuousDeploymentOptions,
          { key: 'divider_1', text: '-', itemType: DropdownMenuItemType.Divider },
        ]
      : continuousDeploymentOptions;
  };

  const getManualDeploymentOptions = (): IDropdownOption[] => {
    const manualDeploymentOptions: IDropdownOption[] = [];

    if (scenarioService.checkScenario(ScenarioIds.externalSource, { site: siteStateContext.site }).status !== 'disabled') {
      manualDeploymentOptions.push({ key: ScmType.ExternalGit, text: t('deploymentCenterCodeSettingsSourceExternalGit') });
    }

    return manualDeploymentOptions.length > 0
      ? [
          {
            key: 'manualDeploymentHeader',
            text: t('deploymentCenterCodeSettingsSourceManualDeploymentHeader'),
            itemType: DropdownMenuItemType.Header,
          },
          ...manualDeploymentOptions,
        ]
      : [];
  };

  const updateSelectedBuild = () => {
    portalContext.log(
      getTelemetryInfo('info', 'buildProvider', 'updated', {
        buildProvider: selectedBuildChoice,
      })
    );

    setSelectedBuild(selectedBuildChoice);
    formProps.setFieldValue('buildProvider', selectedBuildChoice);
    if (selectedBuildChoice === BuildProvider.GitHubAction) {
      formProps.setFieldValue(
        'gitHubPublishProfileSecretGuid',
        Guid.newGuid()
          .toLowerCase()
          .replace(/[-]/g, '')
      );
    }
    toggleIsCalloutVisible();
  };

  const updateSelectedBuildChoiceOption = (e: any, option: BuildChoiceGroupOption) => {
    setSelectedBuildChoice(option.buildType);
  };

  useEffect(() => {
    if (!!formProps.values.sourceProvider && formProps.values.sourceProvider !== ScmType.None) {
      setSourceBuildProvider();
    } else {
      // NOTE(michinoy): If the source provider is set to None, it means either an initial load or discard.
      // only clear the values in that case.
      clearBuildAndRepoFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.sourceProvider]);

  const clearBuildAndRepoFields = () => {
    formProps.setFieldValue('buildProvider', BuildProvider.None);
    formProps.setFieldValue('org', '');
    formProps.setFieldValue('repo', '');
    formProps.setFieldValue('branch', '');
  };

  const setSourceBuildProvider = () => {
    if (formProps.values.sourceProvider === ScmType.GitHub) {
      //Note (stpelleg): Need to disable GitHub Actions for Ruby, PHP (Windows), Go, and ILB ASE as we do not support it
      if (
        defaultStackAndVersion?.runtimeStack.toLocaleLowerCase() === RuntimeStackOptions.Ruby ||
        (defaultStackAndVersion?.runtimeStack.toLocaleLowerCase() === RuntimeStackOptions.PHP &&
          !defaultStackAndVersion.runtimeVersion &&
          !siteStateContext.isLinuxApp) ||
        defaultStackAndVersion?.runtimeStack.toLocaleLowerCase() === RuntimeStackOptions.Go ||
        deploymentCenterContext.isIlbASE
      ) {
        setSelectedBuild(BuildProvider.AppServiceBuildService);
        formProps.setFieldValue('buildProvider', BuildProvider.AppServiceBuildService);
      } else {
        setSelectedBuild(BuildProvider.GitHubAction);
        formProps.setFieldValue('buildProvider', BuildProvider.GitHubAction);
        formProps.setFieldValue(
          'gitHubPublishProfileSecretGuid',
          Guid.newGuid()
            .toLowerCase()
            .replace(/[-]/g, '')
        );
      }
    } else {
      if (isFlexFunctionAppAndHasVsoProvider) {
        setSelectedBuild(BuildProvider.Vsts);
        formProps.setFieldValue('buildProvider', BuildProvider.Vsts);
      } else {
        setSelectedBuild(BuildProvider.AppServiceBuildService);
        formProps.setFieldValue('buildProvider', BuildProvider.AppServiceBuildService);
      }
    }
  };

  const defaultStackAndVersion: RuntimeStackSetting = getRuntimeStackSetting(
    siteStateContext.isLinuxApp,
    siteStateContext.isFunctionApp,
    siteStateContext.isKubeApp,
    siteStateContext.isWordPressApp,
    deploymentCenterContext.siteConfig,
    deploymentCenterContext.configMetadata,
    deploymentCenterContext.applicationSettings
  );
  const isSourceSelected = formProps.values.sourceProvider !== ScmType.None;
  const calloutOkButtonDisabled = selectedBuildChoice === selectedBuild;
  const isAzureDevOpsSupportedBuild =
    formProps.values.sourceProvider === ScmType.GitHub ||
    formProps.values.sourceProvider === ScmType.Vso ||
    formProps.values.sourceProvider === ScmType.ExternalGit;

  const getBuildDescription = () => {
    switch (formProps.values.buildProvider) {
      case BuildProvider.GitHubAction:
        return t('deploymentCenterGitHubActionsBuildDescription');
      case BuildProvider.AppServiceBuildService:
        return t('deploymentCenterKuduBuildDescription');
      case BuildProvider.Vsts:
        return t('deploymentCenterVstsBuildDescription');
    }
  };

  const getCalloutContent = () => {
    return (
      isCalloutVisible && (
        <DeploymentCenterCodeBuildCallout
          selectedBuildChoice={selectedBuildChoice}
          updateSelectedBuildChoiceOption={updateSelectedBuildChoiceOption}
          calloutOkButtonDisabled={calloutOkButtonDisabled}
          toggleIsCalloutVisible={toggleIsCalloutVisible}
          updateSelectedBuild={updateSelectedBuild}
          formProps={formProps}
          runtimeStack={defaultStackAndVersion.runtimeStack}
          runtimeVersion={defaultStackAndVersion.runtimeVersion}
        />
      )
    );
  };

  const openConfigurationBlade = async () => {
    const result = await portalContext.openBlade({
      detailBlade: 'SiteConfigSettingsFrameBladeReact',
      extension: 'WebsitesExtension',
      detailBladeInputs: {
        id: deploymentCenterContext.resourceId,
      },
    });

    if (result) {
      deploymentCenterContext.refresh();
    }
  };

  const showBasicAuthError = useMemo(() => {
    const isGitHubActionsOrKuduBuild =
      selectedBuild === BuildProvider.GitHubAction || selectedBuild === BuildProvider.AppServiceBuildService;
    setBasicAuthErrorMessage(
      selectedBuild === BuildProvider.GitHubAction
        ? t('deploymentCenterScmBasicAuthErrorMessageWithOidc')
        : t('deploymentCenterScmBasicAuthErrorMessage')
    );
    const isBasicAuthSelected = formProps.values.authType === AuthType.PublishProfile;
    return (
      isBasicAuthSelected && isGitHubActionsOrKuduBuild && !deploymentCenterPublishingContext.basicPublishingCredentialsPolicies?.scm.allow
    );
  }, [selectedBuild, deploymentCenterPublishingContext.basicPublishingCredentialsPolicies?.scm.allow, formProps.values.authType]);

  useEffect(() => {
    if (selectedBuild === BuildProvider.GitHubAction) {
      formProps.setFieldValue('authType', AuthType.Oidc);
    } else {
      formProps.setFieldValue('authType', AuthType.PublishProfile);
    }
  }, [selectedBuild]);

  const showNoWritePermissionBanner = useMemo(() => {
    return !deploymentCenterContext.hasWritePermission;
  }, [deploymentCenterContext.hasWritePermission]);

  const [showDCReactView, setShowDCReactView] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    portalContext?.getBooleanFlight(ExperimentationConstants.FlightVariable.showDCReactView).then(hasFlightEnabled => {
      if (isSubscribed) {
        setShowDCReactView(hasFlightEnabled);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [portalContext]);

  const showOptIntoDCReactViewBanner = useMemo(() => {
    const isLinuxCodeWebApp = siteStateContext?.isLinuxApp && !siteStateContext?.isContainerApp && !siteStateContext?.isFunctionApp;
    const canUseGitHub = scenarioService.checkScenario(ScenarioIds.githubSource, { site: siteStateContext.site }).status !== 'disabled';
    return showDCReactView && isLinuxCodeWebApp && canUseGitHub;
  }, [
    showDCReactView,
    siteStateContext?.isLinuxApp,
    siteStateContext?.isContainerApp,
    siteStateContext?.isFunctionApp,
    scenarioService,
    siteStateContext.site,
  ]);

  const openDCReactView = () => {
    portalContext.log(
      getTelemetryInfo('info', 'optIntoDCReactView', 'submit', {
        resourceId: deploymentCenterContext.resourceId,
      })
    );
    siteStateContext.setIsLoading(true);
    portalContext.broadcastMessage(BroadcastMessageId.optIntoDCReactView, deploymentCenterContext.resourceId);
  };

  return (
    <>
      {showNoWritePermissionBanner ? (
        <div className={deploymentCenterInfoBannerDiv}>
          <CustomBanner
            id="deployment-center-no-write-error"
            message={t('deploymentCenterNoWritePermissionsError')}
            type={MessageBarType.blocked}
          />
        </div>
      ) : (
        <>
          {showOptIntoDCReactViewBanner && (
            <div className={deploymentCenterInfoBannerDiv}>
              <CustomBanner
                id="deployment-center-opt-into-dc-react-view"
                message={t('deploymentCenterSidecarForCodePrompt')}
                type={MessageBarType.info}
                onClick={openDCReactView}
              />
            </div>
          )}
          {showBasicAuthError && (
            <div className={deploymentCenterInfoBannerDiv}>
              <CustomBanner
                id="deployment-center-scm-basic-auth-warning"
                message={basicAuthErrorMessage ?? ''}
                type={MessageBarType.error}
                onClick={openConfigurationBlade}
              />
            </div>
          )}

          {getInProductionSlot() && showInfoBanner && !showBasicAuthError && (
            <div className={deploymentCenterInfoBannerDiv}>
              <CustomBanner
                id="deployment-center-prod-slot-warning"
                message={t('deploymentCenterProdSlotWarning')}
                type={MessageBarType.info}
                onDismiss={closeInfoBanner}
                learnMoreLink={DeploymentCenterLinks.configureDeploymentSlots}
                learnMoreLinkAriaLabel={t('deploymentCenterProdSlotWarningLinkAriaLabel')}
              />
            </div>
          )}

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

          <Field
            label={t('deploymentCenterSettingsSourceLabel')}
            placeholder={t('deploymentCenterCodeSettingsSourcePlaceholder')}
            name="sourceProvider"
            component={Dropdown}
            displayInVerticalLayout={true}
            options={getSourceOptions()}
            required={true}
            aria-required={true}
          />

          {isSourceSelected &&
            (isAzureDevOpsSupportedBuild ? (
              <>
                <ReactiveFormControl id="deployment-center-build-provider-text" pushContentRight={true}>
                  <div>
                    {getBuildDescription()}
                    {!isFlexFunctionAppAndHasVsoProvider && (
                      <Link
                        key="deployment-center-change-build-provider"
                        onClick={toggleIsCalloutVisible}
                        className={additionalTextFieldControl}
                        aria-label={t('deploymentCenterChangeBuildText')}>
                        {`${t('deploymentCenterChangeBuildText')}`}
                      </Link>
                    )}
                  </div>
                </ReactiveFormControl>
                {getCalloutContent()}
              </>
            ) : (
              <ReactiveFormControl id="deployment-center-build-provider-text" pushContentRight={true}>
                <div>{getBuildDescription()}</div>
              </ReactiveFormControl>
            ))}
        </>
      )}
    </>
  );
};

export default DeploymentCenterCodeSourceAndBuild;
