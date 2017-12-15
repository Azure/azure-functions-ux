import { FormGroup } from '@angular/forms';

declare module "@angular/forms/src/model" {
    interface FormGroup {
        byString(key: string): any;
    }
}

FormGroup.prototype.byString = function (name: string): any {
    try {
        return this.controls[name].value;
    } catch (e) {
        return null;
    }
}