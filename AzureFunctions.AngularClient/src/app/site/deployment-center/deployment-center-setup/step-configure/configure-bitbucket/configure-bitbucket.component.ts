import { Component, OnDestroy } from '@angular/core';
import { DropDownElement } from 'app/shared/models/drop-down-element';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { PortalService } from 'app/shared/services/portal.service';
import { CacheService } from 'app/shared/services/cache.service';
import { ArmService } from 'app/shared/services/arm.service';
import { AiService } from 'app/shared/services/ai.service';
import { Constants, LogCategories, DeploymentCenterConstants } from 'app/shared/models/constants';
import { LogService } from 'app/shared/services/log.service';
import { Subject } from 'rxjs/Subject';
import { Validators } from '@angular/forms';

@Component({
    selector: 'app-configure-bitbucket',
    templateUrl: './configure-bitbucket.component.html',
    styleUrls: ['./configure-bitbucket.component.scss', '../step-configure.component.scss']
})
export class ConfigureBitbucketComponent implements OnDestroy {
    public RepoList: DropDownElement<string>[];
    public BranchList: DropDownElement<string>[];

    private reposStream = new ReplaySubject<string>();
    private _ngUnsubscribe = new Subject();
    private repoUrlToNameMap: { [key: string]: string } = {};

    selectedRepo = '';
    selectedBranch = '';
    constructor(
        public wizard: DeploymentCenterStateManager,
        _portalService: PortalService,
        private _cacheService: CacheService,
        private _logService: LogService,
        _armService: ArmService,
        _aiService: AiService
    ) {
        this.reposStream.takeUntil(this._ngUnsubscribe).subscribe(r => {
            this.fetchBranches(r);
        });
        this.fetchRepos();
        this.updateFormValidation();
    }

    updateFormValidation() {
        this.wizard.sourceSettings.get('repoUrl').setValidators(Validators.required);
        this.wizard.sourceSettings.get('branch').setValidators(Validators.required);
        this.wizard.sourceSettings.get('isMercurial').setValidators([]);
        this.wizard.sourceSettings.get('repoUrl').updateValueAndValidity();
        this.wizard.sourceSettings.get('branch').updateValueAndValidity();
        this.wizard.sourceSettings.get('isMercurial').updateValueAndValidity();
    }

    fetchRepos() {
        this.RepoList = [];
        this._cacheService
            .post(Constants.serviceHost + `api/bitbucket/passthrough?repo=`, true, null, {
                url: `${DeploymentCenterConstants.bitbucketApiUrl}/repositories?role=admin`
            })
            .subscribe(
                r => {
                    const newRepoList: DropDownElement<string>[] = [];
                    this.repoUrlToNameMap = {};
                    r.json().values.forEach(repo => {
                        const repoUrl = `${DeploymentCenterConstants.bitbucketUrl}/${repo.full_name}`;
                        newRepoList.push({
                            displayLabel: repo.name,
                            value: repoUrl
                        });
                        this.repoUrlToNameMap[repoUrl] = repo.full_name;
                    });

                    this.RepoList = newRepoList;
                },
                err => {
                    this._logService.error(LogCategories.cicd, '/fetch-bitbucket-repos', err);
                }
            );
    }

    fetchBranches(repo: string) {
        if (repo) {
            this.BranchList = [];
            this._cacheService
                .post(Constants.serviceHost + `api/bitbucket/passthrough?branch=${repo}`, true, null, {
                    url: `${DeploymentCenterConstants.bitbucketApiUrl}/repositories/${repo}/refs/branches`
                })
                .subscribe(
                    r => {
                        const newBranchList: DropDownElement<string>[] = [];

                        r.json().values.forEach(branch => {
                            newBranchList.push({
                                displayLabel: branch.name,
                                value: branch.name
                            });
                        });

                        this.BranchList = newBranchList;
                    },
                    err => {
                        this._logService.error(LogCategories.cicd, '/fetch-bitbucket-branches', err);
                    }
                );
        }
    }

    RepoChanged(repo: DropDownElement<string>) {
        this.reposStream.next(this.repoUrlToNameMap[repo.value]);
    }

    ngOnDestroy(): void {
        this._ngUnsubscribe.next();
    }
}
