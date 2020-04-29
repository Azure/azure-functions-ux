import React from 'react';
import { ProgressIndicator } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { deploymentCenterContent, containerLogs } from './DeploymentCenter.styles';
import { DeploymentCenterContainerLogsProps } from './DeploymentCenter.types';

const DeploymentCenterContainerLogs: React.FC<DeploymentCenterContainerLogsProps> = props => {
  const { logs } = props;
  const { t } = useTranslation();

  return (
    <div className={deploymentCenterContent}>
      {!logs && (
        <ProgressIndicator
          description={t('deploymentCenterContainerLogsLoading')}
          ariaValueText={t('deploymentCenterContainerLogsLoadingAriaValue')}
        />
      )}
      {logs && <pre className={containerLogs}>{logs}</pre>}
    </div>
  );
};

export default DeploymentCenterContainerLogs;
