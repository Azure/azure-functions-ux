import { BindingInputBase, AppSettingObject, EventHubOption, ServiceBusQueueOption, ServiceBusTopicOption, PickerInput } from './binding-input';
import { PortalResources } from './portal-resources';
import { BindingType } from './binding';
import { IoTHubConstants } from './constants';
import { BindingInputComponent } from '../../binding-input/binding-input.component';

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

    static autofillIoTValuesEHTrigger(that: BindingInputComponent, input: BindingInputBase<any>) {
        IoTHelper.autofillIoTValuesPath(that, input);
        if (that.pickerOption && input instanceof PickerInput) input.consumerGroup.value = (<EventHubOption>that.pickerOption).consumerGroup;
    }

    static autofillIoTValuesPath(that: BindingInputComponent, input: BindingInputBase<any>) {
        var entityPath = IoTHelper.getEntityPathFrom(that.appSettingValue);
        if (input instanceof PickerInput) input.pathInput.value = entityPath ? entityPath : IoTHubConstants.eventhubName; // default value for event hub path
    }

    static initializePickerOption(input: PickerInput, that: BindingInputComponent) {
        if (input && input.pathInput && input.consumerGroup) {
            that.pickerOption = {
                entityPath: input.pathInput.value,
                consumerGroup: input.consumerGroup.value
            }
        }
        else if (input && input.pathInput) {
            that.pickerOption = {
                entityPath: input.pathInput.value,
                consumerGroup: null
            }
        }
        else if (input && input.queueName) {
            that.pickerOption = {
                queueName: input.queueName.value
            }
        }
        else if (input && input.topicName && input.subscriptionName) {
            that.pickerOption = {
                topicName: input.topicName.value,
                subscriptionName: input.subscriptionName.value
            }
        }
    }

    static setServiceBusQueueName(input: PickerInput, queueName: string) {
        if (input) input.queueName.value = queueName;
    }

    static setServiceBusTopicValues(input: PickerInput, topicName: string, subscriptionName: string) {
        if (input) {
            if (input.topicName) input.topicName.value = topicName;
            if (input.subscriptionName) input.subscriptionName.value = subscriptionName;
        }
    }

    static onBindingInputChange(value: any, input: BindingInputBase<any>, that: BindingInputComponent) {
        if (input instanceof PickerInput) {
            if (input && input.pathInput && input.consumerGroup) {
                if (input.value != value && that.pickerOption && (<EventHubOption>that.pickerOption).consumerGroup) {
                    (<EventHubOption>that.pickerOption).consumerGroup = PortalResources.defaultConsumerGroup;
                }
                that.setAppSettingCallback(value, IoTHelper.autofillIoTValuesEHTrigger, PortalResources.eventHubPicker_eventHub);
            }
            else if (input && input.pathInput) {
                that.setAppSettingCallback(value, IoTHelper.autofillIoTValuesPath, PortalResources.eventHubPicker_eventHub);
            }
            else if (input && input.queueName && that.pickerOption && (<ServiceBusQueueOption>that.pickerOption).queueName) {
                if (input.value != value) (<ServiceBusQueueOption>that.pickerOption).queueName = PortalResources.defaultQueueName;
                IoTHelper.setServiceBusQueueName(input, (<ServiceBusQueueOption>that.pickerOption).queueName);
            }
            else if (input && input.topicName && input.subscriptionName
                && that.pickerOption && (<ServiceBusTopicOption>that.pickerOption).topicName && (<ServiceBusTopicOption>that.pickerOption).subscriptionName) {
                if (input.value != value) {
                    (<ServiceBusTopicOption>that.pickerOption).topicName = PortalResources.defaultTopicName;
                    (<ServiceBusTopicOption>that.pickerOption).subscriptionName = PortalResources.defaultsubscriptionName;
                }
                IoTHelper.setServiceBusTopicValues(input, (<ServiceBusTopicOption>that.pickerOption).topicName, (<ServiceBusTopicOption>that.pickerOption).subscriptionName);
            }
            else if (input && input.topicName && that.pickerOption && (<ServiceBusTopicOption>that.pickerOption).topicName) {
                if (input.value != value) {
                    (<ServiceBusTopicOption>that.pickerOption).topicName = PortalResources.defaultTopicName;
                }
                IoTHelper.setServiceBusTopicValues(input, (<ServiceBusTopicOption>that.pickerOption).topicName, null);
            }
        }
    }

    static initializeBindingInput(input: BindingInputBase<any>, that: BindingInputComponent) {
        if (input instanceof PickerInput) {
            if (input && input.pathInput && input.consumerGroup) {
                that.setAppSettingCallback(input.value, IoTHelper.autofillIoTValuesEHTrigger, PortalResources.eventHubPicker_eventHub);
            }
            else if (input && input.pathInput) {
                that.setAppSettingCallback(input.value, IoTHelper.autofillIoTValuesPath, PortalResources.eventHubPicker_eventHub);
            }
            IoTHelper.initializePickerOption(input, that);
        }
    }
}
