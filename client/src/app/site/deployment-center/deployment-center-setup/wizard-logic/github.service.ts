import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Constants, DeploymentCenterConstants } from 'app/shared/models/constants';
import { CacheService } from 'app/shared/services/cache.service';
import { Guid } from 'app/shared/Utilities/Guid';
import { Observable } from 'rxjs/Observable';
import { FileContent, WorkflowInformation } from '../../Models/github';
import { BuildSettings, SourceSettings } from './deployment-center-setup-models';

@Injectable()
export class GithubService implements OnDestroy {
  private _ngUnsubscribe$ = new Subject();

  constructor(private _cacheService: CacheService) {}

  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
  }

  fetchOrgs(authToken: string) {
    return this._cacheService.post(Constants.serviceHost + 'api/github/passthrough?orgs=', true, null, {
      url: `${DeploymentCenterConstants.githubApiUrl}/user/orgs`,
      authToken,
    });
  }

  fetchUser(authToken: string) {
    return this._cacheService.post(Constants.serviceHost + 'api/github/passthrough?user=', true, null, {
      url: `${DeploymentCenterConstants.githubApiUrl}/user`,
      authToken,
    });
  }

  fetchUserRepos(authToken: string, org: string, page?: number, ownerAccessRequired: boolean = true) {
    let url;

    if (ownerAccessRequired) {
      url = page
        ? `${DeploymentCenterConstants.githubApiUrl}/user/repos?type=owner&page=${page}`
        : `${DeploymentCenterConstants.githubApiUrl}/user/repos?type=owner`;
    } else {
      url = page
        ? `${DeploymentCenterConstants.githubApiUrl}/user/repos?page=${page}`
        : `${DeploymentCenterConstants.githubApiUrl}/user/repos`;
    }

    return this._cacheService.post(Constants.serviceHost + `api/github/passthrough?repo=${org}&t=${Guid.newTinyGuid()}`, true, null, {
      url,
      authToken,
    });
  }

  fetchOrgRepos(authToken: string, org: string, page?: number) {
    const url = page ? `${org}/repos?per_page=100&page=${page}` : `${org}/repos?per_page=100`;

    return this._cacheService.post(Constants.serviceHost + `api/github/passthrough?repo=${org}&t=${Guid.newTinyGuid()}`, true, null, {
      url,
      authToken,
    });
  }

  fetchBranches(authToken: string, repoUrl: string, repoName: string, page?: number) {
    const url = page
      ? `${DeploymentCenterConstants.githubApiUrl}/repos/${repoName}/branches?per_page=100&page=${page}`
      : `${DeploymentCenterConstants.githubApiUrl}/repos/${repoName}/branches?per_page=100`;

    return this._cacheService.post(Constants.serviceHost + `api/github/passthrough?branch=${repoUrl}&t=${Guid.newTinyGuid()}`, true, null, {
      url,
      authToken,
    });
  }

  fetchWorkflowConfiguration(
    authToken: string,
    repoUrl: string,
    repoName: string,
    branchName: string,
    workflowYmlPath: string
  ): Observable<FileContent> {
    const url = `${DeploymentCenterConstants.githubApiUrl}/repos/${repoName}/contents/${workflowYmlPath}?ref=${branchName}`;

    return this._cacheService
      .post(
        Constants.serviceHost + `api/github/passthrough?branch=${repoUrl}/contents/${workflowYmlPath}&t=${Guid.newTinyGuid()}`,
        true,
        null,
        {
          url,
          authToken,
        }
      )
      .map(r => r.json())
      .catch(e => Observable.of(null));
  }

  commitWorkflowConfiguration(authToken: string, repoName: string, workflowYmlPath: string, content: any) {
    const url = `${DeploymentCenterConstants.githubApiUrl}/repos/${repoName}/contents/${workflowYmlPath}`;

    return this._cacheService.put(Constants.serviceHost + `api/github/fileContent`, null, {
      url,
      content,
      authToken,
    });
  }

  getWorkflowInformation(
    buildSettings: BuildSettings,
    sourceSettings: SourceSettings,
    isLinuxApp: boolean,
    secretNameGuid: string,
    siteName: string,
    slotName?: string
  ): WorkflowInformation {
    const branch = sourceSettings.branch || 'master';
    const fileName = slotName ? `${branch}_${siteName}(${slotName}).yml` : `${branch}_${siteName}.yml`;
    const secretName = `AzureAppService_PublishProfile_${secretNameGuid}`;
    const webAppName = slotName ? `${siteName}(${slotName})` : siteName;
    const virtualEnvironment = isLinuxApp ? 'ubuntu-latest' : 'windows-latest';

    let content = '';

    // TODO(michinoy): Need to implement stack specific definition generation.
    switch (buildSettings.applicationFramework) {
      case 'Node':
        content = this._getNodeGithubActionWorkflowDefinition(webAppName, branch, virtualEnvironment, secretName);
        break;
      default:
        content = this._getDefaultGithubActionWorkflowDefinition(webAppName, branch, virtualEnvironment, secretName);
        break;
    }

    return {
      fileName,
      secretName,
      content: content,
    };
  }

  // TODO(michinoy): Need to implement templated github action workflow generation.
  private _getNodeGithubActionWorkflowDefinition(webAppName: string, branch: string, virtualEnvironment: string, secretName: string) {
    return `# Azure Web App: ${webAppName}
on:
  push:
    branches:
      - ${branch}
jobs:
  build-and-deploy:
    runs-on: ${virtualEnvironment}
    steps:
    # checkout the repo
    - uses: actions/checkout@master
    # install dependencies, build, and test
    - name: npm install, build, and test
      run: |
        npm install
        npm run build --if-present
        npm run test --if-present
    # deploy web app using publish profile credentials
    - uses: azure/appservice-actions/webapp@master
      with:
        app-name: ${webAppName}
        package: '.'
        publish-profile: \${{ secrets.${secretName} }}`;
  }

  // TODO(michinoy): Need to implement templated github action workflow generation.
  private _getDefaultGithubActionWorkflowDefinition(webAppName: string, branch: string, virtualEnvironment: string, secretName: string) {
    return `# Azure Web App: ${webAppName}
on:
  push:
    branches:
      - ${branch}
jobs:
  build-and-deploy:
    runs-on: ${virtualEnvironment}
    steps:
    # checkout the repo
    - uses: actions/checkout@master
    # deploy web app using publish profile credentials
    - uses: azure/appservice-actions/webapp@master
      with:
        app-name: ${webAppName}
        publish-profile: \${{ secrets.${secretName} }}`;
  }
}
