export class CommonConstants {
  public static readonly Kinds = {
    linux: 'linux',
    aseV1: 'ASEV1',
    aseV2: 'ASEV2',
    aseV3: 'ASEV3',
    container: 'container',
    code: 'code',
    webApp: 'webapp',
    functionApp: 'functionapp',
    botapp: 'botapp',
    elastic: 'elastic', // only applies to server farm
    app: 'app',
    api: 'api',
    workflowApp: 'workflowapp',
    xenon: 'xenon',
    // NOTE(andimarc): The kind for kube app will be switching from 'kubeapp'
    // to 'kubernetes' se we need to account for both during the transition.
    kubeApp: 'kubeapp',
    kubernetes: 'kubernetes',
  };

  public static readonly ApiVersions = {
    antaresApiVersion20181101: '2018-11-01',
    antaresApiVersion20201201: '2020-12-01',
    armBatchApi20151101: '2015-11-01',
    resourceGraphApiVersion20180901preview: '2018-09-01-preview',
    storageApiVersion20180701: '2018-07-01',
    eventHubApiVersion20150801: '2015-08-01',
    iotHubApiVersion20170119: '2017-01-19',
    serviceBusApiVersion20150801: '2015-08-01',
    documentDBApiVersion20150408: '2015-04-08',
    appInsightsTokenApiVersion20150501: '2015-05-01',
    quickpulseTokenApiVersion20211014: '2021-10-14',
    appInsightsQueryApiVersion20180420: '2018-04-20',
    staticSitePreviewApiVersion20191201: '2019-12-01-preview',
    stacksApiVersion20201001: '2020-10-01',
    acrApiVersion20190501: '2019-05-01',
    staticSiteApiVersion20201201: '2020-12-01',
    staticSiteApiVersion20210301: '2021-03-01',
    argApiVersion20210301: '2021-03-01',
    argApiVersion20180901Preview: '2018-09-01-preview',
    workflowApiVersion20201201: '2020-12-01',
    roleAssignmentApiVersion20180701: '2018-07-01',
    enableSystemAssignedIdentityApiVersion20210201: '2021-02-01',
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
    enableAzureMount: 'enableAzureMount',
    showServiceLinkerConnector: 'showServiceLinkerConnector',
    enableGitHubOnNationalCloud: 'enableGitHubOnNationalCloud',
    treatAsKubeApp: 'treatAsKubeApp', // websitesextension_ext=appsvc.treatAsKubeApp%3Dtrue
    enableKubeScenarioForTesting: 'enableKubeScenarioForTesting',
    disablePortalEditing: 'disablePortalEditing',
    enableAzureReposForLinux: 'enableAzureReposForLinux',
    enterpriseGradeEdgeItemVisible: 'enterpriseGradeEdgeItemVisible',
    enableACRManagedIdentities: 'enableACRManagedIdentities',
    useStackApiForRuntimeVersion: 'useStackApiForRuntimeVersion',
    useNewFunctionLogsApi: 'useNewFunctionLogsApi', //websitesextension_ext=appsvc.useNewFunctionLogsApi%3Dtrue
  };

  public static readonly AppDensityLimit = 8;

  public static readonly Pricing = {
    hoursInAzureMonth: 730,
    secondsInAzureMonth: 2628000,
  };

  public static readonly FunctionsRuntimeVersions = {
    four: '~4',
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
    serviceLinkerPrefix: 'resourceconnector_',
    enableOryxBuild: 'ENABLE_ORYX_BUILD',
    azureFilesSettingName: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING',
    azureWebJobsSecretStorageType: 'AzureWebJobsSecretStorageType',
    azureWebJobsStorage: 'AzureWebJobsStorage',
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
    usSec: 'https://live.applicationinsights.azure.microsoft.scloud/QuickPulseService.svc',
    usNat: 'https://live.applicationinsights.azure.eaglex.ic.gov/QuickPulseService.svc',
  };

  public static readonly QuickPulseEndpointsWithoutService = {
    quickPulseEndpoint: '/QuickPulseService.svc',
    public: 'https://rt.services.visualstudio.com',
    fairfax: 'https://quickpulse.applicationinsights.us',
    mooncake: 'https://live.applicationinsights.azure.cn',
    usSec: 'https://live.applicationinsights.azure.microsoft.scloud',
    usNat: 'https://live.applicationinsights.azure.eaglex.ic.gov',
  };

