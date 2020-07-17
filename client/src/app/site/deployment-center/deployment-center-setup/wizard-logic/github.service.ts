import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Constants, DeploymentCenterConstants, RuntimeStacks, JavaContainers } from 'app/shared/models/constants';
import { CacheService } from 'app/shared/services/cache.service';
import { Guid } from 'app/shared/Utilities/Guid';
import { Observable } from 'rxjs/Observable';
import { FileContent, WorkflowInformation, GitHubActionWorkflowRequestContent, GitHubCommit } from '../../Models/github';
import { BuildSettings, SourceSettings } from './deployment-center-setup-models';
import { Response } from '@angular/http';

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

  fetchRepo(authToken: string, repoUrl: string, repoName: string): Observable<Response> {
    return this._cacheService.post(Constants.serviceHost + `api/github/passthrough?branch=${repoUrl}&t=${Guid.newTinyGuid()}`, true, null, {
      url: `${DeploymentCenterConstants.githubApiUrl}/repos/${repoName}`,
      authToken,
    });
  }

  fetchBranches(authToken: string, repoUrl: string, repoName: string, page?: number): Observable<Response> {
    const url = page
      ? `${DeploymentCenterConstants.githubApiUrl}/repos/${repoName}/branches?per_page=100&page=${page}`
      : `${DeploymentCenterConstants.githubApiUrl}/repos/${repoName}/branches?per_page=100`;

    return this._cacheService.post(Constants.serviceHost + `api/github/passthrough?branch=${repoUrl}&t=${Guid.newTinyGuid()}`, true, null, {
      url,
      authToken,
    });
  }

  fetchBranch(authToken: string, repoUrl: string, repoName: string, branchName: string): Observable<Response> {
    return this._cacheService.post(Constants.serviceHost + `api/github/passthrough?branch=${repoUrl}&t=${Guid.newTinyGuid()}`, true, null, {
      url: `${DeploymentCenterConstants.githubApiUrl}/repos/${repoName}/branches/${branchName}`,
      authToken,
    });
  }

  fetchAllWorkflowConfigurations(authToken: string, repoUrl: string, repoName: string, branchName: string): Observable<FileContent[]> {
    return this._cacheService
      .post(
        Constants.serviceHost + `api/github/passthrough?branch=${repoUrl}/contents/.github/workflows&t=${Guid.newTinyGuid()}`,
        true,
        null,
        {
          url: `${DeploymentCenterConstants.githubApiUrl}/repos/${repoName}/contents/.github/workflows?ref=${branchName}`,
          authToken,
        }
      )
      .map(r => r.json())
      .catch(e => Observable.of(null));
  }

  fetchWorkflowConfiguration(
    authToken: string,
    repoUrl: string,
    repoName: string,
    branchName: string,
    workflowYmlPath: string
  ): Observable<FileContent> {
    return this._cacheService
      .post(
        Constants.serviceHost + `api/github/passthrough?branch=${repoUrl}/contents/${workflowYmlPath}&t=${Guid.newTinyGuid()}`,
        true,
        null,
        {
          url: `${DeploymentCenterConstants.githubApiUrl}/repos/${repoName}/contents/${workflowYmlPath}?ref=${branchName}`,
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

  deleteActionWorkflow(authToken: string, deleteCommit: GitHubCommit) {
    return this._cacheService.post(Constants.serviceHost + `api/github/deleteActionWorkflow`, true, null, {
      authToken,
      deleteCommit,
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

    let content = '';
    const runtimeStackVersion = this._getRuntimeVersion(isLinuxApp, buildSettings);

    switch (buildSettings.runtimeStack) {
      case RuntimeStacks.node:
        content = this._getNodeGithubActionWorkflowDefinition(siteName, slotName, branch, isLinuxApp, secretName, runtimeStackVersion);
        break;
      case RuntimeStacks.python:
        content = isLinuxApp
          ? this._getPythonGithubActionWorkflowDefinitionForLinux(siteName, slotName, branch, secretName, runtimeStackVersion)
          : this._getPythonGithubActionWorkflowDefinitionForWindows(siteName, slotName, branch, secretName, runtimeStackVersion);
        break;
      case RuntimeStacks.dotnetcore:
        content = this._getDotnetCoreGithubActionWorkflowDefinition(
          siteName,
          slotName,
          branch,
          isLinuxApp,
          secretName,
          runtimeStackVersion
        );
        break;
      case RuntimeStacks.java8:
      case RuntimeStacks.java11:
        if (this._isJavaWarBuild(buildSettings)) {
          content = this._getJavaWarGithubActionWorkflowDefinition(siteName, slotName, branch, isLinuxApp, secretName, runtimeStackVersion);
        } else {
          content = this._getJavaJarGithubActionWorkflowDefinition(siteName, slotName, branch, isLinuxApp, secretName, runtimeStackVersion);
        }
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
    const normalizedBranchName = branch.split('/').join('-');
    return slotName ? `${normalizedBranchName}_${siteName}(${slotName}).yml` : `${normalizedBranchName}_${siteName}.yml`;
  }

  private _getRuntimeVersion(isLinuxApp: boolean, buildSettings: BuildSettings) {
    if (buildSettings.runtimeStackRecommendedVersion) {
      return buildSettings.runtimeStackRecommendedVersion;
    } else {
      return isLinuxApp ? buildSettings.runtimeStackVersion.split('|')[1] : buildSettings.runtimeStackVersion;
    }
  }

  private _isJavaWarBuild(buildSettings: BuildSettings) {
    return buildSettings.runtimeStackVersion.toLocaleLowerCase().indexOf(JavaContainers.Tomcat) > -1;
  }

  // TODO(michinoy): Need to implement templated github action workflow generation.
  // Current reference - https://github.com/Azure/actions-workflow-templates
  private _getNodeGithubActionWorkflowDefinition(
    siteName: string,
    slotName: string,
    branch: string,
    isLinuxApp: boolean,
    secretName: string,
    runtimeStackVersion: string
  ) {
    const webAppName = slotName ? `${siteName}(${slotName})` : siteName;
    const slot = slotName || 'production';

    return `# Docs for the Azure Web Apps Deploy action: https://github.com/Azure/webapps-deploy
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy Node.js app to Azure Web App - ${webAppName}

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
        app-name: '${siteName}'
        slot-name: '${slot}'
        publish-profile: \${{ secrets.${secretName} }}
        package: .`;
  }

  // TODO(michinoy): Need to implement templated github action workflow generation.
  // Current reference - https://github.com/Azure/actions-workflow-templates
  private _getPythonGithubActionWorkflowDefinitionForWindows(
    siteName: string,
    slotName: string,
    branch: string,
    secretName: string,
    runtimeStackVersion: string
  ) {
    const webAppName = slotName ? `${siteName}(${slotName})` : siteName;
    const slot = slotName || 'production';

    return `# Docs for the Azure Web Apps Deploy action: https://github.com/Azure/webapps-deploy
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy Python app to Azure Web App - ${webAppName}

on:
  push:
    branches:
      - ${branch}

jobs:
  build-and-deploy:
    runs-on: windows-latest

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
      uses: azure/webapps-deploy@v1
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        publish-profile: \${{ secrets.${secretName} }}
        package: './myapp.zip'`;
  }

  // TODO(michinoy): Need to implement templated github action workflow generation.
  // Current reference - https://github.com/Azure/actions-workflow-templates
  private _getPythonGithubActionWorkflowDefinitionForLinux(
    siteName: string,
    slotName: string,
    branch: string,
    secretName: string,
    runtimeStackVersion: string
  ) {
    const webAppName = slotName ? `${siteName}(${slotName})` : siteName;
    const slot = slotName || 'production';

    return `# Docs for the Azure Web Apps Deploy action: https://github.com/Azure/webapps-deploy
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy Python app to Azure Web App - ${webAppName}

on:
  push:
    branches:
      - ${branch}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@master

    - name: Set up Python version
      uses: actions/setup-python@v1
      with:
        python-version: '${runtimeStackVersion}'

    - name: Build using AppService-Build
      uses: azure/appservice-build@v1
      with:
        platform: python
        platform-version: '${runtimeStackVersion}'

    - name: 'Deploy to Azure Web App'
      uses: azure/webapps-deploy@v1
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        publish-profile: \${{ secrets.${secretName} }}`;
  }

  // TODO(michinoy): Need to implement templated github action workflow generation.
  // Current reference - https://github.com/Azure/actions-workflow-templates
  private _getDotnetCoreGithubActionWorkflowDefinition(
    siteName: string,
    slotName: string,
    branch: string,
    isLinuxApp: boolean,
    secretName: string,
    runtimeStackVersion: string
  ) {
    const webAppName = slotName ? `${siteName}(${slotName})` : siteName;
    const slot = slotName || 'production';

    return `# Docs for the Azure Web Apps Deploy action: https://github.com/Azure/webapps-deploy
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy ASP.Net Core app to Azure Web App - ${webAppName}

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
        app-name: '${siteName}'
        slot-name: '${slot}'
        publish-profile: \${{ secrets.${secretName} }}
        package: \${{env.DOTNET_ROOT}}/myapp `;
  }

  // TODO(michinoy): Need to implement templated github action workflow generation.
  // Current reference - https://github.com/Azure/actions-workflow-templates
  private _getJavaJarGithubActionWorkflowDefinition(
    siteName: string,
    slotName: string,
    branch: string,
    isLinuxApp: boolean,
    secretName: string,
    runtimeStackVersion: string
  ) {
    const webAppName = slotName ? `${siteName}(${slotName})` : siteName;
    const slot = slotName || 'production';

    return `# Docs for the Azure Web Apps Deploy action: https://github.com/Azure/webapps-deploy
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy JAR app to Azure Web App - ${webAppName}

on:
  push:
    branches:
      - ${branch}

jobs:
  build-and-deploy:
    runs-on: ${isLinuxApp ? 'ubuntu-latest' : 'windows-latest'}

    steps:
    - uses: actions/checkout@master

    - name: Set up Java version
      uses: actions/setup-java@v1
      with:
        java-version: '${runtimeStackVersion}'

    - name: Build with Maven
      run: mvn clean install

    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v1
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        publish-profile: \${{ secrets.${secretName} }}
        package: '\${{ github.workspace }}/target/*.jar'`;
  }

  // TODO(michinoy): Need to implement templated github action workflow generation.
  // Current reference - https://github.com/Azure/actions-workflow-templates
  private _getJavaWarGithubActionWorkflowDefinition(
    siteName: string,
    slotName: string,
    branch: string,
    isLinuxApp: boolean,
    secretName: string,
    runtimeStackVersion: string
  ) {
    const webAppName = slotName ? `${siteName}(${slotName})` : siteName;
    const slot = slotName || 'production';

    return `# Docs for the Azure Web Apps Deploy action: https://github.com/Azure/webapps-deploy
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy WAR app to Azure Web App - ${webAppName}

on:
  push:
    branches:
      - ${branch}

jobs:
  build-and-deploy:
    runs-on: ${isLinuxApp ? 'ubuntu-latest' : 'windows-latest'}

    steps:
    - uses: actions/checkout@master

    - name: Set up Java version
      uses: actions/setup-java@v1
      with:
        java-version: '${runtimeStackVersion}'

    - name: Build with Maven
      run: mvn clean install

    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v1
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        publish-profile: \${{ secrets.${secretName} }}
        package: '\${{ github.workspace }}/target/*.war'`;
  }
}
