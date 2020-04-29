import React, { useContext } from 'react';
import { Field } from 'formik';
import { DeploymentCenterFtpsProps } from './DeploymentCenter.types';
import { MessageBarType } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { deploymentCenterContent } from './DeploymentCenter.styles';
import TextFieldNoFormik from '../../../components/form-controls/TextFieldNoFormik';
import TextField from '../../../components/form-controls/TextField';
import CustomBanner from '../../../components/CustomBanner/CustomBanner';
import { DeploymentCenterContext } from './DeploymentCenterContext';

const DeploymentCenterFtps: React.FC<DeploymentCenterFtpsProps> = props => {
  const { t } = useTranslation();
  const { publishingProfile, publishingUser } = props;
  const ftpsEndpoint = publishingProfile && publishingProfile.publishUrl.toLocaleLowerCase().replace('ftp:/', 'ftps:/');
  const webProviderUsername = publishingUser && publishingUser.properties.publishingUserName;
  const deploymentCenterContext = useContext(DeploymentCenterContext);

  const siteDescriptor = deploymentCenterContext && deploymentCenterContext.siteDescriptor;
  const sampleAppNameDomain =
    siteDescriptor && siteDescriptor.slot
      ? `${siteDescriptor.site}-${siteDescriptor.slot}`
      : siteDescriptor && siteDescriptor.site
      ? siteDescriptor.site
      : '';

  const sampleWebProviderDomainUsername = webProviderUsername
    ? `${sampleAppNameDomain}\\${webProviderUsername}`
    : `${sampleAppNameDomain}\\${t('deploymentCenterFtpsUserScopeSampleUsername')}`;

  return (
    <div className={deploymentCenterContent}>
      {deploymentCenterContext && !deploymentCenterContext.hasWritePermission && (
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
