import React, { useContext } from 'react';
import { Field } from 'formik';
import { DeploymentCenterFtpsProps } from './DeploymentCenter.types';
import { MessageBarType } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { deploymentCenterContent } from './DeploymentCenter.styles';
import TextFieldNoFormik from '../../../components/form-controls/TextFieldNoFormik';
import { SiteStateContext } from '../../../SiteState';
import { ArmSiteDescriptor } from '../../../utils/resourceDescriptors';
import TextField from '../../../components/form-controls/TextField';
import CustomBanner from '../../../components/CustomBanner/CustomBanner';

const DeploymentCenterFtps: React.FC<DeploymentCenterFtpsProps> = props => {
  const { t } = useTranslation();
  const ftpsPublishingProfile = props && props.publishingProfile;
  const ftpsEndpoint = ftpsPublishingProfile && ftpsPublishingProfile.publishUrl.toLocaleLowerCase().replace('ftp:/', 'ftps:/');
  const publishingUser = props && props.publishingUser;
  const webProviderUsername = publishingUser && publishingUser.properties.publishingUserName;

  const { site } = useContext(SiteStateContext);
  const webAppArmDescriptor = site && new ArmSiteDescriptor(site.id);
  const sampleAppNameDomain =
    webAppArmDescriptor && webAppArmDescriptor.slot
      ? `${webAppArmDescriptor.site}-${webAppArmDescriptor.slot}`
      : webAppArmDescriptor && webAppArmDescriptor.site
      ? webAppArmDescriptor.site
      : '';

  const sampleWebProviderDomainUsername = webProviderUsername
    ? `${sampleAppNameDomain}\\${webProviderUsername}`
    : `${sampleAppNameDomain}\\${t('deploymentCenterFtpsUserScopeSampleUsername')}`;

  return (
    <div className={deploymentCenterContent}>
      {props && !props.hasWritePermission && (
        <CustomBanner message={t('deploymentCenterFtpsWritePermissionRequired')} type={MessageBarType.blocked} />
      )}

      <p>{t('deploymentCenterFtpsDescription')}</p>
      <TextFieldNoFormik
        label={t('deploymentCenterFtpsEndpointLabel')}
        widthOverride="100%"
        id="deployment-center-ftps-endpoint"
        value={ftpsEndpoint}
        copyButton={true}
        disabled={true}
      />

      <h3>{t('deploymentCenterFtpsApplicationScopeTitle')}</h3>
      <p>{t('deploymentCenterFtpsApplicationScopeDescription')}</p>

      <TextFieldNoFormik
        label={t('deploymentCenterFtpsUsernameLabel')}
        widthOverride="100%"
        id="deployment-center-ftps-application-username"
        value={props && props.publishingProfile && props.publishingProfile.userName}
        copyButton={true}
        disabled={true}
      />

      <TextFieldNoFormik
        label={t('deploymentCenterFtpsPasswordLabel')}
        widthOverride="100%"
        id="deployment-center-ftps-application-password"
        value={props && props.publishingProfile && props.publishingProfile.userPWD}
        copyButton={true}
        disabled={true}
      />

      <h3>{t('deploymentCenterFtpsUserScopeTitle')}</h3>
      <p>{t('deploymentCenterFtpsUserScopeDescription').format(sampleWebProviderDomainUsername)}</p>

      <Field
        name="publishingUsername"
        component={TextField}
        widthOverride="60%"
        label={t('deploymentCenterFtpsUsernameLabel')}
        id="deployment-center-ftps-provider-username"
      />

      <Field
        name="publishingPassword"
        component={TextField}
        widthOverride="60%"
        label={t('deploymentCenterFtpsPasswordLabel')}
        id="deployment-center-ftps-provider-password"
      />

      <Field
        name="publishingConfirmPassword"
        component={TextField}
        widthOverride="60%"
        label={t('deploymentCenterFtpsConfirmPasswordLabel')}
        id="deployment-center-ftps-provider-confirm-password"
      />
    </div>
  );
};

export default DeploymentCenterFtps;
