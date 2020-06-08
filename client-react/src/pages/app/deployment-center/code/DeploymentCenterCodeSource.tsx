import React from 'react';
import { useTranslation } from 'react-i18next';
import { IDropdownOption, DropdownMenuItemType, Link } from 'office-ui-fabric-react';
import { ScmTypes } from '../../../../models/site/config';
import { Field } from 'formik';
import Dropdown from '../../../../components/form-controls/DropDown';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';

const DeploymentCenterCodeSource: React.FC<{}> = props => {
  const { t } = useTranslation();

  const options: IDropdownOption[] = [
    {
      key: 'continuousDeploymentHeader',
      text: t('deploymentCenterCodeSettingsSourceContinuousDeploymentHeader'),
      itemType: DropdownMenuItemType.Header,
    },
    { key: ScmTypes.GitHub, text: t('deploymentCenterCodeSettingsSourceGitHub') },
    { key: ScmTypes.Vso, text: t('deploymentCenterCodeSettingsSourceAzureRepos') },
    { key: ScmTypes.BitbucketGit, text: t('deploymentCenterCodeSettingsSourceBitbucket') },
    { key: ScmTypes.LocalGit, text: t('deploymentCenterCodeSettingsSourceLocalGit') },
    { key: 'divider_1', text: '-', itemType: DropdownMenuItemType.Divider },
    {
      key: 'manualDeploymentHeader',
      text: t('deploymentCenterCodeSettingsSourceManualDeploymentHeader'),
      itemType: DropdownMenuItemType.Header,
    },
    { key: ScmTypes.OneDrive, text: t('deploymentCenterCodeSettingsSourceOneDrive') },
    { key: ScmTypes.Dropbox, text: t('deploymentCenterCodeSettingsSourceDropbox') },
    { key: ScmTypes.ExternalGit, text: t('deploymentCenterCodeSettingsSourceExternal') },
  ];

  return (
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

      <Field
        id="deployment-center-container-settings-source-option"
        label={t('deploymentCenterSettingsSourceLabel')}
        placeholder={t('deploymentCenterCodeSettingsSourcePlaceholder')}
        name="sourceProvider"
        component={Dropdown}
        displayInVerticalLayout={true}
        options={options}
        required={true}
      />
    </>
  );
};

export default DeploymentCenterCodeSource;
