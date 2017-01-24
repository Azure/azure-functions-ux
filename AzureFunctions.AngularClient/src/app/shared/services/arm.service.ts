import {Http, Headers, Response, Request} from '@angular/http';
import {Injectable, EventEmitter} from '@angular/core';
import {Subscription} from '../models/subscription';
import {FunctionContainer} from '../models/function-container';
import {Observable, Subscription as RxSubscription, Subject, ReplaySubject} from 'rxjs/Rx';
import {StorageAccount} from '../models/storage-account';
import {ResourceGroup} from '../models/resource-group';
import {UserService} from './user.service';
import {PublishingCredentials} from '../models/publishing-credentials';
import {Constants} from '../models/constants';
import {ClearCache} from '../decorators/cache.decorator';
import {AiService} from './ai.service';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../models/portal-resources';
import {ArmObj} from '../models/arm/arm-obj';

@Injectable()
export class ArmService {
    public subscriptions = new ReplaySubject<Subscription[]>(1);
    public armUrl = 'https://management.azure.com';

    private token: string;
    private armApiVersion = '2014-04-01'
    private armLocksApiVersion = '2015-01-01';
    private storageApiVersion = '2015-05-01-preview';
    public websiteApiVersion = '2015-08-01';

    constructor(private _http: Http,
        private _userService: UserService,
        private _aiService: AiService,
        private _translateService: TranslateService) {
        //Cant Get Angular to accept GlobalStateService as input param
        if ( !window.location.pathname.endsWith('/try')) {
            _userService.getStartupInfo().flatMap(info => {
                this.token = info.token;
                if(info.subscriptions && info.subscriptions.length > 0){
                    return Observable.of(info.subscriptions);
                }
                else{
                    return this.getSubscriptions();
                }
            })
            .subscribe(subs => this.subscriptions.next(subs));
        }
    }

    private getSubscriptions() {
        var url = `${this.armUrl}/subscriptions?api-version=2014-04-01`;
        return this._http.get(url, { headers: this.getHeaders() })
        .map<Subscription[]>(r => r.json().value);
    }

    getArmCacheResources(sub: string, type1 : string, type2? : string) {
        let url : string;
        if(!type2){
            url = `${this.armUrl}/subscriptions/${sub}/resources?api-version=${this.armApiVersion}&$filter=resourceType eq '${type1}'`;
        }
        else{
            url = `${this.armUrl}/subscriptions/${sub}/resources?api-version=${this.armApiVersion}&$filter=resourceType eq '${type1}' or resourceType eq '${type2}'`;
        }

        return this._http.get(url, { headers: this.getHeaders() })
        .map<ArmObj<any>[]>(r => {
            return r.json().value;
        });
    }

    send(method : string, url : string, body? : any, etag? : string, headers? : Headers){
        let request = new Request({
            url : url,
            method : method,
            search : null,
            headers :  headers ? headers : this.getHeaders(etag),
            body : body
        });

        return this._http.request(request);
    }


    deleteArmResource(resourceId : string, apiVersion? : string){
        var url = `${this.armUrl}${resourceId}?api-version=${apiVersion ? apiVersion : this.websiteApiVersion}`;
        return this._http.delete(url, {headers : this.getHeaders()});
    }

    putArmResource(resourceId : string, body : any, apiVersion? : string){
        var url = `${this.armUrl}${resourceId}?api-version=${apiVersion ? apiVersion : this.websiteApiVersion}`;
        return this._http.put(url, JSON.stringify(body), {headers : this.getHeaders()})
            .map<ArmObj<any>>(r => r.json());
    }

    ///////////////////

    getFunctionContainers(subscription: string) {
        var url = `${this.armUrl}/subscriptions/${subscription}/resources?api-version=${this.armApiVersion}&$filter=resourceType eq 'Microsoft.Web/sites'`;
        return this._http.get(url, { headers: this.getHeaders() })
        .map<FunctionContainer[]>(r => {
            var sites: FunctionContainer[] = r.json().value;
            return sites.filter(e => e.kind === 'functionapp');
        });
    }

    getFunctionContainer(armId: string) {
        var url = `${this.armUrl}${armId}?api-version=${this.websiteApiVersion}`;
        return this._http.get(url, { headers: this.getHeaders() }).map<FunctionContainer>(r => r.json());
    }

    getCanAccessAppSettings(armId: string) {
        var url = `${this.armUrl}${armId}/config/appsettings/list?api-version=${this.websiteApiVersion}`;
        return this._http.post(url, '', { headers: this.getHeaders() })
            .catch(e => Observable.of(undefined))
            .map<boolean>(r => !!r);
    }

