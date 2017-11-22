import { HttpMethods } from './../../shared/models/constants';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { Headers } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import { BindingComponent } from '../../binding/binding.component';
import { FunctionNewComponent } from '../../function/function-new/function-new.component';
import { CacheService } from '../../shared/services/cache.service';
import { AiService } from '../../shared/services/ai.service';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { MobileAppsClient } from '../../shared/models/mobile-apps-client';
import { PickerInput } from '../../shared/models/binding-input';
import { MSGraphConstants, AADPermissions, AADRegistrationInfo } from '../../shared/models/microsoft-graph';
import { FunctionAppContext } from 'app/shared/function-app-context';

declare const Buffer: any;
declare var require: any;

export class MicrosoftGraphHelper {
    public binding?: BindingComponent;
    public function?: FunctionNewComponent;
    private _dataRetriever: MobileAppsClient;
    private _token: string;
    private _jwt: any;
    private setClientSecret = false;

    constructor(
        private context: FunctionAppContext,
        private _functionAppService: FunctionAppService,
        private _cacheService: CacheService,
        private _aiService?: AiService) {
        if (_aiService) {
            this._dataRetriever = new MobileAppsClient(this.context.mainSiteUrl);
        }
    }

    getADDAppRegistrationInfo(necessaryAADPermisisons: AADPermissions[], graphToken: string): Observable<AADRegistrationInfo> {
        const cloneNecessaryAADPermisisons = JSON.parse(JSON.stringify(necessaryAADPermisisons));
        const rootUri = this.getRootUri(graphToken);

        const result: AADRegistrationInfo = {
            isPermissionConfigured: false,
            isAADAppCreated: false,
            permissions: cloneNecessaryAADPermisisons
        };
        return this.checkForExistingAAD(rootUri)
            .flatMap(applicationInformation => {
                // If it already exists, check to see if it has necessary client secret & resources
                let existingApplication: any;
                if (applicationInformation) {
                    existingApplication = applicationInformation.json().value[0];
                }
                if (existingApplication) {
                    result.isAADAppCreated = true;
                    result.isPermissionConfigured = true;

                    // Check if app has all required resource permissions
                    if (!existingApplication.requiredResourceAccess) {
                        existingApplication.requiredResourceAccess = [];
                    }

                    let appPerm = null;

                    result.permissions.forEach(requiredPerm => {
                        const findPerm = existingApplication.requiredResourceAccess.find(p => {
                            if (p.resourceAppId.toLocaleLowerCase() === requiredPerm.resourceAppId.toLocaleLowerCase()) {
                                appPerm = p;
                                return true;
                            } else {
                                return false;
                            }
                        });
                        if (findPerm) {
                            requiredPerm.resourceAccess.forEach(requiredAccess => {
                                const findAccess = appPerm.resourceAccess.find(appAccess => {
                                    return requiredAccess.id.toLocaleLowerCase() === appAccess.id.toLocaleLowerCase();
                                });

                                requiredAccess.configured = !!findAccess;
                            });
                        }
                    });
                    result.permissions.forEach(p => {
                        p.resourceAccess.forEach(ra => {
                            if (!ra.configured) {
                                result.isPermissionConfigured = false;
                            }
                        });
                    });

                    return Observable.of(result);
                } else {
                    return Observable.of(result);
                }
            });

    }

    configureAAD(necessaryAADPermisisons: AADPermissions[], graphToken: string): Observable<any> {
        const rootUri = this.getRootUri(graphToken);
        // If it does not exist, create it & set necessary resources
        const appUri = this.context.mainSiteUrl
        const name = this.context.site.name;

        const app = {
            displayName: name,
            homepage: appUri,
            identifierUris: [appUri],
            replyUrls: [trimTrailingSlash(appUri) + MSGraphConstants.General.AADReplyUrl],
            passwordCredentials: [GeneratePasswordCredentials()],
            requiredResourceAccess: necessaryAADPermisisons
        };
        const pwCreds = app.passwordCredentials[0];

        const application = JSON.stringify(app);
        return this.sendRequest(rootUri, '/applications', 'POST', application)
            .do(null, err => {
                if (this._aiService) {
                    this._aiService.trackException(err, 'Error while creating new AAD application');
                }
            })
            .flatMap(response => {
                const newApplication = JSON.parse(response._body);
                return this.setAuthSettings(newApplication.appId, this._jwt, pwCreds.value, app.replyUrls);
            });

    }

