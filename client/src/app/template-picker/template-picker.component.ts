import { Order, ScenarioIds } from './../shared/models/constants';
import { Component, Output, Input, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import 'rxjs/add/operator/distinctUntilChanged';

import { TemplatePickerType, Template } from '../shared/models/template-picker';
import { DirectionType, Binding } from '../shared/models/binding';
import { BindingManager } from '../shared/models/binding-manager';
import { TemplateFilterItem } from '../shared/models/template';
import { GlobalStateService } from '../shared/services/global-state.service';
import { DropDownElement } from '../shared/models/drop-down-element';
import { PortalResources } from '../shared/models/portal-resources';
import { FunctionAppContextComponent } from 'app/shared/components/function-app-context-component';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { BroadcastService } from '../shared/services/broadcast.service';
import { Subscription } from 'rxjs/Subscription';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import { ScenarioService } from '../shared/services/scenario/scenario.service';
import { FunctionService } from 'app/shared/services/function.service';

interface CategoryOrder {
  name: string;
  index: number;
}

@Component({
  selector: 'template-picker',
  templateUrl: './template-picker.component.html',
  styleUrls: ['./template-picker.component.scss'],
})
export class TemplatePickerComponent extends FunctionAppContextComponent {
  public languages: DropDownElement<string>[] = [];
  public categories: DropDownElement<string>[] = [];
  title: string;
  selectedTemplate: string;
  templates: Template[] = [];
  filterItems: TemplateFilterItem[] = [];
  bc: BindingManager = new BindingManager();
  bindings: Binding[];
  isTemplate = false;
  private category = '';
  private _language = '';
  private _type: TemplatePickerType;
  private _orderedCategoties: CategoryOrder[] = [];
  private _typeSubject: ReplaySubject<TemplatePickerType>;

  @Input()
  set type(type: TemplatePickerType) {
    this._typeSubject.next(type);
  }

  @Input()
  set template(value: string) {
    if (value) {
      this.onTemplateClicked(value, false);
    }
  }

  @Input()
  showFooter: boolean;
  @Output()
  complete: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  cancel: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private _scenarioService: ScenarioService,
    private _globalStateService: GlobalStateService,
    private _functionAppService: FunctionAppService,
    private _translateService: TranslateService,
    broadcastService: BroadcastService,
    functionService: FunctionService
  ) {
    super(
      'template-picker',
      _functionAppService,
      broadcastService,
      functionService,
      () => _globalStateService.setBusyState(),
      () => _globalStateService.clearBusyState()
    );
    this._typeSubject = new ReplaySubject(1);

    this._language = this._translateService.instant('temp_category_all');

    this._orderedCategoties = [
      {
        name: this._translateService.instant('temp_category_core'),
        index: 0,
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
      },
    ];
  }

  setup(): Subscription {
    return this.viewInfoEvents
      .combineLatest(this._typeSubject, (_, b) => b)
      .switchMap(pickerType =>
        Observable.zip(
          this._functionAppService.getTemplates(this.context),
          this._functionAppService.getBindingConfig(this.context),
          Observable.of(pickerType)
        )
      )
      .subscribe(tuple => {
        const type = tuple[2];
        this.isTemplate = type === TemplatePickerType.template;
        this._type = type;
        this._globalStateService.setBusyState();
        this._globalStateService.clearBusyState();
        if (tuple[0].isSuccessful && tuple[1].isSuccessful) {
          const config = tuple[1].result;
          const templates = tuple[0].result;
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

              let initLanguages = false,
                initCategories = false;
              if (this.languages.length === 0) {
                this.languages = [
                  {
                    displayLabel: this._translateService.instant(PortalResources.all),
                    value: this._translateService.instant('temp_category_all'),
                    default: true,
                  },
                ];
                initLanguages = true;
              }

              if (this.categories.length === 0) {
                this.categories = [
                  {
                    displayLabel: this._translateService.instant(PortalResources.all),
                    value: this._translateService.instant('temp_category_all'),
                  },
                ];
                initCategories = true;
              }

              templates.forEach(template => {
                if (template.metadata.visible === false) {
                  return;
                }

                if (!this.getFilterMatch(template.metadata.filters)) {
                  return;
                }

                if (initLanguages) {
                  const lang = this.languages.find(l => {
                    return l.value === template.metadata.language;
                  });
                  if (!lang) {
                    this.languages.push({
                      displayLabel: template.metadata.language,
                      value: template.metadata.language,
                    });
                  }
                }

                if (initCategories) {
                  template.metadata.category.forEach(c => {
                    if (
                      this._language === this._translateService.instant('temp_category_all') ||
                      template.metadata.language === this._language
                    ) {
                      const index = this.categories.findIndex(category => {
                        return category.value === c;
                      });

                      if (index === -1) {
                        const dropDownElement: any = {
                          displayLabel: c,
                          value: c,
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

                const matchIndex = template.metadata.category.findIndex(c => {
                  return c === this.category || this.category === this._translateService.instant('temp_category_all');
                });

                if (matchIndex !== -1) {
                  if (
                    this._language === this._translateService.instant('temp_category_all') ||
                    template.metadata.language === this._language
                  ) {
                    const keys = template.metadata.category.slice(0) || [this._translateService.instant('temp_category_experimental')];
                    keys.push(template.metadata.language);

                    this.templates.push({
                      name: `${template.metadata.name} - ${template.metadata.language}`,
                      value: template.id,
                      keys: keys,
                      description: template.metadata.description,
                      enabledInTryMode: template.metadata.enabledInTryMode,
                      AADPermissions: template.metadata.AADPermissions,
                    });
                  }
                }
              });

              this.categories.sort((a: DropDownElement<string>, b: DropDownElement<string>) => {
                const ca = this._orderedCategoties.find(c => {
                  return c.name === a.displayLabel;
                });
                const cb = this._orderedCategoties.find(c => {
                  return c.name === b.displayLabel;
                });
                return (ca ? ca.index : 500) > (cb ? cb.index : 500) ? 1 : -1;
              });

              this.languages = this.languages.sort((a: DropDownElement<string>, b: DropDownElement<string>) => {
                return a.displayLabel > b.displayLabel ? 1 : -1;
              });

              this.templates.sort((a: Template, b: Template) => {
                let ia = Order.templateOrder.findIndex(item => a.value.startsWith(item));
                let ib = Order.templateOrder.findIndex(item => b.value.startsWith(item));
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
        }
      });
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

  private getBindingTemplates(direction: DirectionType): Template[] {
    const result: Template[] = [];
    const filtered = this.bindings.filter(b => {
      return b.direction === direction;
    });

    filtered.forEach(binding => {
      // Hide BYOB features unless flag present: https://localhost:44300/?MSGraph=true
      // binding has attribute "filters": ["MSGraph"]
      if (this.getFilterMatch(binding.filters) && !this.bindingDisabled(binding.type.toString())) {
        result.push({
          name: binding.displayName.toString(),
          value: binding.type.toString(),
          enabledInTryMode: binding.enabledInTryMode,
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

  bindingDisabled(bindingType: string): boolean {
    const data = this._scenarioService.checkScenario(ScenarioIds.disabledBindings).data;
    return data && data.find(p => p === bindingType);
  }

  private getQueryStringValue(key) {
    // http://stackoverflow.com/questions/9870512/how-to-obtaining-the-querystring-from-the-current-url-with-javascript
    return window.location.search.replace(
      new RegExp('^(?:.*[&\\?]' + key.replace(/[\.\+\*]/g, '\\$&') + '(?:\\=([^&]*))?)?.*$', 'i'),
      '$1'
    );
  }
}
