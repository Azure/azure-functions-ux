import { Constants } from './../shared/models/constants';
import { Response, Http } from '@angular/http';
import { StorageAccount } from './../shared/models/storage-account';
import { ResourceGroup } from './../shared/models/resource-group';
import {Component, Input, Output, EventEmitter, OnInit, OnChanges} from '@angular/core';
import {UserService} from '../shared/services/user.service';
import {FunctionsService} from '../shared/services/functions.service';
import {BroadcastService} from '../shared/services/broadcast.service';
import {BroadcastEvent} from '../shared/models/broadcast-event'
import {User} from '../shared/models/user';
import {Subscription} from '../shared/models/subscription';
import {DropDownElement} from '../shared/models/drop-down-element';
import {ArmService} from '../shared/services/arm.service';
import {FunctionContainer} from '../shared/models/function-container';
import { Observable, Subject, Subscription as RxSubscription } from 'rxjs/Rx';
import {TelemetryService} from '../shared/services/telemetry.service';
import {GlobalStateService} from '../shared/services/global-state.service';
import {TenantInfo} from '../shared/models/tenant-info';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../shared/models/portal-resources';
import {AiService} from '../shared/services/ai.service';

@Component({
  selector: 'getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.scss']
})

export class GettingStartedComponent implements OnInit {
    @Output() userReady: EventEmitter<FunctionContainer>;

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

