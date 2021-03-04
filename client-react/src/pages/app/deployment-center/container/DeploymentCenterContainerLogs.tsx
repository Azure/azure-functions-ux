import React, { useContext, useEffect, useRef } from 'react';
import { CommandBar, ICommandBarItemProps, ProgressIndicator } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { deploymentCenterContent, logsTimerStyle, deploymentCenterContainerLogsBox } from '../DeploymentCenter.styles';
import { DeploymentCenterContainerLogsProps } from '../DeploymentCenter.types';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';
import { CommandBarStyles } from '../../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
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

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'refresh',
      name: t('refresh'),
      iconProps: {
        iconName: 'Refresh',
      },
      ariaLabel: t('deploymentCenterRefreshCommandAriaLabel'),
      onClick: () => {
        portalContext.log(getTelemetryInfo('verbose', 'refreshButton', 'clicked'));
        refresh();
      },
    },
  ];

  useEffect(() => {
    if (!!logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsEndRef.current]);

  return (
    <>
      {isLogsDataRefreshing ? (
        getProgressIndicator()
      ) : (
        <>
          {logs ? (
            <>
              <div className={logsTimerStyle}>
                <CommandBar
                  items={commandBarItems}
                  role="nav"
                  styles={CommandBarStyles}
                  ariaLabel={t('managePublishProfileCommandBarAriaLabel')}
                  buttonAs={CustomCommandBarButton}
                />
              </div>
              <div className={deploymentCenterContent}>
                {t('deploymentCenterContainerLogsDesc')}
                <div className={deploymentCenterContainerLogsBox}>
                  {logs.trim()}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </>
          ) : (
            getProgressIndicator()
          )}
        </>
      )}
    </>
  );
};

export default DeploymentCenterContainerLogs;
