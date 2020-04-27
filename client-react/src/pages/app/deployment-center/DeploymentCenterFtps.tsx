import React, { useContext } from 'react';
import { FormikProps, Field } from 'formik';
import { DeploymentCenterFormValues } from './DeploymentCenter.types';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { deploymentCenterContent } from './DeploymentCenter.styles';
import TextFieldNoFormik from '../../../components/form-controls/TextFieldNoFormik';
import { SiteStateContext } from '../../../SiteState';
import { ArmSiteDescriptor } from '../../../utils/resourceDescriptors';
import TextField from '../../../components/form-controls/TextField';

export type DeploymentCenterFtpsPropType = FormikProps<DeploymentCenterFormValues>;

const DeploymentCenterFtps: React.FC<DeploymentCenterFtpsPropType> = props => {
  const { t } = useTranslation();
  const ftpsPublishingProfile = props && props.initialValues && props.initialValues.ftpPublishingProfile;
  const ftpsEndpoint = ftpsPublishingProfile && ftpsPublishingProfile.publishUrl.toLocaleLowerCase().replace('ftp:/', 'ftps:/');
  const publishingUser = props && props.initialValues && props.initialValues.publishingUser;
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
      {props && !props.initialValues.hasWritePermission && (
        <MessageBar messageBarType={MessageBarType.blocked} isMultiline={false}>
          {t('deploymentCenterFtpsWritePermissionRequired')}
        </MessageBar>
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

      <Field
        name="ftpPublishingProfile.userName"
        component={TextField}
        label={t('deploymentCenterFtpsUsernameLabel')}
        id="deployment-center-ftps-application-password"
      />

      <Field
        name="ftpPublishingProfile.userPWD"
        component={TextField}
        label={t('deploymentCenterFtpsPasswordLabel')}
        id="deployment-center-ftps-application-password"
      />

      <h3>{t('deploymentCenterFtpsUserScopeTitle')}</h3>
      <p>{t('deploymentCenterFtpsUserScopeDescription').format(sampleWebProviderDomainUsername)}</p>

      <Field
        name="publishingUser.properties.publishingUserName"
        component={TextField}
        label={t('deploymentCenterFtpsUsernameLabel')}
        id="deployment-center-ftps-provider-username"
      />

      <Field
        name="publishingUser.properties.publishingPassword"
        component={TextField}
        label={t('deploymentCenterFtpsPasswordLabel')}
        id="deployment-center-ftps-provider-password"
      />

      <Field
        name="publishingUser.properties.publishingPassword"
        component={TextField}
        label={t('deploymentCenterFtpsConfirmPasswordLabel')}
        id="deployment-center-ftps-provider-confirm-password"
      />
    </div>
  );
};

export default DeploymentCenterFtps;
