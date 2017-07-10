import { Headers } from '@angular/http';
import { CheckBoxListInput } from '../../shared/models/binding-input';
import { Moniker, GraphSubscription, GraphSubscriptionEntry, ODataTypeMapping } from '../../shared/models/microsoft-graph';
import { BindingComponent } from '../../binding/binding.component';
import { FunctionApp } from '../../shared/function-app';
import { CacheService } from '../../shared/services/cache.service';
import { AiService } from '../../shared/services/ai.service';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { Constants } from "../../shared/models/constants";
import { MobileAppsClient } from "../../shared/models/mobile-apps-client";
import { UUID } from 'angular2-uuid';

export class MicrosoftGraphHelper {
    constructor(
        private _binding: BindingComponent,
        private _cacheService: CacheService,
        private _aiService: AiService,
        private functionApp: FunctionApp) { }

    saveWebHook() { 
        // 1. Retrieve subscription parameters from input values
        var subscriptionResource = this._binding.model.inputs.find((input) => {
            return input.id === "Listen";
        });
        var changeTypeInput = this._binding.model.inputs.find((input) => {
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

        let dataRetriever = new MobileAppsClient(this.functionApp.getMainSiteUrl(), this._aiService);
        dataRetriever.retrieveOID(options).then(values => {
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
                            this._aiService.trackException(err, 'binding - saveWebhook() - getBYOBStorageLocation()');
                        });
                },
                err => {
                    this._aiService.trackException(err, 'binding - saveWebhook() - subscribeToGraphResource()');
                });
        });

        // 4. Directly map the resource to the corresponding OData Type 
        // used to transform webhook notifications into useful objects
        var resourceKeys = Object.keys(ODataTypeMapping);
        resourceKeys.forEach(key => {
            if (subscriptionResource.value.search(new RegExp(key, "i")) !== -1) {
                var typeInput = this._binding.model.inputs.find((input) => {
                    return input.id === "Type";
                });

                typeInput.value = ODataTypeMapping[key];
            }
        });

        // 5. Save inputs to .json like normal
        this._binding.saveClicked();
    }

    private getBYOBStorageLocation() {
        // if app setting set, retrieve location after D:\home (vfs prepends path with D:\home)
        return this._cacheService.postArm(`${this.functionApp.site.id}/config/appsettings/list`)
            .map(r => {
                let appSettingsArm: ArmObj<any> = r.json();
                return appSettingsArm.properties[Constants.BYOBTokenMapSettingName];
            });
    }

    private subscribeToGraphResource(subscription: GraphSubscription, token: string) {
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
}