    private functionContainer: FunctionContainer;
    constructor(
        private _userService: UserService,
        private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService,
        private _armService: ArmService,
        private _telemetryService: TelemetryService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _aiService: AiService,
        private _http: Http
    ) {
        this.isValidContainerName = true;
        //http://stackoverflow.com/a/8084248/3234163
        var secret = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        this.functionContainerName = `functions${this.makeId()}`;
        this.functionContainers = [];
        this.userReady = new EventEmitter<FunctionContainer>();
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
        this._userService.getStartupInfo().subscribe(() =>
            this._userService.getTenants().subscribe(tenants => {

                    this._armService.subscriptions.subscribe(subs => {
                        this.subscriptions = subs
                            .map(e => ({ displayLabel: e.displayName, value: e }))
                            .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));
                        // this._globalStateService.clearBusyState();
                    });

            })
        );

        this._userService.getUser()
            .subscribe(u => {
                this.user = u;
                this._globalStateService.clearBusyState();
            });
    }

    createFunctionsContainer() {
        delete this.createError;
        this._globalStateService.setBusyState();
        this._telemetryService.track('gettingstarted-create-functionapp');
        this._createFunctionContainerHelper(this.selectedSubscription.subscriptionId, this.selectedGeoRegion, this.functionContainerName)
            .subscribe(r => {
                this.userReady.emit(r);
                this._globalStateService.clearBusyState();
            });
    }

    onSubscriptionSelect(value: Subscription) {
        this._globalStateService.setBusyState();
        delete this.selectedGeoRegion;
        this._getFunctionContainers(value.subscriptionId)
            .subscribe(fc => {
                this.selectedSubscription = value;
                this.functionContainers = fc
                    .map(c => ({
                        displayLabel: `${c.name} (${c.location})`,
                        value: c
                    }))
                    .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));

                this._globalStateService.clearBusyState();
                this.functionContainerNameEvent.emit(this.functionContainerName);
            });
        this._getDynamicStampLocations(value.subscriptionId)
            .subscribe(r => {
                this.geoRegions = r
                    .map(e => ({ displayLabel: e.displayName, value: e.name }))
                    .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));
                if (this.geoRegions.length === 0) {
                    this.createError = this._translateService.instant(PortalResources.gettingStarted_subIsNotWhitelisted, {displayName: value.displayName, subscriptionId: value.subscriptionId });
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
        this.userReady.emit(this.functionContainer);
    }

    login() {
        window.location.replace(`${window.location.protocol}//${window.location.hostname}/signin${window.location.search}`);
    }

    // http://stackoverflow.com/a/1349426/3234163
    makeId() {
        var text = '';
        var possible = 'abcdef123456789';

        for (var i = 0; i < 8; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    validateContainerName(name: string): Observable<{ isValid: boolean; reason: string }> {
        var regEx = /^[0-9a-zA-Z][0-9a-zA-Z-]*[a-zA-Z0-9]$/;

        if (name.length < 2) {
            return Observable.of({ isValid: false, reason: this._translateService.instant(PortalResources.gettingStarted_validateContainer1) });
        } else if (name.length > 60) {
            return Observable.of({ isValid: false, reason: this._translateService.instant(PortalResources.gettingStarted_validateContainer2) });
        } else if (!name.match(regEx)) {
            return Observable.of({ isValid: false, reason: this._translateService.instant(PortalResources.gettingStarted_validateContainer3) });
        } else {
            return this._validateSiteNameAvailable(this.selectedSubscription.subscriptionId, name)
                .map(v => ({ isValid: v, reason: this._translateService.instant(PortalResources.gettingStarted_validateContainer4, { funcName: name }) }));
        }
    }

    private _validateSiteNameAvailable(subscriptionId: string, containerName: string) {
        var id = `/subscriptions/${subscriptionId}/providers/Microsoft.Web/ishostnameavailable/${containerName}`;
        return this._armService.get(id, this._armService.websiteApiVersion)
            .map(r => <boolean>(r.json().properties));
    }

    private _getDynamicStampLocations(subscriptionId: string): Observable<{ name: string; displayName: string }[]> {
        var dynamicUrl = `${this._armService.armUrl}/subscriptions/${subscriptionId}/providers/Microsoft.Web/georegions?sku=Dynamic&api-version=${this._armService.websiteApiVersion}`;
        var geoFencedId = `/subscriptions/${subscriptionId}/providers/Microsoft.Web`;
        return Observable.zip(
            this._armService.send("GET", dynamicUrl).map(r => <{ name: string; displayName: string }[]>(r.json().value.map(e => e.properties))),
            this._armService.get(geoFencedId, "2014-04-01").map(r => <string[]>([].concat.apply([], r.json().resourceTypes.filter(e => e.resourceType.toLowerCase() == 'sites').map(e => e.locations)))),
            (d: {name: string, displayName: string}[], g: string[]) => ({dynamicEnabled: d, geoFenced: g})
        ).map(result => <{ name: string; displayName: string }[]>(result.dynamicEnabled.filter(e => !!result.geoFenced.find(g => g.toLowerCase() === e.name.toLowerCase()))));
    }

    private _warmUpFunctionApp(armId: string) {
        var siteName = armId.split('/').pop();
        this._http.get(`https://${siteName}.azurewebsites.net`)
            .subscribe(r => console.log(r), e => console.log(e));
        this._armService.send("GET", `https://${siteName}.scm.azurewebsites.net`)
            .subscribe(r => console.log(r), e => console.log(e));
    }

    private _getFunctionContainers(subscription: string) {
        var url = `${this._armService.armUrl}/subscriptions/${subscription}/resources?api-version=${this._armService.armApiVersion}&$filter=resourceType eq 'Microsoft.Web/sites'`;
        return this._armService.send("GET", url)
        .map(r => {
            var sites: FunctionContainer[] = r.json().value;
            return sites.filter(e => e.kind === 'functionapp');
        });
    }

    private _createFunctionContainerHelper(subscription: string, geoRegion: string, name: string) {
        var result = new Subject<FunctionContainer>();
        geoRegion = geoRegion.replace(/ /g,'');
        this._registerProviders(subscription, geoRegion, name, result);
        return result;
    }

    private _registerProviders(subscription: string, geoRegion: string, name: string, result: Subject<FunctionContainer>) {
        var providersId = `/subscriptions/${subscription}/providers`;
        var websiteRegisterId = `/subscriptions/${subscription}/providers/Microsoft.Web/register`;
        var storageRegisterId = `/subscriptions/${subscription}/providers/Microsoft.Storage/register`;

        var createApp = () => this._getResourceGroup(subscription, geoRegion)
            .subscribe(
            rg => {
                this._getStorageAccount(subscription, geoRegion)
                    .subscribe(
                    sa => sa ? this._pullStorageAccount(subscription, geoRegion, sa, name, result) : this._createStorageAccount(subscription, geoRegion, name, result),
                    error => this._createStorageAccount(subscription, geoRegion, name, result)
                    );
            },
            error => this._createResourceGroup(subscription, geoRegion, name, result)
            );

        var registerProviders = (providers?: string[]) => {
            var observables: Observable<Response>[] = [];
            if (!providers || !providers.find(e => e.toLowerCase() === 'microsoft.web')) {
                observables.push(this._armService.post(websiteRegisterId, null, this._armService.websiteApiVersion));
            }
            if (!providers || !providers.find(e => e.toLowerCase() === 'microsoft.storage')) {
                observables.push(this._armService.post(storageRegisterId, null, this._armService.storageApiVersion));
            }
            if (observables.length > 0) {
                Observable.forkJoin(observables)
                    .subscribe(
                    r => createApp(),
                    e => this.completeError(result, e));
            } else {
                createApp();
            }
        };

        this._armService.get(providersId, this._armService.armApiVersion )
            .map(r => <string[]>(r.json().value.filter(e => e['registrationState'] === 'Registered').map(e => e['namespace'])))
            .subscribe(
            p => registerProviders(p),
            e => registerProviders());
    }

    private _getResourceGroup(subscription: string, geoRegion: string): Observable<ResourceGroup> {
        var id = `/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}`;
        return this._armService.get(id, this._armService.armApiVersion)
        .map(r => r.json());
    }

    private _createResourceGroup(subscription: string, geoRegion: string, functionAppName: string, result: Subject<FunctionContainer>) {
        var id = `/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}`;
        var body = {
            location: geoRegion
        };
        this._armService.put(id, body, this._armService.armApiVersion)
        .subscribe(
            r => this._createStorageAccount(subscription, geoRegion, functionAppName, result),
            e => this.completeError(result, e));
    }

    private _getStorageAccount(subscription: string, geoRegion: string): Observable<StorageAccount> {
        var id = `/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}/providers/Microsoft.Storage/storageAccounts`;
        return this._armService.get(id, this._armService.storageApiVersion)
        .map(r => {
            var accounts: StorageAccount[] = r.json().value;
            return accounts.find(sa => sa.name.startsWith('azurefunctions'));
        });
    }

    private _pullStorageAccount(subscription: string, geoRegion: string, storageAccount: StorageAccount | string, functionAppName: string, result: Subject<FunctionContainer>, count = 0) {
        var id = typeof storageAccount === 'string'
        ? `/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}/providers/Microsoft.Storage/storageAccounts/${storageAccount}`
        : `/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}/providers/Microsoft.Storage/storageAccounts/${storageAccount.name}`;

        if (storageAccount &&
            typeof storageAccount !== 'string' &&
            storageAccount.properties.provisioningState === 'Succeeded') {
            this._getStorageAccountSecrets(subscription, geoRegion, storageAccount, functionAppName, result);
        } else  {
            this._armService.get(id, this._armService.storageApiVersion)
                .map(r => <StorageAccount>(r.json()))
                .subscribe(
                sa => {
                    if (sa.properties.provisioningState === 'Succeeded') {
                        this._getStorageAccountSecrets(subscription, geoRegion, sa, functionAppName, result)
                    } else if (count < 100) {
                        setTimeout(() => this._pullStorageAccount(subscription, geoRegion, storageAccount, functionAppName, result, count + 1), 400)
                    } else {
                        this._aiService.trackEvent('/errors/portal/storage/timeout', {count : count.toString(), geoRegion: geoRegion, subscription: subscription})
                        this.completeError(result, sa);
                    }
                },
                e => {
                    this._aiService.trackEvent('/errors/portal/storage/pull', {count : count.toString(), geoRegion: geoRegion, subscription: subscription})
                    this.completeError(result, e);
                });
        }
    }

    private _createStorageAccount(subscription: string, geoRegion: string, functionAppName: string, result: Subject<FunctionContainer>) {
        var storageAccountName = `azurefunctions${this.makeId()}`;
        var id = `/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}/providers/Microsoft.Storage/storageAccounts/${storageAccountName}`;
        var body = {
            location: geoRegion,
            properties: {
                accountType: 'Standard_GRS'
            }
        };
        this._armService.put(id, body, this._armService.storageApiVersion)
        .retryWhen(e => e.scan((errorCount : number, err: Response) => {
            if (errorCount >= 5) {
                throw err;
            }
            return errorCount + 1;
        }, 0).delay(200))
        .subscribe(
            r => this._pullStorageAccount(subscription, geoRegion, storageAccountName, functionAppName, result),
            e => this.completeError(result, e));
    }

    private _createStorageAccountLock(subscription: string, geoRegion: string, storageAccount: string | StorageAccount, functionAppName: string): RxSubscription {
        let storageAccountName = typeof storageAccount !== 'string' ? storageAccount.name : storageAccount;
        let id = `/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}/providers/Microsoft.Storage/storageAccounts/${storageAccountName}/providers/Microsoft.Authorization/locks/${storageAccountName}`;
        var body = {
            properties: {
                level: 'CanNotDelete',
                notes: this._translateService.instant(PortalResources.storageLockNote)
            }
        };

        return this._armService.get(id, this._armService.armLocksApiVersion)
            .subscribe(r => {
            }, error => {
                return this._armService.put(id, body, this._armService.armLocksApiVersion)
                    .retryWhen(e => e.scan((errorCount : number, err: Response) => {
                        if (errorCount >= 5) {
                            throw err;
                        }
                        return errorCount + 1;
                    }, 0).delay(200))
                    .subscribe();
            });
    }
    private _getStorageAccountSecrets(subscription: string, geoRegion: string, storageAccount: StorageAccount, functionAppName: string, result: Subject<FunctionContainer>) {
        var id = `/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}/providers/Microsoft.Storage/storageAccounts/${storageAccount.name}/listKeys`;
        return this._armService.post(id, null, this._armService.storageApiVersion)
        .map(r => <{ key1: string, key2: string }>(r.json()))
        .subscribe(
            secrets => this._createFunctionApp(subscription, geoRegion, functionAppName, storageAccount, secrets, result),
            error => this.completeError(result, error)
        ).add(() => this._createStorageAccountLock(subscription, geoRegion, storageAccount, functionAppName));

    }

    private _createFunctionApp(subscription: string, geoRegion: string, name: string, storageAccount: StorageAccount, secrets: { key1: string, key2: string }, result: Subject<FunctionContainer>) {
        var id = `/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}/providers/Microsoft.Web/sites/${name}`;
        var connectionString = `DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${secrets.key1}`;
        var body = {
            properties: {
                siteConfig: {
                    appSettings: [
                        { name: 'AzureWebJobsStorage', value: connectionString },
                        { name: 'AzureWebJobsDashboard', value: connectionString },
                        { name: Constants.runtimeVersionAppSettingName, value: Constants.runtimeVersion },
                        { name: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING', value: connectionString },
                        { name: 'WEBSITE_CONTENTSHARE', value: name.toLocaleLowerCase() },
                        { name: `${storageAccount.name}_STORAGE`, value: connectionString },
                        { name: Constants.nodeVersionAppSettingName, value: Constants.nodeVersion }
                    ]
                },
                sku: 'Dynamic',
                clientAffinityEnabled: false
            },
            location: geoRegion,
            kind: 'functionapp'
        };

        this._armService.put(id, body, this._armService.websiteApiVersion)
        .map(r => <FunctionContainer>(r.json()))
        .subscribe(
            r =>  this.complete(result, r),
            e => this.completeError(result, e));
    }


    private complete(o: Subject<FunctionContainer>, functionContainer: FunctionContainer) {
        o.next(functionContainer);
        o.complete();
    }

    private completeError(o: Subject<FunctionContainer>, error: any) {
        o.error(error);
    }


}
