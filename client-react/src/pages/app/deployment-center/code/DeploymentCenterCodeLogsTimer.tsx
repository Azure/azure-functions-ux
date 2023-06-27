import React, { useState, useEffect, useContext } from 'react';
import { DeploymentCenterCodeLogsTimerProps } from '../DeploymentCenter.types';
import { useTranslation } from 'react-i18next';
import { CustomCommandBarButton } from '../../../../components/CustomCommandBarButton';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';
import { logsButtonStyle } from '../DeploymentCenter.styles';
import { IconConstants } from '../../../../utils/constants/IconConstants';

const DeploymentCenterCodeLogsTimer: React.FC<DeploymentCenterCodeLogsTimerProps> = props => {
  const refreshMilliseconds = 30000;
  const [timeLeft, setTimeLeft] = useState(refreshMilliseconds / 1000);
  const { t } = useTranslation();

  const portalContext = useContext(PortalContext);

  const setAndGetIntervalToUpdateTimeLeft = () => {
    return setInterval(() => {
      if (timeLeft > 0 && !props.pauseTimer) {
        setTimeLeft(timeLeft - 1);
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
  }, [props.pauseTimer]);

  return (
    <>
      <CustomCommandBarButton
        key={'refresh'}
        name={t('refresh')}
        iconProps={{ iconName: IconConstants.IconNames.Refresh }}
        ariaLabel={t('deploymentCenterRefreshCommandAriaLabel')}
        onClick={() => {
          portalContext.log(getTelemetryInfo('verbose', 'refreshButton', 'clicked'));
          props.refreshLogs();
        }}
        className={logsButtonStyle}>
        {t('refresh')}
      </CustomCommandBarButton>
      <CustomCommandBarButton
        key={'delete'}
        name={t('delete')}
        iconProps={{ iconName: IconConstants.IconNames.Delete }}
        ariaLabel={t('deploymentCenterDeleteCommandAriaLabel')}
        onClick={() => {
          portalContext.log(getTelemetryInfo('verbose', 'deleteButton', 'clicked'));
          props.deleteLogs();
        }}
        className={logsButtonStyle}>
        {t('delete')}
      </CustomCommandBarButton>
    </>
  );
};

export default DeploymentCenterCodeLogsTimer;
