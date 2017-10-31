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
import * as _ from 'lodash';
export const PythonFramework = {
    Bottle: 'Bottle',
    Django: 'Django',
    Flask: 'Flask'
};

export const TaskRunner = {
    None: 'None',
    Gulp: 'Gulp',
    Grunt: 'Grunt'
};

export const WebAppFramework = {
    AspNetWap: 'AspNetWap',
    AspNetCore: 'AspNetCore',
    Node: 'Node',
    PHP: 'PHP',
    Python: 'Python'
};

export class VSTSRepository {
    name: string;
    account: string;
    remoteUrl: string;
    projectName: string;
    id: string;
}

@Component({
    selector: 'app-configure-vsts-source',
    templateUrl: './configure-vsts-source.component.html',
    styleUrls: ['./configure-vsts-source.component.scss', '../step-configure.component.scss']
})
export class ConfigureVstsSourceComponent {
    WebApplicationFrameworks: DropDownElement<string>[] = [
        {
            displayLabel: 'ASP.NET',
            value: WebAppFramework.AspNetWap
        },
        {
            displayLabel: 'ASP.NET Core',
            value: WebAppFramework.AspNetCore
        },
        {
            displayLabel: 'Node.JS',
            value: WebAppFramework.Node
        },
        {
            displayLabel: 'PHP',
            value: WebAppFramework.PHP
        },
        {
            displayLabel: 'Python',
            value: WebAppFramework.Python
        }
    ];
    chosenBuildFramework: string;
    private _resourceId: string;
    //private _chosenRepository: string;
    public AllGitRepoList: any[];
    public AccountList: DropDownElement<string>[];
    public ProjectList: DropDownElement<string>[];
    public RepositoryList: DropDownElement<string>[];
    public BranchList: DropDownElement<string>[];
    private token: string;

    private vstsRepositories: VSTSRepository[];
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

        this._wizard.resourceIdStream.subscribe(r => {
            this._resourceId = r;
        });

        this.populate();
        this._wizard.wizardForm.controls.buildProvider.valueChanges.distinctUntilChanged().subscribe(r => {
            this.populate();
        });
    }

    private populate() {
        this.GetMemberId()
            .switchMap(r => {
                return this.FetchAccounts(r.id);
            })
            .switchMap(r => {
                let projectCalls: Observable<any[]>[] = [];
                r.forEach(account => {
                    projectCalls.push(this.FetchProjectsForAccount(account.accountName));
                });
                return Observable.forkJoin(projectCalls);
            })
            .subscribe(r => {
                this.vstsRepositories = [];
                r.forEach(repoList => {
                    repoList.forEach(repo => {
                        let url: string = repo.remoteUrl;

                        this.vstsRepositories.push({
                            name: repo.name,
                            remoteUrl: url,
                            account: url.split('.')[0].replace('https://', ''),
                            projectName: repo.project.name,
                            id: repo.id
                        });
                    });
                });
                this.AccountList = _.uniqBy(
                    this.vstsRepositories.map(repo => {
                        return {
                            displayLabel: repo.account,
                            value: repo.account
                        };
                    }),
                    'value'
                );
            });
    }
    private GetMemberId() {
        return this._cacheService.get('https://app.vssps.visualstudio.com/_apis/profile/profiles/me').switchMap(r => {
            return Observable.of(r.json());
        });
    }

    private FetchAccounts(memberId: string): Observable<any[]> {
        const accountsUrl = `https://app.vssps.visualstudio.com/_apis/Commerce/Subscription?memberId=${memberId}&includeMSAAccounts=true&queryOnlyOwnerAccounts=false&inlcudeDisabledAccounts=false&includeMSAAccounts=true&providerNamespaceId=VisualStudioOnline`;
        return this._cacheService.get(accountsUrl, true, this.getHeaders()).switchMap(r => {
            const accounts = r.json().value as any[];
            if (this._wizard.wizardForm.controls.buildProvider.value === 'kudu') {
                return Observable.of(accounts.filter(x => x.isAccountOwner));
            } else {
                return Observable.of(accounts);
            }
        });
    }

    private FetchProjectsForAccount(accountName: string): Observable<any[]> {
        return this._cacheService
            .get(`https://${accountName}.visualstudio.com/_apis/git/repositories?api-version=1.0`, true, this.getHeaders())
            .switchMap(r => {
                return Observable.of(r.json().value);
            });
    }

    AccountChanged(accountName: string) {
        this.ProjectList = _.uniqBy(
            this.vstsRepositories.filter(r => r.account === accountName).map(repo => {
                return {
                    displayLabel: repo.projectName,
                    value: repo.projectName
                };
            }),
            'value'
        );
    }

    ProjectChanged(projectName: string) {
        this.RepositoryList = _.uniqBy(
            this.vstsRepositories.filter(r => r.projectName === projectName).map(repo => {
                return {
                    displayLabel: repo.name,
                    value: repo.remoteUrl
                };
            }),
            'value'
        );
    }
    RepoChanged(repoUri: string) {
        const repoObj = _.first(this.vstsRepositories.filter(x => x.remoteUrl === repoUri));
        const repoId = repoObj.id;
        const account = repoObj.account;
        this._wizard.wizardForm.controls.sourceSettings.value.repoUrl = repoUri;
        this._cacheService
            .get(
                `https://${account}.visualstudio.com/DefaultCollection/_apis/git/repositories/${repoId}/refs/heads?api-version=1.0`,
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

    BranchChanged(branch: string) {
        this._wizard.wizardForm.controls.sourceSettings.value.branch = branch;
    }
    private getHeaders(): Headers {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Authorization', `Bearer ${this.token}`);
        headers.append('X-VSS-ForceMsaPassThrough', 'true');
        return headers;
    }

    frameworkChanged(framework) {
        this.chosenBuildFramework = framework;
    }
    get showWorkingDirectory() {
        return true;
    }
}
