import React from 'react';
import { DeploymentCenterFieldProps, ContainerRegistrySources, DeploymentCenterContainerFormData } from '../DeploymentCenter.types';
import { useTranslation } from 'react-i18next';
import { IChoiceGroupOptionProps, IDropdownOption } from 'office-ui-fabric-react';
import { Field } from 'formik';
import Dropdown from '../../../../components/form-controls/DropDown';
import { DeploymentCenterConstants } from '../DeploymentCenterConstants';

const DeploymentCenterContainerRegistrySettings: React.FC<DeploymentCenterFieldProps<DeploymentCenterContainerFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();

  const onRegistrySourceChange = (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    formProps.setFieldValue('registrySource', option.key.toString());
    if (option.key.toString() === ContainerRegistrySources.docker) {
      formProps.setFieldValue('serverUrl', DeploymentCenterConstants.dockerHubUrl);
    }
  };

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

  return (
    <>
      <h3>{t('deploymentCenterContainerRegistrySettingsTitle')}</h3>

      {/*
      TODO(michinoy): For now we will only support docker (single container) option. See following work item for enabling compose:
      https://msazure.visualstudio.com/Antares/_workitems/edit/8238865
      */}

      <Field
        id="deployment-center-container-registry-source"
        name="registrySource"
        component={Dropdown}
        options={sourceTypes}
        label={t('deploymentCenterContainerRegistrySourceLabel')}
        onChange={onRegistrySourceChange}
      />
    </>
  );
};

export default DeploymentCenterContainerRegistrySettings;
