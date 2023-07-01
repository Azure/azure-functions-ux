import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from 'formik';

import { IChoiceGroupOptionProps } from '@fluentui/react';

import Dropdown from '../../../../components/form-controls/DropDown';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import TextField from '../../../../components/form-controls/TextField';
import { ScmType } from '../../../../models/site/config';
import { SiteStateContext } from '../../../../SiteState';
import {
  ContainerDockerAccessTypes,
  ContainerOptions,
  DeploymentCenterContainerFormData,
  DeploymentCenterFieldProps,
} from '../DeploymentCenter.types';

import DeploymentCenterContainerComposeFileUploader from './DeploymentCenterContainerComposeFileUploader';

const DeploymentCenterContainerDockerHubSettings: React.FC<DeploymentCenterFieldProps<DeploymentCenterContainerFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const siteStateContext = useContext(SiteStateContext);

  const [isGitHubActionSelected, setIsGitHubActionSelected] = useState(false);
  const [isPrivateConfiguration, setIsPrivateConfiguration] = useState(false);
  const [isComposeOptionSelected, setIsComposeOptionSelected] = useState(false);

  useEffect(() => {
    setIsPrivateConfiguration(formProps.values.dockerHubAccessType === ContainerDockerAccessTypes.private);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.dockerHubAccessType]);

  useEffect(() => {
    const isGitHubAction = formProps.values.scmType === ScmType.GitHubAction;

    setIsGitHubActionSelected(isGitHubAction);

    if (isGitHubAction) {
      formProps.setFieldValue('dockerHubAccessType', ContainerDockerAccessTypes.private);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.scmType]);

  useEffect(() => {
    setIsComposeOptionSelected(formProps.values.option === ContainerOptions.compose);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.option]);

  const accessTypes: IChoiceGroupOptionProps[] = [
    {
      itemKey: ContainerDockerAccessTypes.public,
      key: ContainerDockerAccessTypes.public,
      text: t('containerRepositoryPublic'),
    },
    {
      itemKey: ContainerDockerAccessTypes.private,
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
  const getImagePlaceHolderText = () => {
    if (isGitHubActionSelected) {
      return t('containerImageNamePlaceHolder');
    } else if (siteStateContext.isLinuxApp) {
      return t('containerImageAndTagPlaceholder');
    }
  };

  return (
    <>
      {!isGitHubActionSelected && (
        <Field
          id="container-dockerHub-accessType"
          name="dockerHubAccessType"
          component={Dropdown}
          options={accessTypes}
          label={t('containerRepositoryAccess')}
          required={true}
        />
      )}

      {(isPrivateConfiguration || isGitHubActionSelected) && (
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

      {!isComposeOptionSelected && (
        <>
          <Field
            id="container-dockerHub-imageAndTag"
            name="dockerHubImageAndTag"
            component={TextField}
            label={isGitHubActionSelected ? t('containerImageName') : t('containerImageAndTag')}
            placeholder={getImagePlaceHolderText()}
            required={true}
          />

          {isGitHubActionSelected && (
            <ReactiveFormControl id="container-dockerHub-tag" label={t('containerACRTag')}>
              <div>{t('containerGitHubActionsTagLabel')}</div>
            </ReactiveFormControl>
          )}

          <Field
            id="container-dockerHub-startUpFileOrCommand"
            name="command"
            component={TextField}
            label={t('containerStartupFileOrCommand')}
          />
        </>
      )}

      {isComposeOptionSelected && (
        <>
          <Field
            id="container-dockerHub-composeYml"
            name="dockerHubComposeYml"
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

export default DeploymentCenterContainerDockerHubSettings;
