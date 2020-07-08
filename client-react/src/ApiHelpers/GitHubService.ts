import { sendHttpRequest } from './HttpClient';
import Url from '../utils/url';
import {
  GitHubUser,
  GitHubOrganizations,
  GitHubRepository,
  GitHubBranch,
  FileContent,
  GitHubCommit,
  GitHubActionWorkflowRequestContent,
} from '../models/github';
import { HttpResponseObject } from '../ArmHelper.types';
import { DeploymentCenterConstants } from '../pages/app/deployment-center/DeploymentCenterConstants';

export default class GitHubService {
  public static authorizeUrl = `${Url.serviceHost}auth/github/authorize`;

  public static getUser = (authToken: string) => {
    const data = {
      url: 'https://api.github.com/user',
      authToken,
    };

    return sendHttpRequest<GitHubUser>({ url: `${Url.serviceHost}api/github/passthrough`, method: 'POST', data });
  };

  public static storeToken = (redirectUrl: string, authToken: string): Promise<HttpResponseObject<void>> => {
    const data = {
      redirUrl: redirectUrl,
      authToken: authToken,
    };

    return sendHttpRequest<void>({ url: `${Url.serviceHost}auth/github/storeToken`, method: 'POST', data });
  };

  public static getOrganizations = (authToken: string) => {
    const data = {
      url: 'https://api.github.com/user/orgs',
      authToken,
    };

    return sendHttpRequest<GitHubOrganizations[]>({ url: `${Url.serviceHost}api/github/passthrough`, method: 'POST', data });
  };

  public static getOrgRepositories = (repositories_url: string, authToken: string) => {
    const data = {
      url: `${repositories_url}/repos?per_page=100`,
      authToken,
    };

    return sendHttpRequest<GitHubRepository[]>({ url: `${Url.serviceHost}api/github/passthrough`, method: 'POST', data });
  };

  public static getUserRepositories = (authToken: string) => {
    const data = {
      url: `${DeploymentCenterConstants.githubApiUrl}/user/repos?type=owner`,
      authToken,
    };

    return sendHttpRequest<GitHubRepository[]>({ url: `${Url.serviceHost}api/github/passthrough`, method: 'POST', data });
  };

  public static getBranches = (org: string, repo: string, authToken: string) => {
    const data = {
      url: `${DeploymentCenterConstants.githubApiUrl}/repos/${org}/${repo}/branches`,
      authToken,
    };

    return sendHttpRequest<GitHubBranch[]>({ url: `${Url.serviceHost}api/github/passthrough`, method: 'POST', data });
  };

  public static getAllWorkflowConfigurations = (org: string, repo: string, branchName: string, authToken: string) => {
    const data = {
      url: `${DeploymentCenterConstants.githubApiUrl}/repos/${org}/${repo}/contents/.github/workflows?ref=${branchName}`,
      authToken,
    };

    return sendHttpRequest<FileContent[]>({ url: `${Url.serviceHost}api/github/passthrough`, method: 'POST', data });
  };

  public static getWorkflowConfiguration = (org: string, repo: string, branchName: string, workflowYmlPath: string, authToken: string) => {
    const data = {
      url: `${DeploymentCenterConstants.githubApiUrl}/repos/${org}/${repo}/contents/${workflowYmlPath}?ref=${branchName}`,
      authToken,
    };

    return sendHttpRequest<FileContent>({ url: `${Url.serviceHost}api/github/passthrough`, method: 'POST', data });
  };

  public static deleteActionWorkflow = (
    authToken: string,
    org: string,
    repo: string,
    branch: string,
    workflowFilePath: string,
    message: string,
    sha: string
  ) => {
    const deleteCommit: GitHubCommit = {
      repoName: `${org}/${repo}`,
      branchName: branch,
      filePath: workflowFilePath,
      message: message,
      committer: {
        name: 'Azure App Service',
        email: 'donotreply@microsoft.com',
      },
      sha: sha,
    };

    const data = {
      authToken,
      deleteCommit,
    };

    return sendHttpRequest<void>({ url: `${Url.serviceHost}api/github/deleteActionWorkflow`, method: 'POST', data });
  };

  public static createOrUpdateActionWorkflow = (authToken: string, content: GitHubActionWorkflowRequestContent) => {
    const data = {
      authToken,
      content,
    };

    return sendHttpRequest<void>({ url: `${Url.serviceHost}api/github/actionWorkflow`, method: 'PUT', data });
  };
}
