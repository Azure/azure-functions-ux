export class CommonConstants {
  public static readonly Links = {
    standaloneCreateLearnMore: 'https://go.microsoft.com/fwlink/?linkid=848756',
    pythonLearnMore: 'https://go.microsoft.com/fwlink/?linkid=852196',
    clientAffinityLearnMore: 'https://go.microsoft.com/fwlink/?linkid=798249',
    FTPAccessLearnMore: 'https://go.microsoft.com/fwlink/?linkid=871316',
    vmSizeLearnMore: 'https://go.microsoft.com/fwlink/?linkid=873022',
    appServicePricing: 'https://go.microsoft.com/fwlink/?linkid=873021',
    funcConnStringsLearnMore: 'https://go.microsoft.com/fwlink/?linkid=875276',
    extensionInstallHelpLink: 'https://go.microsoft.com/fwlink/?linkid=2010300',
    funcStorageLearnMore: 'https://go.microsoft.com/fwlink/?linkid=2010003',
    updateExtensionsLearnMore: 'https://go.microsoft.com/fwlink/?linkid=2013353',
    deploymentSlotsLearnMore: 'https://go.microsoft.com/fwlink/?linkid=2014035',
    communityTemplatesLink: 'https://go.microsoft.com/fwlink/?linkid=2022552',
    linuxContainersLearnMore: 'https://go.microsoft.com/fwlink/?linkid=861969',
    premiumV2NotAvailableLearnMore: 'https://go.microsoft.com/fwlink/?linkid=2009376',
    azureComputeUnitLearnMore: 'https://go.microsoft.com/fwlink/?linkid=2027465',
    pv2UpsellInfoLearnMore: 'https://go.microsoft.com/fwlink/?linkid=2028474',
    ipRestrictionsLearnMore: 'https://go.microsoft.com/fwlink/?linkid=854597',
    appDensityWarningLink: 'https://go.microsoft.com/fwlink/?linkid=2098431',
    byosBlobReadonlyLearnMore: 'https://go.microsoft.com/fwlink/?linkid=2110146',
    extensionBundlesRequiredLearnMore: 'https://go.microsoft.com/fwlink/?linkid=2116575',
    cronLearnMore: 'https://go.microsoft.com/fwlink/?linkid=2117147&clcid=0x409',
    quickstartViewDocumentation: 'https://go.microsoft.com/fwlink/?linkid=2119201',
    bindingDirectionLearnMore: 'https://go.microsoft.com/fwlink/?linkid=2121806&clcid=0x409',
  };

  public static readonly Kinds = {
    linux: 'linux',
    aseV1: 'ASEV1',
    aseV2: 'ASEV2',
    container: 'container',
    functionApp: 'functionapp',
    botapp: 'botapp',
    elastic: 'elastic', // only applies to server farm
    app: 'app',
    api: 'api',
  };

  public static readonly ApiVersions = {
    antaresApiVersion20181101: '2018-11-01',
    armBatchApi: '2015-11-01',
    armLocksApiVersion: '2015-01-01',
    armRbacApiVersion: '2015-07-01',
    resourceGraphApiVersion: '2018-09-01-preview',
    storageApiVersion20180701: '2018-07-01',
    eventHubApiVersion20150801: '2015-08-01',
    iotHubApiVersion20170119: '2017-01-19',
    serviceBusApiVersion20150801: '2015-08-01',
    documentDBApiVersion20150408: '2015-04-08',
    appInsightsTokenApiVersion20150501: '2015-05-01',
    appInsightsQueryApiVersion20180420: '2018-04-20',
    staticSitePreviewApiVersion20191201: '2019-12-01-preview',
    stacksApiVersion20200501: '2020-05-01',
  };

  public static readonly NonThemeColors = {
    upsell: '#804998',
    upsellBackground: '#e7ddf2',
    blackText: '#161616', // useful for cases where black text is always wanted like against upsell background
  };

  public static readonly FeatureFlags = {
    AllowFreeLinux: 'allowfreelinux',
    UseNewStacksApi: 'usenewstacksapi',
  };

  public static readonly AppDensityLimit = 8;

  public static readonly Pricing = {
    hoursInAzureMonth: 730,
    secondsInAzureMonth: 2628000,
  };

  public static readonly AppSettingNames = {
    appInsightsConnectionString: 'APPLICATIONINSIGHTS_CONNECTION_STRING',
    appInsightsInstrumentationKey: 'APPINSIGHTS_INSTRUMENTATIONKEY',
    azureJobsExtensionVersion: 'AZUREJOBS_EXTENSION_VERSION',
    functionsExtensionVersion: 'FUNCTIONS_EXTENSION_VERSION',
    functionsWorkerRuntime: 'FUNCTIONS_WORKER_RUNTIME',
    websiteNodeDefaultVersion: 'WEBSITE_NODE_DEFAULT_VERSION',
    websiteUseZip: 'WEBSITE_USE_ZIP',
    websiteRunFromZip: 'WEBSITE_RUN_FROM_ZIP',
    websiteRunFromPackage: 'WEBSITE_RUN_FROM_PACKAGE',
    localCacheOptionSettingName: 'WEBSITE_LOCAL_CACHE_OPTION',
    functionAppEditModeSettingName: 'FUNCTION_APP_EDIT_MODE',
  };

  public static readonly SkuNames = {
    free: 'free',
    shared: 'shared',
    basic: 'basic',
    standard: 'standard',
    premium: 'premium',
    premiumV2: 'premiumv2',
    premiumContainer: 'premiumcontainer',
    isolated: 'isolated',
    dynamic: 'dynamic',
    elasticPremium: 'elasticpremium',
    elasticIsolated: 'elasticisolated',
  };

  public static readonly SiteStates = {
    running: 'running',
    stopped: 'stopped',
  };

  public static readonly NodeVersions = {
    default: '6.5.0',
    v2: '~10',
    v3: '~12',
  };

  public static readonly WorkerRuntimeLanguages = {
    dotnet: 'C#',
    node: 'JavaScript',
    nodejs: 'JavaScript',
    python: 'Python',
    java: 'Java',
    powershell: 'PowerShell',
  };

  public static localCacheOptionSettingValue = 'always';

  public static readonly QuickPulseEndpoints = {
    public: 'https://rt.services.visualstudio.com/QuickPulseService.svc',
    fairfax: 'https://quickpulse.applicationinsights.us/QuickPulseService.svc',
    mooncake: 'https://live.applicationinsights.azure.cn/QuickPulseService.svc',
  };

  public static readonly AppInsightsEndpoints = {
    public: 'https://api.applicationinsights.io/v1/apps',
    fairfax: 'https://api.applicationinsights.us/v1/apps',
    mooncake: 'https://api.applicationsinisights.azure.cn/v1/apps',
  };

  public static readonly LogLevels = {
    error: 'error',
    information: 'information',
    verbose: 'verbose',
    warning: 'warning',
  };

  public static readonly hostJsonFileName = 'host.json';

  public static readonly MonacoEditorTheme = {
    dark: 'vs-dark',
    light: 'vs-light',
  };

  public static readonly newLine = '\n';

  public static ContainerConstants = {
    dockerHubUrl: 'https://index.docker.io',
    microsoftMcrUrl: 'https://mcr.microsoft.com',
    acrUriBody: 'azurecr',
    acrUriHost: 'azurecr.io',
    imageNameSetting: 'DOCKER_CUSTOM_IMAGE_NAME',
    serverUrlSetting: 'DOCKER_REGISTRY_SERVER_URL',
    usernameSetting: 'DOCKER_REGISTRY_SERVER_USERNAME',
    passwordSetting: 'DOCKER_REGISTRY_SERVER_PASSWORD',
    runCommandSetting: 'DOCKER_CUSTOM_IMAGE_RUN_COMMAND',
    appServiceStorageSetting: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE',
    enableCISetting: 'DOCKER_ENABLE_CI',
    containerWinRmEnabled: 'CONTAINER_WINRM_ENABLED',
    createAcrFwLink: 'https://go.microsoft.com/fwlink/?linkid=852293',
    singleContainerQSLink: 'https://go.microsoft.com/fwlink/?linkid=873144',
    dockerComposeQSLink: 'https://go.microsoft.com/fwlink/?linkid=873149',
    kubeQSLink: 'https://go.microsoft.com/fwlink/?linkid=873150',
  };

  public static AppKeys = {
    master: 'master',
    eventGridV1: 'eventgridextensionconfig_extension',
    eventGridV2: 'eventgrid_extension',
  };

  public static EventGridSubscriptionEndpoints = {
    v1: 'admin/extensions/EventGridExtensionConfig',
    v2: 'runtime/webhooks/EventGrid',
  };

  public static readonly NationalCloudArmUris = {
    fairfax: 'https://management.usgovcloudapi.net',
    blackforest: 'https://management.microsoftazure.de',
    mooncake: 'https://management.chinacloudapi.cn',
    usNat: 'https://management.azure.eaglex.ic.gov',
    usSec: 'https://management.azure.microsoft.scloud',
  };

  public static readonly DefaultHiddenValue = '******';

  public static isKeyVaultReference = (value: string) => value.toLocaleLowerCase().startsWith('@microsoft.keyvault(');
}
