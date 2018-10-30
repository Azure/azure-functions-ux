import { Component } from '@angular/core';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';

@Component({
  selector: 'app-step-configure',
  templateUrl: './step-configure.component.html',
  styleUrls: ['./step-configure.component.scss', '../deployment-center-setup.component.scss'],
})
export class StepConfigureComponent {
  private _sourceProvider: string;
  private _buildProvider: string;

  constructor(public wizard: DeploymentCenterStateManager) {}

  get sourceProvider() {
    const values = this.wizard.wizardValues;
    const sourceProvider = values && values.sourceProvider;
    if (sourceProvider !== this._sourceProvider) {
      this._sourceProvider = sourceProvider;
      this.wizard.resetSection(this.wizard.sourceSettings);
    }
    return sourceProvider;
  }

  get buildProvider() {
    const values = this.wizard.wizardValues;
    const buildProvider = values && values.buildProvider;
    if (buildProvider !== this._buildProvider) {
      this._buildProvider = buildProvider;
      this.wizard.resetSection(this.wizard.buildSettings);
    }
    return buildProvider;
  }
}
