import {Component, Output, Input, EventEmitter, OnInit, AfterViewInit} from 'angular2/core';
import {TemplatePickerType, Template} from '../models/template-picker';
import {BindingComponent} from './binding.component';
import {DirectionType, Binding} from '../models/binding';
import {BindingManager} from '../models/binding-manager';
import {LanguageType, TemplateFilterItem, FunctionTemplate} from '../models/template';
import {FunctionsService} from '../services/functions.service';
import {IBroadcastService, BroadcastEvent} from '../services/ibroadcast.service';

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
    showScenarios = false;
    private _category: string = "Core";
    private _type: TemplatePickerType;

    @Input() showFooter: boolean;
    @Output() complete: EventEmitter<string> = new EventEmitter();
    @Output() cancel: EventEmitter<string> = new EventEmitter();

    constructor(private _functionsService: FunctionsService,
        private _broadcastService: IBroadcastService) {
    }

    set type(type: TemplatePickerType) {
        this._type = type;
        this._broadcastService.setBusyState();
        this._functionsService.getTemplates().subscribe((templates) => {
            this._functionsService.getBindingConfig().subscribe((config) => { 
                this._broadcastService.clearBusyState();               
                this.bindings = config.bindings;
                this.templates = [];               
                switch (type) {
                    case TemplatePickerType.in:
                        this.title = "Choose an input binding";
                        this.templates = this.getBindingTemplates(DirectionType.in);

                        break;
                    case TemplatePickerType.out:
                        this.title = "Choose an output binding";
                        this.templates = this.getBindingTemplates(DirectionType.out);
                        break;
                    case TemplatePickerType.trigger:
                        this.title = "Choose a trigger";
                        this.templates = this.getBindingTemplates(DirectionType.trigger);
                        break;
                    case TemplatePickerType.template:
                        this.title = "Choose a template"; 
                        this.showScenarios = true;
                        templates.forEach((template) => {
                            var matchIndex = template.metadata.category.findIndex((c) => {
                                return c === this._category;
                            });

                            if (matchIndex !== -1) {
                                this.templates.push({
                                    name: template.metadata.name,
                                    value: template.id,
                                    keys: template.metadata.category || ["Experimental"]
                                });
                            }
                        });
                        break;
                }
            });
        });        
    }

    ngOnInit() {
    }

    onSelectClicked() {
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

    scenarioChanged(category: string) {
        this._category = category;
        this.type = this._type;
    }

    private getBindingTemplates(direction: DirectionType): Template[] {
        var result: Template[] = [];
        var filtered = this.bindings.filter((b) => {
            return b.direction === direction;
        });

        filtered.forEach((binding) => {

            var trigger = this.bindings.find((b) => {
                return b.direction === DirectionType.trigger;
            });            

            result.push({
                name: binding.type.toString(),
                value: binding.type.toString()                
            });
        });

        return result;
    }    
}