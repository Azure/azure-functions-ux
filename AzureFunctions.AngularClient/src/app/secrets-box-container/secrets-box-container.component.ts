//https://github.com/henkie14/angular2-show-hide-password
import {Component, ContentChild} from '@angular/core'
import {SecretsBoxInputDirective} from './secrets-box-input.directive'

@Component({
  selector: 'secrets-box-container',
  templateUrl: './secrets-box-container.component.html',
  styleUrls: ['./secrets-box-container.component.css']
})
export class SecretsBoxContainerComponent {
    @ContentChild(SecretsBoxInputDirective) input: SecretsBoxInputDirective;

    private show: boolean;

    constructor() { }

    toggleShow(event) {
        this.show = !this.show;
        if (this.show) {
            this.input.changeType("text");
        }
        else {
            this.input.changeType("password");
        }
    }
}
