import {
  CodeWorkflowInformation,
  ContainerWorkflowInformation,
  WorkflowOption,
  SiteSourceControlRequestBody,
} from '../DeploymentCenter.types';
import { RuntimeStacks, JavaContainers } from '../../../../utils/stacks-utils';
import { getWorkflowFileName, getLogId } from './DeploymentCenterUtility';
import DeploymentCenterData from '../DeploymentCenter.data';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { DeploymentCenterConstants } from '../DeploymentCenterConstants';

export const updateGitHubActionSourceControlPropertiesManually = async (
  deploymentCenterData: DeploymentCenterData,
  resourceId: string,
  payload: SiteSourceControlRequestBody
) => {
  // NOTE(michinoy): To be on the safe side, the update operations should be sequential rather than
  // parallel. The reason behind this is because incase the metadata update fails, but the scmtype is updated
  // the /sourcecontrols API GET will start failing.

  const fetchExistingMetadataResponse = await deploymentCenterData.getConfigMetadata(resourceId);

  if (!fetchExistingMetadataResponse.metadata.success) {
    LogService.error(LogCategories.deploymentCenter, getLogId('GitHubActionUtility', 'updateGitHubActionSourceControlPropertiesManually'), {
      error: fetchExistingMetadataResponse.metadata.error,
    });

    return fetchExistingMetadataResponse;
  }

  const properties = fetchExistingMetadataResponse.data.properties;
  delete properties['RepoUrl'];
  delete properties['ScmUri'];
  delete properties['CloneUri'];
  delete properties['branch'];

  properties['RepoUrl'] = payload.repoUrl;
  properties['branch'] = payload.branch;

  const updateMetadataResponse = await deploymentCenterData.updateConfigMetadata(resourceId, properties);

  if (!updateMetadataResponse.metadata.success) {
    LogService.error(LogCategories.deploymentCenter, getLogId('GitHubActionUtility', 'updateGitHubActionSourceControlPropertiesManually'), {
      error: updateMetadataResponse.metadata.error,
    });

    return updateMetadataResponse;
  }

  const patchSiteConfigResponse = await deploymentCenterData.patchSiteConfig(resourceId, {
    properties: {
      scmType: 'GitHubAction',
    },
  });

  if (!patchSiteConfigResponse.metadata.success) {
    LogService.error(LogCategories.deploymentCenter, getLogId('GitHubActionUtility', 'updateGitHubActionSourceControlPropertiesManually'), {
      error: patchSiteConfigResponse.metadata.error,
    });
  }

  return patchSiteConfigResponse;
};

// Detect the specific error which is indicative of Ant89 Geo/Stamp sync issues.
export const isApiSyncError = (error?: any): boolean => {
  return (
    error &&
    error.Message &&
    error.Message.indexOf &&
    error.Message.indexOf('500 (InternalServerError)') > -1 &&
    error.Message.indexOf('GeoRegionServiceClient') > -1
  );
};

export const isWorkflowOptionExistingOrAvailable = (workflowOption: string): boolean => {
  return workflowOption === WorkflowOption.UseExistingWorkflowConfig || workflowOption === WorkflowOption.UseAvailableWorkflowConfigs;
};

export const getContainerAppWorkflowInformation = (
  serverUrl: string,
  image: string,
  branch: string,
  publishingProfileSecretNameGuid: string,
  containerUsernameSecretNameGuid: string,
  containerPasswordSecretNameGuid: string,
  siteName: string,
  slotName: string
): ContainerWorkflowInformation => {
  const fileName = getWorkflowFileName(branch, siteName, slotName);
  const publishingProfileSecretName = `AzureAppService_PublishProfile_${publishingProfileSecretNameGuid}`;
  const containerUsernameSecretName = `AzureAppService_ContainerUsername_${containerUsernameSecretNameGuid}`;
  const containerPasswordSecretName = `AzureAppService_ContainerPassword_${containerPasswordSecretNameGuid}`;

  const content = getContainerGithubActionWorkflowDefinition(
    siteName,
    slotName,
    branch,
    publishingProfileSecretName,
    containerUsernameSecretName,
    containerPasswordSecretName,
    serverUrl,
    image
  );

  return {
    fileName,
    content,
    publishingProfileSecretName,
    containerUsernameSecretName,
    containerPasswordSecretName,
  };
};

