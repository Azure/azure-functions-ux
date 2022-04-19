import React, { useEffect, useState } from 'react';
import { ACRCredentialType, ContainerOptions, DeploymentCenterContainerAcrSettingsProps } from '../DeploymentCenter.types';
import { Field } from 'formik';
import { useTranslation } from 'react-i18next';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import TextField from '../../../../components/form-controls/TextField';
import DeploymentCenterContainerComposeFileUploader from './DeploymentCenterContainerComposeFileUploader';
import ComboBox from '../../../../components/form-controls/ComboBox';
import { ScmType } from '../../../../models/site/config';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { IDropdownOption, Link, MessageBar, MessageBarType } from '@fluentui/react';
import ComboBoxNoFormik from '../../../../components/form-controls/ComboBoxnoFormik';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { addIdentityLinkStyle, deploymentCenterAcrBannerDiv } from '../DeploymentCenter.styles';

const DeploymentCenterContainerAcrSettings: React.FC<DeploymentCenterContainerAcrSettingsProps> = props => {
  const {
    acrSubscriptionOptions,
    acrRegistryOptions,
    acrImageOptions,
    acrTagOptions,
    acrStatusMessage,
    acrStatusMessageType,
    formProps,
    loadingRegistryOptions: loadingAcrRegistryOptions,
    loadingImageOptions,
    loadingTagOptions,
    acrSubscription,
    acrUseManagedIdentities,
    managedIdentityOptions,
    loadingManagedIdentities,
    learnMoreLink,
    fetchRegistriesInSub,
    openIdentityBlade,
  } = props;
  const { t } = useTranslation();

  const [isComposeOptionSelected, setIsComposeOptionSelected] = useState(false);
  const [isGitHubActionSelected, setIsGitHubActionSelected] = useState(false);
  const [aCRSubscriptionOptions, setACRSubscriptionOptions] = useState<IDropdownOption[]>(acrSubscriptionOptions);
  const [aCRRegistryOptions, setACRRegistryOptions] = useState<IDropdownOption[]>(acrRegistryOptions);
  const [aCRImageOptions, setACRImageOptions] = useState<IDropdownOption[]>(acrImageOptions);
  const [aCRTagOptions, setACRTagOptions] = useState<IDropdownOption[]>(acrTagOptions);

  useEffect(() => {
    setIsComposeOptionSelected(formProps.values.option === ContainerOptions.compose);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.option]);

  useEffect(() => {
    setIsGitHubActionSelected(formProps.values.scmType === ScmType.GitHubAction);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.scmType]);

  useEffect(() => {
    setACRSubscriptionOptions(acrSubscriptionOptions);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acrSubscriptionOptions]);

  useEffect(() => {
    setACRRegistryOptions(acrRegistryOptions);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acrRegistryOptions]);

  useEffect(() => {
    //NOTE(stpelleg): If the value is in the form but the call to get images fails, we should still show the image
    if (!!formProps && !!formProps.values && !!formProps.values.acrImage && acrImageOptions.length === 0) {
      acrImageOptions.push({ key: formProps.values.acrImage, text: formProps.values.acrImage });
    }
    setACRImageOptions(acrImageOptions);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acrImageOptions]);

  useEffect(() => {
    //NOTE(stpelleg): If the value is in the form but the call to get tags fails, we should still show the tag
    if (!!formProps && !!formProps.values && !!formProps.values.acrTag && acrTagOptions.length === 0) {
      acrTagOptions.push({ key: formProps.values.acrTag, text: formProps.values.acrTag });
    }
    setACRTagOptions(acrTagOptions);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acrTagOptions]);

  // NOTE(michinoy): In case of GitHub Action, we will always need to get the user credentials for their ACR
  // registry. This is because the workflow would need to use those credentials to push the images and app service
  // would use the same credentials to pull the images.
  // Also with GitHub Action, the image tag is not needed from the user as the workflow will generate the tag and push
  // that to the users site config.
  // Now in case if the user chooses to use an existing workflow file in their repo, we would still need to get the
  // target registry url, username, and password to update the app settings, but no workflow update is needed.

  return (
    <>
      {acrStatusMessage && acrStatusMessageType && (
        <div id="acr-status-message-type-div" className={deploymentCenterAcrBannerDiv}>
          <CustomBanner id="acr-status-message-type" type={acrStatusMessageType} message={acrStatusMessage} learnMoreLink={learnMoreLink} />
        </div>
      )}

      <ComboBoxNoFormik
        id="container-acr-subscription"
        label={t('subscription')}
        allowFreeform
        autoComplete="on"
        options={aCRSubscriptionOptions}
        required={true}
        onChange={(val, newSub) => fetchRegistriesInSub(newSub.key)}
        value={acrSubscription}
      />
      <Field
        id="container-acr-credentials"
        label={t('authentication')}
        name="acrCredentialType"
        component={RadioButton}
        options={[
          { key: ACRCredentialType.adminCredentials, text: t('adminCredentials') },
          { key: ACRCredentialType.managedIdentity, text: t('managedIdentity') },
        ]}
        displayInVerticalLayout={true}
      />
      {acrUseManagedIdentities && (
        <Field
          id="container-acr-managed-identities-type"
          label={t('identity')}
          name="acrManagedIdentityType"
          component={ComboBox}
          placeholder={t('managedIdentityTypePlaceholder')}
          options={managedIdentityOptions}
          isLoading={loadingManagedIdentities}
          onRenderLowerContent={() => (
            <Link id="container-acr-add-identity-link" className={addIdentityLinkStyle} onClick={openIdentityBlade}>
              {t('addIdentity')}
            </Link>
          )}
        />
      )}
      <Field
        id="container-acr-repository"
        label={t('containerACRRegistry')}
        name="acrLoginServer"
        selectedKey={formProps.values.acrLoginServer?.toLocaleLowerCase() ?? ''}
        component={ComboBox}
        allowFreeform
        autoComplete="on"
        options={aCRRegistryOptions}
        setOptions={setACRRegistryOptions}
        displayInVerticalLayout={true}
        isLoading={loadingAcrRegistryOptions}
        required={true}
      />

      {!isComposeOptionSelected && (
        <>
          {!isGitHubActionSelected && (
            <>
              {acrUseManagedIdentities && (
                <div id="acr-managed-identities-info-banner" className={deploymentCenterAcrBannerDiv}>
                  <MessageBar id="acr-info-message-bar" messageBarType={MessageBarType.info} isMultiline={true}>
                    {t('managedIdentityInfoMessage')}
                  </MessageBar>
                </div>
              )}

              <Field
                id="container-acr-image"
                label={t('containerACRImage')}
                name="acrImage"
                selectedKey={formProps.values.acrImage}
                component={ComboBox}
                allowFreeform
                autoComplete="on"
                options={aCRImageOptions}
                setOptions={setACRImageOptions}
                displayInVerticalLayout={true}
                isLoading={loadingImageOptions}
                required={true}
              />

              <Field
                id="container-acr-tag"
                label={t('containerACRTag')}
                name="acrTag"
                selectedKey={formProps.values.acrTag}
                component={ComboBox}
                allowFreeform
                autoComplete="on"
                options={aCRTagOptions}
                setOptions={setACRTagOptions}
                displayInVerticalLayout={true}
                isLoading={loadingTagOptions}
                required={true}
              />
            </>
          )}

          {isGitHubActionSelected && (
            <>
              <Field
                id="container-acr-image"
                label={t('containerACRImage')}
                name="acrImage"
                component={TextField}
                displayInVerticalLayout={true}
                required={true}
              />

              <ReactiveFormControl id="container-acr-tag" label={t('containerACRTag')}>
                <div>{t('containerGitHubActionsTagLabel')}</div>
              </ReactiveFormControl>
            </>
          )}

          <Field id="container-acr-startUpFileOrCommand" name="command" component={TextField} label={t('containerStartupFileOrCommand')} />
        </>
      )}

      {isComposeOptionSelected && (
        <>
          <Field
            id="container-acr-composeYml"
            name="acrComposeYml"
            component={TextField}
            label={t('config')}
            widthOverride={'500px'}
            multiline={true}
            resizable={true}
            autoAdjustHeight={true}
            required={true}
          />

          <DeploymentCenterContainerComposeFileUploader {...props} />
        </>
      )}
    </>
  );
};

export default DeploymentCenterContainerAcrSettings;
