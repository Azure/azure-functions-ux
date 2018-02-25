import { Component, OnInit } from '@angular/core';
import { DeploymentCenterStateManager } from '../wizard-logic/deployment-center-state-manager';
import { DropDownElement } from '../../../../shared/models/drop-down-element';

@Component({
  selector: 'app-step-deployment-slot',
  templateUrl: './step-deployment-slot.component.html',
  styleUrls: ['./step-deployment-slot.component.scss']
})
export class StepDeploymentSlotComponent implements OnInit {

  DeploymentSlotEnabledOptions =
    [{ displayLabel: 'No', value: false },
    { displayLabel: 'Yes', value: true }];

  DeploymentSlotNewOptions =
    [{ displayLabel: 'New', value: true },
    { displayLabel: 'Existing', value: false }];
  DeploymentSlotsLoading = false;
  ExistingDeploymentSlotsList: DropDownElement<string>[] = [];
  selectedDeploymentSlot = '';
  constructor(
    public wizard: DeploymentCenterStateManager
  ) { }

  ngOnInit() {
  }

}
