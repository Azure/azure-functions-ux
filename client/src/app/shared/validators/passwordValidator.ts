import { AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

export class ConfirmPasswordValidator {
    static create(translateService: TranslateService, passwordControl: AbstractControl) {
        return (control: AbstractControl) => {
            const value = control.value;
            const passwordValue = passwordControl.value;

            if (passwordValue && passwordValue !== value) {
                return {
                    nomatchpassword: translateService.instant('nomatchpassword')
                };
            }
            return null;
        };
    }
}
