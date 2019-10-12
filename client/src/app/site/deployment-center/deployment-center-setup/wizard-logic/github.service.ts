import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Constants, DeploymentCenterConstants } from 'app/shared/models/constants';
import { CacheService } from 'app/shared/services/cache.service';
import { Guid } from 'app/shared/Utilities/Guid';
import { Observable } from 'rxjs/Observable';
import { FileContent } from '../../Models/github';

@Injectable()
export class GithubService implements OnDestroy {
  private _ngUnsubscribe$ = new Subject();
  private _workflowYmlPath = '.github/workflows/appsvc-portal.yml';

  constructor(private _cacheService: CacheService) {}

  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
  }

  fetchOrgs(authToken: string) {
    return this._cacheService.post(Constants.serviceHost + 'api/github/passthrough?orgs=', true, null, {
      url: `${DeploymentCenterConstants.githubApiUrl}/user/orgs`,
      authToken,
    });
  }

  fetchUser(authToken: string) {
    return this._cacheService.post(Constants.serviceHost + 'api/github/passthrough?user=', true, null, {
      url: `${DeploymentCenterConstants.githubApiUrl}/user`,
      authToken,
    });
  }

  fetchUserRepos(authToken: string, org: string, page?: number, ownerAccessRequired: boolean = true) {
    let url;

    if (ownerAccessRequired) {
      url = page
        ? `${DeploymentCenterConstants.githubApiUrl}/user/repos?type=owner&page=${page}`
        : `${DeploymentCenterConstants.githubApiUrl}/user/repos?type=owner`;
    } else {
      url = page
        ? `${DeploymentCenterConstants.githubApiUrl}/user/repos?page=${page}`
        : `${DeploymentCenterConstants.githubApiUrl}/user/repos`;
    }

    return this._cacheService.post(Constants.serviceHost + `api/github/passthrough?repo=${org}&t=${Guid.newTinyGuid()}`, true, null, {
      url,
      authToken,
    });
  }

  fetchOrgRepos(authToken: string, org: string, page?: number) {
    const url = page ? `${org}/repos?per_page=100&page=${page}` : `${org}/repos?per_page=100`;

    return this._cacheService.post(Constants.serviceHost + `api/github/passthrough?repo=${org}&t=${Guid.newTinyGuid()}`, true, null, {
      url,
      authToken,
    });
  }

  fetchBranches(authToken: string, repoUrl: string, repoName: string, page?: number) {
    const url = page
      ? `${DeploymentCenterConstants.githubApiUrl}/repos/${repoName}/branches?per_page=100&page=${page}`
      : `${DeploymentCenterConstants.githubApiUrl}/repos/${repoName}/branches?per_page=100`;

    return this._cacheService.post(Constants.serviceHost + `api/github/passthrough?branch=${repoUrl}&t=${Guid.newTinyGuid()}`, true, null, {
      url,
      authToken,
    });
  }

  fetchWorkflowConfiguration(authToken: string, repoUrl: string, repoName: string, branchName: string): Observable<FileContent> {
    const url = `${DeploymentCenterConstants.githubApiUrl}/repos/${repoName}/contents/${this._workflowYmlPath}?ref=${branchName}`;

    return this._cacheService
      .post(
        Constants.serviceHost + `api/github/passthrough?branch=${repoUrl}/contents/${this._workflowYmlPath}&t=${Guid.newTinyGuid()}`,
        true,
        null,
        {
          url,
          authToken,
        }
      )
      .map(r => r.json())
      .catch(e => Observable.of(null));
  }

  commitWorkflowConfiguration(authToken: string, repoName: string, content: any) {
    const url = `${DeploymentCenterConstants.githubApiUrl}/repos/${repoName}/contents/${this._workflowYmlPath}`;

    return this._cacheService.put(Constants.serviceHost + `api/github/fileContent`, null, {
      url,
      content,
      authToken,
    });
  }
}
