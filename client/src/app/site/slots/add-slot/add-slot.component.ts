import { Component, Injector, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { InfoBoxType } from './../../../controls/info-box/info-box.component';
import { ArmSiteDescriptor } from './../../../shared/resourceDescriptors';
import { FeatureComponent } from './../../../shared/components/feature-component';
import { LogCategories, ScenarioIds, SiteTabIds, SlotOperationState } from './../../../shared/models/constants';
import { DropDownElement } from './../../../shared/models/drop-down-element';
import { errorIds } from './../../../shared/models/error-ids';
import { BroadcastMessageId } from './../../../shared/models/portal';
import { PortalResources } from './../../../shared/models/portal-resources';
import { SlotNewInfo } from './../../../shared/models/slot-events';
import { ArmObj, ResourceId } from './../../../shared/models/arm/arm-obj';
import { Site } from './../../../shared/models/arm/site';
import { AiService } from '../../../shared/services/ai.service';
import { AuthzService } from './../../../shared/services/authz.service';
import { LogService } from './../../../shared/services/log.service';
import { PortalService } from '../../../shared/services/portal.service';
import { SiteService } from './../../../shared/services/site.service';
import { ScenarioService } from './../../../shared/services/scenario/scenario.service';
import { RequiredValidator } from './../../../shared/validators/requiredValidator';
import { SlotNameValidator } from './../../../shared/validators/slotNameValidator';
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
  public cloneSrcIdDropDownOptions: DropDownElement<string>[];
  public isCreating = false;
  public executeButtonDisabled = false;

  public progressMessage: string;
  public progressMessageClass: InfoBoxType = 'info';

  private _siteId: string;
  private _slotsArm: ArmObj<Site>[];

  constructor(
    private _fb: FormBuilder,
    private _siteService: SiteService,
    private _translateService: TranslateService,
    private _aiService: AiService,
    private _logService: LogService,
    private _portalService: PortalService,
    private _authZService: AuthzService,
    private _scenarioService: ScenarioService,
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

        this.cloneSrcIdDropDownOptions = null;

        this.isCreating = false;
        this.executeButtonDisabled = false;

        this.progressMessage = null;
        this.progressMessageClass = 'info';

        this._slotsArm = null;

        const siteDescriptor = new ArmSiteDescriptor(resourceId);
        this._siteId = siteDescriptor.getSiteOnlyResourceId();

        return Observable.zip(
          this._siteService.getSite(this._siteId),
          this._siteService.getSlots(this._siteId),
          this._authZService.hasPermission(this._siteId, [AuthzService.writeScope]),
          this._authZService.hasReadOnlyLock(this._siteId)
        );
      })
      .mergeMap(r => {
        const [siteResult, slotsResult, hasWritePermission, hasReadOnlyLock] = r;

        this.hasCreateAcess = hasWritePermission && !hasReadOnlyLock;

        if (!siteResult.isSuccessful) {
          this._logService.error(LogCategories.addSlot, '/add-slot', siteResult.error.result);
          this.loadingFailed = true;
        }
        if (!slotsResult.isSuccessful) {
          this._logService.error(LogCategories.addSlot, '/add-slot', slotsResult.error.result);
          this.loadingFailed = true;
        }

        if (!this.loadingFailed) {
          this._slotsArm = slotsResult.result.value;
          this._slotsArm.unshift(siteResult.result);
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

  private _setupForm() {
    const nameCtrl = this.addForm.get('name');
    const cloneSrcIdCtrl = this.addForm.get('cloneSrcId');
    const cloneSrcConfigCtrl = this.addForm.get('cloneSrcConfig');

    if (!this.hasCreateAcess || !!this.slotsQuotaMessage || this.loadingFailed) {
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
    const siteId = this._slotsArm[0].id;

    const slotNewInfo: SlotNewInfo = {
      resourceId: `${siteId}/slots/${newSlotName}`,
      state: SlotOperationState.started,
    };

    const location = this._slotsArm[0].location;
    const serverFarmId = this._slotsArm[0].properties.serverFarmId;

    const cloneSrcId = this.addForm.controls['cloneSrcId'].value;
    const cloneSrcIndex = this._slotsArm.findIndex(slot => slot.id.toLowerCase() === cloneSrcId.toLowerCase());
    const cloneSite = cloneSrcIndex === -1 ? null : this._slotsArm[cloneSrcIndex].properties;

    const newSlotConfig = this.addForm.controls['cloneSrcConfig'].value;
    const cloneConfig = newSlotConfig || {};

    this.addForm.controls['name'].disable();
    this.addForm.controls['cloneSrcId'].disable();
    this.addForm.controls['cloneSrcConfig'].disable();

    this._portalService.broadcastMessage(BroadcastMessageId.slotNew, siteId, slotNewInfo);

    this.setBusy();
    this.progressMessage = this._translateService.instant(PortalResources.slotNew_startCreateNotifyTitle).format(newSlotName);
    this.progressMessageClass = 'spinner';
    this.isCreating = true;
    this.executeButtonDisabled = true;
    this._siteService.createSlot(siteId, newSlotName, location, serverFarmId, cloneSite, cloneConfig).subscribe(r => {
      if (r.isSuccessful) {
        this.progressMessage = this._translateService.instant(PortalResources.slotNew_startCreateSuccessNotifyTitle).format(newSlotName);
        this.progressMessageClass = 'success';
      } else {
        this.progressMessage = this._translateService.instant(PortalResources.slotNew_startCreateFailureNotifyTitle).format(newSlotName);
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

  closePanel() {
    this._portalService.closeSelf();
  }
}
