"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BindingType;
(function (BindingType) {
    BindingType[BindingType["timerTrigger"] = "timerTrigger"] = "timerTrigger";
    BindingType[BindingType["eventHubTrigger"] = "eventHubTrigger"] = "eventHubTrigger";
    BindingType[BindingType["eventHub"] = "eventHub"] = "eventHub";
    BindingType[BindingType["queue"] = "queue"] = "queue";
    BindingType[BindingType["queueTrigger"] = "queueTrigger"] = "queueTrigger";
    BindingType[BindingType["sqlQueueTrigger"] = "sqlQueueTrigger"] = "sqlQueueTrigger";
    BindingType[BindingType["blob"] = "blob"] = "blob";
    BindingType[BindingType["blobTrigger"] = "blobTrigger"] = "blobTrigger";
    BindingType[BindingType["apiHubFile"] = "apiHubFile"] = "apiHubFile";
    BindingType[BindingType["apiHubFileTrigger"] = "apiHubFileTrigger"] = "apiHubFileTrigger";
    BindingType[BindingType["apiHubTable"] = "apiHubTable"] = "apiHubTable";
    BindingType[BindingType["httpTrigger"] = "httpTrigger"] = "httpTrigger";
    BindingType[BindingType["http"] = "http"] = "http";
    BindingType[BindingType["table"] = "table"] = "table";
    BindingType[BindingType["serviceBus"] = "serviceBus"] = "serviceBus";
    BindingType[BindingType["bot"] = "bot"] = "bot";
    BindingType[BindingType["serviceBusTrigger"] = "serviceBusTrigger"] = "serviceBusTrigger";
    BindingType[BindingType["manualTrigger"] = "manualTrigger"] = "manualTrigger";
    BindingType[BindingType["documentDB"] = "documentDB"] = "documentDB";
    BindingType[BindingType["mobileTable"] = "mobileTable"] = "mobileTable";
    BindingType[BindingType["notificationHub"] = "notificationHub"] = "notificationHub";
    BindingType[BindingType["sendGrid"] = "sendGrid"] = "sendGrid";
    BindingType[BindingType["twilioSms"] = "twilioSms"] = "twilioSms";
    BindingType[BindingType["aadtoken"] = "aadToken"] = "aadtoken";
})(BindingType = exports.BindingType || (exports.BindingType = {}));
var DirectionType;
(function (DirectionType) {
    DirectionType[DirectionType["trigger"] = "trigger"] = "trigger";
    DirectionType[DirectionType["in"] = "in"] = "in";
    DirectionType[DirectionType["out"] = "out"] = "out";
    DirectionType[DirectionType["inout"] = "inout"] = "inout";
})(DirectionType = exports.DirectionType || (exports.DirectionType = {}));
var ResourceType;
(function (ResourceType) {
    ResourceType[ResourceType["Storage"] = "Storage"] = "Storage";
    ResourceType[ResourceType["EventHub"] = "EventHub"] = "EventHub";
    ResourceType[ResourceType["ServiceBus"] = "ServiceBus"] = "ServiceBus";
    ResourceType[ResourceType["DocumentDB"] = "DocumentDB"] = "DocumentDB";
    ResourceType[ResourceType["ApiHub"] = "ApiHub"] = "ApiHub";
    ResourceType[ResourceType["AppSetting"] = "AppSetting"] = "AppSetting";
})(ResourceType = exports.ResourceType || (exports.ResourceType = {}));
var SettingType = (function () {
    function SettingType() {
    }
    return SettingType;
}());
SettingType.string = "string";
SettingType.boolean = "boolean";
SettingType.label = "label";
SettingType.enum = "enum";
SettingType.int = "int";
SettingType.picker = "picker";
SettingType.checkBoxList = "checkBoxList";
exports.SettingType = SettingType;
//# sourceMappingURL=binding.js.map