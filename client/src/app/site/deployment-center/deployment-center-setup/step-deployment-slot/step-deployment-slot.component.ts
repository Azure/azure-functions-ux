import { Component, OnDestroy } from '@angular/core';
import { DeploymentCenterStateManager } from '../wizard-logic/deployment-center-state-manager';
import { DropDownElement } from '../../../../shared/models/drop-down-element';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../../../shared/models/portal-resources';
import { SlotNameValidator } from '../validators/slot-name-validator';
import { RequiredValidator } from '../../../../shared/validators/requiredValidator';
import { SiteService } from '../../../../shared/services/site.service';

@Component({
  selector: 'app-step-deployment-slot',
  templateUrl: './step-deployment-slot.component.html',
  styleUrls: ['./step-deployment-slot.component.scss', '../deployment-center-setup.component.scss']
})
export class StepDeploymentSlotComponent implements OnDestroy {

  deploymentSlotEnabledOptions =
    [{ displayLabel: this._translateService.instant(PortalResources.no), value: false },
    { displayLabel: this._translateService.instant(PortalResources.yes), value: true }];

  deploymentSlotNewOptions =
    [{ displayLabel: this._translateService.instant(PortalResources.new), value: true },
    { displayLabel: this._translateService.instant(PortalResources.existing), value: false }];
  deploymentSlotsLoading = false;
  existingDeploymentSlotsList: DropDownElement<string>[] = [];
  selectedDeploymentSlot = '';
  private _resourceId: string;
  private _ngUnsubscribe$ = new Subject();

  constructor(
    public wizard: DeploymentCenterStateManager,
    private _translateService: TranslateService,
    private _siteService: SiteService
  ) {
    this.wizard.resourceIdStream$
      .takeUntil(this._ngUnsubscribe$)
      .switchMap(r => {
        this._resourceId = r;
        return _siteService.getSlots(r);
      })
      .subscribe(r => {
        const slots = r.result.value;
        this.existingDeploymentSlotsList = slots.filter(slot => slot.name !== 'production').map(slot => {
          const slotName: string = slot.name.split('/')[1];
          return {
            displayLabel: slotName,
            value: slotName
          };
        });
      });
  }

  updateFormValidation() {
    const deploymentSlotFormValues = this.wizard.wizardValues.deploymentSlotSetting;
    const required = new RequiredValidator(this._translateService, false);
    if (deploymentSlotFormValues.newDeploymentSlot && deploymentSlotFormValues.deploymentSlotEnabled) {
      this.wizard.deploymentSlotSetting.get('deploymentSlot').setValidators([required.validate.bind(required)]);
      this.wizard.deploymentSlotSetting.get('deploymentSlot').setAsyncValidators(SlotNameValidator.createValidator(this._translateService, this._siteService, this._resourceId).bind(this));
    } else {
      this.wizard.deploymentSlotSetting.get('deploymentSlot').setAsyncValidators([]);
      if (deploymentSlotFormValues.deploymentSlotEnabled) {
        this.wizard.deploymentSlotSetting.get('deploymentSlot').setValidators([required.validate.bind(required)]);
      } else {
        this.wizard.deploymentSlotSetting.get('deploymentSlot').setValidators([]);
      }
    }
    this.wizard.deploymentSlotSetting.updateValueAndValidity();
  }

  createOrExistingChanged(event) {
    this.wizard.deploymentSlotSetting.get('deploymentSlot').reset();
    this.updateFormValidation();
  }

  enabledChanged(event) {
    this.wizard.deploymentSlotSetting.get('deploymentSlot').reset();
    this.updateFormValidation();
  }

  ngOnDestroy() {
    this._ngUnsubscribe$.next();
  }

}
