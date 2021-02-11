import React, { useState, useEffect } from 'react';
import { DeploymentCenterCodeLogsTimerProps } from '../DeploymentCenter.types';
import { logsTimerStyle } from '../DeploymentCenter.styles';
import { useTranslation } from 'react-i18next';

const DeploymentCenterCodeLogsTimer: React.FC<DeploymentCenterCodeLogsTimerProps> = props => {
  const refreshMilliseconds = 30000;
  const [timeLeft, setTimeLeft] = useState(refreshMilliseconds / 1000);
  const { t } = useTranslation();

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

  return <div className={logsTimerStyle}>{t('logsRefreshTimerMessage').format(timeLeft)}</div>;
};

export default DeploymentCenterCodeLogsTimer;
