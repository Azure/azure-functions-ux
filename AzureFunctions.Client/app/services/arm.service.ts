import {Http, Headers, Response} from '@angular/http';
import {Injectable, EventEmitter} from '@angular/core';
import {Subscription} from '../models/subscription';
import {FunctionContainer} from '../models/function-container';
import {Observable, Subscription as RxSubscription, Subject} from 'rxjs/Rx';
import {StorageAccount} from '../models/storage-account';
import {ResourceGroup} from '../models/resource-group';
import {UserService} from './user.service';
import {PublishingCredentials} from '../models/publishing-credentials';
import {Constants} from '../models/constants';

@Injectable()
export class ArmService {
    private token: string;
    private armUrl = 'https://management.azure.com';
    private armApiVersion = '2014-04-01'
    private storageApiVersion = '2015-05-01-preview';
    private websiteApiVersion = '2015-08-01';

    constructor(private _http: Http, private _userService: UserService) {
        //Cant Get Angular to accept GlobalStateService as input param
        if ( !window.location.pathname.endsWith('/try')) {
            _userService.getToken().subscribe(t => this.token = t);
        }
    }

    getSubscriptions() {
        var url = `${this.armUrl}/subscriptions?api-version=2014-04-01`;
        return this._http.get(url, { headers: this.getHeaders() })
        .map<Subscription[]>(r => r.json().value);
    }

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

    createFunctionContainer(subscription: string, geoRegion: string, name: string) {
        var result = new Subject<FunctionContainer>();
        geoRegion = geoRegion.replace(' ', '');
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

    updateFunctionContainerVersion(functionContainer: FunctionContainer, appSettings: { [key: string]: string }) {
        appSettings[Constants.extensionVersionAppSettingName] = Constants.latestExtensionVersion;
        var putUrl = `${this.armUrl}${functionContainer.id}/config/appsettings?api-version=${this.websiteApiVersion}`;
        return this._http.put(putUrl, JSON.stringify({ properties: appSettings }), { headers: this.getHeaders() })
                .map<{ [key: string]: string }>(r => r.json().properties);
    }

    getConfig(functionContainer: FunctionContainer) {
        var url = `${this.armUrl}${functionContainer.id}/config/web?api-version=${this.websiteApiVersion}`;
        return this._http.get(url, { headers: this.getHeaders() })
            .map<{ [key: string]: string }>(r => r.json().properties);
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
        var url = `${this.armUrl}/subscriptions/${subscriptionId}/providers/Microsoft.Web/georegions?sku=Dynamic&api-version=${this.websiteApiVersion}`;
        return this._http.get(url, { headers: this.getHeaders() })
            .map<{ name: string; displayName: string }[]>(r => r.json().value.map(e => e.properties));
    }

    warmUpFunctionApp(armId: string) {
        var siteName = armId.split('/').pop();
        this._http.get(`https://${siteName}.azurewebsites.net`)
            .subscribe(r => console.log(r), e => console.log(e));
        this._http.get(`https://${siteName}.scm.azurewebsites.net`, { headers: this.getHeaders() })
            .subscribe(r => console.log(r), e => console.log(e));
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
                        { name: Constants.extensionVersionAppSettingName, value: Constants.latestExtensionVersion },
                        { name: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING', value: connectionString },
                        { name: 'WEBSITE_CONTENTSHARE', value: name.toLocaleLowerCase() },
                        { name: `${storageAccount.name}_STORAGE`, value: connectionString },
                        { name: 'AZUREJOBS_EXTENSION_VERSION', value: 'beta' },
                        { name: 'WEBSITE_NODE_DEFAULT_VERSION', value: '4.1.2' }
                    ]
                },
                sku: 'Dynamic'
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
        .retryWhen(e => e.scan<number>((errorCount, err) => {
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
            (storageAccount.properties.provisioningState === 'Succeeded' || storageAccount.properties.provisioningState === 'ResolvingDNS')) {
            this.getStorageAccountSecrets(subscription, geoRegion, storageAccount, functionAppName, result);
        } else  {
            this._http.get(url, { headers: this.getHeaders() })
                .map<StorageAccount>(r => r.json())
                .subscribe(
                sa => {
                    if (sa.properties.provisioningState === 'Succeeded' || sa.properties.provisioningState === 'ResolvingDNS') {
                        this.getStorageAccountSecrets(subscription, geoRegion, sa, functionAppName, result);
                    } else if (count < 10) {
                        setTimeout(() => this.pullStorageAccount(subscription, geoRegion, storageAccount, functionAppName, result, count + 1), 200)
                    } else {
                        console.log('there was an error creating Storage Account')
                        this.completeError(result, sa);
                    }
                },
                e => this.completeError(result, e)
                );
        }
    }

    private getStorageAccountSecrets(subscription: string, geoRegion: string, storageAccount: StorageAccount, functionAppName: string, result: Subject<FunctionContainer>) {
        var url = `${this.armUrl}/subscriptions/${subscription}/resourceGroups/AzureFunctions-${geoRegion}/providers/Microsoft.Storage/storageAccounts/${storageAccount.name}/listKeys?api-version=${this.storageApiVersion}`;
        this._http.post(url, '', { headers: this.getHeaders() })
        .map<{ key1: string, key2: string }>(r => r.json())
        .subscribe(
            secrets => this.createFunctionApp(subscription, geoRegion, functionAppName, storageAccount, secrets, result),
            error => this.completeError(result, error)
            );
    }

    private complete(o: Subject<FunctionContainer>, functionContainer: FunctionContainer) {
        o.next(functionContainer);
        o.complete();
    }

    private completeError(o: Subject<FunctionContainer>, error: any) {
        o.error(error);
    }

    private getHeaders(): Headers {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', `Bearer ${this.token}`);
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