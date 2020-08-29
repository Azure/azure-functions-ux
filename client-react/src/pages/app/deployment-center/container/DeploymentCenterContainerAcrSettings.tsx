import React, { useState, useEffect } from 'react';
import { DeploymentCenterContainerAcrSettingsProps } from '../DeploymentCenter.types';
import { Field } from 'formik';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../../../components/form-controls/DropDown';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { IDropdownOption } from 'office-ui-fabric-react';
import TextField from '../../../../components/form-controls/TextField';
import { ScmType } from '../../../../models/site/config';
import { isWorkflowOptionExistingOrAvailable } from '../utility/GitHubActionUtility';

const DeploymentCenterContainerAcrSettings: React.FC<DeploymentCenterContainerAcrSettingsProps> = props => {
  const {
    fetchImages,
    fetchTags,
    acrRegistryOptions,
    acrImageOptions,
    acrTagOptions,
    acrStatusMessage,
    acrStatusMessageType,
    formProps,
  } = props;
  const { t } = useTranslation();

  const [selectedRegistry, setSelectedRegistry] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [isUsingExistingOrAvailableWorkflowConfig, setIsUsingExistingOrAvailableWorkflowConfig] = useState(false);
  const [isGitHubAction, setIsGitHubAction] = useState(false);

  const onRegistryChange = (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    setSelectedRegistry(option.key.toString());
    const [loginServer, resourceId, location] = option.key.toString().split(':');
    const serverUrl = `https://${loginServer}`;
    formProps.setFieldValue('serverUrl', serverUrl.toLocaleLowerCase());
    formProps.setFieldValue('acrResourceId', resourceId.toLocaleLowerCase());
    formProps.setFieldValue('acrResourceLocation', location);

    setSelectedImage('');
    formProps.setFieldValue('image', '');

    setSelectedTag('');
    formProps.setFieldValue('tag', '');

    fetchImages(loginServer, resourceId);
  };

  const onImageChange = (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    setSelectedImage(option.key.toString());
    formProps.setFieldValue('image', option.key.toString());

    setSelectedTag('');
    formProps.setFieldValue('tag', '');

    const loginServer = formProps.values.serverUrl.replace('https://', '');
    fetchTags(loginServer, option.key.toString());
  };

  const onTagChange = async (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    setSelectedTag(option.key.toString());
    formProps.setFieldValue('tag', option.key.toString());
  };

  useEffect(() => {
    setIsUsingExistingOrAvailableWorkflowConfig(isWorkflowOptionExistingOrAvailable(formProps.values.workflowOption));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.workflowOption]);

  useEffect(() => {
    setIsGitHubAction(formProps.values.scmType === ScmType.GitHubAction);

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
      {acrStatusMessage && acrStatusMessageType && <CustomBanner type={acrStatusMessageType} message={acrStatusMessage} />}

      <Field
        id="container-acr-repository"
        label={t('containerACRRegistry')}
        name="serverUrl"
        component={Dropdown}
        displayInVerticalLayout={true}
        options={acrRegistryOptions}
        selectedKey={selectedRegistry}
        onChange={onRegistryChange}
      />

      {!isUsingExistingOrAvailableWorkflowConfig && (
        <Field
          id="container-acr-image"
          label={t('containerACRImage')}
          name="image"
          component={Dropdown}
          displayInVerticalLayout={true}
          options={acrImageOptions}
          selectedKey={selectedImage}
          onChange={onImageChange}
        />
      )}

      {!isGitHubAction && (
        <Field
          id="container-acr-tag"
          label={t('containerACRTag')}
          name="tag"
          component={Dropdown}
          displayInVerticalLayout={true}
          options={acrTagOptions}
          selectedKey={selectedTag}
          onChange={onTagChange}
        />
      )}

      <Field id="container-acr-startUpFile" name="command" component={TextField} label={t('containerStartupFile')} />
    </>
  );
};

export default DeploymentCenterContainerAcrSettings;
