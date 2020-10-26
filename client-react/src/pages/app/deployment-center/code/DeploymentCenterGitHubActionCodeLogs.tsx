import React, { useState, useContext, useEffect } from 'react';
import DisplayTableWithEmptyMessage from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import moment from 'moment';
import { IGroup } from 'office-ui-fabric-react/lib/components/GroupedList/GroupedList.types';
import {
  DeploymentCenterCodeLogsProps,
  DeploymentStatus,
  DeploymentProperties,
  GACodeDeploymentsRow,
  GitHubActionRunConclusionDisplayName,
  GitHubActionRunStatusDisplayName,
  GitHubActionRunStatus,
  GitHubActionRunConclusion,
  GitHubActionRun,
} from '../DeploymentCenter.types';
import { ProgressIndicator, PanelType, IColumn, Link, PrimaryButton, Icon } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { deploymentCenterLogsError, deploymentCenterCodeLogsNotConfigured } from '../DeploymentCenter.styles';
import { ArmObj } from '../../../../models/arm-obj';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import DeploymentCenterCommitLogs from './DeploymentCenterCommitLogs';
import { ReactComponent as DeploymentCenterIcon } from '../../../../images/Common/deployment-center.svg';
import { ScmType } from '../../../../models/site/config';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { getWorkflowFileName } from '../utility/DeploymentCenterUtility';
import { SiteStateContext } from '../../../../SiteState';
import DeploymentCenterData from '../DeploymentCenter.data';
import { dateTimeComparatorReverse } from './DeploymentCenterCodeLogs';

export function logsSort(a: any, b: any) {
  if (a.source > b.source) {
    return 1;
  }
  if (a.source < b.source) {
    return -1;
  }
  return 0;
}

