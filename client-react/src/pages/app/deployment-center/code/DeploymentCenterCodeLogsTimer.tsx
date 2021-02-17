import React, { useState, useEffect, useContext } from 'react';
import { DeploymentCenterCodeLogsTimerProps } from '../DeploymentCenter.types';
import { useTranslation } from 'react-i18next';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react';
import { CommandBarStyles } from '../../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { CustomCommandBarButton } from '../../../../components/CustomCommandBarButton';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';

const DeploymentCenterCodeLogsTimer: React.FC<DeploymentCenterCodeLogsTimerProps> = props => {
  const refreshMilliseconds = 30000;
  const [timeLeft, setTimeLeft] = useState(refreshMilliseconds / 1000);
  const { t } = useTranslation();

  const portalContext = useContext(PortalContext);

  useEffect(() => {
    setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft => timeLeft - 1);
      } else {
        setTimeLeft(refreshMilliseconds / 1000);
      }
    }, 1000);

    setInterval(() => {
      props.refreshLogs();
      setTimeLeft(refreshMilliseconds / 1000);
    }, refreshMilliseconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        props.refreshLogs();
      },
    },
  ];

  //return <div className={logsTimerStyle}>{t('logsRefreshTimerMessage').format(timeLeft)}</div>;
  return (
    <CommandBar
      items={commandBarItems}
      role="nav"
      styles={CommandBarStyles}
      ariaLabel={t('managePublishProfileCommandBarAriaLabel')}
      buttonAs={CustomCommandBarButton}
    />
  );
};

export default DeploymentCenterCodeLogsTimer;