export const getCodeWebAppWorkflowInformation = (
  runtimeStack: string,
  runtimeVersion: string,
  runtimeStackRecommendedVersion: string,
  branch: string,
  isLinuxApp: boolean,
  secretNameGuid: string,
  siteName: string,
  slotName: string,
  javaContainer?: string
): CodeWorkflowInformation => {
  const repoBranch = branch || 'master';
  const fileName = getWorkflowFileName(repoBranch, siteName, slotName);
  const secretName = `AzureAppService_PublishProfile_${secretNameGuid}`;

  let content = '';
  const runtimeStackVersion = getRuntimeVersion(isLinuxApp, runtimeVersion, runtimeStackRecommendedVersion);

  switch (runtimeStack) {
    case RuntimeStacks.node:
      content = getNodeGithubActionWorkflowDefinition(siteName, slotName, repoBranch, isLinuxApp, secretName, runtimeStackVersion);
      break;
    case RuntimeStacks.python:
      content = isLinuxApp
        ? getPythonGithubActionWorkflowDefinitionForLinux(siteName, slotName, repoBranch, secretName, runtimeStackVersion)
        : getPythonGithubActionWorkflowDefinitionForWindows(siteName, slotName, repoBranch, secretName, runtimeStackVersion);
      break;
    case RuntimeStacks.dotnetcore:
      content = getDotnetCoreGithubActionWorkflowDefinition(siteName, slotName, repoBranch, isLinuxApp, secretName, runtimeStackVersion);
      break;
    case RuntimeStacks.java:
      // NOTE(michinoy): In case of Java, if the container is tomcat, set up the workflow to produce a WAR package. Else to be on the
      // safe side produce a JAR package. Internally they are both MAVEN builds.
      if (javaContainer === JavaContainers.Tomcat) {
        content = getJavaWarGithubActionWorkflowDefinition(siteName, slotName, repoBranch, isLinuxApp, secretName, runtimeStackVersion);
      } else {
        content = getJavaJarGithubActionWorkflowDefinition(siteName, slotName, repoBranch, isLinuxApp, secretName, runtimeStackVersion);
      }
      break;
    case RuntimeStacks.aspnet:
      // NOTE(michinoy): In case of version 5, generate the dotnet core workflow file.
      content =
        runtimeVersion === '5' || runtimeVersion.toLocaleLowerCase() === 'v5.0'
          ? getDotnetCoreGithubActionWorkflowDefinition(siteName, slotName, repoBranch, isLinuxApp, secretName, runtimeStackVersion)
          : getAspNetGithubActionWorkflowDefinition(siteName, slotName, repoBranch, secretName, runtimeStackVersion);
      break;
    default:
      throw Error(`Incorrect stack value '${runtimeStack}' provided.`);
  }

  return {
    fileName,
    secretName,
    content,
  };
};

