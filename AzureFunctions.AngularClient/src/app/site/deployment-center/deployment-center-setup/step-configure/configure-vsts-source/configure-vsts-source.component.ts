import { Component } from '@angular/core';
import { DropDownElement } from 'app/shared/models/drop-down-element';
import { DeploymentCenterWizardService } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-wizard-service';
import { PortalService } from 'app/shared/services/portal.service';
import { CacheService } from 'app/shared/services/cache.service';
import { ArmService } from 'app/shared/services/arm.service';
import { AiService } from 'app/shared/services/ai.service';
import { Headers } from '@angular/http';
import { UserService } from 'app/shared/services/user.service';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'app-configure-vsts-source',
    templateUrl: './configure-vsts-source.component.html',
    styleUrls: ['./configure-vsts-source.component.scss', '../step-configure.component.scss']
})
export class ConfigureVstsSourceComponent {
    private _vstsProfileInfo: any;
    private _resourceId: string;
    private _chosenAccount: string;
    private _chosenProject: string;
    private _chosenRepository: string;
    public AllGitRepoList: any[];
    public AccountList: DropDownElement<string>[];
    public ProjectList: DropDownElement<string>[];
    public RepositoryList: DropDownElement<string>[];
    public BranchList: DropDownElement<string>[];
    private token: string;
    constructor(
        private _wizard: DeploymentCenterWizardService,
        _portalService: PortalService,
        private _cacheService: CacheService,
        _armService: ArmService,
        _aiService: AiService,
        private _userService: UserService
    ) {
        this._userService.getStartupInfo().subscribe(r => {
            this.token = r.token;
        });

        this._wizard.sourceControlProvider$
            .switchMap(r => {
                return this.GetMemberId();
            })
            .switchMap(r => {
                this._vstsProfileInfo = r.json();
                return this.FetchAccounts();
            })
            .subscribe(r => {});
        this._wizard.resourceIdStream.subscribe(r => {
            this._resourceId = r;
        });
    }

    private GetMemberId() {
        return this._cacheService.get('https://app.vssps.visualstudio.com/_apis/profile/profiles/me');
    }

    RepoChanged(repoId: string) {
        this._chosenRepository = repoId;
        this._cacheService
            .get(
                `https://${this
                    ._chosenAccount}.visualstudio.com/DefaultCollection/_apis/git/repositories/${repoId}/refs/heads?api-version=1.0`,
                true,
                this.getHeaders()
            )
            .subscribe(r => {
                const branchList = r.json().value;
                this.BranchList = branchList.map(x => {
                    const item: DropDownElement<string> = {
                        displayLabel: x.name.replace('refs/heads/', ''),
                        value: x.name.replace('refs/heads/', '')
                    };
                    return item;
                });
            });
    }

    AccountChanged(accountName: string) {
        this._chosenAccount = accountName;

        return this._cacheService
            .get(`https://${accountName}.visualstudio.com/_apis/git/repositories?api-version=1.0`, true, this.getHeaders())
            .subscribe(r => {
                let projectList: DropDownElement<string>[] = [];
                this.AllGitRepoList = r.json().value;
                this.AllGitRepoList.forEach(x => {
                    if (!projectList.find(y => y.value === x.project.name)) {
                        projectList.push({
                            displayLabel: x.project.name,
                            value: x.project.name
                        });
                    }
                });
                this.ProjectList = projectList;
            });
    }

    ProjectChanged(projectName: string) {
        this._chosenProject = projectName;
        this.RepositoryList = this.AllGitRepoList[this._chosenAccount].filter(x => x.project.name === projectName).map(x => {
            const item: DropDownElement<string> = {
                displayLabel: x.name,
                value: x.id
            };
            return item;
        });
    }

    private FetchAccounts() {
        const accountsUrl = `https://app.vssps.visualstudio.com/_apis/Commerce/Subscription?queryOnlyOwnerAccounts=false&inlcudeDisabledAccounts=false&includeMSAAccounts=true&providerNamespaceId=VisualStudioOnline&memberId=${this
            ._vstsProfileInfo.id}`;
        return this._cacheService.get(accountsUrl, true, this.getHeaders()).switchMap(r => {
            const accounts = r.json().value as any[];

            this.AccountList = accounts.map(x => {
                const item: DropDownElement<string> = {
                    displayLabel: x.accountName,
                    value: x.accountName
                };
                return item;
            });
            return Observable.of(r);
        });
    }

    private getHeaders(): Headers {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Authorization', `Bearer ${this.token}`);
        headers.append('X-VSS-ForceMsaPassThrough', 'true');
        return headers;
    }
}
