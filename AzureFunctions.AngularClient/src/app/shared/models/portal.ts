import { Subscription } from './subscription';

export interface Event {
    data: Data;
}

export interface Data {
    signature: string;
    kind: string;
    data: any;
}

export interface GetStartupInfo {
    iframeHostName: string
}

export interface StartupInfo {
    token: string;
    subscriptions: Subscription[];
    sessionId: string;
    acceptLanguage: string,
    effectiveLocale: string,
    resourceId: string
}

export interface Action {
    subcomponent: string;
    action: string;
    data: any;  // Properties of the object will be logged as a key-value pair
}

export interface Message {
    level: LogEntryLevel,
    message: string,
    restArgs: any[]
}

export class Verbs {
    // Initialization verbs
    public static message = "message";
    public static ready = "ready";

    // Requests from iframe
    public static getStartupInfo = "get-startup-info";
    public static openBlade = "open-blade";

    public static openBladeCollector = "open-blade-collector";                // Deprecated
    public static openBladeCollectorInputs = "open-blade-collector-inputs";   // Deprecated
    public static updateBladeInfo = "update-blade-info";

    public static closeBlades = "close-blades";
    public static logAction = "log-action";
    public static logMessage = "log-message";
    public static logTimerEvent = "log-timer-event";
    public static setDirtyState = "set-dirtystate";
    public static setupOAuth = "setup-oauth";
    public static pinPart = "pin-part";
    public static setNotification = "set-notification";

    // Requests from Ibiza
    public static sendStartupInfo = "send-startup-info";
    public static sendAppSettingName = "send-appSettingName";
    public static sendResourceId = "send-resourceId";
    public static sendInputs = "send-inputs";
    public static sendToken = "send-token";
    public static sendOAuthInfo = "send-oauth-info";
    public static sendNotificationStarted = "send-notification-started";
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

export interface OpenBladeInfo {
    detailBlade: string,
    detailBladeInputs: any,
    extension?: string
}

export interface TimerEvent {
    timerId: string;
    timerAction: 'start' | 'stop';
}

export interface UpdateBladeInfo {
    title?: string,
    subtitle?: string
};

export interface PinPartInfo {
    partSize: PartSize;
    partInput: any,
}

export interface NotificationInfo {
    id?: string,
    state: string,  // start, success, fail
    title: string,
    description: string
}

export interface NotificationStartedInfo {
    id: string
}

export enum PartSize {
    /**
     * A tile that is 1 column x 1 row.
     */
    Mini = 0,
    /**
     * A tile that is 2 columns x 1 row.
     */
    Small = 1,
    /**
     * A tile that is 2 columns x 2 rows.
     */
    Normal = 2,
    /**
     * A tile that is 4 columns x 2 rows.
     */
    Wide = 3,
    /**
     * A tile that is 2 columns x 4 rows.
     */
    Tall = 4,
    /**
     * A tile that is 6 columns x 4 rows.
     */
    HeroWide = 5,
    /**
     * A tile that is 4 columns x 6 rows.
     */
    HeroTall = 6,
    /**
     * A tile that is 6 columns by unbounded rows that fits the content.
     */
    HeroWideFitHeight = 7,
    /**
     * A tile that expands all the available columns by unbounded rows that fits the content.
     */
    FullWidthFitHeight = 8,
    /**
     * A tile that fits all the available space of the content area it occupies.
     */
    FitToContainer = 9,
    /**
     * A tile that is 4 columns x 4 rows.
     */
    Large = 10,
    /**
     * A tile that is 6 columns x 6 rows.
     */
    Hero = 11,
    /**
     * A tile with a custom size.
     */
    Custom = 99,
}