    addPermissions(necessaryAADPermisisons: AADPermissions[], graphToken: string): Observable<any> {
        this._token = graphToken;
        const jwt = parseToken(this._token);

        if (!jwt) {
            throw Error('Unable to parse MS Graph JWT; cannot retrieve audience or tenant ID');
        }
        const rootUri = jwt.aud + jwt.tid; // audience + tenantId

        return this.checkForExistingAAD(rootUri)
            .flatMap(applicationInformation => {
                // If it already exists, check to see if it has necessary client secret & resources
                let existingApplication: any = {};
                if (applicationInformation) {
                    existingApplication = applicationInformation.json().value[0];
                }
                if (existingApplication) {

                    // Legacy reasons: check for client secret (Easy Auth used to not set Client Secret automatically)
                    if (this.setClientSecret) {
                        this.createClientSecret(rootUri, existingApplication.objectId).subscribe(() => {
                            this.setClientSecret = false;
                        },
                            error => {
                                if (this._aiService) {
                                    this._aiService.trackException(error, 'Could not update AAD manifest\'s client secret');
                                }
                            });
                    }
                    const patch: any = {};
                    patch.value = CompareResources(existingApplication.requiredResourceAccess, necessaryAADPermisisons);
                    return this.sendRequest(rootUri, '/applications/' + existingApplication.objectId + '/requiredResourceAccess', 'PATCH', JSON.stringify(patch));
                } else {
                    return Observable.of(null);
                }
            });
    }

    openLogin(input: PickerInput): Promise<any> {
        const options = {
            parameters: {
                prompt: 'login'
            }
        };

        return this._dataRetriever.retrieveOID(options, input);
    }

    // Set long list of auth settings needed by Easy Auth
    private setAuthSettings(applicationId: string, jwt, clientSecret, replyUrls) {
        const authSettings = new Map<string, any>();
        authSettings.set('enabled', true);
        authSettings.set('unauthenticatedClientAction', 'AllowAnonymous');
        authSettings.set('tokenStoreEnabled', true);
        authSettings.set('allowedExternalRedirectUrls', window.location.hostname);
        authSettings.set('defaultProvider', 'AzureActiveDirectory');
        authSettings.set('clientId', applicationId);
        authSettings.set('clientSecret', clientSecret);
        authSettings.set('issuer', jwt.iss);
        authSettings.set('allowedAudiences', replyUrls);
        authSettings.set('isAadAutoProvisioned', true);

        return this._functionAppService.createAuthSettings(this.context, authSettings)
            .do(null,
            error => {
                if (this._aiService) {
                    this._aiService.trackException(error, 'Error occurred while setting necessary authsettings');
                }
            });
    }

    private checkForExistingAAD(rootUri: string): Observable<any> {
        return this._cacheService.postArm(`${this.context.site.id}/config/authsettings/list`, true).flatMap(
            r => {
                const authSettings: ArmObj<any> = r.json();
                const clientId = authSettings.properties['clientId'];
                this.setClientSecret = !authSettings.properties['clientSecret'];
                if (clientId) {
                    return this.sendRequest(rootUri, '/applications', 'GET', null, 'appId eq \'' + clientId + '\'', true);
                } else {
                    return Observable.of(null);
                }
            });
    }

    // Update client secret of AAD + auth settings of existing registration
    private createClientSecret(rootUri: string, objectId: string): Observable<any> {
        const pwCreds = GeneratePasswordCredentials();
        const authSettings = new Map<string, any>();
        authSettings.set('clientSecret', pwCreds.keyId);
        return this._functionAppService.createAuthSettings(this.context, authSettings)
            .do(() => {
                return this.sendRequest(rootUri, '/applications/' + objectId + '/passwordCredentials', 'PATCH', JSON.stringify(pwCreds));
            }, error => {
                if (this._aiService) {
                    this._aiService.trackException(error, 'Error while updating authsetting with new client secret');
                }
            });
    }

