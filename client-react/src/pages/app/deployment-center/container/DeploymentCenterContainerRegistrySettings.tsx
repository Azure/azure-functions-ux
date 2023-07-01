import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from 'formik';

import { IChoiceGroupOptionProps, IDropdownOption } from '@fluentui/react';

import Dropdown from '../../../../components/form-controls/DropDown';
import { ScmType } from '../../../../models/site/config';
import { PortalContext } from '../../../../PortalContext';
import { SiteStateContext } from '../../../../SiteState';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import {
  ContainerOptions,
  ContainerRegistrySources,
  DeploymentCenterContainerFormData,
  DeploymentCenterFieldProps,
} from '../DeploymentCenter.types';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';

const DeploymentCenterContainerRegistrySettings: React.FC<DeploymentCenterFieldProps<DeploymentCenterContainerFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const scenarioService = new ScenarioService(t);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const portalContext = useContext(PortalContext);
  const siteStateContext = useContext(SiteStateContext);

  const [showContainerTypeOption, setShowContainerTypeOption] = useState(true);

  const onRegistrySourceChange = (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    portalContext.log(
      getTelemetryInfo('info', 'registrySource', 'changed', {
        registrySource: option.key.toString(),
      })
    );

    formProps.setFieldValue('registrySource', option.key.toString());
  };

  const onTypeOptionChange = (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    portalContext.log(
      getTelemetryInfo('info', 'containerOption', 'changed', {
        registrySource: option.key.toString(),
      })
    );

    formProps.setFieldValue('option', option.key.toString());
  };

  const sourceTypes: IChoiceGroupOptionProps[] = [
    {
      itemKey: ContainerRegistrySources.acr,
      key: ContainerRegistrySources.acr,
      text: t('containerACR'),
    },
    {
      itemKey: ContainerRegistrySources.docker,
      key: ContainerRegistrySources.docker,
      text: t('containerDockerHub'),
    },
    {
      itemKey: ContainerRegistrySources.privateRegistry,
      key: ContainerRegistrySources.privateRegistry,
      text: t('containerPrivateRegistry'),
    },
  ];

  const getContainerTypes = () => {
    const containerTypes: IChoiceGroupOptionProps[] = [
      {
        itemKey: ContainerOptions.docker,
        key: ContainerOptions.docker,
        text: t('singleContainerTitle'),
      },
    ];

    if (scenarioService.checkScenario(ScenarioIds.dockerCompose, { site: siteStateContext.site }).status !== 'disabled') {
      containerTypes.push({
        itemKey: ContainerOptions.compose,
        key: ContainerOptions.compose,
        text: t('dockerComposeContainerTitle'),
      });
    }

    return containerTypes;
  };

  useEffect(() => {
    const showOption =
      !deploymentCenterContext ||
      !deploymentCenterContext.siteConfig ||
      deploymentCenterContext.siteConfig.properties.scmType !== ScmType.GitHubAction;

    setShowContainerTypeOption(showOption);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext.siteConfig]);

  useEffect(() => {
    // NOTE(michinoy): disable compose option in case of GitHub Action.
    // We are currently not sure on what the right approach here should be.
    // The biggest blocker is how to identify secrets for the workflow file.

    const showOption = formProps.values.scmType !== ScmType.GitHubAction;
    setShowContainerTypeOption(showOption);

    if (!showOption) {
      formProps.setFieldValue('option', ContainerOptions.docker);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.scmType]);

  return (
    <>
      <h3>{t('deploymentCenterContainerRegistrySettingsTitle')}</h3>

      {showContainerTypeOption && (
        <Field
          id="deployment-center-container-type-option"
          name="option"
          component={Dropdown}
          options={getContainerTypes()}
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
