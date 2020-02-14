import { Component, Injector, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Response } from '@angular/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { InfoBoxType } from './../../../controls/info-box/info-box.component';
import { ProgressBarStep, ProgressBarStepStatus } from './../../../controls/form-wizard/components/progress-bar.component';
import { ArmSiteDescriptor } from './../../../shared/resourceDescriptors';
import { FeatureComponent } from './../../../shared/components/feature-component';
import { LogCategories, SiteTabIds, SlotOperationState, SwapOperationType } from './../../../shared/models/constants';
import { DropDownElement } from './../../../shared/models/drop-down-element';
import { HttpResult } from './../../../shared/models/http-result';
import { errorIds } from './../../../shared/models/error-ids';
import { BroadcastMessageId } from '../../../shared/models/portal';
import { PortalResources } from './../../../shared/models/portal-resources';
import { SlotSwapInfo } from '../../../shared/models/slot-events';
import { ArmObj, ResourceId, ArmArrayResult } from './../../../shared/models/arm/arm-obj';
import { ConnectionString } from '../../../shared/models/arm/connection-strings';
import { Site } from './../../../shared/models/arm/site';
import { SlotConfigNames } from './../../../shared/models/arm/slot-config-names';
import { SlotsDiff, SimpleSlotsDiff } from './../../../shared/models/arm/slots-diff';
import { AuthzService } from './../../../shared/services/authz.service';
import { CacheService } from './../../../shared/services/cache.service';
import { LogService } from './../../../shared/services/log.service';
import { PortalService } from '../../../shared/services/portal.service';
import { SiteService } from './../../../shared/services/site.service';
import { SlotSwapGroupValidator } from './slotSwapGroupValidator';
import { SlotSwapSlotIdValidator } from './slotSwapSlotIdValidator';

export type SwapStep =
  | 'loading'
  | 'phase1'
  | 'phase1-executing'
  | 'phase2-loading'
  | 'phase2'
  | 'phase2-executing'
  | 'phase2-complete'
  | 'complete';

export interface SwapSlotParameters extends SlotSwapInfo {
  uri: string;
  content?: any;
  swapType: string;
}

export type StickySettingValue = null | string | ConnectionString;

@Component({
  selector: 'swap-slots',
  templateUrl: './swap-slots.component.html',
  styleUrls: ['./../common.scss', './swap-slots.component.scss'],
})
export class SwapSlotsComponent extends FeatureComponent<ResourceId> implements OnDestroy {
  @Input()
  set resourceIdInput(resourceId: ResourceId) {
    this._resourceId = resourceId;
    this.setInput(resourceId);
  }

  @Input()
  showHeader = true;

  public unsavedChangesWarning: string;
  public operationInProgressWarning: string;

  public siteResourceId: ResourceId;
  public siteName: string;

  public swapForm: FormGroup;

  public phases: ProgressBarStep[];
  public currentStep: SwapStep;
  public swapping = false;
  public loadingFailure: string;
  public swapPermissionsMessage: string;
  public readOnlyLockMessage: string;

  public srcDropDownOptions: DropDownElement<string>[];
  public destDropDownOptions: DropDownElement<string>[];
  public noStickySettings = false;

  public loadingDiffs = false;
  public slotsDiffs: SlotsDiff[];
  public stickySettingDiffs: SimpleSlotsDiff[];
  public showPreviewChanges = true;

  public showPhase2Controls = false;
  public phase2DropDownOptions: DropDownElement<boolean>[];
  public previewLink: string;
  public showPreviewLink = false;

  public executeButtonDisabled = true;

  public progressMessage: string;
  public progressMessageClass: InfoBoxType = 'info';

  private _slotConfigNames: SlotConfigNames = null;

  private _slotsList: ArmObj<Site>[];

  private _diffSubject$: Subject<string>;

  private _resourceId: ResourceId;

