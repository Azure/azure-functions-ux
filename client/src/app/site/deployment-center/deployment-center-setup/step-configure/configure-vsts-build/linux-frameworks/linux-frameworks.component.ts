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
import { Regex } from 'app/shared/models/constants';

export const TaskRunner = {
  None: 'None',
  Gulp: 'Gulp',
  Grunt: 'Grunt',
};

export const WebAppFramework = {
  AspNetCore: 'AspNetCore',
  Node: 'Node',
  PHP: 'PHP',
  Ruby: 'Ruby',
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
export class LinuxFramworksComponent implements OnDestroy {
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
      displayLabel: 'PHP',
      value: WebAppFramework.PHP,
    },
    {
      displayLabel: 'Ruby',
      value: WebAppFramework.Ruby,
    },
  ];
  private _ngUnsubscribe$ = new Subject();

  selectedTaskRunner = this.defaultNodeTaskRunner;
  selectedFramework;
  selectedFrameworkVersion;
  nodeFrameworkVersions: DropDownElement<string>[] = [];
  dotNetCoreFrameworkVersions: DropDownElement<string>[] = [];
  phpFrameworkVersions: DropDownElement<string>[] = [];
  rubyFrameworkVersions: DropDownElement<string>[] = [];
  constructor(public wizard: DeploymentCenterStateManager, siteService: SiteService, private _translateService: TranslateService) {
    siteService.getAvailableStacks(OsType.Linux).subscribe(vals => {
      const stacks = vals.result.value;
      const rubyStack = stacks.find(x => x.name.toLowerCase() === 'ruby');
      const nodeStack = stacks.find(x => x.name.toLowerCase() === 'node');
      const phpStack = stacks.find(x => x.name.toLowerCase() === 'php');
      const dotNetCoreStack = stacks.find(x => x.name.toLowerCase() === 'dotnetcore');

      this.rubyFrameworkVersions = rubyStack.properties.majorVersions
        .map(x => {
          return x.minorVersions.map(y => {
            return {
              displayLabel: y.displayVersion,
              value: y.runtimeVersion.replace('RUBY|', ''),
            };
          });
        })
        .reduce((a, b) => {
          return a.concat(b);
        });

      this.phpFrameworkVersions = phpStack.properties.majorVersions.map(x => {
        return {
          displayLabel: x.displayVersion,
          value: x.runtimeVersion.replace('PHP|', ''),
        };
      });

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
            case 'php':
              this.selectedFramework = WebAppFramework.PHP;
              break;
            case 'ruby':
              this.selectedFramework = WebAppFramework.Ruby;
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
        const workingDirectoryValidator = RegexValidator.create(
          new RegExp(Regex.linuxWorkingDirectoryValidation),
          this._translateService.instant(PortalResources.validate_workingDirectory)
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

        if (stack != WebAppFramework.AspNetCore) {
          this.wizard.buildSettings.get('workingDirectory').setValidators([workingDirectoryValidator]);
          this.wizard.buildSettings.get('workingDirectory').updateValueAndValidity();
        } else {
          this.wizard.buildSettings.get('workingDirectory').setValidators([]);
          this.wizard.buildSettings.get('workingDirectory').updateValueAndValidity();
        }
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
