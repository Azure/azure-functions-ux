import React, { useContext, useState } from 'react';
import {
  DeploymentCenterFtpsProps,
  DeploymentCenterFieldProps,
  DeploymentCenterContainerFormData,
  DeploymentCenterCodeFormData,
} from './DeploymentCenter.types';
import { MessageBarType, ActionButton, ProgressIndicator, Link } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import {
  deploymentCenterContent,
  additionalTextFieldControl,
  deploymentCenterInfoBannerDiv,
  ftpsPasswordTextboxStyle,
  textboxPaddingStyle,
} from './DeploymentCenter.styles';
import TextFieldNoFormik from '../../../components/form-controls/TextFieldNoFormik';
import CustomBanner from '../../../components/CustomBanner/CustomBanner';
import { DeploymentCenterContext } from './DeploymentCenterContext';
import CustomFocusTrapCallout from '../../../components/CustomCallout/CustomFocusTrapCallout';
import { DeploymentCenterLinks, Links } from '../../../utils/FwLinks';
import { DeploymentCenterPublishingContext } from './DeploymentCenterPublishingContext';
import { ScmType } from '../../../models/site/config';
import { getGitCloneUri, getTelemetryInfo } from './utility/DeploymentCenterUtility';
import DeploymentCenterPublishingUser from './DeploymentCenterPublishingUser';
import { PortalContext } from '../../../PortalContext';
import { learnMoreLinkStyle } from '../../../components/form-controls/formControl.override.styles';

type PasswordFieldType = 'password' | undefined;

const DeploymentCenterFtps: React.FC<
  DeploymentCenterFtpsProps & DeploymentCenterFieldProps<DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>
> = props => {
  const { t } = useTranslation();
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const portalContext = useContext(PortalContext);

  const { isDataRefreshing, formProps } = props;
  const { publishingProfile, resetApplicationPassword } = deploymentCenterPublishingContext;

  const [applicationPasswordType, setApplicationPasswordType] = useState<PasswordFieldType>('password');
  const [isResetCalloutHidden, setIsResetCalloutHidden] = useState<boolean>(true);
  const [showBlockedBanner, setShowBlockedBanner] = useState(true);

  const ftpsEndpoint = publishingProfile && publishingProfile.publishUrl.toLocaleLowerCase().replace('ftp:/', 'ftps:/');
  const isScmLocalGit = deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.LocalGit;
  const gitCloneUri = getGitCloneUri(deploymentCenterPublishingContext);

  const toggleResetCalloutVisibility = () => {
    setIsResetCalloutHidden(!isResetCalloutHidden);
  };

  const resetApplicationPasswordFromCallout = () => {
    portalContext.log(
      getTelemetryInfo('info', 'resetFtpPassword', 'submit', {
        location: 'ftpsTab',
      })
    );

    resetApplicationPassword();
    setIsResetCalloutHidden(true);
  };

  const toggleShowApplicationPassword = () => {
    setApplicationPasswordType(!applicationPasswordType ? 'password' : undefined);
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
      <CustomBanner
        id="ftp-disabled-by-policy"
        message={t('ftpDisabledByPolicy')}
        type={MessageBarType.info}
        learnMoreLink={Links.ftpDisabledByPolicyLink}
      />
    </div>
  );

  const getCredentialsControls = () => {
    return (
      <div className={deploymentCenterContent}>
        {deploymentCenterContext && !deploymentCenterContext.hasWritePermission && showBlockedBanner && (
          <div className={deploymentCenterInfoBannerDiv}>
            <CustomBanner
              id="deployment-center-ftps-write-permission-required"
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
        <span id="deployment-publishing-user-message">{t('deploymentCenterFtpsApplicationScopeDescription')}</span>
        <Link
          id="deployment-center-settings-learnMore"
          href={DeploymentCenterLinks.publishingUserDocumentation}
          target="_blank"
          className={learnMoreLinkStyle}
          aria-labelledby="deployment-center-settings-message">
          {` ${t('learnMore')}`}
        </Link>

        <div className={textboxPaddingStyle}>
          <TextFieldNoFormik
            id="deployment-center-ftps-application-username"
            label={t('deploymentCenterFtpsUsernameLabel')}
            widthOverride="100%"
            value={publishingProfile && publishingProfile.userName}
            copyButton={true}
            disabled={true}
          />
        </div>

        <div className={ftpsPasswordTextboxStyle}>
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
        </div>

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

        <DeploymentCenterPublishingUser formProps={formProps} />
      </div>
    );
  };

  if (isDataRefreshing) {
    return getProgressIndicator();
  } else if (disableFtp()) {
    return getDisabledByFTPPolicyMessage();
  } else {
    return getCredentialsControls();
  }
};

export default DeploymentCenterFtps;
