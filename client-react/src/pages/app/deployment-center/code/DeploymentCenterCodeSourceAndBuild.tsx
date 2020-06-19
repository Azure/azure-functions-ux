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
import { deploymentCenterInfoBannerDiv } from '../DeploymentCenter.styles';
import { BuildDropdownOption, DeploymentCenterFieldProps, DeploymentCenterCodeFormData } from '../DeploymentCenter.types';

const DeploymentCenterCodeSourceAndBuild: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();

  const [selectedBuild, setSelectedBuild] = useState<BuildProvider>(BuildProvider.None);

  const deploymentCenterContext = useContext(DeploymentCenterContext);

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

  const buildOptions: BuildDropdownOption[] = [
    { key: BuildProvider.GitHubAction, text: t('deploymentCenterCodeSettingsBuildGitHubAction'), buildType: BuildProvider.GitHubAction },
    {
      key: BuildProvider.AppServiceBuildService,
      text: t('deploymentCenterCodeSettingsBuildKudu'),
      buildType: BuildProvider.AppServiceBuildService,
    },
  ];

  const updateSelectedBuild = (e: any, option: BuildDropdownOption) => {
    setSelectedBuild(option.buildType);
    if (formProps) {
      formProps.setFieldValue('buildProvider', option.buildType);
    }
  };

  const isSourceSelected = formProps && formProps.values.sourceProvider !== ScmType.None;
  const isGitHubSource = formProps && formProps.values.sourceProvider === ScmType.GitHub;

  useEffect(
    () => {
      if (formProps && formProps.values.sourceProvider !== ScmType.GitHub) {
        setSelectedBuild(BuildProvider.AppServiceBuildService);
        formProps.setFieldValue('buildProvider', BuildProvider.AppServiceBuildService);
      }

      if (formProps && formProps.values.sourceProvider === ScmType.GitHub) {
        setSelectedBuild(BuildProvider.GitHubAction);
        formProps.setFieldValue('buildProvider', BuildProvider.GitHubAction);
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    formProps ? [formProps.values.sourceProvider] : []
  );

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

      {isSourceSelected && (
        <Field
          id="deployment-center-code-settings-build-option"
          label={t('deploymentCenterSettingsBuildLabel')}
          name="buildProvider"
          component={Dropdown}
          displayInVerticalLayout={true}
          options={buildOptions}
          selectedKey={selectedBuild}
          onChange={updateSelectedBuild}
          required={true}
          disabled={!isGitHubSource}
        />
      )}
    </>
  );
};

export default DeploymentCenterCodeSourceAndBuild;
