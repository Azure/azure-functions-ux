import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CacheService } from './../../shared/services/cache.service';
import {GlobalStateService} from '../../shared/services/global-state.service';
import {FunctionApp} from '../../shared/function-app';
import { SiteDescriptor } from './../../shared/resourceDescriptors';
import { ArmObj, ArmArrayResult} from './../../shared/models/arm/arm-obj';
import { ArmService } from '../../shared/services/arm.service';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Response } from '@angular/http';
import { SelectOption } from '../../shared/models/select-option';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources} from '../../shared/models/portal-resources';

class OptionTypes {    
    eventHub: string = "EventHub";
    IOTHub: string = "IOTHub";
    custom: string = "Custom";
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
    title: string;
}

@Component({
    selector: 'event-hub',
    templateUrl: './event-hub.component.html',
    styleUrls: ['./../picker.scss']
})

export class EventHubComponent {
    public namespaces: ArmArrayResult;
    public eventHubs: ArmArrayResult;
    public namespacePolices: ArmArrayResult;
    public polices: ArmArrayResult;
    public IOTHubs: ArmArrayResult;
    public IOTEndpoints: IOTEndpoint[];
    public selectedNamespace: string;
    public selectedEventHub: string;
    public selectedPolicy: string;
    public selectedIOTHub: string;
    public selectedIOTEndpoint: string;
    public appSettingName: string;
    public appSettingValue: string;
    public optionsChange: Subject<string>;
    public optionTypes: OptionTypes = new OptionTypes();

    public selectInProcess: boolean = false;
    public options: SelectOption<string>[];
    public option: string;
    public canSelect: boolean = false;
    @Output() close = new Subject<void>();
    @Output() selectItem = new Subject<string>();

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

