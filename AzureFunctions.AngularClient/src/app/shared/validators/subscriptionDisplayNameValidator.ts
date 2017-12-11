
import { Injector } from '@angular/core';
import { Validator } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from './../../shared/services/user.service';
import { Subscription } from './../../shared/models/subscription';
import { PortalResources } from './../models/portal-resources';
import { CustomFormControl } from './../../controls/click-to-edit/click-to-edit.component';

export class SubscriptionDisplayNameValidator implements Validator {

    private _translateService: TranslateService;
    private _subs: Subscription[];

    constructor(injector: Injector) {
        this._translateService = injector.get(TranslateService);
        injector.get(UserService).getStartupInfo()
        .first()
        .subscribe(info => {
            this._subs = info.subscriptions;
        });
    }

    validate(control: CustomFormControl) {
        if ((control.dirty || control._msRunValidation) && !control.value) {
            return { disPlayName: this._translateService.instant(PortalResources.validation_requiredError) };
        }
        if (this._subs && this._subs.find(s => s.displayName.trim() === control.value.trim())) {
            return { disPlayName: this._translateService.instant(PortalResources.subNew_subAlreadyExist).format(control.value.trim()) };
        }
        return null;
    }
}
