import { Component, OnInit, Input } from '@angular/core';
import {Subject} from 'rxjs/Rx';
//import {FunctionsService} from '../shared/services/functions.service';
//import {FunctionInfo} from '../shared/models/function-info';
import {SelectOption} from '../shared/models/select-option';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../shared/models/portal-resources';
import {GlobalStateService} from '../shared/services/global-state.service';
import {ArmService} from '../shared/services/arm.service';
import {FunctionContainer} from '../shared/models/function-container';
import {Constants} from '../shared/models/constants';

@Component({
  selector: 'api-settings',
  templateUrl: './api-settings.component.html',
  //styleUrls: ['./api-settings.component.scss']
  styleUrls: ['./../app-settings/app-settings.component.css'],
})
export class ApiSettingsComponent implements OnInit {
    //@Input() selectedFunction: FunctionInfo;
    @Input() functionContainer: FunctionContainer;
    public functionStatusOptions: SelectOption<boolean>[];
    public disabled: boolean;
    public needUpdateRoutingExtensionVersion: boolean;
    public extensionVersion: string;
    public latestExtensionVersion: string;
    public apiProxiesEnabled: boolean;
    private valueChange: Subject<boolean>;

    constructor(
        private _translateService: TranslateService,
        private _globalStateService: GlobalStateService,
        private _armService: ArmService
    ) {
      this.functionStatusOptions = [
          {
              displayLabel: this._translateService.instant(PortalResources.off),
              value: false
          }, {
              displayLabel: this._translateService.instant(PortalResources.on),
              value: true
          }];


      this.needUpdateRoutingExtensionVersion = true;
      this.valueChange = new Subject<boolean>();
      this.valueChange.subscribe((value: boolean) => {
          this._globalStateService.setBusyState();
          var appSettingValue: string = value ? Constants.routingExtensionVersion : Constants.disabled;
          this._armService.getFunctionContainerAppSettings(this.functionContainer).subscribe((appSettings) => {
              this._armService.updateApiProxiesVesrion(this.functionContainer, appSettings, appSettingValue).subscribe((r) => {
                  this._globalStateService.AppSettings = r;
                  this._globalStateService.clearBusyState();
                  this.apiProxiesEnabled = value;
              });
          });
      });
          //.switchMap((state, index) => {
          //    //this.selectedFunction.config.disabled = state;
          //    //return this._functionsService.updateFunction(this.selectedFunction);
          //});
          ////.subscribe(fi => this.selectedFunction.config.disabled = fi.config.disabled);


  }

    ngOnInit() {
        this._globalStateService.clearBusyState();
        this.needUpdateRoutingExtensionVersion = !this._globalStateService.IsLatestRoutingVersion;
        this.extensionVersion = this._globalStateService.RoutingExtensionVersion;
        this.latestExtensionVersion = Constants.routingExtensionVersion;

        this.apiProxiesEnabled = ((this.extensionVersion) && (this.extensionVersion !== Constants.disabled));
    }

}
