import { Component } from '@angular/core';
import { DropDownElement } from 'app/shared/models/drop-down-element';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { DeploymentCenterWizardService } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-wizard-service';
import { PortalService } from 'app/shared/services/portal.service';
import { CacheService } from 'app/shared/services/cache.service';
import { ArmService } from 'app/shared/services/arm.service';
import { AiService } from 'app/shared/services/ai.service';
import { Constants } from 'app/shared/models/constants';

@Component({
    selector: 'app-configure-bitbucket',
    templateUrl: './configure-bitbucket.component.html',
    styleUrls: ['./configure-bitbucket.component.scss', '../step-configure.component.scss']
})
export class ConfigureBitbucketComponent {
    private _resourceId: string;
    public RepoList: DropDownElement<string>[];
    public BranchList: DropDownElement<string>[];

    private reposStream = new ReplaySubject<string>();

    constructor(
        private _wizard: DeploymentCenterWizardService,
        _portalService: PortalService,
        private _cacheService: CacheService,
        _armService: ArmService,
        _aiService: AiService
    ) {
        this.reposStream.subscribe(r => {
            this.fetchBranches(r);
        });
        this.fetchRepos();
        this._wizard.resourceIdStream.subscribe(r => {
            this._resourceId = r;
        });

    }

    fetchRepos() {
        this.RepoList = [];
        this._cacheService
            .post(Constants.serviceHost + `api/bitbucket/passthrough?repo=`, true, null, {
                url: `https://api.bitbucket.org/2.0/repositories?role=admin`
            })
            .subscribe(r => {
                const newRepoList: DropDownElement<string>[] = [];
                r.json().values.forEach(repo => {
                    newRepoList.push({
                        displayLabel: repo.name,
                        value: repo.full_name
                    });
                });

                this.RepoList = newRepoList;
            });
    }

    fetchBranches(repo: string) {
        if (repo) {
            this.BranchList = [];
            this._cacheService
                .post(Constants.serviceHost + `api/bitbucket/passthrough?branch=${repo}`, true, null, {
                    url: `https://api.bitbucket.org/2.0/repositories/${repo}/refs/branches`
                })
                .subscribe(r => {
                    const newBranchList: DropDownElement<string>[] = [];

                    r.json().values.forEach(branch => {
                        newBranchList.push({
                            displayLabel: branch.name,
                            value: branch.name
                        });
                    });

                    this.BranchList = newBranchList;
                });
        }
    }

    RepoChanged(repo: string) {
        this._wizard.wizardForm.controls.sourceSettings.value.repoUrl = `https://bitbucket.org/${repo}`;
        this.reposStream.next(repo);
    }

    BranchChanged(branch: string) {
        this._wizard.wizardForm.controls.sourceSettings.value.repoUrl = `https://bitbucket.org/${branch}`;
    }
}
