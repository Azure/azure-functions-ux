export class HttpMethods {
  public static GET = 'get';
  public static POST = 'post';
  public static DELETE = 'delete';
  public static HEAD = 'head';
  public static PATCH = 'patch';
  public static PUT = 'put';
  public static OPTIONS = 'options';
  public static TRACE = 'trace';
}

export class Constants {
  public static serviceHost =
    window.location.hostname === 'localhost' || window.appsvc.env.runtimeType === 'Standalone' || window.appsvc.env.runtimeType === 'OnPrem'
      ? `https://${window.location.hostname}:${window.location.port}/`
      : `https://${window.location.hostname}/`;

  public static cdnHost = !!window.appsvc.cdn ? `${window.appsvc.cdn}/` : Constants.serviceHost;
  public static cdnNgMin = !!window.appsvc.cdn ? `${window.appsvc.cdn}/ng-min/` : '';
  public static nodeVersion = '6.5.0';
  public static nodeVersionV2 = '~10';
  public static nodeVersionV3 = '~12';
  public static latest = 'latest';
  public static disabled = 'disabled';
  public static runtimeVersionAppSettingName = 'FUNCTIONS_EXTENSION_VERSION';
  public static nodeVersionAppSettingName = 'WEBSITE_NODE_DEFAULT_VERSION';
  public static azureJobsExtensionVersion = 'AZUREJOBS_EXTENSION_VERSION';
  public static routingExtensionVersionAppSettingName = 'ROUTING_EXTENSION_VERSION';
  public static functionAppEditModeSettingName = 'FUNCTION_APP_EDIT_MODE';
  public static instrumentationKeySettingName = 'APPINSIGHTS_INSTRUMENTATIONKEY';
  public static connectionStringSettingName = 'APPLICATIONINSIGHTS_CONNECTION_STRING';
  public static secretStorageSettingsName = 'AzureWebJobsSecretStorageType';
  public static secretStorageSettingsValueBlob = 'Blob';
  public static secretStorageSettingsValueFiles = 'Files';
  public static contentShareConfigSettingsName = 'WEBSITE_CONTENTSHARE';
  public static azureWebJobsDashboardSettingsName = 'AzureWebJobsDashboard';
  public static functionsWorkerRuntimeAppSettingsName = 'FUNCTIONS_WORKER_RUNTIME';
  public static WebsiteUseZip = 'WEBSITE_USE_ZIP';
  public static WebsiteRunFromZip = 'WEBSITE_RUN_FROM_ZIP';
  public static WebsiteRunFromPackage = 'WEBSITE_RUN_FROM_PACKAGE';
  public static localCacheOptionSettingName = 'WEBSITE_LOCAL_CACHE_OPTION';
  public static localCacheOptionSettingValue = 'always';

  public static httpMethods = new HttpMethods();
  public static swaggerSecretName = 'swaggerdocumentationkey';
  public static eventGridName_v1 = 'eventgridextensionconfig_extension';
  public static eventGridName_v2 = 'eventgrid_extension';

  public static portalHostName = 'https://portal.azure.com';
  public static webAppsHostName = 'https://web1.appsvcux.ext.azure.com';
  public static msPortalHostName = 'https://ms.portal.azure.com';
  public static ReadWriteMode = 'readWrite'.toLocaleLowerCase();
  public static ReadOnlyMode = 'readOnly'.toLocaleLowerCase();

  public static OIDKey = 'http://schemas.microsoft.com/identity/claims/objectidentifier';
  public static BYOBTokenMapSettingName = 'BYOB_TokenMap';
  public static defaultBYOBLocation = '/data/byob_graphmap';
  public static MSGraphResource = 'https://graph.microsoft.com';
  public static latestMSGraphVersion = '1.0';
  public static WebhookHandlerFunctionName = 'RefreshO365Subscriptions';
  public static WebhookHandlerFunctionId = 'TimerTrigger-CSharpWebhookHandler';
  public static WebhookFunctionName = 'MSGraphWebhook';
  public static appDensityLimit = 8;
  public static defaultFunctionAppDockerImage = 'DOCKER|mcr.microsoft.com/azure-functions/dotnet:2.0-appservice-quickstart';
}

