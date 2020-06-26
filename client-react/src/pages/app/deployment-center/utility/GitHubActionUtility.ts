import { WorkflowInformation } from '../DeploymentCenter.types';
import { RuntimeStacks, JavaContainers } from '../../../../utils/stacks-utils';
import { getWorkflowFileName } from './DeploymentCenterUtility';

export const getWorkflowInformation = (
  runtimeStack: string,
  runtimeVersion: string,
  runtimeStackRecommendedVersion: string,
  branch: string,
  isLinuxApp: boolean,
  secretNameGuid: string,
  siteName: string,
  slotName: string
): WorkflowInformation => {
  branch = branch || 'master';
  const fileName = getWorkflowFileName(branch, siteName, slotName);
  const secretName = `AzureAppService_PublishProfile_${secretNameGuid}`;

  let content = '';
  const runtimeStackVersion = getRuntimeVersion(isLinuxApp, runtimeVersion, runtimeStackRecommendedVersion);

  switch (runtimeStack) {
    case RuntimeStacks.node:
      content = getNodeGithubActionWorkflowDefinition(siteName, slotName, branch, isLinuxApp, secretName, runtimeStackVersion);
      break;
    case RuntimeStacks.python:
      content = isLinuxApp
        ? getPythonGithubActionWorkflowDefinitionForLinux(siteName, slotName, branch, secretName, runtimeStackVersion)
        : getPythonGithubActionWorkflowDefinitionForWindows(siteName, slotName, branch, secretName, runtimeStackVersion);
      break;
    case RuntimeStacks.dotnetcore:
      content = getDotnetCoreGithubActionWorkflowDefinition(siteName, slotName, branch, isLinuxApp, secretName, runtimeStackVersion);
      break;
    case RuntimeStacks.java8:
    case RuntimeStacks.java11:
      if (isJavaWarBuild(runtimeVersion)) {
        content = getJavaWarGithubActionWorkflowDefinition(siteName, slotName, branch, isLinuxApp, secretName, runtimeStackVersion);
      } else {
        content = getJavaJarGithubActionWorkflowDefinition(siteName, slotName, branch, isLinuxApp, secretName, runtimeStackVersion);
      }
      break;
    default:
      throw Error(`Incorrect stack value '${runtimeStack}' provided.`);
  }

  return {
    fileName,
    secretName,
    content: content,
  };
};

const isJavaWarBuild = (runtimeVersion: string) => {
  return runtimeVersion.toLocaleLowerCase().indexOf(JavaContainers.Tomcat) > -1;
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
      uses: azure/webapps-deploy@v1
      with:
        app-name: '${webAppName}'
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
        python3 -m venv env
        source env/bin/activate
        pip install -r requirements.txt
    - name: Zip the application files
      run: zip -r myapp.zip .

    - name: 'Deploy to Azure Web App'
      uses: azure/webapps-deploy@v1
      with:
        app-name: '${webAppName}'
        slot-name: '${slot}'
        publish-profile: \${{ secrets.${secretName} }}
        package: './myapp.zip'`;
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
      uses: azure/appservice-build@v1
      with:
        platform: python
        platform-version: '${runtimeStackVersion}'

    - name: 'Deploy to Azure Web App'
      uses: azure/webapps-deploy@v1
      with:
        app-name: '${webAppName}'
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
      uses: azure/webapps-deploy@v1
      with:
        app-name: '${webAppName}'
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
      uses: azure/webapps-deploy@v1
      with:
        app-name: '${webAppName}'
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
      uses: azure/webapps-deploy@v1
      with:
        app-name: '${siteName}'
        slot-name: '${slot}'
        publish-profile: \${{ secrets.${secretName} }}
        package: '\${{ github.workspace }}/target/*.war'`;
};
