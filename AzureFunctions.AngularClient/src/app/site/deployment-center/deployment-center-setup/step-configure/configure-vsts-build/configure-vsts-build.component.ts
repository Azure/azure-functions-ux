import { Component, OnDestroy } from '@angular/core';
import { SelectOption } from '../../../../../shared/models/select-option';
import { DeploymentCenterStateManager } from '../../wizard-logic/deployment-center-state-manager';
import { Subject } from 'rxjs/Subject';
import { UserService } from '../../../../../shared/services/user.service';
import { CacheService } from '../../../../../shared/services/cache.service';
import { Observable } from 'rxjs/Observable';
import { VSOAccount,  VsoProject } from '../../../Models/vso-repo';
import { Headers } from '@angular/http';
// import { switchMap } from 'rxjs/operator/switchMap';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { DropDownElement } from '../../../../../shared/models/drop-down-element';
import { LogService } from '../../../../../shared/services/log.service';
import { LogCategories } from '../../../../../shared/models/constants';
// import { TranslateService } from '@ngx-translate/core';
// import { PortalResources } from '../../../../../shared/models/portal-resources';

// const recommendedPythonVersion = { value: 'python353x86', text: 'Python 3.5.3 x86' };

// const pythonVersionList = [
//   { value: 'python2712x64', text: 'Python 2.7.12 x64' },
//   { value: 'python2712x86', text: 'Python 2.7.12 x86' },
//   { value: 'python2713x64', text: 'Python 2.7.13 x64' },
//   { value: 'python2713x86', text: 'Python 2.7.13 x86' },
//   { value: 'python353x64', text: 'Python 3.5.3 x64' },
//   { value: 'python353x86', text: 'Python 3.5.3 x86' }, // Recommended version
//   { value: 'python360x86', text: 'Python 3.6.0 x86' },
//   { value: 'python360x64', text: 'Python 3.6.0 x64' },
//   { value: 'python361x86', text: 'Python 3.6.1 x86' },
//   { value: 'python361x64', text: 'Python 3.6.1 x64' }
// ];

@Component({
  selector: 'app-configure-vsts-build',
  templateUrl: './configure-vsts-build.component.html',
  styleUrls: ['./configure-vsts-build.component.scss', '../step-configure.component.scss']
})
export class ConfigureVstsBuildComponent implements OnDestroy {

  private token: string;
  public NewVsoAccountOptions: SelectOption<string>[];
  private _ngUnsubscribe = new Subject();

  // https://app.vssps.visualstudio.com/_apis/commerce/regions
  public vstsRegionList = [];
  public AccountList: DropDownElement<string>[];
  public ProjectList: DropDownElement<string>[];
  public LocationList: DropDownElement<string>[];
  
  private vsoAccountToProjectMap: { [key: string]: DropDownElement<string>[] } = {};

  public selectedAccount = '';
  public selectedProject = '';
  public selectedLocation = '';
  // projects https://admetrics.visualstudio.com/DefaultCollection/_apis/projects?includeCapabilities=true
  // https://admetrics.vsrm.visualstudio.com/_apis/Release
  // https://admetrics.vsrm.visualstudio.com/c6f597f2-902e-47df-9dbd-f5ee1ac627f2/_apis/Release/definitions/environmenttemplates

  private _memberIdSubscription = new Subject();





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
    this.populate();
  }

  private populate() {
    this._memberIdSubscription.next();
}

  private setupSubscriptions() {
    this._memberIdSubscription
      .takeUntil(this._ngUnsubscribe)
      .switchMap(() => this._cacheService.get('https://app.vssps.visualstudio.com/_apis/profile/profiles/me'))
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
        const projectCalls: Observable<{account: string, projects: VsoProject[]}>[] = [];
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