export class TabCommunicationVerbs {
  public static getStartInfo = 'get-startup-info';
  public static sentStartInfo = 'startup-info';
  public static updatedFile = 'updated-file-notice';
  public static newToken = 'new-token';
  public static parentClosed = 'parent-window-closed';
}

export class SiteTabIds {
  public static readonly overview = 'site-summary';
  public static readonly platformFeatures = 'site-manage';
  public static readonly functionRuntime = 'site-function-settings';
  public static readonly apiDefinition = 'site-api-definition';
  public static readonly standaloneConfig = 'standalone-config';
  public static readonly applicationSettings = 'site-config';
  public static readonly continuousDeployment = 'site-continuous-deployment';
  public static readonly logicApps = 'logic-apps';
  public static readonly console = 'console';
  public static readonly logStream = 'log-stream';
  public static readonly deploymentSlotsConfig = 'deployment-slots-config';
  public static readonly deploymentSlotsSwap = 'deployment-slots-swap';
  public static readonly deploymentSlotsCreate = 'deployment-slots-create';
  public static readonly scaleUp = 'scale-up';
  public static readonly quickstart = 'quickstart';
}

export class ARM {
  public static readonly MaxSubscriptionBatchSize = 40;
}

export class AvailabilityStates {
  public static unknown = 'unknown';
  public static unavailable = 'unavailable';
  public static available = 'available';

  // Not entirely sure what this means, but it seems to be synonymous with unavailable
  public static userinitiated = 'userinitiated';
}

export class NotificationIds {
  public static alwaysOn = 'alwaysOn';
  public static newRuntimeVersion = 'newRuntimeVersion';
  public static slotsHostId = 'slotsBlobStorage';
  public static runtimeV2 = 'runtimeV2';
  public static updateExtensions = 'updateExtensions';
  public static dynamicLinux = 'dynamicLinux';
  public static ipRestrictions = 'ipRestrictions';
  public static clientCertEnabled = 'clientCertEnabled';
  public static powershellPreview = 'powershellPreview';
}

export class Validations {
  public static websiteNameMinLength = 2;
  public static websiteNameMaxLength = 60;
}

export class Regex {
  public static readonly invalidEntityName: RegExp = /[^\u00BF-\u1FFF\u2C00-\uD7FF\a-zA-Z0-9-]/; // matches any character(i.e. german, chinese, english) or -
  public static readonly header: RegExp = /^[a-zA-Z0-9\-_]+$/;
  public static queryParam: RegExp = /^[a-zA-Z0-9\-_*]+$/;
  public static readonly functionName: RegExp = /^[a-zA-Z][a-zA-Z0-9_\-]{0,127}$/;
  public static readonly singleForwardSlash: RegExp = /\//g;
  public static readonly doubleBackslash: RegExp = /\\\\/g;
  public static readonly newLine: RegExp = /(\n)+/g;
  public static readonly infoLog: RegExp = /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2}\.\d+)\ (\[Info|INFO)/;
  public static readonly errorLog: RegExp = /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2}\.\d+)\ (\[Error|ERROR)/;
  public static readonly warningLog: RegExp = /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2}\.\d+)\ (\[Warning|WARNING)/;
  public static readonly log: RegExp = /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2})/;
  /*
    1. Donot Start with /, \ or ~
    2. Donot have path in drive letter format eg: (C:/Windows)
  */
  public static readonly windowsWorkingDirectoryValidation = /^(?![\\/~]).(?!:).*$|^.{0}$/;
  /*
    1. Donot start with /, \ or ~
  */
  public static readonly linuxWorkingDirectoryValidation = /^(?![\\/~]).*$|^.{0}$/;
}

