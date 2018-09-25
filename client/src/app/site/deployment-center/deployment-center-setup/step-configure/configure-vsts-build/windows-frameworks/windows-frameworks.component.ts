import { Component, OnDestroy } from '@angular/core';
import { DeploymentCenterStateManager } from '../../../wizard-logic/deployment-center-state-manager';
import { Subject } from 'rxjs/Subject';
import { DropDownElement } from '../../../../../../shared/models/drop-down-element';

export const TaskRunner = {
  None: 'None',
  Gulp: 'Gulp',
  Grunt: 'Grunt',
};

export const WebAppFramework = {
  AspNetWap: 'AspNetWap',
  AspNetCore: 'AspNetCore',
  Node: 'Node',
  PHP: 'PHP',
  Python: 'Python',
  StaticWebapp: 'StaticWebapp',
};

@Component({
  selector: 'app-windows-frameworks',
  templateUrl: './windows-frameworks.component.html',
  styleUrls: ['./windows-frameworks.component.scss', '../../step-configure.component.scss', '../../../deployment-center-setup.component.scss'],
})
export class WindowsFramworksComponent implements OnDestroy {

  defaultNodeTaskRunner = 'none';
  nodeJsTaskRunners: DropDownElement<string>[] = [
    { value: 'gulp', displayLabel: 'Gulp' },
    { value: 'grunt', displayLabel: 'Grunt' },
    { value: 'none', displayLabel: 'None' },
  ];

  recommendedPythonVersion = 'python353x86';
  pythonVersionList: DropDownElement<string>[] = [
    { value: 'python2712x64', displayLabel: 'Python 2.7.12 x64' },
    { value: 'python2712x86', displayLabel: 'Python 2.7.12 x86' },
    { value: 'python2713x64', displayLabel: 'Python 2.7.13 x64' },
    { value: 'python2713x86', displayLabel: 'Python 2.7.13 x86' },
    { value: 'python353x64', displayLabel: 'Python 3.5.3 x64' },
    { value: 'python353x86', displayLabel: 'Python 3.5.3 x86' }, // Recommended version
    { value: 'python360x86', displayLabel: 'Python 3.6.0 x86' },
    { value: 'python360x64', displayLabel: 'Python 3.6.0 x64' },
    { value: 'python361x86', displayLabel: 'Python 3.6.1 x86' },
    { value: 'python361x64', displayLabel: 'Python 3.6.1 x64' },
  ];

  defaultPythonFramework = 'Bottle';
  pythonFrameworkList: DropDownElement<string>[] = [
    { value: 'Bottle', displayLabel: 'Bottle' },
    { value: 'Django', displayLabel: 'Django' },
    { value: 'Flask', displayLabel: 'Flask' },
  ];

  webApplicationFrameworks: DropDownElement<string>[] = [
    {
      displayLabel: 'ASP.NET',
      value: WebAppFramework.AspNetWap,
    },
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
      displayLabel: 'Python',
      value: WebAppFramework.Python,
    },
    {
      displayLabel: 'Static Webapp',
      value: WebAppFramework.StaticWebapp,
    },
  ];

  private _ngUnsubscribe$ = new Subject();

  selectedFramework = WebAppFramework.AspNetWap;
  selectedPythonVersion = this.recommendedPythonVersion;
  selectedPythonFramework = this.defaultPythonFramework;
  selectedTaskRunner = this.defaultNodeTaskRunner;

  constructor(
    public wizard: DeploymentCenterStateManager,
  ) {}

  get getFramework() {
    return this.selectedPythonFramework;
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
  }
}
