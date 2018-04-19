import { Component, Output, Input, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/distinctUntilChanged';

import { TemplatePickerType, Template } from '../shared/models/template-picker';
import { DirectionType, Binding } from '../shared/models/binding';
import { BindingManager } from '../shared/models/binding-manager';
import { FunctionApp } from '../shared/function-app';
import { TemplateFilterItem } from '../shared/models/template';
import { GlobalStateService } from '../shared/services/global-state.service';
import { PortalService } from '../shared/services/portal.service';
import { CacheService } from '../shared/services/cache.service';
import { DropDownElement } from '../shared/models/drop-down-element';
import { PortalResources } from '../shared/models/portal-resources';
import { Order } from '../shared/models/constants';
import { MicrosoftGraphHelper } from '../pickers/microsoft-graph/microsoft-graph-helper';

interface CategoryOrder {
    name: string;
    index: number;
}

@Component({
    selector: 'template-picker',
    templateUrl: './template-picker.component.html',
    inputs: ['functionAppInput', 'type', 'template'],
    styleUrls: ['./template-picker.component.scss']
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
    isTemplate = false;
    showAADExpressRegistration = false;
    private category = '';
    private _language = '';
    private _type: TemplatePickerType;
    private _orderedCategoties: CategoryOrder[] = [];
    private _functionAppStream = new Subject<FunctionApp>();
    private _functionApp: FunctionApp;

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
        private _translateService: TranslateService,
        private _cacheService: CacheService,
        private _portalService: PortalService) {

        this._functionAppStream
            .distinctUntilChanged()
            .subscribe(functionApp => {
                this._functionApp = functionApp;
            });

        this.showTryView = this._globalStateService.showTryView;
        this._language = this._translateService.instant('temp_category_all');

        this._orderedCategoties = [
            {
                name: this._translateService.instant('temp_category_core'),
                index: 0
            },
            {
                name: this._translateService.instant('temp_category_api'),
                index: 1,
            },
            {
                name: this._translateService.instant('temp_category_dataProcessing'),
                index: 2,

            },
            {
                name: this._translateService.instant('temp_category_samples'),
                index: 3,
            },
            {
                name: this._translateService.instant('temp_category_experimental'),
                index: 4,
            },
            {
                name: this._translateService.instant('temp_category_all'),
                index: 1000,
            }
        ];
    }

    set functionAppInput(functionApp: FunctionApp) {
        this._functionAppStream.next(functionApp);
    }

    set type(type: TemplatePickerType) {
        this.isTemplate = (type === TemplatePickerType.template);
        this._type = type;
        this._globalStateService.setBusyState();
        this._functionApp.getTemplates().subscribe((templates) => {
            this._functionApp.getBindingConfig().subscribe((config) => {
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
                            this.languages = [{ displayLabel: this._translateService.instant(PortalResources.all), value: this._translateService.instant('temp_category_all'), default: true }];
                            initLanguages = true;
                        }


                        if (this.categories.length === 0) {
                            this.categories = [{ displayLabel: this._translateService.instant(PortalResources.all), value: this._translateService.instant('temp_category_all') }];
                            initCategories = true;
                        }

                        templates.forEach((template) => {

                            if (template.metadata.visible === false) {
                                return;
                            }

                            if (!this.getFilterMatch(template.metadata.filters)) {
                                return;
                            }

                            if (initLanguages) {
                                const lang = this.languages.find((l) => {
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
                                    if ((this._language === this._translateService.instant('temp_category_all') || (template.metadata.language === this._language))) {

                                        const index = this.categories.findIndex((category) => {
                                            return category.value === c;
                                        });

                                        if (index === -1) {
                                            const dropDownElement: any = {
                                                displayLabel: c,
                                                value: c
                                            };

                                            if (this.category === c) {
                                                dropDownElement.default = true;
                                            } else if (!this.category && c === this._translateService.instant('temp_category_core')) {
                                                dropDownElement.default = true;
                                            }

                                            this.categories.push(dropDownElement);
                                        }
                                    }
                                });
                            }

                            const matchIndex = template.metadata.category.findIndex((c) => {
                                return c === this.category || this.category === this._translateService.instant('temp_category_all');
                            });

                            if (matchIndex !== -1) {
                                if ((this._language === this._translateService.instant('temp_category_all') || (template.metadata.language === this._language))) {
                                    const keys = template.metadata.category.slice(0) || [this._translateService.instant('temp_category_experimental')];
                                    keys.push(
                                        template.metadata.language
                                    );

                                    this.templates.push({
                                        name: `${template.metadata.name} - ${template.metadata.language}`,
                                        value: template.id,
                                        keys: keys,
                                        description: template.metadata.description,
                                        enabledInTryMode: template.metadata.enabledInTryMode,
                                        AADPermissions: template.metadata.AADPermissions
                                    });
                                }
                            }
                        });

                        this.categories.sort((a: DropDownElement<string>, b: DropDownElement<string>) => {
                            const ca = this._orderedCategoties.find(c => { return c.name === a.displayLabel; });
                            const cb = this._orderedCategoties.find(c => { return c.name === b.displayLabel; });
                            return ((ca ? ca.index : 500) > (cb ? cb.index : 500)) ? 1 : -1;
                        });

                        this.languages = this.languages.sort((a: DropDownElement<string>, b: DropDownElement<string>) => {
                            return a.displayLabel > b.displayLabel ? 1 : -1;
                        });

                        this.templates.sort((a: Template, b: Template) => {
                            let ia = Order.templateOrder.findIndex(item => (a.value.startsWith(item)));
                            let ib = Order.templateOrder.findIndex(item => (b.value.startsWith(item)));
                            if (ia === -1) {
                                ia = Number.MAX_VALUE;
                            }
                            if (ib === -1) {
                                ib = Number.MAX_VALUE;
                            }
                            if (ia === ib) {
                                // If templates are not in ordered list apply alphabetical order
                                return a.name > b.name ? 1 : -1;
                            } else {
                                return ia > ib ? 1 : -1;
                            }
                        });
                }
            });
        });
    }

    ngOnInit() {
    }

    onSelectClicked() {
        this.complete.emit(this.selectedTemplate); // this fires an eventClicked
        this.selectedTemplate = '';
    }

    onCancelClicked() {
        this.cancel.emit(''); // this fires an eventClicked
    }

    onTemplateClicked(template: string, templateDisabled: boolean) {
        if (!templateDisabled) {
            this.selectedTemplate = template;

            // Some bindings (and templates that use them) require an AAD app; if so, show express button
            if (this.bindings) {
                let binding = this.bindings.find((b) => {
                    return b.type.toString() === this.selectedTemplate;
                });
                if (binding) {
                    this.showAADExpressRegistration = !!binding.AADPermissions;
                } else {
                    // Could be improved by determining which bindings a template uses automatically
                    let templateObject = this.templates.find((t) => {
                        return t.value === template;
                    });
                    this.showAADExpressRegistration = templateObject && !!templateObject.AADPermissions;
                }
            }
            
            if (!this.showFooter) {
                this.complete.emit(this.selectedTemplate);
            }
        }
    }

    onLanguageChanged(language: string) {
        if (this._language !== language) {
            this._language = language;
            this.categories = [];

            // if language is set to "all" we need to show "Core" templates
            if (this._language === this._translateService.instant('temp_category_all')) {
                this.category = this._translateService.instant('temp_category_core');
            }

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

    createAADApplication(templateName: string) {
        this._globalStateService.setBusyState();
        this._portalService.getStartupInfo().subscribe(info => {
            let helper = new MicrosoftGraphHelper(this._functionApp, this._cacheService);
            let binding = this.bindings.find((b) => {
                return b.type.toString() === templateName;
            });

            helper.createAADApplication(binding, info.graphToken, this._globalStateService)
                .subscribe(r => { 
                    this._globalStateService.clearBusyState();
                },
                err => {
                    this._globalStateService.clearBusyState();
                });
        });
    }

    private getBindingTemplates(direction: DirectionType): Template[] {
        const result: Template[] = [];
        const filtered = this.bindings.filter((b) => {
            return b.direction === direction;
        });

        filtered.forEach((binding) => {

            // Hide BYOB features unless flag present: https://localhost:44300/?MSGraph=true
            // binding has attribute "filters": ["MSGraph"]
            if (this.getFilterMatch(binding.filters)) {

                result.push({
                    name: binding.displayName.toString(),
                    value: binding.type.toString(),
                    enabledInTryMode: binding.enabledInTryMode
                });

            }
        });

        return result;
    }

    private getFilterMatch(filters: string[]): boolean {
        let isFilterMatch = true;

        if (filters && filters.length > 0) {
            isFilterMatch = false;
            for (let i = 0; i < filters.length; i++) {
                const value = this.getQueryStringValue(filters[i]);
                if (value) {
                    isFilterMatch = true;
                    break;
                }
            }
        }
        return isFilterMatch;
    }

    private getQueryStringValue(key) {
        // http://stackoverflow.com/questions/9870512/how-to-obtaining-the-querystring-from-the-current-url-with-javascript
        return window.location.search.replace(new RegExp('^(?:.*[&\\?]' + key.replace(/[\.\+\*]/g, '\\$&') + '(?:\\=([^&]*))?)?.*$', 'i'), '$1');
    }
}
