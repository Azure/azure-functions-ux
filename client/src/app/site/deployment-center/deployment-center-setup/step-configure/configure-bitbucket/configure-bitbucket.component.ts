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

@Component({
    selector: 'app-configure-bitbucket',
    templateUrl: './configure-bitbucket.component.html',
    styleUrls: ['./configure-bitbucket.component.scss', '../step-configure.component.scss', '../../deployment-center-setup.component.scss'],
})
export class ConfigureBitbucketComponent implements OnDestroy {
    public OrgList: DropDownElement<string>[] = [];
    public RepoList: DropDownElement<string>[] = [];
    public BranchList: DropDownElement<string>[] = [];

    private reposStream$ = new Subject<string>();
    private _ngUnsubscribe$ = new Subject();
    private repoUrlToNameMap: { [key: string]: string } = {};

    selectedRepo = null;
    selectedBranch = null;

    public reposLoading = false;
    public branchesLoading = false;
    public orgsLoading = false;
    constructor(
        public wizard: DeploymentCenterStateManager,
        private _cacheService: CacheService,
        private _logService: LogService,
        private _translateService: TranslateService,
    ) {
        this.reposStream$.takeUntil(this._ngUnsubscribe$).subscribe(r => {
            this.fetchBranches(r);
        });
        this.fetchOrgs();
        this.updateFormValidation();

        // if auth changes then this will force refresh the config data
        this.wizard.updateSourceProviderConfig$
            .takeUntil(this._ngUnsubscribe$)
            .subscribe(r => {
                this.fetchOrgs();
            });
    }

    updateFormValidation() {
        const required = new RequiredValidator(this._translateService, false);
        this.wizard.sourceSettings.get('repoUrl').setValidators(required.validate.bind(required));
        this.wizard.sourceSettings.get('branch').setValidators(required.validate.bind(required));
        this.wizard.sourceSettings.get('repoUrl').updateValueAndValidity();
        this.wizard.sourceSettings.get('branch').updateValueAndValidity();
    }

    fetchOrgs() {
        this.OrgList = [];
        const newOrgList = [];
        this.orgsLoading = true;
        const userValueCall = this._cacheService.post(Constants.serviceHost + 'api/bitbucket/passthrough', true, null, {
            url: 'https://api.bitbucket.org/2.0/user',
            authToken: this.wizard.getToken(),
        });
        const orgsCall = this._cacheService.post(Constants.serviceHost + `api/bitbucket/passthrough?repo=`, true, null, {
            url: `${DeploymentCenterConstants.bitbucketApiUrl}/teams?role=admin&pagelen=100`,
            authToken: this.wizard.getToken(),
        })
        .expand(value => {
            const page = value.json();
            page.values.forEach(org => {
                newOrgList.push({
                    displayLabel: org.username,
                    value: org.username,
                });
            });
            if (!page.next) {
                return Observable.empty();
            } else {
                return this._cacheService.post(Constants.serviceHost + `api/bitbucket/passthrough?repo=`, true, null, {
                    url: page.next,
                    authToken: this.wizard.getToken(),
                });
            }
        });
        Observable.forkJoin([userValueCall, orgsCall])
            .subscribe(
                ([user, _]) => {

                    this.orgsLoading = false;
                    newOrgList.push({
                        displayLabel: `${user.json().display_name} (Personal)`,
                        value: `self:${user.json().username}`,
                    });
                    this.OrgList = newOrgList;
                },
                err => {
                    this.orgsLoading = false;
                    this._logService.error(LogCategories.cicd, '/fetch-bitbucket-repos', err);
                },
            );
    }

    fetchRepos(team: string) {
        this.RepoList = [];
        const newRepoList = [];
        this.repoUrlToNameMap = {};
        this.reposLoading = true;
        let uri = ``;
        if(team.includes('self:')){
            const username = team.split(':')[1];
            uri = `${DeploymentCenterConstants.bitbucketApiUrl}/repositories/${username}?pagelen=100`;
        } else {
            uri = `${DeploymentCenterConstants.bitbucketApiUrl}/teams/${team}/repositories?pagelen=100`;
        }
        Observable.forkJoin(this._cacheService
            .post(Constants.serviceHost + `api/bitbucket/passthrough?repo=`, true, null, {
                url: uri,
                authToken: this.wizard.getToken(),
            })
            .expand(value => {
                const page = value.json();
                page.values.forEach(repo => {
                    const repoUrl = `${DeploymentCenterConstants.bitbucketUrl}/${repo.full_name}`;
                    newRepoList.push({
                        displayLabel: repo.name,
                        value: repoUrl,
                    });
                    this.repoUrlToNameMap[repoUrl] = repo.full_name;
                });
                if (!page.next) {
                    return Observable.empty();
                } else {
                    return this._cacheService.post(Constants.serviceHost + `api/bitbucket/passthrough?repo=`, true, null, {
                        url: page.next,
                        authToken: this.wizard.getToken(),
                    });
                }
            }))
            .subscribe(
                _ => {
                    this.reposLoading = false;
                    this.RepoList = newRepoList;
                },
                err => {
                    this.reposLoading = false;
                    this._logService.error(LogCategories.cicd, '/fetch-bitbucket-repos', err);
                },
            );
    }

    fetchBranches(repo: string) {
        this.branchesLoading = true;
        this.BranchList = [];
        const newBranchList: DropDownElement<string>[] = [];
        Observable.forkJoin(
        this._cacheService
            .post(Constants.serviceHost + `api/bitbucket/passthrough?branch=${repo}`, true, null, {
                url: `${DeploymentCenterConstants.bitbucketApiUrl}/repositories/${repo}/refs/branches?pagelen=100`,
                authToken: this.wizard.getToken(),
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
                    authToken: this.wizard.getToken(),
                });
            }
        }))
         .subscribe(
                r => {
                    this.branchesLoading = false;
                    this.BranchList = newBranchList;
                },
                err => {
                    this.branchesLoading = false;
                    this._logService.error(LogCategories.cicd, '/fetch-bitbucket-branches', err);
                },
            );
    }

    RepoChanged(repo: DropDownElement<string>) {
        this.reposStream$.next(this.repoUrlToNameMap[repo.value]);
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
