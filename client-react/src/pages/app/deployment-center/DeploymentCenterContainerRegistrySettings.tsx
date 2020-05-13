import React from 'react';
import { DeploymentCenterFieldProps, ContainerOptions, ContainerRegistrySources } from './DeploymentCenter.types';
import { useTranslation } from 'react-i18next';
import { IChoiceGroupOptionProps } from 'office-ui-fabric-react';
import { Field } from 'formik';
import Dropdown from '../../../components/form-controls/DropDown';

const DeploymentCenterContainerRegistrySettings: React.FC<DeploymentCenterFieldProps> = props => {
  const { formProps } = props;
  const { t } = useTranslation();

  const options: IChoiceGroupOptionProps[] = [
    {
      key: ContainerOptions.docker,
      text: t('singleContainerTitle'),
    },
    {
      key: ContainerOptions.compose,
      text: t('dockerComposeContainerTitle'),
    },
  ];

  const sourceTypes: IChoiceGroupOptionProps[] = [
    {
      key: ContainerRegistrySources.acr,
      text: t('containerACR'),
    },
    {
      key: ContainerRegistrySources.docker,
      text: t('containerDockerHub'),
    },
    {
      key: ContainerRegistrySources.privateRegistry,
      text: t('containerPrivateRegistry'),
    },
  ];

  // NOTE(michinoy): Kubernetes support is currently deprecated, so only show IF the user has a kubernetes based app
  if (formProps && formProps.initialValues.option === ContainerOptions.kubernetes) {
    options.push({
      key: ContainerOptions.kubernetes,
      text: t('kubernetesContainerTitle'),
    });
  }

  return (
    <>
      <h3>{t('deploymentCenterContainerRegistrySettingsTitle')}</h3>
      <Field
        id="deployment-center-container-registry-option"
        name="option"
        component={Dropdown}
        options={options}
        label={t('deploymentCenterContainerRegistryOptionsLabel')}
      />
      <Field
        id="deployment-center-container-registry-source"
        name="registrySource"
        component={Dropdown}
        options={sourceTypes}
        label={t('deploymentCenterContainerRegistrySourceLabel')}
      />
    </>
  );
};

export default DeploymentCenterContainerRegistrySettings;