export const getCodeFunctionAppCodeWorkflowInformation = (
  runtimeStack: string,
  runtimeVersion: string,
  runtimeStackRecommendedVersion: string,
  branch: string,
  isLinuxApp: boolean,
  secretNameGuid: string,
  siteName: string,
  slotName: string
): CodeWorkflowInformation => {
  const repoBranch = branch || 'master';
  const fileName = getWorkflowFileName(repoBranch, siteName, slotName);
  const secretName = `AzureAppService_PublishProfile_${secretNameGuid}`;

  let content = '';
  const runtimeStackVersion = getRuntimeVersion(isLinuxApp, runtimeVersion, runtimeStackRecommendedVersion);

  switch (runtimeStack) {
    case RuntimeStacks.node:
      content = isLinuxApp
        ? getFunctionAppNodeLinuxWorkflow(siteName, slotName, repoBranch, secretName, runtimeStackVersion)
        : getFunctionAppNodeWindowsWorkflow(siteName, slotName, repoBranch, secretName, runtimeStackVersion);
      break;
    case RuntimeStacks.python:
      content = getFunctionAppPythonLinuxWorkflow(siteName, slotName, repoBranch, secretName, runtimeStackVersion);
      break;
    case RuntimeStacks.dotnetcore:
      content = isLinuxApp
        ? getFunctionAppDotNetCoreLinuxWorkflow(siteName, slotName, repoBranch, secretName, runtimeStackVersion)
        : getFunctionAppDotNetCoreWindowsWorkflow(siteName, slotName, repoBranch, secretName, runtimeStackVersion);
      break;
    case RuntimeStacks.java:
      content = isLinuxApp
        ? getFunctionAppJavaLinuxWorkflow(siteName, slotName, repoBranch, secretName, runtimeStackVersion)
        : getFunctionAppJavaWindowsWorkflow(siteName, slotName, repoBranch, secretName, runtimeStackVersion);
      break;
    case RuntimeStacks.powershell:
      content = getFunctionAppPowershellWindowsWorkflow(siteName, slotName, repoBranch, secretName, runtimeStackVersion);
      break;
    default:
      throw Error(`Incorrect stack value '${runtimeStack}' provided.`);
  }

  return {
    fileName,
    secretName,
    content,
  };
};

const getRuntimeVersion = (isLinuxApp: boolean, runtimeVersion: string, runtimeStackRecommendedVersion: string) => {
  if (runtimeStackRecommendedVersion) {
    return runtimeStackRecommendedVersion;
  } else {
    return isLinuxApp ? runtimeVersion.split('|')[1] : runtimeVersion;
  }
};

// TODO(michinoy): Need to implement templated github action workflow generation.
// Current reference - https://github.com/Azure/actions-workflow-templates
const getNodeGithubActionWorkflowDefinition = (
  siteName: string,
  slotName: string,
  branch: string,
  isLinuxApp: boolean,
  secretName: string,
  runtimeStackVersion: string
) => {
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
      uses: azure/webapps-deploy@v2
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        publish-profile: \${{ secrets.${secretName} }}
        package: .`;
};

// TODO(michinoy): Need to implement templated github action workflow generation.
// Current reference - https://github.com/Azure/actions-workflow-templates
const getPythonGithubActionWorkflowDefinitionForWindows = (
  siteName: string,
  slotName: string,
  branch: string,
  secretName: string,
  runtimeStackVersion: string
) => {
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
        python -m venv env
        .\\env\\Scripts\\activate
        pip install -r requirements.txt

    - name: Zip the application files
      run: Compress-Archive .\\* app.zip

    - name: 'Deploy to Azure Web App'
      uses: azure/webapps-deploy@v2
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        publish-profile: \${{ secrets.${secretName} }}
        package: '.\\app.zip'`;
};

// TODO(michinoy): Need to implement templated github action workflow generation.
// Current reference - https://github.com/Azure/actions-workflow-templates
const getPythonGithubActionWorkflowDefinitionForLinux = (
  siteName: string,
  slotName: string,
  branch: string,
  secretName: string,
  runtimeStackVersion: string
) => {
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
      uses: azure/appservice-build@v2
      with:
        platform: python
        platform-version: '${runtimeStackVersion}'

    - name: 'Deploy to Azure Web App'
      uses: azure/webapps-deploy@v2
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        publish-profile: \${{ secrets.${secretName} }}`;
};

// TODO(michinoy): Need to implement templated github action workflow generation.
// Current reference - https://github.com/Azure/actions-workflow-templates
const getDotnetCoreGithubActionWorkflowDefinition = (
  siteName: string,
  slotName: string,
  branch: string,
  isLinuxApp: boolean,
  secretName: string,
  runtimeStackVersion: string
) => {
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
      uses: azure/webapps-deploy@v2
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        publish-profile: \${{ secrets.${secretName} }}
        package: \${{env.DOTNET_ROOT}}/myapp `;
};

