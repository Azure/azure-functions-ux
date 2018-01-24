import { Component } from '@angular/core';
import { DropDownElement } from 'app/shared/models/drop-down-element';
import { DeploymentCenterWizardService } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-wizard-service';
import { PortalService } from 'app/shared/services/portal.service';
import { CacheService } from 'app/shared/services/cache.service';
import { ArmService } from 'app/shared/services/arm.service';
import { AiService } from 'app/shared/services/ai.service';
import { Constants, LogCategories } from 'app/shared/models/constants';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Guid } from 'app/shared/Utilities/Guid';
import { LogService } from 'app/shared/services/log.service';

@Component({
	selector: 'app-configure-github',
	templateUrl: './configure-github.component.html',
	styleUrls: ['./configure-github.component.scss', '../step-configure.component.scss']
})
export class ConfigureGithubComponent {
	public OrgList: DropDownElement<string>[];
	public RepoList: DropDownElement<string>[];
	private repoUrlToNameMap: { [key: string]: string } = {};
	public BranchList: DropDownElement<string>[];

	private reposStream = new ReplaySubject<string>();
	private orgStream = new ReplaySubject<string>();
	constructor(
		public wizard: DeploymentCenterWizardService,
		_portalService: PortalService,
		private _cacheService: CacheService,
		_armService: ArmService,
		_aiService: AiService,
		private _logService: LogService
	) {
		this.orgStream.subscribe(r => {
			this.fetchRepos(r);
		});
		this.reposStream.subscribe(r => {
			this.fetchBranches(r);
		});

		this.fetchOrgs();
	}

	fetchOrgs() {
		return Observable.zip(
			this._cacheService.post(Constants.serviceHost + 'api/github/passthrough?orgs=', true, null, {
				url: 'https://api.github.com/user/orgs'
			}),
			this._cacheService.post(Constants.serviceHost + 'api/github/passthrough?user=', true, null, {
				url: 'https://api.github.com/user'
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
			if (org.includes('github.com/users/')) {
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
						let pageCalls: Observable<Response>[] = [];
						for (let i = 1; i <= pageCount; i++) {
							pageCalls.push(
								this._cacheService.post(
									Constants.serviceHost + `api/github/passthrough?repo=${org}&t=${Guid.newTinyGuid()}`,
									true,
									null,
									{
										url: `${org}/repos?per_page=100&page=${i}`
									}
								)
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
			}), err => {
				this._logService.error(LogCategories.cicd, '/fetch-github-repos', err);
			};
		}
	}

	fetchBranches(repo: string) {
		if (repo) {
			this.BranchList = [];
			this._cacheService
				.post(Constants.serviceHost + `api/github/passthrough?branch=${repo}`, true, null, {
					url: `https://api.github.com/repos/${this.repoUrlToNameMap[repo]}/branches?per_page=100`
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
					},
					err => {
						this._logService.error(LogCategories.cicd, '/fetch-github-branches', err);
					}
				);
		}
	}

	RepoChanged(repo: string) {
		this.wizard.wizardForm.controls.sourceSettings.value.repoUrl = `https://github.com/${this.repoUrlToNameMap[repo]}`;
		this.reposStream.next(repo);
	}

	OrgChanged(org: string) {
		this.orgStream.next(org);
	}

	BranchChanged(branch: string) {
		this.wizard.wizardForm.controls.sourceSettings.value.branch = branch;
	}
}
