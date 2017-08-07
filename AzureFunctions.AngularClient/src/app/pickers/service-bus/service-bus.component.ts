import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CacheService } from './../../shared/services/cache.service';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { FunctionApp } from '../../shared/function-app';
import { SiteDescriptor } from './../../shared/resourceDescriptors';
import { ArmObj, ArmArrayResult } from './../../shared/models/arm/arm-obj';
import { ArmService } from '../../shared/services/arm.service';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { SelectOption } from '../../shared/models/select-option';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../shared/models/portal-resources';
import { AppSettingObject } from '../../shared/models/binding-input';
import { IoTHelper } from '../../shared/models/iot-helper';
import { DirectionType } from '../../shared/models/binding';
import { Subscription } from 'rxjs/Subscription';

class OptionTypes {
    serviceBus = 'ServiceBus';
	IOTHub: string = "IOTHub";
    custom = 'Custom';
}

interface Topic {
    name: string;
    id: string;
}

interface IOTKey {
    keyName: string;
    primaryKey: string;
    rights: string;
    secondaryKey: string;
}

interface IOTEndpoint {
    connectionString: string;
    name: string;
    id: string;
    subscriptionId: string;
    resourceGroup: string;
}

@Component({
    selector: 'service-bus',
    templateUrl: './service-bus.component.html',
    styleUrls: ['./../picker.scss']
})

export class ServiceBusComponent {
    public namespaces: ArmArrayResult<any>;
    public polices: ArmArrayResult<any>;
    public selectedNamespace: string;
    public selectedPolicy: string;
    public appSettingName: string;
    public appSettingValue: string;
    public optionsChange: Subject<string>;
    public optionTypes: OptionTypes = new OptionTypes();
    public queueNames: string[];
    public selectedQueueName: string;
    public topicNames: Topic[];
    public selectedTopicId: string;
    public subscriptionNames: string[];
    public selectedSubscriptionName: string;
    
    public IOTHubs: ArmArrayResult;
    public IOTEndpoints: IOTEndpoint[];
    public selectedIOTHub: string;
    public selectedIOTEndpointId: string;
    public IOTqueueNames: string[];
    public IOTselectedQueueName: string;
    public IOTtopicNames: Topic[];
    public IOTselectedTopicId: string;
    public IOTsubscriptionNames: string[];
    public IOTselectedSubscriptionName: string;
    public IOTpolices: ArmArrayResult;
    public IOTselectedPolicy: string;
    public isTrigger: boolean;

    public selectInProcess = false;
    public options: SelectOption<string>[];
    public option: string;
    public canSelect = false;
    @Output() close = new Subject<void>();
    @Output() selectItem = new Subject<AppSettingObject>();

    private _functionApp: FunctionApp;
    private _descriptor: SiteDescriptor;
    private _subscription: Subscription;

    constructor(
        private _cacheService: CacheService,
        private _armService: ArmService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService) {

        this.options = [
            {
                displayLabel: this._translateService.instant(PortalResources.serviceBusPicker_serviceBus),
                value: this.optionTypes.serviceBus,
            },
            {
                displayLabel: this._translateService.instant(PortalResources.eventHubPicker_IOTHub),
                value: this.optionTypes.IOTHub,
            },
            {
                displayLabel: this._translateService.instant(PortalResources.eventHubPicker_custom),
                value: this.optionTypes.custom
            }
        ];

        this.option = this.optionTypes.serviceBus;

        this.optionsChange = new Subject<string>();
        this.optionsChange.subscribe((option) => {
            this.option = option;
            this.setSelect();
        });
    }

    @Input() set functionApp(functionApp: FunctionApp) {
        this._functionApp = functionApp;
        this._descriptor = new SiteDescriptor(functionApp.site.id);

        const id = `/subscriptions/${this._descriptor.subscription}/providers/Microsoft.ServiceBus/namespaces`;

        this._cacheService.getArm(id, true).subscribe(r => {
            this.namespaces = r.json();
            if (this.namespaces.value.length > 0) {
                this.selectedNamespace = this.namespaces.value[0].id;
                this.onChangeNamespace(this.selectedNamespace);
            }
        });

        let devicesId = `/subscriptions/${this._descriptor.subscription}/providers/Microsoft.Devices/IotHubs`;

        this._cacheService.getArm(devicesId, true, '2017-01-19').subscribe(r => {
            this.IOTHubs = r.json();
            if (this.IOTHubs.value.length > 0) {
                this.selectedIOTHub = this.IOTHubs.value[0].id;
                this.onIOTHubChange(this.selectedIOTHub);
            }
        });
    }

