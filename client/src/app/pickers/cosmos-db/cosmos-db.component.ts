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
import { UserService } from '../../shared/services/user.service';
import { Subscription as Sub } from '../../shared/models/subscription';
import { SiteService } from '../../shared/services/site.service';
import { FunctionService } from 'app/shared/services/function.service';

class OptionTypes {
  cosmosDB = 'CosmosDB';
  custom = 'Custom';
}

@Component({
  selector: 'cosmos-db',
  templateUrl: './cosmos-db.component.html',
  styleUrls: ['./../picker.scss'],
})
export class CosmosDBComponent extends FunctionAppContextComponent {
  public subscriptions: SelectOption<Sub>[];
  public databases: ArmArrayResult<any>;
  public selectedSubscription: string;
  public selectedDatabase: string;
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

  private _subscription: Subscription;

  constructor(
    private _cacheService: CacheService,
    private _armService: ArmService,
    private _globalStateService: GlobalStateService,
    private _translateService: TranslateService,
    private _userService: UserService,
    private _siteService: SiteService,
    functionAppService: FunctionAppService,
    broadcastService: BroadcastService,
    functionService: FunctionService
  ) {
    super('cosmos-db', functionAppService, broadcastService, functionService);

    this.options = [
      {
        displayLabel: this._translateService.instant(PortalResources.azureCosmosDB_account),
        value: this.optionTypes.cosmosDB,
      },
      {
        displayLabel: this._translateService.instant(PortalResources.eventHubPicker_custom),
        value: this.optionTypes.custom,
      },
    ];

    this.option = this.optionTypes.cosmosDB;

    this.optionsChange = new Subject<string>();
    this.optionsChange.subscribe(option => {
      this.option = option;
      this.setSelect();
    });
  }

  setup(): Subscription {
    return this.viewInfoEvents
      .switchMap(view => {
        return this._userService.getStartupInfo();
      })
      .first()
      .subscribe(r => {
        this.subscriptions = r.subscriptions
          .map(e => ({ displayLabel: e.displayName, value: e }))
          .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));

        if (this.subscriptions.length > 0) {
          this.selectedSubscription = this.subscriptions[0].value.subscriptionId;
          this.onChangeSubscription(this.selectedSubscription);
        }
      });
  }

  onChangeSubscription(value: string) {
    this.databases = null;
    this.selectedDatabase = null;
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
    const id = `/subscriptions/${value}/providers/microsoft.documentdb/databaseAccounts`;
    this._subscription = this._cacheService.getArm(id, true, '2015-04-08').subscribe(r => {
      this.databases = r.json();
      if (this.databases.value.length > 0) {
        this.selectedDatabase = this.databases.value[0].id;
        this.setSelect();
      }
    });
  }

  onClose() {
    if (!this.selectInProcess) {
      this.close.next(null);
    }
  }

  onSelect() {
    if (this.option === this.optionTypes.cosmosDB) {
      this._cosmosDBSelected();
    } else {
      this._customSelected();
    }
  }

  public setSelect() {
    switch (this.option) {
      case this.optionTypes.custom: {
        this.canSelect = !!(this.appSettingName && this.appSettingValue);
        break;
      }
      case this.optionTypes.cosmosDB: {
        this.canSelect = !!this.selectedDatabase;
        break;
      }
    }
  }

  private _cosmosDBSelected(): Subscription | null {
    if (this.selectedDatabase) {
      this.selectInProcess = true;
      this._globalStateService.setBusyState();
      let appSettingName: string;

      return Observable.zip(
        this._cacheService.postArm(this.selectedDatabase + '/listkeys', true, '2015-04-08'),
        this._siteService.getAppSettings(this.context.site.id),
        (p, a) => ({ keys: p, appSettings: a })
      )
        .flatMap(r => {
          const database = this.databases.value.find(d => d.id === this.selectedDatabase);
          const keys = r.keys.json();

          appSettingName = `${database.name}_DOCUMENTDB`;
          const appSettingValue = `AccountEndpoint=${database.properties.documentEndpoint};AccountKey=${keys.primaryMasterKey};`;

          const appSettings: ArmObj<any> = r.appSettings.result;
          appSettings.properties[appSettingName] = appSettingValue;
          return this._cacheService.putArm(appSettings.id, this._armService.antaresApiVersion20181101, appSettings);
        })
        .do(null, e => {
          this._globalStateService.clearBusyState();
          this.selectInProcess = false;
          this.showComponentError(e);
        })
        .subscribe(() => {
          this._globalStateService.clearBusyState();
          this.selectItem.next(appSettingName);
        });
    } else {
      return null;
    }
  }

  private _customSelected(): Subscription | null {
    let appSettingName: string;
    let appSettingValue: string;
    appSettingName = this.appSettingName;
    appSettingValue = this.appSettingValue;

    if (appSettingName && appSettingValue) {
      this.selectInProcess = true;
      this._globalStateService.setBusyState();
      this._siteService
        .getAppSettings(this.context.site.id)
        .flatMap(r => {
          const appSettings: ArmObj<any> = r.result;
          appSettings.properties[appSettingName] = appSettingValue;
          return this._cacheService.putArm(appSettings.id, this._armService.antaresApiVersion20181101, appSettings);
        })
        .do(null, e => {
          this._globalStateService.clearBusyState();
          this.selectInProcess = false;
          this.showComponentError(e);
        })
        .subscribe(() => {
          this._globalStateService.clearBusyState();
          this.selectItem.next(appSettingName);
        });
    } else {
      return null;
    }
    return null;
  }
}