// TODO(michinoy): Need to implement templated github action workflow generation.
// Current reference - https://github.com/Azure/actions-workflow-templates
const getJavaJarGithubActionWorkflowDefinition = (
  siteName: string,
  slotName: string,
  branch: string,
  isLinuxApp: boolean,
  secretName: string,
  runtimeStackVersion: string
) => {
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
      uses: azure/webapps-deploy@v2
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        publish-profile: \${{ secrets.${secretName} }}
        package: '\${{ github.workspace }}/target/*.jar'`;
};

// TODO(michinoy): Need to implement templated github action workflow generation.
// Current reference - https://github.com/Azure/actions-workflow-templates
const getJavaWarGithubActionWorkflowDefinition = (
  siteName: string,
  slotName: string,
  branch: string,
  isLinuxApp: boolean,
  secretName: string,
  runtimeStackVersion: string
) => {
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
      uses: azure/webapps-deploy@v2
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        publish-profile: \${{ secrets.${secretName} }}
        package: '\${{ github.workspace }}/target/*.war'`;
};

// TODO(michinoy): Need to implement templated github action workflow generation.
// Current reference - https://github.com/Azure/actions-workflow-templates
const getAspNetGithubActionWorkflowDefinition = (
  siteName: string,
  slotName: string,
  branch: string,
  secretName: string,
  runtimeStackVersion: string
) => {
  const webAppName = slotName ? `${siteName}(${slotName})` : siteName;
  const slot = slotName || 'production';

  return `# Docs for the Azure Web Apps Deploy action: https://github.com/Azure/webapps-deploy
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy ASP app to Azure Web App - ${webAppName}

on:
  push:
    branches:
      - ${branch}

jobs:
  build-and-deploy:
    runs-on: 'windows-latest'

    steps:
    - uses: actions/checkout@master

    - name: Setup MSBuild path
      uses: microsoft/setup-msbuild@v1.0.0

    - name: Setup NuGet
      uses: NuGet/setup-nuget@v1.0.2

    - name: Restore NuGet packages
      run: nuget restore

    - name: Publish to folder
      run: msbuild /nologo /verbosity:m /t:Build /t:pipelinePreDeployCopyAllFilesToOneFolder /p:_PackageTempDir="\\published\\"

    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        publish-profile: \${{ secrets.${secretName} }}
        package: \\published\\`;
};

// TODO(michinoy): Need to implement templated github action workflow generation.
// Current reference - https://github.com/Azure/actions-workflow-templates
const getContainerGithubActionWorkflowDefinition = (
  siteName: string,
  slotName: string,
  branch: string,
  publishingProfileSecretName: string,
  containerUsernameSecretName: string,
  containerPasswordSecretName: string,
  serverUrl: string,
  image: string
) => {
  const webAppName = slotName ? `${siteName}(${slotName})` : siteName;
  const slot = slotName || 'production';
  const loginServer = serverUrl.toLocaleLowerCase();

  // NOTE(michinoy): For dockerHub the server URL contains /v1 at the end.
  // The server used in the image should not have that part.
  const server =
    loginServer.indexOf(DeploymentCenterConstants.dockerHubServerUrlHost) > -1
      ? DeploymentCenterConstants.dockerHubServerUrlHost
      : loginServer.replace('https://', '');

  return `# Docs for the Azure Web Apps Deploy action: https://github.com/Azure/webapps-deploy
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy container app to Azure Web App - ${webAppName}

on:
  push:
    branches:
      - ${branch}

jobs:
  build-and-deploy:
    runs-on: 'ubuntu-latest'

    steps:
    - uses: actions/checkout@master

    - uses: azure/docker-login@v1
      with:
        login-server: ${loginServer}/
        username: \${{ secrets.${containerUsernameSecretName} }}
        password: \${{ secrets.${containerPasswordSecretName} }}

    - run: |
        docker build . -t ${server}/\${{ secrets.${containerUsernameSecretName} }}/${image}:\${{ github.sha }}
        docker push ${server}/\${{ secrets.${containerUsernameSecretName} }}/${image}:\${{ github.sha }}

    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        publish-profile: \${{ secrets.${publishingProfileSecretName} }}
        images: '${server}/\${{ secrets.${containerUsernameSecretName} }}/${image}:\${{ github.sha }}'`;
};

