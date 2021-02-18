import React, { useContext } from 'react';
import { CommandBar, ICommandBarItemProps, ProgressIndicator } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { deploymentCenterContent, deploymentCenterContainerLogs, logsTimerStyle } from '../DeploymentCenter.styles';
import { DeploymentCenterContainerLogsProps } from '../DeploymentCenter.types';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';
import { CommandBarStyles } from '../../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { CustomCommandBarButton } from '../../../../components/CustomCommandBarButton';

const DeploymentCenterContainerLogs: React.FC<DeploymentCenterContainerLogsProps> = props => {
  const { logs, isLoading, refresh } = props;
  const { t } = useTranslation();

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

  return (
    <>
      {isLoading ? (
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
                <pre className={deploymentCenterContainerLogs}>{logs}</pre>
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
