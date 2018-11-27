import { Component, Injector, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { CustomFormControl } from '../../../controls/click-to-edit/click-to-edit.component';
import { ArmSiteDescriptor } from '../../../shared/resourceDescriptors';
import { FeatureComponent } from '../../../shared/components/feature-component';
import { BroadcastEvent, EventMessage } from '../../../shared/models/broadcast-event';
import {
  Links,
  LogCategories,
  ScenarioIds,
  SiteTabIds,
  SlotOperationState,
  SwapOperationType,
  ARMApiVersions,
} from '../../../shared/models/constants';
import { OpenBladeInfo, EventVerbs } from '../../../shared/models/portal';
import { PortalResources } from '../../../shared/models/portal-resources';
import { SlotSwapInfo, SlotNewInfo } from '../../../shared/models/slot-events';
import { ArmObj, ResourceId } from '../../../shared/models/arm/arm-obj';
import { RoutingRule } from '../../../shared/models/arm/routing-rule';
import { Site } from '../../../shared/models/arm/site';
import { SiteConfig } from '../../../shared/models/arm/site-config';
import { AuthzService } from '../../../shared/services/authz.service';
import { CacheService } from '../../../shared/services/cache.service';
import { LogService } from '../../../shared/services/log.service';
import { PortalService } from '../../../shared/services/portal.service';
import { SiteService } from '../../../shared/services/site.service';
import { ScenarioService } from '../../../shared/services/scenario/scenario.service';
import { DecimalRangeValidator } from '../../../shared/validators/decimalRangeValidator';
import { RoutingSumValidator } from '../../../shared/validators/routingSumValidator';
import { TreeViewInfo, SiteData } from '../../../tree-view/models/tree-view-info';

@Component({
  selector: 'deployment-slots',
  templateUrl: './deployment-slots.component.html',
  styleUrls: ['./../common.scss', './deployment-slots.component.scss'],
})
export class DeploymentSlotsComponent extends FeatureComponent<TreeViewInfo<SiteData>> implements OnDestroy {
  public FwdLinks = Links;
  public SumValidator = RoutingSumValidator;
  public viewInfo: TreeViewInfo<SiteData>;
  public resourceId: ResourceId;

  public addSlotCommandDisabled = true;
  public swapSlotsCommandDisabled = true;
  public saveAndDiscardCommandsDisabled = true;
  public refreshCommandDisabled = true;
  public navigationDisabled = false;

  public loadingFailed: boolean;
  public fetchingContent: boolean;
  public fetchingPermissions: boolean;
  public keepVisible: boolean;

  public featureSupported: boolean;
  public canScaleUp: boolean;

  public mainForm: FormGroup;
  public hasWriteAccess: boolean;
  public hasSwapAccess: boolean;

  public slotsQuotaMessage: string;
  public slotsQuotaScaleUp: () => void;

  public showAddControlsFn: () => void;
  public addControlsOpen = false;
  public swapControlsOpen = false;

  public dirtyMessage: string;

  public siteArm: ArmObj<Site>;
  public relativeSlotsArm: ArmObj<Site>[];
  public saving: boolean;

  private _siteConfigArm: ArmObj<SiteConfig>;

  private _isSlot: boolean;

  private _slotName: string;

  private _refreshing: boolean;

  @Input()
  set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
    this.setInput(viewInfo);
  }

  constructor(
    private _authZService: AuthzService,
    private _cacheService: CacheService,
    private _fb: FormBuilder,
    private _logService: LogService,
    private _portalService: PortalService,
    private _siteService: SiteService,
    private _translateService: TranslateService,
    private _scenarioService: ScenarioService,
    injector: Injector
  ) {
    super('SlotsComponent', injector, SiteTabIds.deploymentSlotsConfig);

    this.featureName = 'deploymentslots';
    this.isParentComponent = true;

    this.slotsQuotaScaleUp = () => {
      if (this._confirmIfDirty()) {
        this.scaleUp();
      }
    };

    this.showAddControlsFn = () => {
      this.showAddControls();
    };

    this._setupBroadcastSubscriptions();
  }

  scaleUp() {
    this.setBusy();

    this._portalService
      .openBlade(
        {
          detailBlade: 'SpecPickerFrameBlade',
          detailBladeInputs: {
            id: this.siteArm.properties.serverFarmId,
            feature: 'scaleup',
            data: null,
          },
        },
        this.componentName
      )
      .subscribe(r => {
        this.clearBusy();
        this._logService.debug(LogCategories.deploymentSlots, `Scale up ${r.reason === 'childClosedSelf' ? 'succeeded' : 'cancelled'}`);
      });
  }

  refresh(keepVisible?: boolean) {
    if (this._confirmIfDirty()) {
      this._refreshing = true;
      this.keepVisible = keepVisible;
      const viewInfo: TreeViewInfo<SiteData> = JSON.parse(JSON.stringify(this.viewInfo));
      this.setInput(viewInfo);
    }
  }

  protected setup(inputEvents: Observable<TreeViewInfo<SiteData>>) {
    return inputEvents
      .distinctUntilChanged()
      .switchMap(viewInfo => {
        this.viewInfo = viewInfo;

        this.loadingFailed = false;
        this.fetchingContent = true;
        this.fetchingPermissions = true;

        this.featureSupported = false;
        this.canScaleUp = false;

        this.hasWriteAccess = false;
        this.hasSwapAccess = false;

        this.slotsQuotaMessage = null;

        this.siteArm = null;
        this.relativeSlotsArm = null;
        this.saving = false;
        this._siteConfigArm = null;

        this._updateDisabledState();

        const siteDescriptor = new ArmSiteDescriptor(this.viewInfo.resourceId);

        this._isSlot = !!siteDescriptor.slot;
        this._slotName = siteDescriptor.slot || 'production';

        this.resourceId = siteDescriptor.getTrimmedResourceId().toLowerCase();

        const siteResourceId = siteDescriptor.getSiteOnlyResourceId().toLowerCase();

        return Observable.zip(
          this._siteService.getSite(siteResourceId, this._refreshing),
          this._siteService.getSlots(siteResourceId, this._refreshing),
          this._siteService.getSiteConfig(this.resourceId, this._refreshing)
        );
      })
      .switchMap(r => {
        const [siteResult, slotsResult, siteConfigResult] = r;

        let success = true;

        // TODO (andimarc): If only siteConfigResult fails, don't fail entire UI, just disable controls for routing rules
        if (!siteResult.isSuccessful) {
          this._logService.error(LogCategories.deploymentSlots, '/deployment-slots', siteResult.error.result);
          success = false;
        }
        if (!slotsResult.isSuccessful) {
          this._logService.error(LogCategories.deploymentSlots, '/deployment-slots', slotsResult.error.result);
          success = false;
        }
        if (!siteConfigResult.isSuccessful) {
          this._logService.error(LogCategories.deploymentSlots, '/deployment-slots', siteConfigResult.error.result);
          success = false;
        }

        if (success) {
          this._siteConfigArm = siteConfigResult.result;

          if (this._isSlot) {
            this.siteArm = slotsResult.result.value.filter(s => s.id.toLowerCase() === this.resourceId.toLowerCase())[0];
            this.relativeSlotsArm = slotsResult.result.value.filter(s => s.id.toLowerCase() !== this.resourceId.toLowerCase());
            this.relativeSlotsArm.unshift(siteResult.result);
          } else {
            this.siteArm = siteResult.result;
            this.relativeSlotsArm = slotsResult.result.value;
          }
        }

        this.loadingFailed = !success;
        this.fetchingContent = false;
        this.keepVisible = false;

        this._setupForm();

        this.clearBusyEarly();

        if (success) {
          return Observable.zip(
            this._authZService.hasPermission(this.resourceId, [AuthzService.writeScope]),
            this._authZService.hasPermission(this.resourceId, [AuthzService.actionScope]),
            this._authZService.hasReadOnlyLock(this.resourceId),
            this._scenarioService.checkScenarioAsync(ScenarioIds.getSiteSlotLimits, { site: siteResult.result })
          );
        } else {
          return Observable.zip(Observable.of(false), Observable.of(false), Observable.of(true), Observable.of(null));
        }
      })
      .do(r => {
        const [hasWritePermission, hasSwapPermission, hasReadOnlyLock, slotsQuotaCheck] = r;
        const slotsQuota = !!slotsQuotaCheck ? slotsQuotaCheck.data : 0;

        this.canScaleUp =
          this.siteArm && this._scenarioService.checkScenario(ScenarioIds.canScaleForSlots, { site: this.siteArm }).status !== 'disabled';

        this.hasWriteAccess = hasWritePermission && !hasReadOnlyLock;

        this.hasSwapAccess = this.hasWriteAccess && hasSwapPermission;

        this.featureSupported = slotsQuota === -1 || slotsQuota >= 1;

        if (this.featureSupported && this.relativeSlotsArm && this.relativeSlotsArm.length + 1 >= slotsQuota) {
          let quotaMessage = this._translateService.instant(PortalResources.slotNew_quotaReached, { quota: slotsQuota });
          if (this.canScaleUp) {
            quotaMessage = quotaMessage + ' ' + this._translateService.instant(PortalResources.slotNew_quotaUpgrade);
          }
          this.slotsQuotaMessage = quotaMessage;
        }

        this.fetchingPermissions = false;

        this._refreshing = false;

        this._updateDisabledState();
      });
  }

  private _setupBroadcastSubscriptions() {
    this._portalService.setInboundEventFilter([EventVerbs.slotSwap, EventVerbs.slotNew]);
    this._setupSlotSwapMessageSubscription();
    this._setupSlotNewMessageSubscription();
  }

  private _setupSlotSwapMessageSubscription() {
    this._broadcastService
      .getEvents<EventMessage<SlotSwapInfo>>(BroadcastEvent.SlotSwap)
      .takeUntil(this.ngUnsubscribe)
      .filter(m => m.resourceId.toLowerCase() === this.resourceId.toLowerCase())
      .subscribe(message => {
        const slotSwapInfo = message.metadata;
        switch (slotSwapInfo.operationType) {
          case SwapOperationType.slotsSwap:
          case SwapOperationType.applySlotConfig:
            if (slotSwapInfo.state === SlotOperationState.started) {
              this._setTargetSwapSlot(slotSwapInfo.srcName, slotSwapInfo.destName);
            } else if (slotSwapInfo.state === SlotOperationState.completed) {
              this.refresh(true);
            }
            break;
          case SwapOperationType.resetSlotConfig:
            if (slotSwapInfo.state === SlotOperationState.started) {
              if (this.siteArm) {
                this.siteArm.properties.targetSwapSlot = null;
              }
            } else if (slotSwapInfo.state === SlotOperationState.completed) {
              this.refresh(true);
            }
            break;
        }
      });
  }

  private _setupSlotNewMessageSubscription() {
    this._broadcastService
      .getEvents<EventMessage<SlotNewInfo>>(BroadcastEvent.SlotNew)
      .takeUntil(this.ngUnsubscribe)
      .filter(m => m.resourceId.toLowerCase() === this.resourceId.toLowerCase())
      .subscribe(message => {
        const slotNewInfo = message.metadata;
        if (slotNewInfo.state === SlotOperationState.completed && slotNewInfo.success) {
          this.refresh(true);
        }
      });
  }

  private _setTargetSwapSlot(srcSlotName: string, destSlotName: string) {
    if (this.siteArm) {
      if (this._slotName.toLowerCase() === srcSlotName.toLowerCase()) {
        this.siteArm.properties.targetSwapSlot = destSlotName;
      } else if (this._slotName.toLowerCase() === destSlotName.toLowerCase()) {
        this.siteArm.properties.targetSwapSlot = srcSlotName;
      }
    }
  }

  private _setupForm() {
    if (!!this.siteArm && !!this.relativeSlotsArm && !!this._siteConfigArm) {
      this.mainForm = this._fb.group({});

      const remainderControl = this._fb.control({ value: '', disabled: false });

      const routingSumValidator = new RoutingSumValidator(this._fb, this._translateService);
      const rulesGroup = this._fb.group({}, { validator: routingSumValidator.validate.bind(routingSumValidator) });

      this.relativeSlotsArm.forEach(siteArm => {
        const ruleControl = this._generateRuleControl(siteArm);
        rulesGroup.addControl(siteArm.name, ruleControl);
      });

      this.mainForm.addControl(RoutingSumValidator.REMAINDER_CONTROL_NAME, remainderControl);

      this.mainForm.addControl('rulesGroup', rulesGroup);

      this._validateRoutingControls();

      setTimeout(_ => {
        remainderControl.disable();
      });
    } else {
      this.mainForm = null;
    }
  }

  private _updateDisabledState() {
    const operationOpenOrInProgress = this.saving || this.addControlsOpen || this.swapControlsOpen;

    this.refreshCommandDisabled = operationOpenOrInProgress || !this.featureSupported;

    this.saveAndDiscardCommandsDisabled = this.refreshCommandDisabled || !this.hasWriteAccess;
    if (this.mainForm && this.mainForm.controls['rulesGroup']) {
      if (this.saveAndDiscardCommandsDisabled) {
        this.mainForm.controls['rulesGroup'].disable();
      } else {
        this.mainForm.controls['rulesGroup'].enable();
      }
    }

    this.addSlotCommandDisabled = this.saveAndDiscardCommandsDisabled || !!this.slotsQuotaMessage;
    this.swapSlotsCommandDisabled =
      this.saveAndDiscardCommandsDisabled || !this.hasSwapAccess || !this.relativeSlotsArm || !this.relativeSlotsArm.length;

    this.navigationDisabled = this.addControlsOpen || this.swapControlsOpen;
  }

  private _generateRuleControl(siteArm: ArmObj<Site>): FormControl {
    const rampUpRules = this._siteConfigArm.properties.experiments.rampUpRules;
    const ruleName = siteArm.type === 'Microsoft.Web/sites' ? 'production' : this.getSegment(siteArm.name, -1);
    const rule = !rampUpRules ? null : rampUpRules.filter(r => r.name.toLowerCase() === ruleName.toLowerCase())[0];

    const decimalRangeValidator = new DecimalRangeValidator(this._translateService);
    return this._fb.control(
      { value: rule ? rule.reroutePercentage : 0, disabled: false },
      decimalRangeValidator.validate.bind(decimalRangeValidator)
    );
  }

  private _validateRoutingControls() {
    if (this.mainForm && this.mainForm.controls['rulesGroup']) {
      const rulesGroup = this.mainForm.controls['rulesGroup'] as FormGroup;
      for (const name in rulesGroup.controls) {
        if (rulesGroup.controls[name]) {
          const control = rulesGroup.controls[name] as CustomFormControl;
          control._msRunValidation = true;
          control.updateValueAndValidity();
        }
      }
      rulesGroup.updateValueAndValidity();
    }
  }

  save() {
    if (this.mainForm.controls['rulesGroup'] && this.mainForm.controls['rulesGroup'].valid) {
      this.setBusy();
      this.dirtyMessage = this._translateService.instant(PortalResources.saveOperationInProgressWarning);
      this.saving = true;

      this._updateDisabledState();

      let notificationId = null;
      this._portalService
        .startNotification(
          this._translateService.instant(PortalResources.configUpdating),
          this._translateService.instant(PortalResources.configUpdating)
        )
        .first()
        .switchMap(s => {
          notificationId = s.id;

          const siteConfigArm = JSON.parse(JSON.stringify(this._siteConfigArm));
          const rampUpRules = siteConfigArm.properties.experiments.rampUpRules as RoutingRule[];

          const rulesGroup: FormGroup = this.mainForm.controls['rulesGroup'] as FormGroup;
          for (const name in rulesGroup.controls) {
            if (rulesGroup.controls[name]) {
              const ruleControl = rulesGroup.controls[name];

              if (!ruleControl.pristine) {
                const nameParts = name.split('/');
                const ruleName = nameParts.length === 2 ? nameParts[1] : 'production';
                const index = rampUpRules.findIndex(r => r.name.toLowerCase() === ruleName.toLowerCase());
                const value = !ruleControl.value ? 0 : Number(ruleControl.value).valueOf();

                if (value === 0) {
                  if (index >= 0) {
                    rampUpRules.splice(index, 1);
                  }
                } else {
                  if (index >= 0) {
                    rampUpRules[index].reroutePercentage = value;
                  } else {
                    const slotArm = this.relativeSlotsArm.find(s => s.name.toLowerCase() === name.toLowerCase());

                    if (slotArm) {
                      rampUpRules.push({
                        actionHostName: slotArm.properties.hostNames[0],
                        reroutePercentage: value,
                        changeStep: null,
                        changeIntervalInMinutes: null,
                        minReroutePercentage: null,
                        maxReroutePercentage: null,
                        changeDecisionCallbackUrl: null,
                        name: ruleName,
                      });
                    }
                  }
                }
              }
            }
          }

          return this._cacheService.putArm(`${this.resourceId}/config/web`, ARMApiVersions.websiteApiVersion20180201, siteConfigArm);
        })
        .do(null, error => {
          this.dirtyMessage = null;
          this._logService.error(LogCategories.deploymentSlots, '/deployment-slots', error);
          this.saving = false;
          this.clearBusy();
          this._portalService.stopNotification(
            notificationId,
            false,
            this._translateService.instant(PortalResources.configUpdateFailure) + JSON.stringify(error)
          );
          this._updateDisabledState();
        })
        .subscribe(r => {
          this.dirtyMessage = null;
          this.saving = false;
          this.clearBusy();
          this._portalService.stopNotification(notificationId, true, this._translateService.instant(PortalResources.configUpdateSuccess));

          this._siteConfigArm = r.json();
          this._updateDisabledState();
          this._setupForm();
        });
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();

    this.clearBusy();
    this._broadcastService.clearDirtyState('swap-slot');
    this._broadcastService.clearDirtyState('add-slot');
  }

  private _confirmIfDirty(): boolean {
    let proceed = true;

    if (this.mainForm && this.mainForm.dirty) {
      proceed = confirm(this._translateService.instant(PortalResources.unsavedChangesWarning));
      if (proceed) {
        this._discard();
      }
    }

    return proceed;
  }

  private _discard() {
    this._setupForm();
  }

  discard() {
    if (this._confirmIfDirty()) {
      this._discard();
    }
  }

  showSwapControls() {
    if (this._confirmIfDirty()) {
      this.swapControlsOpen = true;
      this._updateDisabledState();
      this._openSwapPane();
    }
  }

  private _openSwapPane() {
    const bladeInfo: OpenBladeInfo = {
      detailBlade: 'SwapSlotsFrameBlade',
      detailBladeInputs: { id: this.siteArm.id },
      openAsContextBlade: true,
    };

    this._portalService
      .openBlade(bladeInfo, this.componentName)
      .mergeMap(bladeResult => {
        return Observable.of({
          success: true,
          error: null,
          result: bladeResult,
        });
      })
      .catch(err => {
        return Observable.of({
          success: false,
          error: err,
          result: null,
        });
      })
      .subscribe(_ => {
        this.swapControlsOpen = false;
        if (!this._refreshing) {
          this._updateDisabledState();
        }
      });
  }

  showAddControls() {
    if (this._confirmIfDirty()) {
      this.addControlsOpen = true;
      this._updateDisabledState();
      this._openAddPane();
    }
  }

  private _openAddPane() {
    const bladeInfo: OpenBladeInfo = {
      detailBlade: 'AddSlotFrameBlade',
      detailBladeInputs: { id: this.siteArm.id },
      openAsContextBlade: true,
    };

    this._portalService
      .openBlade(bladeInfo, this.componentName)
      .mergeMap(bladeResult => {
        return Observable.of({
          success: true,
          error: null,
          result: bladeResult,
        });
      })
      .catch(err => {
        return Observable.of({
          success: false,
          error: err,
          result: null,
        });
      })
      .subscribe(_ => {
        this.addControlsOpen = false;
        this._updateDisabledState();
      });
  }

  openSlotBlade(resourceId: string) {
    if (resourceId) {
      this._portalService.openBladeDeprecated(
        {
          detailBlade: 'AppsOverviewBlade',
          detailBladeInputs: { id: resourceId },
        },
        'deployment-slots'
      );
    }
  }

  getSegment(path: string, index: number): string {
    let segment = null;

    if (!!path) {
      const segments = path.split('/');

      index = index < 0 ? segments.length + index : index;

      if (index >= 0 && index < segments.length) {
        segment = segments[index];
      }
    }

    return segment;
  }
}