const getFunctionAppDotNetCoreWindowsWorkflow = (
  siteName: string,
  slotName: string,
  branch: string,
  secretName: string,
  runtimeStackVersion: string
) => {
  const webAppName = slotName ? `${siteName}(${slotName})` : siteName;
  const slot = slotName || 'production';

  return `# Docs for the Azure Web Apps Deploy action: https://github.com/azure/functions-action
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy dotnet core app to Azure Function App - ${webAppName}

on:
  push:
    branches:
      - ${branch}

env:
  AZURE_FUNCTIONAPP_PACKAGE_PATH: '.' # set this to the path to your web app project, defaults to the repository root
  DOTNET_VERSION: '${runtimeStackVersion}'  # set this to the dotnet version to use

jobs:
  build-and-deploy:
    runs-on: windows-latest
    steps:
    - name: 'Checkout GitHub Action'
      uses: actions/checkout@master

    - name: Setup DotNet \${{ env.DOTNET_VERSION }} Environment
      uses: actions/setup-dotnet@v1
      with:
        dotnet-version: \${{ env.DOTNET_VERSION }}

    - name: 'Resolve Project Dependencies Using Dotnet'
      shell: pwsh
      run: |
        pushd './\${{ env.AZURE_FUNCTIONAPP_PACKAGE_PATH }}'
        dotnet build --configuration Release --output ./output
        popd

    - name: 'Run Azure Functions Action'
      uses: Azure/functions-action@v1
      id: fa
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        package: '\${{ env.AZURE_FUNCTIONAPP_PACKAGE_PATH }}/output'
        publish-profile: \${{ secrets.${secretName} }}
  `;
};

const getFunctionAppDotNetCoreLinuxWorkflow = (
  siteName: string,
  slotName: string,
  branch: string,
  secretName: string,
  runtimeStackVersion: string
) => {
  const webAppName = slotName ? `${siteName}(${slotName})` : siteName;
  const slot = slotName || 'production';

  return `# Docs for the Azure Web Apps Deploy action: https://github.com/azure/functions-action
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy dotnet core project to Azure Function App - ${webAppName}

on:
  push:
    branches:
      - ${branch}

env:
  AZURE_FUNCTIONAPP_PACKAGE_PATH: '.' # set this to the path to your web app project, defaults to the repository root
  DOTNET_VERSION: '${runtimeStackVersion}'  # set this to the dotnet version to use

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: 'Checkout GitHub Action'
      uses: actions/checkout@master

    - name: Setup DotNet \${{ env.DOTNET_VERSION }} Environment
      uses: actions/setup-dotnet@v1
      with:
        dotnet-version: \${{ env.DOTNET_VERSION }}

    - name: 'Resolve Project Dependencies Using Dotnet'
      shell: bash
      run: |
        pushd './\${{ env.AZURE_FUNCTIONAPP_PACKAGE_PATH }}'
        dotnet build --configuration Release --output ./output
        popd

    - name: 'Run Azure Functions Action'
      uses: Azure/functions-action@v1
      id: fa
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        package: '\${{ env.AZURE_FUNCTIONAPP_PACKAGE_PATH }}/output'
        publish-profile: \${{ secrets.${secretName} }}`;
};

const getFunctionAppNodeWindowsWorkflow = (
  siteName: string,
  slotName: string,
  branch: string,
  secretName: string,
  runtimeStackVersion: string
) => {
  const webAppName = slotName ? `${siteName}(${slotName})` : siteName;
  const slot = slotName || 'production';

  return `# Docs for the Azure Web Apps Deploy action: https://github.com/azure/functions-action
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy Node.js project to Azure Function App - ${webAppName}

on:
  push:
    branches:
      - ${branch}

env:
  AZURE_FUNCTIONAPP_PACKAGE_PATH: '.' # set this to the path to your web app project, defaults to the repository root
  NODE_VERSION: '${runtimeStackVersion}' # set this to the node version to use (supports 8.x, 10.x, 12.x)

jobs:
  build-and-deploy:
    runs-on: windows-latest
    steps:
    - name: 'Checkout GitHub Action'
      uses: actions/checkout@master

    - name: Setup Node \${{ env.NODE_VERSION }} Environment
      uses: actions/setup-node@v1
      with:
        node-version: \${{ env.NODE_VERSION }}

    - name: 'Resolve Project Dependencies Using Npm'
      shell: pwsh
      run: |
        pushd './\${{ env.AZURE_FUNCTIONAPP_PACKAGE_PATH }}'
        npm install
        npm run build --if-present
        npm run test --if-present
        popd

    - name: 'Run Azure Functions Action'
      uses: Azure/functions-action@v1
      id: fa
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        package: \${{ env.AZURE_FUNCTIONAPP_PACKAGE_PATH }}
        publish-profile: \${{ secrets.${secretName} }}`;
};

