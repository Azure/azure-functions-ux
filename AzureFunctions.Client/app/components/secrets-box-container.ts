//https://github.com/henkie14/angular2-show-hide-password
import {Component, Input, ContentChild  } from '@angular/core'
import {SecretsBoxInput} from './secrets-box-input'

@Component({
    selector: 'secrets-box-container',
    templateUrl: './templates/secrets-box-container.html',
    styleUrls: ['styles/secrets-box-container.style.css'],
    directives: [SecretsBoxInput]
})
export class SecretsBoxContainer {
    @ContentChild(SecretsBoxInput) input: SecretsBoxInput;
    @Input()
    show: boolean = false;
    constructor() { }

    toggleShow() {
        this.show = !this.show;
        if (this.show) {
            this.input.changeType("text");
        }
        else {
            this.input.changeType("password");
        }
    }
}