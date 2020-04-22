import React, { useState, useEffect } from 'react';
import DeploymentCenterContainerLogs from './DeploymentCenterContainerLogs';
import DeploymentCenterData from './DeploymentCenter.data';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../../ApiHelpers/ArmHelper';

export interface DeploymentCenterContainerLogsDataLoaderProps {
  resourceId: string;
}

const DeploymentCenterContainerLogsDataLoader: React.FC<DeploymentCenterContainerLogsDataLoaderProps> = props => {
  const { resourceId } = props;
  const { t } = useTranslation();
  const deploymentCenterData = new DeploymentCenterData();
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState(t('deploymentCenterContainerLogsLoading') as string);

  const fetchData = async () => {
    setIsLoading(true);
    setLogs(t('deploymentCenterContainerLogsLoading'));

    const logsResponse = await deploymentCenterData.fetchContainerLogs(resourceId);
    setIsLoading(false);

    if (logsResponse.metadata.success) {
      setLogs(logsResponse.data);
    } else {
      const errorMessage = getErrorMessage(logsResponse.metadata.error);
      setLogs(
        errorMessage ? t('deploymentCenterContainerLogsFailedWithError').format(errorMessage) : t('deploymentCenterContainerLogsFailed')
      );
    }
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <DeploymentCenterContainerLogs isLoading={isLoading} logs={logs} />;
};

export default DeploymentCenterContainerLogsDataLoader;
