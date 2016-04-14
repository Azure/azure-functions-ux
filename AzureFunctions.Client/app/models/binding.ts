export enum BindingType {
    timerTrigger = <any>"timerTrigger",
    eventHubTrigger = <any>"eventHubTrigger",
    eventHub = <any>"eventHub",
    queue = <any>"queue",
    queueTrigger = <any>"queueTrigger",
    blob = <any>"blob",
    blobTrigger = <any>"blobTrigger",
    httpTrigger = <any>"httpTrigger",
    http = <any>"http",
    table = <any>"table",
    serviceBus = <any>"serviceBus",
    serviceBusTrigger = <any>"serviceBusTrigger",
    manualTrigger = <any>"manualTrigger",
    documentdb = <any>"documentdb",
    easyTable = <any>"easyTable",
    notificationHub = <any>"notificationHub"
}

export interface BindingConfig {
    $shcema: string,
    contentVersion: string,
    variables: any,
    bindings: Binding[];
}


export interface Binding {
    type: BindingType;
    displayName: string;
    direction: DirectionType;
    defaultParameterName?: string;
    parameterNamePrompt?: string;
    settings: Setting[];
    rules: Rule[];
}

export interface Setting {
    name: string;
    value: SettingType;
    resource?: ResourceType;
    required?: boolean;
    label: string;
    defaultValue?: any;
    help?: string;
    enum?: EnumOption[];
    validators?: Validator[];
}

export interface Rule {
    type: string,
    values: RuleValue[];
    label: string;
    help: string;
}

export interface RuleValue {
    value: string;
    display: string;
    hiddenSettings: string[];
    shownSettings: string[];
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
    out = <any>"out"
}

export enum ResourceType {
    Storage = <any>"Storage",
    EventHub = <any>"EventHub",
    ServiceBus = <any>"ServiceBus",
    DocumentDB = <any>"DocumentDB"       
}

export enum SettingType {
    string = <any>"string",
    boolean = <any>"boolean",
    label = <any>"label",
    enum = <any>"enum",
    int = <any>"int",
    picker = <any>"picker"
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
