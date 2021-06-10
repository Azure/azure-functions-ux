import React from 'react';
import { ProgressIndicator } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { deploymentCenterContent, deploymentCenterContainerLogs } from '../DeploymentCenter.styles';
import { DeploymentCenterContainerLogsProps } from '../DeploymentCenter.types';

const DeploymentCenterContainerLogs: React.FC<DeploymentCenterContainerLogsProps> = props => {
  const { logs, isLoading } = props;
  const { t } = useTranslation();

  const getProgressIndicator = () => {
    return (
      <ProgressIndicator
        description={t('deploymentCenterContainerLogsLoading')}
        ariaValueText={t('deploymentCenterContainerLogsLoadingAriaValue')}
      />
    );
  };

  return (
    <>
      {isLoading ? (
        getProgressIndicator()
      ) : (
        <div className={deploymentCenterContent}>
          {logs ? (
            <>
              {t('deploymentCenterContainerLogsDesc')}
              <pre className={deploymentCenterContainerLogs}>{logs}</pre>
            </>
          ) : (
            getProgressIndicator()
          )}
        </div>
      )}
    </>
  );
};

export default DeploymentCenterContainerLogs;
