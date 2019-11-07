import { DropDownComponent } from './../../drop-down/drop-down.component';
import { KeyCodes, PickerNames } from './../../shared/models/constants';
import { FunctionAppContext } from './../../shared/function-app-context';
import { FunctionAppContextComponent } from 'app/shared/components/function-app-context-component';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { Subject } from 'rxjs/Subject';
import { Component, Input, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PopoverContent } from 'ng2-popover';
import { BindingInputBase } from '../../shared/models/binding-input';
import { PortalService } from '../../shared/services/portal.service';
import { UserService } from '../../shared/services/user.service';
import { PickerInput } from '../../shared/models/binding-input';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { SettingType, ResourceType, UIFunctionBinding } from '../../shared/models/binding';
import { DropDownElement } from '../../shared/models/drop-down-element';
import { PortalResources } from '../../shared/models/portal-resources';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { CacheService } from './../../shared/services/cache.service';
import { ScenarioService } from '../../shared/services/scenario/scenario.service';
import { ScenarioIds } from '../../shared/models/constants';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { FunctionService } from 'app/shared/services/function.service';

@Component({
  selector: 'binding-input-v2',
  templateUrl: './binding-input-v2.component.html',
  styleUrls: ['./binding-input-v2.component.scss'],
})
export class BindingInputV2Component extends FunctionAppContextComponent {
  @Input()
  binding: UIFunctionBinding;
  @Output()
  validChange = new Subject<BindingInputBase<any>>();
  @ViewChild('pickerPopover')
  pickerPopover: PopoverContent;
  @ViewChild('dropdown')
  dropdownElement: DropDownComponent<any>;
  public disabled: boolean;
  public enumInputs: DropDownElement<any>[];
  public pickerInputs: DropDownElement<any>[];
  public description: string;
  public functionReturnValue: boolean;
  public pickerName: string;
  public appSettingValue: string;
  public showAppSettingValue = false;
  public showTryView: boolean;
  public PickerNames = PickerNames;

  private _input: BindingInputBase<any>;
  private useCustomFunctionInputPicker: boolean;

  constructor(
    private _portalService: PortalService,
    private _userService: UserService,
    private _translateService: TranslateService,
    private _globalStateService: GlobalStateService,
    private _cacheService: CacheService,
    private _scenarioService: ScenarioService,
    broadcastService: BroadcastService,
    functionAppService: FunctionAppService,
    functionService: FunctionService
  ) {
    super(
      'binding-input-v2',
      functionAppService,
      broadcastService,
      functionService,
      () => this._globalStateService.setBusyState(),
      () => this._globalStateService.clearBusyState()
    );
    this.useCustomFunctionInputPicker = this._scenarioService.checkScenario(ScenarioIds.headerOnTopOfSideNav).status === 'enabled';
    this.showTryView = _globalStateService.showTryView;
  }

  @Input('input')
  set input(input: BindingInputBase<any>) {
    if (input.type === SettingType.picker) {
      const picker = <PickerInput>input;
      if (!input.value && picker.items) {
        input.value = picker.items[0];
      }
      this.pickerInputs = picker.items.map(p => ({ displayLabel: p, value: p }));
    }

    this._input = input;
    this._input.okEmpty = this._input.value === '' || !this._input.value;
    this.setBottomDescription(this._input.id);

    this.setClass(input.value);
    if (this._input.type === SettingType.enum) {
      const enums: { display: string; value: any }[] = (<any>this._input).enum;
      this.enumInputs = enums.map(e => ({ displayLabel: e.display, value: e.value, default: this._input.value === e.value }));
    }

    if (input.id === 'name' && input.value === '$return') {
      this.functionReturnValue = true;
      this.disabled = true;
    }
  }

  get input(): BindingInputBase<any> {
    return this._input;
  }

  openPicker(input: PickerInput) {
    let bladeInput = null;
    switch (input.resource) {
      case ResourceType.Storage:
        this.pickerName = this.useCustomFunctionInputPicker ? PickerNames.storage : PickerNames.storageBlade;
        break;
      case ResourceType.EventHub:
        this.pickerName = this.useCustomFunctionInputPicker ? PickerNames.appSetting : PickerNames.eventHub;
        break;
      case ResourceType.ServiceBus:
        this.pickerName = this.useCustomFunctionInputPicker ? PickerNames.appSetting : PickerNames.serviceBus;
        break;
      case ResourceType.AppSetting:
        this.pickerName = PickerNames.appSetting;
        break;
      case ResourceType.DocumentDB:
        this.pickerName = this.useCustomFunctionInputPicker ? PickerNames.appSetting : PickerNames.cosmosDB;
        break;
      case ResourceType.ServiceBus:
        this.pickerName = this.useCustomFunctionInputPicker ? PickerNames.appSetting : PickerNames.notificationHubBlade;
        break;
      case ResourceType.ApiHub:
        bladeInput = input.metadata;
        bladeInput.bladeName = PickerNames.createDataBlade;
        break;
      case ResourceType.Sql:
        this.pickerName = this.useCustomFunctionInputPicker ? PickerNames.sql : PickerNames.appSetting;
        break;
      default:
        this.pickerName = PickerNames.appSetting;
    }

    if (!this._userService.inIFrame) {
      return;
    }

    const picker = <PickerInput>this.input;
    picker.inProcess = true;

    if (
      this.pickerName !== PickerNames.eventHub &&
      this.pickerName !== PickerNames.serviceBus &&
      this.pickerName !== PickerNames.appSetting &&
      this.pickerName !== PickerNames.cosmosDB
    ) {
      this._globalStateService.setBusyState(this._translateService.instant(PortalResources.resourceSelect));

      if (bladeInput) {
        this._portalService.openCollectorBladeWithInputs(this.context.site.id, bladeInput, 'binding-input', (appSettingName: string) => {
          this.finishResourcePickup(appSettingName, picker);
        });
      } else {
        this._portalService.openCollectorBlade(this.context.site.id, this.pickerName, 'binding-input', (appSettingName: string) => {
          this.finishResourcePickup(appSettingName, picker);
        });
      }
    }
  }

