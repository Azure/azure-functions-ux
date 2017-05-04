import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CacheService } from './../../shared/services/cache.service';
import {GlobalStateService} from '../../shared/services/global-state.service';
import {FunctionApp} from '../../shared/function-app';
import { SiteDescriptor } from './../../shared/resourceDescriptors';
import { ArmObj, ArmArrayResult} from './../../shared/models/arm/arm-obj';
import { ArmService } from '../../shared/services/arm.service';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'app-event-hub',
  templateUrl: './event-hub.component.html',
  styleUrls: ['./event-hub.component.scss']
})
export class EventHubComponent {
    public namespaces: ArmArrayResult;
    public eventHubs: ArmArrayResult;
    public polices: ArmArrayResult;
    public selectedNamespace: string;
    public selectedEventHub: string;
    public selectedPolicy: string;
    public selectInProcess: boolean = false;;
    @Output() close = new EventEmitter<void>();
    @Output() select = new EventEmitter<string>();

    private _functionApp: FunctionApp;
    private _descriptor: SiteDescriptor;

    constructor(
        private _cacheService: CacheService,
        private _armService: ArmService,
        private _globalStateService: GlobalStateService, ) {

    }

    @Input() set functionApp(functionApp: FunctionApp) {
        this._functionApp = functionApp;
        this._descriptor = new SiteDescriptor(functionApp.site.id);

        let id = `/subscriptions/${this._descriptor.subscription}/providers/Microsoft.EventHub/namespaces`;

        this._cacheService.getArm(id, true, this._armService.websiteApiVersion).subscribe(r => {
            this.namespaces = r.json();
            if (this.namespaces.value.length > 0) {
                this.selectedNamespace = this.namespaces.value[0].id;
                this.onChangeNamespace(this.selectedNamespace);
            }
        });
    }
                
    onChangeNamespace(value: string) {
        this.eventHubs = null;
        this.selectedEventHub = null;
        this.selectedPolicy = null;
        this._cacheService.getArm(value + "/eventHubs", true, this._armService.websiteApiVersion).subscribe(r => {
            this.eventHubs = r.json();
            if (this.eventHubs.value.length > 0) {
                this.selectedEventHub = this.eventHubs.value[0].id;
                this.onEventHubChange(this.selectedEventHub);
            }
        });
    }

    onEventHubChange(value: string) {
        this.selectedPolicy = null;
        this.polices = null;
        this._cacheService.getArm(value + "/AuthorizationRules", true, this._armService.websiteApiVersion).subscribe(r => {
            this.polices = r.json();
            if (this.polices.value.length > 0) {
                this.selectedPolicy = this.polices.value[0].id;
            }
        });
    }


    onClose() {
        if(!this.selectInProcess) {
            this.close.emit(null);
        }
    }

    onSelect() {
        if (this.selectedNamespace && this.selectedEventHub && this.selectedPolicy) {
            this.selectInProcess = true;
            this._globalStateService.setBusyState();
            Observable.zip(
                this._cacheService.getArm(this.selectedPolicy, true, "2014-09-01"),
                this._cacheService.postArm(`${this._functionApp.site.id}/config/appsettings/list`, true),
                (p, a) => ({ policy: p, appSettings: a })).subscribe(r => {
                    let namespace = this.namespaces.value.find(p => p.id === this.selectedNamespace);
                    let eventHub = this.eventHubs.value.find(p => p.id === this.selectedEventHub);

                    let appSettingName = `${namespace.name}_${eventHub.name}_EVENTHUB`;
                    let policy: ArmObj<any> = r.policy.json();
                    let appSettingValue = `Endpoint=sb://${namespace.name}.servicebus.windows.net/;SharedAccessKeyName=${policy.properties.keyName};SharedAccessKey=${policy.properties.primaryKey};EntityPath=${eventHub.name}`

                    var appSettings: ArmObj<any> = r.appSettings.json();
                    appSettings.properties[appSettingName] = appSettingValue;
                    this._cacheService.putArm(appSettings.id, this._armService.websiteApiVersion, appSettings).subscribe(r => {
                        this._globalStateService.clearBusyState();
                        this.select.emit(appSettingName);
                    });
                });
        }
    }

}
