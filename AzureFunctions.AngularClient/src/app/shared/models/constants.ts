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
    public static serviceHost: string = (window.location.hostname === "localhost") ? "https://localhost:44300/" : "";

    public static runtimeVersion: string;
    public static routingExtensionVersion: string;
    public static nodeVersion = "6.5.0";
    public static latest = "latest";
    public static disabled = "disabled";
    public static runtimeVersionAppSettingName = "FUNCTIONS_EXTENSION_VERSION";
    public static nodeVersionAppSettingName = "WEBSITE_NODE_DEFAULT_VERSION";
    public static azureJobsExtensionVersion = "AZUREJOBS_EXTENSION_VERSION";
    public static routingExtensionVersionAppSettingName = "ROUTING_EXTENSION_VERSION";
    public static httpMethods = new HttpMethods();
}

export class SiteTabNames{
    public static overview = "Overview";
    public static monitor = "Monitor";
    public static features = "Features";
    public static functionRuntime = "Function App Runtime";
    public static apiDefinition = "API Definition";
    public static troubleshoot = "Troubleshoot";
    public static deploymentSource = "Deployment Source";
}

export class Arm{
    public static MaxSubscriptionBatchSize = 40;
}

export class AvailabilityStates{
    public static unknown = "unknown";
    public static unavailable = "unavailable";
    public static available = "available";

    // Not entirely sure what this means, but it seems to be synonymous with unavailable
    public static userinitiated = "userinitiated";
}