import {Component, Output, Input, EventEmitter, OnInit, AfterViewInit} from 'angular2/core';
import {TemplatePickerType, Template} from '../models/template-picker';
import {BindingComponent} from './binding.component';
import {DirectionType, Binding} from '../models/binding';
import {BindingManager} from '../models/binding-manager';
import {LanguageType, TemplateFilterItem, FunctionTemplate} from '../models/template';
import {FunctionsService} from '../services/functions.service';
import {IBroadcastService, BroadcastEvent} from '../services/ibroadcast.service';
import {DropDownComponent} from './drop-down.component';
import {DropDownElement} from '../models/drop-down-element';

@Component({
    selector: 'template-picker',
    templateUrl: './templates/template-picker.component.html',
    inputs: ['type'],
    styleUrls: ['styles/template-picker.style.css'],
    directives: [DropDownComponent]
})

export class TemplatePickerComponent {
    public languages: DropDownElement<string>[] = [];
    public categories: DropDownElement<string>[] = [];

    title: string;
    selectedTemplate: string;
    templates: Template[] = [];
    filterItems: TemplateFilterItem[] = [];
    bc: BindingManager = new BindingManager();
    bindings: Binding[];
    private _category: string = "Core";
    private _language: string = "All";
    private _type: TemplatePickerType;
    private _initialized = false;

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
                        
                        let initLanguages = false, initCategories = false;
                        if(this.languages.length === 0){
                            this.languages = [{ displayLabel: "All", value: "All" }];
                            initLanguages = true;
                        }


                        if (this.categories.length === 0) {
                            this.categories = [{ displayLabel: "All", value: "All" }];
                            initCategories = true;
                        }

                        templates.forEach((template) => {

                            if(initLanguages){
                                var lang = this.languages.find((l) => {
                                    return l.value === template.metadata.language;
                                });
                                if (!lang) {
                                    this.languages.push({
                                        displayLabel: template.metadata.language,
                                        value: template.metadata.language
                                    });
                                }
                            }

                            if(initCategories){
                                template.metadata.category.forEach((c) => {
                                    var index = this.categories.findIndex((category) => {
                                        return category.value === c;
                                    });

                                    if (index === -1) {
                                        var dropDownElement:any = {
                                            displayLabel: c,
                                            value: c
                                        };

                                        if (c === "Core") {
                                            dropDownElement.default = true;
                                        }

                                        this.categories.push(dropDownElement);
                                    }
                                });
                            }

                            var matchIndex = template.metadata.category.findIndex((c) => {
                                return c === this._category || this._category === "All";
                            });

                            if (matchIndex !== -1) {
                                if ((this._language === "All") || (template.metadata.language === this._language)) {
                                    var keys = template.metadata.category || ["Experimental"];
                                    keys.push(
                                        template.metadata.language
                                    );

                                    this.templates.push({
                                        name: template.metadata.name,
                                        value: template.id,
                                        keys: template.metadata.category || ["Experimental"]
                                    });
                                }
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

    onLanguageChanged(language: string) {
        this._language = language;
        this.type = this._type;
    }

    onScenarioChanged(category: string) {
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
                name: binding.displayName.toString(),
                value: binding.type.toString()
            });
        });

        return result;
    }
}