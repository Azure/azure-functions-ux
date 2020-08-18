import React, { useState } from 'react';
import { DeploymentCenterContainerAcrSettingsProps } from '../DeploymentCenter.types';
import { Field } from 'formik';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../../../components/form-controls/DropDown';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { IDropdownOption } from 'office-ui-fabric-react';
import TextField from '../../../../components/form-controls/TextField';

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

  const onRegistryChange = (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    setSelectedRegistry(option.key.toString());
    formProps.setFieldValue('serverUrl', option.text);

    setSelectedImage('');
    formProps.setFieldValue('image', '');

    setSelectedTag('');
    formProps.setFieldValue('tag', '');

    fetchImages(option.key.toString());
  };

  const onImageChange = (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    setSelectedImage(option.text);
    formProps.setFieldValue('image', option.key.toString());

    setSelectedTag('');
    formProps.setFieldValue('tag', '');

    fetchTags(formProps.values.org, option.key.toString());
  };

  const onTagChange = async (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    setSelectedTag(option.text);
    formProps.setFieldValue('tag', option.key.toString());
  };

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

      <Field id="container-acr-startUpFile" name="command" component={TextField} label={t('containerStartupFile')} />
    </>
  );
};

export default DeploymentCenterContainerAcrSettings;
