import { SiteService } from './../shared/services/site.service';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { Component, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { SlotsNode } from '../tree-view/slots-node';
import { LogService } from '../shared/services/log.service';
import { ArmObj, ArmArrayResult } from '../shared/models/arm/arm-obj';
import { Site } from '../shared/models/arm/site';
import { PortalService } from '../shared/services/portal.service';
import { RequiredValidator } from '../shared/validators/requiredValidator';
import { PortalResources } from '../shared/models/portal-resources';
import { SlotNameValidator } from '../shared/validators/slotNameValidator';
import { errorIds } from '../shared/models/error-ids';
import { AuthzService } from '../shared/services/authz.service';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { Constants, ScenarioIds, LogCategories } from 'app/shared/models/constants';
import { NavigableComponent, ExtendedTreeViewInfo } from '../shared/components/navigable-component';
import { FunctionAppContext } from 'app/shared/function-app-context';
import { CacheService } from '../shared/services/cache.service';
import { ScenarioService } from '../shared/services/scenario/scenario.service';
import { Tier } from 'app/shared/models/serverFarmSku';
import { HttpResult } from 'app/shared/models/http-result';
import { ApplicationSettings } from 'app/shared/models/arm/application-settings';
import { ConfigService } from 'app/shared/services/config.service';

@Component({
  selector: 'slot-new',
  templateUrl: './slot-new.component.html',
  styleUrls: ['./slot-new.component.scss'],
})
export class SlotNewComponent extends NavigableComponent {
  public Resources = PortalResources;
  public isLoading = true;
  public loadingFailureMessage = '';
  public featureSupported: boolean;
  public featureNotSupportedMessage: '';
  public canScaleUp: boolean;
  public hasCreatePermissions: boolean;
  public slotsQuotaMessage: string;
  public slotOptInEnabled: boolean;
  public newSlotForm: FormGroup;
  public slotNamePlaceholder: string;

  private _context: FunctionAppContext;
  private _siteId: string;
  private _slotsList: ArmObj<Site>[];
  private _siteObj: ArmObj<Site>;
  private _forceRequest: boolean;

  constructor(
    private fb: FormBuilder,
    private _translateService: TranslateService,
    private _portalService: PortalService,
    private _logService: LogService,
    private _siteService: SiteService,
    private _cacheService: CacheService,
    private _functionAppService: FunctionAppService,
    private _scenarioService: ScenarioService,
    private _configService: ConfigService,
    private authZService: AuthzService,
    private injector: Injector
  ) {
    super('slot-new', injector, DashboardType.CreateSlotDashboard);
  }

  setup(navigationEvents: Observable<ExtendedTreeViewInfo>): Observable<any> {
    return super
      .setup(navigationEvents)
      .switchMap(v => {
        this.isLoading = true;
        this.loadingFailureMessage = '';
        this.featureSupported = false;
        this.featureNotSupportedMessage = '';
        this.canScaleUp = false;
        this.hasCreatePermissions = false;
        this.slotsQuotaMessage = '';
        this.slotOptInEnabled = false;
        return this._functionAppService
          .getAppContext(v.siteDescriptor.getTrimmedResourceId(), this._forceRequest)
          .map(r => Object.assign(v, { context: r }));
      })
      .switchMap(viewInfo => {
        this._context = viewInfo.context;
        const validator = new RequiredValidator(this._translateService);

        // parse the site resourceId from slot's
        this._siteId = viewInfo.context.site.id;
        const slotNameValidator = new SlotNameValidator(this.injector, this._siteId);

        this.newSlotForm = this.fb.group({
          optIn: [false],
          name: [null, validator.validate.bind(validator), slotNameValidator.validate.bind(slotNameValidator)],
        });

        return Observable.zip(
          this.authZService.hasPermission(this._siteId, [AuthzService.writeScope]),
          this.authZService.hasReadOnlyLock(this._siteId),
          this._siteService.getSite(this._siteId, this._forceRequest),
          this._siteService.getSlots(this._siteId, this._forceRequest),
          this._siteService.getAppSettings(this._siteId, this._forceRequest),
          this._scenarioService.checkScenarioAsync(ScenarioIds.getSiteSlotLimits, { site: viewInfo.context.site })
        );
      })
      .do(r => {
        const [writePermission, readOnlyLock, siteObjResult, slotsListResult, appSettingsResult, slotsQuotaCheck] = r;

        this.loadingFailureMessage = this._checkForLoadingFailure(siteObjResult, slotsListResult, appSettingsResult);

        if (!this.loadingFailureMessage) {
          const slotsQuota = !!slotsQuotaCheck ? slotsQuotaCheck.data : 0;
          this._siteObj = siteObjResult.result;
          this._slotsList = slotsListResult.result && slotsListResult.result.value;

          this.featureSupported = slotsQuota === -1 || slotsQuota >= 1;

          if (!this.featureSupported) {
            if (this._configService.isOnPrem()) {
              this.featureNotSupportedMessage = this._translateService.instant(PortalResources.upgradeUpsell);
              this.canScaleUp = false;
            } else {
              this.featureNotSupportedMessage = this._translateService.instant(PortalResources.slots_upgrade);
              this.canScaleUp = true;
            }
          } else if (this._slotsList && this._slotsList.length + 1 >= slotsQuota) {
            this.canScaleUp =
              this._siteObj &&
              this._scenarioService.checkScenario(ScenarioIds.canScaleForSlots, { site: this._siteObj }).status !== 'disabled';

            let quotaMessage = '';
            const sku = this._siteObj.properties && this._siteObj.properties.sku;
            if (!!sku && sku.toLowerCase() === Tier.dynamic.toLowerCase()) {
              quotaMessage = this._translateService.instant(PortalResources.slotNew_dynamicQuotaReached);
            } else {
              quotaMessage = this._translateService.instant(PortalResources.slotNew_quotaReached, { quota: slotsQuota });
              if (this.canScaleUp) {
                quotaMessage = quotaMessage + ' ' + this._translateService.instant(PortalResources.slotNew_quotaUpgrade);
              }
            }
            this.slotsQuotaMessage = quotaMessage;
          }

          this.hasCreatePermissions = writePermission && !readOnlyLock;

          this.slotOptInEnabled = this._functionAppService.isSlotsSupported(appSettingsResult.result);
        }

        this.isLoading = false;

        this._forceRequest = false;
      });
  }

  private _checkForLoadingFailure(
    siteObjResult: HttpResult<ArmObj<Site>>,
    slotsListResult: HttpResult<ArmArrayResult<Site>>,
    appSettingsResult: HttpResult<ArmObj<ApplicationSettings>>
  ): string {
    let success = true;
    let loadingFailureMessage = this._translateService.instant(PortalResources.configLoadFailure);
    if (!siteObjResult.isSuccessful) {
      success = false;
      if (siteObjResult.error && siteObjResult.error.message) {
        loadingFailureMessage = loadingFailureMessage + '\r\n' + siteObjResult.error.message;
      }
      this._logService.error(LogCategories.newSlot, 'fetch-site', siteObjResult.error.result);
    }

    if (!slotsListResult.isSuccessful) {
      success = false;
      if (slotsListResult.error && slotsListResult.error.message) {
        loadingFailureMessage = loadingFailureMessage + '\r\n' + slotsListResult.error.message;
      }
      this._logService.error(LogCategories.newSlot, 'fetch-slots-list', slotsListResult.error.result);
    }

    if (!appSettingsResult.isSuccessful) {
      success = false;
      if (appSettingsResult.error && appSettingsResult.error.message) {
        loadingFailureMessage = loadingFailureMessage + '\r\n' + appSettingsResult.error.message;
      }
      this._logService.error(LogCategories.newSlot, 'fetch-app-settings', appSettingsResult.error.result);
    }

    return success ? '' : loadingFailureMessage;
  }

  scaleUp() {
    this.setBusy();

    this._portalService
      .openFrameBlade(
        {
          detailBlade: 'SpecPickerFrameBlade',
          detailBladeInputs: {
            id: this._siteObj.properties.serverFarmId,
            feature: 'scaleup',
            data: null,
          },
        },
        this.componentName
      )
      .subscribe(r => {
        this._refresh();
      });
  }

  private _refresh() {
    this._forceRequest = true;
    const viewInfo: ExtendedTreeViewInfo = { ...this.viewInfo };
    this.setInput(viewInfo);
  }

  createSlot() {
    const newSlotName = this.newSlotForm.controls['name'].value;
    let notificationId = null;
    this.setBusy();
    // show create slot start notification
    this._portalService
      .startNotification(
        this._translateService.instant(PortalResources.slotNew_startCreateNotifyTitle).format(newSlotName),
        this._translateService.instant(PortalResources.slotNew_startCreateNotifyTitle).format(newSlotName)
      )
      .first()
      .switchMap(n => {
        notificationId = n.id;
        return this._enableSlotOptIn();
      })
      .switchMap(s => {
        if (s.isSuccessful) {
          return this._siteService.createSlot(this._siteObj.id, newSlotName, this._siteObj.location, this._siteObj.properties.serverFarmId);
        } else {
          return Observable.of(s);
        }
      })
      .subscribe(r => {
        this.clearBusy();

        // update notification
        const notifyTitle = r.isSuccessful
          ? PortalResources.slotNew_startCreateSuccessNotifyTitle
          : PortalResources.slotNew_startCreateFailureNotifyTitle;
        this._portalService.stopNotification(
          notificationId,
          r.isSuccessful,
          this._translateService.instant(notifyTitle).format(newSlotName)
        );

        if (r.isSuccessful) {
          let slotsNode = <SlotsNode>this.viewInfo.node;
          // If someone refreshed the app, it would created a new set of child nodes under the app node.
          slotsNode = <SlotsNode>this.viewInfo.node.parent.children.find(node => node.title === slotsNode.title);
          slotsNode.addChild(r.result);
          slotsNode.isExpanded = true;
        } else {
          this.showComponentError({
            message: this._translateService.instant(PortalResources.slotNew_startCreateFailureNotifyTitle).format(newSlotName),
            details: this._translateService.instant(PortalResources.slotNew_startCreateFailureNotifyTitle).format(newSlotName),
            errorId: errorIds.failedToCreateSlot,
            resourceId: this._siteObj.id,
          });
          this._logService.error(LogCategories.newSlot, 'create-slot', { error: r.error.result, id: this._siteObj.id });
        }
      });
  }

  private _enableSlotOptIn() {
    if (this.slotOptInEnabled) {
      return Observable.of({
        isSuccessful: true,
        error: null,
        result: null,
      });
    } else {
      const newOrUpdatedSettings = {};
      newOrUpdatedSettings[Constants.secretStorageSettingsName] = Constants.secretStorageSettingsValueBlob;
      return this._siteService.addOrUpdateAppSettings(this._context.site.id, newOrUpdatedSettings).do(r => {
        if (r.isSuccessful) {
          this._functionAppService.fireSyncTrigger(this._context);
          this._cacheService.clearArmIdCachePrefix(this._context.site.id);
        }
      });
    }
  }
}
