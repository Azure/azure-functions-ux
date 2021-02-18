import React, { useState, useContext, useEffect } from 'react';
import DisplayTableWithEmptyMessage from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import moment from 'moment';
import { IGroup } from 'office-ui-fabric-react/lib/components/GroupedList/GroupedList.types';
import {
  DeploymentCenterCodeLogsProps,
  DeploymentStatus,
  DeploymentProperties,
  GitHubActionsCodeDeploymentsRow,
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
  const { deployments, deploymentsError, isLoading, goToSettings, refreshLogs } = props;
  const { t } = useTranslation();

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

  const setSourceControlDetails = async () => {
    setGitHubActionLogsErrorMessage(undefined);
    setIsLogsLoading(true);
    setIsSourcecontrolsLoading(true);

    setBranch(deploymentCenterContext.configMetadata ? deploymentCenterContext.configMetadata.properties.branch : '');
    const repoUrlSplit = deploymentCenterContext.configMetadata ? deploymentCenterContext.configMetadata.properties.RepoUrl.split('/') : [];
    if (repoUrlSplit.length >= 2) {
      setOrg(repoUrlSplit[repoUrlSplit.length - 2]);
      setRepo(repoUrlSplit[repoUrlSplit.length - 1]);
    } else {
      setGitHubActionLogsErrorMessage(t('deploymentCenterCodeDeploymentsFailed'));
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
    portalContext.log(getTelemetryInfo('verbose', 'cancelWorkflow', 'clicked'));
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
    } else {
      portalContext.log(
        getTelemetryInfo('error', 'cancelWorkflow', 'failed', {
          error: cancelWorkflowResponse.metadata.error,
        })
      );
    }
  };

  const getGitHubActionsRunStatus = (run: GitHubActionsRun): JSX.Element => {
    return run.conclusion ? (
      <>{getConclusionDisplayName(run.conclusion)}</>
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

  const getZipDeployRow = (deployment: ArmObj<DeploymentProperties>, index: number): GitHubActionsCodeDeploymentsRow => {
    return {
      index: index,
      group: -1,
      commitId: deployment.properties.id.substr(0, 7),
      rawTime: moment(deployment.properties.received_time),
      // NOTE (t-kakan): A is AM/PM and Z is offset from GMT: -07:00 -06:00 ... +06:00 +07:00
      displayTime: moment(deployment.properties.received_time).format('MM/D YYYY, h:mm:ss A Z'),
      commit: deployment.properties.id.substr(0, 7),
      logSource: (
        <Link href={`#${deployment.properties.id}`} onClick={() => showLogPanel(deployment)}>
          {t('deploymentCenterAppLogSource')}
        </Link>
      ),
      author: deployment.properties.author,
      message: deployment.properties.deployer === 'GitHub' ? '' : deployment.properties.message,
      status: deployment.properties.active ? (
        <>{`${getStatusString(deployment.properties.status, deployment.properties.progress)} (${t('active')})`}</>
      ) : (
        <>{getStatusString(deployment.properties.status, deployment.properties.progress)}</>
      ),
    };
  };

  const getGitHubActionsRunRow = (run: GitHubActionsRun, index: number): GitHubActionsCodeDeploymentsRow => {
    return {
      index: deployments && deployments.value.length ? deployments.value.length + index : index,
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
  };

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

  const gitHubActionsRows: GitHubActionsCodeDeploymentsRow[] = runs ? runs.map((run, index) => getGitHubActionsRunRow(run, index)) : [];
  const zipDeployRows: GitHubActionsCodeDeploymentsRow[] = deployments
    ? deployments.value.map((deployment, index) => getZipDeployRow(deployment, index))
    : [];
  const newItems = zipDeployRows.concat(gitHubActionsRows);
  const items: GitHubActionsCodeDeploymentsRow[] = newItems.sort(dateTimeComparatorReverse);
  const groups: IGroup[] = getItemCommitGroups(items);

  const columns: IColumn[] = [
    { key: 'displayTime', name: t('time'), fieldName: 'displayTime', minWidth: 100, maxWidth: 200 },
    { key: 'commit', name: t('commitId'), fieldName: 'commit', minWidth: 50, maxWidth: 100 },
    { key: 'logSource', name: t('deploymentCenterLogSource'), fieldName: 'logSource', minWidth: 100, maxWidth: 150 },
    { key: 'author', name: t('commitAuthor'), fieldName: 'author', minWidth: 100, maxWidth: 150 },
    { key: 'status', name: t('status'), fieldName: 'status', minWidth: 125, maxWidth: 200 },
    { key: 'message', name: t('message'), fieldName: 'message', minWidth: 200 },
  ];

  useEffect(() => {
    if (deploymentCenterContext.configMetadata) {
      setSourceControlDetails();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext.configMetadata]);

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
        <DeploymentCenterCommitLogs commitId={currentCommitId} dismissLogPanel={dismissLogPanel} />
      </CustomPanel>
    </>
  );
};

export default DeploymentCenterGitHubActionsCodeLogs;
