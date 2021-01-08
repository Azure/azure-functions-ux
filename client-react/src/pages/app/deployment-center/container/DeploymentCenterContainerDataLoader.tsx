import React, { useEffect, useContext, useState } from 'react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import {
  DeploymentCenterFormData,
  DeploymentCenterContainerFormData,
  DeploymentCenterYupValidationSchemaType,
  DeploymentCenterDataLoaderProps,
} from '../DeploymentCenter.types';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';
import { DeploymentCenterContainerFormBuilder } from '../container/DeploymentCenterContainerFormBuilder';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import DeploymentCenterContainerForm from './DeploymentCenterContainerForm';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';
import { LogLevels } from '../../../../models/telemetry';

const DeploymentCenterContainerDataLoader: React.FC<DeploymentCenterDataLoaderProps> = props => {
  const { resourceId } = props;
  const { t } = useTranslation();

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const portalContext = useContext(PortalContext);

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContainerFormBuilder = new DeploymentCenterContainerFormBuilder(t);

  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string | undefined>(undefined);

  const [containerFormData, setContainerFormData] = useState<DeploymentCenterFormData<DeploymentCenterContainerFormData> | undefined>(
    undefined
  );
  const [containerFormValidationSchema, setContainerFormValidationSchema] = useState<
    DeploymentCenterYupValidationSchemaType<DeploymentCenterContainerFormData> | undefined
  >(undefined);

  const fetchData = async () => {
    portalContext.log(
      getTelemetryInfo(LogLevels.info, 'initialDataRequest', 'submit', {
        publishType: 'container',
      })
    );

    const containerLogsResponse = await deploymentCenterData.fetchContainerLogs(resourceId);

    if (containerLogsResponse.metadata.success) {
      setLogs(containerLogsResponse.data);
    } else {
      const errorMessage = getErrorMessage(containerLogsResponse.metadata.error);
      setLogs(
        errorMessage ? t('deploymentCenterContainerLogsFailedWithError').format(errorMessage) : t('deploymentCenterContainerLogsFailed')
      );

      portalContext.log(
        getTelemetryInfo(LogLevels.error, 'containerLogsResponse', 'failed', {
          message: getErrorMessage(containerLogsResponse.metadata.error),
          errorAsString: JSON.stringify(containerLogsResponse.metadata.error),
        })
      );
    }

    setIsLoading(false);
  };

  const generateForm = () => {
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

    const formData = deploymentCenterContainerFormBuilder.generateFormData();
    setContainerFormData(formData);
    setContainerFormValidationSchema(deploymentCenterContainerFormBuilder.generateYupValidationSchema());

    // NOTE(michinoy): Prevent logging form data here as it could contain secrets (e.g. publishing password)
    portalContext.log(
      getTelemetryInfo(LogLevels.info, 'generateForm', 'generated', {
        publishType: 'container',
      })
    );
  };

  const refresh = () => {
    portalContext.log(
      getTelemetryInfo(LogLevels.info, 'refresh', 'submit', {
        publishType: 'container',
      })
    );

    setIsLoading(true);
    fetchData();
    deploymentCenterContext.refresh();
  };

  useEffect(() => {
    if (deploymentCenterContext.resourceId) {
      fetchData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext.resourceId]);

  useEffect(() => {
    if (deploymentCenterContext.applicationSettings && deploymentCenterContext.siteConfig && deploymentCenterContext.configMetadata) {
      generateForm();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext.applicationSettings, deploymentCenterContext.siteConfig, deploymentCenterContext.configMetadata]);

  return (
    <DeploymentCenterContainerForm
      logs={logs}
      formData={containerFormData}
      formValidationSchema={containerFormValidationSchema}
      isLoading={isLoading}
      refresh={refresh}
    />
  );
};

export default DeploymentCenterContainerDataLoader;
