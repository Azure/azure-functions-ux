import React, { useContext, useEffect, useRef, useState } from 'react';
import { ProgressIndicator } from '@fluentui/react';
import { useTranslation } from 'react-i18next';
import {
  logsTimerStyle,
  deploymentCenterContainerLogsBox,
  logsButtonStyle,
  downloadButtonStyle,
  deploymentCenterContent,
} from '../DeploymentCenter.styles';
import { DeploymentCenterContainerLogsProps } from '../DeploymentCenter.types';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';
import { CustomCommandBarButton } from '../../../../components/CustomCommandBarButton';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { BladeCloseData, BladeCloseReason } from '../../../../models/portal-models';
import DeploymentCenterData from '../DeploymentCenter.data';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';

interface ArchiveSettingsBladeResponse {
  openArchiveSetting: boolean;
}

const DeploymentCenterContainerLogs: React.FC<DeploymentCenterContainerLogsProps> = props => {
  const { logs, setLogs } = props;
  const { t } = useTranslation();
  const logsEndRef = useRef<HTMLDivElement>(null);

  const portalContext = useContext(PortalContext);
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterData = new DeploymentCenterData();

  const [isLogsDataRefreshing, setIsLogsDataRefreshing] = useState(false);

  const fetchContainerLogsData = async () => {
    portalContext.log(
      getTelemetryInfo('info', 'containerLogsDataRequest', 'submit', {
        publishType: 'container',
      })
    );

    const containerLogsResponse = await deploymentCenterData.fetchContainerLogs(deploymentCenterContext.resourceId);

    if (containerLogsResponse.metadata.success) {
      setLogs(containerLogsResponse.data);
    } else {
      const errorMessage = getErrorMessage(containerLogsResponse.metadata.error);
      setLogs(
        errorMessage ? t('deploymentCenterContainerLogsFailedWithError').format(errorMessage) : t('deploymentCenterContainerLogsFailed')
      );

      portalContext.log(
        getTelemetryInfo('error', 'containerLogsResponse', 'failed', {
          message: getErrorMessage(containerLogsResponse.metadata.error),
          errorAsString: JSON.stringify(containerLogsResponse.metadata.error),
        })
      );
    }

    setIsLogsDataRefreshing(false);
  };

  const getProgressIndicator = () => {
    return (
      <ProgressIndicator
        description={t('deploymentCenterContainerLogsLoading')}
        ariaValueText={t('deploymentCenterContainerLogsLoadingAriaValue')}
      />
    );
  };

  useEffect(() => {
    if (deploymentCenterContext.resourceId) {
      setIsLogsDataRefreshing(true);
      fetchContainerLogsData();
      setIsLogsDataRefreshing(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext.resourceId]);

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
                    fetchContainerLogsData();
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
