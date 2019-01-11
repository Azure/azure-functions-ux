import { Component } from '@angular/core';
import { DropDownElement } from 'app/shared/models/drop-down-element';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { CacheService } from 'app/shared/services/cache.service';
import { Constants, LogCategories, DeploymentCenterConstants } from 'app/shared/models/constants';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Guid } from 'app/shared/Utilities/Guid';
import { LogService } from 'app/shared/services/log.service';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';
import { RequiredValidator } from '../../../../../shared/validators/requiredValidator';
import { Url } from '../../../../../shared/Utilities/url';
import { ResponseHeader } from 'app/shared/Utilities/response-header';

@Component({
  selector: 'app-configure-github',
  templateUrl: './configure-github.component.html',
  styleUrls: ['./configure-github.component.scss', '../step-configure.component.scss', '../../deployment-center-setup.component.scss'],
})
export class ConfigureGithubComponent implements OnDestroy {
  public OrgList: DropDownElement<string>[] = [];
  public RepoList: DropDownElement<string>[] = [];
  public BranchList: DropDownElement<string>[] = [];

  private reposStream = new ReplaySubject<string>();
  private _ngUnsubscribe$ = new Subject();
  private orgStream$ = new ReplaySubject<string>();
  public reposLoading = false;
  public branchesLoading = false;

  public selectedOrg = '';
  public selectedRepo = '';
  public selectedBranch = '';

