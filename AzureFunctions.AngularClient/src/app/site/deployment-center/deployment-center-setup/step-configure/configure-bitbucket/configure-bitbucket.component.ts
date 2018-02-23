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

    constructor(
        private _wizard: DeploymentCenterStateManager,
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
                    r.json().values.forEach(repo => {
                        newRepoList.push({
                            displayLabel: repo.name,
                            value: repo.full_name
                        });
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

    RepoChanged(repo: string) {
        this._wizard.wizardForm.controls.sourceSettings.value.repoUrl = `${DeploymentCenterConstants.bitbucketUrl}/${repo}`;
        this.reposStream.next(repo);
    }
    
    ngOnDestroy(): void {
        this._ngUnsubscribe.next();
    }
}