  constructor(
    private _authZService: AuthzService,
    private _cacheService: CacheService,
    private _fb: FormBuilder,
    private _logService: LogService,
    private _portalService: PortalService,
    private _siteService: SiteService,
    private _translateService: TranslateService,
    injector: Injector
  ) {
    super('SwapSlotsComponent', injector, SiteTabIds.deploymentSlotsSwap);

    this.featureName = 'swapslots';
    this.isParentComponent = true;

    this.unsavedChangesWarning = this._translateService.instant(PortalResources.unsavedChangesWarning);
    this.operationInProgressWarning = this._translateService.instant(PortalResources.swapOperationInProgressWarning);

    this._diffSubject$ = new Subject<string>();
    this._diffSubject$
      .takeUntil(this.ngUnsubscribe)
      .distinctUntilChanged()
      .switchMap(slotsString => {
        if (slotsString) {
          const slots = slotsString.split(',');
          if (slots.length === 2 && slots[0] && slots[1]) {
            this.loadingDiffs = true;
            return this._getSlotsDiffs(slots[0], slots[1]);
          }
        }
        this.slotsDiffs = [];
        this.stickySettingDiffs = [];
        return Observable.of(null);
      })
      .subscribe(_ => {
        this.loadingDiffs = false;
      });

    this._resetSwapForm();

    this.phase2DropDownOptions = [
      {
        displayLabel: this._translateService.instant(PortalResources.completeSwap),
        value: false,
        default: true,
      },
      {
        displayLabel: this._translateService.instant(PortalResources.cancelSwap),
        value: true,
        default: false,
      },
    ];

    this.phases = [
      { status: 'default', symbol: '1', title: this._translateService.instant(PortalResources.swapPhaseOneLabel) },
      { status: 'default', symbol: '2', title: this._translateService.instant(PortalResources.swapPhaseTwoLabel) },
    ];
  }

  protected setup(inputEvents: Observable<ResourceId>) {
    return inputEvents
      .distinctUntilChanged()
      .switchMap(resourceId => {
        const siteDescriptor = new ArmSiteDescriptor(resourceId);

        this._resourceId = resourceId;
        this._slotConfigNames = null;
        this._slotsList = null;
        this.siteResourceId = siteDescriptor.getSiteOnlyResourceId();
        this.siteName = siteDescriptor.site;

        this._setupLoading();

        return Observable.zip(
          this._siteService.getSite(this.siteResourceId),
          this._siteService.getSlots(this.siteResourceId),
          this._siteService.getSlotConfigNames(this.siteResourceId)
        );
      })
      .switchMap(r => {
        const [siteResult, slotsResult, slotConfigNamesResult] = r;

        this._checkLoadingFailures(siteResult, slotsResult, slotConfigNamesResult);

        if (!this.loadingFailure) {
          this._processLoadingResults(siteResult, slotsResult);

          const currSlot = this._getSlot(slot => slot.id.toLowerCase() === this._resourceId.toLowerCase());
          const currTargetName = currSlot ? currSlot.properties.targetSwapSlot : null;

          if (!!currTargetName) {
            // We're already in Phase2
            return this._loadPhase2(currTargetName);
          } else {
            // We're in Phase1
            this._setupPhase1();
          }
        }

        return Observable.of(null);
      });
  }

  private _checkLoadingFailures(
    siteResult: HttpResult<ArmObj<Site>>,
    slotsResult: HttpResult<ArmArrayResult<Site>>,
    slotConfigNamesResult: HttpResult<ArmObj<SlotConfigNames>>
  ) {
    let loadingFailed = false;
    if (!siteResult.isSuccessful) {
      this._logService.error(LogCategories.swapSlots, '/swap-slots', siteResult.error.result);
    }
    if (!slotsResult.isSuccessful) {
      this._logService.error(LogCategories.swapSlots, '/swap-slots', slotsResult.error.result);
      loadingFailed = true;
    }
    if (!slotConfigNamesResult.isSuccessful) {
      this._logService.error(LogCategories.swapSlots, '/swap-slots', slotConfigNamesResult.error.result);
    } else {
      this._slotConfigNames = slotConfigNamesResult.result.properties;
      const appSettingNames = this._slotConfigNames.appSettingNames || [];
      const connectionStringNames = this._slotConfigNames.connectionStringNames || [];
      this.noStickySettings = appSettingNames.length === 0 && connectionStringNames.length === 0;
    }

    if (loadingFailed) {
      this.loadingFailure = this._translateService.instant(PortalResources.swapLoadingFailed);
    } else if (!slotsResult.result.value || slotsResult.result.value.length === 0) {
      this.loadingFailure = this._translateService.instant(PortalResources.swapRequresMultipleSlots);
    }
  }

