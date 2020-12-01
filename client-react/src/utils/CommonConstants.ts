export class CommonConstants {
  public static readonly Kinds = {
    linux: 'linux',
    aseV1: 'ASEV1',
    aseV2: 'ASEV2',
    aseV3: 'ASEV3',
    container: 'container',
    functionApp: 'functionapp',
    botapp: 'botapp',
    elastic: 'elastic', // only applies to server farm
    app: 'app',
    api: 'api',
  };

  public static readonly ApiVersions = {
    antaresApiVersion20181101: '2018-11-01',
    armBatchApi20151101: '2015-11-01',
    resourceGraphApiVersion20180901preview: '2018-09-01-preview',
    storageApiVersion20180701: '2018-07-01',
    eventHubApiVersion20150801: '2015-08-01',
    iotHubApiVersion20170119: '2017-01-19',
    serviceBusApiVersion20150801: '2015-08-01',
    documentDBApiVersion20150408: '2015-04-08',
    appInsightsTokenApiVersion20150501: '2015-05-01',
    quickpulseTokenApiVersion20200602preview: '2020-06-02-preview',
    appInsightsQueryApiVersion20180420: '2018-04-20',
    staticSitePreviewApiVersion20191201: '2019-12-01-preview',
    stacksApiVersion20200601: '2020-06-01',
    acrApiVersion20190501: '2019-05-01',
  };

  public static readonly NonThemeColors = {
    upsell: '#804998',
    upsellBackground: '#e7ddf2',
    blackText: '#161616', // useful for cases where black text is always wanted like against upsell background
  };

  public static readonly FeatureFlags = {
    showHiddenStacks: 'showHiddenStacks',
    targetAzDevDeployment: 'targetAzDevDeployment',
    authTokenOverride: 'authTokenOverride',
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

  public static localCacheOptionSettingValue = 'always';

  public static readonly QuickPulseEndpoints = {
    public: 'https://rt.services.visualstudio.com/QuickPulseService.svc',
    fairfax: 'https://quickpulse.applicationinsights.us/QuickPulseService.svc',
    mooncake: 'https://live.applicationinsights.azure.cn/QuickPulseService.svc',
  };

  public static readonly AppInsightsEndpoints = {
    public: 'https://api.applicationinsights.io/v1/apps',
    fairfax: 'https://api.applicationinsights.us/v1/apps',
    mooncake: 'https://api.applicationinsights.azure.cn/v1/apps',
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

export enum WorkerRuntimeLanguages {
  dotnet = 'dotnet',
  javascript = 'javascript',
  nodejs = 'node',
  python = 'python',
  java = 'java',
  powershell = 'powershell',
  php = 'php',
  custom = 'custom',
}
