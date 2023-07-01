import PortalCommunicator from '../../../../portal-communicator';
import { JavaContainers, RuntimeStacks } from '../../../../utils/stacks-utils';
import { getTelemetryInfo } from '../../../../utils/TelemetryUtils';
import DeploymentCenterData from '../DeploymentCenter.data';
import {
  CodeWorkflowInformation,
  ContainerWorkflowInformation,
  SiteSourceControlRequestBody,
  WorkflowOption,
} from '../DeploymentCenter.types';
import { DeploymentCenterConstants } from '../DeploymentCenterConstants';

import { getWorkflowFileName } from './DeploymentCenterUtility';

export const updateGitHubActionAppSettingsForPython = async (
  deploymentCenterData: DeploymentCenterData,
  resourceId: string,
  isFunctionApp: boolean,
  portalContext: PortalCommunicator
) => {
  const fetchExistingAppSettingsResponse = await deploymentCenterData.fetchApplicationSettings(resourceId);

  if (!fetchExistingAppSettingsResponse.metadata.success) {
    portalContext.log(
      getTelemetryInfo('error', 'fetchApplicationSettings', 'failed', {
        error: fetchExistingAppSettingsResponse.metadata.error,
        message: 'Failed to get app-settings',
      })
    );

    return fetchExistingAppSettingsResponse;
  }

  let updateAppSettings = false;
  const properties = fetchExistingAppSettingsResponse.data && fetchExistingAppSettingsResponse.data.properties;

  if (properties && !properties[DeploymentCenterConstants.appSettings_SCM_DO_BUILD_DURING_DEPLOYMENT]) {
    updateAppSettings = true;
    properties[DeploymentCenterConstants.appSettings_SCM_DO_BUILD_DURING_DEPLOYMENT] = '1';
  }

  if (isFunctionApp && properties && !properties[DeploymentCenterConstants.appSettings_ENABLE_ORYX_BUILD]) {
    updateAppSettings = true;
    properties[DeploymentCenterConstants.appSettings_ENABLE_ORYX_BUILD] = '1';
  }

  fetchExistingAppSettingsResponse.data.properties = properties;

  // NOTE(michinoy): ONLY update the appsettings IF one of the values is missing. This is to prevent an unnecessary restart of the app.
  if (updateAppSettings) {
    const updateAppSettingsResponse = await deploymentCenterData.updateApplicationSettings(
      resourceId,
      fetchExistingAppSettingsResponse.data
    );

    if (!updateAppSettingsResponse.metadata.success) {
      portalContext.log(
        getTelemetryInfo('error', 'updateGitHubActionAppSettingsForPython', 'failed', {
          error: updateAppSettingsResponse.metadata.error,
          message: 'Failed to update app-settings',
        })
      );
    }

    return updateAppSettingsResponse;
  } else {
    return fetchExistingAppSettingsResponse;
  }
};

export const updateGitHubActionSourceControlPropertiesManually = async (
  deploymentCenterData: DeploymentCenterData,
  resourceId: string,
  payload: SiteSourceControlRequestBody,
  gitHubToken: string,
  portalContext: PortalCommunicator
) => {
  // NOTE(michinoy): To be on the safe side, the update operations should be sequential rather than
  // parallel. The reason behind this is because incase the metadata update fails, but the scmtype is updated
  // the /sourcecontrols API GET will start failing.

  const fetchExistingMetadataResponse = await deploymentCenterData.getConfigMetadata(resourceId);

  if (!fetchExistingMetadataResponse.metadata.success) {
    portalContext.log(
      getTelemetryInfo('error', 'getSiteConfig', 'failed', {
        error: fetchExistingMetadataResponse.metadata.error,
        message: 'Failed to get site config data',
      })
    );

    return fetchExistingMetadataResponse;
  }

  const properties = fetchExistingMetadataResponse.data.properties ?? {};

  delete properties[DeploymentCenterConstants.metadataRepoUrl];
  delete properties[DeploymentCenterConstants.metadataScmUri];
  delete properties[DeploymentCenterConstants.metadataCloneUri];
  delete properties[DeploymentCenterConstants.metadataBranch];
  delete properties[DeploymentCenterConstants.metadataOAuthToken];
  delete properties[DeploymentCenterConstants.metadataIsGitHubAction];

  properties[DeploymentCenterConstants.metadataRepoUrl] = payload.repoUrl;
  properties[DeploymentCenterConstants.metadataBranch] = payload.branch;
  properties[DeploymentCenterConstants.metadataOAuthToken] = gitHubToken;
  properties[DeploymentCenterConstants.metadataIsGitHubAction] = 'true';

  const updateMetadataResponse = await deploymentCenterData.updateConfigMetadata(resourceId, properties);

  if (!updateMetadataResponse.metadata.success) {
    portalContext.log(
      getTelemetryInfo('error', 'updateGitHubActionSourceControlPropertiesManually', 'failed', {
        error: updateMetadataResponse.metadata.error,
        message: 'Failed to update metadata',
      })
    );

    return updateMetadataResponse;
  }

  const patchSiteConfigResponse = await deploymentCenterData.patchSiteConfig(resourceId, {
    properties: {
      scmType: 'GitHubAction',
    },
  });

  if (!patchSiteConfigResponse.metadata.success) {
    portalContext.log(
      getTelemetryInfo('error', 'updateGitHubActionSourceControlPropertiesManually', 'failed', {
        error: patchSiteConfigResponse.metadata.error,
        message: 'Failed to patch site config',
      })
    );
  }

  return patchSiteConfigResponse;
};

