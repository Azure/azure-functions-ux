import { Component, OnDestroy } from '@angular/core';
import { DeploymentCenterStateManager } from '../../../wizard-logic/deployment-center-state-manager';
import { Subject } from 'rxjs/Subject';
import { DropDownElement } from '../../../../../../shared/models/drop-down-element';
import { SiteService } from '../../../../../../shared/services/site.service';
import { OsType } from 'app/shared/models/arm/stacks';
import { RegexValidator } from 'app/shared/validators/regexValidator';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from 'app/shared/models/portal-resources';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';

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
  nodeJsTaskRunners: DropDownElement<string>[] = [
    { value: 'gulp', displayLabel: 'Gulp' },
    { value: 'grunt', displayLabel: 'Grunt' },
    { value: 'none', displayLabel: 'None' },
  ];

  aspNetCoreVersions: DropDownElement<string>[] = [
    { value: 'gulp', displayLabel: 'Gulp' },
    { value: 'grunt', displayLabel: 'Grunt' },
    { value: 'none', displayLabel: 'None' },
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
      const stacks = vals.result.value;
      const nodeStack = stacks.find(x => x.name.toLowerCase() === 'node');
      const dotNetCoreStack = stacks.find(x => x.name.toLowerCase() === 'dotnetcore');
      const pythonStack = stacks.find(x => x.name.toLowerCase() === 'python');

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
      this.wizard.siteArmObj$.takeUntil(this._ngUnsubscribe$).subscribe(site => {
        const linuxFxVersionObj = site.properties.siteProperties.properties.find(x => x.name === 'LinuxFxVersion');
        if (linuxFxVersionObj) {
          const linuxFxVersion = linuxFxVersionObj.value.split('|');
          const stack = linuxFxVersion[0];
          const version = linuxFxVersion[1];
          switch (stack.toLowerCase()) {
            case 'node':
              this.selectedFramework = WebAppFramework.Node;
              break;
            case 'dotnetcore':
              this.selectedFramework = WebAppFramework.AspNetCore;
              break;
            case 'python':
              this.selectedFramework = WebAppFramework.Python;
              break;
          }
          this.selectedFrameworkVersion = version;
        }
      });
    });
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
