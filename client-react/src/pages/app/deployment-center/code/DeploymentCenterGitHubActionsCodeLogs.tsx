import React, { useState, useContext, useEffect } from 'react';
import DisplayTableWithEmptyMessage from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import moment from 'moment';
import { IGroup } from 'office-ui-fabric-react/lib/components/GroupedList/GroupedList.types';
import {
  DeploymentCenterCodeLogsProps,
  DeploymentStatus,
  DeploymentProperties,
  GitHubActionsCodeDeploymentsRow,
  GitHubActionRunConclusionDisplayName,
  GitHubActionRunConclusion,
  GitHubActionsRun,
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
import { getTelemetryInfo, getWorkflowFileName } from '../utility/DeploymentCenterUtility';
import { SiteStateContext } from '../../../../SiteState';
import DeploymentCenterData from '../DeploymentCenter.data';
import { dateTimeComparatorReverse } from './DeploymentCenterCodeLogs';
import { PortalContext } from '../../../../PortalContext';
import DeploymentCenterCodeLogsTimer from './DeploymentCenterCodeLogsTimer';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';

const DeploymentCenterGitHubActionsCodeLogs: React.FC<DeploymentCenterCodeLogsProps> = props => {
  const [isLogPanelOpen, setIsLogPanelOpen] = useState<boolean>(false);
  const [currentCommitId, setCurrentCommitId] = useState<string | undefined>(undefined);

  const [isLogsLoading, setIsLogsLoading] = useState<boolean>(false);
  const [isSourceControlsLoading, setIsSourcecontrolsLoading] = useState<boolean>(true);
  const [org, setOrg] = useState<string | undefined>(undefined);
  const [repo, setRepo] = useState<string | undefined>(undefined);
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [runs, setRuns] = useState<GitHubActionsRun[] | undefined>(undefined);
  const [gitHubActionLogsErrorMessage, setGitHubActionLogsErrorMessage] = useState<string | undefined>(undefined);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const { deployments, deploymentsError, isLoading, goToSettings, refreshLogs } = props;
  const { t } = useTranslation();

  const siteStateContext = useContext(SiteStateContext);
  const portalContext = useContext(PortalContext);
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

  const getConclusionDisplayName = (status: string): GitHubActionRunConclusionDisplayName => {
    switch (status) {
      case GitHubActionRunConclusion.Success:
        return t(GitHubActionRunConclusionDisplayName.Success);
      case GitHubActionRunConclusion.Failure:
        return t(GitHubActionRunConclusionDisplayName.Failure);
      case GitHubActionRunConclusion.Cancelled:
        return t(GitHubActionRunConclusionDisplayName.Cancelled);
      case GitHubActionRunConclusion.Skipped:
        return t(GitHubActionRunConclusionDisplayName.Skipped);
      case GitHubActionRunConclusion.TimedOut:
        return t(GitHubActionRunConclusionDisplayName.TimedOut);
      case GitHubActionRunConclusion.ActionRequired:
        return t(GitHubActionRunConclusionDisplayName.ActionRequired);
      default:
        return t(GitHubActionRunConclusionDisplayName.None);
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

  const refreshGitHubActionsLogs = () => {
    refreshLogs();
    fetchWorkflowRuns();
  };

  const fetchSourceControlDetails = async () => {
    setGitHubActionLogsErrorMessage(undefined);
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
        setGitHubActionLogsErrorMessage('deploymentCenterCodeDeploymentsFailed');
        setIsLogsLoading(false);
      }
    } else {
      const errorMessage = getErrorMessage(sourceControlDetailsResponse.metadata.error);
      setGitHubActionLogsErrorMessage(
        errorMessage ? t('deploymentCenterCodeDeploymentsFailedWithError').format(errorMessage) : t('deploymentCenterCodeDeploymentsFailed')
      );
      portalContext.log(
        getTelemetryInfo('error', 'getSourceControlDetails', 'failed', {
          error: sourceControlDetailsResponse.metadata.error,
        })
      );
      setIsLogsLoading(false);
    }
    setIsSourcecontrolsLoading(false);
  };

  const fetchWorkflowRuns = async () => {
    setGitHubActionLogsErrorMessage(undefined);
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
        const errorMessage = getErrorMessage(gitHubActionWorkflowRunsResponse.metadata.error);
        setGitHubActionLogsErrorMessage(
          errorMessage
            ? t('deploymentCenterCodeDeploymentsFailedWithError').format(errorMessage)
            : t('deploymentCenterCodeDeploymentsFailed')
        );
        portalContext.log(
          getTelemetryInfo('error', 'getWorkflowRuns', 'failed', {
            error: gitHubActionWorkflowRunsResponse.metadata.error,
          })
        );
      }
    }
    setIsLogsLoading(false);
  };

  const cancelWorkflowRunOnClick = async (url: string) => {
    portalContext.log(getTelemetryInfo('info', 'cancelWorkflow', 'clicked'));
    const cancelWorkflowResponse = await deploymentCenterData.cancelWorkflowRun(deploymentCenterContext.gitHubToken, url);
    if (cancelWorkflowResponse.metadata.success) {
      setIsLogsLoading(true);
      await fetchWorkflowRuns();
      //NOTE(stpelleg): It takes a while for the run to show as cancelled, but users would be confused if
      //it did not show as cancelled right after clicking cancel
      if (runs && runs.length > 0) {
        const curRuns = runs;
        curRuns[0].conclusion = t(GitHubActionRunConclusion.Cancelled);
        setRuns(curRuns);
      }
      setIsLogsLoading(false);
    } else {
      portalContext.log(
        getTelemetryInfo('error', 'cancelWorkflow', 'failed', {
          error: cancelWorkflowResponse.metadata.error,
        })
      );
    }
  };

  const getDeploymentRow = (deployment: ArmObj<DeploymentProperties>, index: number): GitHubActionsCodeDeploymentsRow => {
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
      author: deployment.properties.author,
      message: deployment.properties.deployer === 'GitHub' ? '' : deployment.properties.message,
      status: deployment.properties.active
        ? `${getStatusString(deployment.properties.status, deployment.properties.progress)} (${t('active')})`
        : `${getStatusString(deployment.properties.status, deployment.properties.progress)}`,
    };
  };

  const getGitHubActionsRunStatus = (run: GitHubActionsRun): string | JSX.Element => {
    return run.conclusion ? (
      getConclusionDisplayName(run.conclusion)
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
    );
  };

  const GitHubActionsRows: GitHubActionsCodeDeploymentsRow[] = runs
    ? runs.map((run, index) => {
        return {
          index: deployments && deployments.value.length ? deployments.value.length + index : index,
          group: -1,
          commitId: run.head_commit.id.substr(0, 7),
          rawTime: moment(run.updated_at),
          // NOTE (stpelleg): A is AM/PM and Z is offset from GMT: -07:00 -06:00 ... +06:00 +07:00
          displayTime: moment(run.updated_at).format('MM/D YYYY, h:mm:ss A Z'),
          runNumber: run.run_number,
          author: run.head_commit.author.name,
          message: run.head_commit.message,
          commit: (
            <Link key="github-actions-logs-link" onClick={() => window.open(run.html_url, '_blank')}>
              {run.head_commit.id.substr(0, 7)}
              <Icon id={`ga-logs`} iconName={'NavigateExternalInline'} />
            </Link>
          ),
          status: getGitHubActionsRunStatus(run),
        };
      })
    : [];

  const getItemCommitGroups = (items: GitHubActionsCodeDeploymentsRow[]): IGroup[] => {
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
  };

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

  const getDeploymentErrorMessage = () => {
    if (deploymentsError) {
      return deploymentsError;
    } else if (gitHubActionLogsErrorMessage) {
      return gitHubActionLogsErrorMessage;
    } else {
      return '';
    }
  };

  const rows: GitHubActionsCodeDeploymentsRow[] = deployments
    ? deployments.value.map((deployment, index) => getDeploymentRow(deployment, index))
    : [];
  const newItems = rows.concat(GitHubActionsRows);
  const items: GitHubActionsCodeDeploymentsRow[] = newItems.sort(dateTimeComparatorReverse);
  const groups: IGroup[] = getItemCommitGroups(items);

  const columns: IColumn[] = [
    { key: 'displayTime', name: t('time'), fieldName: 'displayTime', minWidth: 100, maxWidth: 200 },
    { key: 'commit', name: t('commitId'), fieldName: 'commit', minWidth: 50, maxWidth: 100 },
    { key: 'runNumber', name: t('deploymentCenterWorkflowRunNumber'), fieldName: 'runNumber', minWidth: 100, maxWidth: 150 },
    { key: 'author', name: t('commitAuthor'), fieldName: 'author', minWidth: 100, maxWidth: 150 },
    { key: 'status', name: t('status'), fieldName: 'status', minWidth: 125, maxWidth: 200 },
    { key: 'message', name: t('message'), fieldName: 'message', minWidth: 200 },
  ];

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
        <div className={deploymentCenterLogsError}>{getDeploymentErrorMessage()}</div>
      ) : deployments ? (
        <>
          <DeploymentCenterCodeLogsTimer refreshLogs={refreshGitHubActionsLogs} />
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

export default DeploymentCenterGitHubActionsCodeLogs;
