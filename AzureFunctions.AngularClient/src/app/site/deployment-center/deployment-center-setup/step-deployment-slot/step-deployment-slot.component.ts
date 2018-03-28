import { Component, OnDestroy } from '@angular/core';
import { DeploymentCenterStateManager } from '../wizard-logic/deployment-center-state-manager';
import { DropDownElement } from '../../../../shared/models/drop-down-element';
import { ArmService } from '../../../../shared/services/arm.service';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-step-deployment-slot',
  templateUrl: './step-deployment-slot.component.html',
  styleUrls: ['./step-deployment-slot.component.scss']
})
export class StepDeploymentSlotComponent implements OnDestroy {

  DeploymentSlotEnabledOptions =
    [{ displayLabel: 'No', value: false },
    { displayLabel: 'Yes', value: true }];

  DeploymentSlotNewOptions =
    [{ displayLabel: 'New', value: true },
    { displayLabel: 'Existing', value: false }];
  DeploymentSlotsLoading = false;
  ExistingDeploymentSlotsList: DropDownElement<string>[] = [];
  selectedDeploymentSlot = '';

  private _ngUnsubscribe = new Subject();
  constructor(
    public wizard: DeploymentCenterStateManager,
    _armService: ArmService
  ) {
    this.wizard.resourceIdStream
      .takeUntil(this._ngUnsubscribe)
      .switchMap(r => _armService.get(`${r}/slots`))
      .subscribe(r => {
        const slots = r.json().value;
        console.log(slots);
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
    this._ngUnsubscribe.next();
  }

}