const getFunctionAppNodeLinuxWorkflow = (
  siteName: string,
  slotName: string,
  branch: string,
  secretName: string,
  runtimeStackVersion: string
) => {
  const webAppName = slotName ? `${siteName}(${slotName})` : siteName;
  const slot = slotName || 'production';

  return `# Docs for the Azure Web Apps Deploy action: https://github.com/azure/functions-action
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy Node.js project to Azure Function App - ${webAppName}

on:
  push:
    branches:
      - ${branch}

env:
  AZURE_FUNCTIONAPP_PACKAGE_PATH: '.' # set this to the path to your web app project, defaults to the repository root
  NODE_VERSION: '${runtimeStackVersion}' # set this to the node version to use (supports 8.x, 10.x, 12.x)

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: 'Checkout GitHub Action'
      uses: actions/checkout@master

    - name: Setup Node \${{ env.NODE_VERSION }} Environment
      uses: actions/setup-node@v1
      with:
        node-version: \${{ env.NODE_VERSION }}

    - name: 'Resolve Project Dependencies Using Npm'
      shell: bash
      run: |
        pushd './\${{ env.AZURE_FUNCTIONAPP_PACKAGE_PATH }}'
        npm install
        npm run build --if-present
        npm run test --if-present
        popd

    - name: 'Run Azure Functions Action'
      uses: Azure/functions-action@v1
      id: fa
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        package: \${{ env.AZURE_FUNCTIONAPP_PACKAGE_PATH }}
        publish-profile: \${{ secrets.${secretName} }}`;
};

const getFunctionAppPowershellWindowsWorkflow = (
  siteName: string,
  slotName: string,
  branch: string,
  secretName: string,
  runtimeStackVersion: string
) => {
  const webAppName = slotName ? `${siteName}(${slotName})` : siteName;
  const slot = slotName || 'production';

  return `# Docs for the Azure Web Apps Deploy action: https://github.com/azure/functions-action
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy Powershell project to Azure Function App - ${webAppName}

on:
  push:
    branches:
      - ${branch}

env:
  AZURE_FUNCTIONAPP_PACKAGE_PATH: '.' # set this to the path to your web app project, defaults to the repository root

jobs:
  build-and-deploy:
    runs-on: windows-latest
    steps:
    - name: 'Checkout GitHub Action'
      uses: actions/checkout@master

    - name: 'Run Azure Functions Action'
      uses: Azure/functions-action@v1
      id: fa
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        package: \${{ env.AZURE_FUNCTIONAPP_PACKAGE_PATH }}
        publish-profile: \${{ secrets.${secretName} }}`;
};

const getFunctionAppJavaWindowsWorkflow = (
  siteName: string,
  slotName: string,
  branch: string,
  secretName: string,
  runtimeStackVersion: string
) => {
  const webAppName = slotName ? `${siteName}(${slotName})` : siteName;
  const slot = slotName || 'production';

  return `# Docs for the Azure Web Apps Deploy action: https://github.com/azure/functions-action
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy Java project to Azure Function App - ${webAppName}

on:
  push:
    branches:
      - ${branch}

env:
  AZURE_FUNCTIONAPP_NAME: ${webAppName} # set this to your function app name on Azure
  POM_XML_DIRECTORY: '.' # set this to the directory which contains pom.xml file
  POM_FUNCTIONAPP_NAME: ${webAppName} # set this to the function app name in your local development environment
  JAVA_VERSION: '${runtimeStackVersion}' # set this to the java version to use

jobs:
  build-and-deploy:
    runs-on: windows-latest
    steps:
    - name: 'Checkout GitHub Action'
      uses: actions/checkout@master

    - name: Setup Java Sdk \${{ env.JAVA_VERSION }}
      uses: actions/setup-java@v1
      with:
        java-version: \${{ env.JAVA_VERSION }}

    - name: 'Restore Project Dependencies Using Mvn'
      shell: pwsh
      run: |
        pushd './\${{ env.POM_XML_DIRECTORY }}'
        mvn clean package
        mvn azure-functions:package
        popd
    - name: 'Run Azure Functions Action'
      uses: Azure/functions-action@v1
      id: fa
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        package: './\${{ env.POM_XML_DIRECTORY }}/target/azure-functions/\${{ env.POM_FUNCTIONAPP_NAME }}'
        publish-profile: \${{ secrets.${secretName} }}`;
};

