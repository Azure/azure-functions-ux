import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { PortalContext } from '../../../../PortalContext';
import { DeploymentCenterContainerFormBuilder } from '../container/DeploymentCenterContainerFormBuilder';
import DeploymentCenterData from '../DeploymentCenter.data';
import {
  DeploymentCenterContainerFormData,
  DeploymentCenterDataLoaderProps,
  DeploymentCenterFormData,
  DeploymentCenterYupValidationSchemaType,
} from '../DeploymentCenter.types';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { DeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import DeploymentCenterContainerForm from './DeploymentCenterContainerForm';

const DeploymentCenterContainerDataLoader: React.FC<DeploymentCenterDataLoaderProps> = props => {
  const { resourceId, isDataRefreshing, tab } = props;
  const { t } = useTranslation();

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const portalContext = useContext(PortalContext);

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContainerFormBuilder = new DeploymentCenterContainerFormBuilder(t);

  const [isLogsDataRefreshing, setIsLogsDataRefreshing] = useState(false);
  const [logs, setLogs] = useState<string | undefined>(undefined);

  const [containerFormData, setContainerFormData] = useState<DeploymentCenterFormData<DeploymentCenterContainerFormData> | undefined>(
    undefined
  );
  const [containerFormValidationSchema, setContainerFormValidationSchema] = useState<
    DeploymentCenterYupValidationSchemaType<DeploymentCenterContainerFormData> | undefined
  >(undefined);

  const fetchInitialLogsData = async () => {
    portalContext.log(
      getTelemetryInfo('info', 'initialDataRequest', 'submit', {
        publishType: 'container',
      })
    );
    setIsLogsDataRefreshing(true);

    const containerLogsResponse = await deploymentCenterData.fetchContainerLogs(resourceId);

    if (containerLogsResponse.metadata.success) {
      setLogs(containerLogsResponse.data);
    } else {
      const errorMessage = getErrorMessage(containerLogsResponse.metadata.error);
      setLogs(
        errorMessage ? t('deploymentCenterContainerLogsFailedWithError').format(errorMessage) : t('deploymentCenterContainerLogsFailed')
      );

      portalContext.log(
        getTelemetryInfo('error', 'containerLogsResponse', 'failed', {
          message: getErrorMessage(containerLogsResponse.metadata.error),
          errorAsString: JSON.stringify(containerLogsResponse.metadata.error),
        })
      );
    }

    setIsLogsDataRefreshing(false);
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
  };

  const refresh = () => {
    portalContext.log(
      getTelemetryInfo('info', 'refresh', 'submit', {
        publishType: 'container',
      })
    );

    fetchInitialLogsData();
    deploymentCenterContext.refresh();
  };

  useEffect(() => {
    if (deploymentCenterContext.resourceId) {
      fetchInitialLogsData();
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
      tab={tab}
      logs={logs}
      formData={containerFormData}
      formValidationSchema={containerFormValidationSchema}
      isLogsDataRefreshing={isLogsDataRefreshing}
      isDataRefreshing={isDataRefreshing}
      refresh={refresh}
    />
  );
};

export default DeploymentCenterContainerDataLoader;
