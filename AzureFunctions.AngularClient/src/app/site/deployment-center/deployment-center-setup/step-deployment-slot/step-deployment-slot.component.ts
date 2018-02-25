import { Component, OnInit } from '@angular/core';
import { DeploymentCenterStateManager } from '../wizard-logic/deployment-center-state-manager';

@Component({
  selector: 'app-step-deployment-slot',
  templateUrl: './step-deployment-slot.component.html',
  styleUrls: ['./step-deployment-slot.component.scss']
})
export class StepDeploymentSlotComponent implements OnInit {

  DeploymentSlotEnabledOptions =
    [{ displayLabel: 'No', value: false },
    { displayLabel: 'Yes', value: true }];

  constructor(
    public wizard: DeploymentCenterStateManager
  ) { }

  ngOnInit() {
  }

}
