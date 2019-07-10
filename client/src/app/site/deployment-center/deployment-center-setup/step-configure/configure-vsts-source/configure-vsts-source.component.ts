import { Component } from '@angular/core';
import { DropDownElement } from 'app/shared/models/drop-down-element';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { CacheService } from 'app/shared/services/cache.service';
import { Observable } from 'rxjs/Observable';
import uniqBy from 'lodash-es/uniqBy';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { VSORepo } from 'app/site/deployment-center/Models/vso-repo';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { LogService } from 'app/shared/services/log.service';
import { LogCategories } from 'app/shared/models/constants';
import { RequiredValidator } from '../../../../../shared/validators/requiredValidator';
import { TranslateService } from '@ngx-translate/core';
import { VstsValidators } from '../../validators/vsts-validators';
import { AzureDevOpsService } from '../../wizard-logic/azure-devops.service';
import { combineLatest } from 'rxjs/observable/combineLatest';

@Component({
  selector: 'app-configure-vsts-source',
  templateUrl: './configure-vsts-source.component.html',
  styleUrls: ['./configure-vsts-source.component.scss', '../step-configure.component.scss', '../../deployment-center-setup.component.scss'],
})
export class ConfigureVstsSourceComponent implements OnDestroy {
  chosenBuildFramework: string;
  public accountList: DropDownElement<string>[];
  public projectList: DropDownElement<string>[];
  public repositoryList: DropDownElement<string>[];
  public branchList: DropDownElement<string>[];
  private _ngUnsubscribe$ = new Subject();

  private _vstsRepositories: VSORepo[];

  // Subscriptions
  private _memberIdSubscription = new Subject();
  private _accountSubscription = new Subject<string>();
  private _branchSubscription = new Subject<string>();
  private _hasAccounts$ = new ReplaySubject<boolean>();
  private _hasRepos$ = new ReplaySubject<boolean>();
  private _selectedAccount = '';
  public selectedAccount = '';
  public selectedProject = '';
  public selectedRepo = '';
  public selectedBranch = '';
  public accountListLoading = false;
  public respositoriesLoading = false;
  public branchesLoading = false;
  public hasRepos = true;
  public hasAccounts = true;
  constructor(
    public wizard: DeploymentCenterStateManager,
    private _cacheService: CacheService,
    private _logService: LogService,
    private _translateService: TranslateService,
    private _azureDevOpsService: AzureDevOpsService
  ) {
    this._hasAccounts$.next(true);
    this._hasRepos$.next(true);

    this.setupSubscriptions();
    this.populate();
    this.wizard.wizardForm.controls.buildProvider.valueChanges
      .distinctUntilChanged()
      .takeUntil(this._ngUnsubscribe$)
      .subscribe(r => {
        this.updateFormValidation();
        this.populate();
      });
  }

  private populate() {
    this._memberIdSubscription.next();
  }

  updateFormValidation() {
    if (this.wizard.wizardValues.buildProvider === 'vsts') {
      this.wizard.buildSettings
        .get('vstsProject')
        .setAsyncValidators(
          VstsValidators.createProjectPermissionsValidator(
            this.wizard,
            this._translateService,
            this._cacheService,
            this._azureDevOpsService,
            this.wizard.buildSettings.get('vstsAccount')
          ).bind(this)
        );
      this.wizard.buildSettings.get('vstsProject').updateValueAndValidity();
    } else {
    }
    const required = new RequiredValidator(this._translateService, false);
    this.wizard.sourceSettings.get('repoUrl').setValidators(required.validate.bind(required));
    this.wizard.sourceSettings.get('branch').setValidators(required.validate.bind(required));
    this.wizard.sourceSettings.get('repoUrl').updateValueAndValidity();
    this.wizard.sourceSettings.get('branch').updateValueAndValidity();
  }

