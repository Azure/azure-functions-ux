import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { PortalService } from 'app/shared/services/portal.service';
import { TranslateService } from '@ngx-translate/core';
import { PlanPriceSpecManager, PlanSpecPickerData, SpecPickerInput } from './price-spec-manager/plan-price-spec-manager';
import { Component, Input, Injector, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FeatureComponent } from '../../shared/components/feature-component';
import { TreeViewInfo } from '../../tree-view/models/tree-view-info';
import { Observable } from 'rxjs/Observable';
import { PriceSpec } from './price-spec-manager/price-spec';
import { PriceSpecGroupType } from './price-spec-manager/price-spec-group';
import { PortalResources } from '../../shared/models/portal-resources';
import { SiteTabIds, KeyCodes, LogCategories } from '../../shared/models/constants';
import { BroadcastMessageId } from '../../shared/models/portal';
import { LogService, LogLevel } from 'app/shared/services/log.service';
import { NationalCloudEnvironment } from './../../shared/services/scenario/national-cloud.environment';
import { Url } from './../../shared/Utilities/url';

export interface StatusMessage {
  message: string;
  level: 'error' | 'success' | 'warning' | 'info';
  infoLink?: string;
  showCheckbox?: boolean;
  infoLinkAriaLabel?: string;
}

interface SpecResult {
  skuCode: string;
  tier: string;
}