export class Links {
  public static standaloneCreateLearnMore = 'https://go.microsoft.com/fwlink/?linkid=848756';
  public static pythonLearnMore = 'https://go.microsoft.com/fwlink/?linkid=852196';
  public static clientAffinityLearnMore = 'https://go.microsoft.com/fwlink/?linkid=798249';
  public static FTPAccessLearnMore = 'https://go.microsoft.com/fwlink/?linkid=871316';
  public static vmSizeLearnMore = 'https://go.microsoft.com/fwlink/?linkid=873022';
  public static appServicePricing = 'https://go.microsoft.com/fwlink/?linkid=873021';
  public static funcConnStringsLearnMore = 'https://go.microsoft.com/fwlink/?linkid=875276';
  public static extensionInstallHelpLink = 'https://go.microsoft.com/fwlink/?linkid=2010300';
  public static funcStorageLearnMore = 'https://go.microsoft.com/fwlink/?linkid=2010003';
  public static updateExtensionsLearnMore = 'https://go.microsoft.com/fwlink/?linkid=2013353';
  public static deploymentSlotsLearnMore = 'https://go.microsoft.com/fwlink/?linkid=2014035';
  public static communityTemplatesLink = 'https://go.microsoft.com/fwlink/?linkid=2022552&type=functionapp';
  public static linuxContainersLearnMore = 'https://go.microsoft.com/fwlink/?linkid=861969';
  public static premiumV2NotAvailableLearnMore = 'https://go.microsoft.com/fwlink/?linkid=2009376';
  public static azureComputeUnitLearnMore = 'https://go.microsoft.com/fwlink/?linkid=2027465';
  public static pv2UpsellInfoLearnMore = 'https://go.microsoft.com/fwlink/?linkid=2028474';
  public static containerPrivateRegistryLearnMore = 'https://go.microsoft.com/fwlink/?linkid=2041449';
  public static byosLearnMore = 'https://go.microsoft.com/fwlink/?linkid=2045372';
  public static deploymentCredentialsLearnMore = 'https://go.microsoft.com/fwlink/?linkid=2082375';
  public static ipRestrictionsLearnMore = 'https://go.microsoft.com/fwlink/?linkid=2086703';
  public static elasticPremiumNotAvailableLearnMore = 'https://go.microsoft.com/fwlink/?linkid=2086603';
  public static clientCertEnabledLearnMore = 'https://go.microsoft.com/fwlink/?linkid=2086188';
  public static powershellPreviewLearnMore = 'https://go.microsoft.com/fwlink/?linkid=2086831';
  public static appDensityWarningLink = 'https://go.microsoft.com/fwlink/?linkid=2098431';
  public static apimUpsellLearnMore = 'https://go.microsoft.com/fwlink/?linkid=2104075';
  public static runtimeScaleMonitoringLearnMore = 'https://go.microsoft.com/fwlink/?linkid=2104710';
  public static pv2FlexStampInfoLearnMore = 'https://go.microsoft.com/fwlink/?linkid=2116583';
}

export class Kinds {
  public static readonly linux = 'linux';
  public static readonly aseV2 = 'ASEV2';
  public static readonly aseV3 = 'ASEV3';
  public static readonly container = 'container';
  public static readonly functionApp = 'functionapp';
  public static readonly botapp = 'botapp';
  public static readonly elastic = 'elastic'; // only applies to server farm
  public static readonly api = 'api';
  public static readonly app = 'app';
}

export class LocalStorageKeys {
  public static readonly siteTabs = '/site/tabs';
  public static readonly savedSubsKey = '/subscriptions/selectedIds';
}

export class Order {
  public static templateOrder: string[] = [
    'HttpTrigger-',
    'TimerTrigger-',
    'QueueTrigger-',
    'ServiceBusQueueTrigger-',
    'ServiceBusTopicTrigger-',
    'BlobTrigger-',
    'EventHubTrigger-',
    'CosmosDBTrigger-',
    'IoTHubTrigger-',
    'IoTHubServiceBusQueueTrigger-',
    'IoTHubServiceBusTopicTrigger-',
    'GenericWebHook-',
    'GitHubCommenter-',
    'GitHubWebHook-',
    'HttpGET(CRUD)-',
    'HttpPOST(CRUD)-',
    'HttpPUT(CRUD)-',
    'HttpTriggerWithParameters-',
    'ScheduledMail-',
    'SendGrid-',
    'FaceLocator-',
    'ImageResizer-',
    'SasToken-',
    'ManualTrigger-',
    'CDS-',
    'AppInsightsHttpAvailability-',
    'AppInsightsRealtimePowerBI-',
    'AppInsightsScheduledAnalytics-',
    'AppInsightsScheduledDigest-',
    'ExternalFileTrigger-',
    'ExternalTable-',
  ];
}

