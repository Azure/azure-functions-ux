import React, { useContext, useEffect, useRef } from 'react';
import { ProgressIndicator } from '@fluentui/react';
import { useTranslation } from 'react-i18next';
import { logsTimerStyle, deploymentCenterContainerLogsBox, refreshButtonStyle, deploymentCenterContent } from '../DeploymentCenter.styles';
import { DeploymentCenterContainerLogsProps } from '../DeploymentCenter.types';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';
import { CustomCommandBarButton } from '../../../../components/CustomCommandBarButton';

const DeploymentCenterContainerLogs: React.FC<DeploymentCenterContainerLogsProps> = props => {
  const { logs, isLogsDataRefreshing, refresh } = props;
  const { t } = useTranslation();
  const logsEndRef = useRef<HTMLDivElement>(null);

  const portalContext = useContext(PortalContext);

  const getProgressIndicator = () => {
    return (
      <ProgressIndicator
        description={t('deploymentCenterContainerLogsLoading')}
        ariaValueText={t('deploymentCenterContainerLogsLoadingAriaValue')}
      />
    );
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsEndRef.current]);

  return (
    <div className={deploymentCenterContent}>
      {t('deploymentCenterContainerLogsDesc')}

      {isLogsDataRefreshing ? (
        getProgressIndicator()
      ) : (
        <>
          {logs ? (
            <>
              <div className={logsTimerStyle}>
                <CustomCommandBarButton
                  key={'refresh'}
                  name={t('refresh')}
                  iconProps={{ iconName: 'Refresh' }}
                  ariaLabel={t('deploymentCenterRefreshCommandAriaLabel')}
                  onClick={() => {
                    portalContext.log(getTelemetryInfo('verbose', 'refreshButton', 'clicked'));
                    refresh();
                  }}
                  className={refreshButtonStyle}>
                  {t('refresh')}
                </CustomCommandBarButton>
              </div>
              <div className={deploymentCenterContainerLogsBox}>
                {logs.trim()}
                <div ref={logsEndRef} />
              </div>
            </>
          ) : (
            getProgressIndicator()
          )}
        </>
      )}
    </div>
  );
};

export default DeploymentCenterContainerLogs;
