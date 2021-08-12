import React, { useState, useEffect, useContext } from 'react';
import { DeploymentCenterCodeLogsTimerProps } from '../DeploymentCenter.types';
import { useTranslation } from 'react-i18next';
import { CustomCommandBarButton } from '../../../../components/CustomCommandBarButton';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';
import { refreshButtonStyle } from '../DeploymentCenter.styles';

const DeploymentCenterCodeLogsTimer: React.FC<DeploymentCenterCodeLogsTimerProps> = props => {
  const refreshMilliseconds = 30000;
  const [timeLeft, setTimeLeft] = useState(refreshMilliseconds / 1000);
  const { t } = useTranslation();

  const portalContext = useContext(PortalContext);

  const setAndGetIntervalToUpdateTimeLeft = () => {
    return setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft => timeLeft - 1);
      } else {
        setTimeLeft(refreshMilliseconds / 1000);
      }
    }, 1000);
  };

  const setAndGetIntervalToUpdateTimeLeftAndRefreshLogs = () => {
    return setInterval(() => {
      props.refreshLogs();
      setTimeLeft(refreshMilliseconds / 1000);
    }, refreshMilliseconds);
  };

  useEffect(() => {
    const updateTimeLeftInterval = setAndGetIntervalToUpdateTimeLeft();
    const updateTimeLeftAndRefreshLogsInterval = setAndGetIntervalToUpdateTimeLeftAndRefreshLogs();

    return () => {
      clearInterval(updateTimeLeftInterval);
      clearInterval(updateTimeLeftAndRefreshLogsInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CustomCommandBarButton
      key={'refresh'}
      name={t('refresh')}
      iconProps={{ iconName: 'Refresh' }}
      ariaLabel={t('deploymentCenterRefreshCommandAriaLabel')}
      onClick={() => {
        portalContext.log(getTelemetryInfo('verbose', 'refreshButton', 'clicked'));
        props.refreshLogs();
      }}
      className={refreshButtonStyle}>
      {t('refresh')}
    </CustomCommandBarButton>
  );
};

export default DeploymentCenterCodeLogsTimer;
