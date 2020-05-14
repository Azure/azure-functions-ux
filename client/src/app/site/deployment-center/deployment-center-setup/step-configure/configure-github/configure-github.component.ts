import { Component } from '@angular/core';
import { DropDownElement } from 'app/shared/models/drop-down-element';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { LogCategories, DeploymentCenterConstants } from 'app/shared/models/constants';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { LogService } from 'app/shared/services/log.service';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';
import { RequiredValidator } from '../../../../../shared/validators/requiredValidator';
import { Url } from '../../../../../shared/Utilities/url';
import { ResponseHeader } from 'app/shared/Utilities/response-header';
import { GithubService } from '../../wizard-logic/github.service';
import { GitHubBranchSummary } from 'app/site/deployment-center/Models/github';
import { PortalResources } from 'app/shared/models/portal-resources';
import { WorkflowOptions } from '../../../Models/deployment-enums';

@Component({
  selector: 'app-configure-github',
  templateUrl: './configure-github.component.html',
  styleUrls: ['./configure-github.component.scss', '../step-configure.component.scss', '../../deployment-center-setup.component.scss'],
})
export class ConfigureGithubComponent implements OnDestroy {
  public OrgList: DropDownElement<string>[] = [];
  public RepoList: DropDownElement<string>[] = [];
  public BranchList: DropDownElement<string>[] = [];
  public WorkflowOptionList: DropDownElement<string>[] = [];
  public reposLoading = false;
  public branchesLoading = false;
  public permissionInfoLink = DeploymentCenterConstants.permissionsInfoLink;
  public selectedOrg = '';
  public selectedRepo = '';
  public selectedBranch = '';
  public workflowFileExistsWarningMessage = '';
  public selectedWorkflowOption = '';
  public showStackSelector = true;
  public protectedBranchSelected = false;
  public protectedBranchSelectedLink = DeploymentCenterConstants.protectedBranchSelectedLink;

  private _repoUrlToNameMap: { [key: string]: string } = {};
  private _buildProvider: string;
  private _reposStream$ = new ReplaySubject<string>();
  private _orgStream$ = new ReplaySubject<string>();
  private _ngUnsubscribe$ = new Subject();
  private _branches: GitHubBranchSummary[] = [];

  constructor(
    public wizard: DeploymentCenterStateManager,
    private _logService: LogService,
    private _translateService: TranslateService,
    private _githubService: GithubService
  ) {
    this._logService.trace(LogCategories.cicd, '/configure-github', { resourceId: this.wizard.siteArm.id });

    this._orgStream$.takeUntil(this._ngUnsubscribe$).subscribe(r => {
      this.reposLoading = true;
      this.fetchRepos(r);
    });
    this._reposStream$.takeUntil(this._ngUnsubscribe$).subscribe(r => {
      this.branchesLoading = true;
      this.fetchBranches(r);
    });

    this.fetchOrgs();
    this.updateFormValidation();

    this.WorkflowOptionList = [
      {
        displayLabel: this._translateService.instant(PortalResources.githubActionWorkflowOptionOverwrite),
        value: WorkflowOptions.Overwrite,
      },
      {
        displayLabel: this._translateService.instant(PortalResources.githubActionWorkflowOptionUseExisting),
        value: WorkflowOptions.UseExisting,
      },
    ];

    // if auth changes then this will force refresh the config data
    this.wizard.updateSourceProviderConfig$.takeUntil(this._ngUnsubscribe$).subscribe(r => {
      this.fetchOrgs();
    });
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
  }

  get buildProvider() {
    const values = this.wizard.wizardValues;
    const buildProvider = values && values.buildProvider;
    if (buildProvider !== this._buildProvider) {
      this._buildProvider = buildProvider;
      this.wizard.resetSection(this.wizard.buildSettings);
    }
    return buildProvider;
  }

  fetchOrgs() {
    return Observable.zip(
      this._githubService.fetchOrgs(this.wizard.getToken()),
      this._githubService.fetchUser(this.wizard.getToken()),
      (orgs, user) => ({
        orgs: orgs.json(),
        user: user.json(),
      })
    ).subscribe(r => {
      const newOrgsList: DropDownElement<string>[] = [];
      newOrgsList.push({
        displayLabel: r.user.login,
        value: r.user.repos_url,
      });

      r.orgs.forEach(org => {
        newOrgsList.push({
          displayLabel: org.login,
          value: org.url,
        });
      });
      this.OrgList = newOrgsList;

      if (this.OrgList && this.OrgList.length === 1) {
        this.selectedOrg = this.OrgList[0].value;
        this.OrgChanged(this.OrgList[0]);
      }
    });
  }

