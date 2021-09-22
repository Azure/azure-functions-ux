import React, { useContext, useState } from 'react';
import { Field } from 'formik';
import {
  DeploymentCenterFtpsProps,
  DeploymentCenterFieldProps,
  DeploymentCenterContainerFormData,
  DeploymentCenterCodeFormData,
} from './DeploymentCenter.types';
import { ActionButton, Link, MessageBarType, ProgressIndicator } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { additionalTextFieldControl, deploymentCenterContent } from './DeploymentCenter.styles';
import TextField from '../../../components/form-controls/TextField';
import { DeploymentCenterContext } from './DeploymentCenterContext';
import { DeploymentCenterPublishingContext } from './DeploymentCenterPublishingContext';
import CustomBanner from '../../../components/CustomBanner/CustomBanner';
import { learnMoreLinkStyle } from '../../../components/form-controls/formControl.override.styles';
import { DeploymentCenterLinks } from '../../../utils/FwLinks';
import TextFieldNoFormik from '../../../components/form-controls/TextFieldNoFormik';

type PasswordFieldType = 'password' | undefined;

const DeploymentCenterPublishingUser: React.FC<
  DeploymentCenterFtpsProps & DeploymentCenterFieldProps<DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>
> = props => {
  const { t } = useTranslation();
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const [applicationPasswordType, setApplicationPasswordType] = useState<PasswordFieldType>('password');

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

  const toggleShowApplicationPassword = () => {
    setApplicationPasswordType(!applicationPasswordType ? 'password' : undefined);
  };

  return (
    <div className={deploymentCenterContent}>
      <h3>{t('deploymentCenterFtpsUserScopeTitle')}</h3>
      <p>
        <span id="deployment-publishing-user-message">
          {t('deploymentCenterFtpsUserScopeDescription').format(sampleWebProviderDomainUsername, sampleWebProviderUsername)}
        </span>
        <Link
          id="deployment-center-settings-learnMore"
          href={DeploymentCenterLinks.publishingUserDocumentation}
          target="_blank"
          className={learnMoreLinkStyle}
          aria-labelledby="deployment-center-settings-message">
          {` ${t('learnMore')}`}
        </Link>
      </p>

      {publishingUserLoading && (
        <ProgressIndicator
          description={t('deploymentCenterPublishingUserLoadingMessage')}
          ariaValueText={t('deploymentCenterPublishingUserLoadingAriaLabel')}
        />
      )}

      {publishingUserError && (
        <CustomBanner id="publishing-user-fetch-failed-message" message={publishingUserFetchFailedMessage} type={MessageBarType.error} />
      )}

      {publishingUser && (
        <>
          <Field
            id="deployment-center-ftps-provider-username"
            name="publishingUsername"
            component={TextField}
            label={t('deploymentCenterFtpsUsernameLabel')}
          />
          <div>
            <TextFieldNoFormik
              id="deployment-center-ftps-provider-password"
              name="publishingPassword"
              label={t('deploymentCenterFtpsPasswordLabel')}
              widthOverride="100%"
              // value={publishingProfile && publishingProfile.userPWD}
              // disabled={true}
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
              ]}
            />
          </div>
          {/* <Field
            id="deployment-center-ftps-provider-password"
            name="publishingPassword"
            component={TextField}
            label={t('deploymentCenterFtpsPasswordLabel')}
            type="password"
          />

          <Field
            id="deployment-center-ftps-provider-confirm-password"
            name="publishingConfirmPassword"
            component={TextField}
            label={t('deploymentCenterFtpsConfirmPasswordLabel')}
            type="password"
          /> */}
        </>
      )}
    </div>
  );
};

export default DeploymentCenterPublishingUser;
