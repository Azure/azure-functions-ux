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
    window.location.hostname === "localhost" || window.appsvc.env.runtimeType === "Standalone"
        ? `https://${window.location.hostname}:${window.location.port}/`
        : `https://${window.location.hostname}/`;

    public static runtimeVersion: string;
    public static routingExtensionVersion: string;
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

    public static httpMethods = new HttpMethods();
    public static swaggerSecretName = 'swaggerdocumentationkey';
    public static portalHostName = 'https://portal.azure.com';
    public static webAppsHostName = 'https://web1.appsvcux.ext.azure.com';
    public static msPortalHostName = 'https://ms.portal.azure.com';
    public static ReadWriteMode = 'readWrite'.toLocaleLowerCase();
    public static ReadOnlyMode = 'readOnly'.toLocaleLowerCase();
}

export class TabCommunicationVerbs {
    public static getStartInfo = "get-startup-info";
    public static sentStartInfo = "startup-info";
    public static updatedFile = "updated-file-notice"
    public static newToken = "new-token";
    public static parentClosed = "parent-window-closed";
}


export type EnableTabFeature = 'tabs' | 'inplace' | null;

export class SiteTabIds {
    public static readonly overview = "overview";
    public static readonly monitor = "monitor";
    public static readonly features = "platformFeatures";
    public static readonly functionRuntime = "functionRuntimeSettings";
    public static readonly apiDefinition = "apiDefinition";
    public static readonly config = "config";
    public static readonly applicationSettings = "appSettings";
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
    public static slotsHostId = "slotsBlobStorage"
}

export class Validations {
    public static websiteNameMinLength: number = 2;
    public static websiteNameMaxLength: number = 60;
}

export class Regex {
    public static invalidEntityName: RegExp = /[^\u00BF-\u1FFF\u2C00-\uD7FF\a-zA-Z0-9-]/;//matches any character(i.e. german, chinese, english) or -
}

export class Links {
    public static standaloneCreateLearnMore = "https://go.microsoft.com/fwlink/?linkid=848756";
}

export class LocalStorageKeys {
    public static readonly siteTabs = "/site/tabs"
}

export class Order {
    public static templateOrder: string[] =
    [
        'HttpTrigger-',
        'TimerTrigger-',
        'QueueTrigger-',
        'BlobTrigger-',
        'EventHubTrigger-',
        'ServiceBusQueueTrigger-',
        'ServiceBusTopicTrigger-',
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

export class KeyCodes {
    public static readonly tab = 9;
    public static readonly enter = 13;
    public static readonly shiftLeft = 16;
    public static readonly space = 32;
    public static readonly escape = 27;
    public static readonly arrowLeft = 37;
    public static readonly arrowUp = 38;
    public static readonly arrowRight = 39;
    public static readonly arrowDown = 40;
}

export class DomEvents{
    public static readonly keydown = 'keydown';
    public static readonly click = 'click';
}