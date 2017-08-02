import { Headers } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { BindingComponent } from '../../binding/binding.component';
import { FunctionNewComponent } from '../../function-new/function-new.component';
import { FunctionApp } from '../../shared/function-app';
import { CacheService } from '../../shared/services/cache.service';
import { AiService } from '../../shared/services/ai.service';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { Constants } from '../../shared/models/constants';
import { MobileAppsClient } from '../../shared/models/mobile-apps-client';
import { CheckBoxListInput, PickerInput } from '../../shared/models/binding-input';
import { Moniker, GraphSubscription, GraphSubscriptionEntry, ODataTypeMapping } from '../../shared/models/microsoft-graph';

export class MicrosoftGraphHelper {
    public binding?: BindingComponent;
    public function?: FunctionNewComponent;
    private _dataRetriever: MobileAppsClient;

    constructor(
        private _cacheService: CacheService,
        private _aiService: AiService,
        public functionApp: FunctionApp) {
        this._dataRetriever = new MobileAppsClient(this.functionApp.getMainSiteUrl());
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
                            this._aiService.trackException(err, 'binding - saveWebhook() - getBYOBStorageLocation()');
                        });
                },
                err => {
                    this._aiService.trackException(err, 'binding - saveWebhook() - subscribeToGraphResource()');
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

    private getBYOBStorageLocation() {
        // if app setting set, retrieve location after D:\home (vfs prepends path with D:\home)
        return this._cacheService.postArm(`${this.functionApp.site.id}/config/appsettings/list`)
            .map(r => {
                const appSettingsArm: ArmObj<any> = r.json();
                return appSettingsArm.properties[Constants.BYOBTokenMapSettingName];
            });
    }

    private subscribeToGraphResource(subscription: GraphSubscription, token: string) {
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