const DeploymentCenterGitHubActionCodeLogs: React.FC<DeploymentCenterCodeLogsProps> = props => {
  const [isLogPanelOpen, setIsLogPanelOpen] = useState<boolean>(false);
  const [currentCommitId, setCurrentCommitId] = useState<string | undefined>(undefined);

  const [isLogsLoading, setIsLogsLoading] = useState<boolean>(false);
  const [isSourceControlsLoading, setIsSourcecontrolsLoading] = useState<boolean>(true);
  const [org, setOrg] = useState<string | undefined>(undefined);
  const [repo, setRepo] = useState<string | undefined>(undefined);
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [runs, setRuns] = useState<GitHubActionRun[] | undefined>(undefined);
  const [gitHubActionLogsErrorMessage, setGitHubActionLogsErrorMessage] = useState<string | undefined>(undefined);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const { deployments, deploymentsError, isLoading, goToSettings } = props;
  const { t } = useTranslation();

  const siteStateContext = useContext(SiteStateContext);
  const deploymentCenterData = new DeploymentCenterData();

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

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case GitHubActionRunStatus.Completed:
        return GitHubActionRunStatusDisplayName.Completed;
      case GitHubActionRunStatus.Queued:
        return GitHubActionRunStatusDisplayName.Queued;
      case GitHubActionRunStatus.inProgress:
        return GitHubActionRunStatusDisplayName.inProgress;
      default:
        return GitHubActionRunStatusDisplayName.None;
    }
  };

  const getConclusionDisplayName = (status: string): GitHubActionRunConclusionDisplayName => {
    switch (status) {
      case GitHubActionRunConclusion.Success:
        return GitHubActionRunConclusionDisplayName.Success;
      case GitHubActionRunConclusion.Failure:
        return GitHubActionRunConclusionDisplayName.Failure;
      case GitHubActionRunConclusion.Cancelled:
        return GitHubActionRunConclusionDisplayName.Cancelled;
      case GitHubActionRunConclusion.Skipped:
        return GitHubActionRunConclusionDisplayName.Skipped;
      case GitHubActionRunConclusion.TimedOut:
        return GitHubActionRunConclusionDisplayName.TimedOut;
      case GitHubActionRunConclusion.ActionRequired:
        return GitHubActionRunConclusionDisplayName.ActionRequired;
      default:
        return GitHubActionRunConclusionDisplayName.None;
    }
  };

  const showLogPanel = (deployment: ArmObj<DeploymentProperties>) => {
    setIsLogPanelOpen(true);
    setCurrentCommitId(deployment.id);
  };
  const dismissLogPanel = () => {
    setIsLogPanelOpen(false);
    setCurrentCommitId(undefined);
  };

  const goToSettingsOnClick = () => {
    if (goToSettings) {
      goToSettings();
    }
  };

  const fetchSourceControlDetails = async () => {
    setIsLogsLoading(true);
    setIsSourcecontrolsLoading(true);
    const sourceControlDetailsResponse = await deploymentCenterData.getSourceControlDetails(deploymentCenterContext.resourceId);

    if (sourceControlDetailsResponse.metadata.success) {
      setBranch(sourceControlDetailsResponse.data.properties.branch);
      const repoUrlSplit = sourceControlDetailsResponse.data.properties.repoUrl.split('/');
      if (repoUrlSplit.length >= 2) {
        setOrg(repoUrlSplit[repoUrlSplit.length - 2]);
        setRepo(repoUrlSplit[repoUrlSplit.length - 1]);
      } else {
        setIsLogsLoading(false);
      }
    } else {
      setGitHubActionLogsErrorMessage(t('deploymentCenterGitHubActionsLogsFailed'));
      setIsLogsLoading(false);
    }
    setIsSourcecontrolsLoading(false);
  };

  const fetchWorkflowRuns = async () => {
    const siteName = siteStateContext.site ? siteStateContext.site.properties.name : '';
    if (org && repo && branch && siteName) {
      const workflowFileName = getWorkflowFileName(branch, siteName);

      const gitHubActionWorkflowRunsResponse = await deploymentCenterData.listWorkflowRuns(
        deploymentCenterContext.gitHubToken,
        org,
        repo,
        workflowFileName
      );

      if (gitHubActionWorkflowRunsResponse.metadata.success && gitHubActionWorkflowRunsResponse.data) {
        setRuns(gitHubActionWorkflowRunsResponse.data.workflow_runs);
      } else {
        setGitHubActionLogsErrorMessage(
          gitHubActionWorkflowRunsResponse.metadata.error
            ? t('deploymentCenterGitHubActionsLogsFailedWithError').format(gitHubActionWorkflowRunsResponse.metadata.error)
            : t('deploymentCenterGitHubActionsLogsFailed')
        );
      }
    }
    setIsLogsLoading(false);
  };

  const cancelWorkflowRunOnClick = async (url: string) => {
    const cancelWorkflowResponse = await deploymentCenterData.cancelWorkflowRun(deploymentCenterContext.gitHubToken, url);
    if (cancelWorkflowResponse.metadata.success) {
      setIsLogsLoading(true);
      await fetchWorkflowRuns();
      if (runs) {
        const curRuns = runs;
        curRuns[0].conclusion = 'cancelled';
        curRuns[0].status = 'completed';
        setRuns(curRuns);
      }
      setIsLogsLoading(false);
    } else {
    }
  };

  const getDeploymentRow = (deployment: ArmObj<DeploymentProperties>, index: number): GACodeDeploymentsRow => {
    return {
      index: index,
      group: -1,
      commitId: deployment.properties.id.substr(0, 7),
      rawTime: moment(deployment.properties.received_time),
      // NOTE (t-kakan): A is AM/PM and Z is offset from GMT: -07:00 -06:00 ... +06:00 +07:00
      displayTime: moment(deployment.properties.received_time).format('MM/D YYYY, h:mm:ss A Z'),
      commit: (
        <Link href={`#${deployment.properties.id}`} onClick={() => showLogPanel(deployment)}>
          {deployment.properties.id.substr(0, 7)}
        </Link>
      ),
      runNumber: <>{``}</>,
      checkinMessage: deployment.properties.message,
      status: deployment.properties.active
        ? `${getStatusString(deployment.properties.status, deployment.properties.progress)} (${t('active')})`
        : `${getStatusString(deployment.properties.status, deployment.properties.progress)}`,
    };
  };

  const GArows: GACodeDeploymentsRow[] = runs
    ? runs.map((run, index) => {
        return {
          index: deployments && deployments.value.length ? deployments.value.length + index : index,
          group: -1,
          commitId: run.head_commit.id.substr(0, 7),
          rawTime: moment(run.updated_at),
          // NOTE (t-kakan): A is AM/PM and Z is offset from GMT: -07:00 -06:00 ... +06:00 +07:00
          displayTime: moment(run.updated_at).format('MM/D YYYY, h:mm:ss A Z'),
          runNumber: run.run_number,
          checkinMessage: (
            <Link
              key="github-actions-logs-link"
              onClick={() => window.open(run.html_url, '_blank')}
              aria-label={t('deploymentCenterGitHubActionsLogsLinkMessage')}>
              {t('deploymentCenterGitHubActionsLogsLinkMessage')}
              <Icon id={`ga-logs`} iconName={'NavigateExternalInline'} />
            </Link>
          ),
          commit: (
            <Link href={`#${run.head_commit.id}`} onClick={() => {}}>
              {run.head_commit.id.substr(0, 7)}
            </Link>
          ),
          status: run.conclusion ? (
            `${getStatusDisplayName(run.status)} (${getConclusionDisplayName(run.conclusion)})`
          ) : (
            <>
              {t('In Progress... ')}
              {
                <Link
                  onClick={() => {
                    cancelWorkflowRunOnClick(run.cancel_url);
                  }}>
                  {t('deploymentCenterGitHubActionsCancelRunMessage')}
                </Link>
              }
            </>
          ),
        };
      })
    : [];

  const getItemCommitGroups = (items: GACodeDeploymentsRow[]): IGroup[] => {
    const groups: IGroup[] = [];
    if (!runs) {
      return groups;
    }

    items.sort((a: GACodeDeploymentsRow, b: GACodeDeploymentsRow) => {
      if (a.commitId < b.commitId) {
        return -1;
      } else if (a.commitId > b.commitId) {
        return 1;
      } else {
        return 0;
      }
    });

    items.forEach((item, index) => {
      const currentGroup = groups.find(group => group.data.commitId === item.commitId);

      if (index === 0 || !currentGroup) {
        item.group = groups.length;
        const group = {
          key: `Group${groups.length}`,
          name: `Commit Id ${item.commitId}`,
          startIndex: index,
          count: 1,
          data: { commitId: item.commitId, index: groups.length, time: item.rawTime },
        };
        groups.push(group);
      } else {
        item.group = currentGroup.data.index;
        currentGroup.count += 1;
      }
    });

    groups.sort((a: IGroup, b: IGroup) => {
      if (a.data.time.isBefore(b.data.time)) {
        return 1;
      }
      if (a.data.time.isAfter(b.data.time)) {
        return -1;
      }
      return 0;
    });

    return groups;
  };

  const rows: GACodeDeploymentsRow[] = deployments ? deployments.value.map((deployment, index) => getDeploymentRow(deployment, index)) : [];
  const newItems = rows.concat(GArows);
  const items: GACodeDeploymentsRow[] = newItems.sort(dateTimeComparatorReverse);

  const columns: IColumn[] = [
    { key: 'displayTime', name: t('time'), fieldName: 'displayTime', minWidth: 150, maxWidth: 250 },
    { key: 'commit', name: t('commitId'), fieldName: 'commit', minWidth: 100, maxWidth: 150 },
    { key: 'runNumber', name: t('Workflow Run Number'), fieldName: 'runNumber', minWidth: 75, maxWidth: 150 },
    { key: 'status', name: t('status'), fieldName: 'status', minWidth: 150, maxWidth: 200 },
    { key: 'checkinMessage', name: t('checkinMessage'), fieldName: 'checkinMessage', minWidth: 210 },
  ];

  const groups: IGroup[] = getItemCommitGroups(items);

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
            <h3>{t('deploymentCenterCodeLogsNoDeployments')}</h3>;
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

  useEffect(() => {
    if (deploymentCenterContext.gitHubToken) {
      fetchSourceControlDetails();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext.gitHubToken]);

  useEffect(() => {
    if (!isSourceControlsLoading) {
      fetchWorkflowRuns();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSourceControlsLoading]);

  return (
    <>
      {isLoading || isLogsLoading ? (
        getProgressIndicator()
      ) : deploymentsError || gitHubActionLogsErrorMessage ? (
        <div className={deploymentCenterLogsError}>{deploymentsError}</div>
      ) : deployments ? (
        <>
          <DisplayTableWithEmptyMessage columns={columns} items={items} selectionMode={0} groups={groups} />
          {items.length === 0 && getZeroDayContent()}
        </>
      ) : (
        getProgressIndicator()
      )}
      <CustomPanel isOpen={isLogPanelOpen} onDismiss={dismissLogPanel} type={PanelType.medium}>
        <DeploymentCenterCommitLogs commitId={currentCommitId} />
      </CustomPanel>
    </>
  );
};

export default DeploymentCenterGitHubActionCodeLogs;
