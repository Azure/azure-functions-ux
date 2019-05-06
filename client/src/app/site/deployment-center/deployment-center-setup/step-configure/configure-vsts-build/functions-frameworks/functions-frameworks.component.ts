import { Component } from '@angular/core';
import { DeploymentCenterStateManager } from '../../../wizard-logic/deployment-center-state-manager';
import { DropDownElement } from '../../../../../../shared/models/drop-down-element';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from 'app/shared/models/portal-resources';
import { RegexValidator } from 'app/shared/validators/regexValidator';

export const WebAppFramework = {
  ScriptFunction: 'ScriptFunction',
  PrecompiledFunction: 'PrecompiledFunction',
};

@Component({
  selector: 'app-functions-frameworks',
  templateUrl: './functions-frameworks.component.html',
  styleUrls: [
    './functions-frameworks.component.scss',
    '../../step-configure.component.scss',
    '../../../deployment-center-setup.component.scss',
  ],
})
export class FunctionsFramworksComponent {
  webApplicationFrameworks: DropDownElement<string>[] = [
    {
      displayLabel: this._translateService.instant(PortalResources.scriptFunctionApp),
      value: WebAppFramework.ScriptFunction,
    },
    {
      displayLabel: this._translateService.instant(PortalResources.precompiledDotNetApp),
      value: WebAppFramework.PrecompiledFunction,
    },
  ];

  private setupValidators() {
    const inputValidator = RegexValidator.create(
      new RegExp(/^\.{2,}\\(.)*$|^\.{2,}\/(.)*$|[A-Za-z]:(.)*/),
      this._translateService.instant(PortalResources.validate_workingDirectory),
      true
    );
    this.wizard.buildSettings.get('applicationFramework').valueChanges.subscribe(stack => {
      this.wizard.buildSettings.get('workingDirectory').setValidators([inputValidator]);
      this.wizard.buildSettings.get('workingDirectory').updateValueAndValidity();
    });
  }

  selectedFramework = WebAppFramework.ScriptFunction;
  constructor(public wizard: DeploymentCenterStateManager, private _translateService: TranslateService) {
    this.setupValidators();
  }
}