// NOTE: If you change any string values here, make sure you search for references to the values
// in any HTML templates first!
export class ScenarioIds {
  public static readonly addSiteConfigTab = 'AddSiteConfigTab';
  public static readonly addSiteFeaturesTab = 'AddSiteFeaturesTab';
  public static readonly getSiteSlotLimits = 'GetSiteSlotLimits';
  public static readonly showSiteAvailability = 'ShowSiteAvailability';
  public static readonly addResourceExplorer = 'AddResourceExplorer';
  public static readonly addPushNotifications = 'AddPushNotifications';
  public static readonly addMsi = 'AddMsi';
  public static readonly addTinfoil = 'AddTinfoil';
  public static readonly addSiteQuotas = 'ShowSiteQuotas';
  public static readonly addTopLevelAppsNode = 'AddTopLevelAppsNode';
  public static readonly addLogicApps = 'AddLogicApps';
  public static readonly appInsightsConfigurable = 'AppInsightsConfigurable';
  public static readonly addScaleUp = 'AddScaleUp';
  public static readonly addSiteFileStorage = 'ShowSiteFileStorage';
  public static readonly addDiagnoseAndSolve = 'AddDiagnoseAndSolve';
  public static readonly addWebServerLogging = 'AddWebServerLogging';
  public static readonly enablePushNotifications = 'EnablePushNotifications';
  public static readonly enableDiagnosticLogs = 'EnableDiagnosticLogs';
  public static readonly enableAuth = 'EnableAuth';
  public static readonly enableNetworking = 'EnableNetworking';
  public static readonly enableAppServiceEditor = 'EnableAppServiceEditor';
  public static readonly enableExtensions = 'EnableExtensions';
  public static readonly enableLogStream = 'EnableLogStream';
  public static readonly enableProcessExplorer = 'EnableProcessExplorer';
  public static readonly enableMetrics = 'EnableMetrics';
  public static readonly enableBackups = 'EnableBackups';
  public static readonly enableTinfoil = 'EnableTinfoil';
  public static readonly enableFunctionLogStreaming = 'EnableFunctionLogStreaming';
  public static readonly dotNetFrameworkSupported = 'DotNetFrameworkSupported';
  public static readonly platform64BitSupported = 'Platform64BitSupported';
  public static readonly webSocketsSupported = 'WebSocketsSupported';
  public static readonly classicPipelineModeSupported = 'ClassicPipelineModeSupported';
  public static readonly remoteDebuggingSupported = 'RemoteDebuggingSupported';
  public static readonly useOldScaleUpBlade = 'UseOldScaleUpBlade';
  public static readonly useOldActivityLogBlade = 'UseOldActivityLogBlade';
  public static readonly pricingTierApiEnabled = 'PricingTierApiEnabled';
  public static readonly phpSupported = 'phpSupported';
  public static readonly pythonSupported = 'PythonSupported';
  public static readonly javaSupported = 'JavaSupported';
  public static readonly defaultDocumentsSupported = 'DefaultDocumentsSupported';
  public static readonly autoSwapSupported = 'AutoSwapSupported';
  public static readonly handlerMappingsSupported = 'HandlerMappingsSupported';
  public static readonly virtualDirectoriesSupported = 'VirtualDirectoriesSupported';
  public static readonly enableDiagnoseAndSolve = 'EnableDiagnoseAndSolve';
  public static readonly showSitePin = 'ShowSitePin';
  public static readonly showCreateRefreshSub = 'ShowCreateRefreshSub';
  public static readonly showSideNavMenu = 'ShowSideNavMenu';
  public static readonly enablePlatform64 = 'EnablePlatform64';
  public static readonly enableAlwaysOn = 'EnableAlwaysOn';
  public static readonly enableRemoteDebugging = 'EnableRemoteDebugging';
  public static readonly deleteAppDirectly = 'deleteAppDirectly';
  public static readonly enableAutoSwap = 'EnableAutoSwap';
  public static readonly enableSlots = 'EnableSlots';
  public static readonly createApp = 'createApp';
  public static readonly filterAppNodeChildren = 'FilterAppNodeChildren';
  public static readonly headerOnTopOfSideNav = 'headerOnTopOfSideNav';
  public static readonly topBarWarning = 'TopBarWarning';
  public static readonly userMenu = 'UserMenu';
  public static readonly standAloneUserMenu = 'StandAloneUserMenu';
  public static readonly useCustomFunctionInputPicker = 'UseCustomFunctionInputPicker';
  public static readonly quickStartLink = 'QuickStartLink';
  public static readonly webSocketsEnabled = 'WebSocketsEnabled';
  public static readonly functionBeta = 'FunctionBeta';
  public static readonly noPaddingOnSideNav = 'NoPaddingOnSideNav';
  public static readonly downloadWithAppSettings = 'DownloadWithAppSettings';
  public static readonly downloadWithVsProj = 'DownloadWithVsProj';
  public static readonly openOldWebhostingPlanBlade = 'OpenOldWebhostingPlanBlade';
  public static readonly listExtensionsArm = 'ListExtensionsArm';
  public static readonly enableExportToPowerApps = 'EnableExportToPowerApps';
  public static readonly disabledBindings = 'disabledBindings';
  public static readonly monitoring = 'monitoring';
  public static readonly addFTPOptions = 'addFTPOptions';
  public static readonly addHTTPSwitch = 'addHTTPSwitch';
  public static readonly vstsDeploymentHide = 'vstsDeploymentHide';
  public static readonly vstsDeploymentPermission = 'vstsDeploymentPermission';
  public static readonly deploymentCenter = 'deploymentCenter';
  public static readonly vstsKuduSource = 'vstsKuduSource';
  public static readonly vstsSource = 'vstsSource';
  public static readonly githubSource = 'githubSource';
  public static readonly bitbucketSource = 'bitbucketSource';
  public static readonly localGitSource = 'localGitSource';
  public static readonly onedriveSource = 'onedriveSource';
  public static readonly dropboxSource = 'dropboxSource';
  public static readonly externalSource = 'externalSource';
  public static readonly ftpSource = 'ftpSource';
  public static readonly canScaleForSlots = 'canScaleForSlots';
  public static readonly byosSupported = 'byosSupported';
  public static readonly configureAADSupported = 'configureAADSupported';
  public static readonly addScaleOut = 'addScaleOut';
  public static readonly alwaysOnSupported = 'alwaysOnSupported';
  public static readonly enableConsole = 'EnableConsole';
  public static readonly enableLinkAPIM = 'EnableLinkAPIM';
  public static readonly appDensity = 'appDensity';
  public static readonly enableKudu = 'EnableKudu';
  public static readonly enableCORS = 'EnableCORS';
  public static readonly enableQuotas = 'EnableQuotas';
  public static readonly hasRoleAssignmentPermission = 'hasRoleAssignmentPermission';
  public static readonly containerSettings = 'containerSettings';
  public static readonly isPublishProfileBasedDeploymentEnabled = 'isPublishProfileBasedDeploymentEnabled';
  public static readonly enableGitHubAction = 'enableGitHubAction';
  public static readonly tipSupported = 'tipSupported';
}

