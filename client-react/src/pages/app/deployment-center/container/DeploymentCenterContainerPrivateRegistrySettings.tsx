import React, { useContext, useEffect, useState } from 'react';
import { Field } from 'formik';
import TextField from '../../../../components/form-controls/TextField';
import { useTranslation } from 'react-i18next';
import { SiteStateContext } from '../../../../SiteState';
import { ContainerOptions, DeploymentCenterContainerFormData, DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import DeploymentCenterContainerComposeFileUploader from './DeploymentCenterContainerComposeFileUploader';
import { ScmType } from '../../../../models/site/config';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';

const DeploymentCenterContainerPrivateRegistrySettings: React.FC<DeploymentCenterFieldProps<DeploymentCenterContainerFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const siteStateContext = useContext(SiteStateContext);
  const [isComposeOptionSelected, setIsComposeOptionSelected] = useState(false);
  const [isGitHubActionSelected, setIsGitHubActionSelected] = useState(false);

  useEffect(() => {
    setIsComposeOptionSelected(formProps.values.option === ContainerOptions.compose);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.option]);

  useEffect(() => {
    setIsGitHubActionSelected(formProps.values.scmType === ScmType.GitHubAction);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.scmType]);

  // NOTE(michinoy): In case of GitHub Action, we will always need to get the user credentials for their private
  // registry. This is because the workflow would need to use those credentials to push the images and app service
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
    } else {
      return t('containerImageAndTagPlaceholderForWindows');
    }
  };

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

      {!isComposeOptionSelected && (
        <>
          <Field
            id="container-privateRegistry-imageAndTag"
            name="privateRegistryImageAndTag"
            component={TextField}
            label={isGitHubActionSelected ? t('containerImageName') : t('containerImageAndTag')}
            placeholder={getImagePlaceHolderText()}
            required={true}
          />

          {isGitHubActionSelected && (
            <ReactiveFormControl id="container-privateRegistry-tag" label={t('containerACRTag')}>
              <div>{t('containerGitHubActionsTagLabel')}</div>
            </ReactiveFormControl>
          )}

          <Field
            id="container-privateRegistry-startUpFileOrCommand"
            name="command"
            component={TextField}
            label={t('containerStartupFileOrCommand')}
          />
        </>
      )}

      {isComposeOptionSelected && (
        <>
          <Field
            id="container-privateRegistry-composeYml"
            name="privateRegistryComposeYml"
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

export default DeploymentCenterContainerPrivateRegistrySettings;
