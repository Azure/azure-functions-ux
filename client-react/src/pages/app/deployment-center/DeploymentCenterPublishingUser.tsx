import React, { useContext, useState } from 'react';
import { Field } from 'formik';
import {
  DeploymentCenterFtpsProps,
  DeploymentCenterFieldProps,
  DeploymentCenterContainerFormData,
  DeploymentCenterCodeFormData,
} from './DeploymentCenter.types';
import { ActionButton, Link, MessageBarType, ProgressIndicator } from '@fluentui/react';
import { useTranslation } from 'react-i18next';
import {
  additionalTextFieldControl,
  deploymentCenterInfoBannerDiv,
  descriptionStyle,
  ftpsPasswordTextboxStyle,
  textboxStyle,
  userHeaderStyle,
} from './DeploymentCenter.styles';
import TextField from '../../../components/form-controls/TextField';
import { DeploymentCenterContext } from './DeploymentCenterContext';
import { DeploymentCenterPublishingContext } from './DeploymentCenterPublishingContext';
import CustomBanner from '../../../components/CustomBanner/CustomBanner';
import { learnMoreLinkStyle } from '../../../components/form-controls/formControl.override.styles';
import { DeploymentCenterLinks } from '../../../utils/FwLinks';
import { TextFieldType } from '../../../utils/CommonConstants';
import { PortalContext } from '../../../PortalContext';
import DeploymentCenterData from './DeploymentCenter.data';
import { getTelemetryInfo } from './utility/DeploymentCenterUtility';
import { getErrorMessage } from '../../../ApiHelpers/ArmHelper';
import CustomFocusTrapCallout from '../../../components/CustomCallout/CustomFocusTrapCallout';
import { useFullPage } from '../../../utils/hooks/useFullPage';

