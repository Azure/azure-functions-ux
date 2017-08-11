import { BindingInputBase, AppSettingObject, EventHubOption, ServiceBusQueueOption, ServiceBusTopicOption, PickerOption, PickerInput, TextboxInput } from './binding-input';
import { PortalResources } from './portal-resources';
import { BindingType } from './binding';
import { TranslateService } from '@ngx-translate/core';
import { IoTHubConstants } from './constants'

export class IoTHelper {

    /**
     * Gather all the pointers for PickerInput and TextboxInput
     * input is a reference
     * Invariant: input whose id === IoTHubConstants.connection is of type PickerInput
     * @param displayName
     * @param inputs
     */
    static getInputObjects(type: BindingType, inputs: BindingInputBase<any>[]) {
        if (IoTHelper.isEventHubTriggerType(type)) {
            let input = <PickerInput>inputs.find(s => s.id === IoTHubConstants.connection);
            let pathInput = inputs.find(s => s.id === IoTHubConstants.path);
            let consumerGroups = inputs.find(s => s.id === IoTHubConstants.consumerGroup);
            input.pathInput = pathInput;
            input.consumerGroup = consumerGroups;
        }
        else if (IoTHelper.isEventHubType(type)) {
            let input = <PickerInput>inputs.find(s => s.id === IoTHubConstants.connection);
            let pathInput = inputs.find(s => s.id === IoTHubConstants.path);
            input.pathInput = pathInput;
        }
        else if (IoTHelper.isServiceBusTriggerType(type)) {
            let input = <PickerInput>inputs.find(s => s.id === IoTHubConstants.connection);
            let queueName = inputs.find(s => s.id === IoTHubConstants.queueName);
            let topicName = inputs.find(s => s.id === IoTHubConstants.topicName);
            let subscriptionName = inputs.find(s => s.id === IoTHubConstants.subscriptionName);
            input.queueName = queueName;
            input.topicName = topicName;
            input.subscriptionName = subscriptionName;
        }
        else if (IoTHelper.isServiceBusTriggerType(type)) {
            let input = <PickerInput>inputs.find(s => s.id === IoTHubConstants.connection);
            let queueName = inputs.find(s => s.id === IoTHubConstants.queueName);
            let topicName = inputs.find(s => s.id === IoTHubConstants.topicName);
            let subscriptionName = inputs.find(s => s.id === IoTHubConstants.subscriptionName);
            input.queueName = queueName;
            input.topicName = topicName;
            input.subscriptionName = subscriptionName;
        }
        else if (IoTHelper.isServiceBusType(type)) {
            let input = <PickerInput>inputs.find(s => s.id === IoTHubConstants.connection);
            let queueName = inputs.find(s => s.id === IoTHubConstants.queueName);
            let topicName = inputs.find(s => s.id === IoTHubConstants.topicName);
            input.queueName = queueName;
            input.topicName = topicName;
        }
    }

    private static isEventHubTriggerType(type: BindingType) {
        return type === BindingType.eventHubTrigger;
    }

    private static isEventHubType(type: BindingType) {
        return type === BindingType.eventHub;
    }

    private static isServiceBusTriggerType(type: BindingType) {
        return type === BindingType.serviceBusTrigger; // might have output binding
    }

    private static isServiceBusType(type: BindingType) {
        return type === BindingType.serviceBus; // might have output binding
    }

    static getIOTConnectionString(endpoint: string, path: string, key: string) {
        return `Endpoint=${endpoint};SharedAccessKeyName=iothubowner;SharedAccessKey=${key};EntityPath=${path}`;
    }

    static changeIOTConnectionStringPolicy(connectionString: string, policy: string, serviceKey: string) {
        const shareName = IoTHubConstants.shareNameLowercase;
        const shareKey = IoTHubConstants.shareKeyLowercase;
        const entityPath = IoTHubConstants.semicolonEntityPathLowercase;
        let lowercaseConnectionString = connectionString.toLowerCase();
        let startPolicyIndex = lowercaseConnectionString.indexOf(shareName) + shareName.length;
        let startShareKeyIndex = lowercaseConnectionString.indexOf(shareKey);
        let startKeyIndex = startShareKeyIndex + shareKey.length;
        let endKeyIndex = lowercaseConnectionString.indexOf(entityPath);
        return connectionString.substring(0, startPolicyIndex)
            + policy + connectionString.substring(startShareKeyIndex, startKeyIndex)
            + serviceKey + connectionString.substring(endKeyIndex);
    }

    static generateEventHubAppSettingObject(appSettingName: string, appSettingValue: string, consumerGroup: string): AppSettingObject {
        return {
            appSettingName: appSettingName,
            pickerOption: {
                entityPath: IoTHelper.getEntityPathFrom(appSettingValue),
                consumerGroup: consumerGroup
            }
        }
    }

    static generateServiceBusQueueAppSettingObject(appSettingName: string, queueName: string): AppSettingObject {
        return {
            appSettingName: appSettingName,
            pickerOption: {
                queueName: queueName
            }
        }
    }

    static generateServiceBusTopicAppSettingObject(appSettingName: string,
        topicName: string, subscriptionName: string): AppSettingObject {
        return {
            appSettingName: appSettingName,
            pickerOption: {
                topicName: topicName,
                subscriptionName: subscriptionName
            }
        }
    }

    static getEntityPathFrom(connectionString: String): string {
        var entityPathPair = connectionString.toLowerCase().split(IoTHubConstants.semicolon)
            .find(pair => pair.split(IoTHubConstants.equal)[0] === IoTHubConstants.entityPathLowercase);
        return entityPathPair ? entityPathPair.split(IoTHubConstants.equal)[1] : entityPathPair;
    }

    static removeEntityPathFrom(connectionString: String): String {
        let entityIndex = connectionString.toLowerCase().indexOf(IoTHubConstants.semicolonEntityPathLowercase);
        return entityIndex !== -1 ? connectionString.substring(0, entityIndex) : connectionString;
    }
}