    createFunctionContainer(subscription: string, geoRegion: string, name: string) {
        var result = new Subject<FunctionContainer>();
        geoRegion = geoRegion.replace(/ /g,'');
        this.registerProviders(subscription, geoRegion, name, result);
        return result;
    }

    getPublishingCredentials(functionContainer: FunctionContainer) {
        var url = `${this.armUrl}${functionContainer.id}/config/publishingcredentials/list?api-version=${this.websiteApiVersion}`;
        return this._http.post(url, '', { headers: this.getHeaders() })
            .map<PublishingCredentials>(r => r.json());
    }

    getFunctionContainerAppSettings(functionContainer: FunctionContainer) {
        var url = `${this.armUrl}${functionContainer.id}/config/appsettings/list?api-version=${this.websiteApiVersion}`;
        return this._http.post(url, '', { headers: this.getHeaders() })
            .map<{ [key: string]: string }>(r => r.json().properties);
    }

    @ClearCache('clearAllCachedData')
    updateFunctionContainerVersion(functionContainer: FunctionContainer, appSettings: { [key: string]: string }) {
        if (appSettings[Constants.azureJobsExtensionVersion]) {
            delete appSettings[Constants.azureJobsExtensionVersion];
        }
        appSettings[Constants.runtimeVersionAppSettingName] = Constants.runtimeVersion;
        appSettings[Constants.nodeVersionAppSettingName] = Constants.nodeVersion;
        var putUrl = `${this.armUrl}${functionContainer.id}/config/appsettings?api-version=${this.websiteApiVersion}`;
        return this._http.put(putUrl, JSON.stringify({ properties: appSettings }), { headers: this.getHeaders() })
                .map<{ [key: string]: string }>(r => r.json().properties);
    }

    getConfig(resourceId : string) {
        var url = `${this.armUrl}${resourceId}/config/web?api-version=${this.websiteApiVersion}`;
        return this._http.get(url, { headers: this.getHeaders() })
            .map<{ [key: string]: string }>(r => r.json().properties);
    }

    getAuthSettings(functionContainer: FunctionContainer) {
        let url = `${this.armUrl}${functionContainer.id}/config/authsettings/list?api-version=${this.websiteApiVersion}`;
        return this._http.post(url, '', { headers: this.getHeaders() })
            .map<{[key: string]: any}>(r => r.json().properties);
    }

    updateMemorySize(functionContainer: FunctionContainer, memorySize: string | number) {
        var nMemorySize = typeof memorySize === 'string' ? parseInt(memorySize) : memorySize;
        var url = `${this.armUrl}${functionContainer.id}?api-version=${this.websiteApiVersion}`;
        functionContainer.properties.containerSize = nMemorySize;
        return this._http.put(url, JSON.stringify(functionContainer), { headers: this.getHeaders() })
            .map<FunctionContainer>(r => r.json());
    }

    validateSiteNameAvailable(subscriptionId: string, containerName: string) {
        var url = `${this.armUrl}/subscriptions/${subscriptionId}/providers/Microsoft.Web/ishostnameavailable/${containerName}?api-version=${this.websiteApiVersion}`;
        return this._http.get(url, { headers: this.getHeaders() })
            .map<boolean>(r => r.json().properties);
    }

    getDynamicStampLocations(subscriptionId: string): Observable<{ name: string; displayName: string }[]> {
        var dynamicUrl = `${this.armUrl}/subscriptions/${subscriptionId}/providers/Microsoft.Web/georegions?sku=Dynamic&api-version=${this.websiteApiVersion}`;
        var geoFencedUrl = `${this.armUrl}/subscriptions/${subscriptionId}/providers/Microsoft.Web?api-version=2014-04-01`;
        return Observable.zip(
            this._http.get(dynamicUrl, { headers: this.getHeaders() }).map<{ name: string; displayName: string }[]>(r => r.json().value.map(e => e.properties)),
            this._http.get(geoFencedUrl, { headers: this.getHeaders() }).map<string[]>(r => [].concat.apply([], r.json().resourceTypes.filter(e => e.resourceType.toLowerCase() == 'sites').map(e => e.locations))),
            (d: {name: string, displayName: string}[], g: string[]) => ({dynamicEnabled: d, geoFenced: g})
        ).map<{ name: string; displayName: string }[]>(result => result.dynamicEnabled.filter(e => !!result.geoFenced.find(g => g.toLowerCase() === e.name.toLowerCase())));
    }

