import React, { useState, useEffect } from 'react';
import { Field } from 'formik';
import TextField from '../../../../components/form-controls/TextField';
import { useTranslation } from 'react-i18next';
import { IChoiceGroupOptionProps } from 'office-ui-fabric-react';
import { ContainerDockerAccessTypes, DeploymentCenterFieldProps, DeploymentCenterContainerFormData } from '../DeploymentCenter.types';
import Dropdown from '../../../../components/form-controls/DropDown';
import { ScmType } from '../../../../models/site/config';

const DeploymentCenterContainerDockerHubSettings: React.FC<DeploymentCenterFieldProps<DeploymentCenterContainerFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();

  const [isGitHubAction, setIsGitHubAction] = useState(false);
  const [isPrivateConfiguration, setIsPrivateConfiguration] = useState(false);

  useEffect(() => {
    setIsPrivateConfiguration(formProps.values.dockerHubAccessType === ContainerDockerAccessTypes.private);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.dockerHubAccessType]);

  useEffect(() => {
    setIsGitHubAction(formProps.values.scmType === ScmType.GitHubAction);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.scmType]);

  const accessTypes: IChoiceGroupOptionProps[] = [
    {
      key: ContainerDockerAccessTypes.public,
      text: t('containerRepositoryPublic'),
    },
    {
      key: ContainerDockerAccessTypes.private,
      text: t('containerRepositoryPrivate'),
    },
  ];

  // NOTE(michinoy): In case of GitHub Action, we will always need to get the user credentials for their
  // DockerHub. This is because the workflow would need to use those credentials to push the images and app service
  // would use the same credentials to pull the images.
  // Also with GitHub Action, the image tag is not needed from the user as the workflow will generate the tag and push
  // that to the users site config.
  // Now in case if the user chooses to use an existing workflow file in their repo, we would still need to get the
  // target registry url, username, and password to update the app settings, but no workflow update is needed.

  return (
    <>
      {!isGitHubAction && (
        <Field
          id="container-dockerHub-accessType"
          name="dockerHubAccessType"
          component={Dropdown}
          options={accessTypes}
          label={t('containerRepositoryAccess')}
          required={true}
        />
      )}

      {(isPrivateConfiguration || isGitHubAction) && (
        <>
          <Field
            id="container-dockerHub-username"
            name="dockerHubUsername"
            component={TextField}
            label={t('containerLogin')}
            required={true}
          />

          <Field
            id="container-dockerHub-password"
            name="dockerHubPassword"
            component={TextField}
            label={t('containerPassword')}
            required={true}
            type="password"
          />
        </>
      )}

      <Field
        id="container-dockerHub-imageAndTag"
        name="dockerHubImageAndTag"
        component={TextField}
        label={t('containerImageAndTag')}
        placeholder={t('containerImageAndTagPlaceholder')}
        required={true}
      />

      <Field id="container-dockerHub-startUpFile" name="command" component={TextField} label={t('containerStartupFile')} />
    </>
  );
};

export default DeploymentCenterContainerDockerHubSettings;
