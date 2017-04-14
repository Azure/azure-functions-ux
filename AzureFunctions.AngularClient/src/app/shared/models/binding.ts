export enum BindingType {
    timerTrigger = <any>"timerTrigger",
    eventHubTrigger = <any>"eventHubTrigger",
    eventHub = <any>"eventHub",
    queue = <any>"queue",
    queueTrigger = <any>"queueTrigger",
    blob = <any>"blob",
    blobTrigger = <any>"blobTrigger",
    apiHubFile = <any>"apiHubFile",
    apiHubFileTrigger = <any>"apiHubFileTrigger",
    apiHubTable = <any>"apiHubTable",
    httpTrigger = <any>"httpTrigger",
    http = <any>"http",
    table = <any>"table",
    serviceBus = <any>"serviceBus",
    bot = <any>"bot",
    serviceBusTrigger = <any>"serviceBusTrigger",
    manualTrigger = <any>"manualTrigger",
    documentDB = <any>"documentDB",
    mobileTable = <any>"mobileTable",
    notificationHub = <any>"notificationHub",
    sendGrid = <any>"sendGrid",
    twilioSms = <any>"twilioSms",
    aadtoken = <any>"aadtoken"
}

export interface BindingConfig {
    $shcema: string,
    contentVersion: string,
    variables: any,
    bindings: Binding[]
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
}

export interface Rule {
    type: string,
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
    trigger = <any>"trigger",
    in = <any>"in",
    out = <any>"out",
    inout = <any>"inout"
}

export enum ResourceType {
    Storage = <any>"Storage",
    EventHub = <any>"EventHub",
    ServiceBus = <any>"ServiceBus",
    DocumentDB = <any>"DocumentDB",
    ApiHub = <any>"ApiHub"
}

export class SettingType{
    public static string = "string";
    public static boolean = "boolean";
    public static label = "label";
    public static enum = "enum";
    public static int = "int";
    public static picker = "picker";
    public static checkBoxList = "checkBoxList";
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
}

export interface Action {
    template: string;
    binding: string;
    settings: string[];

    settingValues: string[];
    templateId: string;
}