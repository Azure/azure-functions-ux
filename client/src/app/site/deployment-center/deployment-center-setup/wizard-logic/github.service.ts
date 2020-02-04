import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Constants, DeploymentCenterConstants } from 'app/shared/models/constants';
import { CacheService } from 'app/shared/services/cache.service';
import { Guid } from 'app/shared/Utilities/Guid';
import { Observable } from 'rxjs/Observable';
import { FileContent, WorkflowInformation, GitHubActionWorkflowRequestContent } from '../../Models/github';
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

  createOrUpdateActionWorkflow(authToken: string, content: GitHubActionWorkflowRequestContent) {
    return this._cacheService.put(Constants.serviceHost + `api/github/actionWorkflow`, null, {
      authToken,
      content,
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
    const fileName = this.getWorkflowFileName(branch, siteName, slotName);
    const secretName = `AzureAppService_PublishProfile_${secretNameGuid}`;
    const webAppName = slotName ? `${siteName}(${slotName})` : siteName;

    let content = '';
    const runtimeStackVersion =
      buildSettings.runtimeStackVersion && isLinuxApp ? buildSettings.runtimeStackVersion.split('|')[1] : buildSettings.runtimeStackVersion;

    switch (buildSettings.runtimeStack) {
      case 'node':
        content = this._getNodeGithubActionWorkflowDefinition(webAppName, branch, isLinuxApp, secretName, runtimeStackVersion);
        break;
      case 'python':
        content = this._getPythonGithubActionWorkflowDefinition(webAppName, branch, isLinuxApp, secretName, runtimeStackVersion);
        break;
      case 'dotnetcore':
        content = this._getDotnetCoreGithubActionWorkflowDefinition(webAppName, branch, isLinuxApp, secretName, runtimeStackVersion);
        break;
      default:
        throw Error(`Incorrect stack value '${buildSettings.runtimeStack}' provided.`);
    }

    return {
      fileName,
      secretName,
      content: content,
    };
  }

  getWorkflowFileName(branch: string, siteName: string, slotName?: string): string {
    return slotName ? `${branch}_${siteName}(${slotName}).yml` : `${branch}_${siteName}.yml`;
  }

  // TODO(michinoy): Need to implement templated github action workflow generation.
  private _getNodeGithubActionWorkflowDefinition(
    webAppName: string,
    branch: string,
    isLinuxApp: boolean,
    secretName: string,
    runtimeStackVersion: string
  ) {
    return `# Docs for the Azure Web Apps Deploy action: https://github.com/Azure/webapps-deploy
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy Node.js app to Azure Web App

on:
  push:
    branches:
      - ${branch}

jobs:
  build-and-deploy:
    runs-on: ${isLinuxApp ? 'ubuntu-latest' : 'windows-latest'}

    steps:
    - uses: actions/checkout@master

    - name: Set up Node.js version
      uses: actions/setup-node@v1
      with:
        node-version: '${runtimeStackVersion}'

    - name: npm install, build, and test
      run: |
        npm install
        npm run build --if-present
        npm run test --if-present

    - name: 'Deploy to Azure Web App'
      uses: azure/webapps-deploy@v1
      with:
        app-name: '${webAppName}'
        publish-profile: \${{ secrets.${secretName} }}
        package: .`;
  }

  // TODO(michinoy): Need to implement templated github action workflow generation.
  private _getPythonGithubActionWorkflowDefinition(
    webAppName: string,
    branch: string,
    isLinuxApp: boolean,
    secretName: string,
    runtimeStackVersion: string
  ) {
    return `# Docs for the Azure Web Apps Deploy action: https://github.com/Azure/webapps-deploy
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy Python app to Azure Web App

on:
  push:
    branches:
      - ${branch}

jobs:
  build-and-deploy:
    runs-on: ${isLinuxApp ? 'ubuntu-latest' : 'windows-latest'}

    steps:
    - uses: actions/checkout@master

    - name: Set up Python version
      uses: actions/setup-python@v1
      with:
        python-version: '${runtimeStackVersion}'

    - name: Install Python dependencies
      run: |
        python3 -m venv env
        source env/bin/activate
        pip install -r requirements.txt
    - name: Zip the application files
      run: zip -r myapp.zip .

    - name: 'Deploy to Azure Web App'
    - uses: azure/webapps-deploy@v1
      with:
        app-name: '${webAppName}'
        publish-profile: \${{ secrets.${secretName} }}
        package: './myapp.zip'`;
  }

  // TODO(michinoy): Need to implement templated github action workflow generation.
  private _getDotnetCoreGithubActionWorkflowDefinition(
    webAppName: string,
    branch: string,
    isLinuxApp: boolean,
    secretName: string,
    runtimeStackVersion: string
  ) {
    return `# Docs for the Azure Web Apps Deploy action: https://github.com/Azure/webapps-deploy
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy ASP.Net Core app to Azure Web App

on:
  push:
    branches:
      - ${branch}

jobs:
  build-and-deploy:
    runs-on: ${isLinuxApp ? 'ubuntu-latest' : 'windows-latest'}

    steps:
    - uses: actions/checkout@master

    - name: Set up .NET Core
      uses: actions/setup-dotnet@v1
      with:
        dotnet-version: '${runtimeStackVersion}'

    - name: Build with dotnet
      run: dotnet build --configuration Release

    - name: dotnet publish
      run: dotnet publish -c Release -o \${{env.DOTNET_ROOT}}/myapp

    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v1
      with:
        app-name: '${webAppName}'
        publish-profile: \${{ secrets.${secretName} }}
        package: \${{env.DOTNET_ROOT}}/myapp `;
  }
}
