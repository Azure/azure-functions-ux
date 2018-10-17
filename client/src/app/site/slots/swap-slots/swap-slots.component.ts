import { Component, Injector, Input, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { InfoBoxType } from './../../../controls/info-box/info-box.component';
import { ProgressBarStep, ProgressBarStepStatus } from './../../../controls/form-wizard/components/progress-bar.component';
import { ArmSiteDescriptor } from './../../../shared/resourceDescriptors';
import { FeatureComponent } from './../../../shared/components/feature-component';
import { LogCategories, SiteTabIds } from './../../../shared/models/constants';
import { DropDownElement } from './../../../shared/models/drop-down-element';
import { HttpResult } from './../../../shared/models/http-result';
import { PortalResources } from './../../../shared/models/portal-resources';
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

export type SwapStep = 'loading' | 'phase1' | 'phase1-executing' | 'phase2-loading' | 'phase2';

export type OperationType = 'slotsswap' | 'applySlotConfig' | 'resetSlotConfig';

export interface SwapSlotParameters {
  operationType: OperationType;
  uri: string;
  srcName: string;
  destName: string;
  swapType: string;
  content?: any;
}

export interface SrcDestPair {
  srcSlotName: string;
  destSlotName: string;
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

  @Output('parameters')
  parameters$: Subject<SwapSlotParameters>;
  @Output('configApplied')
  configApplied$: Subject<SrcDestPair>;

  public unsavedChangesWarning: string;
  public operationInProgressWarning: string;

  public siteResourceId: ResourceId;
  public siteName: string;

  public swapForm: FormGroup;

  public phases: ProgressBarStep[];
  public currentStep: SwapStep;
  public swapping: boolean;
  public loadingFailure: string;
  public swapPermissionsMessage: string;
  public writePermissionsMessage: string;
  public readOnlyLockMessage: string;

  public srcDropDownOptions: DropDownElement<string>[];
  public destDropDownOptions: DropDownElement<string>[];
  public noStickySettings = false;

  public loadingDiffs: boolean;
  public slotsDiffs: SlotsDiff[];
  public stickySettingDiffs: SimpleSlotsDiff[];
  public showPreviewChanges: boolean;

  public showPhase2Controls: boolean;
  public phase2DropDownOptions: DropDownElement<boolean>[];
  public previewLink: string;
  public showPreviewLink: boolean;

  public executeButtonDisabed = true;

  public progressMessage: string;
  public progressMessageClass: InfoBoxType = 'info';

  private _slotConfigNames: SlotConfigNames = null;

  private _slotsList: ArmObj<Site>[];

  private _swappedOrCancelled: boolean;

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

    this.parameters$ = new Subject<SwapSlotParameters>();
    this.configApplied$ = new Subject<SrcDestPair>();

    // TODO [andimarc]
    // For ibiza scenarios, this needs to match the deep link feature name used to load this in ibiza menu
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

          const srcSlot = this._getSlot(slot => slot.id === this._resourceId);
          const targetSwapSlot = srcSlot ? srcSlot.properties.targetSwapSlot : null;

          if (!!targetSwapSlot) {
            // We're already in Phase2
            return this._loadPhase2(targetSwapSlot);
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
      loadingFailed = true;
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
    this._slotsList = [siteResult.result, ...slotsResult.result.value];
    const options: DropDownElement<string>[] = this._slotsList.map(slot => {
      return {
        displayLabel: slot.properties.name,
        value: slot.id,
      };
    });
    this.srcDropDownOptions = JSON.parse(JSON.stringify(options));
    this.destDropDownOptions = JSON.parse(JSON.stringify(options));
  }

  private _loadPhase2(targetSwapSlot: string): Observable<void> {
    const destId =
      targetSwapSlot.toLowerCase() === 'production' ? this.siteResourceId : this.siteResourceId + '/slots/' + targetSwapSlot.toLowerCase();

    // TODO andimarc: Make sure dest slot has targetSwapSlot set and that this value matches src slot(?)

    this._setupPhase2Loading(this._resourceId, destId);

    return Observable.zip(
      this._authZService.hasPermission(this._resourceId, [AuthzService.writeScope]),
      this._authZService.hasPermission(destId, [AuthzService.writeScope]),
      this._authZService.hasPermission(this._resourceId, [AuthzService.actionScope]),
      this._authZService.hasPermission(destId, [AuthzService.actionScope]),
      this._authZService.hasReadOnlyLock(this._resourceId),
      this._authZService.hasReadOnlyLock(destId)
    ).mergeMap(result => {
      const srcWritePermission = result[0];
      const destWritePermission = result[1];
      const srcSwapPermission = result[2];
      const destSwapPermission = result[3];
      const srcReadOnlyLock = result[4];
      const destReadOnlyLock = result[5];

      const srcDescriptor = new ArmSiteDescriptor(this._resourceId);
      const srcName = srcDescriptor.slot || 'production';

      if (!srcWritePermission || !destWritePermission) {
        const slotNames = this._buildSlotNamesString(srcName, !srcWritePermission, targetSwapSlot, !destWritePermission);
        this.writePermissionsMessage = this._translateService.instant(PortalResources.noWritePermissionOnSlots, { slotNames: slotNames });
      }
      if (!srcSwapPermission || !destSwapPermission) {
        const slotNames = this._buildSlotNamesString(srcName, !srcSwapPermission, targetSwapSlot, !destSwapPermission);
        this.swapPermissionsMessage = this._translateService.instant(PortalResources.noSwapPermissionOnSlots, { slotNames: slotNames });
      }
      if (srcReadOnlyLock || destReadOnlyLock) {
        const slotNames = this._buildSlotNamesString(srcName, srcReadOnlyLock, targetSwapSlot, destReadOnlyLock);
        this.readOnlyLockMessage = this._translateService.instant(PortalResources.readOnlyLockOnSlots, { slotNames: slotNames });
      }

      if (!this.writePermissionsMessage && !this.swapPermissionsMessage) {
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

    const destIdCtrl = this._fb.control({ value: null, disabled: true });
    const destAuthCtrl = this._fb.control({ value: null, disabled: true });

    const multiPhaseCtrl = this._fb.control({ value: false, disabled: true });

    const revertSwapCtrl = this._fb.control({ value: false, disabled: true });

    this.swapForm = this._fb.group({
      srcId: srcIdCtrl,
      srcAuth: srcAuthCtrl,
      destId: destIdCtrl,
      destAuth: destAuthCtrl,
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
    const slot = this._getSlot(s => s.id === slotId);
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
    this.writePermissionsMessage = null;
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

    this.executeButtonDisabed = true;

    this.progressMessage = null;
    this.progressMessageClass = 'info';

    this._swappedOrCancelled = false;
  }

  private _setupPhase1() {
    this.swapForm.controls['srcId'].enable();
    this.swapForm.controls['srcAuth'].enable();
    this.swapForm.controls['destId'].enable();
    this.swapForm.controls['destAuth'].enable();
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

    const destSlot = this._getSlot(slot => slot.id !== this._resourceId);
    this.swapForm.controls['srcId'].markAsTouched();
    this.swapForm.controls['srcId'].setValue(this._resourceId);
    this.swapForm.controls['destId'].markAsTouched();
    this.swapForm.controls['destId'].setValue(destSlot.id);

    this.currentStep = 'phase1';
    this._updatePhaseTracker('current', 'default');
    this.showPreviewChanges = true;
    this.executeButtonDisabed = false;

    this._diffSubject$.next(`${this._resourceId},${destSlot.id}`);
  }

  private _setupPhase1Executing() {
    this.swapForm.controls['srcId'].disable();
    this.swapForm.controls['destId'].disable();
    this.swapForm.controls['multiPhase'].disable();
    this.swapForm.markAsPristine();

    this.currentStep = 'phase1-executing';
    this._updatePhaseTracker('running', 'default');
    this.swapping = true;
    this.showPreviewChanges = false;
    this.executeButtonDisabed = true;
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
    this.executeButtonDisabed = false;
  }

  onSlotIdChange() {
    const srcId = this.swapForm.controls['srcId'].value;
    const destId = this.swapForm.controls['destId'].value;
    const slots = `${srcId || ''},${destId || ''}`;
    this._diffSubject$.next(slots);
  }

  closePanel() {
    let confirmMsg = null;

    if (this.swapping) {
      confirmMsg = this.operationInProgressWarning;
    } else if (this.swapForm && this.swapForm.dirty) {
      confirmMsg = this.unsavedChangesWarning;
    }

    const close = confirmMsg ? confirm(confirmMsg) : true;
    if (close) {
      this.parameters$.next(null);
      this._closeSelf();
    }
  }

  private _closeSelf() {
    this._portalService.closeSelf();
  }

  executePhase1() {
    const operationType = this.swapForm.controls['multiPhase'].value ? 'applySlotConfig' : 'slotsswap';
    const params = this._getOperationInputs(operationType);
    const operation = this._translateService.instant(PortalResources.swapOperation, {
      swapType: params.swapType,
      srcSlot: params.srcName,
      destSlot: params.destName,
    });
    this.progressMessage = this._translateService.instant(PortalResources.swapStarted, { operation: operation });
    this.progressMessageClass = 'spinner';

    this._setupPhase1Executing();

    if (operationType === 'applySlotConfig') {
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
          this.clearBusy();
          this.swapping = false;

          if (!r.success) {
            this._logService.error(LogCategories.deploymentSlots, '/deployment-slots', r.error);
            this.progressMessage = this._translateService.instant(PortalResources.swapFailure, {
              operation: operation,
              error: JSON.stringify(r.error),
            });
            this.progressMessageClass = 'error';
            this._updatePhaseTracker('failed', null);
            // TODO [andimarc]: display error message in an error info box?
          } else {
            this.progressMessage = this._translateService.instant(PortalResources.swapSuccess, { operation: operation });
            this.progressMessageClass = 'success';
            this._swappedOrCancelled = true;
            this.configApplied$.next({
              srcSlotName: params.srcName,
              destSlotName: params.destName,
            });
            // TODO [andimarc]: refresh the _slotsList entries for the slot(s) involved in the swap?
            this._setupPhase2();
          }
        });
    } else {
      setTimeout(_ => {
        this.parameters$.next(params);
      }, 500);
    }
  }

  executePhase2() {
    const operationType = this.swapForm.controls['revertSwap'].value ? 'resetSlotConfig' : 'slotsswap';
    const startedString = this.swapForm.controls['revertSwap'].value ? PortalResources.swapCancelStarted : PortalResources.swapStarted;
    const params = this._getOperationInputs(operationType);
    const operation = this._translateService.instant(PortalResources.swapOperation, {
      swapType: params.swapType,
      srcSlot: params.srcName,
      destSlot: params.destName,
    });
    this.progressMessage = this._translateService.instant(startedString, { operation: operation });
    this.progressMessageClass = 'spinner';
    this.swapping = true;
    this.executeButtonDisabed = true;
    this._updatePhaseTracker('done', 'running');

    setTimeout(_ => {
      this.parameters$.next(params);
    }, 500);
  }

  private _getOperationInputs(operationType: OperationType): SwapSlotParameters {
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
      operationType: operationType,
      uri: srcDescriptor.getTrimmedResourceId() + '/' + operationType,
      srcName: srcName,
      destName: destName,
      swapType: swapType,
      content: content,
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

        this.slotsDiffs = slotDiffs.map(d => d.properties).filter(diff => {
          return diff.diffRule === 'SettingsWillBeModifiedInDestination' || diff.diffRule === 'SettingsWillBeAddedToDestination';
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
