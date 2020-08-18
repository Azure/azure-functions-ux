import React from 'react';
import { Field } from 'formik';
import TextField from '../../../../components/form-controls/TextField';
import { useTranslation } from 'react-i18next';
import { IChoiceGroupOptionProps } from 'office-ui-fabric-react';
import { ContainerDockerAccessTypes, DeploymentCenterFieldProps, DeploymentCenterContainerFormData } from '../DeploymentCenter.types';
import Dropdown from '../../../../components/form-controls/DropDown';

const DeploymentCenterContainerDockerHubSettings: React.FC<DeploymentCenterFieldProps<DeploymentCenterContainerFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();

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

  return (
    <>
      <Field
        id="container-dockerHub-imageAndTag"
        name="imageAndTag"
        component={TextField}
        label={t('containerImageAndTag')}
        placeholder={t('containerImageAndTagPlaceholder')}
      />

      <Field
        id="container-dockerHub-accessType"
        name="dockerAccessType"
        component={Dropdown}
        options={accessTypes}
        label={t('containerRepositoryAccess')}
      />

      {formProps && formProps.values.dockerAccessType === ContainerDockerAccessTypes.private && (
        <>
          <Field id="container-dockerHub-username" name="username" component={TextField} label={t('containerLogin')} />

          <Field id="container-dockerHub-password" name="password" component={TextField} label={t('containerPassword')} />
        </>
      )}

      <Field id="container-dockerHub-startUpFile" name="command" component={TextField} label={t('containerStartupFile')} />
    </>
  );
};

export default DeploymentCenterContainerDockerHubSettings;
