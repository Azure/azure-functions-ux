import { Component, Injector, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { InfoBoxType } from './../../../controls/info-box/info-box.component';
import { ArmSiteDescriptor } from './../../../shared/resourceDescriptors';
import { FeatureComponent } from './../../../shared/components/feature-component';
import { FunctionAppContext } from './../../../shared/function-app-context';
import { HttpResult } from './../../../shared/models/http-result';
import {
  Constants,
  FunctionAppVersion,
  LogCategories,
  ScenarioIds,
  SiteTabIds,
  SlotOperationState,
} from './../../../shared/models/constants';
import { DropDownElement } from './../../../shared/models/drop-down-element';
import { errorIds } from './../../../shared/models/error-ids';
import { BroadcastMessageId } from './../../../shared/models/portal';
import { PortalResources } from './../../../shared/models/portal-resources';
import { SlotNewInfo } from './../../../shared/models/slot-events';
import { ArmObj, ResourceId } from './../../../shared/models/arm/arm-obj';
import { Site } from './../../../shared/models/arm/site';
import { ApplicationSettings } from './../../../shared/models/arm/application-settings';
import { AiService } from '../../../shared/services/ai.service';
import { AuthzService } from './../../../shared/services/authz.service';
import { LogService } from './../../../shared/services/log.service';
import { PortalService } from '../../../shared/services/portal.service';
import { SiteService } from './../../../shared/services/site.service';
import { FunctionAppService } from './../../../shared/services/function-app.service';
import { ScenarioService } from './../../../shared/services/scenario/scenario.service';
import { RequiredValidator } from './../../../shared/validators/requiredValidator';
import { SlotNameValidator } from './../../../shared/validators/slotNameValidator';
import { ArmUtil } from './../../../shared/Utilities/arm-utils';
import { CloneSrcValidator } from './cloneSrcValidator';

@Component({
  selector: 'add-slot',
  templateUrl: './add-slot.component.html',
  styleUrls: ['./../common.scss', './add-slot.component.scss'],
})
export class AddSlotComponent extends FeatureComponent<ResourceId> implements OnDestroy {
  @Input()
  set resourceIdInput(resourceId: ResourceId) {
    this.setInput(resourceId);
  }
  @Input()
  showHeader = false;

  public unsavedChangesWarning: string;
  public operationInProgressWarning: string;

  public addForm: FormGroup;
  public hasCreateAcess = false;
  public slotsQuotaMessage: string;
  public isLoading = true;
  public loadingFailed = false;
  public loadingSiteFailureMessage = '';
  public loadingSlotsFailureMessage = '';
  public loadingAppSettingsFailureMessage = '';
  public cloneSrcIdDropDownOptions: DropDownElement<string>[];
  public isCreating = false;
  public executeButtonDisabled = false;
  public slotOptInNeeded = false;
  public slotOptInEnabled = false;
  public isFunctionApp = false;

  public progressMessage: string;
  public progressMessageClass: InfoBoxType = 'info';

  private _siteId: string;
  private _slotsArm: ArmObj<Site>[];
  private _functionAppContext: FunctionAppContext;

  constructor(
    private _fb: FormBuilder,
    private _siteService: SiteService,
    private _translateService: TranslateService,
    private _aiService: AiService,
    private _logService: LogService,
    private _portalService: PortalService,
    private _authZService: AuthzService,
    private _scenarioService: ScenarioService,
    private _functionAppService: FunctionAppService,
    private _injector: Injector
  ) {
    super('AddSlotComponent', _injector, SiteTabIds.deploymentSlotsCreate);

    this.featureName = 'addslot';
    this.isParentComponent = true;

    this.unsavedChangesWarning = this._translateService.instant(PortalResources.unsavedChangesWarning);
    this.operationInProgressWarning = this._translateService.instant(PortalResources.slotCreateOperationInProgressWarning);

    const nameCtrl = this._fb.control({ value: null, disabled: true });
    const cloneSrcIdCtrl = this._fb.control({ value: null, disabled: true });
    const cloneSrcConfigCtrl = this._fb.control({ value: null, disabled: true });

    this.addForm = this._fb.group({
      name: nameCtrl,
      cloneSrcId: cloneSrcIdCtrl,
      cloneSrcConfig: cloneSrcConfigCtrl,
    });
  }

  protected setup(inputEvents: Observable<ResourceId>) {
    return inputEvents
      .distinctUntilChanged()
      .switchMap(resourceId => {
        this.hasCreateAcess = false;
        this.slotsQuotaMessage = null;
        this.isLoading = true;
        this.loadingFailed = false;
        this.loadingSiteFailureMessage = '';
        this.loadingSlotsFailureMessage = '';
        this.loadingAppSettingsFailureMessage = '';

        this.cloneSrcIdDropDownOptions = null;

        this.isCreating = false;
        this.executeButtonDisabled = false;

        this.slotOptInNeeded = false;
        this.slotOptInEnabled = false;
        this.isFunctionApp = false;

        this.progressMessage = null;
        this.progressMessageClass = 'info';

        this._slotsArm = null;

        const siteDescriptor = new ArmSiteDescriptor(resourceId);
        this._siteId = siteDescriptor.getSiteOnlyResourceId();
        this._functionAppContext = null;

        return Observable.zip(
          this._siteService.getSite(this._siteId),
          this._siteService.getSlots(this._siteId),
          this._siteService.getAppSettings(this._siteId),
          this._authZService.hasPermission(this._siteId, [AuthzService.writeScope]),
          this._authZService.hasReadOnlyLock(this._siteId)
        );
      })
      .mergeMap(r => {
        const [siteResult, slotsResult, appSettingsResult, hasWritePermission, hasReadOnlyLock] = r;

        this.hasCreateAcess = hasWritePermission && !hasReadOnlyLock;

        if (!siteResult.isSuccessful) {
          this._logService.error(LogCategories.addSlot, '/add-slot', siteResult.error.result);
          this.loadingFailed = true;
          this.loadingSiteFailureMessage = this._translateService.instant(PortalResources.error_unableToLoadSite, {
            errorMessage: (siteResult.error && siteResult.error.message) || '',
          });
        } else {
          this.isFunctionApp = ArmUtil.isFunctionApp(siteResult.result);
        }

        if (!slotsResult.isSuccessful) {
          this._logService.error(LogCategories.addSlot, '/add-slot', slotsResult.error.result);
          this.loadingFailed = true;
          this.loadingSlotsFailureMessage = this._translateService.instant(PortalResources.error_unableToLoadSlotsList, {
            errorMessage: (slotsResult.error && slotsResult.error.message) || '',
          });
        }

        if (!this.loadingFailed) {
          this._slotsArm = slotsResult.result.value;
          this._slotsArm.unshift(siteResult.result);

          if (this.isFunctionApp) {
            this._setFunctionAppContext(siteResult, appSettingsResult);

            // This is a function app, so we need to check if it needs to be opted in to using slots.
            if (this._slotsArm.length > 1) {
              // The app already has slots, so it must have already been opted in.
              this.slotOptInNeeded = false;
            } else if (appSettingsResult.isSuccessful) {
              // The app doesn't have slots, so we check the app settings to see if it already opted in.
              this.slotOptInNeeded = !this._functionAppService.isSlotsSupported(appSettingsResult.result);
            } else {
              // The app doesn't have slots, and the app settings failed to load so we can't check.
              this.slotOptInNeeded = false;
              this.loadingFailed = true;
              this.loadingAppSettingsFailureMessage = this._translateService.instant(PortalResources.error_unableToLoadConfig, {
                errorMessage: (appSettingsResult.error && appSettingsResult.error.message) || '',
              });
            }
            this.executeButtonDisabled = this.slotOptInNeeded && !this.slotOptInEnabled;
          }
        }

        if (!this.loadingFailed) {
          return this._scenarioService.checkScenarioAsync(ScenarioIds.getSiteSlotLimits, { site: siteResult.result });
        } else {
          return Observable.of(null);
        }
      })
      .do(r => {
        if (r && r.status === 'enabled') {
          const slotsQuota = r.data;

          if (this._slotsArm && this._slotsArm.length >= slotsQuota) {
            this.slotsQuotaMessage = this._translateService.instant(PortalResources.slotNew_quotaReached, { quota: slotsQuota });
          }
        }

        this._setupForm();
        this.isLoading = false;
      });
  }

  private _setFunctionAppContext(siteResult: HttpResult<ArmObj<Site>>, appSettingsResult: HttpResult<ArmObj<ApplicationSettings>>) {
    this._functionAppContext = ArmUtil.mapArmSiteToContext(siteResult.result, this._injector);
    if (appSettingsResult.isSuccessful) {
      this._functionAppContext.urlTemplates.runtimeVersion =
        appSettingsResult.result.properties[Constants.runtimeVersionAppSettingName] || FunctionAppVersion.v3;
    }
  }

  private _setupForm() {
    const nameCtrl = this.addForm.get('name');
    const cloneSrcIdCtrl = this.addForm.get('cloneSrcId');
    const cloneSrcConfigCtrl = this.addForm.get('cloneSrcConfig');

    if (!this.hasCreateAcess || !!this.slotsQuotaMessage || this.loadingFailed || (this.slotOptInNeeded && !this.slotOptInEnabled)) {
      nameCtrl.clearValidators();
      nameCtrl.clearAsyncValidators();
      nameCtrl.setValue(null);
      nameCtrl.disable();

      cloneSrcIdCtrl.clearValidators();
      cloneSrcIdCtrl.clearAsyncValidators();
      cloneSrcIdCtrl.setValue(null);
      cloneSrcIdCtrl.disable();

      cloneSrcConfigCtrl.clearValidators();
      cloneSrcConfigCtrl.clearAsyncValidators();
      cloneSrcConfigCtrl.setValue(null);
      cloneSrcConfigCtrl.disable();
    } else {
      const requiredValidator = new RequiredValidator(this._translateService);
      const slotNameValidator = new SlotNameValidator(this._injector, this._siteId);
      nameCtrl.enable();
      nameCtrl.setValue(null);
      nameCtrl.setValidators(requiredValidator.validate.bind(requiredValidator));
      nameCtrl.setAsyncValidators(slotNameValidator.validate.bind(slotNameValidator));

      const options: DropDownElement<string>[] = [
        {
          displayLabel: this._translateService.instant(PortalResources.slotNew_dontCloneConfig),
          value: '-',
        },
      ];
      this._slotsArm.forEach(s => {
        options.push({
          displayLabel: s.name ? s.name.replace('/', '-') : '-',
          value: s.id,
        });
      });
      this.cloneSrcIdDropDownOptions = options;

      const cloneSrcValidator = new CloneSrcValidator(this._siteService, this._translateService, this.addForm);
      cloneSrcIdCtrl.enable();
      cloneSrcIdCtrl.setValue('-');
      cloneSrcIdCtrl.setAsyncValidators(cloneSrcValidator.validate.bind(cloneSrcValidator));

      cloneSrcConfigCtrl.enable();
      cloneSrcConfigCtrl.setValue(null);
    }
  }

  createSlot() {
    this.addForm.markAsPristine();

    const newSlotName = this.addForm.controls['name'].value;
    const newSlotConfig = this.addForm.controls['cloneSrcConfig'].value;
    const siteId = this._slotsArm[0].id;
    const location = this._slotsArm[0].location;
    const serverFarmId = this._slotsArm[0].properties.serverFarmId;
    const cloneConfig = !this.isFunctionApp ? newSlotConfig || {} : undefined;

    const slotNewInfo: SlotNewInfo = {
      resourceId: `${siteId}/slots/${newSlotName}`,
      state: SlotOperationState.started,
    };

    this.addForm.controls['name'].disable();
    this.addForm.controls['cloneSrcId'].disable();
    this.addForm.controls['cloneSrcConfig'].disable();

    this._portalService.broadcastMessage(BroadcastMessageId.slotNew, siteId, slotNewInfo);

    this.setBusy();
    this.progressMessage = this._translateService.instant(PortalResources.slotNew_startCreateNotifyTitle).format(newSlotName);
    this.progressMessageClass = 'spinner';
    this.isCreating = true;
    this.executeButtonDisabled = true;

    this._enableSlotOptIn(siteId)
      .switchMap(s => {
        if (!s || s.isSuccessful) {
          // _enableSlotOptIn() was a no-op or completed successfully
          return this._siteService.createSlot(siteId, newSlotName, location, serverFarmId, cloneConfig);
        } else {
          // _enableSlotOptIn() failed so we pass on the failure
          return Observable.of(s);
        }
      })
      .subscribe(r => {
        if (r.isSuccessful) {
          this.progressMessage = this._translateService.instant(PortalResources.slotNew_startCreateSuccessNotifyTitle).format(newSlotName);
          this.progressMessageClass = 'success';
        } else {
          const errorMessage = r.error && r.error.message;
          this.progressMessage = errorMessage
            ? this._translateService.instant(PortalResources.slotNew_startCreateFailureNotifyTitleExt).format(newSlotName, errorMessage)
            : this._translateService.instant(PortalResources.slotNew_startCreateFailureNotifyTitle).format(newSlotName);
          this.progressMessageClass = 'error';
          this._aiService.trackEvent(errorIds.failedToCreateSlot, { error: r.error.errorId, id: siteId });
          this._logService.error(LogCategories.addSlot, '/add-slot', r.error);
        }

        slotNewInfo.success = r.isSuccessful;
        slotNewInfo.state = SlotOperationState.completed;
        this._portalService.broadcastMessage(BroadcastMessageId.slotNew, siteId, slotNewInfo);

        this.isCreating = false;
        this.clearBusy();
      });
  }

  private _enableSlotOptIn(siteId: string) {
    if (!this.isFunctionApp || !this.slotOptInNeeded) {
      return Observable.of(null);
    } else {
      const newOrUpdatedSettings = {};
      newOrUpdatedSettings[Constants.secretStorageSettingsName] = Constants.secretStorageSettingsValueBlob;
      return this._siteService.addOrUpdateAppSettings(siteId, newOrUpdatedSettings).do(r => {
        if (r.isSuccessful && this._functionAppContext) {
          this._functionAppService.fireSyncTrigger(this._functionAppContext);
        }
      });
    }
  }

  closePanel() {
    this._portalService.closeSelf();
  }

  toggleOptInState() {
    this.slotOptInEnabled = !this.slotOptInEnabled;
    this.executeButtonDisabled = this.slotOptInNeeded && !this.slotOptInEnabled;
    this._setupForm();
  }
}
