import {Http, Headers} from 'angular2/http';
import {Injectable, EventEmitter} from 'angular2/core';
import {IArmService} from './iarm.service';
import {Subscription} from '../models/subscription';
import {FunctionContainer} from '../models/function-container';
import {Observable, Subscription as RxSubscription} from 'rxjs/Rx';
import {Subject} from 'rxjs/Subject';
import {StorageAccount} from '../models/storage-account';
import {ResourceGroup} from '../models/resource-group';

@Injectable()
export class ArmService implements IArmService {
    private token: string;
    private armUrl = 'https://management.azure.com';
    private armApiVersion = '2014-04-01'
    private storageApiVersion = '2015-05-01-preview';
    private websiteApiVersion = '2015-08-01';

    constructor(private _http: Http) {}

    Initialize() {
        var observable = this._http.get('api/token?plaintext=true')
        .map<string>(r => r.text());

        observable.subscribe(t => this.token = t);
        return observable;
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


    createFunctionContainer(subscription: string, geoRegion: string, name: string) {
        var result = new Subject<FunctionContainer>();
        geoRegion = geoRegion.replace(' ', '');
        var observable = Observable.create();
        this.getResrouceGroup(subscription, geoRegion)
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

        return result;
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
                        { name: 'FUNCTIONS_EXTENSION_VERSION', value: 'latest' },
                        { name: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING', value: connectionString },
                        { name: 'WEBSITE_CONTENTSHARE', value: name }
                    ]
                },
                scmType: 'LocalGit'
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
        o.complete();
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