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
import BitbucketService from '../../../ApiHelpers/BitbucketService';

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

  public getGitHubUser = (gitHubToken: string) => {
    return GitHubService.getUser(gitHubToken);
  };

  public getGitHubToken = (redirectUrl: string) => {
    return GitHubService.getToken(redirectUrl);
  };

  public getGitHubOrganizations = (gitHubToken: string) => {
    return GitHubService.getOrganizations(gitHubToken);
  };

  public getGitHubOrgRepositories = (repositories_url: string, gitHubToken: string, logger?: (page, response) => void) => {
    return GitHubService.getOrgRepositories(repositories_url, gitHubToken, logger);
  };

  public getGitHubUserRepositories = (gitHubToken: string, logger?: (page, response) => void) => {
    return GitHubService.getUserRepositories(gitHubToken, logger);
  };

  public getGitHubBranches = (org: string, repo: string, gitHubToken: string, logger?: (page, response) => void) => {
    return GitHubService.getBranches(org, repo, gitHubToken, logger);
  };

  public getAllWorkflowConfigurations = (org: string, repo: string, branchName: string, gitHubToken: string) => {
    return GitHubService.getAllWorkflowConfigurations(org, repo, branchName, gitHubToken);
  };

  public getWorkflowConfiguration = (org: string, repo: string, branchName: string, workflowYmlPath: string, gitHubToken: string) => {
    return GitHubService.getWorkflowConfiguration(org, repo, branchName, workflowYmlPath, gitHubToken);
  };

  public deleteActionWorkflow = (
    gitHubToken: string,
    org: string,
    repo: string,
    branch: string,
    workflowFilePath: string,
    message: string,
    sha: string
  ) => {
    return GitHubService.deleteActionWorkflow(gitHubToken, org, repo, branch, workflowFilePath, message, sha);
  };

  public createOrUpdateActionWorkflow = (authToken: string, gitHubToken: string, content: GitHubActionWorkflowRequestContent) => {
    return GitHubService.createOrUpdateActionWorkflow(authToken, gitHubToken, content);
  };

  public getRuntimeStacks = (stacksOs: AppOsType) => {
    return RuntimeStackService.getWebAppGitHubActionStacks(stacksOs);
  };

  public storeGitHubToken = (providerToken: ProviderToken) => {
    return ProviderService.updateUserSourceControl(
      'github',
      providerToken.accessToken,
      providerToken.refreshToken,
      providerToken.environment
    );
  };

  public getUserSourceControls = () => {
    return ProviderService.getUserSourceControls();
  };

  public getBasicPublishingCredentialsPolicies = (resourceId: string) => {
    return SiteService.getBasicPublishingCredentialsPolicies(resourceId);
  };

  public getBitbucketUser = (bitbucketToken: string) => {
    return BitbucketService.getUser(bitbucketToken);
  };

  public getBitbucketToken = (redirectUrl: string) => {
    return BitbucketService.getToken(redirectUrl);
  };

  public getBitbucketRepositories = (bitbucketToken: string) => {
    return BitbucketService.getRepositories(bitbucketToken);
  };

  public getBitbucketBranches = (org: string, repo: string, bitbucketToken: string, logger?: (page, response) => void) => {
    return BitbucketService.getBranches(org, repo, bitbucketToken, logger);
  };
}
