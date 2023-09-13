import React, { useContext, useState } from 'react';
import {
  DeploymentCenterFtpsProps,
  DeploymentCenterFieldProps,
  DeploymentCenterContainerFormData,
  DeploymentCenterCodeFormData,
} from '../DeploymentCenter.types';
import { MessageBarType, ActionButton, ProgressIndicator, Link } from '@fluentui/react';
import { useTranslation } from 'react-i18next';
import {
  deploymentCenterContent,
  additionalTextFieldControl,
  deploymentCenterInfoBannerDiv,
  ftpsPasswordTextboxStyle,
  descriptionStyle,
  textboxStyle,
} from '../DeploymentCenter.styles';
import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import CustomFocusTrapCallout from '../../../../components/CustomCallout/CustomFocusTrapCallout';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import { DeploymentCenterPublishingContext } from './DeploymentCenterPublishingContext';
import { ScmType } from '../../../../models/site/config';
import { getGitCloneUri, getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import DeploymentCenterPublishingUser from './DeploymentCenterPublishingUser';
import { PortalContext } from '../../../../PortalContext';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { TextFieldType } from '../../../../utils/CommonConstants';
import { useFullPage } from '../../../../utils/hooks/useFullPage';

const DeploymentCenterFtps: React.FC<DeploymentCenterFtpsProps &
  DeploymentCenterFieldProps<DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>> = props => {
  const { t } = useTranslation();
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const portalContext = useContext(PortalContext);

  const { isDataRefreshing, formProps } = props;
  const { publishingProfile, resetApplicationPassword } = deploymentCenterPublishingContext;

  const [isResetCalloutHidden, setIsResetCalloutHidden] = useState<boolean>(true);
  const [showBlockedBanner, setShowBlockedBanner] = useState(true);
  const [showWarningBanner, setShowWarningBanner] = useState(true);

  const ftpsEndpoint = publishingProfile && publishingProfile.publishUrl.toLocaleLowerCase().replace('ftp:/', 'ftps:/');
  const isScmLocalGit = deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.LocalGit;
  const gitCloneUri = getGitCloneUri(deploymentCenterPublishingContext);
  const gitUsername = publishingProfile?.userName.split('\\')[1];

  const { fullpageElementWithLabel } = useFullPage();

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

  const getProgressIndicator = () => {
    return <ProgressIndicator description={t('deploymentCenterFtpLoading')} ariaValueText={t('deploymentCenterFtpLoadingAriaValue')} />;
  };

  const closeBlockedBanner = () => {
    setShowBlockedBanner(false);
  };

  const closeWarningBanner = () => {
    setShowWarningBanner(false);
  };

  const disableFtp = () => !deploymentCenterPublishingContext?.basicPublishingCredentialsPolicies?.ftp?.allow;

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

        {deploymentCenterPublishingContext && disableFtp() && showWarningBanner && (
          <div className={deploymentCenterInfoBannerDiv}>
            <CustomBanner
              id="deployment-center-ftps-permission-warning"
              message={t('deploymentCenterFtpsPermissionWarning')}
              type={MessageBarType.warning}
              onDismiss={closeWarningBanner}
              learnMoreLink={DeploymentCenterLinks.configureFTPSSettingsDeploy}
            />
          </div>
        )}

        <div className={descriptionStyle}>{t('deploymentCenterFtpsDescription')}</div>
        <TextFieldNoFormik
          className={textboxStyle}
          id="deployment-center-ftps-endpoint"
          label={t('deploymentCenterFtpsEndpointLabel')}
          widthOverride="100%"
          value={ftpsEndpoint}
          copyButton={true}
          readOnly={true}
        />

        {isScmLocalGit && (
          <TextFieldNoFormik
            className={textboxStyle}
            id="deployment-center-localgit-clone-uri"
            label={t('deploymentCenterCodeLocalGitCloneUri')}
            widthOverride="100%"
            value={gitCloneUri ? gitCloneUri : t('deploymentCenterCodeLocalGitFetchCloneUriError')}
            copyButton={true}
            readOnly={true}
          />
        )}

        <h3>{t('deploymentCenterFtpsApplicationScopeTitle')}</h3>
        <div className={descriptionStyle} id="deployment-publishing-user-message">
          {t('deploymentCenterFtpsApplicationScopeDescription')}
          <Link
            id="deployment-center-settings-learnMore"
            href={DeploymentCenterLinks.publishingUserDocumentation}
            target="_blank"
            className={learnMoreLinkStyle}
            aria-label={t('configureDeploymentCredentialsLinkAriaLabel')}>
            {` ${t('learnMore')}`}
          </Link>
        </div>

        <TextFieldNoFormik
          className={textboxStyle}
          id="deployment-center-ftps-application-username"
          label={t('deploymentCenterFtpsUsernameLabel')}
          widthOverride="100%"
          value={publishingProfile && publishingProfile.userName}
          copyButton={true}
          readOnly={true}
        />

        {isScmLocalGit && (
          <TextFieldNoFormik
            className={textboxStyle}
            id="deployment-center-ftps-application-git-username"
            label={t('deploymentCenterLocalGitUsernameLabel')}
            widthOverride="100%"
            value={gitUsername}
            copyButton={true}
            readOnly={true}
          />
        )}

        <div className={ftpsPasswordTextboxStyle(fullpageElementWithLabel)}>
          <TextFieldNoFormik
            className={textboxStyle}
            id="deployment-center-ftps-application-password"
            label={t('deploymentCenterFtpsPasswordLabel')}
            widthOverride="100%"
            value={publishingProfile && publishingProfile.userPWD}
            copyButton={true}
            readOnly={true}
            type={TextFieldType.password}
            canRevealPassword
            revealPasswordAriaLabel={t('showApplicationPasswordAriaLabel')}
            additionalControls={[
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
  } else {
    return getCredentialsControls();
  }
};

export default DeploymentCenterFtps;