    private sendRequest(baseUrl: string, extension: string, method: string, jsonPayload?, queryParameters?: string, force?: boolean): Observable<any> {
        let url = trimTrailingSlash(baseUrl) + extension + '?api-version=' + MSGraphConstants.General.ApiVersion;
        if (queryParameters) {
            url += '&$filter=' + encodeURIComponent(queryParameters);
        }

        const headers = new Headers();
        headers.append('Authorization', `Bearer ${this._token}`);

        if (method.toLowerCase() === HttpMethods.POST) {
            headers.append('Content-Type', 'application/json');
            return this._cacheService.post(url, force, headers, jsonPayload);
        } else if (method.toLowerCase() === HttpMethods.PUT) {
            headers.append('Content-Type', 'application/json');
            return this._cacheService.put(url, headers, jsonPayload);
        } else if (method.toLowerCase() === HttpMethods.PATCH) {
            headers.append('Content-Type', 'application/json; charset=utf-8');
            return this._cacheService.patch(url, headers, jsonPayload);
        }
        return this._cacheService.get(url, force, headers);
    }

    private getRootUri(graphToken: string): string {
        this._token = graphToken;
        this._jwt = parseToken(this._token);

        if (!this._jwt) {
            throw Error('Unable to parse MS Graph JWT; cannot retrieve audience or tenant ID');
        }
        return this._jwt.aud + this._jwt.tid; // audience + tenantId
    }

}

function base64urlUnescape(str: string) {
    str += new Array(5 - str.length % 4).join('=');
    return str.replace(/\-/g, '+').replace(/_/g, '/');
}

function trimTrailingSlash(url): string {
    return url.replace(/\/$/, '');
}

function parseToken(token: string) {
    const segments = token.split('.');

    if (segments.length >= 2) {
        try {
            const payload = JSON.parse(base64urlDecode(segments[1]));
            return payload;
        } catch (e) {
            return null;
        }
    }
}

function base64urlDecode(payloadSegment: string) {
    return new Buffer(base64urlUnescape(payloadSegment), 'base64').toString();
}

function GeneratePasswordCredentials() {
    return {
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        keyId: UUID.UUID(),
        startDate: new Date(),
        value: GeneratePassword()
    };
}

function GeneratePassword(): string {
    const crypto = require('crypto-browserify');
    return crypto.randomBytes(32).toString('base64');
}

// Given a set of resources a binding/tempalte needs and the app's current resources, determine the union of the two sets
// Retain current resources and add additional ones if necessary
export function CompareResources(current, necessary) {
    // Resources associated with MS Graph that application manifest currently contains
    const existingMSGraph = current.find(obj => {
        return obj.resourceAppId === MSGraphConstants.RequiredResources.MicrosoftGraph;
    });

    // Resources associated with MS Graph that application needs for this specific binding/template
    const necessaryMSGraph = necessary.find(obj => {
        return obj.resourceAppId === MSGraphConstants.RequiredResources.MicrosoftGraph;
    });

    const unionMSGraph: any = {};

    if (existingMSGraph) {
        // Union two arrays by removing intersection from existing resources then concatenating remaining
        unionMSGraph.resourceAccess = necessaryMSGraph.resourceAccess.concat(existingMSGraph.resourceAccess.filter(item => {
            return necessaryMSGraph.resourceAccess.findIndex(necessary => {
                return necessary.type === item.type && necessary.id === item.id;
            }) < 0;
        }));
    } else {
        // If no MS Graph resources are currently required, the new ones are just the ones this binding/template needs
        unionMSGraph.resourceAccess = necessaryMSGraph.resourceAccess;
    }

    // Set up the object that will be used in the request payload
    unionMSGraph.resourceAppId = MSGraphConstants.RequiredResources.MicrosoftGraph;

    const unionAAD: any = {};

    // Same as MS Graph, only this time comparing AAD resources
    const existingAAD = current.find(obj => {
        return obj.resourceAppId === MSGraphConstants.RequiredResources.WindowsAzureActiveDirectory;
    });

    const necessaryAAD = necessary.find(obj => {
        return obj.resourceAppId === MSGraphConstants.RequiredResources.WindowsAzureActiveDirectory;
    });

    if (existingAAD) {
        // Union two arrays by removing intersection from existing resources then concatenating remaining
        unionAAD.resourceAccess = necessaryAAD.resourceAccess.concat(existingAAD.resourceAccess.filter(item => {
            return necessaryAAD.resourceAccess.findIndex(necessary => {
                return necessary.type === item.type && necessary.id === item.id;
            }) < 0;
        }));
    } else {
        unionAAD.resourceAccess = necessaryAAD.resourceAccess;
    }

    unionAAD.resourceAppId = MSGraphConstants.RequiredResources.WindowsAzureActiveDirectory;

    return [unionMSGraph, unionAAD];
}
