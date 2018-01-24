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
import { Subject } from 'rxjs/Subject';
import { VSORepo, VSOAccount } from 'app/site/deployment-center/Models/VSORepo';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { LogService } from 'app/shared/services/log.service';
import { LogCategories } from 'app/shared/models/constants';
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
export class ConfigureVstsSourceComponent implements OnDestroy {
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
	public AccountList: DropDownElement<string>[];
	public ProjectList: DropDownElement<string>[];
	public RepositoryList: DropDownElement<string>[];
	public BranchList: DropDownElement<string>[];
	private token: string;
	private _ngUnsubscribe = new Subject();

	private vstsRepositories: VSORepo[];

	//Subscriptions
	private _memberIdSubscription = new Subject();
	private _branchSubscription = new Subject<string>();
	constructor(
		private _wizard: DeploymentCenterWizardService,
		_portalService: PortalService,
		private _cacheService: CacheService,
		_armService: ArmService,
		_aiService: AiService,
		private _userService: UserService,
		private _logService: LogService
	) {
		this._userService.getStartupInfo().takeUntil(this._ngUnsubscribe).subscribe(r => {
			this.token = r.token;
		});
		this.setupSubscriptions();
		this.populate();
		this._wizard.wizardForm.controls.buildProvider.valueChanges.distinctUntilChanged().takeUntil(this._ngUnsubscribe).subscribe(r => {
			this.populate();
		});
	}

	private populate() {
		this._memberIdSubscription.next();
	}

	setupSubscriptions() {
		this._memberIdSubscription
			.takeUntil(this._ngUnsubscribe)
			.switchMap(() => this._cacheService.get('https://app.vssps.visualstudio.com/_apis/profile/profiles/me'))
			.map(r => r.json())
			.switchMap(r => this.FetchAccounts(r.id))
			.switchMap(r => {
				let projectCalls: Observable<VSORepo[]>[] = [];
				r.forEach(account => {
					projectCalls.push(
						this._cacheService
							.get(
								`https://${account.accountName}.visualstudio.com/_apis/git/repositories?api-version=1.0`,
								true,
								this.getHeaders()
							)
							.map(res => res.json().value)
					);
				});
				return forkJoin(projectCalls);
			})
			.subscribe(
				r => {
					this.vstsRepositories = [];
					r.forEach(repoList => {
						repoList.forEach(repo => {
							this.vstsRepositories.push({
								name: repo.name,
								remoteUrl: repo.remoteUrl,
								account: repo.remoteUrl.split('.')[0].replace('https://', ''),
								project: repo.project,
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
				},
				err => {
					this._logService.error(LogCategories.cicd, '/fetch-vso-profile-repo-data', err);
				}
			);

		this._branchSubscription
			.takeUntil(this._ngUnsubscribe)
			.switchMap(repoUri => {
				const repoObj = _.first(this.vstsRepositories.filter(x => x.remoteUrl === repoUri));
				const repoId = repoObj.id;
				const account = repoObj.account;
				return this._cacheService.get(
					`https://${account}.visualstudio.com/DefaultCollection/_apis/git/repositories/${repoId}/refs/heads?api-version=1.0`,
					true,
					this.getHeaders()
				);
			})
			.subscribe(
				r => {
					const branchList = r.json().value;
					this.BranchList = branchList.map(x => {
						const item: DropDownElement<string> = {
							displayLabel: x.name.replace('refs/heads/', ''),
							value: x.name.replace('refs/heads/', '')
						};
						return item;
					});
				},
				err => {
					this._logService.error(LogCategories.cicd, '/fetch-vso-branches', err);
				}
			);
	}

	private FetchAccounts(memberId: string): Observable<VSOAccount[]> {
		const accountsUrl = `https://app.vssps.visualstudio.com/_apis/Commerce/Subscription?memberId=${memberId}&includeMSAAccounts=true&queryOnlyOwnerAccounts=false&inlcudeDisabledAccounts=false&includeMSAAccounts=true&providerNamespaceId=VisualStudioOnline`;
		return this._cacheService.get(accountsUrl, true, this.getHeaders()).switchMap(r => {
			const accounts = r.json().value as VSOAccount[];
			if (this._wizard.wizardForm.controls.buildProvider.value === 'kudu') {
				return Observable.of(accounts.filter(x => x.isAccountOwner));
			} else {
				return Observable.of(accounts);
			}
		});
	}

	AccountChanged(accountName: string) {
		this.ProjectList = _.uniqBy(
			this.vstsRepositories.filter(r => r.account === accountName).map(repo => {
				return {
					displayLabel: repo.project.name,
					value: repo.project.name
				};
			}),
			'value'
		);
	}

	ProjectChanged(projectName: string) {
		this.RepositoryList = _.uniqBy(
			this.vstsRepositories.filter(r => r.project.name === projectName).map(repo => {
				return {
					displayLabel: repo.name,
					value: repo.remoteUrl
				};
			}),
			'value'
		);
	}

	RepoChanged(repoUri: string) {
		this._wizard.wizardForm.controls.sourceSettings.value.repoUrl = repoUri;
		this._branchSubscription.next(repoUri);
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

	ngOnDestroy(): void {
		this._ngUnsubscribe.next();
	}
}
