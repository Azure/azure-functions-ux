import { ConfigService } from './../shared/services/config.service';
import { Router } from '@angular/router';
import { BroadcastService } from './../shared/services/broadcast.service';
import { StartupInfo } from './../shared/models/portal';
import { Component, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Response, Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/zip';
import { TranslateService } from '@ngx-translate/core';

import { Constants } from './../shared/models/constants';
import { StorageAccountDeprecated } from './../shared/models/storage-account';
import { ResourceGroup } from './../shared/models/resource-group';
import { UserService } from '../shared/services/user.service';
import { User } from '../shared/models/user';
import { Subscription } from '../shared/models/subscription';
import { DropDownElement } from '../shared/models/drop-down-element';
import { ArmService } from '../shared/services/arm.service';
import { FunctionContainer } from '../shared/models/function-container';
import { GlobalStateService } from '../shared/services/global-state.service';
import { PortalResources } from '../shared/models/portal-resources';
import { AiService } from '../shared/services/ai.service';
import { Url } from '../shared/Utilities/url';
import { ArmUtil } from '../shared/Utilities/arm-utils';

@Component({
  selector: 'getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.scss'],
})
export class GettingStartedComponent implements OnInit, OnDestroy {
  public geoRegions: DropDownElement<string>[];
  public subscriptions: DropDownElement<Subscription>[];
  public functionContainers: DropDownElement<FunctionContainer>[];
  public selectedSubscription: Subscription;
  public selectedGeoRegion: string;
  public functionContainerName: string;
  public createError: string;
  public functionContainerNameEvent: EventEmitter<string>;
  public isValidContainerName: boolean;
  public validationError: string;

  public user: User;

  private _ngUnsubscribe = new Subject();
  private _startupInfo: StartupInfo<void>;

  private functionContainer: FunctionContainer;
  constructor(
    private _userService: UserService,
    private _armService: ArmService,
    private _globalStateService: GlobalStateService,
    private _translateService: TranslateService,
    private _aiService: AiService,
    private _http: Http,
    private _broadcastService: BroadcastService,
    private _router: Router,
    private _configService: ConfigService
  ) {
    this.isValidContainerName = true;
    // http://stackoverflow.com/a/8084248/3234163
    this.functionContainerName = `functions${this.makeId()}`;
    this.functionContainers = [];
    this.geoRegions = [];
    this.functionContainerNameEvent = new EventEmitter<string>();
    this.functionContainerNameEvent
      .switchMap(() => this.validateContainerName(this.functionContainerName))
      .subscribe(v => {
        this.isValidContainerName = v.isValid;
        this.validationError = v.reason;
      });
  }

