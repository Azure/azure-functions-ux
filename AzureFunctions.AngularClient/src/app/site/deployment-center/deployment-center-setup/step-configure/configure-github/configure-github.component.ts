import { Component } from '@angular/core';
import { DropDownElement } from 'app/shared/models/drop-down-element';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { PortalService } from 'app/shared/services/portal.service';
import { CacheService } from 'app/shared/services/cache.service';
import { ArmService } from 'app/shared/services/arm.service';
import { Constants, LogCategories, DeploymentCenterConstants } from 'app/shared/models/constants';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Guid } from 'app/shared/Utilities/Guid';
import { LogService } from 'app/shared/services/log.service';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-configure-github',
    templateUrl: './configure-github.component.html',
    styleUrls: ['./configure-github.component.scss', '../step-configure.component.scss']
})
export class ConfigureGithubComponent implements OnDestroy {
    public OrgList: DropDownElement<string>[];
    public RepoList: DropDownElement<string>[];
    private repoUrlToNameMap: { [key: string]: string } = {};
    public BranchList: DropDownElement<string>[];

    private reposStream = new ReplaySubject<string>();
    private _ngUnsubscribe = new Subject();
    private orgStream = new ReplaySubject<string>();
    public reposLoading = false;
    public branchesLoading = false;
    constructor(
        public wizard: DeploymentCenterStateManager,
        _portalService: PortalService,
        private _cacheService: CacheService,
        _armService: ArmService,
        private _logService: LogService
    ) {
        this.orgStream.takeUntil(this._ngUnsubscribe).subscribe(r => {
            this.reposLoading = true;
            this.fetchRepos(r);
        });
        this.reposStream.takeUntil(this._ngUnsubscribe).subscribe(r => {
            this.branchesLoading = true;
            this.fetchBranches(r);
        });

        this.fetchOrgs();
    }

    fetchOrgs() {
        return Observable.zip(
            this._cacheService.post(Constants.serviceHost + 'api/github/passthrough?orgs=', true, null, {
                url: `${DeploymentCenterConstants.githubApiUrl}/user/orgs`
            }),
            this._cacheService.post(Constants.serviceHost + 'api/github/passthrough?user=', true, null, {
                url: `${DeploymentCenterConstants.githubApiUrl}/user`
            }),
            (orgs, user) => ({
                orgs: orgs.json(),
                user: user.json()
            })
        ).subscribe(r => {
            const newOrgsList: DropDownElement<string>[] = [];
            newOrgsList.push({
                displayLabel: r.user.login,
                value: r.user.repos_url
            });

            r.orgs.forEach(org => {
                newOrgsList.push({
                    displayLabel: org.login,
                    value: org.url
                });
            });

            this.OrgList = newOrgsList;
        });
    }

    fetchRepos(org: string) {
        if (org) {
            let fetchListCall: Observable<any[]> = null;
            this.RepoList = [];
            this.BranchList = [];

            //This branch is to handle the differences between getting a users personal repos and getting repos for a specific org such as Azure
            //The API handles these differently but the UX shows them the same
            if (org.toLocaleLowerCase().indexOf('github.com/users/') > -1) {
                fetchListCall = this._cacheService
                    .post(Constants.serviceHost + `api/github/passthrough?repo=${org}`, true, null, {
                        url: `${org}`
                    })
                    .switchMap(r => {
                        return Observable.of(r.json());
                    });
            } else {
                fetchListCall = this._cacheService
                    .post(Constants.serviceHost + `api/github/passthrough?repo=${org}`, true, null, {
                        url: `${org}`
                    })
                    .switchMap(r => {
                        const orgData = r.json();
                        const pageCount = (orgData.public_repos + orgData.total_private_repos) / 100 + 1;
                        const pageCalls: Observable<Response>[] = [];
                        for (let i = 1; i <= pageCount; i++) {
                            pageCalls.push(
                                this._cacheService.post(Constants.serviceHost + `api/github/passthrough?repo=${org}&t=${Guid.newTinyGuid()}`, true, null, {
                                    url: `${org}/repos?per_page=100&page=${i}`
                                })
                            );
                        }
                        return Observable.forkJoin(pageCalls);
                    })
                    .switchMap(r => {
                        let ret: any[] = [];
                        r.forEach(e => {
                            ret = ret.concat(e.json());
                        });
                        return Observable.of(ret);
                    });
            }
            fetchListCall.subscribe(r => {
                const newRepoList: DropDownElement<string>[] = [];
                this.repoUrlToNameMap = {};
                r
                    .filter(repo => {
                        return !repo.permissions || repo.permissions.admin;
                    })
                    .forEach(repo => {
                        newRepoList.push({
                            displayLabel: repo.name,
                            value: repo.html_url
                        });
                        this.repoUrlToNameMap[repo.html_url] = repo.full_name;
                    });

                this.RepoList = newRepoList;
                this.reposLoading = false;
            }), err => {
                this.reposLoading = false;
                this._logService.error(LogCategories.cicd, '/fetch-github-repos', err);
            };
        }
    }

    fetchBranches(repo: string) {
        if (repo) {
            this.BranchList = [];
            this._cacheService
                .post(Constants.serviceHost + `api/github/passthrough?branch=${repo}`, true, null, {
                    url: `${DeploymentCenterConstants.githubApiUrl}/repos/${this.repoUrlToNameMap[repo]}/branches?per_page=100`
                })
                .subscribe(
                    r => {
                        const newBranchList: DropDownElement<string>[] = [];

                        r.json().forEach(branch => {
                            newBranchList.push({
                                displayLabel: branch.name,
                                value: branch.name
                            });
                        });

                        this.BranchList = newBranchList;
                        this.branchesLoading = false;
                    },
                    err => {
                        this._logService.error(LogCategories.cicd, '/fetch-github-branches', err);
                        this.branchesLoading = false;
                    }
                );
        }
    }

    RepoChanged(repo: DropDownElement<string>) {
        this.wizard.wizardForm.controls.sourceSettings.value.repoUrl = `${DeploymentCenterConstants.githubUri}/${this.repoUrlToNameMap[repo.value]}`;
        this.reposStream.next(repo.value);
    }

    OrgChanged(org: DropDownElement<string>) {
        this.orgStream.next(org.value);
    }

    BranchChanged(branch: DropDownElement<string>) {
        this.wizard.wizardForm.controls.sourceSettings.value.branch = branch.value;
    }

    ngOnDestroy(): void {
        this._ngUnsubscribe.next();
    }
}
