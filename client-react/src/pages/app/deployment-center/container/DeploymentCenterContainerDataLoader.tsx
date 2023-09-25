import React, { useEffect, useContext, useState } from 'react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import {
  DeploymentCenterFormData,
  DeploymentCenterContainerFormData,
  DeploymentCenterYupValidationSchemaType,
  DeploymentCenterDataLoaderProps,
  DeploymentProperties,
  GitHubActionsRun,
} from '../DeploymentCenter.types';
import { DeploymentCenterPublishingContext } from '../authentication/DeploymentCenterPublishingContext';
import { DeploymentCenterContainerFormBuilder } from '../container/DeploymentCenterContainerFormBuilder';
import { useTranslation } from 'react-i18next';
import DeploymentCenterContainerForm from './DeploymentCenterContainerForm';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';
import { ArmArray } from '../../../../models/arm-obj';
import { SiteStateContext } from '../../../../SiteState';

const DeploymentCenterContainerDataLoader: React.FC<DeploymentCenterDataLoaderProps> = props => {
  const { isDataRefreshing, tab } = props;
  const { t } = useTranslation();

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const portalContext = useContext(PortalContext);
  const siteStateContext = useContext(SiteStateContext);

  const deploymentCenterContainerFormBuilder = new DeploymentCenterContainerFormBuilder(t);

  const [logs, setLogs] = useState<string | undefined>(undefined);
  const [deployments, setDeployments] = useState<ArmArray<DeploymentProperties> | undefined>(undefined);
  const [runs, setRuns] = useState<GitHubActionsRun[] | undefined>(undefined);

  const [containerFormData, setContainerFormData] = useState<DeploymentCenterFormData<DeploymentCenterContainerFormData> | undefined>(
    undefined
  );
  const [containerFormValidationSchema, setContainerFormValidationSchema] = useState<
    DeploymentCenterYupValidationSchemaType<DeploymentCenterContainerFormData> | undefined
  >(undefined);

  const generateForm = React.useCallback(() => {
    if (deploymentCenterContext.siteConfig) {
      deploymentCenterContainerFormBuilder.setSiteConfig(deploymentCenterContext.siteConfig);
    }

    if (deploymentCenterContext.configMetadata) {
      deploymentCenterContainerFormBuilder.setConfigMetadata(deploymentCenterContext.configMetadata);
    }

    if (deploymentCenterContext.applicationSettings) {
      deploymentCenterContainerFormBuilder.setApplicationSettings(deploymentCenterContext.applicationSettings);
    }

    if (deploymentCenterPublishingContext.publishingUser) {
      deploymentCenterContainerFormBuilder.setPublishingUser(deploymentCenterPublishingContext.publishingUser);
    }

    if (deploymentCenterPublishingContext.basicPublishingCredentialsPolicies) {
      deploymentCenterContainerFormBuilder.setBasicPublishingCredentialsPolicies(
        deploymentCenterPublishingContext.basicPublishingCredentialsPolicies
      );
    }

    const formData = deploymentCenterContainerFormBuilder.generateFormData();
    setContainerFormData(formData);
    setContainerFormValidationSchema(deploymentCenterContainerFormBuilder.generateYupValidationSchema());

    // NOTE(michinoy): Prevent logging form data here as it could contain secrets (e.g. publishing password)
    portalContext.log(
      getTelemetryInfo('info', 'generateForm', 'generated', {
        publishType: 'container',
      })
    );
  }, [
    deploymentCenterContext.siteConfig,
    deploymentCenterContext.configMetadata,
    deploymentCenterContext.applicationSettings,
    deploymentCenterPublishingContext.publishingUser,
    deploymentCenterPublishingContext.basicPublishingCredentialsPolicies,
  ]);

  const refresh = () => {
    portalContext.log(
      getTelemetryInfo('info', 'refresh', 'submit', {
        publishType: 'container',
      })
    );
    deploymentCenterContext.refresh();
    siteStateContext.refresh();
  };

  useEffect(() => {
    generateForm();
  }, [generateForm]);

  return (
    <DeploymentCenterContainerForm
      tab={tab}
      logs={logs}
      deployments={deployments}
      runs={runs}
      setLogs={setLogs}
      setDeployments={setDeployments}
      setRuns={setRuns}
      formData={containerFormData}
      formValidationSchema={containerFormValidationSchema}
      isDataRefreshing={isDataRefreshing}
      refresh={refresh}
    />
  );
};

export default DeploymentCenterContainerDataLoader;
