import { Component, OnDestroy } from '@angular/core';
import { DropDownElement } from 'app/shared/models/drop-down-element';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { CacheService } from 'app/shared/services/cache.service';
import { Constants, LogCategories, DeploymentCenterConstants } from 'app/shared/models/constants';
import { LogService } from 'app/shared/services/log.service';
import { Subject } from 'rxjs/Subject';
import { RequiredValidator } from '../../../../../shared/validators/requiredValidator';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/observable/forkJoin';

@Component({
  selector: 'app-configure-bitbucket',
  templateUrl: './configure-bitbucket.component.html',
  styleUrls: ['./configure-bitbucket.component.scss', '../step-configure.component.scss', '../../deployment-center-setup.component.scss'],
})
export class ConfigureBitbucketComponent implements OnDestroy {
  public OrgList: DropDownElement<string>[] = [];
  public RepoList: DropDownElement<string>[] = [];
  public BranchList: DropDownElement<string>[] = [];
  public bitbucketInfoboxMessageLink = DeploymentCenterConstants.permissionsInfoLink;
  private _orgRepoMap: { [key: string]: DropDownElement<string>[] };
  private _reposStream$ = new Subject<string>();
  private _ngUnsubscribe$ = new Subject();
  private _repoUrlToNameMap: { [key: string]: string } = {};

  selectedOrg = null;
  selectedRepo = null;
  selectedBranch = null;

  public reposLoading = false;
  public branchesLoading = false;
  public orgsLoading = false;

  constructor(
    public wizard: DeploymentCenterStateManager,
    private _cacheService: CacheService,
    private _logService: LogService,
    private _translateService: TranslateService
  ) {
    this._reposStream$.takeUntil(this._ngUnsubscribe$).subscribe(r => {
      this.fetchBranches(r);
    });
    this.fetchOrgsAndRepos();
    this.updateFormValidation();

    // TODO, Travih use map instead of push and move pagelen to const
    // if auth changes then this will force refresh the config data
    this.wizard.updateSourceProviderConfig$.takeUntil(this._ngUnsubscribe$).subscribe(r => {
      this.fetchOrgsAndRepos();
    });
  }

  updateFormValidation() {
    const required = new RequiredValidator(this._translateService, false);
    this.wizard.sourceSettings.get('repoUrl').setValidators(required.validate.bind(required));
    this.wizard.sourceSettings.get('branch').setValidators(required.validate.bind(required));
    this.wizard.sourceSettings.get('repoUrl').updateValueAndValidity();
    this.wizard.sourceSettings.get('branch').updateValueAndValidity();
  }

  fetchOrgsAndRepos() {
    this.OrgList = [];
    this.orgsLoading = true;
    const repos = [];
    const repoCalls = this._cacheService
      .post(Constants.serviceHost + `api/bitbucket/passthrough?repo=`, true, null, {
        url: `${DeploymentCenterConstants.bitbucketApiUrl}/repositories?pagelen=100&role=contributor`,
        bitBucketToken: this.wizard.bitBucketToken,
      })
      .first()
      .expand(value => {
        const page = value.json();
        page.values.forEach(repo => {
          repos.push(repo);
        });
        if (!page.next) {
          return Observable.empty();
        } else {
          return this._cacheService.post(Constants.serviceHost + `api/bitbucket/passthrough?repo=`, true, null, {
            url: page.next,
            bitBucketToken: this.wizard.bitBucketToken,
          });
        }
      });
    this._repoUrlToNameMap = {};
    forkJoin(repoCalls).subscribe(
      v => {
        this._orgRepoMap = repos.reduce((acc, repo) => {
          const repoNamePieces = repo.full_name.split('/');
          const repoUrl = `${DeploymentCenterConstants.bitbucketUrl}/${repo.full_name}`;
          this._repoUrlToNameMap[repoUrl] = repo.full_name;
          const repoVal = {
            displayLabel: repo.name,
            value: repoUrl,
          };
          if (acc[repoNamePieces[0]]) {
            acc[repoNamePieces[0]].push(repoVal);
          } else {
            acc[repoNamePieces[0]] = [repoVal];
          }
          return acc;
        }, {});
        const orgNames = new Set(Object.keys(this._orgRepoMap));
        this.OrgList = [...orgNames].map(x => ({
          displayLabel: x,
          value: x,
        }));
        this.orgsLoading = false;
      },
      err => {
        this._logService.error(LogCategories.cicd, '/fetch-bitbucket-branches', err);
        this.orgsLoading = false;
      }
    );
  }

  fetchRepos(team: string) {
    this.RepoList = this._orgRepoMap[team];
  }

  fetchBranches(repo: string) {
    this.branchesLoading = true;
    this.BranchList = [];
    const newBranchList: DropDownElement<string>[] = [];
    Observable.forkJoin(
      this._cacheService
        .post(Constants.serviceHost + `api/bitbucket/passthrough?branch=${repo}`, true, null, {
          url: `${DeploymentCenterConstants.bitbucketApiUrl}/repositories/${repo}/refs/branches?pagelen=100`,
          bitBucketToken: this.wizard.bitBucketToken,
        })
        .expand(value => {
          const page = value.json();
          page.values.forEach(branch => {
            newBranchList.push({
              displayLabel: branch.name,
              value: branch.name,
            });
          });
          if (!page.next) {
            return Observable.empty();
          } else {
            return this._cacheService.post(Constants.serviceHost + `api/bitbucket/passthrough?repo=`, true, null, {
              url: page.next,
              bitBucketToken: this.wizard.bitBucketToken,
            });
          }
        })
    ).subscribe(
      r => {
        this.branchesLoading = false;
        this.BranchList = newBranchList;
      },
      err => {
        this.branchesLoading = false;
        this._logService.error(LogCategories.cicd, '/fetch-bitbucket-branches', err);
      }
    );
  }

  RepoChanged(repo: DropDownElement<string>) {
    this._reposStream$.next(this._repoUrlToNameMap[repo.value]);
    this.selectedBranch = null;
  }

  OrgChanged(org: DropDownElement<string>) {
    this.fetchRepos(org.value);
    this.selectedRepo = null;
    this.selectedBranch = null;
  }
  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
  }
}
