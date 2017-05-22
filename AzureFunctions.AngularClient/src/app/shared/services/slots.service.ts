import { Injectable } from '@angular/core';
import { Http, Headers, Response, ResponseType } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ArmService } from './arm.service';
import { BroadcastEvent } from '../models/broadcast-event';
import { ErrorEvent, ErrorType } from '../models/error-event';
import { CacheService } from './cache.service';
import { ArmObj } from '../models/arm/arm-obj';
import { Site } from '../models/arm/site';
import { Constants } from '../../shared/models/constants';
import { Guid } from './../Utilities/Guid';

@Injectable()
export class SlotsService {
    constructor(
        private _cacheService: CacheService,
        private _armService: ArmService
    ) { }

    getSlotsList(siteId: string) {
        if (SlotsService.isSlot(siteId)) {
            return Observable.of([]);
        }
        return this._cacheService.getArm(`/${siteId}/slots`).map(r => <ArmObj<Site>[]>r.json().value);
    }

    //Create Slot
    createNewSlot(siteId: string, slotName: string, loc: string, serverfarmId: string) {
        // set the config settings similar to function App
        return this._cacheService.postArm(`${siteId}/config/appsettings/list`, true).flatMap(r => {
            let tGuid = Guid.newTinyGuid().toLowerCase();
            let props = r.json().properties;
            var currentAppSettings = [];

            for (var key in props) { // copy all the settings except for the content share we override this with a guid
                if (props.hasOwnProperty(key) && key.toLowerCase() !== Constants.contentShareConfigSettingsName.toLowerCase()) {
                    currentAppSettings.push({
                        name: key,
                        value: props[key]
                    });
                }
            }
            // the name limit is 63 https://blogs.msdn.microsoft.com/jmstall/2014/06/12/azure-storage-naming-rules/ guid is 3 characters long
            // Fix for issue: #1318 - Old content around if I delete and recreate a slot with same name
            let containerPrefix = slotName.length < 59 ? slotName : slotName.substr(0, 59);
            currentAppSettings.push({
                name: Constants.contentShareConfigSettingsName,
                value: `${slotName}${tGuid}`
            });

            // create payload
            let payload = JSON.stringify({
                location: loc,
                properties: {
                    serverFarmId: serverfarmId,
                    siteConfig: {
                        appSettings: currentAppSettings
                    }
                }
            });
            return this._cacheService.putArm(`${siteId}/slots/${slotName}`, this._armService.websiteApiVersion, payload);
        })

    }

    public static isSlot(siteId: string) {
        // slots id looks like
        // /subscriptions/<subscriptionId>/resourceGroups/<resourceGroupName>/providers/Microsoft.Web/sites/<siteName>/slots/<slotName>
        // split('/')
        //  [
        //      0: "",
        //      1: "subscriptions",
        //      2: "<subscriptionId>",
        //      3: "resourceGroups",
        //      4: "<resourceGroupName>",
        //      5: "providers",
        //      6: "Microsoft.Web",
        //      7: "sites",
        //      8: "<siteName>",
        //      9: "slots:,
        //      10: "<slotName>"
        //  ]
        let siteSegments = siteId.split("/");
        return siteSegments.length === 11 && siteSegments[9].toLowerCase() === "slots";
    }

    public setStatusOfSlotOptIn(site: ArmObj<Site>, appSetting: ArmObj<any>, value?: string) {
        appSetting.properties[Constants.slotsSecretStorageSettingsName] = value;
        return this._cacheService.putArm(appSetting.id, this._armService.websiteApiVersion, appSetting);
    }
}

