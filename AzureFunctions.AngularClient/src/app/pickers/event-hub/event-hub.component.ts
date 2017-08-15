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
import { Subscription } from "rxjs/Subscription";

class OptionTypes {
    eventHub = 'EventHub';
    IOTHub = 'IOTHub';
    custom = 'Custom';
}

interface IOTKey {
    keyName: string;
    primaryKey: string;
    rights: string;
    secondaryKey: string;
}

interface IOTEndpoint {
    name: string;
    value: string;
    isBuiltIn: boolean;
    entityPath: string;
    subscriptionId: string;
    resourceGroupName: string;
}

interface IOTBuiltInPolicy {
    name: string;
    id: string;
}

@Component({
    selector: 'event-hub',
    templateUrl: './event-hub.component.html',
    styleUrls: ['./../picker.scss']
})

export class EventHubComponent {
    public namespaces: ArmArrayResult<any>;
    public eventHubs: ArmArrayResult<any>;
    public namespacePolices: ArmArrayResult<any>;
    public polices: ArmArrayResult<any>;
    public IOTHubs: ArmArrayResult<any>;
    public IOTEndpoints: IOTEndpoint[];
    public selectedNamespace: string;
    public selectedEventHub: string;
    public selectedPolicy: string;
    public selectedIOTHub: string;
    public selectedIOTEndpoint: IOTEndpoint;
    public selectedIOTEndpointName: string;
    public eventHubConsumerGroups: any[];
    public selectedEventHubConsumerGroup: string;
    public IOTConsumerGroups: any[];
    public selectedIOTConsumerGroup: string;
    public IOTPolicies: ArmArrayResult<any>;
    public selectedIOTPolicy: string;
    public appSettingName: string;
    public appSettingValue: string;
    public optionsChange: Subject<string>;
    public optionTypes: OptionTypes = new OptionTypes();
    public selectInProcess = false;
    public options: SelectOption<string>[];
    public option: string;
    public canSelect: boolean = false;
    public isTrigger: boolean = true;

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
                displayLabel: this._translateService.instant(PortalResources.eventHubPicker_eventHub),
                value: this.optionTypes.eventHub,
            }, {
                displayLabel: this._translateService.instant(PortalResources.eventHubPicker_IOTHub),
                value: this.optionTypes.IOTHub
            },
            {
                displayLabel: this._translateService.instant(PortalResources.eventHubPicker_custom),
                value: this.optionTypes.custom
            }
        ];
        this.option = this.optionTypes.eventHub;
        this.optionsChange = new Subject<string>();
        this.optionsChange.subscribe((option) => {
            this.option = option;
            this.setSelect();
        });
    }
    
    @Input() set bindingDirection(bindingDirection: DirectionType) {
        this.isTrigger = bindingDirection === DirectionType.trigger;
    };

    @Input() set functionApp(functionApp: FunctionApp) {
        this._functionApp = functionApp;
        this._descriptor = new SiteDescriptor(functionApp.site.id);

        const id = `/subscriptions/${this._descriptor.subscription}/providers/Microsoft.EventHub/namespaces`;

        this._cacheService.getArm(id, true).subscribe(r => {
            this.namespaces = r.json();
            if (this.namespaces.value.length > 0) {
                this.selectedNamespace = this.namespaces.value[0].id;
                this.onChangeNamespace(this.selectedNamespace);
            }
        });

        const devicesId = `/subscriptions/${this._descriptor.subscription}/providers/Microsoft.Devices/IotHubs`;

        this._cacheService.getArm(devicesId, true, IoTHubConstants.apiVersion17).subscribe(r => {
            this.IOTHubs = r.json();
            if (this.IOTHubs.value.length > 0) {
                this.selectedIOTHub = this.IOTHubs.value[0].id;
                this.onIOTHubChange(this.selectedIOTHub);
            }
        });

    }

    onChangeNamespace(value: string) {
        this.eventHubs = null;
        this.selectedEventHub = null;
        this.selectedPolicy = null;
        this.eventHubConsumerGroups = null;
        this.selectedEventHubConsumerGroup = null;
        this.setSelect();
        Observable.zip(
            this._cacheService.getArm(value + '/eventHubs', true),
            this._cacheService.getArm(value + '/AuthorizationRules', true),
            (hubs, namespacePolices) => ({
                hubs: hubs.json(),
                namespacePolices: namespacePolices.json()
            })).subscribe(r => {
                this.eventHubs = r.hubs;
                if (this.eventHubs.value.length > 0) {
                    this.selectedEventHub = this.eventHubs.value[0].id;
                    this.onEventHubChange(this.selectedEventHub);
                }
                this.namespacePolices = this.filterIoTPolicies(r.namespacePolices);
                if (this.namespacePolices.value.length > 0) {
                    this.namespacePolices.value.forEach((item) => {
                        item.name += ' ' + this._translateService.instant(PortalResources.eventHubPicker_namespacePolicy);;
                    });

                    this.selectedPolicy = r.namespacePolices.value[0].id;
                    this.polices = this.namespacePolices;
                }
            });
    }

    onEventHubChange(value: string) {
        this.selectedPolicy = null;
        this.polices = null;
        this.eventHubConsumerGroups = null;
        this.selectedEventHubConsumerGroup = null;
        this.setSelect();
        Observable.zip(
            this._cacheService.getArm(value + "/AuthorizationRules", true),
            this._cacheService.getArm(value + "/ConsumerGroups", true),
            (policies, consumerGroups) => ({
                policies: policies.json(),
                consumerGroups: consumerGroups.json()
            })).subscribe(r => {

                this.polices = this.filterIoTPolicies(r.policies);
                this.polices.value.forEach((item) => {
                    item.name += " " + this._translateService.instant(PortalResources.eventHubPicker_eventHubPolicy);
                });

                if (this.namespacePolices.value.length > 0) {
                    this.polices.value = this.polices.value.concat(this.namespacePolices.value);
                }

                if (this.polices.value.length > 0) {
                    this.selectedPolicy = this.polices.value[0].id;
                }
                
                this.eventHubConsumerGroups = r.consumerGroups.value;
                this.selectedEventHubConsumerGroup = this.eventHubConsumerGroups[0].name;
                this.setSelect();
            });
    }
    
    onIOTHubChange(value: string) {
        this.IOTEndpoints = null;
        this.setSelectedIOTEndpointByObject(null);
        this.IOTPolicies = null;
        this.selectedIOTPolicy = null;
        this.IOTConsumerGroups = null;
        this.selectedIOTConsumerGroup = null;
        this.setSelect();
        Observable.zip(
            this._cacheService.postArm(value + "/listkeys", true, IoTHubConstants.apiVersion17),
            this._cacheService.getArm(value, true, IoTHubConstants.apiVersion17),
            this._cacheService.getArm(value + "/EventhubEndPoints/events/ConsumerGroups", true, IoTHubConstants.apiVersion17),
            (keys, hub, eventsConsumerGroup) => ({
                keys: keys.json(),
                hub: hub.json(),
                eventsConsumerGroup: eventsConsumerGroup.json()
            })).subscribe(r => {

                if (r.keys.value) {
                    const serviceKey: IOTKey = r.keys.value.find(item => (item.keyName === 'iothubowner'));
                    if (serviceKey) {
                        this.IOTEndpoints = [
                            {
                                name: this._translateService.instant(PortalResources.eventHubPicker_IOTEvents),
                                value: IoTHelper.getIOTConnectionString(r.hub.properties.eventHubEndpoints.events.endpoint,
                                    r.hub.properties.eventHubEndpoints.events.path, serviceKey.primaryKey),
                                isBuiltIn: true,
                                entityPath: r.hub.properties.eventHubEndpoints.events.path,
                                subscriptionId: null,
                                resourceGroupName: null
                            },
                            {
                                name: this._translateService.instant(PortalResources.eventHubPicker_IOTMonitoring),
                                value: IoTHelper.getIOTConnectionString(r.hub.properties.eventHubEndpoints.operationsMonitoringEvents.endpoint,
                                    r.hub.properties.eventHubEndpoints.operationsMonitoringEvents.path, serviceKey.primaryKey),
                                isBuiltIn: true,
                                entityPath: r.hub.properties.eventHubEndpoints.operationsMonitoringEvents.path,
                                subscriptionId: null,
                                resourceGroupName: null
                            }
                        ];

                        let hubs = r.hub.properties.routing.endpoints;
                        hubs.eventHubs.forEach(endpoint => {
                            this.IOTEndpoints.push({
                                name: endpoint.name,
                                value: endpoint.connectionString, // replace this in onSelect
                                isBuiltIn: false,
                                entityPath: IoTHelper.getEntityPathFrom(endpoint.connectionString),
                                subscriptionId: endpoint.subscriptionId,
                                resourceGroupName: endpoint.resourceGroup
                            })
                        });
                        this.setSelectedIOTEndpointByObject(this.IOTEndpoints[0]);

                        // policy (default to events)
                        this.IOTPolicies = r.keys.value.filter(rule => rule.rights.indexOf("ServiceConnect") > -1).map(rule =>
                            <IOTBuiltInPolicy>{
                                name: rule.keyName + " (" + rule.rights + ")",
                                id: rule.keyName
                            });         
                        this.selectedIOTPolicy = this.IOTPolicies[0].id;

                        // consumer groups (default to events)
                        this.IOTConsumerGroups = r.eventsConsumerGroup.value;
                        this.selectedIOTConsumerGroup = this.IOTConsumerGroups[0];
                    }
                }
                this.setSelect();
            });
    }

    onIoTEndpointsChange(endpointName: string) {
        this.IOTConsumerGroups = null;
        this.selectedIOTConsumerGroup = null;
        this.setSelectedIOTEndpointByName(endpointName);
        this.IOTPolicies = null;
        this.selectedIOTPolicy = null;
        this.setSelect();
        let eventHubEndpointName: string;
        if (!this.selectedIOTEndpoint.isBuiltIn) {
            eventHubEndpointName = IoTHelper.getEntityPathFrom(this.selectedIOTEndpoint.value);
            const newPolicyUrl = this.getEventHubUrlFrom(this.selectedIOTHub, this.selectedIOTEndpoint);
            const newNamespaceUrl = this.getNamespaceUrlFrom(this.selectedIOTHub, this.selectedIOTEndpoint);
            Observable.zip(
                this._cacheService.getArm(newPolicyUrl + "/authorizationRules", true),
                this._cacheService.getArm(newPolicyUrl + "/consumergroups", true),
                this._cacheService.getArm(newNamespaceUrl + "/authorizationRules", true),
                (policies, consumerGroups, namespacePolicies) => ({
                    policies: policies.json(),
                    consumerGroups: consumerGroups.json(),
                    namespacePolicies: namespacePolicies.json()
                })).subscribe(r => {
                    // policy
                    this.IOTPolicies = this.filterIoTPolicies(r.policies);
                    this.IOTPolicies.value.forEach(policy => policy.name += " " + this._translateService.instant(PortalResources.eventHubPicker_eventHubPolicy));

                    let namespacePolicies = this.filterIoTPolicies(r.namespacePolicies);
                    if (namespacePolicies.value.length > 0) {
                        namespacePolicies.value.forEach(item => item.name += " " + this._translateService.instant(PortalResources.eventHubPicker_namespacePolicy));
                    }

                    if (namespacePolicies.value.length > 0) {
                        this.IOTPolicies.value = this.IOTPolicies.value.concat(namespacePolicies.value);
                    }
                    if (this.IOTPolicies.value.length > 0) {
                        this.selectedIOTPolicy = this.IOTPolicies.value[0].id;
                    }

                    // ConsumerGroups
                    this.IOTConsumerGroups = r.consumerGroups.value.map(item => item.name);
                    this.selectedIOTConsumerGroup = this.IOTConsumerGroups[0];
                    this.setSelect();

                });
        }
        else {

            if (IoTHelper.getEntityPathFrom(this.selectedIOTEndpoint.value).indexOf("operationmonitoring") > -1) {
                eventHubEndpointName = "operationsMonitoringEvents";
            } else {
                eventHubEndpointName = "events";
            }

            Observable.zip(
                this._cacheService.postArm(this.selectedIOTHub + "/listkeys", true, IoTHubConstants.apiVersion17),
                this._cacheService.getArm(this.selectedIOTHub + "/EventhubEndPoints/" + eventHubEndpointName + "/ConsumerGroups", true, IoTHubConstants.apiVersion17),
                (policies, consumerGroups) => ({
                    policies: policies.json(),
                    consumerGroups: consumerGroups.json()
                })).subscribe(r => {
                    this.IOTPolicies = r.policies.value.filter(rule => rule.rights.indexOf("ServiceConnect") > -1).map(rule =>
                        <IOTBuiltInPolicy>{
                            name: rule.keyName + " (" + rule.rights + ")",
                            id: rule.keyName
                        });         
                    this.selectedIOTPolicy = this.IOTPolicies[0].id;
                    this.IOTConsumerGroups = r.consumerGroups.value;
                    this.selectedIOTConsumerGroup = this.IOTConsumerGroups[0];
                    this.setSelect();
                });
        }
    }

    onClose() {
        if (!this.selectInProcess) {
            this.close.next(null);
        }
    }

    onSelect(): Subscription | null {
        if (!this.canSelect) return null;

        let appSettingValue: string;
        if (this.option === this.optionTypes.eventHub) {
            if (this.selectedEventHub && this.selectedPolicy) {
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
						const selectedPolicy = this.getSelectedPolicyFromEventHub(this.selectedPolicy);

                        appSettingName = `${namespace.name}_${keys.keyName}_EVENTHUB_${selectedPolicy}`;
                        appSettingValue = keys.primaryConnectionString;
                        // Runtime requires entitypath for all event hub connections strings,
                        // so if it's namespace policy add entitypath as selected eventhub
                        if (appSettingValue.toLowerCase().indexOf('entitypath') === -1) {
                            const eventHub = this.eventHubs.value.find(p => p.id === this.selectedEventHub);
                            appSettingValue = `${appSettingValue};EntityPath=${eventHub.name}`;
                        }

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
                        this.selectItem.next(IoTHelper.generateEventHubAppSettingObject(appSettingName, appSettingValue, this.selectedEventHubConsumerGroup));
                    });
            }
        } else {
            let appSettingName: string;
            let appSettingValue: string;
            if (this.option === this.optionTypes.IOTHub && this.selectedIOTHub && this.selectedIOTEndpoint) {
                let IOTHub = this.IOTHubs.value.find(item => (item.id === this.selectedIOTHub));
                // appSettingValue
                if (this.selectedIOTEndpoint.isBuiltIn) {
                    appSettingName = `${IOTHub.name}_${this.selectedIOTEndpoint.name}_IOTHUB_${this.selectedIOTPolicy}`;
                    this._cacheService.postArm(this.selectedIOTHub + "/listkeys", true, IoTHubConstants.apiVersion17).subscribe(r => {
                        let serviceKey: IOTKey = r.json().value.find(item => (item.keyName === this.selectedIOTPolicy));
                        appSettingValue = IoTHelper.changeIOTConnectionStringPolicy(this.selectedIOTEndpoint.value, this.selectedIOTPolicy, serviceKey.primaryKey)
                        return this.setNonEventHubAppSetting(appSettingName, appSettingValue);
                    })
                }
                else {
                    let selectedPolicy = this.getSelectedPolicyFromEventHub(this.selectedIOTPolicy);
                    appSettingName = `${IOTHub.name}_${this.selectedIOTEndpoint.name}_IOTHUB_${selectedPolicy}`;
                    this._cacheService.postArm(this.selectedIOTPolicy + '/ListKeys', true, IoTHubConstants.apiVersion15)
                        .subscribe(r => {
                            appSettingValue = r.json().primaryConnectionString;
                            // Runtime requires entitypath for all event hub connections strings, 
                            // so if it's namespace policy add entitypath as selected eventhub
                            if (appSettingValue.toLowerCase().indexOf('entitypath') === -1) {
                                let path = this.selectedIOTEndpoint.entityPath;
                                appSettingValue = `${appSettingValue};EntityPath=${path}`;
                            }

                            return this.setNonEventHubAppSetting(appSettingName, appSettingValue);
                        });
                }
            } else if (this.option === this.optionTypes.custom && this.appSettingName && this.appSettingValue) {
                appSettingName = this.appSettingName;
                appSettingValue = this.appSettingValue;
                return this.setNonEventHubAppSetting(appSettingName, appSettingValue);
            }
            return null;
        }
        return null;
    }

    private setNonEventHubAppSetting(appSettingName: string, appSettingValue: string) {
        if (appSettingName && appSettingValue) {
            this.selectInProcess = true;
            this._globalStateService.setBusyState();
            return this._cacheService.postArm(`${this._functionApp.site.id}/config/appsettings/list`, true).flatMap(r => {
                let appSettings: ArmObj<any> = r.json();

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
                    this.selectItem.next(IoTHelper.generateEventHubAppSettingObject(appSettingName, appSettingValue, this.selectedIOTConsumerGroup));
                });
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
            case this.optionTypes.eventHub:
                {
                    this.canSelect = !!(this.selectedPolicy && this.selectedEventHub && this.selectedEventHubConsumerGroup);
                    break;
                }
            case this.optionTypes.IOTHub:
                {
                    this.canSelect = !!(this.selectedIOTHub && this.selectedIOTEndpoint && this.selectedIOTPolicy && this.selectedIOTConsumerGroup);
                    break;
                }
        }
    }

    /**
     * return
     * "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.EventHub/namespaces/{namespaceName}"
     * Inletiant: this.selectedIOTEndpoint.isBuiltIn === false (custom endpoints)
     */
    private getNamespaceUrlFrom(IOTHubUrl: string, customEndpoint: IOTEndpoint) {
        let connectionString = customEndpoint.value;
        let sb = "sb://";
        let sbLength = sb.length; // 5;
        let namespaceStartIndex = connectionString.indexOf(sb) + sbLength;
        let namespaceAfterEndIndex = connectionString.indexOf(".servicebus");
        return "/subscriptions/" + customEndpoint.subscriptionId + "/resourceGroups/"
            + customEndpoint.resourceGroupName + "/providers/Microsoft.EventHub/namespaces/" 
            + connectionString.substring(namespaceStartIndex, namespaceAfterEndIndex);
    }

    /**
    * return
    * "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.EventHub/namespaces/{namespaceName}/eventhubs/{eventHubName}"
    * Inletiant: this.selectedIOTEndpoint.isBuiltIn === false (custom endpoints)
    */
    private getEventHubUrlFrom(IOTHubUrl: string, customEndpoint: IOTEndpoint) {
        return this.getNamespaceUrlFrom(IOTHubUrl, customEndpoint)
            + "/eventhubs/" + IoTHelper.getEntityPathFrom(customEndpoint.value);
    }

    /**
     * id: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.EventHub/namespaces/{namespaceName}/authorizationRules/{ruleName}"
     */
    private getSelectedPolicyFromEventHub(id: string) {
        let authRule = "authorizationRules/";
        let startPolicyIndex = id.indexOf(authRule) + authRule.length;
        return id.substring(startPolicyIndex);
    }

    private setSelectedIOTEndpointByName(endpointName: string) {
        this.selectedIOTEndpoint = this.IOTEndpoints.find(item => (item.name === endpointName));
        this.selectedIOTEndpointName = endpointName;
    }

    private setSelectedIOTEndpointByObject(endpointObject: IOTEndpoint) {
        this.selectedIOTEndpoint = endpointObject;       
        this.selectedIOTEndpointName = (endpointObject) ? endpointObject.name : null;
    }

    private filterIoTPolicies(policies: ArmArrayResult<any>): ArmArrayResult<any> {
        policies.value = policies.value.filter(p => (p.properties.rights.find(r => r === IoTHubConstants.manageAccessRight)));
        return policies;
    }
}
