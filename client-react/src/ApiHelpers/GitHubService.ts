import { Method } from 'axios';

import { HttpResponseObject } from '../ArmHelper.types';
import {
  FileContent,
  GitHubActionWorkflowRequestContent,
  GitHubBranch,
  GitHubCommit,
  GitHubOrganizations,
  GitHubRepository,
  GitHubUser,
} from '../models/github';
import { KeyValue } from '../models/portal-models';
import { ProviderToken } from '../models/provider';
import { CommonConstants } from '../utils/CommonConstants';
import Url from '../utils/url';

import { getLastPageNumberFromLinks, getLinksFromLinkHeader, sendHttpRequest } from './HttpClient';

export default class GitHubService {
  public static authorizeUrl = `${Url.serviceHost}auth/github/authorize`;

  public static getUser = (gitHubToken: string) => {
    const data = {
      gitHubToken,
    };

    return sendHttpRequest<GitHubUser>({ url: `${Url.serviceHost}api/github/getUser`, method: 'POST', data });
  };

  public static getToken = (redirectUrl: string): Promise<HttpResponseObject<ProviderToken>> => {
    const data = {
      redirUrl: redirectUrl,
    };

    return sendHttpRequest<ProviderToken>({ url: `${Url.serviceHost}auth/github/getToken`, method: 'POST', data });
  };

  public static resetToken = (gitHubToken: string): Promise<HttpResponseObject<ProviderToken>> => {
    const data = {
      gitHubToken,
    };
    return sendHttpRequest<ProviderToken>({ url: `${Url.serviceHost}api/github/resetToken`, method: 'PATCH', data });
  };

  public static getOrganizations = (gitHubToken: string, logger?: (page, response) => void) => {
    const data = {
      gitHubToken,
    };
    return GitHubService._getSpecificGitHubObjectList<GitHubOrganizations>(data, 'getOrganizations', 'POST', logger);
  };

  public static getOrgRepositories = async (org: string, gitHubToken: string, logger?: (page, response) => void, searchTerm?: string) => {
    const data = {
      gitHubToken,
      org,
    };

    if (!searchTerm) {
      return GitHubService._getSpecificGitHubObjectList<GitHubRepository>(data, 'getOrgRepositories', 'POST', logger, 2);
    } else {
      return GitHubService._getSpecificGitHubObjectList<GitHubRepository>(
        { ...data, searchTerm },
        'getSearchOrgRepositories',
        'POST',
        logger
      );
    }
  };

  public static getUserRepositories = async (gitHubToken: string, logger?: (page, response) => void, searchTerm?: string) => {
    const data = {
      gitHubToken,
    };

    if (!searchTerm) {
      return GitHubService._getSpecificGitHubObjectList<GitHubRepository>(data, 'getUserRepositories', 'POST', logger, 2);
    } else {
      return GitHubService._getSpecificGitHubObjectList<GitHubRepository>(
        { ...data, searchTerm },
        'getSearchUserRepositories',
        'POST',
        logger
      );
    }
  };

  public static getBranches = async (org: string, repo: string, gitHubToken: string, logger?: (page, response) => void) => {
    const data = {
      gitHubToken,
      org,
      repo,
    };
    return GitHubService._getSpecificGitHubObjectList<GitHubBranch>(data, 'getBranches', 'POST', logger);
  };

  public static getAllWorkflowConfigurations = (org: string, repo: string, branchName: string, gitHubToken: string) => {
    const data = {
      gitHubToken,
      org,
      repo,
      branchName,
    };

    return sendHttpRequest<FileContent[]>({ url: `${Url.serviceHost}api/github/getAllWorkflowConfigurations`, method: 'POST', data });
  };

  public static getWorkflowConfiguration = (
    org: string,
    repo: string,
    branchName: string,
    workflowYmlPath: string,
    gitHubToken: string
  ) => {
    const data = {
      gitHubToken,
      org,
      repo,
      workflowYmlPath,
      branchName,
    };

    return sendHttpRequest<FileContent>({ url: `${Url.serviceHost}api/github/getWorkflowConfiguration`, method: 'POST', data });
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
      gitHubToken,
      repo,
      workflowFileName,
      data: {
        ref: branch,
      },
    };

    return sendHttpRequest<any>({ url: `${Url.serviceHost}api/github/dispatchWorkflow`, method: 'POST', data });
  };

  public static listWorkflowRuns = (gitHubToken: string, org: string, repo: string, workflowFileName: string) => {
    const data = {
      gitHubToken,
      org,
      repo,
      workflowFileName,
      page: 1,
    };

    return sendHttpRequest<any>({ url: `${Url.serviceHost}api/github/listWorkflowRuns`, method: 'POST', data });
  };

  public static deleteWorkflowRun = (gitHubToken: string, org: string, repo: string, runId: number) => {
    const data = {
      gitHubToken,
      org,
      repo,
      runId,
    };

    return sendHttpRequest<any>({ url: `${Url.serviceHost}api/github/deleteWorkflowRun`, method: 'POST', data });
  };

  public static cancelWorkflowRun = (gitHubToken: string, url: string) => {
    const cancelUrlParts = url?.split('/') ?? [];
    const org = !!cancelUrlParts && cancelUrlParts.length > 9 ? cancelUrlParts[4] : '';
    const repo = !!cancelUrlParts && cancelUrlParts.length > 9 ? cancelUrlParts[5] : '';
    const workflowId = !!cancelUrlParts && cancelUrlParts.length > 9 ? cancelUrlParts[8] : '';

    const data = {
      gitHubToken,
      org,
      repo,
      workflowId: workflowId,
    };

    return sendHttpRequest<any>({ url: `${Url.serviceHost}api/github/cancelWorkflowRun`, method: 'POST', data });
  };

  public static getWorkflowFile = (
    appType: string,
    publishType: string,
    os: string,
    variables: KeyValue<string>,
    runtimeStack?: string,
    apiVersion = CommonConstants.ApiVersions.workflowApiVersion20201201
  ) => {
    //(NOTE) stpelleg: This will eventually move to calling an ARM api instead of the functions server
    const url = `${Url.serviceHost}/workflows/generate?api-version=${apiVersion}`;
    const data = {
      appType: appType,
      publishType: publishType,
      os: os,
      runtimeStack: runtimeStack || '',
      variables: variables,
    };

    return sendHttpRequest<string>({ url: url, method: 'POST', data });
  };

  private static _getSpecificGitHubObjectList = async <T>(
    data: any,
    apiName: string,
    method: Method,
    logger?: (page, response) => void,
    maxNumPages?: number
  ) => {
    const githubObjectList: T[] = [];
    let lastPageNumber = 1;
    const MAX_NUM_PAGES = maxNumPages ? maxNumPages : 10;
    for (let page = 1; page <= lastPageNumber; page++) {
      data.page = page;
      const pageResponse = await GitHubService._sendSpecificGitHubRequest<T[]>(data, apiName, method);
      if (pageResponse.metadata.success) {
        githubObjectList.push(...pageResponse.data);

        const linkHeader = pageResponse.metadata.headers.link;
        if (linkHeader) {
          const links = getLinksFromLinkHeader(linkHeader);
          const thisLastPageNumber = getLastPageNumberFromLinks(links);
          lastPageNumber = thisLastPageNumber > MAX_NUM_PAGES ? MAX_NUM_PAGES : thisLastPageNumber;
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
      url: `${Url.serviceHost}api/github/${apiName}`,
      method,
    });
  };
}
