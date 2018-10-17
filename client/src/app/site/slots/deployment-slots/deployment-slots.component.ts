import { Component, Injector, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Response } from '@angular/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { CustomFormControl } from '../../../controls/click-to-edit/click-to-edit.component';
import { InfoBoxType } from '../../../controls/info-box/info-box.component';
import { ArmSiteDescriptor } from '../../../shared/resourceDescriptors';
import { FeatureComponent } from '../../../shared/components/feature-component';
import { Links, LogCategories, ScenarioIds, SiteTabIds } from '../../../shared/models/constants';
import { PortalResources } from '../../../shared/models/portal-resources';
import { ArmObj, ResourceId } from '../../../shared/models/arm/arm-obj';
import { RoutingRule } from '../../../shared/models/arm/routing-rule';
import { Site } from '../../../shared/models/arm/site';
import { SiteConfig } from '../../../shared/models/arm/site-config';
import { errorIds } from '../../../shared/models/error-ids';
import { AiService } from '../../../shared/services/ai.service';
import { AuthzService } from '../../../shared/services/authz.service';
import { CacheService } from '../../../shared/services/cache.service';
import { LogService } from '../../../shared/services/log.service';
import { PortalService } from '../../../shared/services/portal.service';
import { SiteService } from '../../../shared/services/site.service';
import { ScenarioService } from '../../../shared/services/scenario/scenario.service';
import { DecimalRangeValidator } from '../../../shared/validators/decimalRangeValidator';
import { RoutingSumValidator } from '../../../shared/validators/routingSumValidator';
import { TreeViewInfo, SiteData } from '../../../tree-view/models/tree-view-info';
import { AddSlotParameters } from '../add-slot/add-slot.component';
import { SrcDestPair, SwapSlotParameters } from '../swap-slots/swap-slots.component';
import { OpenBladeInfo } from 'app/shared/models/portal';

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

  public swapControlsOpen: boolean;
  public swapStatusMessage: string;
  public swapStatusClass: InfoBoxType;
  public swapping: boolean;
  public configApplied: boolean;

  public addControlsOpen: boolean;
  public addStatusMessage: string;
  public addStatusClass: InfoBoxType;
  public addingSlot: boolean;

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
    private _aiService: AiService,
    private _scenarioService: ScenarioService,
    injector: Injector
  ) {
    super('SlotsComponent', injector, SiteTabIds.deploymentSlotsConfig);

    // TODO [andimarc]
    // For ibiza scenarios, this needs to match the deep link feature name used to load this in ibiza menu
    this.featureName = 'deploymentslots';
    this.isParentComponent = true;

    this.slotsQuotaScaleUp = () => {
      if (this._confirmIfDirty()) {
        this.scaleUp();
      }
    };
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

        this.swapControlsOpen = false;
        this.swapStatusMessage = null;
        this.swapStatusClass = 'info';
        this.swapping = false;
        this.configApplied = false;

        this.addControlsOpen = false;
        this.addStatusMessage = null;
        this.addStatusClass = 'info';
        this.addingSlot = false;

        this.siteArm = null;
        this.relativeSlotsArm = null;
        this.saving = false;
        this._siteConfigArm = null;

        this._updateDisabledState();

        const siteDescriptor = new ArmSiteDescriptor(this.viewInfo.resourceId);

        this._isSlot = !!siteDescriptor.slot;
        this._slotName = siteDescriptor.slot || 'production';

        this.resourceId = siteDescriptor.getTrimmedResourceId();

        const siteResourceId = siteDescriptor.getSiteOnlyResourceId();

        return Observable.zip(
          this._siteService.getSite(siteResourceId, this._refreshing),
          this._siteService.getSlots(siteResourceId, this._refreshing),
          this._siteService.getSiteConfig(this.resourceId, this._refreshing)
        );
      })
      .switchMap(r => {
        const [siteResult, slotsResult, siteConfigResult] = r;

        let success = true;

        // TODO [andimarc]: If only siteConfigResult fails, don't fail entire UI, just disable controls for routing rules
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
            this.siteArm = slotsResult.result.value.filter(s => s.id === this.resourceId)[0];
            this.relativeSlotsArm = slotsResult.result.value.filter(s => s.id !== this.resourceId);
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

        this._updateDisabledState();

        this._refreshing = false;
      });
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
    const operationOpenOrInProgress = this.saving || this.addControlsOpen || this.addingSlot || this.swapControlsOpen || this.swapping;

    this.saveAndDiscardCommandsDisabled = operationOpenOrInProgress || !this.featureSupported || !this.hasWriteAccess;
    if (this.mainForm) {
      if (this.saveAndDiscardCommandsDisabled) {
        this.mainForm.disable();
      } else {
        this.mainForm.enable();
      }
    }

    this.addSlotCommandDisabled = this.saveAndDiscardCommandsDisabled || !!this.slotsQuotaMessage;
    this.swapSlotsCommandDisabled =
      this.saveAndDiscardCommandsDisabled || !this.hasSwapAccess || !this.relativeSlotsArm || !this.relativeSlotsArm.length;

    this.navigationDisabled = this.addControlsOpen || this.addingSlot || this.swapControlsOpen || this.swapping;
  }

  private _generateRuleControl(siteArm: ArmObj<Site>): FormControl {
    const rampUpRules = this._siteConfigArm.properties.experiments.rampUpRules;
    const ruleName = siteArm.type === 'Microsoft.Web/sites' ? 'production' : this.getSegment(siteArm.name, -1);
    const rule = !rampUpRules ? null : rampUpRules.filter(r => r.name === ruleName)[0];

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
        const control = rulesGroup.controls[name] as CustomFormControl;
        control._msRunValidation = true;
        control.updateValueAndValidity();
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
            const ruleControl = rulesGroup.controls[name];

            if (!ruleControl.pristine) {
              const nameParts = name.split('/');
              const ruleName = nameParts.length === 0 ? 'production' : nameParts[1];
              const index = rampUpRules.findIndex(r => r.name === ruleName);

              if (!ruleControl.value) {
                if (index >= 0) {
                  rampUpRules.splice(index, 1);
                }
              } else {
                if (index >= 0) {
                  rampUpRules[index].reroutePercentage = ruleControl.value;
                } else {
                  const slotArm = this.relativeSlotsArm.find(s => s.name === name);

                  if (slotArm) {
                    rampUpRules.push({
                      actionHostName: slotArm.properties.hostNames[0],
                      reroutePercentage: ruleControl.value,
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

          return this._cacheService.putArm(`${this.resourceId}/config/web`, null, siteConfigArm);
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
          this._setupForm();
          this._updateDisabledState();
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
    this.setBusy();

    const bladeInfo: OpenBladeInfo = {
      detailBlade: 'SwapSlotsFrameBlade',
      detailBladeInputs: { id: this.siteArm.id },
      openAsContextBlade: true,
    };

    this._portalService
      .openBlade(bladeInfo, this.componentName)
      .do(null, err => {
        this.clearBusy();
        this.swapControlsOpen = false;
        this._updateDisabledState();
      })
      .subscribe(r => {
        this.clearBusy();
        this.swapControlsOpen = false;
        this._updateDisabledState();
      });
  }

  receiveSwapParams(params: SwapSlotParameters) {
    this.swapControlsOpen = false;

    if (!params) {
      if (this.configApplied) {
        this.refresh(true);
      } else {
        this._updateDisabledState();
      }
    } else if (params.operationType === 'slotsswap') {
      this._slotsSwap(params);
    } else if (params.operationType === 'resetSlotConfig') {
      this._resetSlotConfig(params);
    }
  }

  onConfigApplied(srcDestPair: SrcDestPair) {
    if (srcDestPair && srcDestPair.srcSlotName && srcDestPair.destSlotName) {
      if (this._slotName.toLowerCase() === srcDestPair.srcSlotName.toLowerCase()) {
        this.siteArm.properties.targetSwapSlot = srcDestPair.destSlotName;
        this.configApplied = true;
      } else if (this._slotName.toLowerCase() === srcDestPair.destSlotName.toLowerCase()) {
        this.siteArm.properties.targetSwapSlot = srcDestPair.srcSlotName;
        this.configApplied = true;
      }
    }
  }

  private _slotsSwap(params: SwapSlotParameters) {
    this.setBusy();
    this.dirtyMessage = this._translateService.instant(PortalResources.swapOperationInProgressWarning);

    const operation = this._translateService.instant(PortalResources.swapOperation, {
      swapType: params.swapType,
      srcSlot: params.srcName,
      destSlot: params.destName,
    });
    this.swapStatusMessage = this._translateService.instant(PortalResources.swapStarted, { operation: operation });
    this.swapStatusClass = 'spinner';
    this.swapping = true;

    this._cacheService
      .postArm(params.uri, null, null, params.content)
      .mergeMap(swapResult => {
        const location = swapResult.headers.get('Location');
        if (!location) {
          return Observable.of({ success: false, error: 'no location header' });
        } else {
          const pollingInterval = 1000;
          const pollingTimeout = 180;
          return Observable.interval(pollingInterval)
            .concatMap(_ => this._cacheService.get(location, true))
            .map((pollResponse: Response) => pollResponse.status)
            .take(pollingTimeout)
            .filter(status => status !== 202)
            .map(_ => {
              return { success: true, error: null };
            })
            .catch(e => Observable.of({ success: false, error: e }))
            .take(1);
        }
      })
      .catch(e => {
        return Observable.of({ success: false, error: e });
      })
      .subscribe(r => {
        this.dirtyMessage = null;

        if (r.success) {
          this.swapStatusMessage = this._translateService.instant(PortalResources.swapSuccess, { operation: operation });
          this.swapStatusClass = 'success';
          setTimeout(_ => {
            this.swapStatusMessage = null;
            this.swapping = false;
            this.clearBusy();
            this.refresh(true); // TODO [andimarc]: prompt to confirm before refreshing?
          }, 1000);
        } else {
          const resultMessage = this._translateService.instant(PortalResources.swapFailure, {
            operation: operation,
            error: JSON.stringify(r.error),
          });
          this.swapStatusMessage = resultMessage;
          this.swapStatusClass = 'error';
          this.swapping = false;
          this.clearBusy();
          this.showComponentError({
            message: resultMessage,
            details: resultMessage,
            errorId: errorIds.failedToSwapSlots,
            resourceId: this.resourceId,
          });
          this._aiService.trackEvent(errorIds.failedToSwapSlots, { error: r.error, id: this.resourceId });
          this._logService.error(LogCategories.deploymentSlots, '/deployment-slots', r.error);
          this._updateDisabledState();
        }
      });
  }

  private _resetSlotConfig(params: SwapSlotParameters) {
    this.setBusy();
    this.dirtyMessage = this._translateService.instant(PortalResources.swapOperationInProgressWarning);

    const operation = this._translateService.instant(PortalResources.swapOperation, {
      swapType: params.swapType,
      srcSlot: params.srcName,
      destSlot: params.destName,
    });
    this.swapStatusMessage = this._translateService.instant(PortalResources.swapCancelStarted, { operation: operation });
    this.swapStatusClass = 'spinner';
    this.swapping = true;

    this._cacheService
      .postArm(params.uri, null, null, params.content)
      .mergeMap(r => {
        return Observable.of({ success: true, error: null });
      })
      .catch(e => {
        return Observable.of({ success: false, error: e });
      })
      .subscribe(r => {
        this.dirtyMessage = null;

        if (r.success) {
          this.swapStatusMessage = this._translateService.instant(PortalResources.swapCancelSuccess, { operation: operation });
          this.swapStatusClass = 'success';
          setTimeout(_ => {
            this.swapStatusMessage = null;
            this.swapping = false;
            this.clearBusy();
            this.refresh(true); // TODO [andimarc]: prompt to confirm before refreshing?
          }, 1000);
        } else {
          const resultMessage = this._translateService.instant(PortalResources.swapCancelFailure, {
            operation: operation,
            error: JSON.stringify(r.error),
          });
          this.swapStatusMessage = resultMessage;
          this.swapStatusClass = 'error';
          this.swapping = false;
          this.clearBusy();
          this.showComponentError({
            message: resultMessage,
            details: resultMessage,
            errorId: errorIds.failedToSwapSlots,
            resourceId: this.resourceId,
          });
          this._aiService.trackEvent(errorIds.failedToSwapSlots, { error: r.error, id: this.resourceId });
          this._logService.error(LogCategories.deploymentSlots, '/deployment-slots', r.error);
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
    this.setBusy();

    const bladeInfo: OpenBladeInfo = {
      detailBlade: 'AddSlotFrameBlade',
      detailBladeInputs: { id: this.siteArm.id },
      openAsContextBlade: true,
    };

    this._portalService
      .openBlade(bladeInfo, this.componentName)
      .do(null, err => {
        this.clearBusy();
        this.addControlsOpen = false;
        this._updateDisabledState();
      })
      .subscribe(r => {
        this.clearBusy();
        this.addControlsOpen = false;
        this._updateDisabledState();
      });
  }

  receiveAddParams(params: AddSlotParameters) {
    this.addControlsOpen = false;

    if (!params) {
      this._updateDisabledState();
    } else {
      this.setBusy();
      this.dirtyMessage = this._translateService.instant(PortalResources.slotCreateOperationInProgressWarning);
      this.addStatusMessage = this._translateService.instant(PortalResources.slotNew_startCreateNotifyTitle).format(params.newSlotName);
      this.addStatusClass = 'spinner';
      this.addingSlot = true;
      this._siteService
        .createSlot(params.siteId, params.newSlotName, params.location, params.serverFarmId, params.cloneConfig)
        .subscribe(r => {
          this.dirtyMessage = null;

          if (r.isSuccessful) {
            this.addStatusMessage = this._translateService
              .instant(PortalResources.slotNew_startCreateSuccessNotifyTitle)
              .format(params.newSlotName);
            this.addStatusClass = 'success';
            this.addingSlot = false;
            setTimeout(_ => {
              this.addStatusMessage = null;
              this.clearBusy();
              this.refresh(true); // TODO [andimarc]: prompt to confirm before refreshing?
            }, 1000);
          } else {
            this.addStatusMessage = this._translateService
              .instant(PortalResources.slotNew_startCreateFailureNotifyTitle)
              .format(params.newSlotName);
            this.addStatusClass = 'error';
            this.addingSlot = false;
            this.clearBusy();
            this.showComponentError({
              message: this._translateService.instant(PortalResources.slotNew_startCreateFailureNotifyTitle).format(params.newSlotName),
              details: this._translateService.instant(PortalResources.slotNew_startCreateFailureNotifyTitle).format(params.newSlotName),
              errorId: errorIds.failedToCreateSlot,
              resourceId: params.siteId,
            });
            this._aiService.trackEvent(errorIds.failedToCreateSlot, { error: r.error.result, id: params.siteId });
            this._updateDisabledState();
          }
        });
    }
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
