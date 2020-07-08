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

const DeploymentCenterCodeSourceAndBuild: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();

  const [selectedBuild, setSelectedBuild] = useState<BuildProvider>(BuildProvider.None);
  const [selectedBuildChoice, setSelectedBuildChoice] = useState<BuildProvider>(BuildProvider.None);
  const [isCalloutVisible, setIsCalloutVisible] = useState(false);

  const deploymentCenterContext = useContext(DeploymentCenterContext);

  const toggleIsCalloutVisible = () => {
    setSelectedBuildChoice(selectedBuild);
    setIsCalloutVisible(!isCalloutVisible);
  };

  const getInProductionSlot = () => {
    return !(deploymentCenterContext.siteDescriptor && deploymentCenterContext.siteDescriptor.slot);
  };

  const sourceOptions: IDropdownOption[] = [
    {
      key: 'continuousDeploymentHeader',
      text: t('deploymentCenterCodeSettingsSourceContinuousDeploymentHeader'),
      itemType: DropdownMenuItemType.Header,
    },
    { key: ScmType.GitHub, text: t('deploymentCenterCodeSettingsSourceGitHub') },
    { key: ScmType.Vso, text: t('deploymentCenterCodeSettingsSourceAzureRepos') },
    { key: ScmType.BitbucketGit, text: t('deploymentCenterCodeSettingsSourceBitbucket') },
    { key: ScmType.LocalGit, text: t('deploymentCenterCodeSettingsSourceLocalGit') },
    { key: 'divider_1', text: '-', itemType: DropdownMenuItemType.Divider },
    {
      key: 'manualDeploymentHeader',
      text: t('deploymentCenterCodeSettingsSourceManualDeploymentHeader'),
      itemType: DropdownMenuItemType.Header,
    },
    { key: ScmType.OneDrive, text: t('deploymentCenterCodeSettingsSourceOneDrive') },
    { key: ScmType.Dropbox, text: t('deploymentCenterCodeSettingsSourceDropbox') },
    { key: ScmType.ExternalGit, text: t('deploymentCenterCodeSettingsSourceExternal') },
  ];

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
    if (formProps.values.sourceProvider !== ScmType.GitHub) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.sourceProvider]);

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
      {getInProductionSlot() && (
        <div className={deploymentCenterInfoBannerDiv}>
          <CustomBanner message={t('deploymentCenterProdSlotWarning')} type={MessageBarType.info} />
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
        options={sourceOptions}
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