export class NationalCloudArmUris {
  public static readonly fairfax = 'https://management.usgovcloudapi.net';
  public static readonly blackforest = 'https://management.microsoftazure.de';
  public static readonly mooncake = 'https://management.chinacloudapi.cn';
  public static readonly usNat: 'https://management.azure.eaglex.ic.gov';
  public static readonly usSec: 'https://management.azure.microsoft.scloud';
}

export class LogCategories {
  public static readonly FunctionEdit = 'FunctionEdit';
  public static readonly FunctionMonitor = 'FunctionMonitor';
  public static readonly SideNav = 'SideNav';
  public static readonly siteDashboard = 'SiteDashboard';
  public static readonly scenarioService = 'ScenarioService';
  public static readonly apiDetails = 'ApiDetails';
  public static readonly broadcastService = 'BroadcastService';
  public static readonly newSlot = 'NewSlot';
  public static readonly svgLoader = 'SvgLoader';
  public static readonly busyState = 'BusyState';
  public static readonly quotaService = 'QuotaService';
  public static readonly siteConfig = 'SiteConfig';
  public static readonly logStreamLoad = 'LogStreamLoad';
  public static readonly generalSettings = 'GeneralSettings';
  public static readonly appSettings = 'AppSettings';
  public static readonly connectionStrings = 'ConnectionStrings';
  public static readonly defaultDocuments = 'DefaultDocuments';
  public static readonly handlerMappings = 'HandlerMappings';
  public static readonly virtualDirectories = 'VirtualDirectories';
  public static readonly logicapps = 'LogicApps';
  public static readonly subsCriptions = 'SubsCriptions';
  public static readonly functionAppSettings = 'FunctionAppSettings';
  public static readonly swaggerDefinition = 'SwaggerDefinition';
  public static readonly binding = 'Binding';
  public static readonly functionNew = 'FunctionNew';
  public static readonly cicd = 'CICD';
  public static readonly telemetry = 'Telemetry';
  public static readonly specPicker = 'SpecPicker';
  public static readonly featureComponent = 'FeatureComponent';
  public static readonly deploymentSlots = 'DeploymentSlots';
  public static readonly swapSlots = 'SwapSlots';
  public static readonly addSlot = 'AddSlot';
  public static readonly applicationInsightsQuery = 'ApplicationInsightsQuery';
  public static readonly applicationInsightsConfigure = 'ApplicationInsightsConfigure';
  public static readonly applicationInsightsKeyNotFound = 'ApplicationInsightsInstrumentationKeyNotFound';
  public static readonly serverFarm = 'ServerFarm';
  public static readonly syncTriggers = 'syncTriggers';
  public static readonly functionHostRestart = 'functionHostRestart';
  public static readonly containerACR = 'containerACR';
  public static readonly containerSettings = 'containerSettings';
  public static readonly byos = 'byos';
  public static readonly portalServiceHasPermission = 'PortalServiceHasPermission';
  public static readonly portalServiceHasLock = 'PortalServiceHasLock';
}

