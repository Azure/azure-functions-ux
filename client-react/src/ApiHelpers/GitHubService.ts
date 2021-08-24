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
import { Method } from 'axios';

export default class GitHubService {
  public static serviceHost = GitHubService.serviceHost.replace('44400', '44300');
  public static authorizeUrl = `${GitHubService.serviceHost}auth/github/authorize`;

  public static getUser = (gitHubToken: string) => {
    const data = {
      url: 'https://api.github.com/user',
      gitHubToken,
    };

    return sendHttpRequest<GitHubUser>({ url: `${GitHubService.serviceHost}api/github/passthrough`, method: 'POST', data });
  };

  public static getUserWithoutPassthrough = (gitHubToken: string) => {
    const data = {
      gitHubToken,
    };

    return sendHttpRequest<GitHubUser>({ url: `${GitHubService.serviceHost}api/github/getUser`, method: 'POST', data });
  };

  public static getToken = (redirectUrl: string): Promise<HttpResponseObject<ProviderToken>> => {
    const data = {
      redirUrl: redirectUrl,
    };

    return sendHttpRequest<ProviderToken>({ url: `${GitHubService.serviceHost}auth/github/getToken`, method: 'POST', data });
  };

  public static resetToken = (gitHubToken: string): Promise<HttpResponseObject<ProviderToken>> => {
    const data = {
      gitHubToken,
    };
    return sendHttpRequest<ProviderToken>({ url: `${GitHubService.serviceHost}api/github/resetToken`, method: 'PATCH', data });
  };

  public static getOrganizations = (gitHubToken: string) => {
    const data = {
      url: 'https://api.github.com/user/orgs',
      gitHubToken,
    };

    return sendHttpRequest<GitHubOrganizations[]>({ url: `${GitHubService.serviceHost}api/github/passthrough`, method: 'POST', data });
  };

  public static getOrganizationsWithoutPassthrough = (gitHubToken: string, logger?: (page, response) => void) => {
    const data = {
      gitHubToken,
    };
    return GitHubService._getSpecificGitHubObjectList<GitHubOrganizations>(data, 'getOrganizations', 'POST', logger);
  };

  public static getOrgRepositories = async (repositories_url: string, gitHubToken: string, logger?: (page, response) => void) => {
    return GitHubService._getGitHubObjectList<GitHubRepository>(`${repositories_url}/repos?per_page=100`, gitHubToken, logger);
  };

  public static getOrgRepositoriesWithoutPassthrough = async (org: string, gitHubToken: string, logger?: (page, response) => void) => {
    const data = {
      gitHubToken,
      org,
    };
    return GitHubService._getSpecificGitHubObjectList<GitHubRepository>(data, 'getOrgRepositories', 'POST', logger);
  };

  public static getUserRepositories = async (gitHubToken: string, logger?: (page, response) => void) => {
    return GitHubService._getGitHubObjectList<GitHubRepository>(
      `${DeploymentCenterConstants.githubApiUrl}/user/repos?type=owner`,
      gitHubToken,
      logger
    );
  };

  public static getUserRepositoriesWithoutPassthrough = async (gitHubToken: string, logger?: (page, response) => void) => {
    const data = {
      gitHubToken,
    };
    return GitHubService._getSpecificGitHubObjectList<GitHubRepository>(data, 'getUserRepositories', 'POST', logger);
  };

  public static getBranches = async (org: string, repo: string, gitHubToken: string, logger?: (page, response) => void) => {
    return GitHubService._getGitHubObjectList<GitHubBranch>(
      `${DeploymentCenterConstants.githubApiUrl}/repos/${org}/${repo}/branches?per_page=100`,
      gitHubToken,
      logger
    );
  };

  public static getBranchesWithoutPassthrough = async (
    org: string,
    repo: string,
    gitHubToken: string,
    logger?: (page, response) => void
  ) => {
    const data = {
      gitHubToken,
      org,
      repo,
    };
    return GitHubService._getSpecificGitHubObjectList<GitHubBranch>(data, 'getBranches', 'POST', logger);
  };

  public static getAllWorkflowConfigurations = (org: string, repo: string, branchName: string, gitHubToken: string) => {
    const data = {
      url: `${DeploymentCenterConstants.githubApiUrl}/repos/${org}/${repo}/contents/.github/workflows?ref=${branchName}`,
      gitHubToken,
    };

    return sendHttpRequest<FileContent[]>({ url: `${GitHubService.serviceHost}api/github/passthrough`, method: 'POST', data });
  };

  public static getAllWorkflowConfigurationsWithoutPassthrough = (org: string, repo: string, branchName: string, gitHubToken: string) => {
    const data = {
      gitHubToken,
      org,
      repo,
      branchName,
    };

    return sendHttpRequest<FileContent[]>({
      url: `${GitHubService.serviceHost}api/github/getAllWorkflowConfigurations`,
      method: 'POST',
      data,
    });
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

    return sendHttpRequest<FileContent>({ url: `${GitHubService.serviceHost}api/github/passthrough`, method: 'POST', data });
  };

