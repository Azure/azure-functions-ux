import React, { useEffect, useState } from 'react';
import { ContainerOptions, DeploymentCenterContainerAcrSettingsProps } from '../DeploymentCenter.types';
import { Field } from 'formik';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../../../components/form-controls/DropDown';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import TextField from '../../../../components/form-controls/TextField';

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

  useEffect(() => {
    setIsComposeOptionSelected(formProps.values.option === ContainerOptions.compose);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.option]);

  // NOTE(michinoy): In case of GitHub Action, we will always need to get the user credentials for their ACR
  // registry. This is because the workflow would need to use those credentials to push the images and app service
  // would use the same credentials to pull the images.
  // Also with GitHub Action, the image tag is not needed from the user as the workflow will generate the tag and push
  // that to the users site config.
  // Now in case if the user chooses to use an existing workflow file in their repo, we would still need to get the
  // target registry url, username, and password to update the app settings, but no workflow update is needed.

  return (
    <>
      {acrStatusMessage && acrStatusMessageType && <CustomBanner type={acrStatusMessageType} message={acrStatusMessage} />}

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
          <Field
            id="container-acr-image"
            label={t('containerACRImage')}
            name="acrImage"
            defaultSelectedKey={formProps.values.acrImage}
            component={Dropdown}
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

          <Field id="container-acr-startUpFile" name="command" component={TextField} label={t('containerStartupFile')} />
        </>
      )}

      {isComposeOptionSelected && (
        <Field
          id="container-acr-composeYml"
          name="acrComposeYml"
          component={TextField}
          label={t('config')}
          multiline={true}
          resizable={true}
          autoAdjustHeight={true}
          required={true}
        />
      )}
    </>
  );
};

export default DeploymentCenterContainerAcrSettings;