    @Input() isServiceBusTopic: boolean;

    @Input() set bindingDirection(bindingDirection: DirectionType) {
        this.isTrigger = bindingDirection === DirectionType.trigger;
    };

    onChangeNamespace(value: string) {
        this.polices = null;
        this.selectedPolicy = null;
        this.selectedQueueName = null;
        this.queueNames = null;
        this.topicNames = null;
        this.selectedTopicId = null;
        this.subscriptionNames = null;
        this.selectedSubscriptionName = null;

        Observable.zip(
            this._cacheService.getArm(value + "/topics", true),
            this._cacheService.getArm(value + "/queues", true),
            this._cacheService.getArm(value + "/AuthorizationRules", true),
            (topics, queues, policies) => ({
                topics: topics.json(),
                queues: queues.json(),
                policies: policies.json()
            })).subscribe(r => {

                this.polices = this.filterIoTPolicies(r.policies);
                if (this.polices.value.length > 0) {
                    this.polices.value.forEach((item) => {
                        item.name += " " + this._translateService.instant(PortalResources.eventHubPicker_namespacePolicy);;
                    });
                    this.selectedPolicy = this.polices.value[0].id;
                    this.setSelect();
                }
                
                if (!this.isServiceBusTopic) {
                    this.queueNames = r.queues.value.map(q => q.name);
                    this.selectedQueueName = this.queueNames[0];
                }
                else {
                    this.topicNames = r.topics.value.map(t => <Topic>{
                        id: t.id,
                        name: t.name
                    });
                    this.selectedTopicId = this.topicNames[0].id;

                    this._cacheService.getArm(this.selectedTopicId + "/subscriptions", true).subscribe(resp => {
                        this.subscriptionNames = resp.json().value.map(s => s.name);
                        this.selectedSubscriptionName = this.subscriptionNames[0];
                    });
                }
            });
    }

    onChangeTopicName(value: string) {
        if (this.option === this.optionTypes.IOTHub) {
            let selectedIOTEndpoint = this.IOTEndpoints.find(e => e.id === this.selectedIOTEndpointId);
            let topicName = this.IOTtopicNames.find(t => t.id === value).name;
            this.updateTopicPolicy(selectedIOTEndpoint, topicName);
        }

        this._cacheService.getArm(value + "/subscriptions", true).subscribe(resp => {
            this.subscriptionNames = resp.json().value.map(s => s.name);
            this.selectedSubscriptionName = this.subscriptionNames[0];
        });
    }

    onIOTHubChange(value: string) {
        this.IOTEndpoints = null;
        this.selectedIOTEndpointId = null;
        this.IOTselectedQueueName = null;
        this.IOTqueueNames = null;
        this.IOTtopicNames = null;
        this.IOTselectedTopicId = null;
        this.IOTsubscriptionNames = null;
        this.IOTselectedSubscriptionName = null;

        this._cacheService.getArm(value, true, '2017-01-19').subscribe(r => {
            this.IOTEndpoints = [];
            var hubs = r.json().properties.routing.endpoints;
            
            if (this.isServiceBusTopic) {
                hubs.serviceBusTopics.forEach(endpoint => {
                    this.IOTEndpoints.push(endpoint)
                });
            } else {
                hubs.serviceBusQueues.forEach(endpoint => {
                    this.IOTEndpoints.push(endpoint)
                });
            }

            if (this.IOTEndpoints.length > 0) {
                this.selectedIOTEndpointId = this.IOTEndpoints[0].id;

                let selectedIOTEndpoint = this.IOTEndpoints.find(e => e.id === this.selectedIOTEndpointId);
                let sbUrl = this.getNamespaceUrlFrom(selectedIOTEndpoint.subscriptionId, selectedIOTEndpoint.resourceGroup, selectedIOTEndpoint.connectionString);
                
                this._cacheService.getArm(sbUrl + "/AuthorizationRules", true).subscribe(r => {
                    this.IOTpolices = this.filterIoTPolicies(r.json());
                    this.IOTpolices.value.forEach((item) => {
                        item.name += " " + this._translateService.instant(PortalResources.eventHubPicker_namespacePolicy);;
                    });
                    if (this.IOTpolices.value.length > 0) {
                        this.IOTselectedPolicy = this.IOTpolices.value[0].id;
                    }
                })

                if (this.isServiceBusTopic) {
                    // set topic and subscription
                    this._cacheService.getArm(sbUrl + "/topics", true).subscribe(r => {
                        this.IOTtopicNames = r.json().value.map(t => <Topic>{
                            id: t.id,
                            name: t.name
                        });
                        this.IOTselectedTopicId = this.IOTtopicNames[0].id;
                        
                        this._cacheService.getArm(this.IOTselectedTopicId + "/subscriptions", true).subscribe(resp => {
                            this.IOTsubscriptionNames = resp.json().value.map(s => s.name);
                            this.IOTselectedSubscriptionName = this.IOTsubscriptionNames[0];
                        });

                        // hub policy
                        this.updateTopicPolicy(selectedIOTEndpoint, this.IOTtopicNames[0].name);
                    })
                }
                else {
                    // set queue
                    this._cacheService.getArm(sbUrl + "/queues", true).subscribe(r => {
                        this.IOTqueueNames = r.json().value.map(q => q.name);
                        this.IOTselectedQueueName = this.IOTqueueNames[0];
                        
                        this.updateQueuePolicy(selectedIOTEndpoint, this.IOTselectedQueueName);
                    })
                }
            }

            this.setSelect();
        });
    }

