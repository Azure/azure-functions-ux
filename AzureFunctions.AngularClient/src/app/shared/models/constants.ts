
export class HttpMethods {
    public GET = "get";
    public POST = "post";
    public DELETE = "delete";
    public HEAD = "head";
    public PATCH = "patch";
    public PUT = "put";
    public OPTIONS = "options";
    public TRACE = "trace";

    constructor() { }
}

export class Constants {
    public static serviceHost =
        window.location.hostname === "localhost" || window.appsvc.env.runtimeType === "Standalone" || window.appsvc.env.runtimeType === "OnPrem"
        ? `https://${window.location.hostname}:${window.location.port}/`
        : `https://${window.location.hostname}/`;

    public static nodeVersion = '6.5.0';
    public static latest = 'latest';
    public static disabled = 'disabled';
    public static runtimeVersionAppSettingName = 'FUNCTIONS_EXTENSION_VERSION';
    public static nodeVersionAppSettingName = 'WEBSITE_NODE_DEFAULT_VERSION';
    public static azureJobsExtensionVersion = 'AZUREJOBS_EXTENSION_VERSION';
    public static routingExtensionVersionAppSettingName = 'ROUTING_EXTENSION_VERSION';
    public static functionAppEditModeSettingName = 'FUNCTION_APP_EDIT_MODE';
    public static instrumentationKeySettingName = 'APPINSIGHTS_INSTRUMENTATIONKEY';
    public static slotsSecretStorageSettingsName = "AzureWebJobsSecretStorageType";
    public static slotsSecretStorageSettingsValue = "Blob";
    public static contentShareConfigSettingsName = "WEBSITE_CONTENTSHARE";
    public static azureWebJobsDashboardSettingsName = 'AzureWebJobsDashboard';

    public static httpMethods = new HttpMethods();
    public static swaggerSecretName = 'swaggerdocumentationkey';
    public static eventGridName = 'eventgridextensionconfig_extension';

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
    public static WebhookHandlerFunctionName = "RefreshO365Subscriptions";
    public static WebhookHandlerFunctionId = "TimerTrigger-CSharpWebhookHandler";
    public static WebhookFunctionName = "MSGraphWebhook";
}

export class TabCommunicationVerbs {
    public static getStartInfo = "get-startup-info";
    public static sentStartInfo = "startup-info";
    public static updatedFile = "updated-file-notice"
    public static newToken = "new-token";
    public static parentClosed = "parent-window-closed";
}

export class SiteTabIds {
    public static readonly overview = "overview";
    public static readonly monitor = "monitor";
    public static readonly features = "platformFeatures";
    public static readonly functionRuntime = "functionRuntimeSettings";
    public static readonly apiDefinition = "apiDefinition";
    public static readonly config = "config";
    public static readonly applicationSettings = "appSettings";
    public static readonly logicApps = "logicApps";
}

export class Arm {
    public static MaxSubscriptionBatchSize = 40;
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
}

export class Validations {
    public static websiteNameMinLength: number = 2;
    public static websiteNameMaxLength: number = 60;
}

export class Regex {
    public static readonly invalidEntityName: RegExp = /[^\u00BF-\u1FFF\u2C00-\uD7FF\a-zA-Z0-9-]/;//matches any character(i.e. german, chinese, english) or -
    public static readonly header: RegExp = /^[a-zA-Z0-9\-_]+$/;
    public static readonly functionName: RegExp = /^[a-zA-Z][a-zA-Z0-9_\-]{0,127}$/;
}

export class Links {
    public static standaloneCreateLearnMore = "https://go.microsoft.com/fwlink/?linkid=848756";
    public static pythonLearnMore = "https://go.microsoft.com/fwlink/?linkid=852196";
    public static clientAffinityLearnMore = "https://go.microsoft.com/fwlink/?linkid=798249";
}

export class LocalStorageKeys {
    public static readonly siteTabs = '/site/tabs';
    public static readonly savedSubsKey = '/subscriptions/selectedIds';
}

export class Order {
    public static templateOrder: string[] =
    [
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
        'ExternalTable-'
    ]
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
    public static readonly addConsole = 'AddConsole';
    public static readonly addSsh = 'AddSsh';
    public static readonly enablePushNotifications = 'EnablePushNotifications';
    public static readonly enableAuth = 'EnableAuth';
    public static readonly enableMsi = 'EnableMsi';
    public static readonly enableNetworking = 'EnableNetworking';
    public static readonly enableAppServiceEditor = 'EnableAppServiceEditor';
    public static readonly enableExtensions = 'EnableExtensions';
    public static readonly enableLogStream = 'EnableLogStream';
    public static readonly enableProcessExplorer = 'EnableProcessExplorer';
    public static readonly enableBackups = 'EnableBackups';
    public static readonly enableTinfoil = 'EnableTinfoil';
    public static readonly addSiteFileStorage = 'ShowSiteFileStorage';
    public static readonly showSitePin = 'ShowSitePin';
    public static readonly showCreateRefreshSub = 'ShowCreateRefreshSub';
    public static readonly enablePlatform64 = 'EnablePlatform64';
    public static readonly enableAlwaysOn = 'EnableAlwaysOn';
    public static readonly deleteAppDirectly = 'deleteAppDirectly';
    public static readonly enableAutoSwap = 'EnableAutoSwap';

    public static readonly createApp = 'createApp';
    public static readonly filterAppNodeChildren = 'FilterAppNodeChildren';
    public static readonly headerOnTopOfSideNav = 'headerOnTopOfSideNav';
    public static readonly topBarWarning = 'TopBarWarning';
    public static readonly userMenu = 'UserMenu';
    public static readonly standAloneUserMenu = 'StandAloneUserMenu';
    public static readonly useCustomFunctionInputPicker = 'UseCustomFunctionInputPicker';
    public static readonly quickStartLink = 'QuickStartLink';
    public static readonly noPaddingOnSideNav = 'NoPaddingOnSideNav';
    public static readonly downloadWithAppSettings = 'DownloadWithAppSettings';
    public static readonly downloadWithVsProj = 'DownloadWithVsProj';
}

export class ServerFarmSku {
    public static readonly free = 'Free';
    public static readonly shared = 'Shared';
    public static readonly basic = 'Basic';
    public static readonly standard = 'Standard';
    public static readonly premium = 'Premium';
    public static readonly premiumV2 = 'PremiumV2';
    public static readonly isolated = 'Isolated';
    public static readonly dynamic = 'Dynamic';
}

export class NationalCloudArmUris {
    public static readonly fairfax = 'https://management.usgovcloudapi.net';
    public static readonly blackforest = 'https://management.microsoftazure.de';
    public static readonly mooncake = 'https://management.chinacloudapi.cn';
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
    public static readonly siteConfig = 'SiteConfig';
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
}

export class ExtensionInstallStatus {
    public static readonly Started = 'Started';
    public static readonly Succeeded = 'Succeeded';
    public static readonly Failed = 'Failed';
}

export class DomEvents {
    public static readonly keydown = 'keydown';
    public static readonly click = 'click';
}

export class RuntimeImage {
    public static readonly v1 = "v1";
    public static readonly v2 = "v2";
    public static readonly custom = "custom";
}