  private repoUrlToNameMap: { [key: string]: string } = {};
  constructor(
    public wizard: DeploymentCenterStateManager,
    private _cacheService: CacheService,
    private _logService: LogService,
    private _translateService: TranslateService
  ) {
    this.orgStream$.takeUntil(this._ngUnsubscribe$).subscribe(r => {
      this.reposLoading = true;
      this.fetchRepos(r);
    });
    this.reposStream.takeUntil(this._ngUnsubscribe$).subscribe(r => {
      this.branchesLoading = true;
      this.fetchBranches(r);
    });

    this.fetchOrgs();
    this.updateFormValidation();

    // if auth changes then this will force refresh the config data
    this.wizard.updateSourceProviderConfig$.takeUntil(this._ngUnsubscribe$).subscribe(r => {
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
    return Observable.zip(
      this._cacheService.post(Constants.serviceHost + 'api/github/passthrough?orgs=', true, null, {
        url: `${DeploymentCenterConstants.githubApiUrl}/user/orgs`,
        authToken: this.wizard.getToken(),
      }),
      this._cacheService.post(Constants.serviceHost + 'api/github/passthrough?user=', true, null, {
        url: `${DeploymentCenterConstants.githubApiUrl}/user`,
        authToken: this.wizard.getToken(),
      }),
      (orgs, user) => ({
        orgs: orgs.json(),
        user: user.json(),
      })
    ).subscribe(r => {
      const newOrgsList: DropDownElement<string>[] = [];
      newOrgsList.push({
        displayLabel: r.user.login,
        value: r.user.repos_url,
      });

      r.orgs.forEach(org => {
        newOrgsList.push({
          displayLabel: org.login,
          value: org.url,
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

      // This branch is to handle the differences between getting a users personal repos and getting repos for a specific org such as Azure
      // The API handles these differently but the UX shows them the same
      if (org.toLocaleLowerCase().indexOf('github.com/users/') > -1) {
        fetchListCall = this._cacheService
          .post(Constants.serviceHost + `api/github/passthrough?repo=${org}`, true, null, {
            url: `${DeploymentCenterConstants.githubApiUrl}/user/repos?type=owner`,
            authToken: this.wizard.getToken(),
          })
          .switchMap(r => {
            const linkHeader = r.headers.toJSON().link;
            const pageCalls: Observable<any>[] = [Observable.of(r)];
            if (linkHeader) {
              const links = ResponseHeader.getLinksFromLinkHeader(linkHeader);
              const lastPageNumber = this._getLastPage(links);
              for (let i = 2; i <= lastPageNumber; i++) {
                pageCalls.push(
                  this._cacheService.post(
                    Constants.serviceHost + `api/github/passthrough?repo=${org}&t=${Guid.newTinyGuid()}`,
                    true,
                    null,
                    {
                      url: `${DeploymentCenterConstants.githubApiUrl}/user/repos?type=owner&page=${i}`,
                      authToken: this.wizard.getToken(),
                    }
                  )
                );
              }
            }
            return Observable.forkJoin(pageCalls);
          });
      } else {
        fetchListCall = this._cacheService
          .post(Constants.serviceHost + `api/github/passthrough?repo=${org}`, true, null, {
            url: `${org}/repos?per_page=100`,
            authToken: this.wizard.getToken(),
          })
          .switchMap(r => {
            const linkHeader = r.headers.toJSON().link;
            const pageCalls: Observable<any>[] = [Observable.of(r)];
            if (linkHeader) {
              const links = ResponseHeader.getLinksFromLinkHeader(linkHeader);
              const lastPageNumber = this._getLastPage(links);
              for (let i = 2; i <= lastPageNumber; i++) {
                pageCalls.push(
                  this._cacheService.post(
                    Constants.serviceHost + `api/github/passthrough?repo=${org}&t=${Guid.newTinyGuid()}`,
                    true,
                    null,
                    {
                      url: `${org}/repos?per_page=100&page=${i}`,
                      authToken: this.wizard.getToken(),
                    }
                  )
                );
              }
            }
            return Observable.forkJoin(pageCalls);
          });
      }

      fetchListCall
        .map(r => {
          let ret: any[] = [];
          r.forEach(e => {
            ret = ret.concat(e.json());
          });
          return ret;
        })
        .subscribe(
          r => {
            const newRepoList: DropDownElement<string>[] = [];
            this.repoUrlToNameMap = {};
            r.filter(repo => {
              return !repo.permissions || repo.permissions.admin;
            }).forEach(repo => {
              newRepoList.push({
                displayLabel: repo.name,
                value: repo.html_url,
              });
              this.repoUrlToNameMap[repo.html_url] = repo.full_name;
            });

            this.RepoList = newRepoList;
            this.reposLoading = false;
          },
          err => {
            this.reposLoading = false;
            this._logService.error(LogCategories.cicd, '/fetch-github-repos', err);
          }
        );
    }
  }

  fetchBranches(repo: string) {
    if (repo) {
      this.BranchList = [];
      this._cacheService
        .post(Constants.serviceHost + `api/github/passthrough?branch=${repo}`, true, null, {
          url: `${DeploymentCenterConstants.githubApiUrl}/repos/${this.repoUrlToNameMap[repo]}/branches?per_page=100`,
          authToken: this.wizard.getToken(),
        })
        .switchMap(r => {
          const linkHeader = r.headers.toJSON().link;
          const pageCalls: Observable<any>[] = [Observable.of(r)];
          if (linkHeader) {
            const links = ResponseHeader.getLinksFromLinkHeader(linkHeader);
            const lastPageNumber = this._getLastPage(links);
            for (let i = 2; i <= lastPageNumber; i++) {
              pageCalls.push(
                this._cacheService.post(Constants.serviceHost + `api/github/passthrough?t=${Guid.newTinyGuid()}`, true, null, {
                  url: `${DeploymentCenterConstants.githubApiUrl}/repos/${this.repoUrlToNameMap[repo]}/branches?per_page=100&page=${i}`,
                  authToken: this.wizard.getToken(),
                })
              );
            }
          }
          return Observable.forkJoin(pageCalls);
        })
        .switchMap(r => {
          let ret: any[] = [];
          r.forEach(e => {
            ret = ret.concat(e.json());
          });
          return Observable.of(ret);
        })
        .subscribe(
          r => {
            const newBranchList: any[] = [];
            r.forEach(branch => {
              newBranchList.push({
                displayLabel: branch.name,
                value: branch.name,
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
    this.reposStream.next(repo.value);
    this.selectedBranch = '';
  }

  OrgChanged(org: DropDownElement<string>) {
    this.orgStream$.next(org.value);
    this.selectedRepo = '';
    this.selectedBranch = '';
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
  }

  private _getLastPage(links) {
    const lastPageLink = links && links.last;
    if (lastPageLink) {
      const lastPageNumber = +Url.getParameterByName(lastPageLink, 'page');
      return lastPageNumber;
    } else {
      return 1;
    }
  }

  // private _getLinks(linksHeader): any {
  //   const links = {};
  //   // Parse each part into a named link
  //   linksHeader.forEach(part => {
  //     const section = part.split(';');
  //     const url = section[0].replace(/<(.*)>/, '$1').trim();
  //     const name = section[1].replace(/rel="(.*)"/, '$1').trim();
  //     links[name] = url;
  //   });
  //   return links;
  // }
}