@Component({
  selector: 'spec-picker',
  templateUrl: './spec-picker.component.html',
  styleUrls: ['./spec-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SpecPickerComponent extends FeatureComponent<TreeViewInfo<SpecPickerInput<PlanSpecPickerData>>> implements OnDestroy {
  @Input()
  set viewInfoInput(viewInfo: TreeViewInfo<SpecPickerInput<PlanSpecPickerData>>) {
    this.setInput(viewInfo);
  }

  @Input()
  isOpenedFromMenu: boolean;
  @ViewChild('specGroupTabs')
  groupElements: ElementRef;

  statusMessage: StatusMessage = null;
  isInitializing = false;
  isUpdating = false;
  shieldEnabled = false;
  disableUpdates = false;
  isStatusMessageCheckboxSelected: boolean;

  private _input: SpecPickerInput<PlanSpecPickerData>;

  get applyButtonEnabled(): boolean {
    if (this.statusMessage && this.statusMessage.level === 'error') {
      return false;
    } else if (!this.specManager.selectedSpecGroup.selectedSpec) {
      return false;
    } else if (
      this.specManager &&
      this.specManager.selectedSpecGroup.selectedSpec &&
      this.specManager.selectedSpecGroup.selectedSpec.skuCode === this.specManager.currentSkuCode
    ) {
      return false;
    } else if (this.isUpdating || this.isInitializing || this.disableUpdates) {
      return false;
    } else if (this.statusMessage && this.statusMessage.showCheckbox && !this.isStatusMessageCheckboxSelected) {
      return false;
    } else {
      return true;
    }
  }

  get statusMessageImage(): string {
    switch (this.statusMessage.level) {
      case 'error':
        return 'image/error.svg';
      case 'success':
        return 'image/success.svg';
      case 'warning':
        return 'image/warning.svg';
      case 'info':
        return 'image/info.svg';
      default:
        throw new Error('Invalid level');
    }
  }

  constructor(
    public specManager: PlanPriceSpecManager,
    private _ts: TranslateService,
    private _portalService: PortalService,
    private _logService: LogService,
    injector: Injector
  ) {
    super('SpecPickerComponent', injector, SiteTabIds.scaleUp);

    this.isParentComponent = true;
    this.featureName = 'SpecPickerComponent';
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.specManager.dispose();
  }

  protected setup(inputEvents: Observable<TreeViewInfo<SpecPickerInput<PlanSpecPickerData>>>) {
    return inputEvents
      .distinctUntilChanged()
      .switchMap(info => {
        this.specManager.resetGroups();
        this.isInitializing = true;
        this.statusMessage = null;
        this.shieldEnabled = false;

        // data will be null if opened as a tab
        if (!info.data) {
          this._input = {
            id: info.resourceId,
            data: null,
            specPicker: this,
          };
        } else {
          // data will be set if opened from Ibiza
          this._input = info.data;
          this._input.specPicker = this;
        }

        return this.specManager.initialize(this._input);
      })
      .switchMap(_ => {
        this.specManager.cleanUpGroups();

        // Clearing isInitializing here because if getSpeccosts fails for some reason, we still want to allow the user to
        // be able to scale
        this.isInitializing = false;
        this.clearBusyEarly();

        return Observable.zip(this.specManager.getSpecCosts(), this.specManager.checkAccess());
      })
      .do(r => {
        this.specManager.updateUpsellBanner();
      });
  }

  selectGroup(groupId: string) {
    this.specManager.selectedSpecGroup = this.specManager.specGroups.find(group => group.id === groupId);
  }

  selectSpec(spec: PriceSpec) {
    if (spec.state === 'disabled') {
      return;
    }

    this.statusMessage = null;

    this.specManager.setSelectedSpec(spec);
  }

  clickApply() {
    if (!this.applyButtonEnabled) {
      return;
    }

    this.statusMessage = null;

    // This is an existing plan, so just upgrade in-place
    if (!this._input.data || (this._input.data && !!this._input.data.selectedSkuCode && !this._input.data.returnObjectResult)) {
      this._logService.log(LogLevel.debug, LogCategories.specPicker, {
        isCreateScenario: false,
        isLinux: this._input.data && this._input.data.isLinux,
        sku: this.specManager.selectedSpecGroup.selectedSpec.skuCode,
      });
      this._portalService.updateDirtyState(true, this._ts.instant(PortalResources.clearDirtyConfirmation));
      this.isUpdating = true;
      this.disableUpdates = true;

      this.specManager.applySelectedSpec().subscribe(applyButtonState => {
        this.isUpdating = false;

        this.disableUpdates = applyButtonState === 'disabled' ? true : false;
        this._portalService.updateDirtyState(false);
        this._portalService.broadcastMessage(BroadcastMessageId.planUpdated, this._input.id);
      });
    } else {
      // This is a new plan, so return plan information to parent blade
      this._logService.log(LogLevel.debug, LogCategories.specPicker, {
        isCreateScenario: !this._input.data.returnObjectResult,
        isLinux: this._input.data.isLinux,
        sku: this.specManager.selectedSpecGroup.selectedSpec.skuCode,
      });

      if (this._input.data && this._input.data.returnObjectResult) {
        this._portalService.returnPcv3Results<SpecResult>({
          skuCode: this.specManager.selectedSpecGroup.selectedSpec.skuCode,
          tier: this.specManager.selectedSpecGroup.selectedSpec.tier,
        });
      } else {
        this._portalService.returnPcv3Results<string>(this.specManager.selectedSpecGroup.selectedSpec.legacySkuName);
      }
    }
  }

  onExpandKeyPress(event: KeyboardEvent) {
    if (event.keyCode === KeyCodes.enter) {
      this.specManager.selectedSpecGroup.isExpanded = !this.specManager.selectedSpecGroup.isExpanded;
      event.preventDefault();
    }
  }

  get isEmpty() {
    const selectedSpecGroup = this.specManager.selectedSpecGroup;
    const isEmpty = selectedSpecGroup.recommendedSpecs.length === 0 && this.specManager.selectedSpecGroup.additionalSpecs.length === 0;

    // NOTE(shimedh): This is a temporary change for new WebApp or new ASP creates till we support creation of ASE.
    const isNewPlan = this._input.data && !this._input.data.selectedSkuCode;
    if (!NationalCloudEnvironment.isNationalCloud() && isEmpty && selectedSpecGroup.id === PriceSpecGroupType.ISOLATED && isNewPlan) {
      const shellUrl = decodeURI(window.location.href);
      selectedSpecGroup.emptyMessage = this._ts.instant(PortalResources.pricing_emptyIsolatedGroupNewPlan);
      selectedSpecGroup.emptyInfoLink = `${Url.getParameterByName(
        shellUrl,
        'trustedAuthority'
      )}/?websitesextension_fromasporwebappcreate=true#create/Microsoft.AppServiceEnvironmentCreate`;
      selectedSpecGroup.emptyInfoLinkText = this._ts.instant(PortalResources.pricing_emptyIsolatedGroupNewPlanLinkText);
    }

    return isEmpty;
  }

  get showExpander() {
    return this.specManager.selectedSpecGroup.recommendedSpecs.length > 0 && this.specManager.selectedSpecGroup.additionalSpecs.length > 0;
  }

  get showAllSpecs() {
    return (
      (this.showExpander && this.specManager.selectedSpecGroup.isExpanded) ||
      (!this.showExpander && this.specManager.selectedSpecGroup.additionalSpecs.length > 0)
    );
  }
}
