import React, { useState, useContext, useEffect, useMemo, useCallback } from 'react';
import DisplayTableWithEmptyMessage from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import moment from 'moment';
import {
  DeploymentCenterCodeLogsProps,
  DeploymentStatus,
  DeploymentProperties,
  GitHubActionsCodeDeploymentsRow,
  GitHubActionRunConclusion,
  GitHubActionsRun,
} from '../DeploymentCenter.types';
import { ProgressIndicator, PanelType, IColumn, Link, PrimaryButton, Icon, IGroup, Selection, SelectionMode } from '@fluentui/react';
import { useTranslation } from 'react-i18next';
import { deploymentCenterLogsError, deploymentCenterCodeLogsNotConfigured, deploymentCenterCodeLogsBox } from '../DeploymentCenter.styles';
import { ArmObj } from '../../../../models/arm-obj';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import DeploymentCenterCommitLogs from './DeploymentCenterCommitLogs';
import { ReactComponent as DeploymentCenterIcon } from '../../../../images/Common/deployment-center.svg';
import { ScmType } from '../../../../models/site/config';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import {
  deleteDeploymentCenterLogs,
  fetchDeploymentLogs,
  getSourceControlsWorkflowFileName,
  getTelemetryInfo,
  getWorkflowFileName,
} from '../utility/DeploymentCenterUtility';
import { SiteStateContext } from '../../../../SiteState';
import DeploymentCenterData from '../DeploymentCenter.data';
import { dateTimeComparatorReverse } from './DeploymentCenterCodeLogs';
import { PortalContext } from '../../../../PortalContext';
import DeploymentCenterCodeLogsTimer from './DeploymentCenterCodeLogsTimer';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';
import { IconGridCell } from '../../../../components/IconGridCell/IconGridCell';
import { IconConstants } from '../../../../utils/constants/IconConstants';
import { ThemeContext } from '../../../../ThemeContext';

