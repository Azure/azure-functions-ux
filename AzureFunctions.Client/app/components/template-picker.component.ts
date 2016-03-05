import {Component, Output, Input, EventEmitter, OnInit, AfterViewInit} from 'angular2/core';
import {TemplatePickerType, Template} from '../models/template-picker';
import {BindingComponent} from './binding.component';
import {DirectionType, Binding} from '../models/binding';
import {BindingManager} from '../models/binding-manager';
import {LanguageType, TemplateFilterItem, FunctionTemplate} from '../models/template';
import {FunctionsService} from '../services/functions.service';

@Component({
    selector: 'template-picker',
    templateUrl: './templates/template-picker.component.html',
    inputs: ['type'],
    styleUrls: ['styles/template-picker.style.css']
})

export class TemplatePickerComponent {

    title: string;
    selectedTemplate: string;
    templates: Template[] = [];
    filterItems: TemplateFilterItem[] = [];
    bc: BindingManager = new BindingManager();
    selectedKey: string = "all";
    bindings: Binding[];

    @Input() showFooter: boolean;
    @Output() complete: EventEmitter<string> = new EventEmitter();
    @Output() cancel: EventEmitter<string> = new EventEmitter();

    constructor(private _functionsService: FunctionsService) {
    }

    set type(type: TemplatePickerType) {
        this._functionsService.getTemplates().subscribe((templates) => {
            this._functionsService.getBindingConfig().subscribe((config) => {                
                this.bindings = config.bindings;                 
                switch (type) {
                    case TemplatePickerType.in:
                        this.title = "Choose an input binding";
                        this.templates = this.getTemplates(DirectionType.in);

                        break;
                    case TemplatePickerType.out:
                        this.title = "Choose an output binding";
                        this.templates = this.getTemplates(DirectionType.out);
                        break;
                    case TemplatePickerType.trigger:
                        this.title = "Choose a trigger";
                        this.templates = this.getTemplates(DirectionType.trigger);
                        break;
                    case TemplatePickerType.template:
                        this.title = "Choose a template";                        
                        templates.forEach((template) => {
                            this.templates.push({
                                name: template.metadata.name,
                                value: template.id,
                                key: template.metadata.language
                            });
                        });

                        //this.templates = this.getTemplates();



                        //this.filterItems.push({ name: "All languages", value: "all" });
                        //this.filterItems.push({ name: "Javascript", value: LanguageType.Javascript.toString() });
                        //this.filterItems.push({ name: "CSharp", value: LanguageType.CSharp.toString() });
                        //this.filterItems.push({ name: "Python", value: "" });
                        //this.filterItems.push({ name: "Php", value: "" });
                        //this.filterItems.push({ name: "FortranSharp", value: "" });
                        //this.filterItems.push({ name: "Batch", value: "" });
                        //this.filterItems.push({ name: "PowerShell", value: "" });
                        //this.filterItems.push({ name: "Bash", value: "" });

                        break;
                }
            });
        });        
    }

    ngOnInit() {
    }

    //onKeyChanged(event: any) {        
    //    this.selectedTemplate = "";
    //    if (event.target.value) {
    //        if (event.target.value === "all") {
    //            this.templates = this.getTemplates();
    //        } else {
    //            this.templates = this.getTemplates().filter((t) => {
    //                return t.key === event.target.value;
    //            });
    //        }
    //    }
    //}

    onSelectClicked() {
        //var saveSelectedTemplate = this.selectedTemplate;
        this.complete.emit(this.selectedTemplate); // this fires an eventClicked
        this.selectedTemplate = "";
    }

    onCancelClicked() {
        this.cancel.emit(""); // this fires an eventClicked
    }

    onTemplateCliked(template: string) {        
        this.selectedTemplate = template;
        if (!this.showFooter) {
            this.complete.emit(this.selectedTemplate);
        }
    }

    private getTemplates(direction: DirectionType): Template[] {
        var result: Template[] = [];
        var filtered = this.bindings.filter((b) => {
            return b.direction === direction;
        });

        filtered.forEach((binding) => {

            var trigger = this.bindings.find((b) => {
                return b.direction === DirectionType.trigger;
            });

            var type = trigger ? trigger.type.toString() : "empty";

            result.push({
                name: binding.type.toString(),
                value: binding.type.toString(),
                key: binding.type.toString()
            });
        });

        return result;
    }
}