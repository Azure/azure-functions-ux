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

export class SiteTabIds{
    public static overview = "Overview";
    public static monitor = "Monitor";
    public static features = "Platform features";
    public static functionRuntime = "Settings";
    public static apiDefinition = "API Definition";
    public static troubleshoot = "Troubleshoot";
    public static deploymentSource = "Deployment Source";
    public static config = "Config";
}

export class Arm{
    public static MaxSubscriptionBatchSize = 40;
}

export class AvailabilityStates{
    public static unknown = 'unknown';
    public static unavailable = 'unavailable';
    public static available = 'available';

    // Not entirely sure what this means, but it seems to be synonymous with unavailable
    public static userinitiated = 'userinitiated';
}

export class NotificationIds{
    public static alwaysOn = 'alwaysOn';
    public static newRuntimeVersion = 'newRuntimeVersion';
    public static slotsHostId = "slotsBlobStorage"
}

export class Validations{
    public static websiteNameMinLength: number = 2;
    public static websiteNameMaxLength: number = 60;
}

export class Regex{
    public static invalidEntityName: RegExp = /[^\u00BF-\u1FFF\u2C00-\uD7FF\a-zA-Z0-9-]/;//matches any character(i.e. german, chinese, english) or -
}

export class Links{
    public static standaloneCreateLearnMore = "https://go.microsoft.com/fwlink/?linkid=848756";
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

export class KeyCodes{
    public static readonly enter = 13;
    public static readonly arrowLeft = 37;
    public static readonly arrowUp = 38;
    public static readonly arrowRight = 39;
    public static readonly arrowDown = 40;
}




export class Version {
    public static Off: any = "";
}

export class NodeVersion {
    public static Off: any = "";
}

export class RubyVersion {
    public static Off: any = "";
}

export class PhpVersion {
    public static Off: string = "";
}

export class JavaVersion {
    public static Off: string = "";
}

export class AvailableStackNames {
    public static NetStack: string = "aspnet";
    public static DotNetCore: string = "dotnetcore";
    public static NodeStack: string = "node";
    public static PhpStack: string = "php";
    public static CustomContainer: string = "custom";
    public static PythonStack: string = "python";
    public static JavaStack: string = "java";
    public static RubyStack: string = "ruby";
    public static JavaContainer: string = "javaContainers";
}

export class AvailableStackLabels {
    public static NodeJs: string = "Node.js";
    public static Php: string = "PHP";
    public static DotNetCore: string = ".Net Core";
    public static Ruby: string = "Ruby";
}

export class StackConfigKeys {
    public static NetStack: string = "netFrameworkVersion";
    //public static DotNetCore: string = "";
    public static NodeStack: string = "nodeVersion";
    public static PhpStack: string = "phpVersion";
    public static CustomContainer: string = "custom";
    public static PythonStack: string = "pythonVersion";
    public static JavaStack: string = "javaVersion";
    public static JavaContainer: string = "javaContainerVersion";
}