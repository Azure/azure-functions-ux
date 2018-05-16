import { Component, OnDestroy } from '@angular/core';
import { DropDownElement } from 'app/shared/models/drop-down-element';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { CacheService } from 'app/shared/services/cache.service';
import { Constants, LogCategories, DeploymentCenterConstants } from 'app/shared/models/constants';
import { LogService } from 'app/shared/services/log.service';
import { Subject } from 'rxjs/Subject';
import { RequiredValidator } from '../../../../../shared/validators/requiredValidator';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-configure-bitbucket',
    templateUrl: './configure-bitbucket.component.html',
    styleUrls: ['./configure-bitbucket.component.scss', '../step-configure.component.scss', '../../deployment-center-setup.component.scss']
})
export class ConfigureBitbucketComponent implements OnDestroy {
    public RepoList: DropDownElement<string>[] = [];
    public BranchList: DropDownElement<string>[] = [];

    private reposStream$ = new Subject<string>();
    private _ngUnsubscribe$ = new Subject();
    private repoUrlToNameMap: { [key: string]: string } = {};

    selectedRepo = null;
    selectedBranch = null;

    public reposLoading = false;
    public branchesLoading = false;

    constructor(
        public wizard: DeploymentCenterStateManager,
        private _cacheService: CacheService,
        private _logService: LogService,
        private _translateService: TranslateService
    ) {
        this.reposStream$.takeUntil(this._ngUnsubscribe$).subscribe(r => {
            this.fetchBranches(r);
        });
        this.fetchRepos();
        this.updateFormValidation();
    }

    updateFormValidation() {
        const required = new RequiredValidator(this._translateService, false);
        this.wizard.sourceSettings.get('repoUrl').setValidators(required.validate.bind(required));
        this.wizard.sourceSettings.get('branch').setValidators(required.validate.bind(required));
        this.wizard.sourceSettings.get('isMercurial').setValidators([]);
        this.wizard.sourceSettings.get('repoUrl').updateValueAndValidity();
        this.wizard.sourceSettings.get('branch').updateValueAndValidity();
        this.wizard.sourceSettings.get('isMercurial').updateValueAndValidity();
    }

    fetchRepos() {
        this.RepoList = [];
        this.reposLoading = true;
        this._cacheService
            .post(Constants.serviceHost + `api/bitbucket/passthrough?repo=`, true, null, {
                url: `${DeploymentCenterConstants.bitbucketApiUrl}/repositories?role=admin`,
                authToken: this.wizard.getToken()
            })
            .subscribe(
                r => {
                    this.reposLoading = false;
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
                    this.reposLoading = false;
                    this._logService.error(LogCategories.cicd, '/fetch-bitbucket-repos', err);
                }
            );
    }

    fetchBranches(repo: string) {
        this.branchesLoading = true;
        this.BranchList = [];
        this._cacheService
            .post(Constants.serviceHost + `api/bitbucket/passthrough?branch=${repo}`, true, null, {
                url: `${DeploymentCenterConstants.bitbucketApiUrl}/repositories/${repo}/refs/branches`,
                authToken: this.wizard.getToken()
            })
            .subscribe(
                r => {
                    this.branchesLoading = false;
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
                    this.branchesLoading = false;
                    this._logService.error(LogCategories.cicd, '/fetch-bitbucket-branches', err);
                }
            );
    }

    RepoChanged(repo: DropDownElement<string>) {
        this.reposStream$.next(this.repoUrlToNameMap[repo.value]);
    }

    ngOnDestroy(): void {
        this._ngUnsubscribe$.next();
    }
}
