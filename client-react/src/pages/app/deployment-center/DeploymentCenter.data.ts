import ContainerLogsService from '../../../ApiHelpers/ContainerLogsService';
import { ArmObj, MsiIdentity } from '../../../models/arm-obj';
import { PublishingUser } from '../../../models/site/publish';
import ProviderService from '../../../ApiHelpers/ProviderService';
import SiteService from '../../../ApiHelpers/SiteService';
import GitHubService from '../../../ApiHelpers/GitHubService';
import RuntimeStackService from '../../../ApiHelpers/RuntimeStackService';
import { GitHubActionWorkflowRequestContent } from '../../../models/github';
import { ProviderToken } from '../../../models/provider';
import BitbucketService from '../../../ApiHelpers/BitbucketService';
import OneDriveService from '../../../ApiHelpers/OneDriveService';
import ACRService from '../../../ApiHelpers/ACRService';
import { ACRWebhookPayload } from '../../../models/acr';
import { SiteConfig } from '../../../models/site/config';
import { KeyValue } from '../../../models/portal-models';
import { RoleAssignment, SourceControlOptions } from './DeploymentCenter.types';
import DropboxService from '../../../ApiHelpers/DropboxService';
import { AppStackOs } from '../../../models/stacks/app-stacks';
import AzureDevOpsService from '../../../AzureDevOpsService';
import PortalCommunicator from '../../../portal-communicator';
import AuthService from '../../../ApiHelpers/AuthService';

export default class DeploymentCenterData {
  private _azureDevOpsService = new AzureDevOpsService();

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

