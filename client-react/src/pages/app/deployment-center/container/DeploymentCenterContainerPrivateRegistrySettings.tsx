import React from 'react';
import { Field } from 'formik';
import TextField from '../../../../components/form-controls/TextField';
import { useTranslation } from 'react-i18next';

const DeploymentCenterContainerPrivateRegistrySettings: React.FC<{}> = props => {
  const { t } = useTranslation();

  // NOTE(michinoy): In case of GitHub Action, we will always need to get the user credentials for their private
  // registry. This is because the workflow would need to use those credentials to push the images and app service
  // would use the same credentials to pull the images.
  // Also with GitHub Action, the image tag is not needed from the user as the workflow will generate the tag and push
  // that to the users site config.
  // Now in case if the user chooses to use an existing workflow file in their repo, we would still need to get the
  // target registry url, username, and password to update the app settings, but no workflow update is needed.

  return (
    <>
      <Field
        id="container-privateRegistry-serverUrl"
        name="privateRegistryServerUrl"
        component={TextField}
        label={t('containerServerURL')}
        placeholder={t('containerServerURLPlaceholder')}
        required={true}
      />

      <Field id="container-privateRegistry-username" name="privateRegistryUsername" component={TextField} label={t('containerLogin')} />

      <Field
        id="container-privateRegistry-password"
        name="privateRegistryPassword"
        component={TextField}
        label={t('containerPassword')}
        type="password"
      />

      <Field
        id="container-privateRegistry-imageAndTag"
        name="privateRegistryImageAndTag"
        component={TextField}
        label={t('containerImageAndTag')}
        placeholder={t('containerImageAndTagPlaceholder')}
        required={true}
      />

      <Field id="container-privateRegistry-startUpFile" name="command" component={TextField} label={t('containerStartupFile')} />
    </>
  );
};

export default DeploymentCenterContainerPrivateRegistrySettings;
