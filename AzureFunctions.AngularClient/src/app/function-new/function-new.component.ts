import { Binding } from './../shared/models/binding';
import { Template } from './../shared/models/template-picker';
import { DropDownElement } from './../shared/models/drop-down-element';
import { FunctionsService, FunctionAppContext } from './../shared/services/functions-service';
import { SiteDescriptor } from './../shared/resourceDescriptors';
import { Component, ElementRef, Inject, Injector, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import { TranslateService } from '@ngx-translate/core';
import { TemplatePickerType } from '../shared/models/template-picker';
import { Action } from '../shared/models/binding';
import { FunctionInfo } from '../shared/models/function-info';
import { FunctionTemplate } from '../shared/models/function-template';
import { BroadcastService } from '../shared/services/broadcast.service';
import { GlobalStateService } from '../shared/services/global-state.service';
import { PortalResources } from '../shared/models/portal-resources';
import { AiService } from '../shared/services/ai.service';
import { TreeViewInfo } from '../tree-view/models/tree-view-info';
import { FunctionsNode } from '../tree-view/functions-node';
import { FunctionApp } from '../shared/function-app';
import { AppNode } from '../tree-view/app-node';
import { DashboardType } from '../tree-view/models/dashboard-type';
import { Order } from '../shared/models/constants';
import { Regex } from './../shared/models/constants';

interface CategoryOrder {
    name: string;
    index: number;
}

@Component({
    selector: 'function-new',
    templateUrl: './function-new.component.html',
    styleUrls: ['./function-new.component.scss'],
    outputs: ['functionAdded'],
    inputs: ['viewInfoInput']
})
export class FunctionNewComponent implements OnDestroy {
    public context: FunctionAppContext;
    private functionsNode: FunctionsNode;
    public functionApp: FunctionApp;
    public functionsInfo: FunctionInfo[];
    elementRef: ElementRef;
    type: TemplatePickerType = TemplatePickerType.template;
    functionName: string;
    functionNameError = '';
    areInputsValid = false;
    selectedTemplate: FunctionTemplate;
    selectedTemplateId: string;
    action: Action;
    aadConfigured = true;
    extensionInstalled = true;
    public disabled: boolean;
    public viewInfo: TreeViewInfo<any>;

    private _viewInfoStream = new Subject<TreeViewInfo<any>>();
    public appNode: AppNode;

    public languages: DropDownElement<string>[] = [];
    public categories: DropDownElement<string>[] = [];
    private showTryView: boolean;
    sidePanelOpened = false;
    title: string;
    templates: Template[] = [];
    bindings: Binding[];
    private category = '';
    private language = '';
    private search = '';
    private _ngUnsubscribe = new Subject();

    private _orderedCategoties: CategoryOrder[] =
        [{
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
        }];

    private _functionAppStream = new Subject<FunctionApp>();
    private _functionApp: FunctionApp;
    createCardTemplates: Template[] = [];
    createFunctionTemplate: Template;
    createFunctionLanguage: string = null;

    public createCardStyles = {
        'blob':         {color: '#1E5890', barcolor: '#DAE6EF', icon: 'image/blob.svg'},
        'cosmosDB':     {color: '#379DA6', barcolor: '#DCF1F3', icon: 'image/cosmosDB.svg'},
        'eventHub':     {color: '#719516', barcolor: '#E5EDD8', icon: 'image/eventHub.svg'},
        'http':         {color: '#731DDA', barcolor: '#EBDBFA', icon: 'image/http.svg'},
        'iot':          {color: '#990000', barcolor: '#EFD9D9', icon: 'image/iot.svg'},
        'other':        {color: '#000000', barcolor: '#D9D9D9', icon: 'image/other.svg'},
        'queue':        {color: '#1E5890', barcolor: '#DAE6EF', icon: 'image/queue.svg'},
        'serviceBus':   {color: '#F67600', barcolor: '#FDEDDE', icon: 'image/serviceBus.svg'},
        'timer':        {color: '#3C86FF', barcolor: '#DFEDFF', icon: 'image/timer.svg'},
        'webhook':      {color: '#731DDA', barcolor: '#EBDBFA', icon: 'image/webhook.svg'}
    };

    constructor(
        @Inject(ElementRef) elementRef: ElementRef,
        _broadcastService: BroadcastService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _aiService: AiService,
        private _functionsService: FunctionsService,
        private _injector: Injector) {

        this.elementRef = elementRef;
        this.disabled = !!_broadcastService.getDirtyState('function_disabled');
        this.showTryView = this._globalStateService.showTryView;

        this._viewInfoStream
            .takeUntil(this._ngUnsubscribe)
            .switchMap(viewInfo => {
                this._globalStateService.setBusyState();
                this.viewInfo = viewInfo;
                this.functionsNode = <FunctionsNode>viewInfo.node;
                this.appNode = <AppNode>viewInfo.node.parent;

                const descriptor = new SiteDescriptor(viewInfo.resourceId);
                return this._functionsService.getAppContext(descriptor.getTrimmedResourceId());
            })
            .switchMap(context => {
                this.context = context;

                if (this.functionApp) {
                    this.functionApp.dispose();
                }

                this.functionApp = new FunctionApp(context.site, this._injector);
                this._functionAppStream.next(this.functionApp);

                if (this.functionsNode.action) {
                    this.action = Object.create(this.functionsNode.action);
                    delete this.functionsNode.action;
                }
                return this.functionApp.getFunctions();
            })
            .do(null, e => {
                this._aiService.trackException(e, '/errors/function-new');
                console.error(e);
            })
            .retry()
            .subscribe(fcs => {
                this._globalStateService.clearBusyState();
                this.functionsInfo = fcs;

                if (this.action && this.functionsInfo && !this.selectedTemplate) {
                    this.selectedTemplateId = this.action.templateId;
                }
            });

        this._functionAppStream
            .distinctUntilChanged()
            .subscribe(functionApp => {
                this._functionApp = functionApp;
                this._globalStateService.setBusyState();
                this._functionApp.getTemplates().subscribe((templates) => {
                    this._functionApp.getBindingConfig().subscribe((config) => {
                        this._globalStateService.clearBusyState();
                        this.bindings = config.bindings;
                        this.templates = [];
                        this.createCardTemplates = [];

                        // Init title, language drop-down, and category drop-down
                        this.title = this._translateService.instant(PortalResources.templatePicker_chooseTemplate);
                        this.languages = [{ displayLabel: this._translateService.instant(PortalResources.all), value: this._translateService.instant('temp_category_all'), default: true }];
                        this.categories = [{ displayLabel: this._translateService.instant(PortalResources.all), value: this._translateService.instant('temp_category_all') }];

                        templates.forEach((template) => {

                            if (template.metadata.visible === false) {
                                return;
                            }

                            // add template language to languages (if needed)
                            const lang = this.languages.find((l) => {
                                return l.value === template.metadata.language;
                            });
                            if (!lang) {
                                this.languages.push({
                                    displayLabel: template.metadata.language,
                                    value: template.metadata.language
                                });
                            }

                            // add template category/categories to categories (if needed)
                            template.metadata.category.forEach((c) => {
                                if ((this.language === this._translateService.instant('temp_category_all') || (template.metadata.language === this.language))) {

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

                            const templateIndex = this.createCardTemplates.findIndex(finalTemplate => {
                                return finalTemplate.name === template.metadata.name;
                            });

                            // if the card doesn't exist, create it based off the template, else add information to the preexisting card
                            if (templateIndex === -1) {
                                this.createCardTemplates.push({
                                    name: `${template.metadata.name}`,
                                    value: template.id,
                                    description: template.metadata.description,
                                    enabledInTryMode: template.metadata.enabledInTryMode,
                                    AADPermissions: template.metadata.AADPermissions,
                                    languages: [`${template.metadata.language}`],
                                    categories: template.metadata.category,
                                    ids: [`${template.id}`],
                                    icon: this.createCardStyles.hasOwnProperty(template.metadata.categoryStyle) ?
                                        this.createCardStyles[template.metadata.categoryStyle].icon : this.createCardStyles['other'].icon,
                                    color: this.createCardStyles.hasOwnProperty(template.metadata.categoryStyle) ?
                                        this.createCardStyles[template.metadata.categoryStyle].color : this.createCardStyles['other'].color,
                                    barcolor: this.createCardStyles.hasOwnProperty(template.metadata.categoryStyle) ?
                                        this.createCardStyles[template.metadata.categoryStyle].barcolor : this.createCardStyles['other'].barcolor
                                });
                            } else {
                                this.createCardTemplates[templateIndex].languages.push(`${template.metadata.language}`);
                                this.createCardTemplates[templateIndex].categories = this.createCardTemplates[templateIndex].categories.concat(template.metadata.category);
                                this.createCardTemplates[templateIndex].ids.push(`${template.id}`);
                            }
                        });

                        // unique categories
                        this.createCardTemplates.forEach((template, index) => {
                            const categoriesDict = {};
                            template.categories.forEach(category => {
                                categoriesDict[category] = category;
                            });
                            this.createCardTemplates[index].categories = [];
                            for (const category in categoriesDict) {
                                if (categoriesDict.hasOwnProperty(category)) {
                                    this.createCardTemplates[index].categories.push(category);
                                }
                            }
                        });

                        this._sortCategories();

                        this.languages = this.languages.sort((a: DropDownElement<string>, b: DropDownElement<string>) => {
                            return a.displayLabel > b.displayLabel ? 1 : -1;
                        });

                        // order preference defined in constants.ts
                        this.createCardTemplates.sort((a: Template, b: Template) => {
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
                    });
                });
            });

        this.language = this._translateService.instant('temp_category_all');
    }

    onLanguageChanged(language: string) {
        this.language = language;
        this.categories = [];

        if (this.language === this._translateService.instant('temp_category_all')) {
            this.templates = this.createCardTemplates;
            this.category = this._translateService.instant('temp_category_core');
        } else {
            this.templates = this.createCardTemplates.filter(cardTemplate => cardTemplate.languages.find(l => l === this.language));
        }

        this.templates.forEach(template => template.categories.forEach((c) => {
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
        }));

        const dropDownElement: any = {
            displayLabel: this._translateService.instant('temp_category_all'),
            value: this._translateService.instant('temp_category_all')
        };

        if (this.category === this._translateService.instant('temp_category_all')) {
            dropDownElement.default = true;
        }

        this.categories.push(dropDownElement);

        this._sortCategories();
    }

    onScenarioChanged(category: string) {
        this.category = category;
        this._findIntersectionOfCards();
        this._filterOnSearchValue();
    }

    private _sortCategories() {
        this.categories.sort((a: DropDownElement<string>, b: DropDownElement<string>) => {
            const ca = this._orderedCategoties.find(c => { return c.name === a.displayLabel; });
            const cb = this._orderedCategoties.find(c => { return c.name === b.displayLabel; });
            return ((ca ? ca.index : 500) > (cb ? cb.index : 500)) ? 1 : -1;
        });
    }

    private _findIntersectionOfCards() {
        if (this.category === this._translateService.instant('temp_category_all') && this.language === this._translateService.instant('temp_category_all')) {
            this.templates = this.createCardTemplates;
        } else if (this.category === this._translateService.instant('temp_category_all')) {
            this.templates = this.createCardTemplates.filter(cardTemplate => cardTemplate.languages.find(l => l === this.language));
        } else if (this.language === this._translateService.instant('temp_category_all')) {
            this.templates = this.createCardTemplates.filter(cardTemplate => cardTemplate.categories.find(c => c === this.category));
        } else {
            this.templates = this.createCardTemplates.filter(cardTemplate => cardTemplate.languages.find(l => l === this.language))
                .filter(cardTemplate => cardTemplate.categories.find(c => c === this.category));
        }
    }

    private _filterOnSearchValue() {
        this.templates = this.templates.filter(cardTemplate => cardTemplate.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || cardTemplate.languages.find(language => { return language.toLowerCase().indexOf(this.search.toLowerCase()) > -1; })
            || cardTemplate.description.toLowerCase().indexOf(this.search.toLowerCase()) > -1);
    }

    onSearchChanged(value: string) {
        this.search = value;
        this._findIntersectionOfCards();
        this._filterOnSearchValue();
    }

    onSearchCleared() {
        this.search = '';
        this._findIntersectionOfCards();
    }

    validate() {
        // ^[a-z][a-z0-9_\-]{0,127}$(?<!^host$) C# expression
        // Lookbehind is not supported in JS
        this.areInputsValid = true;
        this.functionNameError = '';
        this.areInputsValid = Regex.functionName.test(this.functionName);
        if (this.functionName.toLowerCase() === 'host') {
            this.areInputsValid = false;
        }
        if (!this.areInputsValid) {
            this.functionNameError = this.areInputsValid ? '' : this._translateService.instant(PortalResources.functionNew_nameError);
        } else {
            const nameMatch = this.functionsInfo.find((f) => {
                return f.name.toLowerCase() === this.functionName.toLowerCase();
            });
            if (nameMatch) {
                this.functionNameError = this._translateService.instant(PortalResources.functionNew_functionExsists, { name: this.functionName });
                this.areInputsValid = false;
            }
        }
    }

    onCardLanguageSelected(functionTemplate: Template, functionLanguage: string) {
        this.createFunctionTemplate = functionTemplate;
        this.createFunctionLanguage = functionLanguage;
        this.sidePanelOpened = true;
    }

    onCardSelected(functionTemplate: Template) {
        this.createFunctionTemplate = functionTemplate;
        this.createFunctionLanguage = null;
        this.sidePanelOpened = true;
    }

    closeSidePanel() {
        this.sidePanelOpened = false;
    }

    set viewInfoInput(viewInfoInput: TreeViewInfo<any>) {
        this._viewInfoStream.next(viewInfoInput);
    }

    quickstart() {
        this.functionsNode.openCreateDashboard(DashboardType.CreateFunctionQuickstartDashboard);
    }

    ngOnDestroy() {
        this._ngUnsubscribe.next();
    }
}
