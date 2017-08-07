import { BindingInputBase, AppSettingObject, EventHubOption, ServiceBusQueueOption, ServiceBusTopicOption, PickerOption } from './binding-input';
import { PortalResources } from './portal-resources';
import { BindingType } from './binding';
import { TranslateService } from '@ngx-translate/core';

export class IoTHelper {
    constructor() {
    }

    /**
     * Gather all the pointers to input fields
     * input is a reference
     * @param displayName
     * @param inputs
     */
    static getInputObjects(type: BindingType, inputs: BindingInputBase<any>[]) {
         
        if (IoTHelper.isEventHubTriggerType(type)) {
            var input = inputs.find((s) => {
                return s.id === "connection";
            });

            var pathInput = inputs.find((s) => {
                return s.id === "path";
            });

            var consumerGroups = inputs.find((s) => {
                return s.id === "consumerGroup";
            });
            input.pathInput = pathInput;
            input.consumerGroup = consumerGroups;
        }

        else if (IoTHelper.isEventHubType(type)) {
            var input = inputs.find((s) => {
                return s.id === "connection";
            });

            var pathInput = inputs.find((s) => {
                return s.id === "path";
            });
            
            input.pathInput = pathInput;
        }

        else if (IoTHelper.isServiceBusTriggerType(type)) {
            var input = inputs.find((s) => {
                return s.id === "connection";
            });

            var queueName = inputs.find((s) => {
                return s.id === "queueName";
            });

            var topicName = inputs.find((s) => {
                return s.id === "topicName";
            });

            var subscriptionName = inputs.find((s) => {
                return s.id === "subscriptionName";
            });

            input.queueName = queueName;
            input.topicName = topicName;
            input.subscriptionName = subscriptionName;
        }

        else if (IoTHelper.isServiceBusTriggerType(type)) {
            var input = inputs.find((s) => {
                return s.id === "connection";
            });

            var queueName = inputs.find((s) => {
                return s.id === "queueName";
            });

            var topicName = inputs.find((s) => {
                return s.id === "topicName";
            });

            var subscriptionName = inputs.find((s) => {
                return s.id === "subscriptionName";
            });

            input.queueName = queueName;
            input.topicName = topicName;
            input.subscriptionName = subscriptionName;
        }

        else if (IoTHelper.isServiceBusType(type)) {
            var input = inputs.find((s) => {
                return s.id === "connection";
            });

            var queueName = inputs.find((s) => {
                return s.id === "queueName";
            });

            var topicName = inputs.find((s) => {
                return s.id === "topicName";
            });

            input.queueName = queueName;
            input.topicName = topicName;
        }
         
    }

    static isEventHubTriggerType(type: BindingType) {
        return type === BindingType.eventHubTrigger; 
    }

    static isEventHubType(type: BindingType) {
        return type === BindingType.eventHub;
    }

    static isServiceBusTriggerType(type: BindingType) {
        return type === BindingType.serviceBusTrigger; // might have output binding
    }

    static isServiceBusType(type: BindingType) {
        return type === BindingType.serviceBus; // might have output binding
    }

    static getIOTConnectionString(endpoint: string, path: string, key: string) {
        return `Endpoint=${endpoint};SharedAccessKeyName=iothubowner;SharedAccessKey=${key};EntityPath=${path}`;
    }

    static changeIOTConnectionStringPolicy(connectionString: string, policy: string, serviceKey: string) {
        const shareName = "SharedAccessKeyName=";
        let startPolicyIndex = connectionString.indexOf(shareName) + shareName.length;
        const shareKey = ";SharedAccessKey=";
        let startShareKeyIndex = connectionString.indexOf(shareKey);
        let startKeyIndex = startShareKeyIndex + shareKey.length;
        let endKeyIndex = connectionString.indexOf(";EntityPath");
         
        return connectionString.substring(0, startPolicyIndex)
            + policy + connectionString.substring(startShareKeyIndex, startKeyIndex)
            + serviceKey + connectionString.substring(endKeyIndex); 
    }

    static generateEventHubAppSettingObject(appSettingName: string,
        appSettingValue: string, consumerGroup: string): AppSettingObject {
        return {
            appSettingName: appSettingName,
            pickerOption: <PickerOption>{
                entityPath: IoTHelper.getEntityPathFrom(appSettingValue),
                consumerGroup: consumerGroup
            }
        }
    }

    static generateServiceBusQueueAppSettingObject(appSettingName: string, queueName: string): AppSettingObject {
        return {
            appSettingName: appSettingName,
            pickerOption: <PickerOption>{
                queueName: queueName
            }
        }
    }

    static generateServiceBusTopicAppSettingObject(appSettingName: string,
        topicName: string, subscriptionName: string): AppSettingObject {
        return {
            appSettingName: appSettingName,
            pickerOption: <PickerOption>{
                topicName: topicName,
                subscriptionName: subscriptionName
            }
        }
    }

    static getEntityPathFrom(connectionString: String): string {
        var entityPathPair = connectionString.split(";").find((pair) => {
            return pair.split("=")[0] === "EntityPath";
        })
        return entityPathPair ? entityPathPair.split("=")[1] : entityPathPair;
    }
}
