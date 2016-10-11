export class HttpMethods {
    public GET = "GET";
    public POST = "POST";
    public DELETE = "DELETE";
    public HEAD = "HEAD";
    public PATCH = "PATCH";
    public PUT = "PUT";

    constructor() { }
}

export class Constants {
    public static runtimeVersion: string;
    public static nodeVersion = "6.5.0";
    public static latest = "latest";
    public static runtimeVersionAppSettingName = "FUNCTIONS_EXTENSION_VERSION";
    public static nodeVersionAppSettingName = "WEBSITE_NODE_DEFAULT_VERSION";
    public static httpMethods = new HttpMethods();
}