  fetchRepos(org: string) {
    if (org) {
      let fetchListCall: Observable<any[]> = null;
      this.RepoList = [];
      this.BranchList = [];

      // This branch is to handle the differences between getting a users personal repos and getting repos for a specific org such as Azure
      // The API handles these differently but the UX shows them the same
      fetchListCall = org.toLocaleLowerCase().indexOf('github.com/users/') > -1 ? this._fetchUserRepos(org) : this._fetchOrgRepos(org);

      fetchListCall
        .switchMap(r => this._flattenResponses<any>(r))
        .subscribe(
          r => this._loadRepositories(r),
          err => {
            this.reposLoading = false;
            this._logService.error(LogCategories.cicd, '/configure-github-fetch-github-repos', {
              resourceId: this.wizard.siteArm.id,
              error: err,
            });
          }
        );
    }
  }

  fetchBranches(repo: string) {
    if (repo) {
      this.BranchList = [];
      this._githubService
        .fetchBranches(this.wizard.getToken(), repo, this._repoUrlToNameMap[repo])
        .switchMap(r => {
          const linkHeader = r.headers.toJSON().link;
          const pageCalls: Observable<any>[] = [Observable.of(r)];
          if (linkHeader) {
            const links = ResponseHeader.getLinksFromLinkHeader(linkHeader);
            const lastPageNumber = this._getLastPage(links);
            for (let i = 2; i <= lastPageNumber; i++) {
              pageCalls.push(this._githubService.fetchBranches(this.wizard.getToken(), repo, this._repoUrlToNameMap[repo], i));
            }
          }
          return Observable.forkJoin(pageCalls);
        })
        .switchMap(r => this._flattenResponses<GitHubBranchSummary>(r))
        .subscribe(
          r => this._loadBranches(r),
          err => {
            this._logService.error(LogCategories.cicd, '/configure-github-fetch-github-branches', {
              resourceId: this.wizard.siteArm.id,
              error: err,
            });
            this.branchesLoading = false;
          }
        );
    }
  }

  checkWorkflowFileExists() {
    if (this.selectedRepo && this.selectedBranch) {
      const workflowFileName = this._githubService.getWorkflowFileName(this.selectedBranch, this.wizard.siteName, this.wizard.slotName);
      const workflowFilePath = `.github/workflows/${workflowFileName}`;
      this.workflowFileExistsWarningMessage = '';
      this.selectedWorkflowOption = '';
      this.showStackSelector = true;
      this.wizard.sourceSettings.get('githubActionWorkflowOption').setValue('');
      this.wizard.sourceSettings.get('githubActionWorkflowOption').setValidators([]);
      this.wizard.sourceSettings.get('githubActionWorkflowOption').updateValueAndValidity();
      this.wizard.sourceSettings.get('githubActionExistingWorkflowContents').setValue('');
      this.wizard.hideConfigureStepContinueButton = true;

      Observable.zip(
        this._githubService.fetchAllWorkflowConfigurations(
          this.wizard.getToken(),
          this.selectedRepo,
          this._repoUrlToNameMap[this.selectedRepo],
          this.selectedBranch
        ),
        this._githubService.fetchWorkflowConfiguration(
          this.wizard.getToken(),
          this.selectedRepo,
          this._repoUrlToNameMap[this.selectedRepo],
          this.selectedBranch,
          workflowFilePath
        )
      ).subscribe(results => {
        this.wizard.hideConfigureStepContinueButton = false;
        const [allWorkflowConfigurations, appWorkflowConfiguration] = results;

        if (appWorkflowConfiguration) {
          this.workflowFileExistsWarningMessage = this._translateService.instant(PortalResources.githubActionWorkflowFileExists, {
            workflowFilePath: workflowFilePath,
            branchName: this.selectedBranch,
          });

          this.wizard.sourceSettings.get('githubActionExistingWorkflowContents').setValue(atob(appWorkflowConfiguration.content));
        } else if (allWorkflowConfigurations && allWorkflowConfigurations.length > 0) {
          this.workflowFileExistsWarningMessage = this._translateService.instant(PortalResources.githubActionWorkflowsExist, {
            branchName: this.selectedBranch,
          });

          this.wizard.sourceSettings.get('githubActionExistingWorkflowContents').setValue('');
        }

        if (appWorkflowConfiguration || (allWorkflowConfigurations && allWorkflowConfigurations.length > 0)) {
          const required = new RequiredValidator(this._translateService, false);
          this.wizard.sourceSettings.get('githubActionWorkflowOption').setValidators(required.validate.bind(required));
          this.wizard.sourceSettings.get('githubActionWorkflowOption').updateValueAndValidity();
        }
      });
    }
  }

  updateFormValidation() {
    const required = new RequiredValidator(this._translateService, false);
    this.wizard.sourceSettings.get('repoUrl').setValidators(required.validate.bind(required));
    this.wizard.sourceSettings.get('branch').setValidators(required.validate.bind(required));
    this.wizard.sourceSettings.get('repoUrl').updateValueAndValidity();
    this.wizard.sourceSettings.get('branch').updateValueAndValidity();
  }

