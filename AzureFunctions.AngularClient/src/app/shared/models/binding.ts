import { AADPermissions } from './microsoft-graph';

export class BindingType {
    static timerTrigger = 'timerTrigger';
    static eventHubTrigger = 'eventHubTrigger';
    static eventHub = 'eventHub';
    static queue = 'queue';
    static queueTrigger = 'queueTrigger';
    static sqlQueueTrigger = 'sqlQueueTrigger';
    static blob = 'blob';
    static blobTrigger = 'blobTrigger';
    static apiHubFile = 'apiHubFile';
    static apiHubFileTrigger = 'apiHubFileTrigger';
    static apiHubTable = 'apiHubTable';
    static httpTrigger = 'httpTrigger';
    static http = 'http';
    static table = 'table';
    static serviceBus = 'serviceBus';
    static bot = 'bot';
    static serviceBusTrigger = 'serviceBusTrigger';
    static manualTrigger = 'manualTrigger';
    static documentDB = 'documentDB';
    static mobileTable = 'mobileTable';
    static notificationHub = 'notificationHub';
    static sendGrid = 'sendGrid';
    static twilioSms = 'twilioSms';
    static aadtoken = 'aadToken';
    static excel = 'excel';
    static token = 'token';
    static outlook = 'outlook';
    static onedrive = 'onedrive';
    static graphWebhookSubscription = 'graphWebhookSubscription';
    static graphWebhookTrigger = 'graphWebhookTrigger';
    static GraphWebhookCreator = 'GraphWebhookCreator';
    static eventGridTrigger = 'eventGridTrigger';
    static cosmosDBTrigger = 'cosmosDBTrigger';
    static activityTrigger = 'activityTrigger';
    static orchestrationTrigger = 'orchestrationTrigger';
    static orchestrationClient = 'orchestrationClient';
}

export interface BindingConfig {
    $schema: string;
    contentVersion: string;
    variables: any;
    bindings: Binding[];
}

export interface Binding {
    type: BindingType;
    displayName: string;
    documentation: string;
    direction: DirectionType;
    settings: Setting[];
    rules: Rule[];
    warnings: Warning[];
    filters?: string[];
    enabledInTryMode?: boolean;
    actions: Action[];
    AADPermissions?: AADPermissions[];
    extension?: RuntimeExtension;
}

export interface RuntimeExtension {
    id: string;
    version: string;
}

export interface Setting {
    name: string;
    value: string;
    resource?: ResourceType;
    required?: boolean;
    label: string;
    defaultValue?: any;
    help?: string;
    enum?: EnumOption[];
    validators?: Validator[];
    placeholder?: string;
    metadata?: any;
    isHidden?: boolean;
}

export interface Rule {
    type: string;
    values: RuleValue[];
    label: string;
    help: string;
    name: string;
}

export interface RuleValue {
    value: string;
    display: string;
    hiddenSettings: string[];
    shownSettings: string[];
    shownCheckboxOptions: CheckboxListOptions;
}

export interface CheckboxListOptions {
    name: string;
    values: EnumOption[];
}

export interface Warning {
    text: string;
    type: string;
    variablePath: string;
    visible?: boolean; // for UI only
}

export interface Validator {
    expression: string;
    errorText: string;
}

export interface EnumOption {
    value: string;
    display: string;
}

export enum DirectionType {
    trigger = <any>'trigger',
    in = <any>'in',
    out = <any>'out',
    inout = <any>'inout'
}

export enum ResourceType {
    Storage = <any>'Storage',
    Sql = <any>'Sql',
    EventHub = <any>'EventHub',
    ServiceBus = <any>'ServiceBus',
    DocumentDB = <any>'DocumentDB',
    ApiHub = <any>'ApiHub',
    AppSetting = <any>'AppSetting',
    MSGraph = <any>'MSGraph',
    NotificationHub = <any>'NotificationHub'
}

export enum SettingType {
    string = 'string',
    boolean = 'boolean',
    label = 'label',
    enum = 'enum',
    int = 'int',
    picker = 'picker',
    checkBoxList = 'checkBoxList',
    appSetting = 'appSetting',
    eventGrid = 'eventGrid'
}

export interface UIFunctionConfig {
    schema: string;
    version: string;
    bindings: UIFunctionBinding[];
    originalConfig: any;
}

export interface FunctionSetting {
    name: string;
    value: any;
    noSave?: boolean;
}

export interface FunctionBindingBase {
    type: BindingType;
    direction: DirectionType;
    enabledInTryMode: boolean;
}

export interface UIFunctionBinding extends FunctionBindingBase {
    id: string;
    name: string;
    title?: string;
    settings: FunctionSetting[];
    hiddenList?: string[];
    displayName: string;
    newBinding?: boolean;
    AADPermissions?: AADPermissions[];
    extension?: RuntimeExtension;
}

export interface Action {
    template: string;
    binding: string;
    settings: string[];

    settingValues: string[];
    templateId: string;
}
