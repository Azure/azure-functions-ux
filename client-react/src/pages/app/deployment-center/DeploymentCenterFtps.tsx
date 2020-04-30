import React, { useContext, useState } from 'react';
import { Field } from 'formik';
import { DeploymentCenterFtpsProps } from './DeploymentCenter.types';
import { MessageBarType, ActionButton } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { deploymentCenterContent, additionalTextFieldControl } from './DeploymentCenter.styles';
import TextFieldNoFormik from '../../../components/form-controls/TextFieldNoFormik';
import TextField from '../../../components/form-controls/TextField';
import CustomBanner from '../../../components/CustomBanner/CustomBanner';
import { DeploymentCenterContext } from './DeploymentCenterContext';

type PasswordFieldType = 'password' | undefined;

const DeploymentCenterFtps: React.FC<DeploymentCenterFtpsProps> = props => {
  const { t } = useTranslation();
  const { publishingProfile, publishingUser, resetApplicationPassword } = props;
  const [applicationPasswordType, setApplicationPasswordType] = useState<PasswordFieldType>('password');
  const [providerPasswordType, setProviderPasswordType] = useState<PasswordFieldType>('password');
  const [providerConfirmPasswordType, setProviderConfirmPasswordType] = useState<PasswordFieldType>('password');
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

  const toggleShowApplicationPassword = () => {
    setApplicationPasswordType(!applicationPasswordType ? 'password' : undefined);
  };

  const toggleShowProviderPassword = () => {
    setProviderPasswordType(!providerPasswordType ? 'password' : undefined);
  };

  const toggleShowProviderConfirmPassword = () => {
    setProviderConfirmPasswordType(!providerConfirmPasswordType ? 'password' : undefined);
  };

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
        value={publishingProfile && publishingProfile.userName}
        copyButton={true}
        disabled={true}
      />

      <TextFieldNoFormik
        label={t('deploymentCenterFtpsPasswordLabel')}
        widthOverride="100%"
        id="deployment-center-ftps-application-password"
        value={publishingProfile && publishingProfile.userPWD}
        copyButton={true}
        disabled={true}
        type={applicationPasswordType}
        additionalControls={[
          <ActionButton
            className={additionalTextFieldControl}
            id="deployment-center-ftps-application-password-visibility-toggle"
            ariaLabel={
              applicationPasswordType === 'password' ? t('showApplicationPasswordAriaLabel') : t('hideApplicationPasswordAriaLabel')
            }
            onClick={toggleShowApplicationPassword}
            iconProps={{ iconName: applicationPasswordType === 'password' ? 'RedEye' : 'Hide' }}>
            {applicationPasswordType === 'password' ? t('show') : t('hide')}
          </ActionButton>,
          <ActionButton
            className={additionalTextFieldControl}
            id="deployment-center-ftps-application-password-reset"
            ariaLabel={t('resetPublishProfileAriaLabel')}
            onClick={resetApplicationPassword}
            iconProps={{ iconName: 'refresh' }}>
            {t('reset')}
          </ActionButton>,
        ]}
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
        type={providerPasswordType}
        additionalControls={[
          <ActionButton
            className={additionalTextFieldControl}
            id="deployment-center-ftps-provider-password-visibility-toggle"
            ariaLabel={applicationPasswordType === 'password' ? t('showProviderPasswordAriaLabel') : t('hideProviderPasswordAriaLabel')}
            onClick={toggleShowProviderPassword}
            iconProps={{ iconName: providerPasswordType === 'password' ? 'RedEye' : 'Hide' }}>
            {providerPasswordType === 'password' ? t('show') : t('hide')}
          </ActionButton>,
        ]}
      />

      <Field
        name="publishingConfirmPassword"
        component={TextField}
        widthOverride="60%"
        label={t('deploymentCenterFtpsConfirmPasswordLabel')}
        id="deployment-center-ftps-provider-confirm-password"
        type={providerConfirmPasswordType}
        additionalControls={[
          <ActionButton
            className={additionalTextFieldControl}
            id="deployment-center-ftps-provider-confirm-password-visibility-toggle"
            ariaLabel={
              applicationPasswordType === 'password' ? t('showProviderConfirmPasswordAriaLabel') : t('hideProviderConfirmPasswordAriaLabel')
            }
            onClick={toggleShowProviderConfirmPassword}
            iconProps={{ iconName: providerConfirmPasswordType === 'password' ? 'RedEye' : 'Hide' }}>
            {providerConfirmPasswordType === 'password' ? t('show') : t('hide')}
          </ActionButton>,
        ]}
      />
    </div>
  );
};

export default DeploymentCenterFtps;
