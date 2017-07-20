import { Component, Input, Output, ChangeDetectionStrategy, EventEmitter, ViewChild } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { PopoverContent } from "ng2-popover";
import { BindingInputBase, TextboxInput } from '../../shared/models/binding-input';
import { PortalService } from '../../shared/services/portal.service';
import { UserService } from '../../shared/services/user.service';
import { PickerInput } from '../../shared/models/binding-input';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { BroadcastEvent } from '../../shared/models/broadcast-event';
import { SettingType, ResourceType, UIFunctionBinding } from '../../shared/models/binding';
import { DropDownElement } from '../../shared/models/drop-down-element';
import { PortalResources } from '../../shared/models/portal-resources';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { FunctionApp } from '../../shared/function-app';
import { CacheService } from '../../shared/services/cache.service';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { ArmService } from '../../shared/services/arm.service';
import { Subject } from 'rxjs/Subject';
import { Constants } from "../../shared/models/constants";
import { MobileAppsClient } from "../../shared/models/mobile-apps-client";
import { AiService } from '../../shared/services/ai.service';

@Component({
    selector: 'microsoft-graph',
    templateUrl: './microsoft-graph.component.html',
    styleUrls: ['../../binding-input/binding-input.component.css']
})

export class MicrosoftGraphComponent {
    @Output() validChange = new EventEmitter<BindingInputBase<any>>(false);
    private _functionApp: FunctionApp;
    private _input: BindingInputBase<any>;
    private showTryView: boolean;

    constructor(
        private _portalService: PortalService,
        private _broadcastService: BroadcastService,
        private _userService: UserService,
        private _translateService: TranslateService,
        private _globalStateService: GlobalStateService,
        private _cacheService: CacheService,
        private _armService: ArmService,
        private _aiService: AiService) {
        this.showTryView = this._globalStateService.showTryView;
    }

    @Input() set functionApp(functionApp: FunctionApp) {
        this._functionApp = functionApp;
    }

    @Input() set input(input: BindingInputBase<any>) {
        this._input = input;

        this.setClass(input.value);

    }


    get input(): BindingInputBase<any> {
        return this._input;
    }

    openLogin(input: PickerInput) {
        var options = {
            parameters: {
                prompt: 'login'
            }
        };

        let dataRetriever = new MobileAppsClient(this._functionApp.getMainSiteUrl(), this._aiService);
        dataRetriever.retrieveOID(options, input).then(values => {
            this._globalStateService.setBusyState();
            this._functionApp.createApplicationSetting(values.appSettingName, values.OID).subscribe(
                r => {                   
                    this._globalStateService.clearBusyState();
                    this.finishResourcePickup(values.appSettingName, input); // set selected drop-down item to app setting just created
                },
                error => {
                    this._globalStateService.clearBusyState();
                    this._aiService.trackException(error, 'MicrosoftGraph component - createApplicationSetting()');
                }
            );
            
        });
    }

    inputChanged(value: any) {
        if (this._input.changeValue) {
            this._input.changeValue(value);
        }

        this.setClass(value);
        this._broadcastService.broadcast(BroadcastEvent.IntegrateChanged);
    }

    private setClass(value: any) {
        if (this._input) {
            this._input.class = this.input.noErrorClass;
            var saveValid = this._input.isValid;

            if (this._input.required) {
                this._input.isValid = (value) ? true : false;
                this._input.class = this._input.isValid ? this._input.noErrorClass : this._input.errorClass;

                this._input.errorText = this._input.isValid ? "" : this._translateService.instant(PortalResources.filedRequired);

            } else {
                this._input.isValid = true;
                this._input.errorText = "";
            }

            if (this._input.isValid && this._input.validators) {
                this._input.validators.forEach((v) => {
                    var regex = new RegExp(v.expression);
                    if (!regex.test(value)) {
                        this._input.isValid = false;
                        this._input.class = this._input.errorClass;
                        this._input.errorText = v.errorText;
                    }
                });
            }

            //if (saveValid !== this._input.isValid) {
                this.validChange.emit(this._input);
            //}

        }
    }

    private finishResourcePickup(appSettingName: string, picker: PickerInput) {
        if (appSettingName) {

            var existedAppSetting;
            if (picker.items) {
                existedAppSetting = picker.items.find((item) => {
                    return item === appSettingName;
                });
            }

            this.input.value = appSettingName;
            if (!existedAppSetting) {
                picker.items.splice(0, 0, this.input.value);
            }
            this.inputChanged(appSettingName);
            this.setClass(appSettingName);
        }
        picker.inProcess = false;
        this._globalStateService.clearBusyState();
    }
}