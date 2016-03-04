import {Component, Input} from 'angular2/core';
import {BindingInputBase} from '../models/binding-input'


@Component({
    selector: 'binding-input',    
    templateUrl: './templates/binding-input.component.html'
})

export class BindingInputComponent {
    @Input() input: BindingInputBase<any>;    
}