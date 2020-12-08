export class DeploymentCenterConstants {
  public static readonly githubUri = 'https://github.com';
  public static readonly githubApiUrl = 'https://api.github.com';
  public static readonly bitbucketApiUrl = 'https://api.bitbucket.org/2.0';
  public static readonly bitbucketUrl = 'https://bitbucket.org';
  public static readonly dropboxApiUrl = 'https://api.dropboxapi.com/2';
  public static readonly dropboxUri = 'https://www.dropbox.com/home/Apps/Azure';
  public static readonly onedriveApiUri = 'https://api.onedrive.com/v1.0/drive/special/approot';

  public static readonly AzDevDevFabricTfsUri = 'https://codedev.ms/';
  public static readonly AzDevDevFabricSpsUri = 'https://vssps.codedev.ms/';
  public static readonly AzDevDevFabricRmoUri = 'https://vsrm.codedev.ms/';
  public static readonly AzDevDevFabricPeDeploymentLevelUri = 'https://portalext.codedev.ms/';
  public static readonly AzDevDevFabricPeCollectionLevelUri = 'https://portalext.codedev.ms/{0}/';
  public static readonly AzDevDevFabricAexUri = 'https://aex.codedev.ms/';

  public static readonly AzDevPreFlightPeDeploymentLevelUri = 'https://pepfcusc.portalext.visualstudio.com/';

  public static readonly AzDevProductionTfsUri = 'https://dev.azure.com/';
  public static readonly AzDevProductionSpsUri = 'https://vssps.dev.azure.com/';
  public static readonly AzDevProductionRmoUri = 'https://vsrm.dev.azure.com/';
  public static readonly AzDevProductionPeDeploymentLevelUri = 'https://peprodscussu2.portalext.visualstudio.com/';
  public static readonly AzDevProductionPeCollectionLevelUri = 'https://portalext.dev.azure.com/{0}/';
  public static readonly AzDevProductionAexUri = 'https://vsaex.dev.azure.com/';

  public static readonly permissionsInfoLink = 'https://go.microsoft.com/fwlink/?linkid=2086046';

  public static readonly vstsPipelineFeatureId = 'ms.vss-build.pipelines';
  // VSTS Validation constants
  // Build definition
  public static readonly buildSecurityNameSpace = '33344D9C-FC72-4d6f-ABA5-FA317101A7E9';
  public static readonly editBuildDefinitionBitMask = 2048;

  // Release definition
  public static readonly releaseSecurityNameSpace = 'C788C23E-1B46-4162-8F5E-D7585343B5DE';
  public static readonly editReleaseDefinitionPermission = 2;

  // Agent queues
  public static readonly agentQueueNames = ['Hosted VS2017'];
  public static readonly queueActionFilter = 16; // "Use"

  // Tfs Git permission
  public static readonly tfsGitSecurityNameSpace = '2E9EB7ED-3C0A-47D4-87C1-0FFDD275FD87';
  public static readonly createRepositoryPermission = 256;

  public static readonly EmptyGuid = '00000000-0000-0000-0000-000000000000';

  public static readonly protectedBranchSelectedLink = 'https://go.microsoft.com/fwlink/?linkid=2120729';

  // Container/Docker constants
  public static readonly dockerPrefix = 'DOCKER';
  public static readonly composePrefix = 'COMPOSE';
  public static readonly kubernetesPrefix = 'KUBE';
  public static readonly dockerHubServerUrlHost = 'index.docker.io';
  public static readonly dockerHubServerUrl = 'https://index.docker.io/v1';
  public static readonly microsoftMcrUrl = 'https://mcr.microsoft.com';
  public static readonly acrUriBody = 'azurecr';
  public static readonly acrUriHost = 'azurecr.io';
  public static readonly imageNameSetting = 'DOCKER_CUSTOM_IMAGE_NAME';
  public static readonly serverUrlSetting = 'DOCKER_REGISTRY_SERVER_URL';
  public static readonly usernameSetting = 'DOCKER_REGISTRY_SERVER_USERNAME';
  public static readonly passwordSetting = 'DOCKER_REGISTRY_SERVER_PASSWORD';
  public static readonly runCommandSetting = 'DOCKER_CUSTOM_IMAGE_RUN_COMMAND';
  public static readonly appServiceStorageSetting = 'WEBSITES_ENABLE_APP_SERVICE_STORAGE';
  public static readonly enableCISetting = 'DOCKER_ENABLE_CI';
  public static readonly containerWinRmEnabled = 'CONTAINER_WINRM_ENABLED';
  public static readonly createAcrFwLink = 'https://go.microsoft.com/fwlink/?linkid=852293';
  public static readonly singleContainerQSLink = 'https://go.microsoft.com/fwlink/?linkid=873144';
  public static readonly dockerComposeQSLink = 'https://go.microsoft.com/fwlink/?linkid=873149';
  public static readonly kubeQSLink = 'https://go.microsoft.com/fwlink/?linkid=873150';
}
