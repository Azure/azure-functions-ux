import React, { useEffect, useContext, useState } from 'react';
import { SiteStateContext } from '../../../../SiteState';
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
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { getLogId } from '../utility/DeploymentCenterUtility';

const DeploymentCenterContainerDataLoader: React.FC<DeploymentCenterDataLoaderProps> = props => {
  const { resourceId } = props;
  const { t } = useTranslation();

  const siteStateContext = useContext(SiteStateContext);
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);

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
    const containerLogsResponse = await deploymentCenterData.fetchContainerLogs(resourceId);

    if (containerLogsResponse.metadata.success) {
      setLogs(containerLogsResponse.data);
    } else {
      const errorMessage = getErrorMessage(containerLogsResponse.metadata.error);
      setLogs(
        errorMessage ? t('deploymentCenterContainerLogsFailedWithError').format(errorMessage) : t('deploymentCenterContainerLogsFailed')
      );

      LogService.error(LogCategories.deploymentCenter, getLogId('DeploymentCenterContainerDataLoader', 'updatePublishingUser'), {
        error: containerLogsResponse.metadata.error,
      });
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
    setContainerFormData(deploymentCenterContainerFormBuilder.generateFormData());
    setContainerFormValidationSchema(deploymentCenterContainerFormBuilder.generateYupValidationSchema());

    LogService.trackEvent(LogCategories.deploymentCenter, getLogId('DeploymentCenterContainerDataLoader', 'generateForm'), formData);
  };

  const refresh = () => {
    setIsLoading(true);
    fetchData();
    deploymentCenterContext.refresh();
  };

  useEffect(() => {
    fetchData();
    generateForm();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteStateContext, deploymentCenterContext]);

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
