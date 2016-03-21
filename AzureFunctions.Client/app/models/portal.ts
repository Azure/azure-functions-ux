export interface Event {
    data: Data;
}

export interface Data{
    signature: string;
    kind: string;
    data: string;
}

export interface Action {
    subcomponent: string;
    action: string;
    data: any;  // Properties of the object will be logged as a key-value pair
}

export class Verbs{
    public static message = "message";
    public static ready = "ready";
    public static getAuthToken = "get-auth-token";
    public static sendToken = "send-token";
    public static openBlade = "open-blade";
    public static sendResourceId = "send-resourceId";
    public static sendAppSettingName = "send-appSettingName";
    public static sendTokenRefresh = "send-token-refresh";
    public static logAction = "log-action";
}