  public static readonly AppInsightsEndpoints = {
    public: 'https://api.applicationinsights.io/v1/apps',
    fairfax: 'https://api.applicationinsights.us/v1/apps',
    mooncake: 'https://api.applicationinsights.azure.cn/v1/apps',
    usSec: 'https://api.applicationinsights.azure.microsoft.scloud/v1/apps',
    usNat: 'https://api.applicationinsights.azure.eaglex.ic.gov/v1/apps',
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

  public static readonly Dash = ' - ';

  public static readonly Hyphen = '-';

  public static readonly serviceBmxUrl = 'https://service.bmx.azure.com';

  public static readonly PortalUris = {
    public: 'https://portal.azure.com',
    fairfax: 'https://portal.azure.us',
    blackforest: 'https://portal.microsoftazure.de',
    mooncake: 'https://portal.azure.cn',
    usNat: 'https://portal.azure.eaglex.ic.gov',
    usSec: 'https://portal.azure.microsoft.scloud',
  };

  public static readonly monthlyHoursForPricing = 730;

  public static readonly MountPathValidationExamples = {
    linux: {
      valid: '/Foo, /Foo/bar',
      invalid: '/, /Home',
    },
    windowsCode: {
      valid: '/mounts/foo',
      invalid: '/mounts, /mounts/foo/bar, /mounts/foo.bar',
    },
    windowsContainer: {
      valid: '/foo, /foo/bar, [Cc-Zz]:\\foo, [Cc-Zz]:\\foo\\bar',
      invalid: '/, /., /home, [Cc-Zz]:\\, [Cc-Zz]:\\., [Cc-Zz]:\\mounts, [Cc-Zz]:\\home',
    },
  };

  public static readonly windowsCodeMountPathPrefix = '/mounts';

  public static isKeyVaultReference = (value: string) => value.toLocaleLowerCase().startsWith('@microsoft.keyvault(');

  public static isKeyVaultSecretUrl = (value: string) => {
    return !!value && value.toLocaleLowerCase().startsWith('https://') && value.toLocaleLowerCase().search('.vault.azure.net/secrets') > 0;
  };

  public static readonly BindingSettingNames = {
    connection: 'connection',
    connectionStringSetting: 'connectionStringSetting',
  };

  public static hiddenLink = 'hidden-link';

  public static readonly DeploymentCenterConstants = {
    acrTag: 'acrResourceId',
    https: 'https://',
    http: 'http://',
    httpsWithoutSlash: 'https',
    httpWithoutSlash: 'http',
  };

  public static readonly workflowDispatchTriggerErrorMessage = "workflow does not have 'workflow_dispatch' trigger";

  public static readonly production = 'production';

  public static readonly master = 'master';

  public static readonly singleForwardSlash = '/';

  public static readonly comma = ',';

  public static readonly space = ' ';

  //min length is 8, must contain uppercase, lowercase, number, and symbol
  public static readonly passwordMinimumRequirementsRegex = new RegExp(/^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,})$/);
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
  dotnet5 = 'dotnet-isolated',
}

export enum OverflowBehavior {
  none = 'none',
  menu = 'menu',
}

export enum TextFieldType {
  password = 'password',
}

export enum RBACRoleId {
  acrPull = '7f951dda-4ed3-4680-a7ca-43fe172d538d',
}

export class SubscriptionQuotaIds {
  public static azurePassQuotaId = 'AzurePass_2014-09-01';
  public static azureStudentQuotaId = 'AzureForStudents_2018-01-01';
  public static dreamSparkQuotaId = 'DreamSpark_2015-02-01';
  public static freeTrialQuotaId = 'FreeTrial_2014-09-01';
  public static artemisQuotaId = 'CSP_2015-05-01';
  public static bizSparkQuotaId = 'BizSpark_2014-09-01';
  public static sponsoredQuotaId = 'Sponsored_2016-01-01';
  public static lrsQuotaId = 'LightweightTrial_2016-09-01';
  public static enterpriseAgreementQuotaId = 'EnterpriseAgreement_2014-09-01';
  public static payAsYouGoQuotaId = 'PayAsYouGo_2014-09-01';
  public static cspQuotaId = 'CSP_2015-05-01';
}

// NOTE(krmitta): This class should be in sync with the similar ibiza class,
// File - https://msazure.visualstudio.com/One/_git/AAPT-Antares-AntUX?path=/src/src/Ux/Extensions/Websites/TypeScript/ExtensionAssets/Constants.ts&version=GBdev&line=3444&lineEnd=3444&lineStartColumn=14&lineEndColumn=29&lineStyle=plain&_a=contents
export class ExperimentationConstants {
  public static TreatmentFlight = {
    linuxPortalEditing: 'linux-portal-editing-variant',
    portalCallOnEditor: 'enable-portal-call-editor',
  };

  public static ControlFlight = {
    linuxPortalEditing: 'linux-portal-editing-default',
    portalCallOnEditor: 'disable-portal-call-editor',
  };
}

export class Monitoring {
  public static AppInsightsResourceIdHiddenTagName = 'hidden-link: /app-insights-resource-id';
  public static AppInsightsInstrumentationKeyHiddenTagName = 'hidden-link: /app-insights-instrumentation-key';
}

export const ScmHosts = ['.scm.azurewebsites.net', '.scm.azurewebsites.us', '.scm.chinacloudsites.cn', '.scm.azurewebsites.de'];
