import { Component, OnDestroy } from '@angular/core';
import { DeploymentCenterStateManager } from '../wizard-logic/deployment-center-state-manager';
import { DropDownElement } from '../../../../shared/models/drop-down-element';
import { ArmService } from '../../../../shared/services/arm.service';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../../../shared/models/portal-resources';

@Component({
  selector: 'app-step-deployment-slot',
  templateUrl: './step-deployment-slot.component.html',
  styleUrls: ['./step-deployment-slot.component.scss', '../deployment-center-setup.component.scss']
})
export class StepDeploymentSlotComponent implements OnDestroy {

  DeploymentSlotEnabledOptions =
    [{ displayLabel: this._translateService.instant(PortalResources.no), value: false },
    { displayLabel: this._translateService.instant(PortalResources.yes), value: true }];

  DeploymentSlotNewOptions =
    [{ displayLabel: this._translateService.instant(PortalResources.new), value: true },
    { displayLabel: this._translateService.instant(PortalResources.existing), value: false }];
  DeploymentSlotsLoading = false;
  ExistingDeploymentSlotsList: DropDownElement<string>[] = [];
  selectedDeploymentSlot = '';

  private _ngUnsubscribe$ = new Subject();
  constructor(
    public wizard: DeploymentCenterStateManager,
    _armService: ArmService,
    private _translateService: TranslateService
  ) {
    this.wizard.resourceIdStream$
      .takeUntil(this._ngUnsubscribe$)
      .switchMap(r => _armService.get(`${r}/slots`))
      .subscribe(r => {
        const slots = r.json().value;
        this.ExistingDeploymentSlotsList = slots.filter(slot => slot.name !== 'production').map(slot => {
          const slotName: string = slot.name.split('/')[1];
          return {
            displayLabel: slotName,
            value: slotName
          };
        });
      });

  }

  ngOnDestroy() {
    this._ngUnsubscribe$.next();
  }

}