  public static getWorkflowConfigurationWithoutPassthrough = (
    org: string,
    repo: string,
    branchName: string,
    workflowYmlPath: string,
    gitHubToken: string
  ) => {
    const data = {
      url: `${DeploymentCenterConstants.githubApiUrl}/repos/${org}/${repo}/contents/${workflowYmlPath}?ref=${branchName}`,
      gitHubToken,
      org,
      repo,
      workflowYmlPath,
      branchName,
    };

    return sendHttpRequest<FileContent>({ url: `${GitHubService.serviceHost}api/github/getWorkflowConfiguration`, method: 'POST', data });
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

    return sendHttpRequest<void>({ url: `${GitHubService.serviceHost}api/github/deleteActionWorkflow`, method: 'POST', data });
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

    return sendHttpRequest<void>({ url: `${GitHubService.serviceHost}api/github/actionWorkflow`, method: 'PUT', data });
  };

  public static dispatchWorkflow = (gitHubToken: string, branch: string, repo: string, workflowFileName: string) => {
    const data = {
      url: `${DeploymentCenterConstants.githubApiUrl}/repos/${repo}/actions/workflows/${workflowFileName}/dispatches`,
      gitHubToken,
      data: {
        ref: branch,
      },
    };

    return sendHttpRequest<any>({ url: `${GitHubService.serviceHost}api/github/dispatchWorkflow`, method: 'POST', data });
  };

  public static listWorkflowRuns = (gitHubToken: string, org: string, repo: string, workflowFileName: string) => {
    const url = `${DeploymentCenterConstants.githubApiUrl}/repos/${org}/${repo}/actions/workflows/${workflowFileName}/runs?page=1`;
    const data = {
      url,
      gitHubToken,
    };

    return sendHttpRequest<any>({ url: `${GitHubService.serviceHost}api/github/passthrough`, method: 'POST', data });
  };

  public static listWorkflowRunsWithoutPassthrough = (gitHubToken: string, org: string, repo: string, workflowFileName: string) => {
    const data = {
      gitHubToken,
      org,
      repo,
      workflowFileName,
      page: 1,
    };

    return sendHttpRequest<any>({ url: `${GitHubService.serviceHost}api/github/listWorkflowRuns`, method: 'POST', data });
  };

  public static cancelWorkflowRun = (gitHubToken: string, url: string) => {
    const data = {
      url,
      gitHubToken,
      method: 'POST',
    };

    return sendHttpRequest<any>({ url: `${GitHubService.serviceHost}api/github/passthrough`, method: 'POST', data });
  };

  public static cancelWorkflowRunWithoutPassthorugh = (gitHubToken: string, url: string) => {
    const cancelUrlParts = !!url ? url.split('/') : [];
    const org = !!cancelUrlParts && cancelUrlParts.length > 9 ? cancelUrlParts[4] : '';
    const repo = !!cancelUrlParts && cancelUrlParts.length > 9 ? cancelUrlParts[5] : '';
    const workflowId = !!cancelUrlParts && cancelUrlParts.length > 9 ? cancelUrlParts[8] : '';

    const data = {
      gitHubToken,
      org,
      repo,
      workflowId: workflowId,
    };

    return sendHttpRequest<any>({ url: `${GitHubService.serviceHost}api/github/cancelWorkflowRun`, method: 'POST', data });
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
      url: `${GitHubService.serviceHost}api/github/passthrough`,
      method: 'POST',
    });
  };

  private static _getSpecificGitHubObjectList = async <T>(
    data: any,
    apiName: string,
    method: Method,
    logger?: (page, response) => void
  ) => {
    const githubObjectList: T[] = [];
    let lastPageNumber = 1;
    for (let page = 1; page <= lastPageNumber; page++) {
      data.page = page;
      const pageResponse = await GitHubService._sendSpecificGitHubRequest<T[]>(data, apiName, method);
      if (pageResponse.metadata.success) {
        githubObjectList.push(...pageResponse.data);

        const linkHeader = pageResponse.metadata.headers.link;
        if (linkHeader) {
          const links = getLinksFromLinkHeader(linkHeader);
          const thisLastPageNumber = getLastPageNumberFromLinks(links);
          lastPageNumber = thisLastPageNumber > 10 ? 10 : thisLastPageNumber;
        }
      } else if (logger) {
        logger(page, pageResponse);
      }
    }

    return githubObjectList;
  };

  private static _sendSpecificGitHubRequest = <T>(data: any, apiName: string, method: Method) => {
    return sendHttpRequest<T>({
      data,
      url: `${GitHubService.serviceHost}api/github/${apiName}`,
      method,
    });
  };
}
