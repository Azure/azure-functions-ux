import {Component, Output, Input, EventEmitter, OnInit, AfterViewInit} from '@angular/core';
import {TemplatePickerType, Template} from '../shared/models/template-picker';
import {DirectionType, Binding} from '../shared/models/binding';
import {BindingManager} from '../shared/models/binding-manager';
import {FunctionApp} from '../shared/function-app';
import {LanguageType, TemplateFilterItem, FunctionTemplate} from '../shared/models/template';
import {GlobalStateService} from '../shared/services/global-state.service';
import {BroadcastEvent} from '../shared/models/broadcast-event'
import {DropDownElement} from '../shared/models/drop-down-element';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../shared/models/portal-resources';
import {Subject} from 'rxjs/Rx';

@Component({
    selector: 'template-picker',
    templateUrl: './template-picker.component.html',
    inputs: ['functionAppInput', 'type', 'template'],
    styleUrls: ['./template-picker.component.css']
})

export class TemplatePickerComponent {
    public languages: DropDownElement<string>[] = [];
    public categories: DropDownElement<string>[] = [];
    private showTryView: boolean;
    title: string;
    selectedTemplate: string;
    templates: Template[] = [];
    filterItems: TemplateFilterItem[] = [];
    bc: BindingManager = new BindingManager();
    bindings: Binding[];
    isTemplate: boolean = false;
    private category: string = "";
    private _language: string = "";
    private _type: TemplatePickerType;
    private _initialized = false;
    private _orderedCategoties = [];
    private _functionAppStream = new Subject<FunctionApp>();
    private _functionApp : FunctionApp;

    set template(value: string) {
        if (value) {
            this.onTemplateClicked(value, false);
        }
    }

    @Input() showFooter: boolean;
    @Output() complete: EventEmitter<string> = new EventEmitter<string>();
    @Output() cancel: EventEmitter<string> = new EventEmitter<string>();

    constructor(
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService) {

        this._functionAppStream
            .distinctUntilChanged()
            .subscribe(functionApp =>{
                this._functionApp = functionApp;
            })

        this.showTryView = this._globalStateService.showTryView;
        this._language = this._translateService.instant("temp_category_all");

        this._orderedCategoties = [
            this._translateService.instant("temp_category_core"),
            this._translateService.instant("temp_category_api"),
            this._translateService.instant("temp_category_dataProcessing"),
            this._translateService.instant("temp_category_samples"),
            this._translateService.instant("temp_category_experimental"),
            this._translateService.instant("temp_category_all")
        ];
    }

    set functionAppInput(functionApp : FunctionApp){
        this._functionAppStream.next(functionApp);
    }