  ngOnInit() {
    this._globalStateService.setBusyState();

    Observable.zip(
      this._userService.getStartupInfo().takeUntil(this._ngUnsubscribe),
      this._userService.getUser().takeUntil(this._ngUnsubscribe),
      (i, u) => ({ info: i, user: u })
    ).subscribe(r => {
      this._startupInfo = r.info;

      this.subscriptions = r.info.subscriptions
        .map(e => ({ displayLabel: e.displayName, value: e }))
        .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));

      this.user = r.user;
      this._globalStateService.clearBusyState();
    });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
  }

  createFunctionsContainer() {
    delete this.createError;
    this._globalStateService.setBusyState();
    this._createFunctionContainerHelper(
      this.selectedSubscription.subscriptionId,
      this.selectedGeoRegion,
      this.functionContainerName
    ).subscribe(r => {
      this._initializeDashboard(r);
      this._globalStateService.clearBusyState();
    });
  }

  onSubscriptionSelect(value: Subscription) {
    this._globalStateService.setBusyState();
    delete this.selectedGeoRegion;
    this._getFunctionContainers(value.subscriptionId).subscribe(fc => {
      this.selectedSubscription = value;
      this.functionContainers = fc
        .map(c => ({
          displayLabel: `${c.name} (${c.location})`,
          value: c,
        }))
        .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));

      this._globalStateService.clearBusyState();
      this.functionContainerNameEvent.emit(this.functionContainerName);
    });
    this._getDynamicStampLocations(value.subscriptionId).subscribe(r => {
      this.geoRegions = r
        .map(e => ({ displayLabel: e.displayName, value: e.name }))
        .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));
      if (this.geoRegions.length === 0) {
        this.createError = this._translateService.instant(PortalResources.gettingStarted_subIsNotWhitelisted, {
          displayName: value.displayName,
          subscriptionId: value.subscriptionId,
        });
      } else {
        delete this.createError;
      }
    });
  }

  onGeoRegionChange(value: string) {
    this.selectedGeoRegion = value;
  }

  onContainerChange(value: FunctionContainer) {
    this.functionContainer = value;
  }

  openSelectedContainer() {
    this._warmUpFunctionApp(this.functionContainer.id);
    // this.userReady.emit(this.functionContainer);
    this._initializeDashboard(this.functionContainer);
  }

  login() {
    window.location.replace(`${window.location.protocol}//${window.location.hostname}/signin${window.location.search}`);
  }

  // http://stackoverflow.com/a/1349426/3234163
  makeId() {
    let text = '';
    const possible = 'abcdef123456789';

    for (let i = 0; i < 8; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }

  validateContainerName(name: string): Observable<{ isValid: boolean; reason: string }> {
    const regEx = /^[0-9a-zA-Z][0-9a-zA-Z-]*[a-zA-Z0-9]$/;

    if (name.length < 2) {
      return Observable.of({ isValid: false, reason: this._translateService.instant(PortalResources.gettingStarted_validateContainer1) });
    } else if (name.length > 60) {
      return Observable.of({ isValid: false, reason: this._translateService.instant(PortalResources.gettingStarted_validateContainer2) });
    } else if (!name.match(regEx)) {
      return Observable.of({ isValid: false, reason: this._translateService.instant(PortalResources.gettingStarted_validateContainer3) });
    } else {
      return this._validateSiteNameAvailable(this.selectedSubscription.subscriptionId, name).map(v => ({
        isValid: v,
        reason: this._translateService.instant(PortalResources.gettingStarted_validateContainer4, { funcName: name }),
      }));
    }
  }

  private _initializeDashboard(functionContainer: FunctionContainer | string) {
    if (this._redirectToIbizaIfNeeded(functionContainer)) {
      return;
    }

    if (typeof functionContainer !== 'string') {
      this._broadcastService.clearAllDirtyStates();

      if (this._startupInfo) {
        this._startupInfo.resourceId = functionContainer && functionContainer.id;
        this._userService.updateStartupInfo(this._startupInfo);
      }

      this._router.navigate(['/resources/apps'], { queryParams: Url.getQueryStringObj() });
    }
  }

  private _redirectToIbizaIfNeeded(functionContainer: FunctionContainer | string): boolean {
    if (
      !this._userService.inIFrame &&
      window.location.hostname !== 'localhost' &&
      window.location.search.indexOf('ibiza=disabled') === -1
    ) {
      const armId = typeof functionContainer === 'string' ? functionContainer : functionContainer.id;
      this._globalStateService.setBusyState();
      this._userService
        .getTenants()
        .retry(10)
        .subscribe(tenants => {
          const currentTenant = tenants.find(t => t.Current);
          const portalHostName = 'https://portal.azure.com';
          let environment = '';
          if (window.location.host.indexOf('staging') !== -1) {
            environment = '?websitesextension_ext=appsvc.env=stage';
          } else if (window.location.host.indexOf('next') !== -1) {
            environment = '?websitesextension_ext=appsvc.env=next';
          }

          window.location.replace(`${portalHostName}/${currentTenant.DomainName}${environment}#resource${armId}`);
        });
      return true;
    } else {
      return false;
    }
  }

  private _validateSiteNameAvailable(subscriptionId: string, containerName: string) {
    const id = `/subscriptions/${subscriptionId}/providers/Microsoft.Web/ishostnameavailable/${containerName}`;
    return this._armService.get(id, this._armService.antaresApiVersion20181101).map(r => <boolean>r.json().properties);
  }

  private _getDynamicStampLocations(subscriptionId: string): Observable<{ name: string; displayName: string }[]> {
    const dynamicUrl = `${
      this._armService.armUrl
    }/subscriptions/${subscriptionId}/providers/Microsoft.Web/georegions?sku=Dynamic&api-version=${
      this._armService.antaresApiVersion20181101
    }`;
    const geoFencedId = `/subscriptions/${subscriptionId}/providers/Microsoft.Web`;
    return Observable.zip(
      this._armService.send('GET', dynamicUrl).map(r => <{ name: string; displayName: string }[]>r.json().value.map(e => e.properties)),
      this._armService.get(geoFencedId, '2014-04-01').map(
        r => <string[]>[].concat.apply(
            [],
            r
              .json()
              .resourceTypes.filter(e => e.resourceType.toLowerCase() === 'sites')
              .map(e => e.locations)
          )
      ),
      (d: { name: string; displayName: string }[], g: string[]) => ({ dynamicEnabled: d, geoFenced: g })
    ).map(
      result =>
        <{ name: string; displayName: string }[]>(
          result.dynamicEnabled.filter(e => !!result.geoFenced.find(g => g.toLowerCase() === e.name.toLowerCase()))
        )
    );
  }

  private _warmUpFunctionApp(armId: string) {
    const siteName = armId.split('/').pop();
    this._http.get(`https://${siteName}.azurewebsites.net`).subscribe(r => console.log(r), e => console.log(e));
    this._armService.send('GET', `https://${siteName}.scm.azurewebsites.net`).subscribe(r => console.log(r), e => console.log(e));
  }

  private _getFunctionContainers(subscription: string) {
    const url = `${this._armService.armUrl}/subscriptions/${subscription}/resources?api-version=${
      this._armService.armApiVersion
    }&$filter=resourceType eq 'Microsoft.Web/sites'`;
    return this._armService.send('GET', url).map(r => {
      const sites: FunctionContainer[] = r.json().value;
      return sites.filter(ArmUtil.isFunctionApp);
    });
  }

  private _createFunctionContainerHelper(subscription: string, geoRegion: string, name: string) {
    const result = new Subject<FunctionContainer>();
    geoRegion = geoRegion.replace(/ /g, '');
    this._registerProviders(subscription, geoRegion, name, result);
    return result;
  }

  private _registerProviders(subscription: string, geoRegion: string, name: string, result: Subject<FunctionContainer>) {
    const providersId = `/subscriptions/${subscription}/providers`;
    const websiteRegisterId = `/subscriptions/${subscription}/providers/Microsoft.Web/register`;
    const storageRegisterId = `/subscriptions/${subscription}/providers/Microsoft.Storage/register`;

    const createApp = () =>
      this._getResourceGroup(subscription, geoRegion).subscribe(
        () => {
          this._getStorageAccount(subscription, geoRegion).subscribe(
            sa =>
              sa
                ? this._pullStorageAccount(subscription, geoRegion, sa, name, result)
                : this._createStorageAccount(subscription, geoRegion, name, result),
            () => this._createStorageAccount(subscription, geoRegion, name, result)
          );
        },
        () => this._createResourceGroup(subscription, geoRegion, name, result)
      );

    const registerProviders = (providers?: string[]) => {
      const observables: Observable<Response>[] = [];
      if (!providers || !providers.find(e => e.toLowerCase() === 'microsoft.web')) {
        observables.push(this._armService.post(websiteRegisterId, null, this._armService.antaresApiVersion20181101));
      }
      if (!providers || !providers.find(e => e.toLowerCase() === 'microsoft.storage')) {
        observables.push(this._armService.post(storageRegisterId, null, this._armService.storageApiVersion));
      }
      if (observables.length > 0) {
        Observable.forkJoin(observables).subscribe(() => createApp(), e => this.completeError(result, e));
      } else {
        createApp();
      }
    };

    this._armService
      .get(providersId, this._armService.armApiVersion)
      .map(
        r => <string[]>r
            .json()
            .value.filter(e => e['registrationState'] === 'Registered')
            .map(e => e['namespace'])
      )
      .subscribe(p => registerProviders(p), () => registerProviders());
  }

  private _getResourceGroup(subscription: string, geoRegion: string): Observable<ResourceGroup> {
    const id = `/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}`;
    return this._armService.get(id, this._armService.armApiVersion).map(r => r.json());
  }

  private _createResourceGroup(subscription: string, geoRegion: string, functionAppName: string, result: Subject<FunctionContainer>) {
    const id = `/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}`;
    const body = {
      location: geoRegion,
    };
    this._armService
      .put(id, body, this._armService.armApiVersion)
      .subscribe(() => this._createStorageAccount(subscription, geoRegion, functionAppName, result), e => this.completeError(result, e));
  }

  private _getStorageAccount(subscription: string, geoRegion: string): Observable<StorageAccountDeprecated> {
    const id = `/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}/providers/Microsoft.Storage/storageAccounts`;
    return this._armService.get(id, this._armService.storageApiVersion).map(r => {
      const accounts: StorageAccountDeprecated[] = r.json().value;
      return accounts.find(sa => sa.name.startsWith('azurefunctions'));
    });
  }

  private _pullStorageAccount(
    subscription: string,
    geoRegion: string,
    storageAccount: StorageAccountDeprecated | string,
    functionAppName: string,
    result: Subject<FunctionContainer>,
    count = 0
  ) {
    const id =
      typeof storageAccount === 'string'
        ? `/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}/providers/Microsoft.Storage/storageAccounts/${storageAccount}`
        : `/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}/providers/Microsoft.Storage/storageAccounts/${
            storageAccount.name
          }`;

    if (storageAccount && typeof storageAccount !== 'string' && storageAccount.properties.provisioningState === 'Succeeded') {
      this._getStorageAccountSecrets(subscription, geoRegion, storageAccount, functionAppName, result);
    } else {
      this._armService
        .get(id, this._armService.storageApiVersion)
        .map(r => <StorageAccountDeprecated>r.json())
        .subscribe(
          sa => {
            if (sa.properties.provisioningState === 'Succeeded') {
              this._getStorageAccountSecrets(subscription, geoRegion, sa, functionAppName, result);
            } else if (count < 100) {
              setTimeout(() => this._pullStorageAccount(subscription, geoRegion, storageAccount, functionAppName, result, count + 1), 400);
            } else {
              this._aiService.trackEvent('/errors/portal/storage/timeout', {
                count: count.toString(),
                geoRegion: geoRegion,
                subscription: subscription,
              });
              this.completeError(result, sa);
            }
          },
          e => {
            this._aiService.trackEvent('/errors/portal/storage/pull', {
              count: count.toString(),
              geoRegion: geoRegion,
              subscription: subscription,
            });
            this.completeError(result, e);
          }
        );
    }
  }

  private _createStorageAccount(subscription: string, geoRegion: string, functionAppName: string, result: Subject<FunctionContainer>) {
    const storageAccountName = `azurefunctions${this.makeId()}`;
    const id = `/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}/providers/Microsoft.Storage/storageAccounts/${storageAccountName}`;
    const body = {
      location: geoRegion,
      properties: {
        accountType: 'Standard_GRS',
      },
    };
    this._armService
      .put(id, body, this._armService.storageApiVersion)
      .retryWhen(e =>
        e
          .scan((errorCount: number, err: Response) => {
            if (errorCount >= 5) {
              throw err;
            }
            return errorCount + 1;
          }, 0)
          .delay(200)
      )
      .subscribe(
        () => this._pullStorageAccount(subscription, geoRegion, storageAccountName, functionAppName, result),
        e => this.completeError(result, e)
      );
  }

  private _createStorageAccountLock(
    subscription: string,
    geoRegion: string,
    storageAccount: string | StorageAccountDeprecated
  ): RxSubscription {
    const storageAccountName = typeof storageAccount !== 'string' ? storageAccount.name : storageAccount;
    const id = `/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}/providers/Microsoft.Storage/storageAccounts/${storageAccountName}/providers/Microsoft.Authorization/locks/${storageAccountName}`;
    const body = {
      properties: {
        level: 'CanNotDelete',
        notes: this._translateService.instant(PortalResources.storageLockNote),
      },
    };

    return this._armService.get(id, this._armService.armLocksApiVersion).subscribe(
      () => {},
      () => {
        return this._armService
          .put(id, body, this._armService.armLocksApiVersion)
          .retryWhen(e =>
            e
              .scan((errorCount: number, err: Response) => {
                if (errorCount >= 5) {
                  throw err;
                }
                return errorCount + 1;
              }, 0)
              .delay(200)
          )
          .subscribe();
      }
    );
  }
  private _getStorageAccountSecrets(
    subscription: string,
    geoRegion: string,
    storageAccount: StorageAccountDeprecated,
    functionAppName: string,
    result: Subject<FunctionContainer>
  ) {
    const id = `/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}/providers/Microsoft.Storage/storageAccounts/${
      storageAccount.name
    }/listKeys`;
    return this._armService
      .post(id, null, this._armService.storageApiVersion)
      .map(r => <{ key1: string; key2: string }>r.json())
      .subscribe(
        secrets => this._createFunctionApp(subscription, geoRegion, functionAppName, storageAccount, secrets, result),
        error => this.completeError(result, error)
      )
      .add(() => this._createStorageAccountLock(subscription, geoRegion, storageAccount));
  }

  private _createFunctionApp(
    subscription: string,
    geoRegion: string,
    name: string,
    storageAccount: StorageAccountDeprecated,
    secrets: { key1: string; key2: string },
    result: Subject<FunctionContainer>
  ) {
    const id = `/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}/providers/Microsoft.Web/sites/${name}`;
    const connectionString = `DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${secrets.key1}`;
    const body = {
      properties: {
        siteConfig: {
          appSettings: [
            { name: 'AzureWebJobsStorage', value: connectionString },
            { name: 'AzureWebJobsDashboard', value: connectionString },
            { name: Constants.runtimeVersionAppSettingName, value: this._configService.FunctionsVersionInfo.runtimeDefault },
            { name: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING', value: connectionString },
            { name: 'WEBSITE_CONTENTSHARE', value: name.toLocaleLowerCase() },
            { name: `${storageAccount.name}_STORAGE`, value: connectionString },
            { name: Constants.nodeVersionAppSettingName, value: Constants.nodeVersion },
          ],
        },
        sku: 'Dynamic',
        clientAffinityEnabled: false,
      },
      location: geoRegion,
      kind: 'functionapp',
    };

    this._armService
      .put(id, body, this._armService.antaresApiVersion20181101)
      .map(r => <FunctionContainer>r.json())
      .subscribe(r => this.complete(result, r), e => this.completeError(result, e));
  }

  private complete(o: Subject<FunctionContainer>, functionContainer: FunctionContainer) {
    o.next(functionContainer);
    o.complete();
  }

  private completeError(o: Subject<FunctionContainer>, error: any) {
    o.error(error);
  }
}
