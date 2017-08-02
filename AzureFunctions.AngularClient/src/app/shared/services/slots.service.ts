import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ArmService } from './arm.service';
import { CacheService } from './cache.service';
import { ArmObj } from '../models/arm/arm-obj';
import { Site } from '../models/arm/site';
import { Constants } from '../../shared/models/constants';

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
        // create payload
        let payload = JSON.stringify({
            location: loc,
            properties: {
                serverFarmId: serverfarmId
            }
        });
        return this._cacheService.putArm(`${siteId}/slots/${slotName}`, this._armService.websiteApiVersion, payload);
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

    public setStatusOfSlotOptIn(appSetting: ArmObj<any>, value?: string) {
        appSetting.properties[Constants.slotsSecretStorageSettingsName] = value;
        return this._cacheService.putArm(appSetting.id, this._armService.websiteApiVersion, appSetting);
    }
}

