import ContainerLogsService from '../../../ApiHelpers/ContainerLogsService';
import { ArmObj } from '../../../models/arm-obj';
import { PublishingUser } from '../../../models/site/publish';
import ProviderService from '../../../ApiHelpers/ProviderService';
import SiteService from '../../../ApiHelpers/SiteService';
import GitHubService from '../../../ApiHelpers/GitHubService';
import RuntimeStackService from '../../../ApiHelpers/RuntimeStackService';
import { AppOsType } from '../../../models/site/site';
import { GitHubActionWorkflowRequestContent } from '../../../models/github';
import { ProviderToken } from '../../../models/provider';

export default class DeploymentCenterData {
  public fetchContainerLogs = (resourceId: string) => {
    return ContainerLogsService.fetchContainerLogs(resourceId);
  };

  public getPublishingUser = () => {
    return ProviderService.getPublishingUser();
  };

  public updatePublishingUser = (user: ArmObj<PublishingUser>) => {
    return ProviderService.updatePublishingUser(user);
  };

  public getPublishingCredentials = (resourceId: string) => {
    return SiteService.getPublishingCredentials(resourceId);
  };

  public getPublishProfile = (resourceId: string) => {
    return SiteService.getPublishProfile(resourceId);
  };

  public resetPublishProfile = (resourceId: string) => {
    return SiteService.resetPublishProfile(resourceId);
  };

  public getSiteConfig = (resourceId: string) => {
    return SiteService.fetchWebConfig(resourceId);
  };

  public fetchApplicationSettings = (resourceId: string) => {
    return SiteService.fetchApplicationSettings(resourceId);
  };

  public getConfigMetadata = (resourceId: string) => {
    return SiteService.fetchMetadata(resourceId);
  };

  public getSiteDeployments = (resourceId: string) => {
    return SiteService.getSiteDeployments(resourceId);
  };

  public getDeploymentLogs = (deploymentId: string) => {
    return SiteService.getDeploymentLogs(deploymentId);
  };

  public getLogDetails = (deploymentId: string, logId: string) => {
    return SiteService.getLogDetails(deploymentId, logId);
  };

  public getSourceControlDetails = (resourceId: string) => {
    return SiteService.getSourceControlDetails(resourceId);
  };

  public deleteSourceControlDetails = (resourceId: string) => {
    return SiteService.deleteSourceControlDetails(resourceId);
  };

  public updateSourceControlDetails = (resourceId: string, body: any) => {
    return SiteService.updateSourceControlDetails(resourceId, body);
  };

  public patchSiteConfig = (resourceId: string, body: any) => {
    return SiteService.patchSiteConfig(resourceId, body);
  };

  public getGitHubUser = (armToken: string) => {
    return GitHubService.getUser(armToken);
  };

  public getGitHubToken = (redirectUrl: string) => {
    return GitHubService.getToken(redirectUrl);
  };

  public getGitHubOrganizations = (armToken: string) => {
    return GitHubService.getOrganizations(armToken);
  };

  public getGitHubOrgRepositories = (repositories_url: string, armToken: string, logger?: (page, response) => void) => {
    return GitHubService.getOrgRepositories(repositories_url, armToken, logger);
  };

  public getGitHubUserRepositories = (armToken: string, logger?: (page, response) => void) => {
    return GitHubService.getUserRepositories(armToken, logger);
  };

  public getGitHubBranches = (org: string, repo: string, armToken: string, logger?: (page, response) => void) => {
    return GitHubService.getBranches(org, repo, armToken, logger);
  };

  public getAllWorkflowConfigurations = (org: string, repo: string, branchName: string, authToken: string) => {
    return GitHubService.getAllWorkflowConfigurations(org, repo, branchName, authToken);
  };

  public getWorkflowConfiguration = (org: string, repo: string, branchName: string, workflowYmlPath: string, authToken: string) => {
    return GitHubService.getWorkflowConfiguration(org, repo, branchName, workflowYmlPath, authToken);
  };

  public deleteActionWorkflow = (
    authToken: string,
    org: string,
    repo: string,
    branch: string,
    workflowFilePath: string,
    message: string,
    sha: string
  ) => {
    return GitHubService.deleteActionWorkflow(authToken, org, repo, branch, workflowFilePath, message, sha);
  };

  public createOrUpdateActionWorkflow = (authToken: string, content: GitHubActionWorkflowRequestContent) => {
    return GitHubService.createOrUpdateActionWorkflow(authToken, content);
  };

  public getRuntimeStacks = (stacksOs: AppOsType) => {
    return RuntimeStackService.getWebAppGitHubActionStacks(stacksOs);
  };

  public storeGitHubToken = (providerToken: ProviderToken) => {
    return ProviderService.updateUserSourceControl(
      'github',
      providerToken.accessToken,
      providerToken.refreshToken,
      providerToken.environment);
  }
}
