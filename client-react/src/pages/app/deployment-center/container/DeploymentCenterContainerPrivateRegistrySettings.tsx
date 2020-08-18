import React from 'react';
import { Field } from 'formik';
import TextField from '../../../../components/form-controls/TextField';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterFieldProps, DeploymentCenterContainerFormData } from '../DeploymentCenter.types';

const DeploymentCenterContainerPrivateRegistrySettings: React.FC<DeploymentCenterFieldProps<DeploymentCenterContainerFormData>> = props => {
  const { t } = useTranslation();

  return (
    <>
      <Field
        id="container-privateRegistry-serverUrl"
        name="serverUrl"
        component={TextField}
        label={t('containerServerURL')}
        placeholder={t('containerServerURLPlaceholder')}
      />

      <Field
        id="container-privateRegistry-imageAndTag"
        name="imageAndTag"
        component={TextField}
        label={t('containerImageAndTag')}
        placeholder={t('containerImageAndTagPlaceholder')}
      />

      <Field id="container-privateRegistry-username" name="username" component={TextField} label={t('containerLogin')} />

      <Field id="container-privateRegistry-password" name="password" component={TextField} label={t('containerPassword')} />

      <Field id="container-privateRegistry-startUpFile" name="command" component={TextField} label={t('containerStartupFile')} />
    </>
  );
};

export default DeploymentCenterContainerPrivateRegistrySettings;
