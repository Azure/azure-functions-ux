import React, { useContext, useState } from 'react';
import { Field } from 'formik';
import {
  DeploymentCenterFtpsProps,
  DeploymentCenterFieldProps,
  DeploymentCenterContainerFormData,
  DeploymentCenterCodeFormData,
} from './DeploymentCenter.types';
import { ActionButton, MessageBarType, ProgressIndicator } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { deploymentCenterContent, additionalTextFieldControl } from './DeploymentCenter.styles';
import TextField from '../../../components/form-controls/TextField';
import { DeploymentCenterContext } from './DeploymentCenterContext';
import { DeploymentCenterPublishingContext } from './DeploymentCenterPublishingContext';
import CustomBanner from '../../../components/CustomBanner/CustomBanner';

type PasswordFieldType = 'password' | undefined;

const DeploymentCenterPublishingUser: React.FC<
  DeploymentCenterFtpsProps & DeploymentCenterFieldProps<DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>
> = props => {
  const { t } = useTranslation();
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);

  const { publishingUser, publishingUserFetchFailedMessage } = deploymentCenterPublishingContext;

  const [providerPasswordType, setProviderPasswordType] = useState<PasswordFieldType>('password');
  const [providerConfirmPasswordType, setProviderConfirmPasswordType] = useState<PasswordFieldType>('password');

  const publishingUserLoading = !publishingUser && !publishingUserFetchFailedMessage;
  const publishingUserError = !publishingUser && publishingUserFetchFailedMessage;
  const webProviderUsername = publishingUser && publishingUser.properties.publishingUserName;

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

  const toggleShowProviderPassword = () => {
    setProviderPasswordType(!providerPasswordType ? 'password' : undefined);
  };

  const toggleShowProviderConfirmPassword = () => {
    setProviderConfirmPasswordType(!providerConfirmPasswordType ? 'password' : undefined);
  };

  return (
    <div className={deploymentCenterContent}>
      <h3>{t('deploymentCenterFtpsUserScopeTitle')}</h3>
      <p>{t('deploymentCenterFtpsUserScopeDescription').format(sampleWebProviderDomainUsername)}</p>

      {publishingUserLoading && (
        <ProgressIndicator
          description={t('deploymentCenterPublishingUserLoadingMessage')}
          ariaValueText={t('deploymentCenterPublishingUserLoadingAriaLabel')}
        />
      )}

      {publishingUserError && <CustomBanner message={publishingUserFetchFailedMessage} type={MessageBarType.error} />}

      {publishingUser && (
        <>
          <Field
            id="deployment-center-ftps-provider-username"
            name="publishingUsername"
            component={TextField}
            widthOverride="60%"
            label={t('deploymentCenterFtpsUsernameLabel')}
          />

          <Field
            id="deployment-center-ftps-provider-password"
            name="publishingPassword"
            component={TextField}
            widthOverride="60%"
            label={t('deploymentCenterFtpsPasswordLabel')}
            type={providerPasswordType}
            additionalControls={[
              <ActionButton
                id="deployment-center-ftps-provider-password-visibility-toggle"
                key="deployment-center-ftps-provider-password-visibility-toggle"
                className={additionalTextFieldControl}
                ariaLabel={providerPasswordType === 'password' ? t('showProviderPasswordAriaLabel') : t('hideProviderPasswordAriaLabel')}
                onClick={toggleShowProviderPassword}
                iconProps={{ iconName: providerPasswordType === 'password' ? 'RedEye' : 'Hide' }}>
                {providerPasswordType === 'password' ? t('show') : t('hide')}
              </ActionButton>,
            ]}
          />

          <Field
            id="deployment-center-ftps-provider-confirm-password"
            name="publishingConfirmPassword"
            component={TextField}
            widthOverride="60%"
            label={t('deploymentCenterFtpsConfirmPasswordLabel')}
            type={providerConfirmPasswordType}
            additionalControls={[
              <ActionButton
                id="deployment-center-ftps-provider-confirm-password-visibility-toggle"
                key="deployment-center-ftps-provider-confirm-password-visibility-toggle"
                className={additionalTextFieldControl}
                ariaLabel={
                  providerConfirmPasswordType === 'password'
                    ? t('showProviderConfirmPasswordAriaLabel')
                    : t('hideProviderConfirmPasswordAriaLabel')
                }
                onClick={toggleShowProviderConfirmPassword}
                iconProps={{ iconName: providerConfirmPasswordType === 'password' ? 'RedEye' : 'Hide' }}>
                {providerConfirmPasswordType === 'password' ? t('show') : t('hide')}
              </ActionButton>,
            ]}
          />
        </>
      )}
    </div>
  );
};

export default DeploymentCenterPublishingUser;
