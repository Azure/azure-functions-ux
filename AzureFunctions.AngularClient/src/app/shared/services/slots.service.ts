import { Injectable } from '@angular/core';
import { ArmService } from './arm.service';
import { CacheService } from './cache.service';
import { ArmObj } from '../models/arm/arm-obj';
import { Constants } from '../../shared/models/constants';

@Injectable()
export class SlotsService {
    constructor(
        private _cacheService: CacheService,
        private _armService: ArmService
    ) { }

    // Create Slot
    createNewSlot(siteId: string, slotName: string, loc: string, serverfarmId: string) {
        // create payload
        const payload = JSON.stringify({
            location: loc,
            properties: {
                serverFarmId: serverfarmId
            }
        });
        return this._cacheService.putArm(`${siteId}/slots/${slotName}`, this._armService.websiteApiVersion, payload);
    }


    public setStatusOfSlotOptIn(appSetting: ArmObj<any>, value?: string) {
        appSetting.properties[Constants.slotsSecretStorageSettingsName] = value;
        return this._cacheService.putArm(appSetting.id, this._armService.websiteApiVersion, appSetting);
    }
}
