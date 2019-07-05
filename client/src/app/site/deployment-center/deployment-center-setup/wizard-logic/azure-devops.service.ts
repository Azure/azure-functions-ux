import { Injectable, OnDestroy } from '@angular/core';
import { UserService } from 'app/shared/services/user.service';
import { Subject } from 'rxjs/Subject';
import { Http } from '@angular/http';
import { Headers } from '@angular/http';
import { AuthoricatedUserContext, DevOpsAccount, DevOpsList, DevOpsProject } from './azure-devops-service-models';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { uniqBy } from 'lodash-es';
import { of } from 'rxjs/observable/of';
import { Observable } from 'rxjs/Observable';
import { Constants, DeploymentCenterConstants } from 'app/shared/models/constants';

@Injectable()
export class AzureDevOpsService implements OnDestroy {
  private _ngUnsubscribe$ = new Subject();
  private _token: string;
  private _authenticatedUser: AuthoricatedUserContext;
  private _accountsList: DevOpsAccount[] = [];

  constructor(private _httpClient: Http, private _userService: UserService) {
    this._userService
      .getStartupInfo()
      .takeUntil(this._ngUnsubscribe$)
      .subscribe(r => {
        this._token = r.token;
      });
  }

  getUserContext() {
    const userContext = `https://app.vssps.visualstudio.com/_apis/connectionData`;
    if (this._authenticatedUser) {
      return of(this._authenticatedUser);
    }
    return this._httpClient
      .get(userContext, {
        headers: this._headersWithoutPassthrough,
      })
      .map(x => {
        this._authenticatedUser = x.json();
        return this._authenticatedUser;
      });
  }
  getAccounts() {
    if (this._accountsList.length > 0) {
      return of(this._accountsList);
    }
    return this.getUserContext()
      .switchMap(user => {
        const accountUrl = `https://app.vssps.visualstudio.com/_apis/accounts?memeberId=${
          user.authenticatedUser.descriptor
        }?api-version=5.0-preview.1`;
        return forkJoin([
          this._httpClient.get(accountUrl, { headers: this._headersWithoutPassthrough }),
          this._httpClient.get(accountUrl, { headers: this._headersWithPassthrough }),
        ]);
      })
      .map(([accounts1, accounts2]) => {
        const accountList1: DevOpsAccount[] = accounts1.json().map(account => ({ ...account, ForceMsaPassThrough: false }));
        const accountList2: DevOpsAccount[] = accounts2.json().map(account => ({ ...account, ForceMsaPassThrough: true }));
        const mixedAccountList = uniqBy(accountList1.concat(accountList2), 'AccountId');
        this._accountsList = mixedAccountList;
        return mixedAccountList;
      });
  }

  getProjectsForAccount(account: string): Observable<DevOpsList<DevOpsProject>> {
    const uri = `https://dev.azure.com/${account}/_apis/projects`;
    return this.getAccounts().switchMap(r => {
      const msaPassthrough = r.find(x => x.AccountName.toLowerCase() === account.toLowerCase())!.ForceMsaPassThrough;
      return this._httpClient
        .get(uri, {
          headers: msaPassthrough ? this._headersWithPassthrough : this._headersWithoutPassthrough,
        })
        .map(res => res.json());
    });
  }
  getBranchesForRepo(account: string, repositoryId: string) {
    const uri = `https://dev.azure.com/${account}/_apis/git/repositories/${repositoryId}/refs?api-version=5.0`;
    return this.getAccounts().switchMap(r => {
      const msaPassthrough = r.find(x => x.AccountName.toLowerCase() === account.toLowerCase())!.ForceMsaPassThrough;
      return this._httpClient
        .get(uri, {
          headers: msaPassthrough ? this._headersWithPassthrough : this._headersWithoutPassthrough,
        })
        .map(res => res.json());
    });
  }
  getRepositoriesForAccount(account: string) {
    const uri = `https://dev.azure.com/${account}/_apis/git/repositories`;
    return this.getAccounts().switchMap(r => {
      const msaPassthrough = r.find(x => x.AccountName.toLowerCase() === account.toLowerCase())!.ForceMsaPassThrough;
      return this._httpClient
        .get(uri, {
          headers: msaPassthrough ? this._headersWithPassthrough : this._headersWithoutPassthrough,
        })
        .map(res => res.json());
    });
  }

  startDeployment(account: string, deploymentObj: any, isNewVsoAccount: boolean) {
    if (isNewVsoAccount) {
      this._accountsList = [];
    }
    const uri = `${Constants.serviceHost}api/setupvso?accountName=${account}`;
    return this.getAccounts().switchMap(r => {
      const msaPassthrough = r.find(x => x.AccountName.toLowerCase() === account.toLowerCase())!.ForceMsaPassThrough;
      return this._httpClient
        .post(uri, deploymentObj, {
          headers: msaPassthrough ? this._headersWithPassthrough : this._headersWithoutPassthrough,
        })
        .map(res => res.json());
    });
  }

  getBuildDef(account: string, project: string, buildId: string) {
    const uri = `https://dev.azure.com/${account}/${project}/_apis/build/Definitions/${buildId}?api-version=2.0`;
    return this.getAccounts().switchMap(r => {
      const msaPassthrough = r.find(x => x.AccountName.toLowerCase() === account.toLowerCase())!.ForceMsaPassThrough;
      return this._httpClient
        .get(uri, {
          headers: msaPassthrough ? this._headersWithPassthrough : this._headersWithoutPassthrough,
        })
        .map(res => res.json());
    });
  }

  getPermissionResult(permissionPayload: any) {
    return this._httpClient
      .post(DeploymentCenterConstants.vstsPermissionApiUri, permissionPayload, {
        headers: this._headersWithoutPassthrough,
      })
      .map(res => res.json());
  }

  private get _headersWithPassthrough(): Headers {
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${this._token}`);
    headers.append('X-VSS-ForceMsaPassThrough', 'true');
    return headers;
  }

  private get _headersWithoutPassthrough(): Headers {
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${this._token}`);
    return headers;
  }
  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
  }
}
