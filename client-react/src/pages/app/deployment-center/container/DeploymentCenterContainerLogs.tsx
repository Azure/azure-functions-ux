import React from 'react';
import { ProgressIndicator } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { deploymentCenterContent, deploymentCenterLogs } from '../DeploymentCenter.styles';
import { DeploymentCenterContainerLogsProps } from '../DeploymentCenter.types';

const DeploymentCenterContainerLogs: React.FC<DeploymentCenterContainerLogsProps> = props => {
  const { logs } = props;
  const { t } = useTranslation();

  return (
    <div className={deploymentCenterContent}>
      {logs ? (
        <pre className={deploymentCenterLogs}>{logs}</pre>
      ) : (
        <ProgressIndicator
          description={t('deploymentCenterContainerLogsLoading')}
          ariaValueText={t('deploymentCenterContainerLogsLoadingAriaValue')}
        />
      )}
    </div>
  );
};

export default DeploymentCenterContainerLogs;
