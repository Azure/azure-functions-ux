import React, { useContext, useState } from 'react';
import { Field } from 'formik';
import {
  DeploymentCenterFtpsProps,
  DeploymentCenterFieldProps,
  DeploymentCenterContainerFormData,
  DeploymentCenterCodeFormData,
} from './DeploymentCenter.types';
import { MessageBarType, ActionButton, ProgressIndicator } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { deploymentCenterContent, additionalTextFieldControl, deploymentCenterInfoBannerDiv } from './DeploymentCenter.styles';
import TextFieldNoFormik from '../../../components/form-controls/TextFieldNoFormik';
import TextField from '../../../components/form-controls/TextField';
import CustomBanner from '../../../components/CustomBanner/CustomBanner';
import { DeploymentCenterContext } from './DeploymentCenterContext';
import CustomFocusTrapCallout from '../../../components/CustomCallout/CustomFocusTrapCallout';
import { Links } from '../../../utils/FwLinks';
import { DeploymentCenterPublishingContext } from './DeploymentCenterPublishingContext';
import { ScmType } from '../../../models/site/config';
import { getGitCloneUri } from './utility/DeploymentCenterUtility';

type PasswordFieldType = 'password' | undefined;

const DeploymentCenterFtps: React.FC<
  DeploymentCenterFtpsProps & DeploymentCenterFieldProps<DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>
