import React from 'react';
import { ProgressIndicator } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { deploymentCenterContent, containerLogs } from './DeploymentCenter.styles';

interface DeploymentCenterContainerLogsProps {
  logsLoading: boolean;
  logs: string;
}

const DeploymentCenterContainerLogs: React.FC<DeploymentCenterContainerLogsProps> = props => {
  const { logsLoading, logs } = props;
  const { t } = useTranslation();

  return (
    <div className={deploymentCenterContent}>
      {logsLoading && <ProgressIndicator ariaValueText={t('deploymentCenterContainerLogsLoadingAriaValue')} />}
      <pre className={containerLogs}>{logs}</pre>
    </div>
  );
};

export default DeploymentCenterContainerLogs;
