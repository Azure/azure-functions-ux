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
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { ScmType } from '../../../../models/site/config';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { PortalContext } from '../../../../PortalContext';
import { LogLevels } from '../../../../models/telemetry';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { SiteStateContext } from '../../../../SiteState';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';

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

  const getContainerTypes = () => {
    const containerTypes: IChoiceGroupOptionProps[] = [
      {
        key: ContainerOptions.docker,
        text: t('singleContainerTitle'),
      },
    ];

    if (scenarioService.checkScenario(ScenarioIds.dockerCompose, { site: siteStateContext.site }).status !== 'disabled') {
      containerTypes.push({
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
