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
    serviceBus: string = "ServiceBus";
    custom: string = "Custom";
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
                displayLabel: this._translateService.instant(PortalResources.serviceBusPicker_serviceBus),
                value: this.optionTypes.serviceBus,
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

        let id = `/subscriptions/${this._descriptor.subscription}/providers/Microsoft.ServiceBus/namespaces`;

        this._cacheService.getArm(id, true).subscribe(r => {
            this.namespaces = r.json();
            if (this.namespaces.value.length > 0) {
                this.selectedNamespace = this.namespaces.value[0].id;
                this.onChangeNamespace(this.selectedNamespace);
            }
        });

    }
           
    onChangeNamespace(value: string) {
        this.polices = null;
        this.selectedPolicy = null;
        this._cacheService.getArm(value + "/AuthorizationRules", true).subscribe(r => {
            this.polices = r.json();
            if (this.polices.value.length > 0) {
                this.selectedPolicy = this.polices.value[0].id;
                this.setSelect();
            }
        });
    }

    onClose() {
        if(!this.selectInProcess) {
            this.close.next(null);
        }
    }

    onSelect() {
        if (this.option === this.optionTypes.serviceBus) {
            if (this.selectedPolicy) {
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

                        appSettingName = `${namespace.name}_${keys.keyName}_SERVICEBUS`;
                        let appSettingValue = keys.primaryConnectionString;

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
            appSettingName = this.appSettingName;
            appSettingValue = this.appSettingValue;


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
            case this.optionTypes.serviceBus:
                {
                    this.canSelect = !!(this.selectedPolicy);
                    break;
                }
        }
    }


}
