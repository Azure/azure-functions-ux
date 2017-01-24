import {Subscription} from './subscription';

export interface Event {
    data: Data;
}

export interface Data{
    signature: string;
    kind: string;
    data: any;
}

export interface StartupInfo{
    token : string;
    subscriptions : Subscription[];
    sessionId: string;
    acceptLanguage : string,
    effectiveLocale : string
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
    public static getStartupInfo = "get-startup-info";
    public static openBlade = "open-blade";
    public static closeBlades = "close-blades";
    public static openBladeWithInputs = "open-blade-inputs";
    public static logAction = "log-action";
    public static logMessage = "log-message";
    public static setDirtyState = "set-dirtystate";
    public static setupOAuth = "setup-oauth";

    // Requests from Ibiza
    public static sendStartupInfo = "send-startup-info";
    public static sendResourceId = "send-resourceId";
    public static sendAppSettingName = "send-appSettingName";
    public static sendToken = "send-token";
    public static sendOAuthInfo = "send-oauth-info";
}

export enum LogEntryLevel {
    Custom = -2,
    Debug = -1,
    Verbose = 0,
    Warning = 1,
    Error = 2,
}

// Mainly used for Ibiza legacy reasons
export interface WebsiteId {
    Name: string;
    ResourceGroup: string;
    SubscriptionId: string;
}

export interface OpenBladeInfo{
    detailBlade: string,
    detailBladeInputs: any,
    extension? : string
}