import { Component, OnDestroy } from '@angular/core';
import { SelectOption } from '../../../../../shared/models/select-option';
import { DeploymentCenterStateManager } from '../../wizard-logic/deployment-center-state-manager';
import { Subject } from 'rxjs/Subject';
import { UserService } from '../../../../../shared/services/user.service';
import { CacheService } from '../../../../../shared/services/cache.service';
import { Observable } from 'rxjs/Observable';
import { VSOAccount, VsoProject } from '../../../Models/vso-repo';
import { Headers } from '@angular/http';
// import { switchMap } from 'rxjs/operator/switchMap';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { DropDownElement } from '../../../../../shared/models/drop-down-element';
import { LogService } from '../../../../../shared/services/log.service';
import { LogCategories } from '../../../../../shared/models/constants';
// import { TranslateService } from '@ngx-translate/core';
// import { PortalResources } from '../../../../../shared/models/portal-resources';

export const TaskRunner = {
  None: 'None',
  Gulp: 'Gulp',
  Grunt: 'Grunt'
};

export const WebAppFramework = {
  AspNetWap: 'AspNetWap',
  AspNetCore: 'AspNetCore',
  Node: 'Node',
  PHP: 'PHP',
  Python: 'Python',
  StaticWebapp: 'StaticWebapp'
};

export class VSTSRepository {
  name: string;
  account: string;
  remoteUrl: string;
  projectName: string;
  id: string;
}

@Component({
  selector: 'app-configure-vsts-build',
  templateUrl: './configure-vsts-build.component.html',
  styleUrls: ['./configure-vsts-build.component.scss', '../step-configure.component.scss']
})
export class ConfigureVstsBuildComponent implements OnDestroy {

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
    { value: 'python361x64', displayLabel: 'Python 3.6.1 x64' }
  ];

  pythonFrameworkList: DropDownElement<string>[] = [
    { value: 'Bottle', displayLabel: 'Bottle' },
    { value: 'Django', displayLabel: 'Django' },
    { value: 'Flask', displayLabel: 'Flask' }
  ];

  WebApplicationFrameworks: DropDownElement<string>[] = [
    {
      displayLabel: 'ASP.NET',
      value: WebAppFramework.AspNetWap
    },
    {
      displayLabel: 'ASP.NET Core',
      value: WebAppFramework.AspNetCore
    },
    {
      displayLabel: 'Node.JS',
      value: WebAppFramework.Node
    },
    {
      displayLabel: 'PHP',
      value: WebAppFramework.PHP
    },
    {
      displayLabel: 'Python',
      value: WebAppFramework.Python
    },
    {
      displayLabel: 'Static Webapp',
      value: WebAppFramework.StaticWebapp
    }
  ];

  private token: string;
  public NewVsoAccountOptions: SelectOption<string>[];
  private _ngUnsubscribe = new Subject();

  // https://app.vssps.visualstudio.com/_apis/commerce/regions
  public vstsRegionList = [];
  public AccountList: DropDownElement<string>[];
  public ProjectList: DropDownElement<string>[];
  public LocationList: DropDownElement<string>[];

  private vsoAccountToProjectMap: { [key: string]: DropDownElement<string>[] } = {};

  selectedAccount = '';
  selectedProject = '';
  selectedLocation = '';
  selectedFramework = WebAppFramework.AspNetWap;
  selectedPythonVersion = this.recommendedPythonVersion;
  selectedPythonFramework = 'Bottle';
  selectedTaskRunner = 'None';
  // projects https://admetrics.visualstudio.com/DefaultCollection/_apis/projects?includeCapabilities=true
  // https://admetrics.vsrm.visualstudio.com/_apis/Release
  // https://admetrics.vsrm.visualstudio.com/c6f597f2-902e-47df-9dbd-f5ee1ac627f2/_apis/Release/definitions/environmenttemplates
  // https://app.vssps.visualstudio.com/_AzureSpsAccount/ValidateAccountName?accountName=test3320

  constructor(
    // private _translateService: TranslateService
    private _cacheService: CacheService,
    public wizard: DeploymentCenterStateManager,
    private _userService: UserService,
    private _logService: LogService
  ) {
    this._userService.getStartupInfo().takeUntil(this._ngUnsubscribe).subscribe(r => {
      this.token = r.token;
    });

    this.NewVsoAccountOptions =
      [{ displayLabel: 'New', value: 'new' },
      { displayLabel: 'Existing', value: 'existing' }];

    this.setupSubscriptions();
    const val = this.wizard.wizardValues;
    val.buildSettings.createNewVsoAccount = 'existing';
    this.wizard.wizardValues = val;
  }

  private setupSubscriptions() {

    this._cacheService.get('https://app.vssps.visualstudio.com/_apis/profile/profiles/me')
      .map(r => r.json())
      .switchMap(r => this.fetchAccounts(r.id))
      .switchMap(r => {
        this.AccountList =
          r.map(account => {
            return {
              displayLabel: account.accountName,
              value: account.accountName
            };
          });
        const projectCalls: Observable<{ account: string, projects: VsoProject[] }>[] = [];
        r.forEach(account => {
          projectCalls.push(
            this._cacheService
              .get(`https://${account.accountName}.visualstudio.com/DefaultCollection/_apis/projects?includeCapabilities=true`, true, this.getHeaders())
              .map(res => {
                return {
                  account: account.accountName,
                  projects: res.json().value
                };
              }));
        });
        return forkJoin(projectCalls);
      })
      .subscribe(
        r => {
          this.vsoAccountToProjectMap = {};
          r.forEach(projectList => {
            this.vsoAccountToProjectMap[projectList.account] = projectList.projects.map(project => {
              return {
                displayLabel: project.name,
                value: project.name
              };
            });
          });

        },
        err => {
          this._logService.error(LogCategories.cicd, '/fetch-vso-profile-repo-data', err);
        }
      );

    this._cacheService.get('https://app.vssps.visualstudio.com/_apis/commerce/regions', true, this.getHeaders())
      .subscribe(r => {
        const locationArray: any[] = r.json().value;
        this.LocationList = locationArray.map(v => {
          return {
            displayLabel: v.displayName,
            value: v.id
          };
        });
      },
        err => {
          this._logService.error(LogCategories.cicd, '/fetch-vso-available-locations', err);
        });
  }

  private fetchAccounts(memberId: string): Observable<VSOAccount[]> {
    const accountsUrl = `https://app.vssps.visualstudio.com/_apis/Commerce/Subscription?memberId=${memberId}&includeMSAAccounts=true&queryOnlyOwnerAccounts=false&inlcudeDisabledAccounts=false&includeMSAAccounts=true&providerNamespaceId=VisualStudioOnline`;
    return this._cacheService.get(accountsUrl, true, this.getHeaders()).switchMap(r => {
      const accounts = r.json().value as VSOAccount[];
      if (this.wizard.wizardForm.controls.buildProvider.value === 'kudu') {
        return Observable.of(accounts.filter(x => x.isAccountOwner));
      } else {
        return Observable.of(accounts);
      }
    });
  }

  get getFramework() {
    return this.selectedPythonFramework;
  }
  accountChanged(accountName: DropDownElement<string>) {
    this.ProjectList = this.vsoAccountToProjectMap[accountName.value];
    this.selectedProject = '';
  }

  private getHeaders(): Headers {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Authorization', `Bearer ${this.token}`);
    headers.append('X-VSS-ForceMsaPassThrough', 'true');
    return headers;
  }
  ngOnDestroy(): void {
    this._ngUnsubscribe.next();
  }
}