  private _processLoadingResults(siteResult: HttpResult<ArmObj<Site>>, slotsResult: HttpResult<ArmArrayResult<Site>>) {
    this._slotsList = [...slotsResult.result.value];
    if (siteResult.isSuccessful) {
      this._slotsList.unshift(siteResult.result);
    }
    const options: DropDownElement<string>[] = this._slotsList.map(slot => {
      return {
        displayLabel: slot.name ? slot.name.replace('/', '-') : '-',
        value: slot.id,
      };
    });
    this.destDropDownOptions = JSON.parse(JSON.stringify(options));
    if (siteResult.isSuccessful) {
      options.shift();
    }
    this.srcDropDownOptions = JSON.parse(JSON.stringify(options));
  }

  private _loadPhase2(currTargetName: string): Observable<void> {
    // TODO (andimarc): Make sure dest slot has targetSwapSlot set and that this value matches src slot(?)
    const currTargetId =
      currTargetName.toLowerCase() === 'production' ? this.siteResourceId : this.siteResourceId + '/slots/' + currTargetName.toLowerCase();
    const currSlotDescriptor = new ArmSiteDescriptor(this._resourceId);
    const currSlotName = currSlotDescriptor.slot || 'production';

    const [srcId, srcName, destId, destName] =
      currSlotName === 'production'
        ? [currTargetId, currTargetName, this._resourceId, currSlotName]
        : [this._resourceId, currSlotName, currTargetId, currTargetName];

    this._diffSubject$.next(`${srcId},${destId}`);

    this._setupPhase2Loading(srcId, destId);

    return Observable.zip(
      this._authZService.hasPermission(srcId, [
        AuthzService.slotswapScope,
        AuthzService.applySlotConfigScope,
        AuthzService.resetSlotConfigScope,
      ]),
      this._authZService.hasPermission(destId, [
        AuthzService.slotswapScope,
        AuthzService.applySlotConfigScope,
        AuthzService.resetSlotConfigScope,
      ]),
      this._authZService.hasReadOnlyLock(srcId),
      this._authZService.hasReadOnlyLock(destId)
    ).mergeMap(result => {
      const srcSwapPermission = result[0];
      const destSwapPermission = result[1];
      const srcReadOnlyLock = result[2];
      const destReadOnlyLock = result[3];

      if (!srcSwapPermission || !destSwapPermission) {
        const slotNames = this._buildSlotNamesString(srcName, !srcSwapPermission, destName, !destSwapPermission);
        this.swapPermissionsMessage = this._translateService.instant(PortalResources.noSwapPermissionOnSlots, { slotNames: slotNames });
      }

      if (srcReadOnlyLock || destReadOnlyLock) {
        const slotNames = this._buildSlotNamesString(srcName, srcReadOnlyLock, destName, destReadOnlyLock);
        this.readOnlyLockMessage = this._translateService.instant(PortalResources.readOnlyLockOnSlots, { slotNames: slotNames });
      }

      if (!this.swapPermissionsMessage) {
        this._setupPhase2();
      }

      return Observable.of(null);
    });
  }

  private _buildSlotNamesString(srcSlotName: string, srcCondition: boolean, destSlotName: string, destCondition: boolean): string {
    let result: string = null;
    if (srcCondition && destCondition) {
      result = `${srcSlotName},${destSlotName}`;
    } else if (srcCondition) {
      result = srcSlotName;
    } else if (destCondition) {
      result = destSlotName;
    }
    return result;
  }

  private _resetSwapForm() {
    const srcIdCtrl = this._fb.control({ value: null, disabled: true });
    const srcAuthCtrl = this._fb.control({ value: null, disabled: true });
    const srcMultiPhaseCtrl = this._fb.control({ value: null, disabled: true });

    const destIdCtrl = this._fb.control({ value: null, disabled: true });
    const destAuthCtrl = this._fb.control({ value: null, disabled: true });
    const destMultiPhaseCtrl = this._fb.control({ value: null, disabled: true });

    const multiPhaseCtrl = this._fb.control({ value: false, disabled: true });

    const revertSwapCtrl = this._fb.control({ value: false, disabled: true });

    this.swapForm = this._fb.group({
      srcId: srcIdCtrl,
      srcAuth: srcAuthCtrl,
      srcMultiPhase: srcMultiPhaseCtrl,
      destId: destIdCtrl,
      destAuth: destAuthCtrl,
      destMultiPhase: destMultiPhaseCtrl,
      multiPhase: multiPhaseCtrl,
      revertSwap: revertSwapCtrl,
    });
  }

