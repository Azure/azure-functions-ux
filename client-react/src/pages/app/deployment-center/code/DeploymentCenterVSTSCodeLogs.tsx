import React, { useState, useContext, useMemo, useCallback, useEffect } from 'react';
import DisplayTableWithEmptyMessage from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import moment from 'moment';
import {
  DeploymentCenterCodeLogsProps,
  DateTimeObj,
  DeploymentStatus,
  DeploymentProperties,
  CodeDeploymentsRow,
  KuduLogMessage,
  UrlInfo,
} from '../DeploymentCenter.types';
import { ProgressIndicator, PanelType, IColumn, Link, PrimaryButton, IGroup, Icon, Selection, SelectionMode } from '@fluentui/react';
import { useTranslation } from 'react-i18next';
import {
  deploymentCenterLogsError,
  deploymentCenterCodeLogsNotConfigured,
  deploymentCenterCodeLogsBox,
  deploymentCenterVstsCodeLogsLinkStyle,
} from '../DeploymentCenter.styles';
import { ArmObj } from '../../../../models/arm-obj';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import DeploymentCenterCommitLogs from './DeploymentCenterCommitLogs';
import DeploymentCenterCodeLogsTimer from './DeploymentCenterCodeLogsTimer';
import { ReactComponent as DeploymentCenterIcon } from '../../../../images/Common/deployment-center.svg';
import { ScmType } from '../../../../models/site/config';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';
import { PortalContext } from '../../../../PortalContext';
import { deleteDeploymentCenterLogs, fetchDeploymentLogs, getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import DeploymentCenterData from '../DeploymentCenter.data';
import { SiteStateContext } from '../../../../SiteState';

export function dateTimeComparatorReverse(a: DateTimeObj, b: DateTimeObj) {
  if (a.rawTime.isBefore(b.rawTime)) {
    return 1;
  }
  if (a.rawTime.isAfter(b.rawTime)) {
    return -1;
  }
  return 0;
}

const DeploymentCenterVSTSCodeLogs: React.FC<DeploymentCenterCodeLogsProps> = props => {
  const [isLogPanelOpen, setIsLogPanelOpen] = useState<boolean>(false);
  const [isDeleteConfirmDialogOpen, setIsDeleteConfirmDialogOpen] = React.useState<boolean>(false);
  const [currentCommitId, setCurrentCommitId] = useState<string | undefined>(undefined);
  const portalContext = useContext(PortalContext);
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);
  const deploymentCenterData = new DeploymentCenterData();
  const { deployments, setDeployments, goToSettings } = props;
  const { t } = useTranslation();
  const [deploymentsError, setDeploymentsError] = useState<string | undefined>(undefined);
  const [isLogsDataRefreshing, setIsLogsDataRefreshing] = React.useState<boolean>(false);
  const [selectedLogs, setSelectedLogs] = React.useState<CodeDeploymentsRow[]>([]);
  const selection = useMemo(
    () =>
      new Selection({
        onSelectionChanged: () => {
          const selectedItems = selection.getSelection();
          setSelectedLogs(selectedItems as CodeDeploymentsRow[]);
        },
        selectionMode: SelectionMode.multiple,
      }),
    [setSelectedLogs]
  );
  const pauseTimer = useMemo(() => selectedLogs.length > 0, [selectedLogs]);

  useEffect(() => {
    if (!deployments) {
      portalContext.log(
        getTelemetryInfo('info', 'initialDataRequest', 'submit', {
          publishType: 'code',
        })
      );
      setIsLogsDataRefreshing(true);
      fetchDeploymentLogs(
        deploymentCenterContext.resourceId,
        deploymentCenterData,
        siteStateContext,
        setDeployments,
        setDeploymentsError,
        t
      ).then(() => setIsLogsDataRefreshing(false));
    }
  }, [deployments, deploymentCenterContext.resourceId]);

  const refreshLogs = async () => {
    await fetchDeploymentLogs(
      deploymentCenterContext.resourceId,
      deploymentCenterData,
      siteStateContext,
      setDeployments,
      setDeploymentsError,
      t
    );
  };

  const showLogPanel = (deployment: ArmObj<DeploymentProperties>) => {
    setIsLogPanelOpen(true);
    setCurrentCommitId(deployment.id);
  };

  const dismissLogPanel = () => {
    setIsLogPanelOpen(false);
    setCurrentCommitId(undefined);
  };

  const showDeleteConfirmDialog = () => {
    setIsDeleteConfirmDialogOpen(true);
  };

  const dismissDeleteConfirmDialog = () => {
    setIsDeleteConfirmDialogOpen(false);
  };

  const getStatusString = (status: DeploymentStatus, progressString: string) => {
    switch (status) {
      case DeploymentStatus.Building:
      case DeploymentStatus.Deploying:
        return progressString;
      case DeploymentStatus.Pending:
        return t('pending');
      case DeploymentStatus.Failed:
        return t('failed');
      case DeploymentStatus.Success:
        return t('success');
      default:
        return '';
    }
  };

  const getMessage = (message: string, status: DeploymentStatus) => {
    try {
      const parsed = JSON.parse(message);
      return getMessageElementFromUrlInfo(parsed, status);
    } catch (e) {
      return message;
    }
  };

  const getMessageElementFromUrlInfo = (messageJSON: KuduLogMessage, status: DeploymentStatus) => {
    const urlInfo = getUrlInfoFromJSONMessage(messageJSON);
    return (
      <>
        {messageJSON.message || (status === DeploymentStatus.Success ? t('deployedSuccessfully') : t('deployedFailed'))}
        <br />
        {urlInfo.map(info => {
          return (
            <>
              <Link
                className={deploymentCenterVstsCodeLogsLinkStyle}
                onClick={() => window.open(info.url, '_blank')}
                aria-label={info.urlText}>
                {info.urlIcon && <Icon iconName={info.urlIcon} />}
                {info.urlText}
              </Link>
            </>
          );
        })}
      </>
    );
  };

  const getUrlInfoFromJSONMessage = (messageJSON: KuduLogMessage) => {
    const urlInfo: UrlInfo[] = [];
    if (messageJSON.commitId) {
      const commitUrl: string = getCommitUrl(messageJSON);
      urlInfo.push({
        urlIcon: 'BranchCommit',
        urlText: t('sourceVersionUrl').format(messageJSON.commitId.substr(0, 10)),
        url: commitUrl,
      });
    }
    if (messageJSON.buildNumber) {
      const buildUrl: string = getBuildUrl(messageJSON);
      if (buildUrl) {
        urlInfo.push({
          urlIcon: 'Build',
          urlText: t('buildUrl').format(messageJSON.buildNumber),
          url: buildUrl,
        });
      }
    }
    if (messageJSON.releaseId) {
      const releaseUrl: string = getReleaseUrl(messageJSON);
      if (releaseUrl) {
        urlInfo.push({
          urlIcon: 'Rocket',
          urlText: t('releaseUrl').format(messageJSON.releaseId),
          url: releaseUrl,
        });
      }
    }
    if (messageJSON.VSTSRM_BuildDefinitionWebAccessUrl) {
      urlInfo.push({
        urlText: t('buildDefinition'),
        url: messageJSON.VSTSRM_BuildDefinitionWebAccessUrl,
      });
    }
    if (messageJSON.VSTSRM_ConfiguredCDEndPoint) {
      urlInfo.push({
        urlText: t('releaseDefinition'),
        url: messageJSON.VSTSRM_ConfiguredCDEndPoint,
      });
    }
    if (messageJSON.VSTSRM_BuildWebAccessUrl) {
      urlInfo.push({
        urlText: t('buildTriggered'),
        url: messageJSON.VSTSRM_BuildWebAccessUrl,
      });
    }
    if (messageJSON.AppUrl) {
      urlInfo.push({
        urlText: t('webApp'),
        url: messageJSON.AppUrl,
      });
    }
    if (messageJSON.SlotUrl) {
      urlInfo.push({
        urlText: t('slot'),
        url: messageJSON.SlotUrl,
      });
    }
    if (messageJSON.VSTSRM_AccountUrl) {
      urlInfo.push({
        urlText: t('vsoAccount'),
        url: messageJSON.VSTSRM_AccountUrl,
      });
    }
    if (messageJSON.VSTSRM_RepoUrl) {
      urlInfo.push({
        urlText: t('viewInstructions'),
        url: messageJSON.VSTSRM_RepoUrl,
      });
    }
    return urlInfo;
  };

  const getCommitUrl = (messageJSON: KuduLogMessage) => {
    if (messageJSON.commitId && messageJSON.repoProvider && messageJSON.repositoryUrl) {
      if (messageJSON.repoProvider === ScmType.GitHub) {
        return '{0}/commit/{1}'.format(messageJSON.repositoryUrl, messageJSON.commitId);
      }
    }
    return '';
  };

  const getBuildUrl = (messageJSON: KuduLogMessage) => {
    if (messageJSON.buildId) {
      return messageJSON.buildProjectUrl
        ? '{0}/_build?buildId={1}&_a=summary'.format(messageJSON.buildProjectUrl, messageJSON.buildId)
        : '{0}/{1}/_build?buildId={2}&_a=summary'.format(messageJSON.collectionUrl, messageJSON.teamProject, messageJSON.buildId);
    }
    return '';
  };

  const getReleaseUrl = (messageJSON: KuduLogMessage) => {
    if (messageJSON.releaseId) {
      return '{0}{1}/_apps/hub/ms.vss-releaseManagement-web.hub-explorer?releaseId={2}&_a=release-summary'.format(
        messageJSON.collectionUrl,
        messageJSON.teamProject,
        messageJSON.releaseId
      );
    }
    return '';
  };

  const getDeploymentRow = useCallback((deployment: ArmObj<DeploymentProperties>, index: number): CodeDeploymentsRow => {
    return {
      index: index,
      id: deployment.id,
      rawTime: moment(deployment.properties.received_time),
      // NOTE (t-kakan): A is AM/PM and Z is offset from GMT: -07:00 -06:00 ... +06:00 +07:00
      displayTime: moment(deployment.properties.received_time).format('h:mm:ss A Z'),
      commit: (
        <Link href={`#${deployment.properties.id}`} onClick={() => showLogPanel(deployment)}>
          {deployment.properties.id.substr(0, 7)}
        </Link>
      ),
      author: deployment.properties.author,
      message: getMessage(deployment.properties.message, deployment.properties.status) || deployment.properties.message,
      status: deployment.properties.active
        ? `${getStatusString(deployment.properties.status, deployment.properties.progress)} (${t('active')})`
        : `${getStatusString(deployment.properties.status, deployment.properties.progress)}`,
    };
  }, []);

  const getItemGroups = useCallback((items: CodeDeploymentsRow[]): IGroup[] => {
    const groups: IGroup[] = [];
    items.forEach((item, index) => {
      if (index === 0 || !item.rawTime.isSame(groups[groups.length - 1].data.startIndexRawTime, 'day')) {
        const group = {
          key: `Group${groups.length}`,
          name: item.rawTime.format('dddd, MMMM D, YYYY'),
          startIndex: index,
          count: 1,
          data: { startIndexRawTime: item.rawTime },
        };
        groups.push(group);
      } else {
        groups[groups.length - 1].count += 1;
      }
    });
    return groups;
  }, []);

  const getProgressIndicator = () => {
    return (
      <ProgressIndicator
        description={t('deploymentCenterCodeDeploymentsLoading')}
        ariaValueText={t('deploymentCenterCodeDeploymentsLoadingAriaValue')}
      />
    );
  };

  const goToSettingsOnClick = () => {
    if (goToSettings) {
      goToSettings();
    }
  };

  const deleteLogs = React.useCallback(() => {
    deleteDeploymentCenterLogs(portalContext, deploymentCenterContext, deploymentCenterData, selectedLogs, refreshLogs, t);
  }, [portalContext, deploymentCenterContext, deploymentCenterData, selectedLogs, refreshLogs, t]);

  const rows: CodeDeploymentsRow[] = useMemo(
    () => (deployments ? deployments.value.map((deployment, index) => getDeploymentRow(deployment, index)) : []),
    [deployments]
  );
  const items: CodeDeploymentsRow[] = useMemo(() => rows.sort(dateTimeComparatorReverse), [rows]);

  const columns: IColumn[] = [
    { key: 'displayTime', name: t('time'), fieldName: 'displayTime', minWidth: 75, maxWidth: 150 },
    { key: 'commit', name: t('commitId'), fieldName: 'commit', minWidth: 75, maxWidth: 100 },
    { key: 'author', name: t('commitAuthor'), fieldName: 'author', minWidth: 75, maxWidth: 200 },
    { key: 'status', name: t('status'), fieldName: 'status', minWidth: 100, maxWidth: 150 },
    { key: 'message', name: t('message'), fieldName: 'message', minWidth: 210, isMultiline: true },
  ];

  const groups: IGroup[] = useMemo(() => getItemGroups(items), [items]);

  const getZeroDayContent = () => {
    if (deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.None) {
      return (
        <div className={deploymentCenterCodeLogsNotConfigured}>
          <DeploymentCenterIcon filter="grayscale(100%)" />
          <h3>{t('deploymentCenterCodeLogsCICDNotConfiguredHeader')}</h3>
          <p>{t('deploymentCenterCodeLogsCICDNotConfiguredDescription')}</p>
          <PrimaryButton text={t('deploymentCenterCodeLogsCICDNotConfiguredGoToSettings')} onClick={() => goToSettingsOnClick()} />
        </div>
      );
    } else {
      return (
        <div className={deploymentCenterCodeLogsNotConfigured}>
          <h3>{t('deploymentCenterCodeLogsNoDeployments')}</h3>
        </div>
      );
    }
  };

  return (
    <>
      <DeploymentCenterCodeLogsTimer
        pauseTimer={pauseTimer}
        refreshLogs={refreshLogs}
        deleteLogs={showDeleteConfirmDialog}
        setIsLogsDataRefreshing={setIsLogsDataRefreshing}
      />

      <ConfirmDialog
        primaryActionButton={{
          title: t('delete'),
          onClick: () => {
            deleteLogs();
            dismissDeleteConfirmDialog();
          },
        }}
        defaultActionButton={{
          title: t('cancel'),
          onClick: dismissDeleteConfirmDialog,
        }}
        title={t('deploymentCenterDeleteLogsConfirmationTitle')}
        content={t('deploymentCenterDeleteLogsConfirmationDescription')}
        hidden={!isDeleteConfirmDialogOpen}
        onDismiss={dismissDeleteConfirmDialog}
      />

      {isLogsDataRefreshing ? (
        getProgressIndicator()
      ) : deploymentsError ? (
        <div className={deploymentCenterLogsError}>{deploymentsError}</div>
      ) : deployments ? (
        <div className={deploymentCenterCodeLogsBox}>
          <DisplayTableWithEmptyMessage
            columns={columns}
            items={items}
            selection={selection}
            selectionMode={SelectionMode.multiple}
            groups={groups}
          />
          {items.length === 0 && getZeroDayContent()}
        </div>
      ) : (
        getProgressIndicator()
      )}
      <CustomPanel isOpen={isLogPanelOpen} onDismiss={dismissLogPanel} type={PanelType.medium}>
        <DeploymentCenterCommitLogs commitId={currentCommitId} dismissLogPanel={dismissLogPanel} />
      </CustomPanel>
    </>
  );
};

export default DeploymentCenterVSTSCodeLogs;
