import { LogCategories } from './../../shared/models/constants';
import { Component, OnInit, Injector } from '@angular/core';
import { Guid } from './../../shared/Utilities/Guid';
import { GlobalStateService } from './../../shared/services/global-state.service';
import { CacheService } from './../../shared/services/cache.service';
import { Location } from '@angular/common';
import { LogService } from './../../shared/services/log.service';
import { LocalStorageService } from './../../shared/services/local-storage.service';
import { FormControl, FormBuilder } from '@angular/forms';
import { CustomFormControl } from './../../controls/click-to-edit/click-to-edit.component';
import { UserService } from '../../shared/services/user.service';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionDisplayNameValidator } from './../../shared/validators/subscriptionDisplayNameValidator';

@Component({
    selector: 'create-subscription',
    templateUrl: './create-subscription.component.html',
    styleUrls: ['./create-subscription.component.scss']
})
export class CreateSubscriptionComponent implements OnInit {
    planName: string;
    friendlySubName: FormControl;
    areInputsValid = true;
    invitationCode: FormControl;
    invitationCodeRequired = false;

    constructor(
        private _cacheService: CacheService,
        private _globalStateService: GlobalStateService,
        private _location: Location,
        private _logService: LogService,
        private _userService: UserService,
        private _localStorageService: LocalStorageService,
        private _injector: Injector,
        translateService: TranslateService,
        fb: FormBuilder
    ) {
        const required = new RequiredValidator(translateService);
        const subValid = new SubscriptionDisplayNameValidator(this._injector);
        this.friendlySubName = fb.control('', subValid.validate.bind(subValid));
        this.invitationCode = fb.control('', required.validate.bind(required));
    }
    ngOnInit() {
    }

    onCreate() {
        const friendlySubNameControl = <CustomFormControl>this.friendlySubName;
        const invitationCodeControl = <CustomFormControl>this.invitationCode;
        const invitationCode = invitationCodeControl.value;
        const displayName = friendlySubNameControl.value;
        if (!displayName) {
            friendlySubNameControl._msRunValidation = true;
            friendlySubNameControl.updateValueAndValidity();
            return;
        }

        if (this.invitationCodeRequired && !invitationCode) {
            invitationCodeControl._msRunValidation = true;
            invitationCodeControl.updateValueAndValidity();
            return;
        }

        const subId = Guid.newGuid();
        const id = `/subscriptions/${subId}`;
        const body = {
            planName: this.planName,
            displayName: displayName,
            invitationCode: invitationCode,
        };

        this._globalStateService.setBusyState();
        this._cacheService.putArm(id, null, body)
            .subscribe(r => {
                this._globalStateService.clearBusyState();
                this._userService.getStartupInfo().first().subscribe(info => {
                    info.subscriptions.push(r.json().properties);
                    this._localStorageService.addtoSavedSubsKey(subId);
                    this._userService.updateStartupInfo(info);
                });
                this._location.back();
            }, error => {
                this._logService.error(LogCategories.subsCriptions, '/create-subscriptions', error);
                this._globalStateService.clearBusyState();
            });
    }

    invitationCodeChanged() {
    }

    planNameChanged(planName: string) {
        this.planName = planName;
    }

    invitationCodeRequiredChanged(invitationCodeRequired: boolean) {
        this.invitationCodeRequired = invitationCodeRequired;
    }

    isValid(): boolean {
        return this.friendlySubName.value && this.friendlySubName.valid;
    }
}
