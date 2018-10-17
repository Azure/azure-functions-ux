import { Component, OnDestroy } from '@angular/core';
import { DeploymentCenterStateManager } from '../../../wizard-logic/deployment-center-state-manager';
import { Subject } from 'rxjs/Subject';
import { DropDownElement } from '../../../../../../shared/models/drop-down-element';
import { SiteService } from '../../../../../../shared/services/site.service';
import { AvailableStacksOsType } from '../../../../../../shared/models/arm/stacks';

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
  selectedFramework = '';
  selectedFrameworkVersion = '';
  nodeFrameworkVersions: DropDownElement<string>[] = [];
  dotNetCoreFrameworkVersions: DropDownElement<string>[] = [];
  phpFrameworkVersions: DropDownElement<string>[] = [];
  rubyFrameworkVersions: DropDownElement<string>[] = [];
  constructor(public wizard: DeploymentCenterStateManager, siteService: SiteService) {
    siteService.getAvailableStacks(AvailableStacksOsType.Linux).subscribe(vals => {
      const stacks = vals.result.value;
      const rubyStack = stacks.find(x => x.name.toLowerCase() === 'ruby');
      const nodeStack = stacks.find(x => x.name.toLowerCase() === 'node');
      const phpStack = stacks.find(x => x.name.toLowerCase() === 'php');
      const dotNetCoreStack = stacks.find(x => x.name.toLowerCase() === 'dotnetcore');
      this.rubyFrameworkVersions = rubyStack.properties.majorVersions.map(x => {
        return {
          displayLabel: x.displayVersion,
          value: x.runtimeVersion.replace('RUBY|', ''),
        };
      });

      this.phpFrameworkVersions = phpStack.properties.majorVersions.map(x => {
        return {
          displayLabel: x.displayVersion,
          value: x.runtimeVersion.replace('PHP|', ''),
        };
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
          value: x.runtimeVersion.replace('DOTNET|', ''),
        };
      });

      this.wizard.siteArmObj$.subscribe(site => {
        const linuxFxVersionObj = site.properties.siteProperties.properties.find(x => x.name === 'LinuxFxVersion');
        if (linuxFxVersionObj) {
          const linuxFxVersion = linuxFxVersionObj.value.split('|');
          const stack = linuxFxVersion[0];
          const version = linuxFxVersion[1];
          this.selectedFramework = stack;
          this.selectedFrameworkVersion = version;
        }
      });
    });
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
  }
}
