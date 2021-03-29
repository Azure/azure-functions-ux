import React, { useEffect, useState } from 'react';
import { ContainerOptions, DeploymentCenterContainerAcrSettingsProps } from '../DeploymentCenter.types';
import { Field } from 'formik';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../../../components/form-controls/DropDown';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import TextField from '../../../../components/form-controls/TextField';
import DeploymentCenterContainerComposeFileUploader from './DeploymentCenterContainerComposeFileUploader';
import ComboBox from '../../../../components/form-controls/ComboBox';
import { ScmType } from '../../../../models/site/config';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';

const DeploymentCenterContainerAcrSettings: React.FC<DeploymentCenterContainerAcrSettingsProps> = props => {
  const {
    acrRegistryOptions,
    acrImageOptions,
    acrTagOptions,
    acrStatusMessage,
    acrStatusMessageType,
    formProps,
    loadingRegistryOptions: loadingAcrRegistryOptions,
    loadingImageOptions,
    loadingTagOptions,
  } = props;
  const { t } = useTranslation();

  const [isComposeOptionSelected, setIsComposeOptionSelected] = useState(false);
  const [isGitHubActionSelected, setIsGitHubActionSelected] = useState(false);

  useEffect(() => {
    setIsComposeOptionSelected(formProps.values.option === ContainerOptions.compose);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.option]);

  useEffect(() => {
    setIsGitHubActionSelected(formProps.values.scmType === ScmType.GitHubAction);
    //setTagSelectedKey(formProps.values.scmType === ScmType.GitHubAction ? "githubActionsTag" : formProps.values.acrTag);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.scmType]);

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
        <CustomBanner id="acr-status-message-type" type={acrStatusMessageType} message={acrStatusMessage} />
      )}

      <Field
        id="container-acr-repository"
        label={t('containerACRRegistry')}
        name="acrLoginServer"
        defaultSelectedKey={formProps.values.acrLoginServer}
        component={Dropdown}
        displayInVerticalLayout={true}
        options={acrRegistryOptions}
        isLoading={loadingAcrRegistryOptions}
        required={true}
      />

      {!isComposeOptionSelected && (
        <>
          {!isGitHubActionSelected && (
            <>
              <Field
                id="container-acr-image"
                label={t('containerACRImage')}
                name="acrImage"
                defaultSelectedKey={formProps.values.acrImage}
                component={ComboBox}
                allowFreeform
                autoComplete="on"
                displayInVerticalLayout={true}
                options={acrImageOptions}
                isLoading={loadingImageOptions}
                required={true}
              />

              <Field
                id="container-acr-tag"
                label={t('containerACRTag')}
                name="acrTag"
                defaultSelectedKey={formProps.values.acrTag}
                component={Dropdown}
                displayInVerticalLayout={true}
                options={acrTagOptions}
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

          <Field id="container-acr-startUpFile" name="command" component={TextField} label={t('containerStartupFile')} />
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
