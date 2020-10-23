import React, { useState, useContext, useEffect } from 'react';
import { IColumn, Icon, IGroup, Link, PanelType, ProgressIndicator } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { deploymentCenterLogsError } from '../DeploymentCenter.styles';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { getWorkflowFileName } from '../utility/DeploymentCenterUtility';
import { SiteStateContext } from '../../../../SiteState';
import { dateTimeComparatorReverse } from './DeploymentCenterCodeLogs';
import {
  GitHubActionRun,
  GitHubActionRunConclusion,
  GitHubActionRunConclusionDisplayName,
  GitHubActionRunRow,
  GitHubActionRunStatus,
  GitHubActionRunStatusDisplayName,
} from '../DeploymentCenter.types';
import moment from 'moment';
import DisplayTableWithEmptyMessage from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import DeploymentCenterGitHubActionRunLogs from './DeploymentCenterGitHubActionRunLogs';

const DeploymentCenterGitHubActionLogs: React.FC<{}> = props => {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSourceControlsLoading, setIsSourcecontrolsLoading] = useState<boolean>(true);
  const [org, setOrg] = useState<string | undefined>(undefined);
  const [repo, setRepo] = useState<string | undefined>(undefined);
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [runs, setRuns] = useState<GitHubActionRun[] | undefined>(undefined);
  const [gitHubActionLogsErrorMessage, setGitHubActionLogsErrorMessage] = useState<string | undefined>(undefined);
  const [isLogPanelOpen, setIsLogPanelOpen] = useState<boolean>(false);
  const [currentRunLogsUrl, setCurrentRunLogsUrl] = useState<string | undefined>(undefined);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);
  const deploymentCenterData = new DeploymentCenterData();

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

  const columns: IColumn[] = [
    { key: 'displayTime', name: t('time'), fieldName: 'displayTime', minWidth: 150, maxWidth: 250 },
    { key: 'commit', name: t('Commit Id'), fieldName: 'commit', minWidth: 150, maxWidth: 250 },
    { key: 'workflowId', name: t('Workflow Run Number'), fieldName: 'workflowId', minWidth: 150, maxWidth: 200 },
    { key: 'status', name: t('status'), fieldName: 'status', minWidth: 150, maxWidth: 200 },
    { key: 'details', name: t('Workflow Run Details'), fieldName: 'details', minWidth: 150, maxWidth: 400 },
  ];

  const rows: GitHubActionRunRow[] = runs
    ? runs.map((run, index) => {
        return {
          index: index,
          commit: run.head_commit.id.substr(0, 7),
          rawTime: moment(run.updated_at),
          // NOTE (t-kakan): A is AM/PM and Z is offset from GMT: -07:00 -06:00 ... +06:00 +07:00
          displayTime: moment(run.updated_at).format('h:mm:ss A Z'),
          workflowId: (
            <Link href={`#${run.run_number}`} onClick={() => showLogPanel(run.logs_url)}>
              {run.run_number}
            </Link>
          ),
          details: (
            <Link
              key="github-actions-logs-link"
              onClick={() => window.open(run.html_url, '_blank')}
              aria-label={t('deploymentCenterGitHubActionsLogsLinkMessage')}>
              {t('deploymentCenterGitHubActionsLogsLinkMessage')}
              <Icon id={`ga-logs`} iconName={'NavigateExternalInline'} />
            </Link>
          ),
          status: run.conclusion ? (
            `${getStatusDisplayName(run.status)} (${getConclusionDisplayName(run.conclusion)})`
          ) : (
            <>
              {t('In Progress... ')}
              {<Link onClick={() => cancelWorkflowRunOnClick(run.cancel_url)}>{t('deploymentCenterGitHubActionsCancelRunMessage')}</Link>}
            </>
          ),
        };
      })
    : [];
  const items: GitHubActionRunRow[] = rows.sort(dateTimeComparatorReverse);

  const cancelWorkflowRunOnClick = async (url: string) => {
    const cancelWorkflowResponse = await deploymentCenterData.cancelWorkflowRun(deploymentCenterContext.gitHubToken, url);
    if (cancelWorkflowResponse.metadata.success) {
      setIsLoading(true);
      await fetchWorkflowRuns();
    } else {
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterCancelWorkflowRun',
        `Failed to get cancel workflow run with error: ${getErrorMessage(cancelWorkflowResponse.metadata.error)}`
      );
    }
  };

  const fetchSourceControlDetails = async () => {
    setIsLoading(true);
    setIsSourcecontrolsLoading(true);
    const sourceControlDetailsResponse = await deploymentCenterData.getSourceControlDetails(deploymentCenterContext.resourceId);

    if (sourceControlDetailsResponse.metadata.success) {
      setBranch(sourceControlDetailsResponse.data.properties.branch);
      const repoUrlSplit = sourceControlDetailsResponse.data.properties.repoUrl.split('/');
      if (repoUrlSplit.length >= 2) {
        setOrg(repoUrlSplit[repoUrlSplit.length - 2]);
        setRepo(repoUrlSplit[repoUrlSplit.length - 1]);
      } else {
        setIsLoading(false);
      }
    } else {
      setGitHubActionLogsErrorMessage(t('deploymentCenterGitHubActionsLogsFailed'));
      setIsLoading(false);
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterSourceControls',
        `Failed to get source control details with error: ${getErrorMessage(sourceControlDetailsResponse.metadata.error)}`
      );
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
        LogService.error(
          LogCategories.deploymentCenter,
          'DeploymentCenterWorkflowRuns',
          `Failed to get workflow runs with error: ${getErrorMessage(gitHubActionWorkflowRunsResponse.metadata.error)}`
        );
      }
    }
    setIsLoading(false);
  };

  const getItemGroups = (items: GitHubActionRunRow[]): IGroup[] => {
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
  };

  const showLogPanel = (url: string) => {
    setIsLogPanelOpen(true);
    setCurrentRunLogsUrl(url);
  };
  const dismissLogPanel = () => {
    setIsLogPanelOpen(false);
    setCurrentRunLogsUrl(undefined);
  };

  useEffect(() => {
    fetchSourceControlDetails();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isSourceControlsLoading) {
      fetchWorkflowRuns();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSourceControlsLoading]);

  return (
    <>
      {isLoading && (
        <ProgressIndicator
          description={t('deploymentCenterGitHubActionsLogsLoading')}
          ariaValueText={t('deploymentCenterGitHubActionsLogsLoadingAriaValue')}
        />
      )}
      {!isLoading && runs && (
        <>
          <DisplayTableWithEmptyMessage columns={columns} items={items} selectionMode={0} groups={getItemGroups(items)} />
          {items.length === 0 && t('deploymentCenterGitHubActionsLogsEmpty')}
        </>
      )}
      {gitHubActionLogsErrorMessage && <div className={deploymentCenterLogsError}>{gitHubActionLogsErrorMessage}</div>}

      <CustomPanel isOpen={isLogPanelOpen} onDismiss={dismissLogPanel} type={PanelType.medium}>
        <DeploymentCenterGitHubActionRunLogs url={currentRunLogsUrl} />
      </CustomPanel>
    </>
  );
};

export default DeploymentCenterGitHubActionLogs;