export const clearGitHubActionSourceControlPropertiesManually = async (
  deploymentCenterData: DeploymentCenterData,
  resourceId: string,
  portalContext: PortalCommunicator
) => {
  // NOTE(michinoy): To be on the safe side, the update operations should be sequential rather than
  // parallel. The reason behind this is because incase the metadata update fails, but the scmtype is updated
  // the /sourcecontrols API GET will start failing.

  const fetchExistingMetadataResponse = await deploymentCenterData.getConfigMetadata(resourceId);

  if (!fetchExistingMetadataResponse.metadata.success) {
    portalContext.log(
      getTelemetryInfo('error', 'getConfigMetadata', 'failed', {
        error: fetchExistingMetadataResponse.metadata.error,
        message: 'Failed to get source control',
      })
    );

    return fetchExistingMetadataResponse;
  }

  const properties = fetchExistingMetadataResponse.data.properties ?? {};

  delete properties[DeploymentCenterConstants.metadataRepoUrl];
  delete properties[DeploymentCenterConstants.metadataScmUri];
  delete properties[DeploymentCenterConstants.metadataCloneUri];
  delete properties[DeploymentCenterConstants.metadataBranch];
  delete properties[DeploymentCenterConstants.metadataOAuthToken];
  delete properties[DeploymentCenterConstants.metadataIsGitHubAction];

  const updateMetadataResponse = await deploymentCenterData.updateConfigMetadata(resourceId, properties);

  if (!updateMetadataResponse.metadata.success) {
    portalContext.log(
      getTelemetryInfo('error', 'clearGitHubActionSourceControlPropertiesManually', 'failed', {
        error: updateMetadataResponse.metadata.error,
        message: 'Failed to update config',
      })
    );

    return updateMetadataResponse;
  }

  const patchSiteConfigResponse = await deploymentCenterData.patchSiteConfig(resourceId, {
    properties: {
      scmType: 'None',
    },
  });

  if (!patchSiteConfigResponse.metadata.success) {
    portalContext.log(
      getTelemetryInfo('error', 'clearGitHubActionSourceControlPropertiesManually', 'failed', {
        error: patchSiteConfigResponse.metadata.error,
        message: 'Failed to patch config',
      })
    );
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
    case RuntimeStacks.java:
      // NOTE(michinoy): In case of Java, if the container is tomcat, set up the workflow to produce a WAR package. Else to be on the
      // safe side produce a JAR package. Internally they are both MAVEN builds.
      if (javaContainer === JavaContainers.Tomcat) {
        content = getJavaWarGithubActionWorkflowDefinition(siteName, slotName, repoBranch, isLinuxApp, secretName, runtimeStackVersion);
      } else {
        content = getJavaJarGithubActionWorkflowDefinition(siteName, slotName, repoBranch, isLinuxApp, secretName, runtimeStackVersion);
      }
      break;
    case RuntimeStacks.dotnet: {
      // NOTE(michinoy): All of the dotnet related stacks are under the 'dotnet' stack now
      // so workflow file creation will diverge based on the runtime version instead.
      const version = runtimeVersion.toLocaleLowerCase();
      content =
        version === 'v4.0' || version === 'v2.0'
          ? getAspNetGithubActionWorkflowDefinition(siteName, slotName, repoBranch, secretName)
          : getDotnetCoreGithubActionWorkflowDefinition(siteName, slotName, repoBranch, isLinuxApp, secretName, runtimeStackVersion);
      break;
    }
    case RuntimeStacks.php:
      content = isLinuxApp
        ? getPhpLinuxGithubActionWorkflowDefinition(siteName, slotName, repoBranch, secretName, runtimeStackVersion)
        : getPhpWindowsGithubActionWorkflowDefinition(siteName, slotName, repoBranch, secretName, runtimeStackVersion);
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
    case RuntimeStacks.dotnet:
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
      content = getFunctionAppPowershellWindowsWorkflow(siteName, slotName, repoBranch, secretName);
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

export const getRuntimeVersion = (isLinuxApp: boolean, runtimeVersion: string, runtimeStackRecommendedVersion: string) => {
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
  workflow_dispatch:

jobs:
  build:
    runs-on: ${isLinuxApp ? 'ubuntu-latest' : 'windows-latest'}

    steps:
    - uses: actions/checkout@v2

    - name: Set up Node.js version
      uses: actions/setup-node@v1
      with:
        node-version: '${runtimeStackVersion}'

    - name: npm install, build, and test
      run: |
        npm install
        npm run build --if-present
        npm run test --if-present

    - name: Upload artifact for deployment job
      uses: actions/upload-artifact@v2
      with:
        name: node-app
        path: .

  deploy:
    runs-on: ${isLinuxApp ? 'ubuntu-latest' : 'windows-latest'}
    needs: build
    environment:
      name: '${slot}'
      url: \${{ steps.deploy-to-webapp.outputs.webapp-url }}

    steps:
    - name: Download artifact from build job
      uses: actions/download-artifact@v2
      with:
        name: node-app

    - name: 'Deploy to Azure Web App'
      id: deploy-to-webapp
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
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: windows-latest

    steps:
    - uses: actions/checkout@v2

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
# More info on Python, GitHub Actions, and Azure App Service: https://aka.ms/python-webapps-actions

name: Build and deploy Python app to Azure Web App - ${webAppName}

on:
  push:
    branches:
      - ${branch}
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Set up Python version
      uses: actions/setup-python@v1
      with:
        python-version: '${runtimeStackVersion}'

    - name: Create and start virtual environment
      run: |
        python -m venv venv
        source venv/bin/activate

    - name: Install dependencies
      run: pip install -r requirements.txt

    # Optional: Add step to run tests here (PyTest, Django test suites, etc.)

    - name: Upload artifact for deployment jobs
      uses: actions/upload-artifact@v2
      with:
        name: python-app
        path: |
          .
          !venv/

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: '${slot}'
      url: \${{ steps.deploy-to-webapp.outputs.webapp-url }}

    steps:
      - name: Download artifact from build job
        uses: actions/download-artifact@v2
        with:
          name: python-app
          path: .

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
  workflow_dispatch:

jobs:
  build:
    runs-on: ${isLinuxApp ? 'ubuntu-latest' : 'windows-latest'}

    steps:
    - uses: actions/checkout@v2

    - name: Set up .NET Core
      uses: actions/setup-dotnet@v1
      with:
        dotnet-version: '${runtimeStackVersion}'
        include-prerelease: true

    - name: Build with dotnet
      run: dotnet build --configuration Release

    - name: dotnet publish
      run: dotnet publish -c Release -o \${{env.DOTNET_ROOT}}/myapp

    - name: Upload artifact for deployment job
      uses: actions/upload-artifact@v2
      with:
        name: .net-app
        path: \${{env.DOTNET_ROOT}}/myapp

  deploy:
    runs-on: ${isLinuxApp ? 'ubuntu-latest' : 'windows-latest'}
    needs: build
    environment:
      name: '${slot}'
      url: \${{ steps.deploy-to-webapp.outputs.webapp-url }}

    steps:
    - name: Download artifact from build job
      uses: actions/download-artifact@v2
      with:
        name: .net-app

    - name: Deploy to Azure Web App
      id: deploy-to-webapp
      uses: azure/webapps-deploy@v2
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        publish-profile: \${{ secrets.${secretName} }}
        package: .`;
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
  workflow_dispatch:

jobs:
  build:
    runs-on: ${isLinuxApp ? 'ubuntu-latest' : 'windows-latest'}

    steps:
    - uses: actions/checkout@v2

    - name: Set up Java version
      uses: actions/setup-java@v1
      with:
        java-version: '${runtimeStackVersion}'

    - name: Build with Maven
      run: mvn clean install

    - name: Upload artifact for deployment job
      uses: actions/upload-artifact@v2
      with:
        name: java-app
        path: '\${{ github.workspace }}/target/*.jar'

  deploy:
    runs-on: ${isLinuxApp ? 'ubuntu-latest' : 'windows-latest'}
    needs: build
    environment:
      name: '${slot}'
      url: \${{ steps.deploy-to-webapp.outputs.webapp-url }}

    steps:
    - name: Download artifact from build job
      uses: actions/download-artifact@v2
      with:
        name: java-app

    - name: Deploy to Azure Web App
      id: deploy-to-webapp
      uses: azure/webapps-deploy@v2
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        publish-profile: \${{ secrets.${secretName} }}
        package: '*.jar'`;
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
  workflow_dispatch:

jobs:
  build:
    runs-on: ${isLinuxApp ? 'ubuntu-latest' : 'windows-latest'}

    steps:
    - uses: actions/checkout@v2

    - name: Set up Java version
      uses: actions/setup-java@v1
      with:
        java-version: '${runtimeStackVersion}'

    - name: Build with Maven
      run: mvn clean install

    - name: Upload artifact for deployment job
      uses: actions/upload-artifact@v2
      with:
        name: java-app
        path: '\${{ github.workspace }}/target/*.war'

  deploy:
    runs-on: ${isLinuxApp ? 'ubuntu-latest' : 'windows-latest'}
    needs: build
    environment:
      name: '${slot}'
      url: \${{ steps.deploy-to-webapp.outputs.webapp-url }}

    steps:
    - name: Download artifact from build job
      uses: actions/download-artifact@v2
      with:
        name: java-app

    - name: Deploy to Azure Web App
      id: deploy-to-webapp
      uses: azure/webapps-deploy@v2
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        publish-profile: \${{ secrets.${secretName} }}
        package: '*.war'`;
};

// TODO(michinoy): Need to implement templated github action workflow generation.
// Current reference - https://github.com/Azure/actions-workflow-templates
const getAspNetGithubActionWorkflowDefinition = (siteName: string, slotName: string, branch: string, secretName: string) => {
  const webAppName = slotName ? `${siteName}(${slotName})` : siteName;
  const slot = slotName || 'production';

  return `# Docs for the Azure Web Apps Deploy action: https://github.com/Azure/webapps-deploy
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy ASP app to Azure Web App - ${webAppName}

on:
  push:
    branches:
      - ${branch}
  workflow_dispatch:

jobs:
  build:
    runs-on: 'windows-latest'

    steps:
    - uses: actions/checkout@v2

    - name: Setup MSBuild path
      uses: microsoft/setup-msbuild@v1.0.2

    - name: Setup NuGet
      uses: NuGet/setup-nuget@v1.0.5

    - name: Restore NuGet packages
      run: nuget restore

    - name: Publish to folder
      run: msbuild /nologo /verbosity:m /t:Build /t:pipelinePreDeployCopyAllFilesToOneFolder /p:_PackageTempDir="\\published\\"

    - name: Upload artifact for deployment job
      uses: actions/upload-artifact@v2
      with:
        name: ASP-app
        path: '/published/**'

  deploy:
    runs-on: 'windows-latest'
    needs: build
    environment:
      name: '${slot}'
      url: \${{ steps.deploy-to-webapp.outputs.webapp-url }}

    steps:
    - name: Download artifact from build job
      uses: actions/download-artifact@v2
      with:
        name: ASP-app

    - name: Deploy to Azure Web App
      id: deploy-to-webapp
      uses: azure/webapps-deploy@v2
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        publish-profile: \${{ secrets.${secretName} }}
        package: .`;
};

const getPhpWindowsGithubActionWorkflowDefinition = (
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
  
  name: Build and deploy PHP app to Azure Web App - ${webAppName}
  
  on:
    push:
      branches:
        - ${branch}
    workflow_dispatch:
  
  jobs:
    build:
      runs-on: windows-latest
  
      steps:
        - uses: actions/checkout@v2
  
        - name: Setup PHP
          uses: shivammathur/setup-php@v2
          with:
            php-version: '${runtimeStackVersion}'
            
        - name: Check if composer.json exists
          id: check_files
          uses: andstor/file-existence-action@v1
          with:
            files: "composer.json"
            
        - name: Run composer install if composer.json exists
          if: steps.check_files.outputs.files_exists == 'true'
          run: composer validate --no-check-publish && composer install --prefer-dist --no-progress
  
        - name: Upload artifact for deployment job
          uses: actions/upload-artifact@v2
          with:
            name: php-app
            path: .
  
    deploy:
      runs-on: ubuntu-latest
      needs: build
      environment:
        name: '${slot}'
        url: \${{ steps.deploy-to-webapp.outputs.webapp-url }}
  
      steps:
        - name: Download artifact from build job
          uses: actions/download-artifact@v2
          with:
            name: php-app
  
        - name: 'Deploy to Azure Web App'
          uses: azure/webapps-deploy@v2
          id: deploy-to-webapp
          with:
            app-name: '${siteName}'
            slot-name: '${slot}'
            publish-profile: \${{ secrets.${secretName} }}
            package: .`;
};

const getPhpLinuxGithubActionWorkflowDefinition = (
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
  
  name: Build and deploy PHP app to Azure Web App - ${webAppName}
  
  on:
    push:
      branches:
        - ${branch}
    workflow_dispatch:
  
  jobs:
    build:
      runs-on: ubuntu-latest
  
      steps:
        - uses: actions/checkout@v2
  
        - name: Setup PHP
          uses: shivammathur/setup-php@v2
          with:
            php-version: '${runtimeStackVersion}'
            
        - name: Check if composer.json exists
          id: check_files
          uses: andstor/file-existence-action@v1
          with:
            files: "composer.json"
  
        - name: Run composer install if composer.json exists
          if: steps.check_files.outputs.files_exists == 'true'
          run: composer validate --no-check-publish && composer install --prefer-dist --no-progress
        
        - name: Upload artifact for deployment job
          uses: actions/upload-artifact@v2
          with:
            name: php-app
            path: .
  
    deploy:
      runs-on: ubuntu-latest
      needs: build
      environment:
        name: '${slot}'
        url: \${{ steps.deploy-to-webapp.outputs.webapp-url }}
  
      steps:
        - name: Download artifact from build job
          uses: actions/download-artifact@v2
          with:
            name: php-app
  
        - name: 'Deploy to Azure Web App'
          uses: azure/webapps-deploy@v2
          id: deploy-to-webapp
          with:
            app-name: '${siteName}'
            slot-name: '${slot}'
            publish-profile: \${{ secrets.${secretName} }}
            package: .`;
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
  workflow_dispatch:

jobs:
  build:
    runs-on: 'ubuntu-latest'

    steps:
    - uses: actions/checkout@v2

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Log in to registry
      uses: docker/login-action@v2
      with:
        registry: ${loginServer}/
        username: \${{ secrets.${containerUsernameSecretName} }}
        password: \${{ secrets.${containerPasswordSecretName} }}

    - name: Build and push container image to registry
      uses: docker/build-push-action@v3
      with:
        push: true
        tags: ${server}/\${{ secrets.${containerUsernameSecretName} }}/${image}:\${{ github.sha }}
        file: ./Dockerfile

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: '${slot}'
      url: \${{ steps.deploy-to-webapp.outputs.webapp-url }}

    steps:
    - name: Deploy to Azure Web App
      id: deploy-to-webapp
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
  workflow_dispatch:

env:
  AZURE_FUNCTIONAPP_PACKAGE_PATH: '.' # set this to the path to your web app project, defaults to the repository root
  DOTNET_VERSION: '${runtimeStackVersion}'  # set this to the dotnet version to use

jobs:
  build-and-deploy:
    runs-on: windows-latest
    steps:
    - name: 'Checkout GitHub Action'
      uses: actions/checkout@v2

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
  workflow_dispatch:

env:
  AZURE_FUNCTIONAPP_PACKAGE_PATH: '.' # set this to the path to your web app project, defaults to the repository root
  DOTNET_VERSION: '${runtimeStackVersion}'  # set this to the dotnet version to use

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: 'Checkout GitHub Action'
      uses: actions/checkout@v2

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
  workflow_dispatch:

env:
  AZURE_FUNCTIONAPP_PACKAGE_PATH: '.' # set this to the path to your web app project, defaults to the repository root
  NODE_VERSION: '${runtimeStackVersion}' # set this to the node version to use (supports 8.x, 10.x, 12.x)

jobs:
  build-and-deploy:
    runs-on: windows-latest
    steps:
    - name: 'Checkout GitHub Action'
      uses: actions/checkout@v2

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
  workflow_dispatch:

env:
  AZURE_FUNCTIONAPP_PACKAGE_PATH: '.' # set this to the path to your web app project, defaults to the repository root
  NODE_VERSION: '${runtimeStackVersion}' # set this to the node version to use (supports 8.x, 10.x, 12.x)

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: 'Checkout GitHub Action'
      uses: actions/checkout@v2

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

const getFunctionAppPowershellWindowsWorkflow = (siteName: string, slotName: string, branch: string, secretName: string) => {
  const webAppName = slotName ? `${siteName}(${slotName})` : siteName;
  const slot = slotName || 'production';

  return `# Docs for the Azure Web Apps Deploy action: https://github.com/azure/functions-action
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy Powershell project to Azure Function App - ${webAppName}

on:
  push:
    branches:
      - ${branch}
  workflow_dispatch:

env:
  AZURE_FUNCTIONAPP_PACKAGE_PATH: '.' # set this to the path to your web app project, defaults to the repository root

jobs:
  build-and-deploy:
    runs-on: windows-latest
    steps:
    - name: 'Checkout GitHub Action'
      uses: actions/checkout@v2

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
  workflow_dispatch:

env:
  AZURE_FUNCTIONAPP_NAME: ${webAppName} # set this to your function app name on Azure
  PACKAGE_DIRECTORY: '.' # set this to the directory which contains pom.xml file
  JAVA_VERSION: '${runtimeStackVersion}' # set this to the java version to use

jobs:
  build-and-deploy:
    runs-on: windows-latest
    steps:
    - name: 'Checkout GitHub Action'
      uses: actions/checkout@v2

    - name: Setup Java Sdk \${{ env.JAVA_VERSION }}
      uses: actions/setup-java@v1
      with:
        java-version: \${{ env.JAVA_VERSION }}

    - name: 'Restore Project Dependencies Using Mvn'
      shell: pwsh
      run: |
        pushd './\${{ env.PACKAGE_DIRECTORY }}'
        mvn clean package
        popd
    - name: 'Run Azure Functions Action'
      uses: Azure/functions-action@v1
      id: fa
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        publish-profile: \${{ secrets.${secretName} }}
        package: '\${{ env.PACKAGE_DIRECTORY }}'
        respect-pom-xml: true`;
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
  workflow_dispatch:

env:
  AZURE_FUNCTIONAPP_NAME: ${webAppName} # set this to your function app name on Azure
  PACKAGE_DIRECTORY: '.' # set this to the directory which contains pom.xml file
  JAVA_VERSION: '${runtimeStackVersion}' # set this to the java version to use

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: 'Checkout GitHub Action'
      uses: actions/checkout@v2

    - name: Setup Java Sdk \${{ env.JAVA_VERSION }}
      uses: actions/setup-java@v1
      with:
        java-version: \${{ env.JAVA_VERSION }}

    - name: 'Restore Project Dependencies Using Mvn'
      shell: pwsh
      run: |
        pushd './\${{ env.PACKAGE_DIRECTORY }}'
        mvn clean package
        popd
    - name: 'Run Azure Functions Action'
      uses: Azure/functions-action@v1
      id: fa
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        publish-profile: \${{ secrets.${secretName} }}
        package: '\${{ env.PACKAGE_DIRECTORY }}'
        respect-pom-xml: true`;
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

name: Build and deploy Python project to Azure Function App - ${webAppName}

on:
  push:
    branches:
      - ${branch}
  workflow_dispatch:

env:
  AZURE_FUNCTIONAPP_PACKAGE_PATH: '.' # set this to the path to your web app project, defaults to the repository root
  PYTHON_VERSION: '${runtimeStackVersion}' # set this to the python version to use (supports 3.6, 3.7, 3.8)

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: 'Checkout GitHub Action'
      uses: actions/checkout@v2

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