    onIoTEndpointsChange(value: string) {
        this.IOTselectedQueueName = null;
        this.IOTqueueNames = null;
        this.IOTtopicNames = null;
        this.IOTselectedTopicId = null;
        this.IOTsubscriptionNames = null;
        this.IOTselectedSubscriptionName = null;

        let selectedIOTEndpoint = this.IOTEndpoints.find(e => e.id === value);
        let sbUrl = this.getNamespaceUrlFrom(selectedIOTEndpoint.subscriptionId, selectedIOTEndpoint.resourceGroup, selectedIOTEndpoint.connectionString);
        
        Observable.zip(
            this._cacheService.getArm(sbUrl + "/topics", true),
            this._cacheService.getArm(sbUrl + "/queues", true),
            this._cacheService.getArm(sbUrl + "/AuthorizationRules", true),
            (topics, queues, policies) => ({
                topics: topics.json(),
                queues: queues.json(),
                policies: policies.json()
            })).subscribe(r => {
                
                this.IOTpolices = this.filterIoTPolicies(r.policies);
                if (this.IOTpolices.value.length > 0) {
                    this.IOTpolices.value.forEach((item) => {
                        item.name += " " + this._translateService.instant(PortalResources.eventHubPicker_namespacePolicy);;
                    });
                    this.IOTselectedPolicy = this.IOTpolices.value[0].id;
                    this.setSelect();
                }

                if (!this.isServiceBusTopic) {
                    this.IOTqueueNames = r.queues.value.map(q => q.name);
                    this.IOTselectedQueueName = this.IOTqueueNames[0];
                    
                    this.updateQueuePolicy(selectedIOTEndpoint, this.IOTselectedQueueName);
                }
                else {
                    this.IOTtopicNames = r.topics.value.map(t => <Topic>{
                        id: t.id,
                        name: t.name
                    });
                    this.IOTselectedTopicId = this.IOTtopicNames[0].id;
                    
                    this.updateTopicPolicy(selectedIOTEndpoint, this.IOTtopicNames[0].name);

                    this._cacheService.getArm(this.IOTselectedTopicId + "/subscriptions", true).subscribe(resp => {
                        this.IOTsubscriptionNames = resp.json().value.map(s => s.name);
                        this.IOTselectedSubscriptionName = this.IOTsubscriptionNames[0];
                    });
                }
            });

    }

    onChangeIoTQueueName(queueName: string) {
        let selectedIOTEndpoint = this.IOTEndpoints.find(e => e.id === this.selectedIOTEndpointId);
        
        this.updateQueuePolicy(selectedIOTEndpoint, queueName);
    }    

    onClose() {
        if (!this.selectInProcess) {
            this.close.next(null);
        }
    }