  RepoChanged(repo: DropDownElement<string>) {
    this._reposStream$.next(repo.value);
    this.selectedBranch = '';
    this._branches = [];
    this.protectedBranchSelected = false;
    this.workflowFileExistsWarningMessage = '';
  }

  OrgChanged(org: DropDownElement<string>) {
    this._orgStream$.next(org.value);
    this.selectedRepo = '';
    this.selectedBranch = '';
    this._branches = [];
    this.protectedBranchSelected = false;
    this.workflowFileExistsWarningMessage = '';
  }

  BranchChanged(branchSelection: DropDownElement<string>) {
    // NOTE(michinoy): In case of github action, check to see if the workflow file already exists.
    if (this.wizard.wizardValues.sourceProvider === 'github' && this.wizard.wizardValues.buildProvider === 'github') {
      const branch = this._branches.find(branch => branch.name === branchSelection.value);
      this.protectedBranchSelected = branch && branch.protected;
      this.checkWorkflowFileExists();
    }
  }

  WorkflowOptionChanged(option: DropDownElement<string>) {
    this._logService.trace(LogCategories.cicd, '/configure-github-action-workflow-option', {
      resourceId: this.wizard.siteArm.id,
      workflowOption: option.value,
    });
    this.showStackSelector = !this.selectedWorkflowOption || this.selectedWorkflowOption === WorkflowOptions.Overwrite;
  }

  private _loadBranches(branches: GitHubBranchSummary[]) {
    const newBranchList: DropDownElement<string>[] = [];
    this._branches = branches;
    this._branches.forEach(branch => {
      newBranchList.push({
        displayLabel: branch.name,
        value: branch.name,
      });
    });

    this.BranchList = newBranchList;
    this.branchesLoading = false;

    if (this.BranchList && this.BranchList.length === 1) {
      this.selectedBranch = this.BranchList[0].value;
      this.BranchChanged(this.BranchList[0]);
    }
  }

  private _loadRepositories(responses: any[]) {
    const newRepoList: DropDownElement<string>[] = [];
    this._repoUrlToNameMap = {};
    responses.forEach(repo => {
      // NOTE (michinoy): For either user repos or org repos, the user must have admin access to the repo
      // this will allow us to register a webhook with that repo.
      if (!repo.permissions || repo.permissions.admin) {
        newRepoList.push({
          displayLabel: repo.name,
          value: repo.html_url,
        });
        this._repoUrlToNameMap[repo.html_url] = repo.full_name;
      }
    });

    this.RepoList = newRepoList;
    this.reposLoading = false;

    if (this.RepoList && this.RepoList.length === 1) {
      this.selectedRepo = this.RepoList[0].value;
      this.RepoChanged(this.RepoList[0]);
    }
  }

  private _flattenResponses<T>(responses: any[]): Observable<T[]> {
    let ret: T[] = [];
    responses.forEach(e => {
      ret = ret.concat(<T>e.json());
    });
    return Observable.of(ret);
  }

  private _fetchUserRepos(org: string) {
    return this._githubService.fetchUserRepos(this.wizard.getToken(), org, null, true).switchMap(r => {
      const linkHeader = r.headers.toJSON().link;
      const pageCalls: Observable<any>[] = [Observable.of(r)];
      if (linkHeader) {
        const links = ResponseHeader.getLinksFromLinkHeader(linkHeader);
        const lastPageNumber = this._getLastPage(links);
        for (let i = 2; i <= lastPageNumber; i++) {
          pageCalls.push(this._githubService.fetchUserRepos(this.wizard.getToken(), org, i, true));
        }
      }
      return Observable.forkJoin(pageCalls);
    });
  }

  private _fetchOrgRepos(org: string) {
    return this._githubService.fetchOrgRepos(this.wizard.getToken(), org).switchMap(r => {
      const linkHeader = r.headers.toJSON().link;
      const pageCalls: Observable<any>[] = [Observable.of(r)];
      if (linkHeader) {
        const links = ResponseHeader.getLinksFromLinkHeader(linkHeader);
        const lastPageNumber = this._getLastPage(links);
        for (let i = 2; i <= lastPageNumber; i++) {
          pageCalls.push(this._githubService.fetchOrgRepos(this.wizard.getToken(), org, i));
        }
      }
      return Observable.forkJoin(pageCalls);
    });
  }

  private _getLastPage(links) {
    const lastPageLink = links && links.last;
    if (lastPageLink) {
      const lastPageNumber = +Url.getParameterByName(lastPageLink, 'page');
      return lastPageNumber;
    } else {
      return 1;
    }
  }
}