    set type(type: TemplatePickerType) {
        this.isTemplate = (type === TemplatePickerType.template);
        var that = this;
        this._type = type;
        this._globalStateService.setBusyState();
        this._functionApp.getTemplates().subscribe((templates) => {
            this._functionApp.getBindingConfig().subscribe((config) => {
                var that = this;
                this._globalStateService.clearBusyState();
                this.bindings = config.bindings;
                this.templates = [];
                switch (type) {
                    case TemplatePickerType.in:
                        this.title = this._translateService.instant(PortalResources.templatePicker_chooseInput);
                        this.templates = this.getBindingTemplates(DirectionType.in);

                        break;
                    case TemplatePickerType.out:
                        this.title = this._translateService.instant(PortalResources.templatePicker_chooseOutput);
                        this.templates = this.getBindingTemplates(DirectionType.out);
                        break;
                    case TemplatePickerType.trigger:
                        this.title = this._translateService.instant(PortalResources.templatePicker_chooseTrigger);
                        this.templates = this.getBindingTemplates(DirectionType.trigger);
                        break;
                    case TemplatePickerType.template:
                        this.title = this._translateService.instant(PortalResources.templatePicker_chooseTemplate);

                        let initLanguages = false, initCategories = false;
                        if (this.languages.length === 0) {
                            this.languages = [{ displayLabel: this._translateService.instant(PortalResources.all), value: this._translateService.instant("temp_category_all"), default: true }];
                            initLanguages = true;
                        }


                        if (this.categories.length === 0) {
                            this.categories = [{ displayLabel: this._translateService.instant(PortalResources.all), value: this._translateService.instant("temp_category_all") }];
                            initCategories = true;
                        }

                        templates.forEach((template) => {

                            if (template.metadata.visible === false) {
                                return;
                            }

                            if (!this.getFilterMatach(template.metadata.filters)) {
                                return;
                            }

                            if (initLanguages) {
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

                            if (initCategories) {
                                template.metadata.category.forEach((c) => {
                                    if ((this._language === this._translateService.instant("temp_category_all") || (template.metadata.language === this._language))) {

                                        var index = this.categories.findIndex((category) => {
                                            return category.value === c;
                                        });

                                        if (index === -1) {
                                            var dropDownElement: any = {
                                                displayLabel: c,
                                                value: c
                                            };

                                            if (this.category === c) {
                                                dropDownElement.default = true;
                                            } else if (!this.category && c === this._translateService.instant("temp_category_core")) {
                                                dropDownElement.default = true;
                                            }

                                            this.categories.push(dropDownElement);
                                        }
                                    }
                                });
                            }

                            var matchIndex = template.metadata.category.findIndex((c) => {
                                return c === this.category || this.category === this._translateService.instant("temp_category_all");
                            });

                            if (matchIndex !== -1) {
                                if ((this._language === this._translateService.instant("temp_category_all") || (template.metadata.language === this._language))) {
                                    var keys = template.metadata.category.slice(0) || [this._translateService.instant("temp_category_experimental")];
                                    keys.push(
                                        template.metadata.language
                                    );

                                    this.templates.push({
                                        name: template.id,
                                        value: template.id,
                                        keys: keys,
                                        description: template.metadata.description,
                                        enabledInTryMode: template.metadata.enabledInTryMode
                                    });
                                }
                            }
                        });

                        var counter = 0;
                        var that = this;
                        this._orderedCategoties.forEach((c) => {
                            var temp = this.categories;
                            var index = this.categories.findIndex((item) => {
                                return c === item.displayLabel;
                            });
                            if (index > 0) {
                                var save = this.categories[index];
                                this.categories.splice(index, 1);
                                this.categories.splice(counter, 0, save);
                                counter++;
                            }
                        });

                        this.languages = this.languages.sort((a: DropDownElement<string>, b: DropDownElement<string>) => {
                            return a.displayLabel > b.displayLabel ? 1 : -1;
                        });
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

    onTemplateClicked(template: string, templateDisabled:boolean) {
        if (!templateDisabled) {
            this.selectedTemplate = template;
            if (!this.showFooter) {
                this.complete.emit(this.selectedTemplate);
            }
        }
    }

    onLanguageChanged(language: string) {
        if (this._language !== language) {
            this._language = language;
            this.categories = [];
            if (this._language && this.category) {
                this.type = this._type;
            }
        }
    }

    onScenarioChanged(category: string) {
        if (this.category !== category) {
            this.category = category;
            if (this._language && this.category) {
                this.type = this._type;
            }
        }
    }

    private getBindingTemplates(direction: DirectionType): Template[] {
        var result: Template[] = [];
        var filtered = this.bindings.filter((b) => {
            return b.direction === direction;
        });

        filtered.forEach((binding) => {

            if (this.getFilterMatach(binding.filters)) {

                result.push({
                    name: binding.displayName.toString(),
                    value: binding.type.toString(),
                    enabledInTryMode: binding.enabledInTryMode 
            });

            }
        });

        return result;
    }

    private getFilterMatach(filters: string[]) : boolean {
        var isFilterMatch = true;
        if (filters && filters.length > 0) {
            isFilterMatch = false;
            for (var i = 0; i < filters.length; i++) {
                var value = this.getQueryStringValue(filters[i]);
                if (value) {
                    isFilterMatch = true;
                    break;
                }
            }
        }
        return isFilterMatch;
    }

    private getQueryStringValue(key) {
        //http://stackoverflow.com/questions/9870512/how-to-obtaining-the-querystring-from-the-current-url-with-javascript
        return window.location.search.replace(new RegExp("^(?:.*[&\\?]" + key.replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1");
    }
}