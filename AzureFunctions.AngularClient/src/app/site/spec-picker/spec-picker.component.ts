import { ArmResourceDescriptor } from './../../shared/resourceDescriptors';
import { AuthzService } from 'app/shared/services/authz.service';
import { PlanPriceSpecManager } from './price-spec-manager/plan-price-spec-manager';
import { Component, OnInit, Input, Injector, ViewEncapsulation } from '@angular/core';
import { FeatureComponent } from '../../shared/components/feature-component';
import { TreeViewInfo, SiteData } from '../../tree-view/models/tree-view-info';
import { Observable } from 'rxjs/Observable';
import { PriceSpec } from './price-spec-manager/price-spec';
import { PriceSpecGroup } from './price-spec-manager/price-spec-group';
import { ResourceId } from '../../shared/models/arm/arm-obj';

interface InfoMessage {
  message: string;
  level: 'error' | 'success';
}

@Component({
  selector: 'spec-picker',
  templateUrl: './spec-picker.component.html',
  styleUrls: ['./spec-picker.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SpecPickerComponent extends FeatureComponent<TreeViewInfo<SiteData>> implements OnInit {

  @Input() set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
    this.setInput(viewInfo);
  }

  specManager: PlanPriceSpecManager;
  infoMessage: InfoMessage = null;
  isInitializing = false;
  isUpdating = false;
  shieldEnabled = false;

  private _planResourceId: ResourceId;
  private _planDescriptor: ArmResourceDescriptor;

  get applyButtonEnabled(): boolean {
    if (this.infoMessage && this.infoMessage.level === 'error') {
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
    private _injector: Injector) {
    super('SpecPickerComponent', _injector, 'site-tabs');

    this.isParentComponent = true;
    this.featureName = 'SpecPickerComponent';
  }

  ngOnInit() {
  }

  protected setup(inputEvents: Observable<TreeViewInfo<SiteData>>) {
    return inputEvents
      .distinctUntilChanged()
      .switchMap(info => {
        this.isInitializing = true;
        this.infoMessage = null;
        this.shieldEnabled = false;

        this._planResourceId = info.resourceId;
        this._planDescriptor = new ArmResourceDescriptor(this._planResourceId);

        this.specManager = new PlanPriceSpecManager(this, this._injector);
        return this.specManager.initialize(this._planResourceId);
      })
      .switchMap(_ => {

        this.clearBusyEarly();

        return Observable.zip(
          this.specManager.getSpecCosts(),
          this._authZService.hasPermission(this._planResourceId, [AuthzService.writeScope]),
          this._authZService.hasReadOnlyLock(this._planResourceId));
      })
      .do(r => {
        this.isInitializing = false;

        if (!r[1]) {
          this.infoMessage = {
            message: `You must have write permissions on the plan '${this._planDescriptor.parts[this._planDescriptor.parts.length - 1]}' to update it`,
            level: 'error'
          };

          this.shieldEnabled = true;
        } else if (r[2]) {
          this.infoMessage = {
            message: `The plan '${this._planDescriptor.parts[this._planDescriptor.parts.length - 1]}' has a read only lock on it and cannot be updated.`,
            level: 'error'
          };

          this.shieldEnabled = true;
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

    this.infoMessage = null;

    this.specManager.selectedSpecGroup.selectedSpec = spec;
  }

  clickApply() {
    if (!this.applyButtonEnabled) {
      return;
    }

    this.infoMessage = null;
    this.isUpdating = true;

    this.specManager.applySelectedSpec()
      .subscribe(r => {
        this.isUpdating = false;

        if (r.isSuccessful) {

          this.infoMessage = {
            message: 'Success!',
            level: 'success'
          };

        } else {

          this.infoMessage = {
            message: r.error.message ? r.error.message : `Failed to update ''${this._planDescriptor.parts[this._planDescriptor.parts.length - 1]}`,
            level: 'error'
          };
        }
      });
  }
}
