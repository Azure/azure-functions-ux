import { Component, Input, Output } from '@angular/core';
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
import { IoTHubConstants } from '../../shared/models/constants';
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

    public IOTHubs: ArmArrayResult<any>;
    public IOTEndpoints: IOTEndpoint[];
    public selectedIOTHub: string;
    public selectedIOTEndpointId: string;
    public IOTselectedQueueName: string;
    public IOTtopicName: Topic;
    public IOTselectedTopicId: string;
    public IOTsubscriptionNames: string[];
    public IOTselectedSubscriptionName: string;
    public IOTpolices: ArmArrayResult<any>;
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

        this._cacheService.getArm(devicesId, true, IoTHubConstants.apiVersion17).subscribe(r => {
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
        this.canSelect = false;
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
            (topics, queues) => ({
                topics: topics.json(),
                queues: queues.json()
            })).subscribe(r => {

                if (!this.isServiceBusTopic) {
                    this.queueNames = r.queues.value.map(q => q.name);
                    this.selectedQueueName = this.queueNames[0];
                    this.updateQueuePolicies(value, this.selectedQueueName);
                }
                else {
                    this.topicNames = r.topics.value.map(t => <Topic>{
                        id: t.id,
                        name: t.name
                    });
                    this.selectedTopicId = this.topicNames[0].id;
                    
                    this.updateTopicPolicies(value, this.topicNames[0].name);
                    
                    this._cacheService.getArm(this.selectedTopicId + "/subscriptions", true).subscribe(resp => {
                        this.subscriptionNames = resp.json().value.map(s => s.name);
                        this.selectedSubscriptionName = this.subscriptionNames[0];
                    });
                }
            });
    }

    onChangeTopicName(value: string) {
        // update policies
        let topicName = this.topicNames.find(t => t.id === value).name;
        this.updateTopicPolicies(this.selectedNamespace, topicName);

        // update subscriptions
        this._cacheService.getArm(value + "/subscriptions", true).subscribe(resp => {
            this.subscriptionNames = resp.json().value.map(s => s.name);
            this.selectedSubscriptionName = this.subscriptionNames[0];
        });
    }

    onChangeQueueName(selectedQueueName: string) {
        // update policies
        let queueName = this.queueNames.find(q => q === selectedQueueName);
        this.updateQueuePolicies(this.selectedNamespace, queueName);
    }

    onIOTHubChange(value: string) {
        this.canSelect = false;
        this.IOTEndpoints = null;
        this.selectedIOTEndpointId = null;
        this.IOTselectedQueueName = null;
        this.IOTtopicName = null;
        this.IOTselectedTopicId = null;
        this.IOTsubscriptionNames = null;
        this.IOTselectedSubscriptionName = null;
        this._cacheService.getArm(value, true, IoTHubConstants.apiVersion17).subscribe(r => {
            this.IOTEndpoints = [];
            let hubs = r.json().properties.routing.endpoints;

            if (this.isServiceBusTopic) hubs.serviceBusTopics.forEach(endpoint => this.IOTEndpoints.push(endpoint));
            else hubs.serviceBusQueues.forEach(endpoint => this.IOTEndpoints.push(endpoint));

            if (this.IOTEndpoints.length > 0) {
                this.selectedIOTEndpointId = this.IOTEndpoints[0].id;

                let selectedIOTEndpoint = this.IOTEndpoints.find(e => e.id === this.selectedIOTEndpointId);
                let sbUrl = this.getNamespaceUrlFrom(selectedIOTEndpoint.subscriptionId,
                    selectedIOTEndpoint.resourceGroup, selectedIOTEndpoint.connectionString);

                if (this.isServiceBusTopic) {

                    // set topic and subscription
                    let IOTTopicName = IoTHelper.getEntityPathFrom(this.IOTEndpoints[0].connectionString);
                    this._cacheService.getArm(sbUrl + "/topics/" + IOTTopicName, true).subscribe(r => {
                        let j = r.json();

                        this.IOTtopicName = <Topic>{
                            name: j.name,
                            id: j.id
                        }
                        this.IOTselectedTopicId = this.IOTtopicName.id;
                        
                        this.updateTopicPolicies(sbUrl, this.IOTtopicName.name);

                        this._cacheService.getArm(this.IOTselectedTopicId + "/subscriptions", true).subscribe(resp => {
                            this.IOTsubscriptionNames = resp.json().value.map(s => s.name);
                            this.IOTselectedSubscriptionName = this.IOTsubscriptionNames[0];
                        });
                    })
                } else {
                    this.IOTselectedQueueName = IoTHelper.getEntityPathFrom(this.IOTEndpoints[0].connectionString);
                    this.updateQueuePolicies(sbUrl, this.IOTselectedQueueName);
                }
            }
        });
    }

    onIoTEndpointsChange(value: string) {
        this.canSelect = false;
        this.IOTselectedQueueName = null;
        this.IOTtopicName = null;
        this.IOTselectedTopicId = null;
        this.IOTsubscriptionNames = null;
        this.IOTselectedSubscriptionName = null;
        this.IOTpolices = null;
        let selectedIOTEndpoint = this.IOTEndpoints.find(e => e.id === value);
        let sbUrl = this.getNamespaceUrlFrom(selectedIOTEndpoint.subscriptionId, selectedIOTEndpoint.resourceGroup, selectedIOTEndpoint.connectionString);
        
        if (this.isServiceBusTopic) {
            let IOTTopicName = IoTHelper.getEntityPathFrom(selectedIOTEndpoint.connectionString);
            this._cacheService.getArm(sbUrl + "/topics/" + IOTTopicName, true).subscribe(resp => {
                let r = resp.json();
                this.IOTtopicName = <Topic>{
                    id: r.id,
                    name: r.name
                }
                this.IOTselectedTopicId = this.IOTtopicName.id;

                this._cacheService.getArm(this.IOTselectedTopicId + "/subscriptions", true).subscribe(resp => {
                    this.IOTsubscriptionNames = resp.json().value.map(s => s.name);
                    this.IOTselectedSubscriptionName = this.IOTsubscriptionNames[0];
                });
                
                this.updateTopicPolicies(sbUrl, this.IOTtopicName.name);
            });
        } else {
            this.IOTselectedQueueName = IoTHelper.getEntityPathFrom(selectedIOTEndpoint.connectionString);
            this.updateQueuePolicies(sbUrl, this.IOTselectedQueueName);
        }
    }

    onClose() {
        if (!this.selectInProcess) {
            this.close.next(null);
        }
    }

    onSelect(): Subscription | null {
        if (!this.canSelect) return null;

        let appSettingName: string;
        let appSettingValue: string;
        if (this.option === this.optionTypes.serviceBus) {
            if (this.selectedPolicy) {
                this.selectInProcess = true;
                this._globalStateService.setBusyState();
                let appSettingName: string;

                return Observable.zip(
                    this._cacheService.postArm(this.selectedPolicy + '/listkeys', true, IoTHubConstants.apiVersion15),
                    this._cacheService.postArm(`${this._functionApp.site.id}/config/appsettings/list`, true),
                    (p, a) => ({ keys: p, appSettings: a }))
                    .flatMap(r => {
                        const namespace = this.namespaces.value.find(p => p.id === this.selectedNamespace);
                        const keys = r.keys.json();

                        appSettingName = `${namespace.name}_${keys.keyName}_SERVICEBUS`;
                        appSettingValue = keys.primaryConnectionString;

                        let appSettings: ArmObj<any> = r.appSettings.json();
                        appSettings.properties[appSettingName] = IoTHelper.removeEntityPathFrom(appSettingValue);
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
                    this._cacheService.postArm(this.IOTselectedPolicy + '/listkeys', true, IoTHubConstants.apiVersion15),
                    this._cacheService.postArm(`${this._functionApp.site.id}/config/appsettings/list`, true),
                    (p, a) => ({ keys: p, appSettings: a }))
                    .flatMap(r => {
                        let selectedIOTEndpointName = this.IOTEndpoints.find(endpoint => endpoint.id === this.selectedIOTEndpointId).name;
                        let keys = r.keys.json();
                        appSettingName = `${selectedIOTEndpointName}_${keys.keyName}_IOTHUB_SERVICEBUS`;
                        appSettingValue = keys.primaryConnectionString;
                        const appSettings: ArmObj<any> = r.appSettings.json();
                        appSettings.properties[appSettingName] = IoTHelper.removeEntityPathFrom(appSettingValue);
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
                            let selectedTopicName = this.IOTtopicName.name;
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
        debugger;
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
                    if (this.isServiceBusTopic) this.canSelect = !!(this.selectedIOTHub && this.IOTselectedPolicy && this.selectedIOTEndpointId && this.IOTselectedSubscriptionName);
                    else this.canSelect = !!(this.selectedIOTHub && this.IOTselectedPolicy && this.selectedIOTEndpointId);
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

    private updateTopicPolicies(sbUrl: string, topicName: string){
        if (this.isServiceBusTopic) {
            Observable.zip(
                this._cacheService.getArm(sbUrl + "/AuthorizationRules", true),
                this._cacheService.getArm(sbUrl + "/topics/" + topicName + "/AuthorizationRules", true),
                (namespacePolicies, hubPolicies) => ({
                    namespacePolicies: namespacePolicies.json(),
                    hubPolicies: hubPolicies.json()
                })).subscribe(r => this.updatePoliciesHelper(r))
        } 
    }

    private updateQueuePolicies(sbUrl: string, queueName: string) {
        if (this.option === this.optionTypes.IOTHub) this.IOTpolices = null;
        if (this.option === this.optionTypes.serviceBus) this.polices = null;

        if (!this.isServiceBusTopic) {
            Observable.zip(
                this._cacheService.getArm(sbUrl + "/AuthorizationRules", true),
                this._cacheService.getArm(sbUrl + "/queues/" + queueName + "/AuthorizationRules", true),
                (namespacePolicies, hubPolicies) => ({
                    namespacePolicies: namespacePolicies.json(),
                    hubPolicies: hubPolicies.json()
                })).subscribe(r => this.updatePoliciesHelper(r))
        }
    }

    private updatePoliciesHelper(r) {
        if (this.option === this.optionTypes.IOTHub) {
            // hub
            this.IOTpolices = this.filterPolicies(r.hubPolicies);
            this.IOTpolices.value.forEach(item =>
                item.name += " " + this._translateService.instant(PortalResources.eventHubPicker_eventHubPolicy));

            // namespace
            let filteredNamespacePolicies = this.filterPolicies(r.namespacePolicies);
            filteredNamespacePolicies.value.forEach(item =>
                item.name += " " + this._translateService.instant(PortalResources.eventHubPicker_namespacePolicy));
            this.IOTpolices.value = this.IOTpolices.value.concat(filteredNamespacePolicies.value);
            if (this.IOTpolices.value.length > 0) this.IOTselectedPolicy = this.IOTpolices.value[0].id;
            this.setSelect();
        }
        if (this.option === this.optionTypes.serviceBus) {
            // hub
            this.polices = this.filterPolicies(r.hubPolicies);
            this.polices.value.forEach(item =>
                item.name += " " + this._translateService.instant(PortalResources.eventHubPicker_eventHubPolicy));

            // namespace
            let filteredNamespacePolicies = this.filterPolicies(r.namespacePolicies);
            filteredNamespacePolicies.value.forEach(item =>
                item.name += " " + this._translateService.instant(PortalResources.eventHubPicker_namespacePolicy));
            this.polices.value = this.polices.value.concat(filteredNamespacePolicies.value);
            if (this.polices.value.length > 0) this.selectedPolicy = this.polices.value[0].id;
            this.setSelect();
        }
    }

    private filterPolicies(policies: ArmArrayResult<any>): ArmArrayResult<any> {
        policies.value = policies.value.filter(p => (p.properties.rights.find(r => r === IoTHubConstants.manageAccessRight)));
        return policies;
    }
}
