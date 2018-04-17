import { PortalService } from 'app/shared/services/portal.service';
import { TranslateService } from '@ngx-translate/core';
import { ArmResourceDescriptor } from './../../shared/resourceDescriptors';
import { AuthzService } from 'app/shared/services/authz.service';
import { PlanPriceSpecManager, NewPlanSpeckPickerData, SpecPickerInput } from './price-spec-manager/plan-price-spec-manager';
import { Component, OnInit, Input, Injector, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FeatureComponent } from '../../shared/components/feature-component';
import { TreeViewInfo } from '../../tree-view/models/tree-view-info';
import { Observable } from 'rxjs/Observable';
import { PriceSpec } from './price-spec-manager/price-spec';
import { PriceSpecGroup } from './price-spec-manager/price-spec-group';
import { ResourceId } from '../../shared/models/arm/arm-obj';
import { PortalResources } from '../../shared/models/portal-resources';
import { SiteTabIds, KeyCodes } from '../../shared/models/constants';
import { Dom } from '../../shared/Utilities/dom';

interface StatusMessage {
  message: string;
  level: 'error' | 'success';
}

@Component({
  selector: 'spec-picker',
  templateUrl: './spec-picker.component.html',
  styleUrls: ['./spec-picker.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SpecPickerComponent extends FeatureComponent<TreeViewInfo<SpecPickerInput<NewPlanSpeckPickerData>>> implements OnInit {

  @Input() set viewInfoInput(viewInfo: TreeViewInfo<SpecPickerInput<NewPlanSpeckPickerData>>) {
    this.setInput(viewInfo);
  }

  @Input() isOpenedFromMenu: boolean;
  @ViewChild('specGroupTabs') groupElements: ElementRef;

  specManager: PlanPriceSpecManager;
  statusMessage: StatusMessage = null;
  isInitializing = false;
  isUpdating = false;
  shieldEnabled = false;

  private _planOrSubResourceId: ResourceId;
  private _input: SpecPickerInput<NewPlanSpeckPickerData>;

  get applyButtonEnabled(): boolean {
    if (this.statusMessage && this.statusMessage.level === 'error') {
      return false;
    } else if (!this.specManager.selectedSpecGroup.selectedSpec) {
      return false;
    } else if (this.specManager
      && this.specManager.selectedSpecGroup.selectedSpec
      && this.specManager.selectedSpecGroup.selectedSpec.skuCode === this.specManager.currentSkuCode) {

      return false;
    } else if (this.isUpdating) {
      return false;
    } else if (this.isInitializing) {
      return false;
    } else {
      return true;
    }
  }

  constructor(
    private _authZService: AuthzService,
    private _ts: TranslateService,
    private _portalService: PortalService,
    private _injector: Injector) {
    super('SpecPickerComponent', _injector, SiteTabIds.scaleUp);

    this.isParentComponent = true;
    this.featureName = 'SpecPickerComponent';
  }

  ngOnInit() {
  }

  protected setup(inputEvents: Observable<TreeViewInfo<SpecPickerInput<NewPlanSpeckPickerData>>>) {
    return inputEvents
      .distinctUntilChanged()
      .switchMap(info => {
        this.isInitializing = true;
        this.statusMessage = null;
        this.shieldEnabled = false;

        this._planOrSubResourceId = info.resourceId;

        this.specManager = new PlanPriceSpecManager(this, this._injector);

        // data will be null if opened as a tab
        if (!info.data) {
          this._input = {
            id: info.resourceId,
            data: null
          };
        } else {
          // data will be set if opened from Ibiza
          this._input = info.data;
        }

        return this.specManager.initialize(this._input);
      })
      .switchMap(_ => {

        this.clearBusyEarly();

        return Observable.zip(
          this.specManager.getSpecCosts(),
          !this._input.data ? this._authZService.hasPermission(this._planOrSubResourceId, [AuthzService.writeScope]) : Observable.of(true),
          !this._input.data ? this._authZService.hasReadOnlyLock(this._planOrSubResourceId) : Observable.of(false));
      })
      .do(r => {
        this.isInitializing = false;

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

      let notificationId: string = null;
      const planDescriptor = new ArmResourceDescriptor(this._planOrSubResourceId);
      this._portalService.startNotification(
        this._ts.instant(PortalResources.pricing_planUpdateTitle),
        this._ts.instant(PortalResources.pricing_planUpdateDesc).format(planDescriptor.resourceName))
        .first()
        .switchMap(notification => {

          notificationId = notification.id;
          return this.specManager.applySelectedSpec();

        })
        .subscribe(r => {
          this.isUpdating = false;
          this._portalService.updateDirtyState(false);

          if (r.isSuccessful) {
            this._portalService.stopNotification(
              notificationId,
              r.isSuccessful,
              this._ts.instant(PortalResources.pricing_planUpdateSuccessFormat).format(planDescriptor.resourceName)
            );
          } else {
            this._portalService.stopNotification(
              notificationId,
              r.isSuccessful,
              r.error.message ? r.error.message : this._ts.instant(PortalResources.pricing_planUpdateFailFormat).format(planDescriptor.resourceName)
            );
          }
        });
    } else {
      // This is a new plan, so return plan information to parent blade
      this._portalService.returnPcv3Results<string>(this.specManager.selectedSpecGroup.selectedSpec.legacySkuName);
    }
  }

  onGroupTabKeyPress(event: KeyboardEvent) {
    const groups = this.specManager.specGroups;
    let curIndex = groups.findIndex(g => g === this.specManager.selectedSpecGroup);

    if (event.keyCode === KeyCodes.arrowRight) {
      const tabElements = this._getTabElements()
      this._updateFocusOnGroupTab(false, tabElements, curIndex);

      if (curIndex === groups.length - 1) {
        curIndex = 0;
      } else {
        curIndex++;
      }

      this.selectGroup(groups[curIndex]);
      this._updateFocusOnGroupTab(true, tabElements, curIndex);

      event.preventDefault();
    } else if (event.keyCode === KeyCodes.arrowLeft) {
      const tabElements = this._getTabElements()
      this._updateFocusOnGroupTab(false, tabElements, curIndex);

      if (curIndex === 0) {
        curIndex = groups.length - 1;
      } else {
        curIndex--;
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

  _getTabElements() {
    return this.groupElements.nativeElement.children;
  }

  _updateFocusOnGroupTab(set: boolean, elements: HTMLCollection, index: number) {
    const tab = Dom.getTabbableControl(<HTMLElement>elements[index]);

    if (set) {
      Dom.setFocus(tab);
    } else {
      Dom.clearFocus(tab);
    }
  }


}
