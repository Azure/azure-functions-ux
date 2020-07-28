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

  public static getUser = (authToken: string) => {
    const data = {
      url: 'https://api.github.com/user',
      authToken,
    };

    return sendHttpRequest<GitHubUser>({ url: `${Url.serviceHost}api/github/passthrough`, method: 'POST', data });
  };

  public static getToken = (redirectUrl: string): Promise<HttpResponseObject<ProviderToken>> => {
    const data = {
      redirUrl: redirectUrl,
    };

    return sendHttpRequest<ProviderToken>({ url: `${Url.serviceHost}auth/github/getToken`, method: 'POST', data });
  };

  public static getOrganizations = (authToken: string) => {
    const data = {
      url: 'https://api.github.com/user/orgs',
      authToken,
    };

    return sendHttpRequest<GitHubOrganizations[]>({ url: `${Url.serviceHost}api/github/passthrough`, method: 'POST', data });
  };

  public static getOrgRepositories = async (repositories_url: string, authToken: string, logger?: (page, response) => void) => {
    return GitHubService._getGitHubObjectList<GitHubRepository>(`${repositories_url}/repos?per_page=100`, authToken, logger);
  };

  public static getUserRepositories = async (authToken: string, logger?: (page, response) => void) => {
    return GitHubService._getGitHubObjectList<GitHubRepository>(
      `${DeploymentCenterConstants.githubApiUrl}/user/repos?type=owner`,
      authToken,
      logger
    );
  };

  public static getBranches = async (org: string, repo: string, authToken: string, logger?: (page, response) => void) => {
    return GitHubService._getGitHubObjectList<GitHubBranch>(
      `${DeploymentCenterConstants.githubApiUrl}/repos/${org}/${repo}/branches?per_page=100`,
      authToken,
      logger
    );
  };

  private static _getGitHubObjectList = async <T>(url: string, authToken: string, logger?: (page, response) => void) => {
    const githubObjectList: T[] = [];
    let lastPageNumber = 1;
    for (let i = 1; i <= lastPageNumber; i++) {
      const pageResponse = await GitHubService._sendGitHubRequest<T[]>(`${url}&page=${i}`, authToken);
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

  private static _sendGitHubRequest = <T>(url: string, authToken: string) => {
    const data = {
      url,
      authToken,
    };

    return sendHttpRequest<T>({
      url: `${Url.serviceHost}api/github/passthrough`,
      method: 'POST',
      data,
    });
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