  private _getSlot(predicate: (slot: ArmObj<Site>) => boolean): ArmObj<Site> {
    let slot: ArmObj<Site> = null;
    if (this._slotsList && !!predicate) {
      const index = this._slotsList.findIndex(s => predicate(s));
      if (index !== -1) {
        slot = this._slotsList[index];
      }
    }
    return slot;
  }

  private _getPreviewLink(slotId: ResourceId): string {
    const slot = this._getSlot(s => s.id.toLowerCase() === slotId.toLowerCase());
    return slot ? `https://${slot.properties.defaultHostName}` : null;
  }

  private _updatePhaseTracker(phaseOneStatus: ProgressBarStepStatus, phaseTwoStatus: ProgressBarStepStatus) {
    this.phases[0].status = phaseOneStatus;
    this.phases[1].status = phaseTwoStatus;
  }

  private _setupLoading() {
    this._resetSwapForm();

    this.currentStep = 'loading';
    this._updatePhaseTracker('default', 'default');
    this.swapping = false;
    this.loadingFailure = null;
    this.swapPermissionsMessage = null;
    this.readOnlyLockMessage = null;
    this.srcDropDownOptions = [];
    this.destDropDownOptions = [];
    this.noStickySettings = false;

    this.loadingDiffs = false;
    this.slotsDiffs = null;
    this.stickySettingDiffs = null;
    this.showPreviewChanges = true;

    this.showPhase2Controls = false;
    this.previewLink = null;
    this.showPreviewLink = false;

    this.executeButtonDisabled = true;

    this.progressMessage = null;
    this.progressMessageClass = 'info';
  }

  private _setupPhase1() {
    this.swapForm.controls['srcId'].enable();
    this.swapForm.controls['srcAuth'].enable();
    this.swapForm.controls['srcMultiPhase'].enable();
    this.swapForm.controls['destId'].enable();
    this.swapForm.controls['destAuth'].enable();
    this.swapForm.controls['destMultiPhase'].enable();
    if (!this.noStickySettings) {
      this.swapForm.controls['multiPhase'].enable();
    }

    const slotSwapGroupValidator = new SlotSwapGroupValidator(this._translateService);
    this.swapForm.setValidators(slotSwapGroupValidator.validate.bind(slotSwapGroupValidator));

    const slotSwapSlotIdValidator = new SlotSwapSlotIdValidator(
      this.swapForm,
      this._authZService,
      this._translateService,
      this._siteService
    );
    this.swapForm.controls['srcId'].setAsyncValidators(slotSwapSlotIdValidator.validate.bind(slotSwapSlotIdValidator));
    this.swapForm.controls['destId'].setAsyncValidators(slotSwapSlotIdValidator.validate.bind(slotSwapSlotIdValidator));

    const currSlotDescriptor = new ArmSiteDescriptor(this._resourceId);
    const currSlotName = currSlotDescriptor.slot || 'production';
    const currSlotTarget = this._getSlot(slot => slot.id.toLowerCase() !== this._resourceId.toLowerCase());

    const [srcId, destId] = currSlotName === 'production' ? [currSlotTarget.id, this._resourceId] : [this._resourceId, currSlotTarget.id];

    this.swapForm.controls['srcId'].markAsTouched();
    this.swapForm.controls['srcId'].setValue(srcId);
    this.swapForm.controls['destId'].markAsTouched();
    this.swapForm.controls['destId'].setValue(destId);

    this.currentStep = 'phase1';
    this._updatePhaseTracker('current', 'default');
    this.executeButtonDisabled = false;

    this._diffSubject$.next(`${srcId},${destId}`);
  }

  private _setupPhase1Executing() {
    this.swapForm.controls['srcId'].disable();
    this.swapForm.controls['destId'].disable();
    this.swapForm.controls['multiPhase'].disable();
    this.swapForm.markAsPristine();

    this.currentStep = 'phase1-executing';
    this._updatePhaseTracker('running', 'default');
    this.swapping = true;
    this.executeButtonDisabled = true;
  }

  private _setupPhase2Loading(srcId: ResourceId, destId: ResourceId) {
    this.swapForm.controls['srcId'].setValue(srcId);
    this.swapForm.controls['destId'].setValue(destId);
    this.swapForm.controls['multiPhase'].setValue(true);
    this.swapForm.markAsPristine();

    this.currentStep = 'phase2-loading';
    this._updatePhaseTracker('done', 'default');
    this.showPreviewChanges = false;
    this.showPhase2Controls = true;
    this.previewLink = this._getPreviewLink(srcId);
    this.showPreviewLink = true;
  }

