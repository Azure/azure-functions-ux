import ContainerLogsService from '../../../ApiHelpers/ContainerLogsService';
import { ArmObj } from '../../../models/arm-obj';
import { PublishingUser } from '../../../models/site/publish';
import ProviderService from '../../../ApiHelpers/ProviderService';
import SiteService from '../../../ApiHelpers/SiteService';
import GitHubService from '../../../ApiHelpers/GitHubService';
import RuntimeStackService from '../../../ApiHelpers/RuntimeStackService';

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

  public getGitHubUser = (armToken: string) => {
    return GitHubService.getUser(armToken);
  };

  public storeGitHubToken = (redirectUrl: string, armToken: string) => {
    return GitHubService.storeToken(redirectUrl, armToken);
  };

  public getGitHubOrganizations = (armToken: string) => {
    return GitHubService.getOrganizations(armToken);
  };

  public getGitHubOrgRepositories = (repositories_url: string, armToken: string) => {
    return GitHubService.getOrgRepositories(repositories_url, armToken);
  };

  public getGitHubUserRepositories = (armToken: string) => {
    return GitHubService.getUserRepositories(armToken);
  };

  public getGitHubBranches = (repository_url: string, armToken: string) => {
    return GitHubService.getBranches(repository_url, armToken);
  };

  public getRuntimeStacks = (stacksOs: 'linux' | 'windows') => {
    return RuntimeStackService.getWebAppGitHubActionStacks(stacksOs);
  };
}