> = props => {
  const { t } = useTranslation();
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);

  const { isLoading } = props;
  const { publishingProfile, publishingUser, resetApplicationPassword } = deploymentCenterPublishingContext;

  const [applicationPasswordType, setApplicationPasswordType] = useState<PasswordFieldType>('password');
  const [providerPasswordType, setProviderPasswordType] = useState<PasswordFieldType>('password');
  const [providerConfirmPasswordType, setProviderConfirmPasswordType] = useState<PasswordFieldType>('password');
  const [isResetCalloutHidden, setIsResetCalloutHidden] = useState<boolean>(true);
  const [showBlockedBanner, setShowBlockedBanner] = useState(true);

  const ftpsEndpoint = publishingProfile && publishingProfile.publishUrl.toLocaleLowerCase().replace('ftp:/', 'ftps:/');
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

  const isScmLocalGit = deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.LocalGit;
  const gitCloneUri = getGitCloneUri(deploymentCenterPublishingContext);

  const toggleResetCalloutVisibility = () => {
    setIsResetCalloutHidden(!isResetCalloutHidden);
  };

  const resetApplicationPasswordFromCallout = () => {
    resetApplicationPassword();
    setIsResetCalloutHidden(true);
  };

  const toggleShowApplicationPassword = () => {
    setApplicationPasswordType(!applicationPasswordType ? 'password' : undefined);
  };

  const toggleShowProviderPassword = () => {
    setProviderPasswordType(!providerPasswordType ? 'password' : undefined);
  };

  const toggleShowProviderConfirmPassword = () => {
    setProviderConfirmPasswordType(!providerConfirmPasswordType ? 'password' : undefined);
  };

  const getProgressIndicator = () => {
    return <ProgressIndicator description={t('deploymentCenterFtpLoading')} ariaValueText={t('deploymentCenterFtpLoadingAriaValue')} />;
  };

  const closeBlockedBanner = () => {
    setShowBlockedBanner(false);
  };

  const disableFtp = () =>
    deploymentCenterPublishingContext.basicPublishingCredentialsPolicies &&
    deploymentCenterPublishingContext.basicPublishingCredentialsPolicies.ftp &&
    !deploymentCenterPublishingContext.basicPublishingCredentialsPolicies.ftp.allow;

  const getDisabledByFTPPolicyMessage = () => (
    <div className={deploymentCenterContent}>
      <CustomBanner message={t('ftpDisabledByPolicy')} type={MessageBarType.info} learnMoreLink={Links.ftpDisabledByPolicyLink} />
    </div>
  );

  const getCredentialsControls = () => {
    return (
      <div className={deploymentCenterContent}>
        {deploymentCenterContext && !deploymentCenterContext.hasWritePermission && showBlockedBanner && (
          <div className={deploymentCenterInfoBannerDiv}>
            <CustomBanner
              message={t('deploymentCenterFtpsWritePermissionRequired')}
              type={MessageBarType.blocked}
              onDismiss={closeBlockedBanner}
            />
          </div>
        )}

        <p>{t('deploymentCenterFtpsDescription')}</p>
        <TextFieldNoFormik
          id="deployment-center-ftps-endpoint"
          label={t('deploymentCenterFtpsEndpointLabel')}
          widthOverride="100%"
          value={ftpsEndpoint}
          copyButton={true}
          disabled={true}
        />

        {isScmLocalGit && (
          <TextFieldNoFormik
            id="deployment-center-localgit-clone-uri"
            label={t('deploymentCenterCodeLocalGitCloneUri')}
            widthOverride="100%"
            value={gitCloneUri ? gitCloneUri : t('deploymentCenterCodeLocalGitFetchCloneUriError')}
            copyButton={true}
            disabled={true}
          />
        )}

        <h3>{t('deploymentCenterFtpsApplicationScopeTitle')}</h3>
        <p>{t('deploymentCenterFtpsApplicationScopeDescription')}</p>

        <TextFieldNoFormik
          id="deployment-center-ftps-application-username"
          label={t('deploymentCenterFtpsUsernameLabel')}
          widthOverride="100%"
          value={publishingProfile && publishingProfile.userName}
          copyButton={true}
          disabled={true}
        />

        <TextFieldNoFormik
          id="deployment-center-ftps-application-password"
          label={t('deploymentCenterFtpsPasswordLabel')}
          widthOverride="100%"
          value={publishingProfile && publishingProfile.userPWD}
          copyButton={true}
          disabled={true}
          type={applicationPasswordType}
          additionalControls={[
            <ActionButton
              id="deployment-center-ftps-application-password-visibility-toggle"
              key="deployment-center-ftps-application-password-visibility-toggle"
              className={additionalTextFieldControl}
              ariaLabel={
                applicationPasswordType === 'password' ? t('showApplicationPasswordAriaLabel') : t('hideApplicationPasswordAriaLabel')
              }
              onClick={toggleShowApplicationPassword}
              iconProps={{ iconName: applicationPasswordType === 'password' ? 'RedEye' : 'Hide' }}>
              {applicationPasswordType === 'password' ? t('show') : t('hide')}
            </ActionButton>,
            <ActionButton
              id="deployment-center-ftps-application-password-reset"
              key="deployment-center-ftps-application-password-reset"
              className={additionalTextFieldControl}
              ariaLabel={t('resetPublishProfileAriaLabel')}
              onClick={toggleResetCalloutVisibility}
              iconProps={{ iconName: 'refresh' }}>
              {t('reset')}
            </ActionButton>,
          ]}
        />

        <CustomFocusTrapCallout
          target="#deployment-center-ftps-application-password-reset"
          onDismissFunction={toggleResetCalloutVisibility}
          setInitialFocus={true}
          hidden={isResetCalloutHidden}
          title={t('resetPublishProfileConfirmationTitle')}
          description={t('resetPublishProfileConfirmationDescription')}
          primaryButtonTitle={t('reset')}
          primaryButtonFunction={resetApplicationPasswordFromCallout}
          defaultButtonTitle={t('cancel')}
          defaultButtonFunction={toggleResetCalloutVisibility}
        />

        <h3>{t('deploymentCenterFtpsUserScopeTitle')}</h3>
        <p>{t('deploymentCenterFtpsUserScopeDescription').format(sampleWebProviderDomainUsername)}</p>

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
      </div>
    );
  };

  if (isLoading) {
    return getProgressIndicator();
  } else if (disableFtp()) {
    return getDisabledByFTPPolicyMessage();
  } else {
    return getCredentialsControls();
  }
};

export default DeploymentCenterFtps;