    @Input() set functionApp(functionApp: FunctionApp) {
        this._functionApp = functionApp;
        this._descriptor = new SiteDescriptor(functionApp.site.id);

        let id = `/subscriptions/${this._descriptor.subscription}/providers/Microsoft.EventHub/namespaces`;

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
           
    onChangeNamespace(value: string) {
        this.eventHubs = null;
        this.selectedEventHub = null;
        this.selectedPolicy = null;
        Observable.zip(
            this._cacheService.getArm(value + "/eventHubs", true),
            this._cacheService.getArm(value + "/AuthorizationRules", true),
            (hubs, namespacePolices) => ({ hubs: hubs.json(), namespacePolices: namespacePolices.json() })).subscribe(r => {
                this.eventHubs = r.hubs;
                if (this.eventHubs.value.length > 0) {
                    this.selectedEventHub = this.eventHubs.value[0].id;
                    this.onEventHubChange(this.selectedEventHub);
                }
                this.namespacePolices = r.namespacePolices;
                if (this.namespacePolices.value.length > 0) {
                    this.namespacePolices.value.forEach((item) => {
                        item.name += " " + this._translateService.instant(PortalResources.eventHubPicker_namespacePolicy);;
                    });

                    this.selectedPolicy = r.namespacePolices.value[0].id;
                    this.polices = this.namespacePolices;

                }
                this.setSelect();

            });
    }

    onEventHubChange(value: string) {
        this.selectedPolicy = null;
        this.polices = null;
        this._cacheService.getArm(value + "/AuthorizationRules", true).subscribe(r => {
            this.polices = r.json();

            this.polices.value.forEach((item) => {
                item.name += " " + this._translateService.instant(PortalResources.eventHubPicker_eventHubPolicy);
            });

            if (this.namespacePolices.value.length > 0) {
                this.polices.value = this.polices.value.concat(this.namespacePolices.value);
            }

            if (this.polices.value.length > 0) {
                this.selectedPolicy = this.polices.value[0].id;
            }
            this.setSelect();
        });
    }

    onIOTHubChange(value: string) {
        this.IOTEndpoints = null;
        this.selectedIOTEndpoint = null;
        Observable.zip(
            this._cacheService.postArm(value + "/listkeys", true, '2017-01-19'),
            this._cacheService.getArm(value, true, '2017-01-19'),
            (keys, hub) => ({ keys: keys.json(), hub: hub.json() })).subscribe(r => {

                if (r.keys.value) {

                    // find service policy
                    var serviceKey: IOTKey = r.keys.value.find(item => (item.keyName === 'iothubowner'));
                    if (serviceKey) {
                        this.IOTEndpoints = [
                            {
                                name: this._translateService.instant(PortalResources.eventHubPicker_IOTEvents),
                                title: 'events',
                                value: this.getIOTConnstionString(r.hub.properties.eventHubEndpoints.events.endpoint,
                                    r.hub.properties.eventHubEndpoints.events.path, serviceKey.primaryKey)
                            },
                            {
                                name: this._translateService.instant(PortalResources.eventHubPicker_IOTMonitoring),
                                title: 'monitoring',
                                value: this.getIOTConnstionString(r.hub.properties.eventHubEndpoints.operationsMonitoringEvents.endpoint,
                                    r.hub.properties.eventHubEndpoints.operationsMonitoringEvents.path, serviceKey.primaryKey)
                            }
                        ];
                        this.selectedIOTEndpoint = this.IOTEndpoints[0].value;
                    }
                }
                this.setSelect();
            });
    }

    onClose() {
        if(!this.selectInProcess) {
            this.close.next(null);
        }
    }

    onSelect() {
        if (this.option === this.optionTypes.eventHub) {
            if (this.selectedEventHub && this.selectedPolicy) {
                this.selectInProcess = true;
                this._globalStateService.setBusyState();
                var appSettingName: string;
                return Observable.zip(
                    this._cacheService.postArm(this.selectedPolicy + '/listkeys', true, "2015-08-01"),
                    this._cacheService.postArm(`${this._functionApp.site.id}/config/appsettings/list`, true),
                    (p, a) => ({ keys: p, appSettings: a }))
                    .flatMap(r => {
                        let namespace = this.namespaces.value.find(p => p.id === this.selectedNamespace);
                        let keys = r.keys.json();

                        appSettingName = `${namespace.name}_${keys.keyName}_EVENTHUB`;
                        let appSettingValue = keys.primaryConnectionString;
                        if (appSettingValue.toLowerCase().indexOf('entitypath') === -1) {
                            // Namespace connection string
                            let eventHub = this.eventHubs.value.find(p => p.id === this.selectedEventHub);
                            appSettingValue = `${appSettingValue};EntityPath=${eventHub.name}`;

                        }

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
                        this.selectItem.next(appSettingName);
                    });
            }
        } else {
            var appSettingName: string;
            var appSettingValue: string;
            if (this.option === this.optionTypes.IOTHub && this.selectedIOTHub && this.selectedIOTEndpoint) {

                var IOTHub = this.IOTHubs.value.find(item => (item.id === this.selectedIOTHub));
                var IOTEndpoint = this.IOTEndpoints.find(item => (item.value === this.selectedIOTEndpoint));

                appSettingName = `${IOTHub.name}_${IOTEndpoint.title}_IOTHUB`;
                appSettingValue = IOTEndpoint.value;
            } else if (this.option === this.optionTypes.custom && this.appSettingName && this.appSettingValue) {
                appSettingName = this.appSettingName;
                appSettingValue = this.appSettingValue;
            }

            if (appSettingName && appSettingValue) {
                this.selectInProcess = true;
                this._globalStateService.setBusyState();
                this._cacheService.postArm(`${this._functionApp.site.id}/config/appsettings/list`, true).flatMap(r => {
                    var appSettings: ArmObj<any> = r.json();
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
                    this.selectItem.next(appSettingName);
                });
            }
        }
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
                    this.canSelect = !!(this.selectedPolicy && this.selectedEventHub);
                    break;
                }
            case this.optionTypes.IOTHub:
                {
                    this.canSelect = !!(this.selectedIOTHub && this.selectedIOTEndpoint);
                    break;
                }
        }
    }

    private getIOTConnstionString(endpoint: string, path:string, key: string) {
        return `Endpoint=${endpoint};SharedAccessKeyName=iothubowner;SharedAccessKey=${key};EntityPath=${path}`;
    }

}
