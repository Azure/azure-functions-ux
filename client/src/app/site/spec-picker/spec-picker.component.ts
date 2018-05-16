import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { PortalService } from 'app/shared/services/portal.service';
import { TranslateService } from '@ngx-translate/core';
import { ArmResourceDescriptor } from './../../shared/resourceDescriptors';
import { AuthzService } from 'app/shared/services/authz.service';
import { PlanPriceSpecManager, NewPlanSpecPickerData, SpecPickerInput } from './price-spec-manager/plan-price-spec-manager';
import { Component, Input, Injector, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FeatureComponent } from '../../shared/components/feature-component';
import { TreeViewInfo } from '../../tree-view/models/tree-view-info';
import { Observable } from 'rxjs/Observable';
import { PriceSpec } from './price-spec-manager/price-spec';
import { PriceSpecGroup } from './price-spec-manager/price-spec-group';
import { ResourceId } from '../../shared/models/arm/arm-obj';
import { PortalResources } from '../../shared/models/portal-resources';
import { SiteTabIds, KeyCodes } from '../../shared/models/constants';
import { Dom } from '../../shared/Utilities/dom';

export interface StatusMessage {
  message: string;
  level: 'error' | 'success' | 'warning' | 'info';
}

@Component({
  selector: 'spec-picker',
  templateUrl: './spec-picker.component.html',
  styleUrls: ['./spec-picker.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SpecPickerComponent extends FeatureComponent<TreeViewInfo<SpecPickerInput<NewPlanSpecPickerData>>> implements OnDestroy {

  @Input() set viewInfoInput(viewInfo: TreeViewInfo<SpecPickerInput<NewPlanSpecPickerData>>) {
    this.setInput(viewInfo);
  }

  @Input() isOpenedFromMenu: boolean;
  @ViewChild('specGroupTabs') groupElements: ElementRef;

  statusMessage: StatusMessage = null;
  isInitializing = false;
  isUpdating = false;
  shieldEnabled = false;
  disableUpdates = false;

  private _planOrSubResourceId: ResourceId;
  private _input: SpecPickerInput<NewPlanSpecPickerData>;

  get applyButtonEnabled(): boolean {
    if (this.statusMessage && this.statusMessage.level === 'error') {
      return false;
    } else if (!this.specManager.selectedSpecGroup.selectedSpec) {
      return false;
    } else if (this.specManager
      && this.specManager.selectedSpecGroup.selectedSpec
      && this.specManager.selectedSpecGroup.selectedSpec.skuCode === this.specManager.currentSkuCode) {

      return false;
    } else if (this.isUpdating || this.isInitializing || this.disableUpdates) {
      return false;
    } else {
      return true;
    }
  }

  constructor(
    public specManager: PlanPriceSpecManager,
    private _authZService: AuthzService,
    private _ts: TranslateService,
    private _portalService: PortalService,
    injector: Injector) {
    super('SpecPickerComponent', injector, SiteTabIds.scaleUp);

    this.isParentComponent = true;
    this.featureName = 'SpecPickerComponent';
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.specManager.dispose();
  }

  protected setup(inputEvents: Observable<TreeViewInfo<SpecPickerInput<NewPlanSpecPickerData>>>) {
    return inputEvents
      .distinctUntilChanged()
      .switchMap(info => {
        this.isInitializing = true;
        this.statusMessage = null;
        this.shieldEnabled = false;

        // The resourceId would be a plan resourceId if it's an existing plan.  Or a subscription resourceId
        // if it's a new plan.
        this._planOrSubResourceId = info.resourceId;

        // data will be null if opened as a tab
        if (!info.data) {
          this._input = {
            id: info.resourceId,
            data: null,
            specPicker: this
          };
        } else {
          // data will be set if opened from Ibiza
          this._input = info.data;
          this._input.specPicker = this;
        }

        return this.specManager.initialize(this._input);
      })
      .switchMap(_ => {
        // Clearing isInitializing here because if getSpeccosts fails for some reason, we still want to allow the user to
        // be able to scale
        this.isInitializing = false;
        this.clearBusyEarly();

        return Observable.zip(
          this.specManager.getSpecCosts(this._input),
          !this._input.data ? this._authZService.hasPermission(this._planOrSubResourceId, [AuthzService.writeScope]) : Observable.of(true),
          !this._input.data ? this._authZService.hasReadOnlyLock(this._planOrSubResourceId) : Observable.of(false));
      })
      .do(r => {

        if (!this._input.data) {
          const planDescriptor = new ArmResourceDescriptor(this._planOrSubResourceId);
          const name = planDescriptor.parts[planDescriptor.parts.length - 1];

          if (!r[1]) {
            this.statusMessage = {
              message: this._ts.instant(PortalResources.pricing_noWritePermissionsOnPlanFormat).format(name),
              level: 'error'
            };

            this.shieldEnabled = true;
          } else if (r[2]) {
            this.statusMessage = {
              message: this._ts.instant(PortalResources.pricing_planReadonlyLockFormat).format(name),
              level: 'error'
            };

            this.shieldEnabled = true;
          }
        }
      });
  }

  selectGroup(group: PriceSpecGroup) {
    this.specManager.selectedSpecGroup = group;
  }

  selectSpec(spec: PriceSpec) {
    if (spec.state === 'disabled') {
      return;
    }

    this.statusMessage = null;

    this.specManager.selectedSpecGroup.selectedSpec = spec;
  }

  clickApply() {
    if (!this.applyButtonEnabled) {
      return;
    }

    this.statusMessage = null;

    // This is an existing plan, so just upgrade in-place
    if (!this._input.data) {
      this._portalService.updateDirtyState(true, this._ts.instant(PortalResources.clearDirtyConfirmation));
      this.isUpdating = true;
      this.disableUpdates = true;

      this.specManager.applySelectedSpec()
        .subscribe(applyButtonState => {
          this.isUpdating = false;

          this.disableUpdates = applyButtonState === 'disabled' ? true : false;
          this._portalService.updateDirtyState(false);
        });
    } else {
      // This is a new plan, so return plan information to parent blade
      this._portalService.returnPcv3Results<string>(this.specManager.selectedSpecGroup.selectedSpec.legacySkuName);
    }
  }

  onGroupTabKeyPress(event: KeyboardEvent) {
    const groups = this.specManager.specGroups;

    if (event.keyCode === KeyCodes.arrowRight || event.keyCode === KeyCodes.arrowLeft) {
      let curIndex = groups.findIndex(g => g === this.specManager.selectedSpecGroup);
      const tabElements = this._getTabElements();
      this._updateFocusOnGroupTab(false, tabElements, curIndex);

      if (event.keyCode === KeyCodes.arrowRight) {
        curIndex = this._getTargetIndex(groups, curIndex + 1);
      } else {
        curIndex = this._getTargetIndex(groups, curIndex - 1);
      }

      this.selectGroup(groups[curIndex]);
      this._updateFocusOnGroupTab(true, tabElements, curIndex);

      event.preventDefault();
    }
  }

  onExpandKeyPress(event: KeyboardEvent) {
    if (event.keyCode === KeyCodes.enter) {
      this.specManager.selectedSpecGroup.isExpanded = !this.specManager.selectedSpecGroup.isExpanded;
      event.preventDefault();
    }
  }

  get isEmpty() {
    return this.specManager.selectedSpecGroup.recommendedSpecs.length === 0
      && this.specManager.selectedSpecGroup.additionalSpecs.length === 0;
  }

  get showExpander() {
    return this.specManager.selectedSpecGroup.recommendedSpecs.length > 0
      && this.specManager.selectedSpecGroup.additionalSpecs.length > 0;
  }

  get showAllSpecs() {
    return (this.showExpander && this.specManager.selectedSpecGroup.isExpanded)
      || (!this.showExpander && this.specManager.selectedSpecGroup.additionalSpecs.length > 0);
  }

  private _getTargetIndex(groups: PriceSpecGroup[], targetIndex: number) {
    if (targetIndex < 0) {
      targetIndex = groups.length - 1;
    } else if (targetIndex >= groups.length) {
      targetIndex = 0;
    }

    return targetIndex;
  }

  private _getTabElements() {
    return this.groupElements.nativeElement.children;
  }

  private _updateFocusOnGroupTab(set: boolean, elements: HTMLCollection, index: number) {
    const tab = Dom.getTabbableControl(<HTMLElement>elements[index]);

    if (set) {
      Dom.setFocus(tab);
    } else {
      Dom.clearFocus(tab);
    }
  }
}
