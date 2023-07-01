import React, { useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { ProgressIndicator } from '@fluentui/react';

import { CustomCommandBarButton } from '../../../../components/CustomCommandBarButton';
import { BladeCloseData, BladeCloseReason } from '../../../../models/portal-models';
import { PortalContext } from '../../../../PortalContext';
import {
  deploymentCenterContainerLogsBox,
  deploymentCenterContent,
  downloadButtonStyle,
  logsButtonStyle,
  logsTimerStyle,
} from '../DeploymentCenter.styles';
import { DeploymentCenterContainerLogsProps } from '../DeploymentCenter.types';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';

interface ArchiveSettingsBladeResponse {
  openArchiveSetting: boolean;
}

const DeploymentCenterContainerLogs: React.FC<DeploymentCenterContainerLogsProps> = props => {
  const { logs, isLogsDataRefreshing, refresh } = props;
  const { t } = useTranslation();
  const logsEndRef = useRef<HTMLDivElement>(null);

  const portalContext = useContext(PortalContext);
  const deploymentCenterContext = useContext(DeploymentCenterContext);

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
                  className={logsButtonStyle}>
                  {t('refresh')}
                </CustomCommandBarButton>
                <CustomCommandBarButton
                  key={'download'}
                  name={t('download')}
                  iconProps={{ iconName: 'Download' }}
                  ariaLabel={t('deploymentCenterDownloadCommandAriaLabel')}
                  onClick={() => {
                    portalContext
                      .openBlade<ArchiveSettingsBladeResponse>({
                        detailBlade: 'DownloadLogs.ReactView',
                        extension: 'WebsitesExtension',
                        openAsContextBlade: true,
                        detailBladeInputs: {
                          resourceId: deploymentCenterContext.resourceId,
                        },
                      })
                      .then(r => {
                        if (r.reason === BladeCloseReason.childClosedSelf && r.data?.[BladeCloseData.openArchiveSetting]) {
                          portalContext.openBlade<ArchiveSettingsBladeResponse>({
                            detailBlade: 'ArchiveSettings.ReactView',
                            extension: 'WebsitesExtension',
                            openAsContextBlade: true,
                            detailBladeInputs: {
                              resourceId: deploymentCenterContext.resourceId,
                            },
                          });
                        }
                      });
                  }}
                  className={downloadButtonStyle}>
                  {t('download')}
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
