//https://github.com/henkie14/angular2-show-hide-password
import { Directive, HostBinding } from '@angular/core'


@Directive({
    selector: '[secrets-box-input]'
})
export class SecretsBoxInputDirective {
    @HostBinding() type: string;

    constructor() {
        this.type = 'password';
    }

    changeType(type: string): void {
        this.type = type;
    }
}