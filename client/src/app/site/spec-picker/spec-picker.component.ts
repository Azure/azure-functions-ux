import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { PortalService } from 'app/shared/services/portal.service';
import { TranslateService } from '@ngx-translate/core';
import { PlanPriceSpecManager, PlanSpecPickerData, SpecPickerInput } from './price-spec-manager/plan-price-spec-manager';
import { Component, Input, Injector, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FeatureComponent } from '../../shared/components/feature-component';
import { TreeViewInfo } from '../../tree-view/models/tree-view-info';
import { Observable } from 'rxjs/Observable';
import { PriceSpec } from './price-spec-manager/price-spec';
import { PortalResources } from '../../shared/models/portal-resources';
import { SiteTabIds, KeyCodes } from '../../shared/models/constants';
import { BroadcastMessageId } from '../../shared/models/portal';

export interface StatusMessage {
  message: string;
  level: 'error' | 'success' | 'warning' | 'info';
  infoLink?: string;
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
    if (!this._input.data || (this._input.data && !!this._input.data.selectedSkuCode)) {
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
      this._portalService.returnPcv3Results<string>(this.specManager.selectedSpecGroup.selectedSpec.legacySkuName);
    }
  }

  onExpandKeyPress(event: KeyboardEvent) {
    if (event.keyCode === KeyCodes.enter) {
      this.specManager.selectedSpecGroup.isExpanded = !this.specManager.selectedSpecGroup.isExpanded;
      event.preventDefault();
    }
  }

  get isEmpty() {
    return (
      this.specManager.selectedSpecGroup.recommendedSpecs.length === 0 && this.specManager.selectedSpecGroup.additionalSpecs.length === 0
    );
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
