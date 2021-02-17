import React, { useEffect, useState, useContext } from 'react';
import { DeploymentCenterCommitLogsProps, DeploymentLogsItem } from '../DeploymentCenter.types';
import DeploymentCenterData from '../DeploymentCenter.data';
import { ArmArray, ArmObj } from '../../../../models/arm-obj';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { useTranslation } from 'react-i18next';
import { ProgressIndicator, IColumn, Link, PrimaryButton, CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react';
import { deploymentCenterLogsError, deploymentCenterConsole, closePublishProfileButtonStyle } from '../DeploymentCenter.styles';
import DisplayTableWithEmptyMessage from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import moment from 'moment';
import { ThemeContext } from '../../../../ThemeContext';
import { PortalContext } from '../../../../PortalContext';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { ScmType } from '../../../../models/site/config';
import { CommandBarStyles } from '../../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { CustomCommandBarButton } from '../../../../components/CustomCommandBarButton';
import CustomFocusTrapCallout from '../../../../components/CustomCallout/CustomFocusTrapCallout';
import { SiteStateContext } from '../../../../SiteState';

const DeploymentCenterCommitLogs: React.FC<DeploymentCenterCommitLogsProps> = props => {
  const { commitId, dismissLogPanel } = props;
  const { t } = useTranslation();

  const theme = useContext(ThemeContext);
  const portalContext = useContext(PortalContext);
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);

  const deploymentCenterData = new DeploymentCenterData();
  const [logItems, setLogItems] = useState<ArmArray<DeploymentLogsItem> | undefined>(undefined);
  const [logItemsError, setLogItemsError] = useState<string | undefined>(undefined);
  const [displayingDetails, setDisplayingDetails] = useState<boolean>(false);
  const [logDetails, setLogDetails] = useState<string | undefined>(undefined);
  const [isRedeployCommitCalloutHidden, setIsRedeployCommitCalloutHidden] = useState<boolean>(true);

  const fetchDeploymentLogs = async (commitIdString: string) => {
    portalContext.log(getTelemetryInfo('info', 'fetchDeploymentLogsForCommit', 'submit'));
    const commitLogsResponse = await deploymentCenterData.getDeploymentLogs(commitIdString);

    if (commitLogsResponse.metadata.success) {
      setLogItems(commitLogsResponse.data);
    } else {
      const errorMessage = getErrorMessage(commitLogsResponse.metadata.error);
      setLogItemsError(
        errorMessage ? t('deploymentCenterCodeLogActivityFailedWithError').format(errorMessage) : t('deploymentCenterCodeLogActivityFailed')
      );
      portalContext.log(
        getTelemetryInfo('error', 'commitLogsResponse', 'failed', {
          message: errorMessage,
          errorAsString: JSON.stringify(commitLogsResponse.metadata.error),
        })
      );
    }
  };

  const showLogDetails = async (commitIdString: string, logId: string) => {
    setDisplayingDetails(true);
    setLogDetails(undefined);

    portalContext.log(getTelemetryInfo('info', 'showCommitDetails', 'submit'));
    const deploymentLogDetailsResponse = await deploymentCenterData.getLogDetails(commitIdString, logId);

    if (deploymentLogDetailsResponse.metadata.success) {
      // NOTE (t-kakan): deploymentLogDetailsResponse give an array of messages rather than single message
      const detailsString = deploymentLogDetailsResponse.data.value.map(detailsElement => {
        return detailsElement.properties.message;
      });
      setLogDetails(detailsString.join('\r\n'));
    } else {
      const errorMessage = getErrorMessage(deploymentLogDetailsResponse.metadata.error);
      setLogDetails(
        errorMessage ? t('deploymentCenterCodeLogDetailsFailedWithError').format(errorMessage) : t('deploymentCenterCodeLogDetailsFailed')
      );
      portalContext.log(
        getTelemetryInfo('error', 'deploymentLogDetailsResponse', 'failed', {
          message: errorMessage,
          errorAsString: JSON.stringify(deploymentLogDetailsResponse.metadata.error),
        })
      );
    }
  };

  const getShowDetailsLink = (commitIdString: string, logItem: ArmObj<DeploymentLogsItem>) => {
    return logItem.properties.details_url ? (
      <Link href={`#${logItem.properties.id}`} onClick={() => showLogDetails(commitIdString, logItem.properties.id)}>
        {t('showLogs')}
      </Link>
    ) : (
      ''
    );
  };

  const getLogDisplayItem = (commitIdString: string, logItem: ArmObj<DeploymentLogsItem>) => {
    return {
      // NOTE (t-kakan): A is AM/PM
      displayTime: moment(logItem.properties.log_time).format('h:mm:ss A'),
      activity: logItem.properties.message,
      log: getShowDetailsLink(commitIdString, logItem),
    };
  };

  const showRedeployCommitCallout = () => {
    setIsRedeployCommitCalloutHidden(false);
  };

  const hideRedeployCommitCallout = () => {
    setIsRedeployCommitCalloutHidden(true);
  };

  const onRedeployCommitClick = () => {
    portalContext.log(getTelemetryInfo('verbose', 'onRedeployCommitClick', 'clicked'));
    showRedeployCommitCallout();
  };

  const redeployCommit = async () => {
    portalContext.log(
      getTelemetryInfo('info', 'redeployCommit', 'submit', {
        location: 'DeploymentCenterCommitLogs',
      })
    );

    const siteName = siteStateContext && siteStateContext.site ? siteStateContext.site.name : '';
    const resourceId = siteStateContext && siteStateContext.resourceId ? siteStateContext.resourceId : '';
    const specificCommitId = getSpecificCommitId();

    const notificationId = portalContext.startNotification(
      t('deploymentCenterCodeRedeployRequestSubmitted'),
      t('deploymentCenterCodeRedeployCommitRequestSubmittedDesc').format(specificCommitId, siteName)
    );

    setIsRedeployCommitCalloutHidden(true);

    const redeployResponse = await deploymentCenterData.redeployCommit(resourceId, specificCommitId);
    if (redeployResponse.metadata.success) {
      portalContext.stopNotification(
        notificationId,
        true,
        t('deploymentCenterCodeRedeployCommitSuccess').format(specificCommitId, siteName)
      );
    } else {
      const errorMessage = getErrorMessage(redeployResponse.metadata.error);
      errorMessage
        ? portalContext.stopNotification(
            notificationId,
            false,
            t('deploymentCenterCodeRedeployCommitFailedWithError').format(specificCommitId, siteName, errorMessage)
          )
        : portalContext.stopNotification(
            notificationId,
            false,
            t('deploymentCenterCodeRedeployCommitFailed').format(specificCommitId, siteName)
          );

      portalContext.log(
        getTelemetryInfo('error', 'redeployCommit', 'failed', {
          message: errorMessage,
        })
      );
    }
  };

  const commandBarItems: ICommandBarItemProps[] = [
    {
      id: 'redeploy-commit',
      key: 'deploymentCenterRedeployCommit',
      name: t('deploymentCenterRedeployCommit'),
      iconProps: {
        iconName: 'Download',
      },
      ariaLabel: t('deploymentCenterRedeployCommit'),
      onClick: onRedeployCommitClick,
    },
  ];

  const logDisplayItems = logItems && commitId ? logItems.value.map(logItem => getLogDisplayItem(commitId, logItem)) : [];

  const columns: IColumn[] = [
    { key: 'displayTime', name: t('time'), fieldName: 'displayTime', minWidth: 100 },
    { key: 'activity', name: t('activity'), fieldName: 'activity', minWidth: 250, isMultiline: true },
    { key: 'log', name: t('log'), fieldName: 'log', minWidth: 150 },
  ];

  const getCommitIdHeader = () => {
    if (commitId) {
      return <p>{`${t('commitId')}: ${getSpecificCommitId()}`}</p>;
    }
  };

  const getSpecificCommitId = () => {
    if (commitId) {
      return commitId.split('/')[commitId.split('/').length - 1];
    }

    return '';
  };

  const isAppServiceBuildService = () => {
    const scmType = deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType;
    return scmType === ScmType.BitbucketGit || scmType === ScmType.GitHub || scmType === ScmType.LocalGit;
  };

  useEffect(() => {
    if (commitId && deploymentCenterContext.siteConfig) {
      fetchDeploymentLogs(commitId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commitId, deploymentCenterContext.siteConfig]);

  return (
    <>
      {isAppServiceBuildService() && (
        <>
          <CommandBar
            items={commandBarItems}
            role="nav"
            styles={CommandBarStyles}
            ariaLabel={t('managePublishProfileCommandBarAriaLabel')}
            buttonAs={CustomCommandBarButton}
          />
          <CustomFocusTrapCallout
            target="#redeploy-commit"
            onDismissFunction={hideRedeployCommitCallout}
            setInitialFocus={true}
            hidden={isRedeployCommitCalloutHidden}
            title={t('deploymentCenterRedeployConfirmTitle')}
            description={t('deploymentCenterRedeployConfirmMessage')}
            defaultButtonTitle={t('ok')}
            defaultButtonFunction={redeployCommit}
            primaryButtonTitle={t('cancel')}
            primaryButtonFunction={hideRedeployCommitCallout}
          />
        </>
      )}
      {logItemsError ? (
        <pre className={deploymentCenterLogsError}>{logItemsError}</pre>
      ) : logItems ? (
        <>
          <h3>{t('logDetailsHeader')}</h3>
          {getCommitIdHeader()}
          <DisplayTableWithEmptyMessage columns={columns} items={logDisplayItems} selectionMode={0} layoutMode={1} constrainMode={0} />
          {displayingDetails && <pre className={deploymentCenterConsole(theme)}>{logDetails ? logDetails : t('resourceSelect')}</pre>}
        </>
      ) : (
        <ProgressIndicator
          description={t('deploymentCenterCodeDeploymentLogActivityLoading')}
          ariaValueText={t('deploymentCenterCodeDeploymentLogActivityLoadingAriaValue')}
        />
      )}

      <PrimaryButton className={closePublishProfileButtonStyle} text={t('Close')} onClick={dismissLogPanel} ariaLabel={t('Close')} />
    </>
  );
};

export default DeploymentCenterCommitLogs;