const getFunctionAppJavaLinuxWorkflow = (
  siteName: string,
  slotName: string,
  branch: string,
  secretName: string,
  runtimeStackVersion: string
) => {
  const webAppName = slotName ? `${siteName}(${slotName})` : siteName;
  const slot = slotName || 'production';

  return `# Docs for the Azure Web Apps Deploy action: https://github.com/azure/functions-action
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy Java project to Azure Function App - ${webAppName}

on:
  push:
    branches:
      - ${branch}

env:
  AZURE_FUNCTIONAPP_NAME: ${webAppName} # set this to your function app name on Azure
  POM_XML_DIRECTORY: '.' # set this to the directory which contains pom.xml file
  POM_FUNCTIONAPP_NAME: ${webAppName} # set this to the function app name in your local development environment
  JAVA_VERSION: '${runtimeStackVersion}' # set this to the java version to use

jobs:
  build-and-deploy:
    runs-on: windows-latest
    steps:
    - name: 'Checkout GitHub Action'
      uses: actions/checkout@master

    - name: Setup Java Sdk \${{ env.JAVA_VERSION }}
      uses: actions/setup-java@v1
      with:
        java-version: \${{ env.JAVA_VERSION }}

    - name: 'Restore Project Dependencies Using Mvn'
      shell: pwsh
      run: |
        pushd './\${{ env.POM_XML_DIRECTORY }}'
        mvn clean package
        mvn azure-functions:package
        popd
    - name: 'Run Azure Functions Action'
      uses: Azure/functions-action@v1
      id: fa
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        package: './\${{ env.POM_XML_DIRECTORY }}/target/azure-functions/\${{ env.POM_FUNCTIONAPP_NAME }}'
        publish-profile: \${{ secrets.${secretName} }}`;
};

const getFunctionAppPythonLinuxWorkflow = (
  siteName: string,
  slotName: string,
  branch: string,
  secretName: string,
  runtimeStackVersion: string
) => {
  const webAppName = slotName ? `${siteName}(${slotName})` : siteName;
  const slot = slotName || 'production';

  return `# Docs for the Azure Web Apps Deploy action: https://github.com/azure/functions-action
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy Powershell project to Azure Function App - ${webAppName}

on:
  push:
    branches:
      - ${branch}

env:
  AZURE_FUNCTIONAPP_PACKAGE_PATH: '.' # set this to the path to your web app project, defaults to the repository root
  PYTHON_VERSION: '${runtimeStackVersion}' # set this to the python version to use (supports 3.6, 3.7, 3.8)

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: 'Checkout GitHub Action'
      uses: actions/checkout@master

    - name: Setup Python \${{ env.PYTHON_VERSION }} Environment
      uses: actions/setup-python@v1
      with:
        python-version: \${{ env.PYTHON_VERSION }}

    - name: 'Resolve Project Dependencies Using Pip'
      shell: bash
      run: |
        pushd './\${{ env.AZURE_FUNCTIONAPP_PACKAGE_PATH }}'
        python -m pip install --upgrade pip
        pip install -r requirements.txt --target=".python_packages/lib/site-packages"
        popd

    - name: 'Run Azure Functions Action'
      uses: Azure/functions-action@v1
      id: fa
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        package: \${{ env.AZURE_FUNCTIONAPP_PACKAGE_PATH }}
        publish-profile: \${{ secrets.${secretName} }}`;
};