  setupSubscriptions() {
    this._memberIdSubscription
      .takeUntil(this._ngUnsubscribe$)
      .do(() => (this.accountListLoading = true))
      .concatMap(() => this._azureDevOpsService.getAccounts())
      .do(() => (this.accountListLoading = false))
      .subscribe(
        r => {
          this._hasAccounts$.next(r.length > 0);

          this.accountList = r.map(account => ({
            displayLabel: account.AccountName,
            value: account.AccountName,
          }));
        },
        err => {
          this._hasAccounts$.next(false);
          this._logService.error(LogCategories.cicd, '/fetch-vso-profile-repo-data', err);
        }
      );

    this._accountSubscription
      .takeUntil(this._ngUnsubscribe$)
      .do(() => (this.respositoriesLoading = true))
      .switchMap(r => this._azureDevOpsService.getRepositoriesForAccount(r))
      .do(() => (this.respositoriesLoading = false))
      .subscribe((r: any) => {
        this._vstsRepositories = [];

        this._hasRepos$.next(r && r.value && r.value.length > 0);

        r.value.forEach(repo => {
          this._vstsRepositories.push({
            name: repo.name,
            remoteUrl: repo.remoteUrl,
            project: repo.project,
            id: repo.id,
          });
        });

        this.projectList = uniqBy(
          this._vstsRepositories.map(repo => {
            return {
              displayLabel: `${repo.project.name} (${repo.project.id})`,
              value: repo.project.name,
            };
          }),
          'value'
        );
      });

    this._branchSubscription
      .takeUntil(this._ngUnsubscribe$)
      .do(() => (this.branchesLoading = true))
      .switchMap(repoUri => {
        if (repoUri) {
          const repoObj = this._vstsRepositories.find(x => x.remoteUrl === repoUri);
          const repoId = repoObj.id;
          const account = this._selectedAccount;
          return this._azureDevOpsService.getBranchesForRepo(account, repoId);
        } else {
          return Observable.of(null);
        }
      })
      .do(() => (this.branchesLoading = false))
      .subscribe(
        r => {
          if (r) {
            const branchList = r.value;
            this.branchList = branchList.map(x => {
              const item: DropDownElement<string> = {
                displayLabel: x.name.replace('refs/heads/', ''),
                value: x.name.replace('refs/heads/', ''),
              };
              return item;
            });
          } else {
            this.branchList = [];
          }
        },
        err => {
          this.branchList = [];
          this._logService.error(LogCategories.cicd, '/fetch-vso-branches', err);
        }
      );

    combineLatest(this._hasAccounts$, this._hasRepos$)
      .takeUntil(this._ngUnsubscribe$)
      .subscribe(([hasAccounts, hasRepos]) => {
        this.hasAccounts = hasAccounts;
        this.hasRepos = hasRepos;
        this.wizard.hideConfigureStepContinueButton = !hasAccounts || !hasRepos;
        this.wizard.hideVstsBuildConfigure = !hasAccounts;
      });
  }

  get isKudu() {
    return this.wizard.wizardForm.controls.buildProvider.value === 'kudu';
  }

  openVSTSAccountCreate() {
    window.open('https://go.microsoft.com/fwlink/?linkid=2014384');
  }

  openVSTSRepoCreate() {
    window.open('https://go.microsoft.com/fwlink/?linkid=2014379');
  }

  accountChanged(accountName: DropDownElement<string>) {
    this._selectedAccount = accountName.value;
    this._accountSubscription.next(accountName.value);
    this.selectedProject = '';
    this.selectedRepo = '';
    this.branchList = [];
    this.selectedBranch = '';
  }

  projectChanged(selectedProject: DropDownElement<string>) {
    this.repositoryList = uniqBy(
      this._vstsRepositories
        .filter(r => r.project.name === selectedProject.value)
        .map(repo => {
          return {
            displayLabel: repo.name,
            value: repo.remoteUrl,
          };
        }),
      'value'
    );
    this.selectedRepo = '';
    this.branchList = [];
    this.selectedBranch = '';
  }

  repoChanged(repoUri: DropDownElement<string>) {
    const repoObj = this._vstsRepositories.find(x => x.remoteUrl === repoUri.value);
    this.wizard.selectedVstsRepoId = repoObj.id;
    this._branchSubscription.next(repoUri.value);
    this.selectedBranch = '';
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
    this.wizard.buildSettings.setAsyncValidators([]);
    this.wizard.buildSettings.updateValueAndValidity();
  }
}