  private _setupPhase2() {
    this.swapForm.controls['revertSwap'].enable();
    this.swapForm.markAsPristine();

    this.currentStep = 'phase2';
    this._updatePhaseTracker('done', 'current');
    this.swapping = false;
    this.showPhase2Controls = true;
    this.previewLink = this._getPreviewLink(this.swapForm.controls['srcId'].value);
    this.showPreviewLink = true;
    this.executeButtonDisabled = false;
  }

  private _setupPhase2Executing() {
    this.swapForm.controls['revertSwap'].disable();
    this.swapForm.markAsPristine();

    this.currentStep = 'phase2-executing';
    this._updatePhaseTracker('done', 'running');
    this.swapping = true;
    this.showPreviewChanges = false;
    this.showPreviewLink = false;
    this.executeButtonDisabled = true;
  }

  private _setupCompletedPhase(multiPhase: boolean, success: boolean) {
    this.currentStep = multiPhase ? 'phase2-complete' : 'complete';
    this._updatePhaseTracker('done', success ? 'done' : 'failed');
    this.swapping = false;
  }

  onSlotIdChange() {
    const srcId = this.swapForm.controls['srcId'].value;
    const destId = this.swapForm.controls['destId'].value;
    const slots = `${srcId || ''},${destId || ''}`;
    this._diffSubject$.next(slots);
  }

  closePanel() {
    this._portalService.closeSelf();
  }

  executePhase1() {
    this._setupPhase1Executing();
    if (this.swapForm.controls['multiPhase'].value) {
      this._applySlotConfig();
    } else {
      this._slotsSwap();
    }
  }

  executePhase2() {
    this._setupPhase2Executing();

    if (this.swapForm.controls['revertSwap'].value) {
      this._resetSlotConfig();
    } else {
      this._slotsSwap(true);
    }
  }

  private _applySlotConfig() {
    const params = this._getOperationInputs(SwapOperationType.applySlotConfig);
    const operation = this._translateService.instant(PortalResources.swapOperation, {
      swapType: params.swapType,
      srcSlot: params.srcName,
      destSlot: params.destName,
    });
    this.progressMessage = this._translateService.instant(PortalResources.swapStarted, { operation: operation });
    this.progressMessageClass = 'spinner';

    params.state = SlotOperationState.started;
    this._portalService.broadcastMessage(BroadcastMessageId.slotSwap, params.srcId, params);
    this._portalService.broadcastMessage(BroadcastMessageId.slotSwap, params.destId, params);

    this.setBusy();
    this._cacheService
      .postArm(params.uri, null, null, params.content)
      .mergeMap(r => {
        return Observable.of({ success: true, error: null });
      })
      .catch(e => {
        return Observable.of({ success: false, error: e });
      })
      .subscribe(r => {
        if (r.success) {
          // TODO (andimarc): refresh the _slotsList entries for the slot(s) involved in the swap?
          this.progressMessage = this._translateService.instant(PortalResources.swapSuccess, { operation: operation });
          this.progressMessageClass = 'success';
          this._setupPhase2();
        } else {
          this.progressMessage = this._translateService.instant(PortalResources.swapFailure, {
            operation: operation,
            error: JSON.stringify(r.error),
          });
          this.progressMessageClass = 'error';
          this._updatePhaseTracker('failed', null);
          this._logService.error(LogCategories.swapSlots, errorIds.failedToSwapSlots, { error: r.error, id: this._resourceId });
        }

        params.success = r.success;
        params.state = SlotOperationState.completed;
        this._portalService.broadcastMessage(BroadcastMessageId.slotSwap, params.srcId, params);
        this._portalService.broadcastMessage(BroadcastMessageId.slotSwap, params.destId, params);

        this.swapping = false;
        this.clearBusy();
      });
  }

