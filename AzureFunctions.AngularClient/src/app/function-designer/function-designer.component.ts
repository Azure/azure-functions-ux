import {Component, OnInit} from '@angular/core';
import {FunctionConfig} from '../shared/models/function-config';
import {FunctionsService} from '../shared/services/functions.service';
import {DesignerSchema, Binding, BindingOption} from '../shared/models/designer-schema';
//import {BindingDesignerComponent} from './binding-designer.component';

@Component({
  selector: 'function-designer',
  templateUrl: './function-designer.component.html',
  styleUrls: ['./function-designer.component.css']
})
export class FunctionDesignerComponent implements OnInit {
    public functionConfig: FunctionConfig;
    public currentTriggerBinding: any;
    public triggerBindings: Binding[];

    constructor(private _functionsService: FunctionsService) { }

    set functionConfigString(value: string) {
        this.functionConfig = JSON.parse(value);
    }

    ngOnInit() {
        this._functionsService.getDesignerSchema()
            .subscribe(r => this.triggerBindings = r.triggers);

        if (this.functionConfig &&
            this.functionConfig.bindings) {
            this.currentTriggerBinding = this.functionConfig.bindings.find(e => e.type.toLocaleLowerCase().endsWith('trigger'))
        }
    }

    onTriggerChange(trigger: any) {
        this.currentTriggerBinding = trigger;
    }
}