    onSelect(): Subscription | null {
        var appSettingName: string;
        var appSettingValue: string;
        if (this.option === this.optionTypes.serviceBus) {
            if (this.selectedPolicy) {
                this.selectInProcess = true;
                this._globalStateService.setBusyState();
                let appSettingName: string;

                return Observable.zip(
                    this._cacheService.postArm(this.selectedPolicy + '/listkeys', true, '2015-08-01'),
                    this._cacheService.postArm(`${this._functionApp.site.id}/config/appsettings/list`, true),
                    (p, a) => ({ keys: p, appSettings: a }))
                    .flatMap(r => {
                        const namespace = this.namespaces.value.find(p => p.id === this.selectedNamespace);
                        const keys = r.keys.json();

                        appSettingName = `${namespace.name}_${keys.keyName}_SERVICEBUS`;
                        appSettingValue = keys.primaryConnectionString;

                        var appSettings: ArmObj<any> = r.appSettings.json();
                        appSettings.properties[appSettingName] = appSettingValue;
                        return this._cacheService.putArm(appSettings.id, this._armService.websiteApiVersion, appSettings);

                    })
                    .do(null, e => {
                        this._globalStateService.clearBusyState();
                        this.selectInProcess = false;
                        console.log(e);
                    })
                    .subscribe(r => {
                        this._globalStateService.clearBusyState();
                        if (!this.isServiceBusTopic) this.selectItem.next(IoTHelper.generateServiceBusQueueAppSettingObject(appSettingName, this.selectedQueueName));
                        else {

                            let selectedTopicName = this.topicNames.find(topic => topic.id === this.selectedTopicId).name;

                            this.selectItem.next(IoTHelper.generateServiceBusTopicAppSettingObject(appSettingName, selectedTopicName, this.selectedSubscriptionName));
                        }
                    });
            }
        }
        if (this.option === this.optionTypes.IOTHub) {
            if (this.IOTselectedPolicy) {
                this.selectInProcess = true;
                this._globalStateService.setBusyState();
                return Observable.zip(
                    this._cacheService.postArm(this.IOTselectedPolicy + '/listkeys', true, "2015-08-01"),
                    this._cacheService.postArm(`${this._functionApp.site.id}/config/appsettings/list`, true),
                    (p, a) => ({ keys: p, appSettings: a }))
                    .flatMap(r => {
                        let selectedIOTEndpointName = this.IOTEndpoints.find(endpoint => endpoint.id === this.selectedIOTEndpointId).name;
                        let keys = r.keys.json();
                        
                        appSettingName = `${selectedIOTEndpointName}_${keys.keyName}_IOTHUB_SERVICEBUS`;
                        appSettingValue = keys.primaryConnectionString;

                        const appSettings: ArmObj<any> = r.appSettings.json();
                        appSettings.properties[appSettingName] = appSettingValue;
                        return this._cacheService.putArm(appSettings.id, this._armService.websiteApiVersion, appSettings);

                    })
                    .do(null, e => {
                        this._globalStateService.clearBusyState();
                        this.selectInProcess = false;
                        console.log(e);
                    })
                    .subscribe(() => {
                        this._globalStateService.clearBusyState();
                        if (!this.isServiceBusTopic) this.selectItem.next(IoTHelper.generateServiceBusQueueAppSettingObject(appSettingName, this.IOTselectedQueueName));
                        else {
                            let selectedTopicName = this.IOTtopicNames.find(topic => topic.id === this.IOTselectedTopicId).name;
                            this.selectItem.next(IoTHelper.generateServiceBusTopicAppSettingObject(appSettingName, selectedTopicName, this.IOTselectedSubscriptionName));
                        }
                    });
            }
        }
        else {
            appSettingName = this.appSettingName;
            appSettingValue = this.appSettingValue;

            if (appSettingName && appSettingValue) {
                this.selectInProcess = true;
                this._globalStateService.setBusyState();
                this._cacheService.postArm(`${this._functionApp.site.id}/config/appsettings/list`, true).flatMap(r => {
                    const appSettings: ArmObj<any> = r.json();
                    appSettings.properties[appSettingName] = appSettingValue;
                    return this._cacheService.putArm(appSettings.id, this._armService.websiteApiVersion, appSettings);
                })
                    .do(null, e => {
                        this._globalStateService.clearBusyState();
                        this.selectInProcess = false;
                        console.log(e);
                    })
                    .subscribe(r => {
                        this._globalStateService.clearBusyState();
                        if (!this.isServiceBusTopic) this.selectItem.next(IoTHelper.generateServiceBusQueueAppSettingObject(appSettingName, null));
                        else this.selectItem.next(IoTHelper.generateServiceBusTopicAppSettingObject(appSettingName, null, null));
                    });
            }
        }
        return null;
    }