export class ARMApiVersions {
  public static antaresApiVersion20181101 = '2018-11-01';
  public static armApiVersion = '2014-04-01';
  public static acrApiversion = '2017-03-01';
  public static acrWebhookApiVersion = '2017-10-01';
  public static serviceBusAndEventHubApiVersion20150801 = '2015-08-01';
  public static storageApiVersion = '2018-07-01';
  public static stacksApiVersion20200501 = '2020-05-01';
}
export class SubscriptionQuotaIds {
  public static readonly dreamSparkQuotaId = 'DreamSpark_2015-02-01';
}

export class KeyCodes {
  public static readonly tab = 9;
  public static readonly enter = 13;
  public static readonly shiftLeft = 16;
  public static readonly space = 32;
  public static readonly escape = 27;
  public static readonly end = 35;
  public static readonly home = 36;
  public static readonly arrowLeft = 37;
  public static readonly arrowUp = 38;
  public static readonly arrowRight = 39;
  public static readonly arrowDown = 40;
  public static readonly delete = 46;
  public static readonly f2 = 113;
  public static readonly backspace = 8;
  public static readonly ctrl = 17;
  public static readonly f1 = 112;
  public static readonly scrollLock = 145;
  public static readonly leftWindow = 91;
  public static readonly select = 93;
  public static readonly c = 67;
  public static readonly v = 86;
  public static readonly unknown = 229;
}

export class ExtensionInstallStatusConstants {
  public static readonly Started = 'Started';
  public static readonly Succeeded = 'Succeeded';
  public static readonly Failed = 'Failed';
}

export class DomEvents {
  public static readonly keydown = 'keydown';
  public static readonly click = 'click';
}

export class RuntimeImage {
  public static readonly v1 = 'v1';
  public static readonly v2 = 'v2';
  public static readonly custom = 'custom';
}

export class HttpConstants {
  public static readonly statusCodeMap = {
    0: 'Unknown HTTP Error',
    100: 'Continue',
    101: 'Switching Protocols',
    102: 'Processing',
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non-Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    305: 'Use Proxy',
    306: '(Unused)',
    307: 'Temporary Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Request Entity Too Large',
    414: 'Request-URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Requested Range Not Satisfiable',
    417: 'Expectation Failed',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'HTTP Version Not Supported',
  };

  public static readonly genericStatusCodeMap = {
    100: 'Informational',
    200: 'Success',
    300: 'Redirection',
    400: 'Client Error',
    500: 'Server Error',
  };
}

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

export class ComponentNames {
  public static functionMonitor = 'function-monitor';
  public static monitorClassic = 'monitor-classic';
  public static monitorApplicationInsights = 'monitor-applicationinsights';
  public static tableFunctionMonitor = 'table-function-monitor';
  public static monitorDetails = 'monitor-details';
  public static monitorConfigure = 'monitor-configure';
  public static newProxy = 'new-proxy';
}

