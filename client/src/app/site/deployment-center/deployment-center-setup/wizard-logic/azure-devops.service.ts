import { Injectable, OnDestroy } from '@angular/core';
import { UserService } from 'app/shared/services/user.service';
import { Subject } from 'rxjs/Subject';
import { Http } from '@angular/http';
import { Headers } from '@angular/http';
import { AuthoricatedUserContext, DevOpsAccount } from './azure-devops-service-models';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { uniqBy } from 'lodash-es';

@Injectable()
export class AzureDevOpsService implements OnDestroy {
  private _ngUnsubscribe$ = new Subject();
  private _token: string;
  private _authenticatedUser: AuthoricatedUserContext;
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
    return this._httpClient
      .get(userContext, {
        headers: this._headersWithoutPassthrough,
      })
      .do(x => {
        this._authenticatedUser = x.json();
      })
      .switchMap(x => {
        const accountUrl = `https://app.vssps.visualstudio.com/_apis/accounts?memeberId=${
          this._authenticatedUser.authenticatedUser.descriptor
        }?api-version=5.0-preview.1`;
        return forkJoin([
          this._httpClient.get(accountUrl, { headers: this._headersWithoutPassthrough }),
          this._httpClient.get(accountUrl, { headers: this._headersWithPassthrough }),
        ]);
      })
      .map(([accounts1, accounts2]) => {
        const accountList1: DevOpsAccount[] = accounts1.json();
        const accountList2: DevOpsAccount[] = accounts2.json();
        const mixedAccountList = uniqBy(accountList1.concat(accountList2), 'AccountId');
        return mixedAccountList;
      });
  }

  getBranchesForRepo(account: string, repositoryId: string) {
    const uri = `https://dev.azure.com/${account}/_apis/git/repositories/${repositoryId}/refs?api-version=5.0`;
    return this._httpClient.get(uri, {
      headers: this._headersWithoutPassthrough,
    });
  }
  getRepositoriesForAccount(account: DevOpsAccount) {
    const uri = `https://dev.azure.com/${account.AccountName}/_apis/git/repositories`;
    return this._httpClient
      .get(uri, {
        headers: this._headersWithoutPassthrough,
      })
      .map(x => {
        return x.json();
      });
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