  inputChanged(value: any) {
    this.setBottomDescription(this._input.id);
    if (this._input.changeValue) {
      this._input.changeValue(value);
    }

    this.setClass(value);
    this._broadcastService.broadcastEvent<FunctionAppContext>(BroadcastEvent.IntegrateChanged, this.context);
  }

  onAppSettingValueShown() {
    return this._cacheService
      .postArm(`${this.context.site.id}/config/appsettings/list`, true)
      .do(null, () => {
        this.appSettingValue = this._translateService.instant(PortalResources.bindingInput_appSettingNotFound);
      })
      .subscribe(r => {
        this.appSettingValue = r.json().properties[this._input.value];
        if (!this.appSettingValue) {
          this.appSettingValue = this._translateService.instant(PortalResources.bindingInput_appSettingNotFound);
        }
      });
  }

  onAppSettingValueHidden() {
    this.appSettingValue = null;
  }

  updateAppSettingValue() {
    this.showAppSettingValue = !this.showAppSettingValue;
    if (this.showAppSettingValue) {
      this.onAppSettingValueShown();
    } else {
      this.onAppSettingValueHidden();
    }
  }

  onDropDownInputChanged(value: any) {
    this._input.value = value;
    this.inputChanged(value);
  }

  onInfoKeyPress(event: KeyboardEvent, input: BindingInputBase<any>) {
    if (event.keyCode === KeyCodes.enter) {
      input.showHelp = !input.showHelp;
    }
  }

  onNewKeyPress(event: KeyboardEvent, input: PickerInput) {
    if (event.keyCode === KeyCodes.enter) {
      this.openPicker(input);
    }
  }

  onShowValueKeyPress(event: KeyboardEvent) {
    if (event.keyCode === KeyCodes.enter) {
      this.updateAppSettingValue();
    }
  }

  functionReturnValueChanged(value: any) {
    if (value) {
      this._input.value = '$return';
      this.inputChanged('$return');
    }
    this.disabled = value;
  }

  closePicker() {
    this.pickerName = '';
    const picker = <PickerInput>this.input;
    picker.inProcess = false;
  }

  finishDialogPicker(appSettingName: any) {
    const picker = <PickerInput>this.input;
    this.pickerName = '';
    this.finishResourcePickup(appSettingName, picker);
  }

  private setClass(value: any) {
    if (this._input) {
      this._input.class = this.input.noErrorClass;
      const saveValid = this._input.isValid;

      if (this._input.required) {
        this._input.okEmpty = (value === '' || !this._input.value) && this._input.okEmpty;
        this._input.isValid = value ? true : false;
        this._input.class = this._input.isValid ? this._input.noErrorClass : this._input.errorClass;

        this._input.errorText = this._input.isValid ? '' : this._translateService.instant(PortalResources.fieldRequired);
      } else {
        this._input.isValid = true;
        this._input.errorText = '';
      }

      if (this._input.isValid && this._input.validators) {
        this._input.validators.forEach(v => {
          const regex = new RegExp(v.expression);
          if (!regex.test(value)) {
            this._input.isValid = true;
            this._input.class = this._input.errorClass;
            this._input.errorText = v.errorText;
          }
        });
      }

      if (saveValid !== this._input.isValid) {
        this.validChange.next(this._input);
      }
    }
  }

  private finishResourcePickup(appSettingName: string, picker: PickerInput) {
    if (appSettingName) {
      let existingAppSetting;
      if (picker.items) {
        existingAppSetting = picker.items.find(item => {
          return item === appSettingName;
        });
      }

      this.input.value = appSettingName;
      if (!existingAppSetting) {
        picker.items.splice(0, 0, this.input.value);
        this.pickerInputs = picker.items.map(p => ({ displayLabel: p, value: p }));
      } else {
        this.dropdownElement.onSelectValue(appSettingName);
      }
    }

    picker.inProcess = false;
    this._globalStateService.clearBusyState();
  }

  setBottomDescription(id: string) {
    switch (
      id
      // TODO: Temporarily hide cron expression string
      // https://github.com/projectkudu/AzureFunctionsPortal/issues/398
      // case "schedule":
      //    this.description = prettyCron.toString(value);
    ) {
    }
  }
}