  private _resetSlotConfig() {
    const params = this._getOperationInputs(SwapOperationType.resetSlotConfig);
    const operation = this._translateService.instant(PortalResources.swapOperation, {
      swapType: params.swapType,
      srcSlot: params.srcName,
      destSlot: params.destName,
    });
    this.progressMessage = this._translateService.instant(PortalResources.swapCancelStarted, { operation: operation });
    this.progressMessageClass = 'spinner';

    params.state = SlotOperationState.started;
    this._portalService.broadcastMessage(BroadcastMessageId.slotSwap, params.srcId, params);
    this._portalService.broadcastMessage(BroadcastMessageId.slotSwap, params.destId, params);

    this.setBusy();
    this._cacheService
      .postArm(params.uri, null, null, params.content)
      .mergeMap(r => {
        return Observable.of({ success: true, error: null });
      })
      .catch(e => {
        return Observable.of({ success: false, error: e });
      })
      .subscribe(r => {
        if (r.success) {
          this.progressMessage = this._translateService.instant(PortalResources.swapCancelSuccess, { operation: operation });
          this.progressMessageClass = 'success';
        } else {
          this.progressMessage = this._translateService.instant(PortalResources.swapCancelFailure, {
            operation: operation,
            error: JSON.stringify(r.error),
          });
          this.progressMessageClass = 'error';
          this._logService.error(LogCategories.swapSlots, errorIds.failedToSwapSlots, { error: r.error, id: this._resourceId });
        }

        params.success = r.success;
        params.state = SlotOperationState.completed;
        this._portalService.broadcastMessage(BroadcastMessageId.slotSwap, params.srcId, params);
        this._portalService.broadcastMessage(BroadcastMessageId.slotSwap, params.destId, params);

        this.swapping = false;
        this.clearBusy();
        this._setupCompletedPhase(true, r.success);
      });
  }

  private _slotsSwap(multiPhase?: boolean) {
    const params = this._getOperationInputs(SwapOperationType.slotsSwap);
    const operation = this._translateService.instant(PortalResources.swapOperation, {
      swapType: params.swapType,
      srcSlot: params.srcName,
      destSlot: params.destName,
    });
    this.progressMessage = this._translateService.instant(PortalResources.swapStarted, { operation: operation });
    this.progressMessageClass = 'spinner';

    params.state = SlotOperationState.started;
    this._portalService.broadcastMessage(BroadcastMessageId.slotSwap, params.srcId, params);
    this._portalService.broadcastMessage(BroadcastMessageId.slotSwap, params.destId, params);

    this.setBusy();
    this._cacheService
      .postArm(params.uri, null, null, params.content)
      .mergeMap(swapResult => {
        const location = swapResult.headers.get('Location');
        if (!location) {
          return Observable.of({ success: false, timeout: false, error: 'no location header' });
        } else {
          const pollingInterval = 5000; // poll every 5 seconds
          const pollingTimeout = 120; // time out after 120 polling attempts (10 minutes)
          let pollingCount = 0;
          // In the 'filter' and 'map' below, we only need to handle status 200 and status 202.
          // Responses with error status codes will go directly to the 'catch'.
          return Observable.interval(pollingInterval)
            .concatMap(_ => this._cacheService.get(location, true))
            .map((pollResponse: Response) => pollResponse.status)
            .take(pollingTimeout)
            .filter((status: number) => status !== 202 || ++pollingCount === pollingTimeout)
            .map((status: number) => ({ success: status === 200, timeout: status === 202, error: null }))
            .catch(e => Observable.of({ success: false, timeout: false, error: e }))
            .take(1);
        }
      })
      .catch(e => {
        return Observable.of({ success: false, timeout: false, error: e });
      })
      .subscribe(r => {
        if (r.success) {
          this.progressMessage = this._translateService.instant(PortalResources.swapSuccess, { operation: operation });
          this.progressMessageClass = 'success';
        } else if (r.timeout) {
          this.progressMessage = this._translateService.instant(PortalResources.swapTimeout, { operation: operation });
          this.progressMessageClass = 'warning';
          this._logService.error(LogCategories.swapSlots, errorIds.timedOutPollingSwapSlots, { id: this._resourceId });
        } else {
          this.progressMessage = this._translateService.instant(PortalResources.swapFailure, {
            operation: operation,
            error: JSON.stringify(r.error),
          });
          this.progressMessageClass = 'error';
          this._logService.error(LogCategories.swapSlots, errorIds.failedToSwapSlots, { error: r.error, id: this._resourceId });
        }

        params.success = r.success;
        params.state = SlotOperationState.completed;
        this._portalService.broadcastMessage(BroadcastMessageId.slotSwap, params.srcId, params);
        this._portalService.broadcastMessage(BroadcastMessageId.slotSwap, params.destId, params);

        this.swapping = false;
        this.clearBusy();
        this._setupCompletedPhase(multiPhase, r.success);
      });
  }

