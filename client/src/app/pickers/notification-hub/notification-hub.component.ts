import { ArmSiteDescriptor } from './../../shared/resourceDescriptors';
import { Component, Output } from '@angular/core';
import { CacheService } from './../../shared/services/cache.service';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { ArmObj, ArmArrayResult } from './../../shared/models/arm/arm-obj';
import { ArmService } from '../../shared/services/arm.service';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { SelectOption } from '../../shared/models/select-option';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../shared/models/portal-resources';
import { Subscription } from 'rxjs/Subscription';
import { FunctionAppContextComponent } from 'app/shared/components/function-app-context-component';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { FunctionService } from 'app/shared/services/function.service';

class OptionTypes {
  notificationHub = 'NotificationHub';
  custom = 'Custom';
}

@Component({
  selector: 'notification-hub',
  templateUrl: './notification-hub.component.html',
  styleUrls: ['./../picker.scss'],
})
export class NotificationHubComponent extends FunctionAppContextComponent {
  public namespaces: ArmArrayResult<any>;
  public notificationHubs: ArmArrayResult<any>;
  public namespacePolices: ArmArrayResult<any>;
  public polices: ArmArrayResult<any>;
  public selectedNamespace: string;
  public selectedNotificationHub: string;
  public selectedPolicy: string;
  public appSettingName: string;
  public appSettingValue: string;
  public optionsChange: Subject<string>;
  public optionTypes: OptionTypes = new OptionTypes();

  public selectInProcess = false;
  public options: SelectOption<string>[];
  public option: string;
  public canSelect = false;
  @Output()
  close = new Subject<void>();
  @Output()
  selectItem = new Subject<string>();

  constructor(
    private _cacheService: CacheService,
    private _armService: ArmService,
    private _globalStateService: GlobalStateService,
    private _translateService: TranslateService,
    functionAppService: FunctionAppService,
    broadcastService: BroadcastService,
    functionService: FunctionService
  ) {
    super('notification-hub', functionAppService, broadcastService, functionService);

    this.options = [
      {
        displayLabel: this._translateService.instant(PortalResources.notificationHubPicker_notificationHub),
        value: this.optionTypes.notificationHub,
      },
      {
        displayLabel: this._translateService.instant(PortalResources.eventHubPicker_custom),
        value: this.optionTypes.custom,
      },
    ];

    this.option = this.optionTypes.notificationHub;

    this.optionsChange = new Subject<string>();
    this.optionsChange.subscribe(option => {
      this.option = option;
      this.setSelect();
    });
  }

  setup(): Subscription {
    return this.viewInfoEvents
      .switchMap(view => {
        const id = `/subscriptions/${
          (<ArmSiteDescriptor>view.siteDescriptor).subscription
        }/providers/Microsoft.NotificationHubs/namespaces`;
        return this._cacheService.getArm(id, true, this._armService.notificationHubApiVersion);
      })
      .subscribe(r => {
        this.namespaces = r.json();
        if (this.namespaces.value.length > 0) {
          this.selectedNamespace = this.namespaces.value[0].id;
          this.onChangeNamespace(this.selectedNamespace);
        }
      });
  }

  onChangeNamespace(value: string) {
    this.notificationHubs = null;
    this.selectedNotificationHub = null;
    this.selectedPolicy = null;
    Observable.zip(
      this._cacheService.getArm(value + '/notificationHubs', true, this._armService.notificationHubApiVersion),
      this._cacheService.getArm(value + '/AuthorizationRules', true, this._armService.notificationHubApiVersion),
      (hubs, namespacePolices) => ({ hubs: hubs.json(), namespacePolices: namespacePolices.json() })
    )
      .do(null, e => {
        this._globalStateService.clearBusyState();
        console.log(e);
      })
      .subscribe(r => {
        this.notificationHubs = r.hubs;
        if (this.notificationHubs.value.length > 0) {
          this.selectedNotificationHub = this.notificationHubs.value[0].id;
          this.onNotificationHubChange(this.selectedNotificationHub);
        }
        this.namespacePolices = r.namespacePolices;
        if (this.namespacePolices.value.length > 0) {
          this.namespacePolices.value.forEach(item => {
            item.name += ' ' + this._translateService.instant(PortalResources.eventHubPicker_namespacePolicy);
          });

          this.selectedPolicy = r.namespacePolices.value[0].id;
          this.polices = this.namespacePolices;
        }
        this.setSelect();
      });
  }

  onNotificationHubChange(value: string) {
    this.selectedPolicy = null;
    this.polices = null;
    this._cacheService
      .getArm(value + '/AuthorizationRules', true, this._armService.notificationHubApiVersion)
      .do(null, e => {
        this._globalStateService.clearBusyState();
        console.log(e);
      })
      .subscribe(r => {
        this.polices = r.json();

        this.polices.value.forEach(item => {
          item.name += ' ' + this._translateService.instant(PortalResources.eventHubPicker_eventHubPolicy);
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

  onClose() {
    if (!this.selectInProcess) {
      this.close.next(null);
    }
  }

  onSelect(): Subscription | null {
    if (this.option === this.optionTypes.notificationHub) {
      if (this.selectedNotificationHub && this.selectedPolicy) {
        this.selectInProcess = true;
        this._globalStateService.setBusyState();
        let appSettingName: string;
        return Observable.zip(
          this._cacheService.postArm(this.selectedPolicy + '/listkeys', true, this._armService.notificationHubApiVersion),
          this._cacheService.postArm(`${this.context.site.id}/config/appsettings/list`, true),
          (p, a) => ({ keys: p, appSettings: a })
        )
          .flatMap(r => {
            const namespace = this.namespaces.value.find(p => p.id === this.selectedNamespace);
            const keys = r.keys.json();

            appSettingName = `${namespace.name}_${keys.keyName}_NH`;
            const appSettingValue = keys.primaryConnectionString;

            const appSettings: ArmObj<any> = r.appSettings.json();
            appSettings.properties[appSettingName] = appSettingValue;

            return this._cacheService.putArm(appSettings.id, this._armService.antaresApiVersion20181101, appSettings);
          })
          .do(null, e => {
            this._globalStateService.clearBusyState();
            this.selectInProcess = false;
            console.log(e);
          })
          .subscribe(() => {
            this._globalStateService.clearBusyState();
            this.selectItem.next(appSettingName);
          });
      }
    } else {
      const appSettingName = this.appSettingName;
      const appSettingValue = this.appSettingValue;

      if (appSettingName && appSettingValue) {
        this.selectInProcess = true;
        this._globalStateService.setBusyState();
        this._cacheService
          .postArm(`${this.context.site.id}/config/appsettings/list`, true)
          .flatMap(r => {
            const appSettings: ArmObj<any> = r.json();
            appSettings.properties[appSettingName] = appSettingValue;
            return this._cacheService.putArm(appSettings.id, this._armService.antaresApiVersion20181101, appSettings);
          })
          .do(null, e => {
            this._globalStateService.clearBusyState();
            this.selectInProcess = false;
            console.log(e);
          })
          .subscribe(() => {
            this._globalStateService.clearBusyState();
            this.selectItem.next(appSettingName);
          });
      }
    }
    return null;
  }

  public setSelect() {
    switch (this.option) {
      case this.optionTypes.custom: {
        this.canSelect = !!(this.appSettingName && this.appSettingValue);
        break;
      }
      case this.optionTypes.notificationHub: {
        this.canSelect = !!(this.selectedPolicy && this.selectedNotificationHub);
        break;
      }
    }
  }
}