export class WorkerRuntimeLanguages {
  public static dotnet = 'C#';
  public static node = 'JavaScript';
  public static nodejs = 'JavaScript';
  public static python = 'Python';
  public static java = 'Java';
  public static powershell = 'PowerShell';
}

export class ConsoleConstants {
  public static readonly linuxNewLine = '\n\n';
  public static readonly windowsNewLine = '\r\n';
  public static readonly singleBackslash = '\\';
  public static readonly singleForwardSlash = '/';
  public static readonly currentDirectory = '.';
  public static readonly previousDirectory = '..';
  public static readonly successExitcode = 0;
  public static readonly whitespace = ' ';
  public static readonly newLine = '\n';
  // commands
  public static readonly exit = 'exit';
  public static readonly changeDirectory = 'cd';
  public static readonly windowsClear = 'cls';
  public static readonly linuxClear = 'clear';
}

export enum LogLevel {
  Unknown = -1,
  Normal = 1,
  Info = 2,
  Error = 3,
  Warning = 4,
}

export class PickerNames {
  public static readonly appSetting = 'AppSetting';
  public static readonly cosmosDB = 'CosmosDB';
  public static readonly createDataBlade = 'CreateDataConnectionBlade';
  public static readonly eventHub = 'EventHub';
  public static readonly notificationHub = 'NotificationHub';
  public static readonly notificationHubBlade = 'NotificationHubPickerBlade';
  public static readonly serviceBus = 'ServiceBus';
  public static readonly sql = 'Sql';
  public static readonly storage = 'Storage';
  public static readonly storageBlade = 'StorageAccountPickerBlade';
}

export class ContainerConstants {
  public static readonly dockerPrefix = 'DOCKER';
  public static readonly composePrefix = 'COMPOSE';
  public static readonly kubernetesPrefix = 'KUBE';
  public static readonly dockerHubUrl = 'https://index.docker.io';
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

export class WebhookTypes {
  public static readonly github = 'github';
  public static readonly genericjson = 'genericjson';
}

export enum SlotOperationState {
  started = 'STARTED',
  completed = 'COMPLETED',
  trackingAborted = 'TRACKING_ABORTED',
}

export enum SwapOperationType {
  slotsSwap = 'slotsswap',
  applySlotConfig = 'applySlotConfig',
  resetSlotConfig = 'resetSlotConfig',
}

export class FeatureFlags {
  public static UseNewSlotsBlade = 'UseNewSlotsBlade';
  public static ShowLegacySlotsBlade = 'ShowLegacySlotsBlade';
  public static oldDeploymentCenter = 'oldvsts';
  public static AllowFreeLinux = 'allowfreelinux';
  public static enablePublishProfileBasedDeployment = 'enablePublishProfileBasedDeployment';
  public static targetAzDevDeployment = 'targetAzDevDeployment';
  public static authTokenOverride = 'authTokenOverride';
  public static EnableAIOnNationalCloud = 'EnableAIOnNationalCloud';
}

export class SupportedFeatures {
  public static ElasticScaleOut = 'ElasticScaleOut';
}

export enum FunctionAppVersion {
  v1 = 'V1',
  v2 = 'V2',
  v3 = 'V3',
}

export enum FunctionAppRuntimeSetting {
  tilda1 = '~1',
  tilda2 = '~2',
  tilda3 = '~3',
}

export enum HostKeyTypes {
  masterKey = 'masterKey',
  functionKeys = 'functionKeys',
  systemKeys = 'systemKeys',
}

export class Pricing {
  public static hoursInAzureMonth = 730;
  public static secondsInAzureMonth = 2628000;
}

export class RuntimeStacks {
  public static aspnet = 'dotnet';
  public static node = 'node';
  public static python = 'python';
  public static dotnetcore = 'dotnetcore';
  public static java8 = 'java-8';
  public static java11 = 'java-11';
}

export class Os {
  public static linux: 'linux' | 'windows' = 'linux';
  public static windows: 'linux' | 'windows' = 'windows';
}

export class JavaVersions {
  public static WindowsVersion8 = '1.8';
  public static WindowsVersion11 = '11';
  public static LinuxVersion8 = 'java8';
  public static LinuxVersion11 = 'java11';
}

export class JavaContainers {
  public static JavaSE = 'java';
  public static Tomcat = 'tomcat';
}
