import { sendHttpRequest, getLinksFromLinkHeader, getLastPageNumberFromLinks } from './HttpClient';
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
import { ProviderToken } from '../models/provider';

export default class GitHubService {
  public static authorizeUrl = `${Url.serviceHost}auth/github/authorize`;

  public static getUser = (gitHubToken: string) => {
    const data = {
      url: 'https://api.github.com/user',
      gitHubToken,
    };

    return sendHttpRequest<GitHubUser>({ url: `${Url.serviceHost}api/github/passthrough`, method: 'POST', data });
  };

  public static getToken = (redirectUrl: string): Promise<HttpResponseObject<ProviderToken>> => {
    const data = {
      redirUrl: redirectUrl,
    };

    return sendHttpRequest<ProviderToken>({ url: `${Url.serviceHost}auth/github/getToken`, method: 'POST', data });
  };

  public static getOrganizations = (gitHubToken: string) => {
    const data = {
      url: 'https://api.github.com/user/orgs',
      gitHubToken,
    };

    return sendHttpRequest<GitHubOrganizations[]>({ url: `${Url.serviceHost}api/github/passthrough`, method: 'POST', data });
  };

  public static getOrgRepositories = async (repositories_url: string, gitHubToken: string, logger?: (page, response) => void) => {
    return GitHubService._getGitHubObjectList<GitHubRepository>(`${repositories_url}/repos?per_page=100`, gitHubToken, logger);
  };

  public static getUserRepositories = async (gitHubToken: string, logger?: (page, response) => void) => {
    return GitHubService._getGitHubObjectList<GitHubRepository>(
      `${DeploymentCenterConstants.githubApiUrl}/user/repos?type=owner`,
      gitHubToken,
      logger
    );
  };

  public static getBranches = async (org: string, repo: string, gitHubToken: string, logger?: (page, response) => void) => {
    return GitHubService._getGitHubObjectList<GitHubBranch>(
      `${DeploymentCenterConstants.githubApiUrl}/repos/${org}/${repo}/branches?per_page=100`,
      gitHubToken,
      logger
    );
  };

  public static getAllWorkflowConfigurations = (org: string, repo: string, branchName: string, gitHubToken: string) => {
    const data = {
      url: `${DeploymentCenterConstants.githubApiUrl}/repos/${org}/${repo}/contents/.github/workflows?ref=${branchName}`,
      gitHubToken,
    };

    return sendHttpRequest<FileContent[]>({ url: `${Url.serviceHost}api/github/passthrough`, method: 'POST', data });
  };

  public static getWorkflowConfiguration = (
    org: string,
    repo: string,
    branchName: string,
    workflowYmlPath: string,
    gitHubToken: string
  ) => {
    const data = {
      url: `${DeploymentCenterConstants.githubApiUrl}/repos/${org}/${repo}/contents/${workflowYmlPath}?ref=${branchName}`,
      gitHubToken,
    };

    return sendHttpRequest<FileContent>({ url: `${Url.serviceHost}api/github/passthrough`, method: 'POST', data });
  };

  public static deleteActionWorkflow = (
    gitHubToken: string,
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
      gitHubToken,
      deleteCommit,
    };

    return sendHttpRequest<void>({ url: `${Url.serviceHost}api/github/deleteActionWorkflow`, method: 'POST', data });
  };

  public static createOrUpdateActionWorkflow = (
    authToken: string,
    gitHubToken: string,
    content: GitHubActionWorkflowRequestContent,
    replacementPublishUrl?: string
  ) => {
    const data = {
      authToken,
      gitHubToken,
      content,
      replacementPublishUrl,
    };

    return sendHttpRequest<void>({ url: `${Url.serviceHost}api/github/actionWorkflow`, method: 'PUT', data });
  };

  public static dispatchWorkflow = (gitHubToken: string, branch: string, repo: string, workflowFileName: string) => {
    const data = {
      url: `${DeploymentCenterConstants.githubApiUrl}/repos/${repo}/actions/workflows/${workflowFileName}/dispatches`,
      gitHubToken,
      data: {
        ref: branch,
      },
    };

    return sendHttpRequest<any>({ url: `${Url.serviceHost}api/github/dispatchWorkflow`, method: 'POST', data });
  };

  public static listWorkflowRuns = (gitHubToken: string, org: string, repo: string, workflowFileName: string) => {
    const url = `${DeploymentCenterConstants.githubApiUrl}/repos/${org}/${repo}/actions/workflows/${workflowFileName}/runs`;
    const data = {
      url,
      gitHubToken,
    };

    return sendHttpRequest<any>({ url: `${Url.serviceHost}api/github/passthrough`, method: 'POST', data });
  };

  public static cancelWorkflowRun = (gitHubToken: string, url: string) => {
    const data = {
      url,
      gitHubToken,
    };

    return sendHttpRequest<any>({ url: `${Url.serviceHost}api/github/passthroughPost`, method: 'POST', data });
  };

  private static _getGitHubObjectList = async <T>(url: string, gitHubToken: string, logger?: (page, response) => void) => {
    const githubObjectList: T[] = [];
    let lastPageNumber = 1;
    for (let i = 1; i <= lastPageNumber; i++) {
      const pageResponse = await GitHubService._sendGitHubRequest<T[]>(`${url}&page=${i}`, gitHubToken);
      if (pageResponse.metadata.success) {
        githubObjectList.push(...pageResponse.data);

        const linkHeader = pageResponse.metadata.headers.link;
        if (linkHeader) {
          const links = getLinksFromLinkHeader(linkHeader);
          const thisLastPageNumber = getLastPageNumberFromLinks(links);
          lastPageNumber = thisLastPageNumber > 10 ? 10 : thisLastPageNumber;
        }
      } else if (logger) {
        logger(i, pageResponse);
      }
    }

    return githubObjectList;
  };

  private static _sendGitHubRequest = <T>(url: string, gitHubToken: string) => {
    const data = {
      url,
      gitHubToken,
    };

    return sendHttpRequest<T>({
      data,
      url: `${Url.serviceHost}api/github/passthrough`,
      method: 'POST',
    });
  };
}
