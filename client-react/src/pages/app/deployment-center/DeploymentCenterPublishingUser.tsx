import React, { useContext } from 'react';
import { Field } from 'formik';
import {
  DeploymentCenterFtpsProps,
  DeploymentCenterFieldProps,
  DeploymentCenterContainerFormData,
  DeploymentCenterCodeFormData,
} from './DeploymentCenter.types';
import { MessageBarType, ProgressIndicator } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { deploymentCenterContent } from './DeploymentCenter.styles';
import TextField from '../../../components/form-controls/TextField';
import { DeploymentCenterContext } from './DeploymentCenterContext';
import { DeploymentCenterPublishingContext } from './DeploymentCenterPublishingContext';
import CustomBanner from '../../../components/CustomBanner/CustomBanner';

const DeploymentCenterPublishingUser: React.FC<
  DeploymentCenterFtpsProps & DeploymentCenterFieldProps<DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>
> = props => {
  const { t } = useTranslation();
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);

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

          <Field
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
          />
        </>
      )}
    </div>
  );
};

export default DeploymentCenterPublishingUser;
