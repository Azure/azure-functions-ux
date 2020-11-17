import React, { useContext, useEffect, useState } from 'react';
import {
  DeploymentCenterFieldProps,
  ContainerRegistrySources,
  DeploymentCenterContainerFormData,
  ContainerOptions,
} from '../DeploymentCenter.types';
import { useTranslation } from 'react-i18next';
import { IChoiceGroupOptionProps, IDropdownOption } from 'office-ui-fabric-react';
import { Field } from 'formik';
import Dropdown from '../../../../components/form-controls/DropDown';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { getLogId } from '../utility/DeploymentCenterUtility';
import { ScmType } from '../../../../models/site/config';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import Url from '../../../../utils/url';
import { CommonConstants } from '../../../../utils/CommonConstants';

const DeploymentCenterContainerRegistrySettings: React.FC<DeploymentCenterFieldProps<DeploymentCenterContainerFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();

  const deploymentCenterContext = useContext(DeploymentCenterContext);

  const [showContainerTypeOption, setShowContainerTypeOption] = useState(true);
  const [isContainerTypeOptionFeatureEnabled, setIsContainerTypeOptionFeatureEnabled] = useState(true);

  const onRegistrySourceChange = (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    LogService.trackEvent(LogCategories.deploymentCenter, getLogId('DeploymentCenterContainerRegistrySettings', 'onRegistrySourceChange'), {
      registrySource: option.key.toString(),
    });

    formProps.setFieldValue('registrySource', option.key.toString());
  };

  const onTypeOptionChange = (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    LogService.trackEvent(LogCategories.deploymentCenter, getLogId('DeploymentCenterContainerRegistrySettings', 'onTypeOptionChange'), {
      typeOption: option.key.toString(),
    });

    formProps.setFieldValue('option', option.key.toString());
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

  const containerTypes: IChoiceGroupOptionProps[] = [
    {
      key: ContainerOptions.docker,
      text: t('singleContainerTitle'),
    },
    {
      key: ContainerOptions.compose,
      text: t('dockerComposeContainerTitle'),
    },
  ];

  useEffect(() => {
    const showOption =
      !deploymentCenterContext ||
      !deploymentCenterContext.siteConfig ||
      deploymentCenterContext.siteConfig.properties.scmType !== ScmType.GitHubAction;

    const flagValue = Url.getFeatureValue(CommonConstants.FeatureFlags.showContainerTypeOption);
    const enabled = flagValue && flagValue.toLocaleLowerCase() === 'true';

    setShowContainerTypeOption(showOption && !!enabled);
    setIsContainerTypeOptionFeatureEnabled(!!enabled);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext.siteConfig]);

  useEffect(() => {
    // NOTE(michinoy): disable compose option in case of GitHub Action.
    // We are currently not sure on what the right approach here should be.
    // The biggest blocker is how to identify secrets for the workflow file.

    const showOption = formProps.values.scmType !== ScmType.GitHubAction;
    setShowContainerTypeOption(showOption && isContainerTypeOptionFeatureEnabled);

    if (!showOption) {
      formProps.setFieldValue('option', ContainerOptions.docker);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.scmType]);

  return (
    <>
      <h3>{t('deploymentCenterContainerRegistrySettingsTitle')}</h3>

      {showContainerTypeOption && isContainerTypeOptionFeatureEnabled && (
        <Field
          id="deployment-center-container-type-option"
          name="option"
          component={Dropdown}
          options={containerTypes}
          label={t('deploymentCenterContainerType')}
          onChange={onTypeOptionChange}
        />
      )}

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
