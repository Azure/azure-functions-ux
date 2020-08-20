import React, { useState, useEffect } from 'react';
import { Field } from 'formik';
import TextField from '../../../../components/form-controls/TextField';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterFieldProps, DeploymentCenterContainerFormData, WorkflowOption } from '../DeploymentCenter.types';
import { ScmType } from '../../../../models/site/config';

const DeploymentCenterContainerPrivateRegistrySettings: React.FC<DeploymentCenterFieldProps<DeploymentCenterContainerFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();

  const [isUsingExistingOrAvailableWorkflowConfig, setIsUsingExistingOrAvailableWorkflowConfig] = useState(false);
  const [isGitHubAction, setIsGitHubAction] = useState(false);

  useEffect(() => {
    setIsUsingExistingOrAvailableWorkflowConfig(
      formProps.values.workflowOption === WorkflowOption.UseExistingWorkflowConfig ||
        formProps.values.workflowOption === WorkflowOption.UseAvailableWorkflowConfigs
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.workflowOption]);

  useEffect(() => {
    setIsGitHubAction(formProps.values.scmType === ScmType.GitHubAction);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.scmType]);

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
        name="serverUrl"
        component={TextField}
        label={t('containerServerURL')}
        placeholder={t('containerServerURLPlaceholder')}
      />

      <Field id="container-privateRegistry-username" name="username" component={TextField} label={t('containerLogin')} />

      <Field id="container-privateRegistry-password" name="password" component={TextField} label={t('containerPassword')} />

      {isGitHubAction && !isUsingExistingOrAvailableWorkflowConfig && (
        <Field
          id="container-privateRegistry-image"
          name="image"
          component={TextField}
          label={t('containerImage')}
          placeholder={t('containerImagePlaceholder')}
        />
      )}

      {!isGitHubAction && (
        <Field
          id="container-privateRegistry-imageAndTag"
          name="imageAndTag"
          component={TextField}
          label={t('containerImageAndTag')}
          placeholder={t('containerImageAndTagPlaceholder')}
        />
      )}

      <Field id="container-privateRegistry-startUpFile" name="command" component={TextField} label={t('containerStartupFile')} />
    </>
  );
};

export default DeploymentCenterContainerPrivateRegistrySettings;
