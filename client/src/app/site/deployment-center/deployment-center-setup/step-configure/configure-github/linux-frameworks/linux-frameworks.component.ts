import { Component, OnDestroy } from '@angular/core';
import { DeploymentCenterStateManager } from '../../../wizard-logic/deployment-center-state-manager';
import { Subject } from 'rxjs/Subject';
import { DropDownElement } from '../../../../../../shared/models/drop-down-element';
import { SiteService } from '../../../../../../shared/services/site.service';
import { OsType, AvailableStack } from 'app/shared/models/arm/stacks';
import { RegexValidator } from 'app/shared/validators/regexValidator';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from 'app/shared/models/portal-resources';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';
import { RuntimeStacks } from 'app/shared/models/constants';
import { HttpResult } from './../../../../../../shared/models/http-result';
import { ArmArrayResult, ArmObj } from 'app/shared/models/arm/arm-obj';
import { Site } from 'app/shared/models/arm/site';

export const TaskRunner = {
  None: 'None',
  Gulp: 'Gulp',
  Grunt: 'Grunt',
};

export const WebAppFramework = {
  AspNetCore: 'AspNetCore',
  Node: 'Node',
  Python: 'Python',
};

@Component({
  selector: 'app-linux-frameworks',
  templateUrl: './linux-frameworks.component.html',
  styleUrls: [
    './linux-frameworks.component.scss',
    '../../step-configure.component.scss',
    '../../../deployment-center-setup.component.scss',
  ],
})
export class LinuxFrameworksComponent implements OnDestroy {
  defaultNodeTaskRunner = 'none';
  nodeJsTaskRunners: DropDownElement<string>[] = [];
  aspNetCoreVersions: DropDownElement<string>[] = [];

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
      displayLabel: 'Python',
      value: WebAppFramework.Python,
    },
  ];
  private _ngUnsubscribe$ = new Subject();

  selectedTaskRunner = this.defaultNodeTaskRunner;
  selectedFramework;
  selectedFrameworkVersion;
  nodeFrameworkVersions: DropDownElement<string>[] = [];
  dotNetCoreFrameworkVersions: DropDownElement<string>[] = [];
  pythonFrameworkVersions: DropDownElement<string>[] = [];
  constructor(public wizard: DeploymentCenterStateManager, siteService: SiteService, private _translateService: TranslateService) {
    siteService.getAvailableStacks(OsType.Linux).subscribe(vals => {
      this._setupAvailableStacks(vals);
      this.wizard.siteArmObj$.takeUntil(this._ngUnsubscribe$).subscribe(site => this._setupSite(site));
    });
  }

  private _setupSite(site: ArmObj<Site>): void {
    const linuxFxVersionObj = site.properties.siteProperties.properties.find(x => x.name === 'LinuxFxVersion');
    if (linuxFxVersionObj) {
      const linuxFxVersion = linuxFxVersionObj.value.split('|');
      const stack = linuxFxVersion[0];
      const version = linuxFxVersion[1];
      switch (stack.toLowerCase()) {
        case RuntimeStacks.node:
          this.selectedFramework = WebAppFramework.Node;
          break;
        case RuntimeStacks.dotnetcore:
          this.selectedFramework = WebAppFramework.AspNetCore;
          break;
        case RuntimeStacks.python:
          this.selectedFramework = WebAppFramework.Python;
          break;
      }
      this.selectedFrameworkVersion = version;
    }
  }

  private _setupAvailableStacks(response: HttpResult<ArmArrayResult<AvailableStack>>): void {
    const stacks = response.result.value;
    const nodeStack = stacks.find(x => x.name.toLowerCase() === RuntimeStacks.node);
    const dotNetCoreStack = stacks.find(x => x.name.toLowerCase() === RuntimeStacks.dotnetcore);
    const pythonStack = stacks.find(x => x.name.toLowerCase() === RuntimeStacks.python);

    this.nodeJsTaskRunners = [
      { value: 'gulp', displayLabel: 'Gulp' },
      { value: 'grunt', displayLabel: 'Grunt' },
      { value: 'none', displayLabel: this._translateService.instant(PortalResources.none) },
    ];

    this.aspNetCoreVersions = [
      { value: 'gulp', displayLabel: 'Gulp' },
      { value: 'grunt', displayLabel: 'Grunt' },
      { value: 'none', displayLabel: this._translateService.instant(PortalResources.none) },
    ];

    this.nodeFrameworkVersions = nodeStack.properties.majorVersions.map(x => {
      return {
        displayLabel: x.displayVersion,
        value: x.runtimeVersion.replace('NODE|', ''),
      };
    });

    this.dotNetCoreFrameworkVersions = dotNetCoreStack.properties.majorVersions.map(x => {
      return {
        displayLabel: x.displayVersion,
        value: x.runtimeVersion.replace('DOTNETCORE|', ''),
      };
    });

    this.pythonFrameworkVersions = pythonStack.properties.majorVersions.map(x => {
      return {
        displayLabel: x.displayVersion,
        value: x.runtimeVersion.replace('PYTHON|', ''),
      };
    });

    this.setupValidators();
  }

  private setupValidators() {
    const required = new RequiredValidator(this._translateService, false);
    this.wizard.buildSettings.get('applicationFramework').setValidators(required.validate.bind(required));
    this.wizard.buildSettings.get('applicationFramework').updateValueAndValidity();

    this.wizard.buildSettings
      .get('applicationFramework')
      .valueChanges.takeUntil(this._ngUnsubscribe$)
      .subscribe(stack => {
        // Regex value comes from Azure Devops team for validation
        const nodeValidator = RegexValidator.create(
          new RegExp('^(node|pm2|ng|npm)\\s+\\w+'),
          this._translateService.instant(PortalResources.invalidStartupCommandNodejs)
        );
        const aspNetCoreValidator = RegexValidator.create(
          new RegExp('^(dotnet)\\s+\\w+'),
          this._translateService.instant(PortalResources.invalidStartupCommandAspNetCore)
        );

        if (stack === WebAppFramework.Node) {
          this.wizard.buildSettings.get('startupCommand').setValidators([nodeValidator]);
          this.wizard.buildSettings.get('startupCommand').updateValueAndValidity();
        } else if (stack === WebAppFramework.AspNetCore) {
          this.wizard.buildSettings.get('startupCommand').setValidators([aspNetCoreValidator]);
          this.wizard.buildSettings.get('startupCommand').updateValueAndValidity();
        } else {
          this.removeValidators();
        }

        this.wizard.buildSettings.get('workingDirectory').setValidators([]);
        this.wizard.buildSettings.get('workingDirectory').updateValueAndValidity();
      });
  }

  private removeValidators() {
    this.wizard.buildSettings.get('startupCommand').setValidators([]);
    this.wizard.buildSettings.get('startupCommand').updateValueAndValidity();

    this.wizard.buildSettings.get('workingDirectory').setValidators([]);
    this.wizard.buildSettings.get('workingDirectory').updateValueAndValidity();
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
    this.removeValidators();
  }
}
