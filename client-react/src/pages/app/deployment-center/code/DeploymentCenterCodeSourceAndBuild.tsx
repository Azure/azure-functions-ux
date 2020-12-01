import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IDropdownOption, DropdownMenuItemType, Link, MessageBarType } from 'office-ui-fabric-react';
import { BuildProvider, ScmType } from '../../../../models/site/config';
import { Field } from 'formik';
import Dropdown from '../../../../components/form-controls/DropDown';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { deploymentCenterInfoBannerDiv, additionalTextFieldControl } from '../DeploymentCenter.styles';
import { DeploymentCenterFieldProps, DeploymentCenterCodeFormData, BuildChoiceGroupOption } from '../DeploymentCenter.types';
import { Guid } from '../../../../utils/Guid';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import DeploymentCenterCodeBuildCallout from './DeploymentCenterCodeBuildCallout';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { SiteStateContext } from '../../../../SiteState';
import Url from '../../../../utils/url';
import { CommonConstants } from '../../../../utils/CommonConstants';

const DeploymentCenterCodeSourceAndBuild: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const scenarioService = new ScenarioService(t);

  const [selectedBuild, setSelectedBuild] = useState<BuildProvider>(BuildProvider.None);
  const [selectedBuildChoice, setSelectedBuildChoice] = useState<BuildProvider>(BuildProvider.None);
  const [isCalloutVisible, setIsCalloutVisible] = useState(false);
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);

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
    const items: IDropdownOption[] = [];

    items.push({
      key: 'continuousDeploymentHeader',
      text: t('deploymentCenterCodeSettingsSourceContinuousDeploymentHeader'),
      itemType: DropdownMenuItemType.Header,
    });

    items.push({ key: ScmType.GitHub, text: t('deploymentCenterCodeSettingsSourceGitHub') });
    items.push({ key: ScmType.BitbucketGit, text: t('deploymentCenterCodeSettingsSourceBitbucket') });
    items.push({ key: ScmType.LocalGit, text: t('deploymentCenterCodeSettingsSourceLocalGit') });

    const flagValue = Url.getFeatureValue(CommonConstants.FeatureFlags.enableAzureDevOpsSetup);
    if (flagValue && flagValue.toLocaleLowerCase() === 'true') {
      items.push({ key: ScmType.Vsts, text: t('deploymentCenterCodeSettingsSourceAzureRepos') });
    }

    items.push({ key: 'divider_1', text: '-', itemType: DropdownMenuItemType.Divider });
    return items;
  };

  const getManualDeploymentOptions = (): IDropdownOption[] => {
    const manualDeploymentOptions: IDropdownOption[] = [];

    if (scenarioService.checkScenario(ScenarioIds.externalSource, { site: siteStateContext.site }).status !== 'disabled') {
      manualDeploymentOptions.push({ key: ScmType.ExternalGit, text: t('deploymentCenterCodeSettingsSourceExternalGit') });
    }

    if (scenarioService.checkScenario(ScenarioIds.onedriveSource, { site: siteStateContext.site }).status !== 'disabled') {
      manualDeploymentOptions.push({ key: ScmType.OneDrive, text: t('deploymentCenterCodeSettingsSourceOneDrive') });
    }

    if (scenarioService.checkScenario(ScenarioIds.dropboxSource, { site: siteStateContext.site }).status !== 'disabled') {
      manualDeploymentOptions.push({ key: ScmType.Dropbox, text: t('deploymentCenterCodeSettingsSourceDropbox') });
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
    if (formProps.values.sourceProvider !== ScmType.None) {
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
      setSelectedBuild(BuildProvider.GitHubAction);
      formProps.setFieldValue('buildProvider', BuildProvider.GitHubAction);
      formProps.setFieldValue(
        'gitHubPublishProfileSecretGuid',
        Guid.newGuid()
          .toLowerCase()
          .replace(/[-]/g, '')
      );
    } else {
      setSelectedBuild(BuildProvider.AppServiceBuildService);
      formProps.setFieldValue('buildProvider', BuildProvider.AppServiceBuildService);
    }
  };

  const isSourceSelected = formProps.values.sourceProvider !== ScmType.None;
  const isGitHubSource = formProps.values.sourceProvider === ScmType.GitHub;
  const isGitHubActionsBuild = formProps.values.buildProvider === BuildProvider.GitHubAction;
  const calloutOkButtonDisabled = selectedBuildChoice === selectedBuild;

  const getBuildDescription = () => {
    return isGitHubActionsBuild ? t('deploymentCenterGitHubActionsBuildDescription') : t('deploymentCenterKuduBuildDescription');
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
        />
      )
    );
  };

  return (
    <>
      {getInProductionSlot() && showInfoBanner && (
        <div className={deploymentCenterInfoBannerDiv}>
          <CustomBanner
            message={t('deploymentCenterProdSlotWarning')}
            type={MessageBarType.info}
            onDismiss={closeInfoBanner}
            learnMoreLink={DeploymentCenterLinks.configureDeploymentSlots}
          />
        </div>
      )}

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

      <Field
        id="deployment-center-code-settings-source-option"
        label={t('deploymentCenterSettingsSourceLabel')}
        placeholder={t('deploymentCenterCodeSettingsSourcePlaceholder')}
        name="sourceProvider"
        component={Dropdown}
        displayInVerticalLayout={true}
        options={getSourceOptions()}
        required={true}
      />

      {isSourceSelected &&
        (isGitHubSource ? (
          <>
            <ReactiveFormControl id="deployment-center-build-provider-text" pushContentRight={true}>
              <div>
                {getBuildDescription()}
                <Link
                  key="deployment-center-change-build-provider"
                  onClick={toggleIsCalloutVisible}
                  className={additionalTextFieldControl}
                  aria-label={t('deploymentCenterChangeBuildText')}>
                  {`${t('deploymentCenterChangeBuildText')}`}
                </Link>
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
  );
};

export default DeploymentCenterCodeSourceAndBuild;
