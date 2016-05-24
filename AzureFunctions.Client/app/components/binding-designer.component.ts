import {Component, OnInit, EventEmitter} from '@angular/core';
import {FunctionBinding} from '../models/function-config';
import {Binding, BindingOption} from '../models/designer-schema';


@Component({
    selector: 'binding-designer',
    templateUrl: 'templates/binding-designer.component.html',
    inputs: ['currentBinding', 'bindings'],
    outputs: ['changedBinding']
})
export class BindingDesignerComponent implements OnInit {
    public changedBinding: EventEmitter<FunctionBinding>;
    public currentBinding: FunctionBinding;
    public bindings: Binding[];
    public selectedBindingType: string;
    public bindingOptionsMeta: Binding;

    constructor() {
        this.changedBinding = new EventEmitter<FunctionBinding>();
    }

    ngOnInit() {
        if (this.currentBinding) {
            this.selectedBindingType = this.currentBinding.type;
            this.bindingOptionsMeta = this.bindings.find(e => e.name === this.selectedBindingType);
            if (this.bindingOptionsMeta) {
                for(var e in this.currentBinding) {
                    if (e === 'type') continue;
                    var option = this.bindingOptionsMeta.options.find(o => o.name === e);
                    if (option) {
                        option.value = this.currentBinding[e];
                    } else {
                        this.bindingOptionsMeta.options.push({ name: e, value: this.currentBinding[e], type: 'string' })
                    }
                }
            }
        }
    }
}