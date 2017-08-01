import { Headers } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import { BindingComponent } from '../../binding/binding.component';
import { FunctionNewComponent } from '../../function-new/function-new.component';
import { FunctionApp } from '../../shared/function-app';
import { CacheService } from '../../shared/services/cache.service';
import { AiService } from '../../shared/services/ai.service';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { ConfigService } from '../../shared/services/config.service';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { Constants } from "../../shared/models/constants";
import { MobileAppsClient } from "../../shared/models/mobile-apps-client";
import { BindingType, Action, Binding } from '../../shared/models/binding';
import { BindingList } from '../../shared/models/binding-list';
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
    private necessaryAAD: any = {};
    private necessaryMSGraph: any = {};

    constructor(
        public functionApp: FunctionApp,
        private _cacheService: CacheService,
        private _aiService?: AiService) 
        {
            if (_aiService) {
                this._dataRetriever = new MobileAppsClient(this.functionApp.getMainSiteUrl(), this._aiService);
            }
        }

    createAADApplication(template: Binding | FunctionTemplateMetadata, graphToken: string, globalStateService: GlobalStateService) {
        // 1. Check if AAD application exists       
        this._token = graphToken;
        const jwt = parseToken(this._token);
        let rootUri = jwt.aud + jwt.tid; // audience + tenantId
        this.checkForExistingAAD(rootUri).subscribe(applicationInformation => {
            // If it already exists, check to see if it has necessary client secret & scopes
            if (applicationInformation) {
                /* Currently, this fails because the graph token retrieved from Ibiza does not have enough permissions to update the AAD app's manifest,
                * though the token can be used to create an AAD app...            
                * This section can be uncommented when the AAD team updates the permissions for the Portal AAD app
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

                this.compareScopes(existingApplication.requiredResourceAccess, template.AADPermissions);
                const patch: any = {};
                patch.value = template.AADPermissions;
                
                this.sendRequest(rootUri, '/applications/' + existingApplication.objectId + '/requiredResourceAccess', 'PATCH', JSON.stringify(patch)).subscribe(() => { },
                error => {
                    if (this._aiService) {
                        this._aiService.trackException(error, 'Error occurred while updating manifest with new permissions req.');
                    }
                });
                */          
            }
            else {
                // If it does not exist, create it & set necessary scopes
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
                this.sendRequest(rootUri, '/applications', 'POST', application).subscribe(response => {
                    let newApplication = JSON.parse(response._body);

                    this.setAuthSettings(newApplication.appId, jwt, pwCreds.value, app.replyUrls);
                }, error => {
                    globalStateService.clearBusyState();
                    this._aiService.trackException(error, 'Creation of AAD Application by MSG Helper failed.');
                });
            }
            globalStateService.clearBusyState();
        }, error => {
            globalStateService.clearBusyState();
            if (this._aiService) {
                this._aiService.trackException(error, "Error occurred while retrieving AAD app for this Function");
            }            
        });     
    }

    // Set long list of auth settings needed by Easy Auth
    setAuthSettings(applicationId: string, jwt, clientSecret, replyUrls) {
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

    saveWebHook() { 
        // 1. Retrieve subscription parameters from input values
        var subscriptionResource = this.binding.model.inputs.find((input) => {
            return input.id === "Listen";
        });
        var changeTypeInput = this.binding.model.inputs.find((input) => {
            return input.id === "ChangeType";
        });
        var changeType = String((<CheckBoxListInput>changeTypeInput).getArrayValue()); // cast input value to string[], then convert to string for POST request
        var expiration = new Date();
        expiration.setUTCMilliseconds(expiration.getUTCMilliseconds() + 4230 * 60 * 1000);

        var notificationUrl = this.functionApp.getMainSiteUrl() + "/admin/extensions/O365Extension"
        var clientState = UUID.UUID();

        var subscription = new GraphSubscription(changeType, notificationUrl, subscriptionResource.value, expiration.toISOString(), clientState);

        var token = null;

        // 2. Retrieve graph token through function app
        var options = {
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
                    var moniker = new Moniker(Constants.MSGraphResource, null, values.OID);
                    var entry = new GraphSubscriptionEntry(subscription, clientState, JSON.stringify(moniker));
                    this.getBYOBStorageLocation().subscribe(
                        storageLocation => {
                            // Get storage location; app setting overrides default
                            if (!storageLocation) {
                                storageLocation = Constants.defaultBYOBLocation;
                            } else {
                                storageLocation = storageLocation.replace(/\\/g, '/').split("D:/home")[1];
                            }
                            var scm = this.functionApp.getScmUrl().concat("/api/vfs", storageLocation, '/', subscription);
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
        var resourceKeys = Object.keys(ODataTypeMapping);
        resourceKeys.forEach(key => {
            if (subscriptionResource.value.search(new RegExp(key, "i")) !== -1) {
                var typeInput = this.binding.model.inputs.find((input) => {
                    return input.id === "Type";
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
        var options = {
            parameters: {
                prompt: 'login'
            }
        };

        return this._dataRetriever.retrieveOID(options, input);
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
            return this.sendRequest(rootUri, '/applications/' + objectId + '/passwordCredentials', 'PATCH', JSON.stringify(pwCreds));
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

        if (method.toUpperCase() === 'POST') {
            headers.append('Content-Type', 'application/json');
            return this._cacheService.post(url, null, headers, jsonPayload);
        }
        else if (method.toUpperCase() === 'PUT') {
            headers.append('Content-Type', 'application/json');
            return this._cacheService.put(url, null, headers, jsonPayload);
        }
        else if (method.toUpperCase() === 'PATCH') {
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
    }

    private subscribeToGraphResource(subscription: GraphSubscription, token: string) {
        if (!this._cacheService) {
            return;
        }
        var url = Constants.MSGraphResource + "/v" +
            Constants.latestMSGraphVersion + "/" +
            "subscriptions";
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', `Bearer ${token}`);
        var content = JSON.stringify(subscription);
        return this._cacheService.post(url, null, headers, JSON.stringify(subscription))
            .map(r => {
                let newSubscription: GraphSubscription = r.json();
                return newSubscription.id;
            });
    }

    private compareScopes(current, necessary) {
        // MS Graph scope comparison
        let existingMSGraph = current.find(obj => {
            return obj.resourceAppId === MSGraphConstants.RequiredResources.MicrosoftGraph;
        });

        let necessaryMSGraph = necessary.find(obj => {
            return obj.resourceAppId === MSGraphConstants.RequiredResources.MicrosoftGraph;
        });

        if (existingMSGraph) {
            // Union two arrays by removing intersection from existing scopes then concatenating remaining
            this.necessaryMSGraph.resourceAccess = necessaryMSGraph.resourceAccess.concat(existingMSGraph.resourceAccess.filter(item => {
                return necessaryMSGraph.resourceAccess.findIndex(necessary => {
                    return necessary.type === item.type && necessary.id === item.id; 
                }) < 0;
            }));
        } else {
            this.necessaryMSGraph.resourceAccess = necessaryMSGraph;
        }
        
        this.necessaryMSGraph.resourceAppId = MSGraphConstants.RequiredResources.MicrosoftGraph

        // AAD scope comparison
        let existingAAD = current.find(obj => {
            return obj.resourceAppId === MSGraphConstants.RequiredResources.WindowsAzureActiveDirectory;
        });

        let necessaryAAD = necessary.find(obj => {
            return obj.resourceAppId === MSGraphConstants.RequiredResources.WindowsAzureActiveDirectory;
        });

        if (existingAAD) {
            // Union two arrays by removing intersection from existing scopes then concatenating remaining
            this.necessaryAAD.resourceAccess = necessaryAAD.resourceAccess.concat(existingAAD.resourceAccess.filter(item => {
                return necessaryAAD.resourceAccess.findIndex(necessary => {
                    return necessary.type === item.type && necessary.id === item.id; 
                }) < 0;
            }));
        } else {
            this.necessaryAAD.resourceAccess = necessaryAAD;
        }

        this.necessaryAAD.resourceAppId = MSGraphConstants.RequiredResources.WindowsAzureActiveDirectory;
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
        const payload = JSON.parse(base64urlDecode(segments[1]));
        return payload;
    }
}

function base64urlDecode(payloadSegment: string) {
    return new Buffer(base64urlUnescape(payloadSegment), 'base64').toString();
}

function GeneratePasswordCredentials() {
    let pwCreds: any = {};
    pwCreds.endDate = new Date();
    pwCreds.endDate.setUTCMilliseconds(pwCreds.endDate.getUTCMilliseconds() + 365 * 24 * 60 * 60 * 1000); // add one year
    pwCreds.keyId = UUID.UUID();
    pwCreds.startDate = new Date();
    pwCreds.value = GeneratePassword();
    return pwCreds;
}

function GeneratePassword(): string {
    var crypto = require('crypto-browserify');
    return crypto.randomBytes(32).toString('base64');
}