    warmUpFunctionApp(armId: string) {
        var siteName = armId.split('/').pop();
        this._http.get(`https://${siteName}.azurewebsites.net`)
            .subscribe(r => console.log(r), e => console.log(e));
        this._http.get(`https://${siteName}.scm.azurewebsites.net`, { headers: this.getHeaders() })
            .subscribe(r => console.log(r), e => console.log(e));
    }

    dailyMemory(container: FunctionContainer, value: number) {
        var url = `${this.armUrl}/${container.id}?api-version=${this.websiteApiVersion}`;

        var body = JSON.stringify({
            Location: container.location,
            Properties: {
                dailyMemoryTimeQuota: value
            }
        });

        return this._http.put(url, body, { headers: this.getHeaders() })
            .map(r => r.json());

    }

    private registerProviders(subscription: string, geoRegion: string, name: string, result: Subject<FunctionContainer>) {
        var providersUrl = `${this.armUrl}/subscriptions/${subscription}/providers?api-version=${this.armApiVersion}`;
        var websiteUrl = `${this.armUrl}/subscriptions/${subscription}/providers/Microsoft.Web/register?api-version=${this.websiteApiVersion}`;
        var storageUrl = `${this.armUrl}/subscriptions/${subscription}/providers/Microsoft.Storage/register?api-version=${this.storageApiVersion}`;

        var createApp = () => this.getResrouceGroup(subscription, geoRegion)
            .subscribe(
            rg => {
                this.getStorageAccount(subscription, geoRegion)
                    .subscribe(
                    sa => sa ? this.pullStorageAccount(subscription, geoRegion, sa, name, result) : this.createStorageAccount(subscription, geoRegion, name, result),
                    error => this.createStorageAccount(subscription, geoRegion, name, result)
                    );
            },
            error => this.createResoruceGroup(subscription, geoRegion, name, result)
            );

        var registerProviders = (providers?: string[]) => {
            var observables: Observable<Response>[] = [];
            if (!providers || !providers.find(e => e.toLowerCase() === 'microsoft.web')) {
                observables.push(this._http.post(websiteUrl, '', { headers: this.getHeaders() }));
            }
            if (!providers || !providers.find(e => e.toLowerCase() === 'microsoft.storage')) {
                observables.push(this._http.post(storageUrl, '', { headers: this.getHeaders() }));
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

        this._http.get(providersUrl, { headers: this.getHeaders() })
            .map<string[]>(r => r.json().value.filter(e => e['registrationState'] === 'Registered').map(e => e['namespace']))
            .subscribe(
            p => registerProviders(p),
            e => registerProviders());
    }



    private createFunctionApp(subscription: string, geoRegion: string, name: string, storageAccount: StorageAccount, secrets: { key1: string, key2: string }, result: Subject<FunctionContainer>) {
        var url = `${this.armUrl}/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}/providers/Microsoft.Web/sites/${name}?api-version=${this.websiteApiVersion}`;
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

        this._http.put(url, JSON.stringify(body), { headers: this.getHeaders() })
        .map<FunctionContainer>(r => r.json())
        .subscribe(
            r =>  this.complete(result, r),
            e => this.completeError(result, e));
    }


    private getStorageAccount(subscription: string, geoRegion: string): Observable<StorageAccount> {
        var url = `${this.armUrl}/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}/providers/Microsoft.Storage/storageAccounts?api-version=${this.storageApiVersion}`;
        return this._http.get(url, { headers: this.getHeaders() })
        .map<StorageAccount>(r => {
            var accounts: StorageAccount[] = r.json().value;
            return accounts.find(sa => sa.name.startsWith('azurefunctions'));
        });
    }

    private getResrouceGroup(subscription: string, geoRegion: string): Observable<ResourceGroup> {
        var url = `${this.armUrl}/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}?api-version=${this.armApiVersion}`;
        return this._http.get(url, { headers: this.getHeaders() })
        .map<ResourceGroup>(r => r.json());
    }

    private createResoruceGroup(subscription: string, geoRegion: string, functionAppName: string, result: Subject<FunctionContainer>) {
        var url = `${this.armUrl}/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}?api-version=${this.armApiVersion}`;
        var body = {
            location: geoRegion
        };
        this._http.put(url, JSON.stringify(body), { headers: this.getHeaders() })
        .subscribe(
            r => this.createStorageAccount(subscription, geoRegion, functionAppName, result),
            e => this.completeError(result, e));
    }

    private createStorageAccount(subscription: string, geoRegion: string, functionAppName: string, result: Subject<FunctionContainer>) {
        var storageAccountName = `azurefunctions${this.makeId()}`;
        var url = `${this.armUrl}/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}/providers/Microsoft.Storage/storageAccounts/${storageAccountName}?api-version=${this.storageApiVersion}`;
        var body = {
            location: geoRegion,
            properties: {
                accountType: 'Standard_GRS'
            }
        };
        this._http.put(url, JSON.stringify(body), { headers: this.getHeaders() })
        .retryWhen(e => e.scan<number>((errorCount, err: Response) => {
            if (errorCount >= 5) {
                throw err;
            }
            return errorCount + 1;
        }, 0).delay(200))
        .subscribe(
            r => this.pullStorageAccount(subscription, geoRegion, storageAccountName, functionAppName, result),
            e => this.completeError(result, e));
    }

    private pullStorageAccount(subscription: string, geoRegion: string, storageAccount: StorageAccount | string, functionAppName: string, result: Subject<FunctionContainer>, count = 0) {
        var url = typeof storageAccount === 'string'
        ? `${this.armUrl}/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}/providers/Microsoft.Storage/storageAccounts/${storageAccount}?api-version=${this.storageApiVersion}`
        : `${this.armUrl}/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}/providers/Microsoft.Storage/storageAccounts/${storageAccount.name}?api-version=${this.storageApiVersion}`;

        if (storageAccount &&
            typeof storageAccount !== 'string' &&
            storageAccount.properties.provisioningState === 'Succeeded') {
            this.getStorageAccountSecrets(subscription, geoRegion, storageAccount, functionAppName, result);
        } else  {
            this._http.get(url, { headers: this.getHeaders() })
                .map<StorageAccount>(r => r.json())
                .subscribe(
                sa => {
                    if (sa.properties.provisioningState === 'Succeeded') {
                        this.getStorageAccountSecrets(subscription, geoRegion, sa, functionAppName, result)
                    } else if (count < 100) {
                        setTimeout(() => this.pullStorageAccount(subscription, geoRegion, storageAccount, functionAppName, result, count + 1), 400)
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

    private createStorageAccountLock(subscription: string, geoRegion: string, storageAccount: string | StorageAccount, functionAppName: string): RxSubscription {
        let storageAccountName = typeof storageAccount !== 'string' ? storageAccount.name : storageAccount;
        let url = `${this.armUrl}/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}/providers/Microsoft.Storage/storageAccounts/${storageAccountName}/providers/Microsoft.Authorization/locks/${storageAccountName}?api-version=${this.armLocksApiVersion}`;
        var body = {
            properties: {
                level: 'CanNotDelete',
                notes: this._translateService.instant(PortalResources.storageLockNote)
            }
        };

        return this._http.get(url, { headers: this.getHeaders() })
            .subscribe(r => {
            }, error => {
                return this._http.put(url, JSON.stringify(body), { headers: this.getHeaders() })
                    .retryWhen(e => e.scan<number>((errorCount, err: Response) => {
                        if (errorCount >= 5) {
                            throw err;
                        }
                        return errorCount + 1;
                    }, 0).delay(200))
                    .subscribe();
            });
    }
    private getStorageAccountSecrets(subscription: string, geoRegion: string, storageAccount: StorageAccount, functionAppName: string, result: Subject<FunctionContainer>) {
        var url = `${this.armUrl}/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}/providers/Microsoft.Storage/storageAccounts/${storageAccount.name}/listKeys?api-version=${this.storageApiVersion}`;
        return this._http.post(url, '', { headers: this.getHeaders() })
        .map<{ key1: string, key2: string }>(r => r.json())
        .subscribe(
            secrets => this.createFunctionApp(subscription, geoRegion, functionAppName, storageAccount, secrets, result),
            error => this.completeError(result, error)
        ).add(() => this.createStorageAccountLock(subscription, geoRegion, storageAccount, functionAppName));

    }

    private complete(o: Subject<FunctionContainer>, functionContainer: FunctionContainer) {
        o.next(functionContainer);
        o.complete();
    }

    private completeError(o: Subject<FunctionContainer>, error: any) {
        o.error(error);
    }

    private getHeaders(etag?: string): Headers {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Authorization', `Bearer ${this.token}`);

        if(etag){
            headers.append('If-None-Match', etag);
        }

        return headers;
    }

    // http://stackoverflow.com/a/1349426/3234163
    makeId() {
        var text = '';
        var possible = 'abcdef123456789';

        for (var i = 0; i < 8; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
}