    public setSelect() {
        switch (this.option) {
            case this.optionTypes.custom:
                {
                    this.canSelect = !!(this.appSettingName && this.appSettingValue);
                    break;
                }
            case this.optionTypes.serviceBus:
                {
                    this.canSelect = !!(this.selectedPolicy);
                    break;
                }
            case this.optionTypes.IOTHub:
                {
                    this.canSelect = !!(this.selectedIOTHub && this.selectedPolicy);
                    break;
                }
        }
    }
    
    /**
     * return
     * "/subscriptions/{subscriptionName}/resourceGroups/{resourceGroupName}/providers/Microsoft.ServiceBus/namespaces/{namespaceName}"
     * @param connectionString
     */
    private getNamespaceUrlFrom(subscriptionName: string, resourceGroupName: string, connectionString: string) {
        let sb = "sb://";
        let sbLength = sb.length; // 5;
        let namespaceStartIndex = connectionString.indexOf(sb) + sbLength;
        let namespaceAfterEndIndex = connectionString.indexOf(".servicebus");
        return "/subscriptions/" + subscriptionName + "/resourceGroups/" + resourceGroupName + "/providers/Microsoft.ServiceBus/namespaces/"
            + connectionString.substring(namespaceStartIndex, namespaceAfterEndIndex);
    }

    /**
     * return
     * "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ServiceBus/namespaces/
     * {namespaceName}/queues/{queueName}"
     * @param connectionString
     */
    private getQueueUrlFrom(subscriptionName: string, resourceGroupName: string, connectionString: string, queueName: string) {
        return this.getNamespaceUrlFrom(subscriptionName, resourceGroupName, connectionString)
            + "/queues/" + queueName;
    }

    /**
     * return
     * "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ServiceBus/namespaces/
     *  {namespaceName}/topics/{topicName}"
     * @param connectionString
     */
    private getTopicUrlFrom(subscriptionName: string, resourceGroupName: string, connectionString: string, topicName: string) {
        return this.getNamespaceUrlFrom(subscriptionName, resourceGroupName, connectionString)
            + "/queues/" + topicName;
    } 


    private updateTopicPolicy(selectedIOTEndpoint: IOTEndpoint, topicName: string) {
        let topicUrl = this.getTopicUrlFrom(selectedIOTEndpoint.subscriptionId,
            selectedIOTEndpoint.resourceGroup, selectedIOTEndpoint.connectionString, topicName);
        this._cacheService.getArm(topicUrl + "/AuthorizationRules", true).subscribe(r => {
            let rules = this.filterIoTPolicies(r.json());
            
            rules.value.forEach(item =>
                item.name += " " + this._translateService.instant(PortalResources.eventHubPicker_eventHubPolicy));
            this.IOTpolices.value = this.IOTpolices.value
                .filter(p => p.name.indexOf(this._translateService.instant(PortalResources.eventHubPicker_namespacePolicy)) > -1)
                .concat(rules.value);
        })
    }

    private updateQueuePolicy(selectedIOTEndpoint: IOTEndpoint, queueName: string) {
        
        let queueUrl = this.getQueueUrlFrom(selectedIOTEndpoint.subscriptionId,
            selectedIOTEndpoint.resourceGroup, selectedIOTEndpoint.connectionString, queueName);
        this._cacheService.getArm(queueUrl + "/AuthorizationRules", true).subscribe(r => {
            let rules = this.filterIoTPolicies(r.json());
            rules.value.forEach(item =>
                item.name += " " + this._translateService.instant(PortalResources.eventHubPicker_eventHubPolicy));
            this.IOTpolices.value = this.IOTpolices.value
                .filter(p => p.name.indexOf(this._translateService.instant(PortalResources.eventHubPicker_namespacePolicy)) > -1)
                .concat(rules.value);
        })
    }
  
    private filterIoTPolicies(policies: ArmArrayResult): ArmArrayResult {
        policies.value = policies.value.filter(p => (p.properties.rights.find(r => r === "Listen")));
        debugger;
        return policies;
    }
}
