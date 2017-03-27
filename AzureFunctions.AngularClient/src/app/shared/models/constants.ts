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
    public static swaggerSecretName = "swaggerdocumentationkey";
    public static portalHostName = "https://portal.azure.com";
    public static webAppsHostName = "https://web1.appsvcux.ext.azure.com";
}