const DeploymentCenterPublishingUser: React.FC<DeploymentCenterFtpsProps &
  DeploymentCenterFieldProps<DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>> = props => {
  const { t } = useTranslation();
  const { formProps } = props;
  const deploymentCenterData = new DeploymentCenterData();
  const portalContext = useContext(PortalContext);
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const [isResetUserCalloutHidden, setIsResetUserCalloutHidden] = useState<boolean>(true);

  const { fullpageElementWithLabel } = useFullPage();

  const { publishingUser, publishingUserFetchFailedMessage } = deploymentCenterPublishingContext;

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

  const sampleWebProviderUsername = webProviderUsername ? webProviderUsername : t('deploymentCenterFtpsUserScopeSampleUsername');

  const resetPublishingUser = async () => {
    if (publishingUser) {
      const notificationId = portalContext.startNotification(
        t('ftpsUserScopeCredentialsResetNotifTitle'),
        t('ftpsUserScopeCredentialsResetNotifTitle')
      );
      const emptyPublishingUser = {
        ...publishingUser,
        properties: {
          ...publishingUser.properties,
          publishingUserName: '',
          publishingPassword: '',
        },
      };
      const resetResponse = await deploymentCenterData.updatePublishingUser(emptyPublishingUser);

      if (resetResponse.metadata.success) {
        portalContext.stopNotification(notificationId, true, t('ftpsUserScopeCredentialsResetNotifSuccess'));
        deploymentCenterPublishingContext.publishingUser = emptyPublishingUser;
        formProps.setFieldValue('publishingUsername', '');
        formProps.setFieldValue('publishingPassword', '');
        formProps.setFieldValue('publishingConfirmPassword', '');
      } else {
        portalContext.log(
          getTelemetryInfo('error', 'resetUserScopeCredentialsResponse', 'failed', {
            message: getErrorMessage(resetResponse.metadata.error),
            errorAsString: resetResponse.metadata.error ? JSON.stringify(resetResponse.metadata.error) : '',
          })
        );
        portalContext.stopNotification(notificationId, false, t('ftpsUserScopeCredentialsResetNotifFailure'));
      }
    }
  };

  const toggleResetCalloutVisibility = () => {
    setIsResetUserCalloutHidden(!isResetUserCalloutHidden);
  };

  const resetPublishingUserFromCallout = () => {
    portalContext.log(
      getTelemetryInfo('info', 'resetUserScopeCredentials', 'submit', {
        location: 'ftpsTab',
      })
    );
    resetPublishingUser();
    setIsResetUserCalloutHidden(true);
  };

  return (
    <>
      <h3 className={userHeaderStyle}>{t('deploymentCenterFtpsUserScopeTitle')}</h3>

      <div className={descriptionStyle} id="deployment-publishing-user-message">
        {t('deploymentCenterFtpsUserScopeDescription').format(sampleWebProviderDomainUsername, sampleWebProviderUsername)}
        <Link
          id="deployment-center-settings-learnMore"
          href={DeploymentCenterLinks.publishingUserDocumentation}
          target="_blank"
          className={learnMoreLinkStyle}
          aria-label={t('configureDeploymentCredentialsLinkAriaLabel')}>
          {` ${t('learnMore')}`}
        </Link>
      </div>

      {publishingUserLoading && (
        <ProgressIndicator
          description={t('deploymentCenterPublishingUserLoadingMessage')}
          ariaValueText={t('deploymentCenterPublishingUserLoadingAriaLabel')}
        />
      )}

      {publishingUserError && (
        <div className={deploymentCenterInfoBannerDiv}>
          <CustomBanner id="publishing-user-fetch-failed-message" message={publishingUserFetchFailedMessage} type={MessageBarType.error} />
        </div>
      )}

      {publishingUser && (
        <>
          <Field
            className={textboxStyle}
            id="deployment-center-ftps-provider-username"
            name="publishingUsername"
            component={TextField}
            label={t('deploymentCenterUserScopeUsernameLabel')}
            widthOverride={'100%'}
          />

          <div className={ftpsPasswordTextboxStyle(fullpageElementWithLabel)}>
            <Field
              className={textboxStyle}
              id="deployment-center-ftps-provider-password"
              name="publishingPassword"
              component={TextField}
              label={t('deploymentCenterFtpsPasswordLabel')}
              type={TextFieldType.password}
              canRevealPassword
              revealPasswordAriaLabel={t('showProviderPasswordAriaLabel')}
              widthOverride={'100%'}
              additionalControls={[
                <ActionButton
                  id="deployment-center-ftps-provider-password-reset"
                  key="deployment-center-ftps-provider-password-reset"
                  className={additionalTextFieldControl}
                  ariaLabel={t('resetUserScopeCredentialsAriaLabel')}
                  onClick={toggleResetCalloutVisibility}
                  iconProps={{ iconName: 'refresh' }}>
                  {t('reset')}
                </ActionButton>,
              ]}
            />

            <Field
              className={textboxStyle}
              id="deployment-center-ftps-provider-confirm-password"
              name="publishingConfirmPassword"
              component={TextField}
              label={t('deploymentCenterFtpsConfirmPasswordLabel')}
              type={TextFieldType.password}
              canRevealPassword
              revealPasswordAriaLabel={t('showProviderConfirmPasswordAriaLabel')}
              widthOverride={'100%'}
            />
          </div>

          <CustomFocusTrapCallout
            target="#deployment-center-ftps-provider-password-reset"
            onDismissFunction={toggleResetCalloutVisibility}
            setInitialFocus={true}
            hidden={isResetUserCalloutHidden}
            title={t('resetUserScopeCredentialsConfirmationTitle')}
            description={t('resetUserScopeCredentialsConfirmationDescription')}
            primaryButtonTitle={t('reset')}
            primaryButtonFunction={resetPublishingUserFromCallout}
            defaultButtonTitle={t('cancel')}
            defaultButtonFunction={toggleResetCalloutVisibility}
          />
        </>
      )}
    </>
  );
};

export default DeploymentCenterPublishingUser;
