import { Headers } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import { BindingComponent } from '../../binding/binding.component';
import { FunctionNewComponent } from '../../function-new/function-new.component';
import { FunctionApp } from '../../shared/function-app';
import { CacheService } from '../../shared/services/cache.service';
import { AiService } from '../../shared/services/ai.service';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { Constants } from "../../shared/models/constants";
import { MobileAppsClient } from "../../shared/models/mobile-apps-client";
import { Binding } from '../../shared/models/binding';
import { CheckBoxListInput, PickerInput } from '../../shared/models/binding-input';
import { FunctionTemplateMetadata } from '../../shared/models/function-template';
import { Moniker, GraphSubscription, GraphSubscriptionEntry, ODataTypeMapping, MSGraphConstants } from '../../shared/models/microsoft-graph';

declare const Buffer: any;
declare var require: any;

export class MicrosoftGraphHelper {
    public binding?: BindingComponent;
    public function?: FunctionNewComponent;
    private _dataRetriever: MobileAppsClient;
    private _token: string;
    private setClientSecret = false;

    constructor(
        public functionApp: FunctionApp,
        private _cacheService: CacheService,
        private _aiService?: AiService) 
        {
            if (_aiService) {
                this._dataRetriever = new MobileAppsClient(this.functionApp.getMainSiteUrl());
            }
        }

    createAADApplication(template: Binding | FunctionTemplateMetadata, graphToken: string, globalStateService: GlobalStateService): Observable<any> {
        // 1. Check if AAD application exists       
        this._token = graphToken;
        const jwt = parseToken(this._token);
        
        if (!jwt) {
            throw `Unable to parse MS Graph JWT; cannot retrieve audience or tenant ID`;
        }
        
        let rootUri = jwt.aud + jwt.tid; // audience + tenantId
        return this.checkForExistingAAD(rootUri)
            .flatMap(applicationInformation => {
                // If it already exists, check to see if it has necessary client secret & resources
                if (applicationInformation) {
                    /* Currently, this fails because the graph token retrieved from Ibiza does not have enough permissions to update the AAD app's manifest,
                    * though the token can be used to create an AAD app...            
                    * This section can be uncommented when the AAD team updates the permissions for the Portal AAD app */
                    var existingApplication = applicationInformation.json().value[0];

                    // Legacy reasons: check for client secret (Easy Auth used to not set Client Secret automatically)
                    if (this.setClientSecret) {
                        this.createClientSecret(rootUri, existingApplication.objectId).subscribe(() => {
                            this.setClientSecret = false;
                        },
                        error => {
                            if (this._aiService) {
                                this._aiService.trackException(error, "Could not update AAD manifest's client secret");
                            }
                        });
                    }
                    
                    const patch: any = {};
                    patch.value = CompareResources(existingApplication.requiredResourceAccess, template.AADPermissions);
                    /* Currently, this fails because the graph token retrieved from Ibiza does not have enough permissions to update the AAD app's manifest,
                    * though the token can be used to create an AAD app...            
                    * This can be uncommented when the AAD team updates the permissions for the Portal AAD app */
                    // return this.sendRequest(rootUri, '/applications/' + existingApplication.objectId + '/requiredResourceAccess', "PATCH", JSON.stringify(patch));

                    return Observable.of(null);   
                }
                else {
                    // If it does not exist, create it & set necessary resources
                    let appUri = this.functionApp.getMainSiteUrl();      
                    let name = this.functionApp.site.name;

                    var app: any = {};
                    app.displayName = name;
                    app.homepage = appUri;
                    app.identifierUris = [appUri];
                    app.replyUrls = [trimTrailingSlash(appUri) + MSGraphConstants.General.AADReplyUrl];

                    var pwCreds = GeneratePasswordCredentials();
                    app.passwordCredentials = [pwCreds];
                    app.requiredResourceAccess = template.AADPermissions;

                    let application = JSON.stringify(app);
                    return this.sendRequest(rootUri, '/applications', "POST", application)
                        .do(response =>{

                            let newApplication = JSON.parse(response._body);

                            this.setAuthSettings(newApplication.appId, jwt, pwCreds.value, app.replyUrls);
                        }, err =>{
                            if (this._aiService) {
                                this._aiService.trackException(err, "Error while creating new AAD application");
                            }
                        });
                }
            })    
    }