  private _getOperationInputs(operationType: SwapOperationType): SwapSlotParameters {
    const multiPhase = this.swapForm.controls['multiPhase'].value;
    const srcId = this.swapForm.controls['srcId'].value;
    const destId = this.swapForm.controls['destId'].value;
    const srcDescriptor: ArmSiteDescriptor = new ArmSiteDescriptor(srcId);
    const destDescriptor: ArmSiteDescriptor = new ArmSiteDescriptor(destId);

    const srcName = srcDescriptor.slot || 'production';
    const destName = destDescriptor.slot || 'production';
    const content = operationType === 'resetSlotConfig' ? null : { targetSlot: destName };

    let swapType = this._translateService.instant(PortalResources.swapFull);
    if (operationType === 'applySlotConfig') {
      swapType = this._translateService.instant(PortalResources.swapPhaseOne);
    } else if (operationType === 'slotsswap' && multiPhase) {
      swapType = this._translateService.instant(PortalResources.swapPhaseTwo);
    }

    return {
      isMultiPhase: multiPhase,
      operationType: operationType,
      srcId: srcId,
      srcName: srcName,
      destId: destId,
      destName: destName,
      uri: srcDescriptor.getTrimmedResourceId() + '/' + operationType,
      content: content,
      swapType: swapType,
    };
  }

  private _getSlotsDiffs(src: string, dest: string): Observable<void> {
    const srcDescriptor: ArmSiteDescriptor = new ArmSiteDescriptor(src);
    const destDescriptor: ArmSiteDescriptor = new ArmSiteDescriptor(dest);

    const srcId = srcDescriptor.getTrimmedResourceId();
    const destId = destDescriptor.getTrimmedResourceId();

    return Observable.zip(
      this._siteService.getSlotDiffs(srcId, destDescriptor.slot || 'production'),
      this._siteService.getAppSettings(srcId),
      this._siteService.getAppSettings(destId),
      this._siteService.getConnectionStrings(srcId),
      this._siteService.getConnectionStrings(destId)
    ).mergeMap(r => {
      const success = r.every(res => {
        return res.isSuccessful;
      });

      if (success) {
        const slotDiffs = r[0].result.value;
        const [srcAppSettings, destAppSettings] = [r[1], r[2]].map(res => res.result.properties);
        const [srcConnStrings, destConnStrings] = [r[3], r[4]].map(res => res.result.properties);

        this.slotsDiffs = slotDiffs
          .map(d => d.properties)
          .filter(diff => {
            return (
              diff.diffRule === 'SettingsWillBeModifiedInDestination' ||
              diff.diffRule === 'SettingsWillBeAddedToDestination' ||
              diff.diffRule === 'SettingsNotInSource'
            );
          });

        if (this._slotConfigNames) {
          this.stickySettingDiffs = [];

          const notSetString = this._translateService.instant('swapDiffNotSet');

          this._appendStickySettingDiffs('AppSetting', srcAppSettings, destAppSettings, val => val || notSetString);
          this._appendStickySettingDiffs('ConnectionString', srcConnStrings, destConnStrings, val => (val && val.value) || notSetString);
        }
      } else {
        this.slotsDiffs = null;
        this.stickySettingDiffs = null;
      }

      return Observable.of(null);
    });
  }

  private _appendStickySettingDiffs<T extends StickySettingValue>(
    settingType: 'AppSetting' | 'ConnectionString',
    srcConfig: { [key: string]: T },
    destConfig: { [key: string]: T },
    mapper: (val: T) => string
  ) {
    const settingNames =
      (settingType === 'AppSetting' ? this._slotConfigNames.appSettingNames : this._slotConfigNames.connectionStringNames) || [];

    settingNames.forEach(settingName => {
      if (srcConfig[settingName] || destConfig[settingName]) {
        const [valueInCurrentSlot, valueInTargetSlot] = [mapper(srcConfig[settingName]), mapper(destConfig[settingName])];
        if (valueInCurrentSlot !== valueInTargetSlot) {
          this.stickySettingDiffs.push({ settingName, settingType, valueInCurrentSlot, valueInTargetSlot });
        }
      }
    });
  }
}
