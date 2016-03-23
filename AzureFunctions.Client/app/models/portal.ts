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

export interface Message{
    level : LogEntryLevel,
    message: string,
    restArgs: any[]
}

export class Verbs{
    // Initialization verbs
    public static message = "message";
    public static ready = "ready";

    // Requests from iframe
    public static getAuthToken = "get-auth-token";
    public static openBlade = "open-blade";
    public static logAction = "log-action";
    public static logMessage = "log-message";
    public static setDirtyState = "set-dirtystate";

    // Requests from Ibiza
    public static sendToken = "send-token";
    public static sendResourceId = "send-resourceId";
    public static sendAppSettingName = "send-appSettingName";
}

export enum LogEntryLevel {
    /**
     * Custom events.
     */
    Custom = -2,
    /**
     * Debug level.
     */
    Debug = -1,
    /**
     * Verbose level.
     */
    Verbose = 0,
    /**
     * Warning level.
     */
    Warning = 1,
    /**
     * Error level.
     */
    Error = 2,
}