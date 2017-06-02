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

class OptionTypes {    
    eventHub: string = "EventHub";
    IOTHub: string = "IOTHub";
    custom: string = "Custom";
}

class IOTKey {
    keyName: string;
    primaryKey: string;
    rights: string;
    secondaryKey: string;
}

@Component({
    selector: 'event-hub',
    templateUrl: './event-hub.component.html',
    styleUrls: ['./event-hub.component.scss']
})

export class EventHubComponent {
    public namespaces: ArmArrayResult;
    public eventHubs: ArmArrayResult;
    public polices: ArmArrayResult;
    public IOTHubs: ArmArrayResult;
    public IOTPolices: IOTKey[];
    public selectedNamespace: string;
    public selectedEventHub: string;
    public selectedPolicy: string;
    public selectedIOTHub: ArmObj<any>;
    public selectedIOTPolicy: IOTKey;
    public appSettingName: string;
    public appSettingValue: string;

    public selectInProcess: boolean = false;
    public options: SelectOption<string>[];
    public option: string;
    public canSelect: boolean = false;
    @Output() close = new Subject<void>();
    @Output() select = new Subject<string>();

    private _functionApp: FunctionApp;
    private _descriptor: SiteDescriptor;
    private optionsChange: Subject<string>;
    private optionTypes: OptionTypes = new OptionTypes();

    constructor(
        private _cacheService: CacheService,
        private _armService: ArmService,
        private _globalStateService: GlobalStateService, ) {

        this.options = [
            {
                displayLabel: "EventHub",
                value: this.optionTypes.eventHub
            }, {
                displayLabel: "IOT hub",
                value: this.optionTypes.IOTHub
            },
            {
                displayLabel: "Custom",
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
                this.selectedIOTHub = this.IOTHubs.value[0];
                this.onIOTHubChange(this.selectedIOTHub);
            }
        });

    }
           
    onChangeNamespace(value: string) {
        this.eventHubs = null;
        this.selectedEventHub = null;
        this.selectedPolicy = null;
        this._cacheService.getArm(value + "/eventHubs", true).subscribe(r => {
            this.eventHubs = r.json();
            if (this.eventHubs.value.length > 0) {
                this.selectedEventHub = this.eventHubs.value[0].id;
                this.onEventHubChange(this.selectedEventHub);
            }
            this.setSelect();
        });
    }

    onEventHubChange(value: string) {
        this.selectedPolicy = null;
        this.polices = null;
        this._cacheService.getArm(value + "/AuthorizationRules", true).subscribe(r => {
            this.polices = r.json();
            if (this.polices.value.length > 0) {
                this.selectedPolicy = this.polices.value[0].id;
            }
            this.setSelect();
        });
    }

    onIOTHubChange(value: ArmObj<any>) {
        this.IOTPolices = null;
        this.selectedIOTPolicy = null;
        this._cacheService.postArm(value.id + "/listkeys", true, '2017-01-19').subscribe(r => {
            var result = r.json();
            if (result.value) {
                this.IOTPolices = result.value;
                if (this.IOTPolices.length > 0) {
                    this.selectedIOTPolicy = this.IOTPolices[0];
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
            if (this.selectedNamespace && this.selectedEventHub && this.selectedPolicy) {
                this.selectInProcess = true;
                this._globalStateService.setBusyState();
                var appSettingName: string;
                return Observable.zip(
                    this._cacheService.getArm(this.selectedPolicy, true, "2014-09-01"),
                    this._cacheService.postArm(`${this._functionApp.site.id}/config/appsettings/list`, true),
                    (p, a) => ({ policy: p, appSettings: a }))
                    .flatMap(r => {
                        let namespace = this.namespaces.value.find(p => p.id === this.selectedNamespace);
                        let eventHub = this.eventHubs.value.find(p => p.id === this.selectedEventHub);

                        appSettingName = `${namespace.name}_${eventHub.name}_EVENTHUB`;
                        let policy: ArmObj<any> = r.policy.json();
                        let appSettingValue = `Endpoint=sb://${namespace.name}.servicebus.windows.net/;SharedAccessKeyName=${policy.properties.keyName};SharedAccessKey=${policy.properties.primaryKey};EntityPath=${eventHub.name}`

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
                        this.select.next(appSettingName);
                    });
            }
        } else {
            var appSettingName: string;
            var appSettingValue: string;
            if (this.option === this.optionTypes.IOTHub && this.selectedIOTHub && this.selectedIOTPolicy) {
                appSettingName = `${this.selectedIOTHub.name}_${this.selectedIOTPolicy.keyName}_IOTHUB`;
                appSettingValue = `HostName=${this.selectedIOTHub.name}.azure-devices.net;SharedAccessKeyName=${this.selectedIOTPolicy.keyName};SharedAccessKey=${this.selectedIOTPolicy.primaryKey}`;
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
                    this.select.next(appSettingName);
                });
            }
        }
    }

    public setSelect() {
        switch (this.option) {
            case this.optionTypes.custom:
                {
                    this.canSelect = (this.appSettingName && this.appSettingValue) ? true : false;
                    break;
                }
            case this.optionTypes.eventHub:
                {
                    this.canSelect = (this.selectedNamespace && this.selectedEventHub && this.selectedPolicy)
                        ? true : false;
                    break;
                }
            case this.optionTypes.IOTHub:
                {
                    this.canSelect = (this.selectedIOTHub && this.selectedIOTPolicy) ? true : false;
                    break;
                }
        }
    }

}