    saveWebHook() {
        // 1. Retrieve subscription parameters from input values
        const subscriptionResource = this.binding.model.inputs.find((input) => {
            return input.id === 'Listen';
        });
        const changeTypeInput = this.binding.model.inputs.find((input) => {
            return input.id === 'ChangeType';
        });
        const changeType = String((<CheckBoxListInput>changeTypeInput).getArrayValue()); // cast input value to string[], then convert to string for POST request
        const expiration = new Date();
        expiration.setUTCMilliseconds(expiration.getUTCMilliseconds() + 4230 * 60 * 1000);

        const notificationUrl = this.functionApp.getMainSiteUrl() + '/admin/extensions/O365Extension'
        const clientState = UUID.UUID();

        const subscription = new GraphSubscription(changeType, notificationUrl, subscriptionResource.value, expiration.toISOString(), clientState);


        // 2. Retrieve graph token through function app
        const options = {
            parameters: {
                resource: Constants.MSGraphResource
            }
        };

        // Mobile Service Client returns promises that only support the 'then' continuation (for now):
        // https://azure.github.io/azure-mobile-apps-js-client/global.html#Promise

        this._dataRetriever.retrieveOID(options).then(values => {
            // 2.1 use graph token to subscribe to MS graph resource
            this.subscribeToGraphResource(subscription, values.token).subscribe(
                subscription => {
                    // 3. Save new file containing the mapping: subscription ID <--> principal ID
                    const moniker = new Moniker(Constants.MSGraphResource, null, values.OID);
                    const entry = new GraphSubscriptionEntry(subscription, clientState, JSON.stringify(moniker));
                    this.getBYOBStorageLocation().subscribe(
                        storageLocation => {
                            // Get storage location; app setting overrides default
                            if (!storageLocation) {
                                storageLocation = Constants.defaultBYOBLocation;
                            } else {
                                storageLocation = storageLocation.replace(/\\/g, '/').split('D:/home')[1];
                            }
                            const scm = this.functionApp.getScmUrl().concat('/api/vfs', storageLocation, '/', subscription);
                            this.functionApp.saveFile(scm, JSON.stringify(entry)).subscribe();
                        },
                        err => {
                            this._aiService.trackException(err, 'retrieving BYOB Storage Location failed');
                        });
                },
                err => {
                    this._aiService.trackException(err, 'subscribing to MSGraph resource failed');
                });
        });

        // 4. Directly map the resource to the corresponding OData Type
        // used to transform webhook notifications into useful objects
        const resourceKeys = Object.keys(ODataTypeMapping);
        resourceKeys.forEach(key => {
            if (subscriptionResource.value.search(new RegExp(key, 'i')) !== -1) {
                const typeInput = this.binding.model.inputs.find((input) => {
                    return input.id === 'Type';
                });

                typeInput.value = ODataTypeMapping[key];
            }
        });

        // 5. Save inputs to .json like normal
        this.binding.saveClicked();
    }