const DeploymentCenterGitHubActionsCodeLogs: React.FC<DeploymentCenterCodeLogsProps> = props => {
  const { deployments, runs, setDeployments, setRuns, goToSettings } = props;
  const { t } = useTranslation();

  const [isLogPanelOpen, setIsLogPanelOpen] = useState<boolean>(false);
  const [isDeleteConfirmDialogOpen, setIsDeleteConfirmDialogOpen] = React.useState<boolean>(false);
  const [currentCommitId, setCurrentCommitId] = useState<string | undefined>(undefined);
  const [currentFailedStatus, setCurrentFailedStatus] = useState<boolean | undefined>(undefined);
  const [isLogsLoading, setIsLogsLoading] = useState<boolean>(false);
  const [isLogsDataRefreshing, setIsLogsDataRefreshing] = React.useState<boolean>(false);
  const [isSourceControlsLoading, setIsSourcecontrolsLoading] = useState<boolean>(true);
  const [org, setOrg] = useState<string | undefined>(undefined);
  const [repo, setRepo] = useState<string | undefined>(undefined);
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [deploymentsError, setDeploymentsError] = useState<string | undefined>(undefined);
  const [gitHubActionLogsErrorMessage, setGitHubActionLogsErrorMessage] = useState<string | undefined>(undefined);
  const [isCancelWorkflowRunConfirmDialogHidden, setIsCancelWorkflowRunConfirmDialogHidden] = useState(true);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);
  const portalContext = useContext(PortalContext);
  const theme = useContext(ThemeContext);
  const deploymentCenterData = new DeploymentCenterData();

  const [selectedLogs, setSelectedLogs] = React.useState<GitHubActionsCodeDeploymentsRow[]>([]);
  const selection = useMemo(
    () =>
      new Selection({
        onSelectionChanged: () => {
          const selectedItems = selection.getSelection();
          setSelectedLogs(selectedItems as GitHubActionsCodeDeploymentsRow[]);
        },
        selectionMode: SelectionMode.multiple,
      }),
    [setSelectedLogs]
  );
  const pauseTimer = useMemo(() => selectedLogs.length > 0, [selectedLogs]);

  const getStatusString = (status: DeploymentStatus, progressString: string) => {
    switch (status) {
      case DeploymentStatus.Building:
      case DeploymentStatus.Deploying:
        return progressString;
      case DeploymentStatus.Pending:
        return t('pending');
      case DeploymentStatus.Failed:
        return (
          <IconGridCell
            text={t('failed')}
            iconName={IconConstants.IconNames.ErrorBadgeFilled}
            style={{ color: theme.semanticColors.errorIcon, marginTop: '4px' }}
          />
        );
      case DeploymentStatus.Success:
        return t('success');
      default:
        return '';
    }
  };

  const getZipDeployMessage = (message: string) => {
    try {
      const parsed = JSON.parse(message);
      return parsed.commitMessage;
    } catch (e) {
      return message;
    }
  };

  const getConclusionDisplayName = (status: string): string => {
    switch (status) {
      case GitHubActionRunConclusion.Success:
        return t('success');
      case GitHubActionRunConclusion.Failure:
        return t('failed');
      case GitHubActionRunConclusion.Cancelled:
        return t('GitHubActionsRunCancelled');
      case GitHubActionRunConclusion.Skipped:
        return t('GitHubActionsRunSkipped');
      case GitHubActionRunConclusion.TimedOut:
        return t('GitHubActionsRunTimedOut');
      case GitHubActionRunConclusion.ActionRequired:
        return t('GitHubActionsRunActionRequired');
      default:
        return '';
    }
  };

  const showLogPanel = (deployment: ArmObj<DeploymentProperties>, failed?: boolean) => {
    setIsLogPanelOpen(true);
    setCurrentCommitId(deployment.id);
    setCurrentFailedStatus(failed);
  };

  const dismissLogPanel = () => {
    setIsLogPanelOpen(false);
    setCurrentCommitId(undefined);
    setCurrentFailedStatus(undefined);
  };

  const showDeleteConfirmDialog = () => {
    setIsDeleteConfirmDialogOpen(true);
  };

  const dismissDeleteConfirmDialog = () => {
    setIsDeleteConfirmDialogOpen(false);
  };

  const hideCancelWorkflowRunConfirmDialog = () => {
    setIsCancelWorkflowRunConfirmDialogHidden(true);
  };

  const goToSettingsOnClick = () => {
    if (goToSettings) {
      goToSettings();
    }
  };

  const refreshGitHubActionsLogs = async () => {
    await fetchDeploymentLogs(
      deploymentCenterContext.resourceId,
      deploymentCenterData,
      siteStateContext,
      setDeployments,
      setDeploymentsError,
      t
    );
    await fetchWorkflowRuns();
  };

  const setSourceControlDetails = async () => {
    setIsSourcecontrolsLoading(true);

    setBranch(deploymentCenterContext.configMetadata ? deploymentCenterContext.configMetadata.properties.branch : '');
    const repoUrlSplit = deploymentCenterContext.configMetadata ? deploymentCenterContext.configMetadata.properties.RepoUrl.split('/') : [];
    if (repoUrlSplit.length >= 2) {
      setOrg(repoUrlSplit[repoUrlSplit.length - 2]);
      setRepo(repoUrlSplit[repoUrlSplit.length - 1]);
    } else {
      setGitHubActionLogsErrorMessage(t('deploymentCenterCodeDeploymentsFailed'));
    }

    setIsSourcecontrolsLoading(false);
  };

  const fetchWorkflowRuns = async () => {
    if (setRuns) {
      setGitHubActionLogsErrorMessage(undefined);
      const siteName = siteStateContext.site?.properties?.name ?? '';
      if (org && repo && branch && siteName) {
        const workflowFileName = getWorkflowFileName(branch, siteName);
        const sourceControlsWorkflowFileName = getSourceControlsWorkflowFileName(branch, siteName, 'production');

        const [gitHubActionsWorkflowRunsResponse, gitHubActionsFromCreateWorkflowRunsResponse] = await Promise.all([
          deploymentCenterData.listWorkflowRuns(deploymentCenterContext.gitHubToken, org, repo, workflowFileName),
          deploymentCenterData.listWorkflowRuns(deploymentCenterContext.gitHubToken, org, repo, sourceControlsWorkflowFileName),
        ]);

        if (gitHubActionsWorkflowRunsResponse.metadata.success && gitHubActionsWorkflowRunsResponse.data) {
          setRuns(gitHubActionsWorkflowRunsResponse.data.workflow_runs);
        } else if (gitHubActionsFromCreateWorkflowRunsResponse.metadata.success && gitHubActionsFromCreateWorkflowRunsResponse.data) {
          setRuns(gitHubActionsFromCreateWorkflowRunsResponse.data.workflow_runs);
        } else {
          setRuns([]);
          const errorMessage = getErrorMessage(gitHubActionsWorkflowRunsResponse.metadata.error);
          setGitHubActionLogsErrorMessage(
            errorMessage
              ? t('deploymentCenterCodeDeploymentsFailedWithError').format(errorMessage)
              : t('deploymentCenterCodeDeploymentsFailed')
          );
          portalContext.log(
            getTelemetryInfo('error', 'getWorkflowRuns', 'failed', {
              error: gitHubActionsWorkflowRunsResponse.metadata.error,
            })
          );
        }
      }
      setIsLogsLoading(false);
    }
  };

  const cancelWorkflowRunOnClick = async (url: string) => {
    portalContext.log(getTelemetryInfo('verbose', 'cancelWorkflow', 'clicked'));
    const cancelWorkflowResponse = await deploymentCenterData.cancelWorkflowRun(deploymentCenterContext.gitHubToken, url);
    if (cancelWorkflowResponse.metadata.success) {
      setIsLogsLoading(true);
      await fetchWorkflowRuns();
      //NOTE(stpelleg): It takes a while for the run to show as cancelled, but users would be confused if
      //it did not show as cancelled right after clicking cancel
      if (runs && runs.length > 0 && setRuns) {
        const curRuns = runs;
        curRuns[0].conclusion = t(GitHubActionRunConclusion.Cancelled);
        setRuns(curRuns);
      }
    } else {
      portalContext.log(
        getTelemetryInfo('error', 'cancelWorkflow', 'failed', {
          error: cancelWorkflowResponse.metadata.error,
        })
      );
    }
  };

  const getGitHubActionsRunStatus = useCallback((run: GitHubActionsRun): JSX.Element => {
    return run.conclusion ? (
      <>{getConclusionDisplayName(run.conclusion)}</>
    ) : (
      <>
        {t('In Progress... ')}
        {
          <>
            <Link
              onClick={() => {
                setIsCancelWorkflowRunConfirmDialogHidden(false);
              }}>
              {t('deploymentCenterGitHubActionsCancelRunMessage')}
            </Link>
            <ConfirmDialog
              primaryActionButton={{
                title: t('ok'),
                onClick: () => {
                  cancelWorkflowRunOnClick(run.cancel_url);
                  hideCancelWorkflowRunConfirmDialog();
                },
              }}
              defaultActionButton={{
                title: t('cancel'),
                onClick: hideCancelWorkflowRunConfirmDialog,
              }}
              title={t('deploymentCenterCancelWorkflowRunConfirmTitle')}
              content={t('deploymentCenterCancelWorkflowRunConfirmMessage')}
              hidden={isCancelWorkflowRunConfirmDialogHidden}
              onDismiss={hideCancelWorkflowRunConfirmDialog}
            />
          </>
        }
      </>
    );
  }, []);

  const getZipDeployRow = useCallback((deployment: ArmObj<DeploymentProperties>, index: number): GitHubActionsCodeDeploymentsRow => {
    return {
      index: index,
      id: deployment.id,
      group: -1,
      commitId: deployment.properties.id.substr(0, 7),
      rawTime: moment(deployment.properties.received_time),
      // NOTE (t-kakan): A is AM/PM and Z is offset from GMT: -07:00 -06:00 ... +06:00 +07:00
      displayTime: moment(deployment.properties.received_time).format('MM/D YYYY, h:mm:ss A Z'),
      commit: deployment.properties.id.substr(0, 7),
      logSource: (
        <Link
          href={`#${deployment.properties.id}`}
          onClick={() => showLogPanel(deployment, deployment.properties.status === DeploymentStatus.Failed)}>
          {t('deploymentCenterAppLogSource')}
        </Link>
      ),
      author: deployment.properties.author,
      message: getZipDeployMessage(deployment.properties.message) || deployment.properties.message,
      status: deployment.properties.active ? (
        <>{`${getStatusString(deployment.properties.status, deployment.properties.progress)} (${t('active')})`}</>
      ) : (
        <>{getStatusString(deployment.properties.status, deployment.properties.progress)}</>
      ),
    };
  }, []);

  const getGitHubActionsRunRow = useCallback(
    (run: GitHubActionsRun, index: number): GitHubActionsCodeDeploymentsRow => {
      return {
        index: deployments && deployments.value.length ? deployments.value.length + index : index,
        id: run.id,
        group: -1,
        commitId: run.head_commit.id.substr(0, 7),
        rawTime: moment(run.created_at),
        // NOTE (stpelleg): A is AM/PM and Z is offset from GMT: -07:00 -06:00 ... +06:00 +07:00
        displayTime: moment(run.created_at).format('MM/D YYYY, h:mm:ss A Z'),
        author: run.head_commit.author.name,
        message: run.head_commit.message,
        commit: run.head_commit.id.substr(0, 7),
        logSource: (
          <Link key="github-actions-logs-link" onClick={() => window.open(run.html_url, '_blank')}>
            {t('deploymentCenterBuildDeployLogSource')}
            <Icon id={`ga-logs`} iconName={'NavigateExternalInline'} />
          </Link>
        ),
        status: getGitHubActionsRunStatus(run),
      };
    },
    [getGitHubActionsRunStatus]
  );

  const getItemCommitGroups = useCallback((items: GitHubActionsCodeDeploymentsRow[]): IGroup[] => {
    const groups: IGroup[] = [];
    items.forEach((item, index) => {
      if (index === 0 || !item.rawTime.isSame(groups[groups.length - 1].data.startIndexRawTime, 'day')) {
        groups.push({
          key: `Group${groups.length}`,
          name: item.rawTime.format('dddd, MMMM D, YYYY'),
          startIndex: index,
          count: 1,
          data: { startIndexRawTime: item.rawTime },
        });
      } else {
        groups[groups.length - 1].count += 1;
      }
    });
    return groups;
  }, []);

  const getZeroDayContent = () => {
    if (deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.None) {
      return (
        <>
          <div className={deploymentCenterCodeLogsNotConfigured}>
            <DeploymentCenterIcon filter="grayscale(100%)" />
            <h3>{t('deploymentCenterCodeLogsCICDNotConfiguredHeader')}</h3>
            <p>{t('deploymentCenterCodeLogsCICDNotConfiguredDescription')}</p>
            <PrimaryButton text={t('deploymentCenterCodeLogsCICDNotConfiguredGoToSettings')} onClick={() => goToSettingsOnClick()} />
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className={deploymentCenterCodeLogsNotConfigured}>
            <h3>{t('deploymentCenterCodeLogsNoDeployments')}</h3>
          </div>
        </>
      );
    }
  };

  const getProgressIndicator = () => {
    return (
      <ProgressIndicator
        description={t('deploymentCenterCodeDeploymentsLoading')}
        ariaValueText={t('deploymentCenterCodeDeploymentsLoadingAriaValue')}
      />
    );
  };

  const getDeploymentErrorMessage = () => {
    return `${deploymentsError} ${gitHubActionLogsErrorMessage}`;
  };

  const deleteLogs = React.useCallback(() => {
    deleteDeploymentCenterLogs(
      portalContext,
      deploymentCenterContext,
      deploymentCenterData,
      selectedLogs,
      refreshGitHubActionsLogs,
      t,
      org,
      repo
    );
  }, [portalContext, deploymentCenterContext, deploymentCenterData, selectedLogs, refreshGitHubActionsLogs, t]);

  const gitHubActionsRows: GitHubActionsCodeDeploymentsRow[] = useMemo(
    () => (runs ? runs.map((run, index) => getGitHubActionsRunRow(run, index)) : []),
    [runs, getGitHubActionsRunRow]
  );
  const zipDeployRows: GitHubActionsCodeDeploymentsRow[] = useMemo(
    () => (deployments ? deployments.value.map((deployment, index) => getZipDeployRow(deployment, index)) : []),
    [deployments, getZipDeployRow]
  );
  const newItems = useMemo(() => zipDeployRows.concat(gitHubActionsRows), [zipDeployRows, gitHubActionsRows]);
  const items: GitHubActionsCodeDeploymentsRow[] = useMemo(() => newItems.sort(dateTimeComparatorReverse), [newItems]);
  const groups: IGroup[] = useMemo(() => getItemCommitGroups(items), [items, getItemCommitGroups]);

  const columns: IColumn[] = [
    { key: 'displayTime', name: t('time'), fieldName: 'displayTime', minWidth: 100, maxWidth: 200 },
    { key: 'commit', name: t('commitId'), fieldName: 'commit', minWidth: 50, maxWidth: 100 },
    { key: 'logSource', name: t('deploymentCenterLogSource'), fieldName: 'logSource', minWidth: 100, maxWidth: 150 },
    { key: 'author', name: t('commitAuthor'), fieldName: 'author', minWidth: 100, maxWidth: 150 },
    { key: 'status', name: t('status'), fieldName: 'status', minWidth: 125, maxWidth: 200 },
    { key: 'message', name: t('message'), fieldName: 'message', minWidth: 200, isMultiline: true },
  ];

  useEffect(() => {
    if (deploymentCenterContext.configMetadata) {
      setSourceControlDetails();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext.configMetadata]);

  useEffect(() => {
    if (!deployments) {
      setIsLogsDataRefreshing(true);
      fetchDeploymentLogs(
        deploymentCenterContext.resourceId,
        deploymentCenterData,
        siteStateContext,
        setDeployments,
        setDeploymentsError,
        t
      ).then(() => {
        if (!isSourceControlsLoading && !runs) {
          fetchWorkflowRuns().then(() => {
            setIsLogsDataRefreshing(false);
          });
        } else {
          setIsLogsDataRefreshing(false);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSourceControlsLoading, runs, deployments, deploymentCenterContext.resourceId]);

  return (
    <>
      <DeploymentCenterCodeLogsTimer
        pauseTimer={pauseTimer}
        refreshLogs={refreshGitHubActionsLogs}
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

      {isLogsDataRefreshing || isLogsLoading ? (
        getProgressIndicator()
      ) : deploymentsError && gitHubActionLogsErrorMessage ? (
        <div className={deploymentCenterLogsError}>{getDeploymentErrorMessage()}</div>
      ) : deployments || runs ? (
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
        <DeploymentCenterCommitLogs commitId={currentCommitId} failed={currentFailedStatus} dismissLogPanel={dismissLogPanel} />
      </CustomPanel>
    </>
  );
};

export default DeploymentCenterGitHubActionsCodeLogs;
