import { Dom } from './../../shared/Utilities/dom';
import { LogCategories, KeyCodes } from 'app/shared/models/constants';
import { Binding } from './../../shared/models/binding';
import { Template } from './../../shared/models/template-picker';
import { DropDownElement } from './../../shared/models/drop-down-element';
import { FunctionsService, FunctionAppContext } from './../../shared/services/functions-service';
import { SiteDescriptor } from './../../shared/resourceDescriptors';
import { Component, ElementRef, Inject, Injector, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import { TranslateService } from '@ngx-translate/core';
import { Action } from '../../shared/models/binding';
import { FunctionInfo } from '../../shared/models/function-info';
import { FunctionTemplate } from '../../shared/models/function-template';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { PortalResources } from '../../shared/models/portal-resources';
import { LogService } from 'app/shared/services/log.service';
import { TreeViewInfo } from '../../tree-view/models/tree-view-info';
import { FunctionsNode } from '../../tree-view/functions-node';
import { FunctionApp } from '../../shared/function-app';
import { AppNode } from '../../tree-view/app-node';
import { DashboardType } from '../../tree-view/models/dashboard-type';
import { Order, Regex } from '../../shared/models/constants';
import { Observable } from 'rxjs/Observable';

interface CategoryOrder {
    name: string;
    index: number;
}

export interface CreateCard extends Template {
    languages: string[];
    categories: string[];
    ids: string[];
    color: string;
    icon: string;
    barcolor: string;
    focusable: boolean;
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
    public functionApp: FunctionApp;
    public functionsInfo: FunctionInfo[];
    public functionName: string;
    public functionNameError = '';
    public areInputsValid = false;
    public selectedTemplate: FunctionTemplate;
    public selectedTemplateId: string;
    public action: Action;
    public disabled: boolean;
    public viewInfo: TreeViewInfo<any>;
    public appNode: AppNode;
    public languages: DropDownElement<string>[] = [];
    public categories: DropDownElement<string>[] = [];
    public showTryView: boolean;
    public sidePanelOpened = false;
    public title: string;
    public cards: CreateCard[] = [];
    public bindings: Binding[];
    public createCards: CreateCard[] = [];
    public createFunctionCard: CreateCard;
    public createFunctionLanguage: string = null;

    public createCardStyles = {
        'blob': { color: '#1E5890', barcolor: '#DAE6EF', icon: 'image/blob.svg' },
        'cosmosDB': { color: '#379DA6', barcolor: '#DCF1F3', icon: 'image/cosmosDB.svg' },
        'eventHub': { color: '#719516', barcolor: '#E5EDD8', icon: 'image/eventHub.svg' },
        'http': { color: '#731DDA', barcolor: '#EBDBFA', icon: 'image/http.svg' },
        'iot': { color: '#990000', barcolor: '#EFD9D9', icon: 'image/iot.svg' },
        'other': { color: '#000000', barcolor: '#D9D9D9', icon: 'image/other.svg' },
        'queue': { color: '#1E5890', barcolor: '#DAE6EF', icon: 'image/queue.svg' },
        'serviceBus': { color: '#F67600', barcolor: '#FDEDDE', icon: 'image/serviceBus.svg' },
        'timer': { color: '#3C86FF', barcolor: '#DFEDFF', icon: 'image/timer.svg' },
        'webhook': { color: '#731DDA', barcolor: '#EBDBFA', icon: 'image/webhook.svg' }
    };

    private _viewInfoStream = new Subject<TreeViewInfo<any>>();
    private functionsNode: FunctionsNode;
    private category = '';
    private language = '';
    private search = '';
    private _ngUnsubscribe = new Subject();
    private defaultIndex = 500;
    private _focusedCardIndex = -1;

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

    @ViewChild('container') createCardContainer: ElementRef;

    constructor(
        @Inject(ElementRef) elementRef: ElementRef,
        _broadcastService: BroadcastService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _logService: LogService,
        private _functionsService: FunctionsService,
        private _injector: Injector) {

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

                if (this.functionsNode.action) {
                    this.action = Object.create(this.functionsNode.action);
                    delete this.functionsNode.action;
                }

                return Observable.zip(
                    this._buildCreateCardTemplates(this.functionApp),
                    this.functionApp.getFunctions(),
                    (c, fcs) => ({ cards: c, fcs: fcs}));
            })
            .do(null, e => {
                this._logService.error(LogCategories.functionNew, '/load-functions-cards-failure', e);
            })
            .retry()
            .subscribe(r => {
                this._globalStateService.clearBusyState();
                this.functionsInfo = r.fcs;

                if (this.action && this.functionsInfo && !this.selectedTemplate) {
                    this.selectedTemplateId = this.action.templateId;
                }
            });


    }

    private _buildCreateCardTemplates(functionApp: FunctionApp) {
        return functionApp.getTemplates()
            .switchMap(templates => {
                return Observable.zip(
                    functionApp.getBindingConfig(),
                    Observable.of(templates),
                    (c, t) => ({ config: c, templates: t }));
            })
            .do(r => {
                this.bindings = r.config.bindings;
                this.cards = [];
                this.createCards = [];

                this.title = this._translateService.instant(PortalResources.templatePicker_chooseTemplate);
                this.languages = [{ displayLabel: this._translateService.instant(PortalResources.all),
                                    value: this._translateService.instant('temp_category_all'), default: true }];
                this.categories = [{ displayLabel: this._translateService.instant(PortalResources.all),
                                     value: this._translateService.instant('temp_category_all') }];

                r.templates.forEach((template) => {

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
                                } else if (!this.category && c === this._translateService.instant('temp_category_all')) {
                                    dropDownElement.default = true;
                                }

                                this.categories.push(dropDownElement);
                            }
                        }
                    });

                    const templateIndex = this.createCards.findIndex(finalTemplate => {
                        return finalTemplate.name === template.metadata.name;
                    });

                    // if the card doesn't exist, create it based off the template, else add information to the preexisting card
                    if (templateIndex === -1) {
                        this.createCards.push({
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
                                this.createCardStyles[template.metadata.categoryStyle].barcolor : this.createCardStyles['other'].barcolor,
                            focusable: false
                        });
                    } else {
                        this.createCards[templateIndex].languages.push(`${template.metadata.language}`);
                        this.createCards[templateIndex].categories = this.createCards[templateIndex].categories.concat(template.metadata.category);
                        this.createCards[templateIndex].ids.push(`${template.id}`);
                    }
                });

                // unique categories
                this.createCards.forEach((template, index) => {
                    const categoriesDict: {[key: string]: string; } = {};
                    template.categories.forEach(category => {
                        categoriesDict[category] = category;
                    });
                    this.createCards[index].categories = [];
                    for (const category in categoriesDict) {
                        if (categoriesDict.hasOwnProperty(category)) {
                            this.createCards[index].categories.push(category);
                        }
                    }
                });

                this._sortCategories();

                this.languages = this.languages.sort((a: DropDownElement<string>, b: DropDownElement<string>) => {
                    return a.displayLabel > b.displayLabel ? 1 : -1;
                });

                // order preference defined in constants.ts
                this.createCards.sort((a: Template, b: Template) => {
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

                this.language = this._translateService.instant('temp_category_all');
                this.category === this._translateService.instant('temp_category_all');
            });
    }

    onLanguageChanged(language: string) {
        this.language = language;
        this.categories = [];

        if (this.language === this._translateService.instant('temp_category_all')) {
            this.cards = this.createCards;
            this.category = this._translateService.instant('temp_category_all');
        } else {
            this.cards = this.createCards.filter(cardTemplate => cardTemplate.languages.find(l => l === this.language));
        }

        // determine which categories are present for the selected cards

        this.cards.forEach(card => card.categories.forEach((c) => {
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
                } else if (!this.category && c === this._translateService.instant('temp_category_all')) {
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
            return ((ca ? ca.index : this.defaultIndex) > (cb ? cb.index : this.defaultIndex)) ? 1 : -1;
        });
    }

    private _findIntersectionOfCards() {
        if (this.category === this._translateService.instant('temp_category_all') && this.language === this._translateService.instant('temp_category_all')) {
            this.cards = this.createCards;
        } else if (this.category === this._translateService.instant('temp_category_all')) {
            this.cards = this.createCards.filter(card => card.languages.find(l => l === this.language));
        } else if (this.language === this._translateService.instant('temp_category_all')) {
            this.cards = this.createCards.filter(card => card.categories.find(c => c === this.category));
        } else {
            this.cards = this.createCards.filter(card => card.languages.find(l => l === this.language))
                .filter(cardTemplate => cardTemplate.categories.find(c => c === this.category));
        }

        this._initializeTabableCard();
    }

    private _filterOnSearchValue() {
        this.cards = this.cards.filter(card => card.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || card.languages.find(language => { return language.toLowerCase().indexOf(this.search.toLowerCase()) > -1; })
            || card.description.toLowerCase().indexOf(this.search.toLowerCase()) > -1);

        this._initializeTabableCard();
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

    onCardLanguageSelected(functionCard: CreateCard, functionLanguage: string, cardDisabled: boolean) {
        if (!cardDisabled) {
            this.createFunctionCard = functionCard;
            this.createFunctionLanguage = functionLanguage;
            this.sidePanelOpened = true;
        }
    }

    onCardSelected(functionCard: CreateCard, cardDisabled: boolean) {
        if (!cardDisabled) {
            this.createFunctionCard = functionCard;
            this.createFunctionLanguage = this.language === this._translateService.instant('temp_category_all') ? null : this.language;
            this.sidePanelOpened = true;
        }
    }

    onKeyPress(event: KeyboardEvent, functionCard: CreateCard, cardDisabled: boolean) {
        if (event.keyCode === KeyCodes.enter) {
            this.onCardSelected(functionCard, cardDisabled);

        } else if (event.keyCode === KeyCodes.arrowDown) {
            const cards = this._getCards();
            const nextIndex = this._findNextVerticleCardDown(cards, this._focusedCardIndex);
            this._clearFocusOnCard(cards, this._focusedCardIndex);
            this._setFocusOnCard(cards, nextIndex);
            this._scrollIntoView(cards[this._focusedCardIndex]);
            event.preventDefault();


        } else if (event.keyCode === KeyCodes.arrowUp) {
            const cards = this._getCards();
            const nextIndex = this._findNextVerticleCardUp(cards, this._focusedCardIndex);
            this._clearFocusOnCard(cards, this._focusedCardIndex);
            this._setFocusOnCard(cards, nextIndex);
            this._scrollIntoView(cards[this._focusedCardIndex]);
            event.preventDefault();


        } else if (event.keyCode === KeyCodes.arrowLeft) {
            const cards = this._getCards();
            this._clearFocusOnCard(cards, this._focusedCardIndex);
            this._setFocusOnCard(cards, this._focusedCardIndex - 1);
            this._scrollIntoView(cards[this._focusedCardIndex]);
            event.preventDefault();

        } else if (event.keyCode === KeyCodes.arrowRight) {
            const cards = this._getCards();
            this._clearFocusOnCard(cards, this._focusedCardIndex);
            this._setFocusOnCard(cards, this._focusedCardIndex + 1);
            this._scrollIntoView(cards[this._focusedCardIndex]);
            event.preventDefault();

        }
    }

    private _initializeTabableCard() {
        this.cards.forEach(card => card.focusable = false);
        this._focusedCardIndex = -1;

        if (this.cards.length > 0) {
            this.cards[0].focusable = true;
            this._focusedCardIndex = 0;
        }
    }

    private _getCards() {
        return this.createCardContainer.nativeElement.children;
    }

    private _clearFocusOnCard(cards: HTMLCollection, index: number) {
        const oldCard = Dom.getTabbableControl(<HTMLElement>cards[index]);
        this.cards[index].focusable = false;
        Dom.clearFocus(oldCard);
    }

    private _setFocusOnCard(cards: HTMLCollection, index: number) {
        let finalIndex = -1;
        let destCard: Element;

        if (index >= 0 && index < cards.length) {
            finalIndex = index;
            destCard = cards[finalIndex];
        } else if (cards.length > 0) {
            if (index === -1) {
                finalIndex = cards.length - 1;
            } else {
                finalIndex = 0;
            }
            destCard = cards[finalIndex];
        }

        if (destCard) {
            const newCard = Dom.getTabbableControl(<HTMLElement>destCard);
            this.cards[finalIndex].focusable = true;
            Dom.setFocus(<HTMLElement>newCard);
        }

        this._focusedCardIndex = finalIndex;
    }

    private _findNextVerticleCardDown(cards: HTMLCollection, index: number) {
        // Flexbox can have various arrangements of cards that make for some edge cases in using the down arrow key

        // This difficulty does not exist with less than 7 cards because we are gaurenteed that the card to go
        // down to is within a card's width (350) of the current card or that there is only one card below

        //      [1]     |      [1] [2]     |    [1] [2] [3]    |   [1] [2] [3] [4]
        //      [2]     |      [3] [4]     |      [4] [5]      |         [5]
        //      [3]     |        [5]       |                   |
        //      [4]     |                  |                   |
        //      [5]     |                  |                   |

        // ----------------------------------------------------------------------------------------------

        //     [1] [2]  |    [1] [2] [3] [4] [5]    |  [1] [2] [3] [4]      |   [1] [2] [3] [4] [5] [6]
        //     [3] [4]  |            [6]            |      [5] [6]          |
        //     [5] [6]  |                           |                       |


        // However with 7 cards we reach the 'base case' of difficulty:
        // We need logic that ensures cards map to the closest below them when there are multiple options
        // on the row below them and none of them are within the the card's width (350) of their position

        //     [1] [2] [3] [4] [5]   |   [1] [2] [3] [4] [5] [6]   |   [1] [2] [3] [4] [5]    |   ETC....
        //           [6] [7]         |           [7] [8]           |       [6] [7] [8]        |


        let nextRowPosition = 0;
        let foundNextRowPosition = false;
        let closestCardIndex = index;
        let closestCardDistance = 0;

        const currentCardPosition = Dom.getElementCoordinates(<HTMLElement>cards[index]);

        for (let i = index + 1; i < cards.length; i++) {
            const nextCardPosition = Dom.getElementCoordinates(<HTMLElement>cards[i]);
            if (!foundNextRowPosition && nextCardPosition.top > currentCardPosition.top) {
                nextRowPosition = nextCardPosition.top;
                foundNextRowPosition = true;
                closestCardIndex = i;
                closestCardDistance = Math.abs(currentCardPosition.left - nextCardPosition.left);
                if (closestCardDistance < 350) {
                    return closestCardIndex;
                }
                continue;
            }
            if (foundNextRowPosition) {
                if (nextCardPosition.top === nextRowPosition && Math.abs(currentCardPosition.left - nextCardPosition.left) < closestCardDistance) {
                    closestCardDistance = Math.abs(currentCardPosition.left - nextCardPosition.left);
                    closestCardIndex = i;
                    if (closestCardDistance < 350) {
                        return closestCardIndex;
                    }
                } else {
                    return closestCardIndex;
                }
            }
        }

        // If you don't find the position of the next row it means the current card is on the bottom row
        if (!foundNextRowPosition) {
            for (let i = 0; i < index; i++) {
                const nextCardPosition = Dom.getElementCoordinates(<HTMLElement>cards[i]);
                if (nextCardPosition.top <= currentCardPosition.top && Math.abs(nextCardPosition.left - currentCardPosition.left) < 350) {
                    closestCardIndex = i;
                    return closestCardIndex;
                }
            }
        }

        return closestCardIndex;
    }

    private _findNextVerticleCardUp(cards: HTMLCollection, index: number) {
        // Up arrow is much easier for Flexbox
        // The row above always has more than or equal to the number of boxes of the current row
        // This means there is a card above the current card that will be within its width (350)

        // However, since the up arrow should be able to wrap around, the top row will map to the bottom
        // In this case the logic is the same as arrow down from the n-1th row to the nth row (where n = total # of rows)

        let nextRowPosition = 0;
        let foundNextRowPosition = false;
        let closestCardIndex = index;
        let closestCardDistance = 0;

        const currentCardPosition = Dom.getElementCoordinates(<HTMLElement>cards[index]);

        for (let i = index - 1; i >= 0; i--) {
            const nextCardPosition = Dom.getElementCoordinates(<HTMLElement>cards[i]);
            if (nextCardPosition.top <= currentCardPosition.top && Math.abs(nextCardPosition.left - currentCardPosition.left) < 350) {
                closestCardIndex = i;
                return closestCardIndex;
            }
        }

        // If you don't find the position of the next row it means the current card is on the top row
        for (let i = cards.length - 1; i > index; i--) {
            const nextCardPosition = Dom.getElementCoordinates(<HTMLElement>cards[i]);
            if (!foundNextRowPosition && nextCardPosition.top > currentCardPosition.top) {
                nextRowPosition = nextCardPosition.top;
                foundNextRowPosition = true;
                closestCardIndex = i;
                closestCardDistance = Math.abs(currentCardPosition.left - nextCardPosition.left);
                if (closestCardDistance < 350) {
                    return closestCardIndex;
                }
                continue;
            }
            if (foundNextRowPosition) {
                if (nextCardPosition.top === nextRowPosition && Math.abs(currentCardPosition.left - nextCardPosition.left) < closestCardDistance) {
                    closestCardDistance = Math.abs(currentCardPosition.left - nextCardPosition.left);
                    closestCardIndex = i;
                    if (closestCardDistance < 350) {
                        return closestCardIndex;
                    }
                } else {
                    return closestCardDistance;
                }
            }
        }

        return closestCardIndex;

    }

    private _scrollIntoView(elem: HTMLElement) {
        Dom.scrollIntoView(elem, window.document.body);
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