  public fetchSite = (resourceId: string) => {
    return SiteService.fetchSite(resourceId);
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

  public updateConfigMetadata = (resourceId: string, properties: KeyValue<string>) => {
    return SiteService.updateMetadata(resourceId, properties);
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

  public redeployCommit = (resourceId: string, commitId: string) => {
    return SiteService.redeployCommit(resourceId, commitId);
  };

  public getSourceControlDetails = (resourceId: string) => {
    return SiteService.getSourceControlDetails(resourceId);
  };

  public deleteSourceControlDetails = (resourceId: string, deleteWorkflow: boolean = true) => {
    return SiteService.deleteSourceControlDetails(resourceId, deleteWorkflow);
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

  public getGitHubOrganizations = (gitHubToken: string, logger?: (page, response) => void) => {
    return GitHubService.getOrganizations(gitHubToken, logger);
  };

  public getGitHubOrgRepositories = (org: string, gitHubToken: string, logger?: (page, response) => void, searchTerm?: string) => {
    return GitHubService.getOrgRepositories(org, gitHubToken, logger, searchTerm);
  };

  public getGitHubUserRepositories = (gitHubToken: string, logger?: (page, response) => void, searchTerm?: string) => {
    return GitHubService.getUserRepositories(gitHubToken, logger, searchTerm);
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

  public createOrUpdateActionWorkflow = (
    authToken: string,
    gitHubToken: string,
    content: GitHubActionWorkflowRequestContent,
    replacementPublishUrl?: string
  ) => {
    return GitHubService.createOrUpdateActionWorkflow(authToken, gitHubToken, content, replacementPublishUrl);
  };

  public getWebAppRuntimeStacks = (stacksOs: AppStackOs) => {
    return RuntimeStackService.getWebAppGitHubActionStacks(stacksOs);
  };

  public getFunctionAppRuntimeStacks = (stacksOs: AppStackOs) => {
    return RuntimeStackService.getFunctionAppGitHubActionStacks(stacksOs);
  };

  public storeGitHubToken = (providerToken: ProviderToken) => {
    return ProviderService.updateUserSourceControl(
      SourceControlOptions.GitHub,
      providerToken.accessToken,
      providerToken.refreshToken,
      providerToken.environment
    );
  };

  public resetToken = (gitHubToken: string) => {
    return GitHubService.resetToken(gitHubToken);
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

  public storeBitbucketToken = (providerToken: ProviderToken) => {
    return ProviderService.updateUserSourceControl(
      SourceControlOptions.Bitbucket,
      providerToken.accessToken,
      providerToken.refreshToken,
      providerToken.environment
    );
  };

  public getBitbucketRepositories = (bitbucketToken: string) => {
    return BitbucketService.getRepositories(bitbucketToken);
  };

  public getBitbucketBranches = (org: string, repo: string, bitbucketToken: string, logger?: (page, response) => void) => {
    return BitbucketService.getBranches(org, repo, bitbucketToken, logger);
  };

  public getOneDriveUser = (oneDriveToken: string) => {
    return OneDriveService.getUser(oneDriveToken);
  };

  public getOneDriveToken = (oneDriveToken: string) => {
    return OneDriveService.getToken(oneDriveToken);
  };

  public storeOneDriveToken = (providerToken: ProviderToken) => {
    return ProviderService.updateUserSourceControl(
      SourceControlOptions.OneDrive,
      providerToken.accessToken,
      providerToken.refreshToken,
      providerToken.environment
    );
  };

  public getOneDriveFolders = (oneDriveToken: string) => {
    return OneDriveService.getFolders(oneDriveToken);
  };

  public getDropboxUser = (dropboxToken: string) => {
    return DropboxService.getUser(dropboxToken);
  };

  public getDropboxToken = (dropboxToken: string) => {
    return DropboxService.getToken(dropboxToken);
  };

  public storeDropboxToken = (providerToken: ProviderToken) => {
    return ProviderService.updateUserSourceControl(
      SourceControlOptions.Dropbox,
      providerToken.accessToken,
      providerToken.refreshToken,
      providerToken.environment
    );
  };

  public getDropboxFolders = (dropboxToken: string) => {
    return DropboxService.getFolders(dropboxToken);
  };

  public getAcrRegistries = (subscriptionId: string) => {
    return ACRService.getRegistries(subscriptionId);
  };

  public listAcrCredentials = (resourceId: string) => {
    return ACRService.listCredentials(resourceId);
  };

  public updateAcrWebhook = (resourceId: string, name: string, location: string, properties: ACRWebhookPayload) => {
    return ACRService.updateAcrWebhook(resourceId, name, location, properties);
  };

  public deleteAcrWebhook = (resourceId: string) => {
    return ACRService.deleteAcrWebhook(resourceId);
  };

  public getAcrRepositories = (
    portalContext: PortalCommunicator,
    loginServer: string,
    username: string,
    password: string,
    logger?: (page, error) => void
  ) => {
    return ACRService.getRepositories(portalContext, loginServer, username, password, logger);
  };

  public getAcrTags = (
    portalContext: PortalCommunicator,
    loginServer: string,
    repository: string,
    username: string,
    password: string,
    logger?: (page, error) => void
  ) => {
    return ACRService.getTags(portalContext, loginServer, repository, username, password, logger);
  };

  public hasRoleAssignment = (roleDefinitionId: string, roleAssignments: ArmObj<RoleAssignment>[]) => {
    return AuthService.hasRoleAssignment(roleDefinitionId, roleAssignments);
  };

  public getRoleAssignmentsWithScope = (scope: string, principalId: string) => {
    return AuthService.getRoleAssignmentsWithScope(scope, principalId);
  };

  public putRoleAssignmentWithScope = (roleDefinitionId: string, scope: string, principalId: string, principalType?: string) => {
    return AuthService.putRoleAssignmentWithScope(roleDefinitionId, scope, principalId, principalType);
  };

  public enableSystemAssignedIdentity = (resourceId: string, identity?: MsiIdentity) => {
    return AuthService.enableSystemAssignedIdentity(resourceId, identity);
  };

  public updateSiteConfig = (resourceId: string, config: ArmObj<SiteConfig>) => {
    return SiteService.updateWebConfig(resourceId, config);
  };

  public updateApplicationSettings = (resourceId: string, appSettings: ArmObj<{ [name: string]: string }>) => {
    return SiteService.updateApplicationSettings(resourceId, appSettings);
  };

  public getAccounts = () => {
    return this._azureDevOpsService.getAccounts();
  };

  public getAzureDevOpsUrl = () => {
    return this._azureDevOpsService.getAzureDevOpsUrl();
  };

  public getAzureDevOpsBuildDef = (accountName: string, buildDefinitionProjectUrl: string, buildDefinitionId: string) => {
    return this._azureDevOpsService.getBuildDef(accountName, buildDefinitionProjectUrl, buildDefinitionId);
  };

  public getAzureDevOpsRepositories = (accountName: string) => {
    return this._azureDevOpsService.getRepositoriesForAccount(accountName);
  };

  public getAzureDevOpsBranches = (accountName: string, repositoryId: string) => {
    return this._azureDevOpsService.getBranchesForRepo(accountName, repositoryId);
  };

  public listWorkflowRuns = (gitHubToken: string, org: string, repo: string, workflowFileName: string) => {
    return GitHubService.listWorkflowRuns(gitHubToken, org, repo, workflowFileName);
  };

  public cancelWorkflowRun = (gitHubToken: string, url: string) => {
    return GitHubService.cancelWorkflowRun(gitHubToken, url);
  };

  public getWorkflowFile = (appType: string, publishType: string, os: string, variables: KeyValue<string>, runtimeStack?: string) => {
    return GitHubService.getWorkflowFile(appType, publishType, os, variables, runtimeStack);
  };
}