    createO365WebhookSupportFunction(globalStateService: GlobalStateService) {
        // First, check if an O365 support function already exists
        this.functionApp.getFunctions().subscribe(list => {
            const existing = list.find(fx => {
                return fx.name.startsWith(Constants.WebhookHandlerFunctionName);
            });
            if (existing) {
                return;
            }
            // Set up the necessary data (files, metadata, etc.) for a 'new' function
            this.function.functionName = Constants.WebhookHandlerFunctionName;
            this.functionApp.getTemplates().subscribe((templates) => {
                setTimeout(() => {
                    this.function.selectedTemplate = templates.find((t) => t.id === Constants.WebhookHandlerFunctionId);
                    this.functionApp.getBindingConfig().subscribe((bindings) => {
                        this.function.bc.setDefaultValues(this.function.selectedTemplate.function.bindings, globalStateService.DefaultStorageAccount);

                        this.function.model.config = this.function.bc.functionConfigToUI({
                            disabled: false,
                            bindings: this.function.selectedTemplate.function.bindings
                        }, bindings.bindings);

                        this.function.model.config.bindings.forEach((b) => {
                            b.hiddenList = this.function.selectedTemplate.metadata.userPrompt || [];

                            this.function.hasConfigUI = ((this.function.selectedTemplate.metadata.userPrompt) &&
                                (this.function.selectedTemplate.metadata.userPrompt.length > 0));

                            this.function.model.setBindings();
                            this.function.validate();

                            if (this.function.action) {

                                const binding = this.function.model.config.bindings.find((b) => {
                                    return b.type.toString() === this.function.action.binding;
                                });

                                if (binding) {
                                    this.function.action.settings.forEach((s, index) => {
                                        const setting = binding.settings.find(bs => {
                                            return bs.name === s;
                                        });
                                        if (setting) {
                                            setting.value = this.function.action.settingValues[index];
                                        }
                                    });
                                }
                            }
                        });

                        globalStateService.clearBusyState(); // need to clear in order for create fx to work
                        this.function.onCreate(); // this sets busy state as part of its internal processes
                        globalStateService.clearBusyState();
                    });
                });
            });
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
        let authSettings = new Map<string, any>();
        authSettings.set('enabled', true);
        authSettings.set('unauthenticatedClientAction', 'AllowAnonymous');
        authSettings.set('tokenStoreEnabled', true);
        authSettings.set('allowedExternalRedirectUrls', window.location.hostname);
        authSettings.set('defaultProvider', 'AzureActiveDirectory');
        authSettings.set('clientId', applicationId);
        authSettings.set('clientSecret', clientSecret);
        authSettings.set('issuer', jwt.iss);
        authSettings.set('allowedAudiences', replyUrls);

        this.functionApp.createAuthSettings(authSettings).subscribe(() => { },
        error => {
            if (this._aiService) {
                this._aiService.trackException(error, "Error occurred while setting necessary authsettings");
            }         
        });
    }

    private checkForExistingAAD(rootUri: string): Observable<any> {
        return this._cacheService.postArm(`${this.functionApp.site.id}/config/authsettings/list`, true).flatMap(
            r => {
                var authSettings: ArmObj<any> = r.json();
                const clientId = authSettings.properties['clientId'];
                this.setClientSecret = !authSettings.properties['clientSecret'];
                if (clientId) {
                    return this.sendRequest(rootUri, '/applications', 'GET', null, "appId eq '" + clientId + "'");
                } else {
                    return Observable.of(null);
                }
            });
    }

    // Update client secret of AAD + auth settings of existing registration 
    private createClientSecret(rootUri: string, objectId: string): Observable<any> {
        const pwCreds = GeneratePasswordCredentials();
        let authSettings = new Map<string, any>();
        authSettings.set('clientSecret', pwCreds.keyId);
        return this.functionApp.createAuthSettings(authSettings).do(() => {
            return this.sendRequest(rootUri, '/applications/' + objectId + '/passwordCredentials', "PATCH", JSON.stringify(pwCreds));
        }, error => {
            if (this._aiService) {
                this._aiService.trackException(error, "Error while updating authsetting with new client secret");
            }
        })
    }

    private sendRequest(baseUrl: string, extension: string, method: string, jsonPayload?, queryParameters?: string): Observable<any> {
        let url = trimTrailingSlash(baseUrl) + extension + '?api-version=' + MSGraphConstants.General.ApiVersion;
        if (queryParameters) {
            url += "&$filter=" + encodeURIComponent(queryParameters);
        }

        const headers = new Headers();
        headers.append('Authorization', `Bearer ${this._token}`);

        if (method.toLowerCase() === Constants.httpMethods.POST) {
            headers.append('Content-Type', 'application/json');
            return this._cacheService.post(url, null, headers, jsonPayload);
        }
        else if (method.toLowerCase() === Constants.httpMethods.PUT) {
            headers.append('Content-Type', 'application/json');
            return this._cacheService.put(url, null, headers, jsonPayload);
        }
        else if (method.toLowerCase() === Constants.httpMethods.PATCH) {
            headers.append('Content-Type', 'application/json; charset=utf-8');
            return this._cacheService.patch(url, null, headers, jsonPayload);
        }
        return this._cacheService.get(url, null, headers);
    }

    private getBYOBStorageLocation() {
        // if app setting set, retrieve location after D:\home (vfs prepends path with D:\home)
        if (this._cacheService) {
            return this._cacheService.postArm(`${this.functionApp.site.id}/config/appsettings/list`)
                .map(r => {
                    let appSettingsArm: ArmObj<any> = r.json();
                    return appSettingsArm.properties[Constants.BYOBTokenMapSettingName];
                });
        }

        return null;
    }

    private subscribeToGraphResource(subscription: GraphSubscription, token: string) {
        if (!this._cacheService) {
            throw `Missing cache service; cannot subscribe to MS Graph resource without it`;
        }
        const url = Constants.MSGraphResource + '/v' +
            Constants.latestMSGraphVersion + '/' +
            'subscriptions';
        const headers = new Headers();
      
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', `Bearer ${token}`);
      
        return this._cacheService.post(url, null, headers, JSON.stringify(subscription))
            .map(r => {
                const newSubscription: GraphSubscription = r.json();
                return newSubscription.id;
            });
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
        } catch(e) {
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
    }
}

function GeneratePassword(): string {
    var crypto = require('crypto-browserify');
    return crypto.randomBytes(32).toString('base64');
}

// Given a set of resources a binding/tempalte needs and the app's current resources, determine the union of the two sets
// Retain current resources and add additional ones if necessary
export function CompareResources(current, necessary) {
    // Resources associated with MS Graph that application manifest currently contains
    let existingMSGraph = current.find(obj => {
        return obj.resourceAppId === MSGraphConstants.RequiredResources.MicrosoftGraph;
    });

    // Resources associated with MS Graph that application needs for this specific binding/template
    let necessaryMSGraph = necessary.find(obj => {
        return obj.resourceAppId === MSGraphConstants.RequiredResources.MicrosoftGraph;
    });

    let unionMSGraph: any = {};

    if (existingMSGraph) {
        // Union two arrays by removing intersection from existing resources then concatenating remaining
        unionMSGraph.resourceAccess = necessaryMSGraph.resourceAccess.concat(existingMSGraph.resourceAccess.filter(item => {
            return necessaryMSGraph.resourceAccess.findIndex(necessary => {
                return necessary.type === item.type && necessary.id === item.id; 
            }) < 0;
        }));
    } else {
        // If no MS Graph resources are currently required, the new ones are just the ones this binding/template needs
        unionMSGraph.resourceAccess = necessaryMSGraph;
    }
    
    // Set up the object that will be used in the request payload
    unionMSGraph.resourceAppId = MSGraphConstants.RequiredResources.MicrosoftGraph

    let unionAAD: any = {};

    // Same as MS Graph, only this time comparing AAD resources
    let existingAAD = current.find(obj => {
        return obj.resourceAppId === MSGraphConstants.RequiredResources.WindowsAzureActiveDirectory;
    });

    let necessaryAAD = necessary.find(obj => {
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
        unionAAD.resourceAccess = necessaryAAD;
    }

    unionAAD.resourceAppId = MSGraphConstants.RequiredResources.WindowsAzureActiveDirectory;

    return [unionMSGraph, unionAAD]
}
