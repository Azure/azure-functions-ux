import {Component, ElementRef, Inject, Output, Input, EventEmitter, OnInit, AfterViewInit} from 'angular2/core';
import {NgClass} from 'angular2/common';
import {FunctionsService} from '../services/functions.service';
import {BindingComponent} from './binding.component';
import {TemplatePickerComponent} from './template-picker.component';
import {TemplatePickerType} from '../models/template-picker';
import {UIFunctionConfig, UIFunctionBinding, DirectionType, BindingType} from '../models/binding';
//import {LanguageType, FunctionTemplate} from '../models/template';
import {BindingList} from '../models/binding-list';
import {FunctionInfo} from '../models/function-info';
import {BindingManager} from '../models/binding-manager';
import {FunctionTemplate} from '../models/function-template';
import {IBroadcastService, BroadcastEvent} from '../services/ibroadcast.service';

declare var jQuery: any;

@Component({
    selector: 'function-new',
    templateUrl: './templates/function-new.component.html',
    styles: [`.wrapper { padding: 20px; }`],
    directives: [TemplatePickerComponent, BindingComponent, NgClass],
    outputs: ['functionAdded']
})

export class FunctionNewComponent {

    elementRef: ElementRef;
    type: TemplatePickerType = TemplatePickerType.template;
    functionName: string;
    bc: BindingManager = new BindingManager();
    //bindings: FunctionBinding[] = [];
    model: BindingList = new BindingList();
    clickSave: boolean = false;
    updateBindingsCount = 0;
    areInputsValid: boolean = false;
    functionNameClass: string = "col-md-3 has-error";
    private functionAdded: EventEmitter<FunctionInfo> = new EventEmitter<FunctionInfo>();
    private _selectedTemplate: FunctionTemplate;
    private _bindingComponents: BindingComponent[] = [];


    constructor( @Inject(ElementRef) elementRef: ElementRef,
        private _functionsService: FunctionsService,
        private _broadcastService: IBroadcastService)
    {
        this.elementRef = elementRef;        
    }

    onTemplatePickUpComplete(templateName: string) {
        //var splitResult = templateName.split('_');
        //var type = BindingType[splitResult[0]];
        //var language = LanguageType[splitResult[1]];       

        this._functionsService.getTemplates().subscribe((templates) => {
            this._selectedTemplate = templates.find((t) => t.id === templateName);
            
            //if (type) {
            //    functionTemplate = templates.find((t) => {
            //        if (t.language === language) {
            //            var find = t.bindings.find((b) => {
            //                return b.type === type;
            //            });
            //            return find ? true : false;
            //        }
            //        return false;
            //    });
            //} else {
            //    functionTemplate = templates.find((t) => {
            //        return (t.language === language) && (t.bindings.length === 0);
            //    });
            //}

            //this.model.config = {
            //    schema: "",
            //    version: "",
            //    bindings: []
            //};

            this._functionsService.getBindingConfig().subscribe((bindings) => {

                //var binding = bindings.bindings.find((b) => b.type.toString().toLowerCase() === templateName.toLowerCase());

                this.model.config = this.bc.functionConfigToUI({
                    disabled: false,                                        
                    bindings: this._selectedTemplate.function.bindings
                }, bindings.bindings);

                //this.model.config.bindings.push(this.bc.getDefaultBinding(binding.type, binding.direction, bindings.bindings));

                //functionTemplate.bindings.forEach((b) => {
                //    this.model.config.bindings.push(this.bc.getDefaultBinding(b.type, b.direction, bindings.bindings));
                //});
                
                this.model.setBindings();

            });
        });
    }

    onCreate() {  
        if (!this.functionName) {
            return;
        }
        this.updateBindingsCount = this.model.config.bindings.length;
        if (this.updateBindingsCount === 0) {
            this.createFunction();
            return;
        }

        this.clickSave = true;
    }

    onRemoveBinding(binding: UIFunctionBinding) {
        this.model.removeBinding(binding.id);
        this.model.setBindings();
    }

    onUpdateBinding(binding: UIFunctionBinding) {
        this.model.updateBinding(binding);
        this.updateBindingsCount--;

        if (this.updateBindingsCount === 0) {
            //Last binding update            
            this.createFunction();
        }
    }

    functionNameChanged(value: string) {                
        this.functionNameClass = this.areInputsValid ? 'col-md-3' : 'col-md-3 has-error';
        this.validate();
    }

    onValidChanged(component: BindingComponent) {        
        var i = this._bindingComponents.findIndex((b) => {           
            return b.bindingValue.id === component.bindingValue.id;
        });

        if (i !== -1) {
            this._bindingComponents[i] = component;
        } else {
            this._bindingComponents.push(component);            
        }
        this.validate();
    }

    private validate() {        
        this.areInputsValid = this.functionName ? true : false;
        this._bindingComponents.forEach((b) => {
            this.areInputsValid = b.areInputsValid && this.areInputsValid;
        });      
    }

    private createFunction() {              
        this._selectedTemplate.files["function.json"] = JSON.stringify(this.bc.UIToFunctionConfig(this.model.config));

        this._functionsService.createFunctionV2(this.functionName, this._selectedTemplate.files)
            .subscribe(res => {
                window.setTimeout(() => {
                    this._broadcastService.broadcast(BroadcastEvent.FunctionAdded, res);
                    this.functionAdded.emit(res);
                }, 1500);
            });
    }
}