import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { IDropdownOption, DropdownMenuItemType, Link, MessageBarType } from 'office-ui-fabric-react';
import { ScmType } from '../../../../models/site/config';
import { Field } from 'formik';
import Dropdown from '../../../../components/form-controls/DropDown';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { deploymentCenterInfoBannerDiv } from '../DeploymentCenter.styles';

const DeploymentCenterCodeSource: React.FC<{}> = props => {
  // const { formProps } = props;
  const { t } = useTranslation();

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
    </>
  );
};

export default DeploymentCenterCodeSource;
