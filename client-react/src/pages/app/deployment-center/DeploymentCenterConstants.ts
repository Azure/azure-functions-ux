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
}
