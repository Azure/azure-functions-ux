import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { DeploymentCenterConstants } from '../DeploymentCenterConstants';
import { ScmType } from '../../../../models/site/config';
import { ContainerRegistrySources, DeploymentCenterContainerFormData, DeploymentCenterFieldProps } from '../DeploymentCenter.types';

const DeploymentCenterContainerSettingsReadOnlyView: React.FC<DeploymentCenterFieldProps<DeploymentCenterContainerFormData>> = ({
  formProps,
}) => {
  const { t } = useTranslation();
  const deploymentCenterContext = useContext(DeploymentCenterContext);

  const serverUrl = React.useMemo(() => {
    switch (formProps.values.registrySource) {
      case ContainerRegistrySources.acr:
        return formProps.values.acrLoginServer || t('deploymentCenterErrorFetchingInfo');
      case ContainerRegistrySources.docker:
        return DeploymentCenterConstants.dockerHubServerUrl;
      case ContainerRegistrySources.privateRegistry:
        return formProps.values.privateRegistryServerUrl || t('deploymentCenterErrorFetchingInfo');
      default:
        return t('deploymentCenterErrorFetchingInfo');
    }
  }, [formProps.values.registrySource]);

  const username = React.useMemo(() => {
    switch (formProps.values.registrySource) {
      case ContainerRegistrySources.acr:
        return formProps.values.acrUsername || t('deploymentCenterErrorFetchingInfo');
      case ContainerRegistrySources.docker:
        return formProps.values.dockerHubUsername || t('deploymentCenterErrorFetchingInfo');
      case ContainerRegistrySources.privateRegistry:
        return formProps.values.privateRegistryUsername || t('deploymentCenterErrorFetchingInfo');
      default:
        return t('deploymentCenterErrorFetchingInfo');
    }
  }, [formProps.values.registrySource]);

  const image = React.useMemo(() => {
    switch (formProps.values.registrySource) {
      case ContainerRegistrySources.acr:
        return formProps.values.acrImage || t('deploymentCenterErrorFetchingInfo');
      case ContainerRegistrySources.docker: {
        const imageAndTag = formProps.values.dockerHubImageAndTag.split(':');
        return imageAndTag.length > 0 ? imageAndTag[0] : t('deploymentCenterErrorFetchingInfo');
      }
      case ContainerRegistrySources.privateRegistry: {
        const imageAndTag = formProps.values.privateRegistryImageAndTag.split(':');
        return imageAndTag.length > 0 ? imageAndTag[0] : t('deploymentCenterErrorFetchingInfo');
      }
      default:
        return t('deploymentCenterErrorFetchingInfo');
    }
  }, [formProps.values.registrySource]);

  const tag = React.useMemo(() => {
    switch (formProps.values.registrySource) {
      case ContainerRegistrySources.acr:
        return formProps.values.acrTag || t('deploymentCenterErrorFetchingInfo');
      case ContainerRegistrySources.docker: {
        const imageAndTag = formProps.values.dockerHubImageAndTag.split(':');
        return imageAndTag.length > 1 ? imageAndTag[1] : t('deploymentCenterErrorFetchingInfo');
      }
      case ContainerRegistrySources.privateRegistry: {
        const imageAndTag = formProps.values.privateRegistryImageAndTag.split(':');
        return imageAndTag.length > 1 ? imageAndTag[1] : t('deploymentCenterErrorFetchingInfo');
      }
      default:
        return t('deploymentCenterErrorFetchingInfo');
    }
  }, [formProps.values.registrySource]);

  return (
    <>
      <h3>{t('deploymentCenterContainerRegistrySettingsTitle')}</h3>

      {deploymentCenterContext?.siteConfig?.properties.scmType === ScmType.GitHubAction && (
        <ReactiveFormControl id="deployment-center-container-settings-build" label={t('deploymentCenterSettingsBuildLabel')}>
          <div>{t('deploymentCenterCodeSettingsBuildGitHubAction')}</div>
        </ReactiveFormControl>
      )}
      <ReactiveFormControl id="deployment-center-container-settings-serverUrl" label={t('containerServerURL')}>
        <div>{serverUrl}</div>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-container-settings-username" label={t('containerLogin')}>
        <div>{username}</div>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-container-settings-image" label={t('containerImageName')}>
        <div>{image}</div>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-container-settings-tag" label={t('containerACRTag')}>
        <div>{tag}</div>
      </ReactiveFormControl>
    </>
  );
};

export default DeploymentCenterContainerSettingsReadOnlyView;
