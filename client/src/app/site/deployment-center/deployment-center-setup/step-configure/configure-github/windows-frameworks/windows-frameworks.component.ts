import { Component, OnDestroy, OnInit } from '@angular/core';
import { DeploymentCenterStateManager } from '../../../wizard-logic/deployment-center-state-manager';
import { Subject } from 'rxjs/Subject';
import { DropDownElement } from '../../../../../../shared/models/drop-down-element';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';
import { TranslateService } from '@ngx-translate/core';

export const TaskRunner = {
  None: 'None',
  Gulp: 'Gulp',
  Grunt: 'Grunt',
};

export const WebAppFramework = {
  AspNetCore: 'AspNetCore',
  Node: 'Node',
  StaticWebapp: 'StaticWebapp',
};

@Component({
  selector: 'app-windows-frameworks',
  templateUrl: './windows-frameworks.component.html',
  styleUrls: [
    './windows-frameworks.component.scss',
    '../../step-configure.component.scss',
    '../../../deployment-center-setup.component.scss',
  ],
})
export class WindowsFrameworksComponent implements OnInit, OnDestroy {
  defaultNodeTaskRunner = 'none';
  nodeJsTaskRunners: DropDownElement<string>[] = [
    { value: 'gulp', displayLabel: TaskRunner.Gulp },
    { value: 'grunt', displayLabel: TaskRunner.Grunt },
    { value: 'none', displayLabel: TaskRunner.None },
  ];

  webApplicationFrameworks: DropDownElement<string>[] = [
    {
      displayLabel: 'ASP.NET Core',
      value: WebAppFramework.AspNetCore,
    },
    {
      displayLabel: 'Node.JS',
      value: WebAppFramework.Node,
    },
    {
      displayLabel: 'Static Webapp',
      value: WebAppFramework.StaticWebapp,
    },
  ];

  private _ngUnsubscribe$ = new Subject();
  selectedPythonVersion = '';
  selectedFramework = WebAppFramework.AspNetCore;
  selectedTaskRunner = this.defaultNodeTaskRunner;
  requiredValidator: RequiredValidator;

  constructor(public wizard: DeploymentCenterStateManager, private _translateService: TranslateService) {
    this.setupValidators();
  }

  private setupValidators() {
    this.requiredValidator = new RequiredValidator(this._translateService, false);
    this.wizard.buildSettings.get('applicationFramework').setValidators([this.requiredValidator.validate.bind(this.requiredValidator)]);
    this.wizard.buildSettings.get('applicationFramework').updateValueAndValidity();

    this.wizard.buildSettings.get('workingDirectory').setValidators([]);
    this.wizard.buildSettings.get('workingDirectory').updateValueAndValidity();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
  }
}
