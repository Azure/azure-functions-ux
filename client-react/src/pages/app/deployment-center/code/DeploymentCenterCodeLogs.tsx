import React, { useState, useContext, useEffect } from 'react';
import DisplayTableWithEmptyMessage from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import moment from 'moment';
import { IGroup } from 'office-ui-fabric-react/lib/components/GroupedList/GroupedList.types';
import {
  DeploymentCenterCodeLogsProps,
  DateTimeObj,
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

export function dateTimeComparatorReverse(a: DateTimeObj, b: DateTimeObj) {
  if (a.rawTime.isBefore(b.rawTime)) {
    return 1;
  }
  if (a.rawTime.isAfter(b.rawTime)) {
    return -1;
  }
  return 0;
}

export function logsSort(a: any, b: any) {
  if (a.source > b.source) {
    return 1;
  }
  if (a.source < b.source) {
    return -1;
  }
  return 0;
}

const DeploymentCenterCodeLogs: React.FC<DeploymentCenterCodeLogsProps> = props => {
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

  const showLogPanel = (deployment: ArmObj<DeploymentProperties>) => {
    setIsLogPanelOpen(true);
    setCurrentCommitId(deployment.id);
  };
  const dismissLogPanel = () => {
    setIsLogPanelOpen(false);
    setCurrentCommitId(undefined);
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

  const getDeploymentRow = (deployment: ArmObj<DeploymentProperties>, index: number): GACodeDeploymentsRow => {
    return {
      index: index,
      commitID: deployment.properties.id.substr(0, 7),
      source: -1,
      rawTime: moment(deployment.properties.received_time),
      // NOTE (t-kakan): A is AM/PM and Z is offset from GMT: -07:00 -06:00 ... +06:00 +07:00
      displayTime: moment(deployment.properties.received_time).format('MM/D YYYY, h:mm:ss A Z'),
      commit: (
        <Link href={`#${deployment.properties.id}`} onClick={() => showLogPanel(deployment)}>
          {deployment.properties.id.substr(0, 7)}
        </Link>
      ),
      workflowId: <>{``}</>,
      checkinMessage: deployment.properties.message,
      status: deployment.properties.active
        ? `${getStatusString(deployment.properties.status, deployment.properties.progress)} (${t('active')})`
        : `${getStatusString(deployment.properties.status, deployment.properties.progress)}`,
    };
  };

  // const getItemGroups = (items: GACodeDeploymentsRow[]): IGroup[] => {
  //   const groups: IGroup[] = [];
  //   items.forEach((item, index) => {
  //     if (index === 0 || !item.rawTime.isSame(groups[groups.length - 1].data.startIndexRawTime, 'day')) {
  //       const group = {
  //         key: `Group${groups.length}`,
  //         name: item.rawTime.format('dddd, MMMM D, YYYY'),
  //         startIndex: index,
  //         count: 1,
  //         data: { startIndexRawTime: item.rawTime },
  //       };
  //       groups.push(group);
  //     } else {
  //       groups[groups.length - 1].count += 1;
  //     }
  //   });
  //   return groups;
  // };

  const getItemCommitGroups = (items: GACodeDeploymentsRow[]): IGroup[] => {
    const groups: IGroup[] = [];
    if (!runs) {
      return groups;
    }

    items.forEach((item, index) => {
      const currentGroup = groups.find(group => group.data.commitId === item.commitID);

      if (index === 0 || !currentGroup) {
        item.source = groups.length;
        const group = {
          key: `Group${groups.length}`,
          name: `Commit Id ${item.commitID}`,
          startIndex: index,
          count: 1,
          data: { commitId: item.commitID, index: groups.length },
        };
        groups.push(group);
      } else {
        item.source = currentGroup.data.index;
        currentGroup.count += 1;
      }
    });
    items.sort(logsSort);
    return groups;
  };

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

  const cancelWorkflowRunOnClick = async (url: string) => {
    const cancelWorkflowResponse = await deploymentCenterData.cancelWorkflowRun(deploymentCenterContext.gitHubToken, url);
    if (cancelWorkflowResponse.metadata.success) {
      setIsLogsLoading(true);
      await fetchWorkflowRuns();
    } else {
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

  const GArows: GACodeDeploymentsRow[] = runs
    ? runs.map((run, index) => {
        return {
          index: deployments && deployments.value.length ? deployments.value.length + index : index,
          source: -1,
          commitID: run.head_commit.id.substr(0, 7),
          rawTime: moment(run.updated_at),
          // NOTE (t-kakan): A is AM/PM and Z is offset from GMT: -07:00 -06:00 ... +06:00 +07:00
          displayTime: moment(run.updated_at).format('MM/D YYYY, h:mm:ss A Z'),
          workflowId: run.run_number,
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

  const rows: GACodeDeploymentsRow[] = deployments ? deployments.value.map((deployment, index) => getDeploymentRow(deployment, index)) : [];
  const newItems = rows.concat(GArows);
  const items: GACodeDeploymentsRow[] = newItems.sort(dateTimeComparatorReverse);

  const columns: IColumn[] = [
    { key: 'displayTime', name: t('time'), fieldName: 'displayTime', minWidth: 150, maxWidth: 250 },
    { key: 'commit', name: t('commitId'), fieldName: 'commit', minWidth: 100, maxWidth: 150 },
    // { key: 'source', name: t('Source'), fieldName: 'source', minWidth: 100, maxWidth: 150 },
    { key: 'workflowId', name: t('Workflow Run Number'), fieldName: 'workflowId', minWidth: 75, maxWidth: 150 },
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

export default DeploymentCenterCodeLogs;
