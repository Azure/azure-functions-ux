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
  public isSlot: boolean;

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
  public addOperationsComplete = true;
  public swapOperationsComplete = true;

  public dirtyMessage: string;

  public siteArm: ArmObj<Site>;

  public prodSiteArm: ArmObj<Site>;
  public prodSiteConfigArm: ArmObj<SiteConfig>;
  public deploymentSlotsArm: ArmObj<Site>[];
  public saving: boolean;

  private _siteLevelResourceId: ResourceId;

  private _slotName: string;

  private _refreshing: boolean;

  private _addControlsOpen = false;
  private _swapControlsOpen = false;

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

        this.prodSiteArm = null;
        this.prodSiteConfigArm = null;
        this.deploymentSlotsArm = null;
        this.saving = false;

        this._updateDisabledState();

        const siteDescriptor = new ArmSiteDescriptor(this.viewInfo.resourceId);

        this.isSlot = !!siteDescriptor.slot;
        this._slotName = siteDescriptor.slot || 'production';

        this.resourceId = siteDescriptor.getTrimmedResourceId().toLowerCase();

        this._siteLevelResourceId = siteDescriptor.getSiteOnlyResourceId().toLowerCase();

        return Observable.zip(
          this._siteService.getSite(this._siteLevelResourceId, this._refreshing),
          this._siteService.getSlots(this._siteLevelResourceId, this._refreshing),
          this._siteService.getSiteConfig(this._siteLevelResourceId, this._refreshing)
        );
      })
      .switchMap(r => {
        const [siteResult, slotsResult, siteConfigResult] = r;

        let success = true;

        // TODO (andimarc): If only siteConfigResult fails, don't fail entire UI, just disable controls for routing rules
        if (!siteResult.isSuccessful) {
          this._logService.error(LogCategories.deploymentSlots, '/get-site', siteResult.error.result);
          success = false;
        }
        if (!slotsResult.isSuccessful) {
          this._logService.error(LogCategories.deploymentSlots, '/get-slots', slotsResult.error.result);
          success = false;
        }
        if (!siteConfigResult.isSuccessful) {
          this._logService.error(LogCategories.deploymentSlots, '/get-tip-rules', siteConfigResult.error.result);
          if (!this.isSlot) {
            success = false;
          }
        }

        if (success) {
          this.prodSiteArm = siteResult.result;
          this.siteArm = this.isSlot
            ? slotsResult.result.value.filter(s => s.id.toLowerCase() === this.resourceId.toLowerCase())[0]
            : siteResult.result;
          this.deploymentSlotsArm = slotsResult.result.value;
          this.prodSiteConfigArm = siteConfigResult.result;
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

        if (this.featureSupported && this.deploymentSlotsArm && this.deploymentSlotsArm.length + 1 >= slotsQuota) {
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
          case SwapOperationType.applySlotConfig:
            if (slotSwapInfo.state === SlotOperationState.started) {
              this._setTargetSwapSlot(slotSwapInfo.srcName, slotSwapInfo.destName);
            } else if (slotSwapInfo.state === SlotOperationState.completed) {
              this.swapOperationsComplete = false;
              this.refresh(true);
            }
            break;
          case SwapOperationType.slotsSwap:
            if (slotSwapInfo.state === SlotOperationState.started) {
              this._setTargetSwapSlot(slotSwapInfo.srcName, slotSwapInfo.destName);
            } else if (slotSwapInfo.state === SlotOperationState.completed) {
              this.swapOperationsComplete = true;
              this.refresh(true);
            }
            break;
          case SwapOperationType.resetSlotConfig:
            if (slotSwapInfo.state === SlotOperationState.started) {
              if (this.siteArm) {
                this.siteArm.properties.targetSwapSlot = null;
              }
            } else if (slotSwapInfo.state === SlotOperationState.completed) {
              this.swapOperationsComplete = true;
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
      .filter(m => {
        const resourceId = m.resourceId.toLowerCase();
        return resourceId === this.resourceId.toLowerCase() || resourceId === this._siteLevelResourceId.toLowerCase();
      })
      .subscribe(message => {
        const slotNewInfo = message.metadata;
        if (slotNewInfo.state === SlotOperationState.completed) {
          this.addOperationsComplete = true;
          if (slotNewInfo.success) {
            this.refresh(true);
          }
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
    if (!!this.siteArm && !!this.deploymentSlotsArm && !!this.prodSiteConfigArm) {
      this.mainForm = this._fb.group({});

      const remainderControl = this._fb.control({ value: '', disabled: false });

      const routingSumValidator = new RoutingSumValidator(this._fb, this._translateService);
      const rulesGroup = this._fb.group({}, { validator: routingSumValidator.validate.bind(routingSumValidator) });

      this.deploymentSlotsArm.forEach(siteArm => {
        const ruleControl = this._generateRuleControl(siteArm);
        rulesGroup.addControl(siteArm.name, ruleControl);
      });

      this.mainForm.addControl(RoutingSumValidator.REMAINDER_CONTROL_NAME, remainderControl);

      this.mainForm.addControl('rulesGroup', rulesGroup);

      this._validateRoutingControls();

      setTimeout(_ => {
        remainderControl.disable();
        if (this.isSlot) {
          rulesGroup.disable();
        }
      });
    } else {
      this.mainForm = null;
    }
  }

  private _updateDisabledState() {
    const operationOpenOrInProgress = this.saving || this._addControlsOpen || this._swapControlsOpen;

    this.refreshCommandDisabled = operationOpenOrInProgress || !this.featureSupported;

    this.saveAndDiscardCommandsDisabled = this.refreshCommandDisabled || !this.hasWriteAccess;
    if (this.mainForm && this.mainForm.controls['rulesGroup']) {
      if (this.saveAndDiscardCommandsDisabled || this.isSlot) {
        this.mainForm.controls['rulesGroup'].disable();
      } else {
        this.mainForm.controls['rulesGroup'].enable();
      }
    }

    this.addSlotCommandDisabled = this.saveAndDiscardCommandsDisabled || !!this.slotsQuotaMessage;
    this.swapSlotsCommandDisabled =
      this.saveAndDiscardCommandsDisabled || !this.hasSwapAccess || !this.deploymentSlotsArm || !this.deploymentSlotsArm.length;

    this.navigationDisabled = this.isSlot || this._addControlsOpen || this._swapControlsOpen;
  }

  private _generateRuleControl(siteArm: ArmObj<Site>): FormControl {
    const rampUpRules = this.prodSiteConfigArm.properties.experiments.rampUpRules;
    const ruleName = siteArm.type === 'Microsoft.Web/sites' ? 'production' : this.getSegment(siteArm.name, -1);
    const rule = !rampUpRules ? null : rampUpRules.filter(r => r.name.toLowerCase() === ruleName.toLowerCase())[0];

    const decimalRangeValidator = new DecimalRangeValidator(this._translateService);
    return this._fb.control(
      { value: rule ? rule.reroutePercentage : '', disabled: false },
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

          const siteConfigArm: ArmObj<SiteConfig> = JSON.parse(JSON.stringify(this.prodSiteConfigArm));
          const rampUpRules = siteConfigArm.properties.experiments.rampUpRules as RoutingRule[];

          const rulesGroup: FormGroup = this.mainForm.controls['rulesGroup'] as FormGroup;
          for (const name in rulesGroup.controls) {
            if (rulesGroup.controls[name]) {
              const ruleControl = rulesGroup.controls[name];

              if (!ruleControl.pristine) {
                const nameParts = name.split('/');
                const ruleName = nameParts.length === 2 ? nameParts[1] : 'production';
                const index = rampUpRules.findIndex(r => r.name.toLowerCase() === ruleName.toLowerCase());

                // If the user explicitly clears the routing percentage for an exising rule, we will delete the enitre rule from config.
                // If the user sets the routing percentage for a new/existing rule to a valid value (including 0%), we will update/add
                // the rule with the routing percentage specified.

                const value =
                  ruleControl.value === '' || ruleControl.value === null || ruleControl.value === undefined
                    ? null
                    : Number(ruleControl.value).valueOf();

                if (value === null) {
                  if (index >= 0) {
                    rampUpRules.splice(index, 1);
                  }
                } else {
                  if (index >= 0) {
                    rampUpRules[index].reroutePercentage = value;
                  } else {
                    const slotArm = this.deploymentSlotsArm.find(s => s.name.toLowerCase() === name.toLowerCase());

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

          if (siteConfigArm.properties && siteConfigArm.properties.azureStorageAccounts) {
            delete siteConfigArm.properties.azureStorageAccounts;
          }

          return this._cacheService.putArm(`${this.resourceId}/config/web`, ARMApiVersions.antaresApiVersion20181101, siteConfigArm);
        })
        .do(null, error => {
          this.dirtyMessage = null;
          this._logService.error(LogCategories.deploymentSlots, '/update-tip-rules', error);
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

          this.prodSiteConfigArm = r.json();
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
      this._swapControlsOpen = true;
      this.swapOperationsComplete = false;
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
        this._swapControlsOpen = false;
        this.swapOperationsComplete = true;
        if (!this._refreshing) {
          this._updateDisabledState();
        }
      });
  }

  showAddControls() {
    if (this._confirmIfDirty()) {
      this._addControlsOpen = true;
      this.addOperationsComplete = false;
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
        this._addControlsOpen = false;
        this.addOperationsComplete = true;
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

  openActivityLog() {
    const siteDescriptor = new ArmSiteDescriptor(this.siteArm.id);

    // See https://msazure.visualstudio.com/One/_git/AzureUX-ActivityLog?path=%2Fsrc%2FActivityLogExtension%2FClient%2FEvents%2FModels%2FSharedEventModels.ts&version=GBdev
    const query = {
      operationNames: [
        'Microsoft.Web/sites/applySlotConfig/Action',
        'Microsoft.Web/sites/resetSlotConfig/Action',
        'Microsoft.Web/sites/slotsswap/Action',
        'Microsoft.Web/sites/slots/applySlotConfig/Action',
        'Microsoft.Web/sites/slots/resetSlotConfig/Action',
        'Microsoft.Web/sites/slots/slotsswap/Action',
      ],
      searchText: '',
      subscriptions: [siteDescriptor.subscription],
      managementGroups: [],
      resourceGroupId: siteDescriptor.resourceGroupId,
      resourceId: siteDescriptor.resourceId,
      resourceTypes: [],
      category: 'all',
      // Levels
      //   Critical = 1
      //   Error = 2
      //   Warning = 3
      //   Informational = 4
      //   Verbose = 5
      levels: ['1', '2', '3', '4'],
      // TimeSpan
      //   LastOneHour = 0
      //   Last24Hours = 1
      //   LastWeek = 2
      //   Custom = 3 (requires startTime and endTime)
      //   LastSixHours = 4
      //   LastTwoWeeks = 6
      //   LastOneMonth = 7
      timeSpan: '2',
      top: 100,
    };

    const bladeInfo: OpenBladeInfo = {
      detailBlade: 'ActivityLogBlade',
      detailBladeInputs: { queryInputs: { query } },
      extension: 'Microsoft_Azure_ActivityLog',
      openAsContextBlade: false,
      openAsSubJourney: false,
    };

    this._portalService.openBlade(bladeInfo, this.componentName).subscribe();
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
