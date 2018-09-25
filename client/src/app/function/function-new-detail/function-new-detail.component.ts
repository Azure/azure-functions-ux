import { KeyCodes, LogCategories } from './../../shared/models/constants';
import { TreeViewInfo } from 'app/tree-view/models/tree-view-info';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { FunctionAppContext } from './../../shared/function-app-context';
import { LogService } from 'app/shared/services/log.service';
import { Subject } from 'rxjs/Subject';
import { AppNode } from './../../tree-view/app-node';
import { FunctionsNode } from './../../tree-view/functions-node';
import { AiService } from './../../shared/services/ai.service';
import { BindingList } from './../../shared/models/binding-list';
import { BindingManager } from './../../shared/models/binding-manager';
import { TranslateService } from '@ngx-translate/core';
import { BindingComponent } from './../../binding/binding.component';
import { GlobalStateService } from './../../shared/services/global-state.service';
import { FunctionInfo } from './../../shared/models/function-info';
import { DropDownElement } from './../../shared/models/drop-down-element';
import { Component, Input, SimpleChanges, OnChanges, Output } from '@angular/core';
import { FunctionTemplate } from '../../shared/models/function-template';
import { PortalResources } from '../../shared/models/portal-resources';
import { Action } from '../../shared/models/binding';
import { UIFunctionBinding } from '../../shared/models/binding';
import { PortalService } from '../../shared/services/portal.service';
import { Observable } from 'rxjs/Observable';
import { CreateCard } from 'app/function/function-new/function-new.component';
import { EmbeddedService } from 'app/shared/services/embedded.service';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { ErrorEvent } from 'app/shared/models/error-event';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';

@Component({
    selector: 'function-new-detail',
    templateUrl: './function-new-detail.component.html',
    styleUrls: ['./function-new-detail.component.scss']
})
export class FunctionNewDetailComponent implements OnChanges {

    private _bindingComponents: BindingComponent[] = [];

    @Input() functionCard: CreateCard;
    @Input() functionLanguage: string;
    @Input() functionAppLanguage: string;
    @Input() functionsInfo: FunctionInfo[];
    @Input() viewInfo: TreeViewInfo<any>;
    @Input() appNode: AppNode;
    @Input() functionsNode: FunctionsNode;
    @Input() context: FunctionAppContext;
    @Output() closePanel = new Subject();

    languageOptions: DropDownElement<string>[] = [];
    functionName: string;
    currentTemplate: FunctionTemplate;
    aadConfigured = true;
    templateWarning: string;
    addLinkToAuth = false;
    bc: BindingManager = new BindingManager();
    model: BindingList = new BindingList();
    hasConfigUI = true;
    action: Action;
    functionNameError = '';
    areInputsValid = false;
    updateBindingsCount = 0;
    clickSave = false;
    currentBinding: UIFunctionBinding = null;
    entityOptions: DropDownElement<string>[] = [];      // Used for embedded scenarios
    functionEntity: string;                             // Used for embedded scenarios
    entityContext: FunctionAppContext;                  // Used for embedded scenarios
    isEmbedded: boolean;                                // Used for embedded scenarios

    private _exclutionFileList = [
        'test.json',
        'readme.md',
        'metadata.json'
    ];

    constructor(
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _portalService: PortalService,
        private _aiService: AiService,
        private _functionAppService: FunctionAppService,
        private _logService: LogService,
        private _embeddedService: EmbeddedService,
        private _broadcastService: BroadcastService) {

        this.isEmbedded = this._portalService.isEmbeddedFunctions;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['functionCard']) {
            if (this.functionCard) {
                this.updateLanguageOptions();

                if (this._portalService.isEmbeddedFunctions) {
                    this.getEntityOptions();
                }
            }
        }
    }

    updateLanguageOptions() {
        if (!this.functionAppLanguage) {
            this.languageOptions = [];
            this.functionCard.languages.forEach(language => {
                const dropDownElement: any = {
                    displayLabel: language,
                    value: language
                };

                if (language === this.functionLanguage) {
                    dropDownElement.default = true;
                }

                this.languageOptions.push(dropDownElement);
            });
        } else {
            this.onLanguageChanged(this.functionAppLanguage);
        }
    }

    onLanguageChanged(language: string) {
        this.functionLanguage = language;
        if (this.functionLanguage) {
            this.onTemplatePickUpComplete()
                .subscribe(() => {
                });
        }
    }

    getEntityOptions() {
        this._embeddedService.getEntities()
            .subscribe(r => {
                if (r.isSuccessful) {
                    const entities = (r.result.value.map(e => e.name)).sort();
                    this.entityOptions = [];
                    entities.forEach(entity => {
                        const dropDownElement: any = {
                            displayLabel: entity,
                            value: entity
                        };
                        this.entityOptions.push(dropDownElement);
                    });
                }
            });
    }

    onEntityChanged(entity: string) {
        this.areInputsValid = false;
        this.functionEntity = entity.toLowerCase();

        if (this._portalService.isEmbeddedFunctions) {
            const entityContextId = `${this.context.site.id}/entities/${this.functionEntity}`;
            this._functionAppService.getAppContext(entityContextId)
                .switchMap(appContext => {
                    this.entityContext = appContext;
                    return this._functionAppService.getFunctions(this.entityContext);
                })
                .subscribe(r => {
                    if (r.isSuccessful) {
                        this.functionsInfo = r.result;
                        if (this.functionLanguage) {
                            this.functionName = BindingManager.getFunctionName(this.currentTemplate.metadata.defaultFunctionName, this.functionsInfo);
                            this.validate();
                        }
                    }
                });
        } else {
            if (this.functionLanguage) {
                this.functionName = BindingManager.getFunctionName(this.currentTemplate.metadata.defaultFunctionName, this.functionsInfo);
                this.validate();
            }
        }
    }

    onTemplatePickUpComplete() {
        this._globalStateService.setBusyState();
        return Observable.zip(
            this._functionAppService.getTemplates(this.context),
            this._functionAppService.getBindingConfig(this.context))
            .do(tuple => {
                if (tuple[0].isSuccessful && tuple[1].isSuccessful) {
                    const templates = tuple[0].result;
                    const bindingConfig = tuple[1].result;
                    this.currentTemplate = templates.find(t =>
                        t.metadata.language === this.functionLanguage && !!this.functionCard.ids.find(id => id === t.id));

                    const experimentalCategory = this.currentTemplate.metadata.category.find((c) => {
                        return c === 'Experimental';
                    });

                    // setting values to default
                    this.aadRegistrationConfigured(true);

                    this.templateWarning = experimentalCategory === undefined ? '' : this._translateService.instant(PortalResources.functionNew_experimentalTemplate);
                    if (this.currentTemplate.metadata.warning) {
                        this.addLinkToAuth = (<any>this.currentTemplate.metadata.warning).addLinkToAuth ? true : false;
                        if (this.templateWarning) {
                            this.templateWarning += '<br/>' + this.currentTemplate.metadata.warning.text;
                        } else {
                            this.templateWarning += this.currentTemplate.metadata.warning.text;
                        }
                    }

                    this.functionName = BindingManager.getFunctionName(this.currentTemplate.metadata.defaultFunctionName, this.functionsInfo);

                    this._globalStateService.clearBusyState();
                    this.bc.setDefaultValues(this.currentTemplate.function.bindings, this._globalStateService.DefaultStorageAccount);

                    this.model.config = this.bc.functionConfigToUI({
                        disabled: false,
                        bindings: this.currentTemplate.function.bindings
                    }, bindingConfig.bindings);

                    this.model.config.bindings.forEach((b) => {
                        b.hiddenList = this.currentTemplate.metadata.userPrompt || [];
                    });

                    this.hasConfigUI = ((this.currentTemplate.metadata.userPrompt) && (this.currentTemplate.metadata.userPrompt.length > 0));

                    this.model.setBindings();
                    this.currentBinding = this.model.trigger;

                    if (!this._portalService.isEmbeddedFunctions || (this._portalService.isEmbeddedFunctions && this.functionEntity)) {
                        this.functionName = BindingManager.getFunctionName(this.currentTemplate.metadata.defaultFunctionName, this.functionsInfo);
                        this.validate();
                    }

                    if (this.action) {

                        const binding = this.model.config.bindings.find((b) => {
                            return b.type.toString() === this.action.binding;
                        });

                        if (binding) {
                            this.action.settings.forEach((s, index) => {
                                const setting = binding.settings.find(bs => {
                                    return bs.name === s;
                                });
                                if (setting) {
                                    setting.value = this.action.settingValues[index];
                                }
                            });
                        }
                    }
                }
            }, e => {
                this._logService.error(LogCategories.functionNew, '/load-function-template-error', e);
            });
    }

    aadRegistrationConfigured(value: boolean) {
        this.aadConfigured = value;
    }

    functionNameChanged() {
        this.validate();
    }

    validate() {
        if (this.functionLanguage) {
            // ^[a-z][a-z0-9_\-]{0,127}$(?<!^host$) C# expression
            // Lookbehind is not supported in JS
            this.areInputsValid = true;
            this.functionNameError = '';
            const regexp = new RegExp('^[a-zA-Z][a-zA-Z0-9_\-]{0,127}$');
            this.areInputsValid = regexp.test(this.functionName);
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
                    this.functionNameError = this._translateService.instant(PortalResources.functionNew_functionExists, { name: this.functionName });
                    this.areInputsValid = false;
                }
            }

            if (this._portalService.isEmbeddedFunctions && !this.functionEntity) {
                this.areInputsValid = false;
            }

            this._bindingComponents.forEach((b) => {
                this.areInputsValid = b.areInputsValid && this.areInputsValid;
            });
        } else {
            this.areInputsValid = false;
        }
    }

    onValidChanged(component: BindingComponent) {
        const i = this._bindingComponents.findIndex((b) => {
            return b.bindingValue.id === component.bindingValue.id;
        });

        if (i !== -1) {
            this._bindingComponents[i] = component;
        } else {
            this._bindingComponents.push(component);
        }
        this.validate();
    }

    onRemoveBinding(binding: UIFunctionBinding) {
        this.model.removeBinding(binding.id);
        this.model.setBindings();
    }

    onUpdateBinding(binding: UIFunctionBinding) {
        this.model.updateBinding(binding);
        this.updateBindingsCount--;

        if (this.updateBindingsCount === 0) {
            // Last binding update
            this._createFunction();
        }
    }

    private _createFunction() {
        this._portalService.logAction('new-function', 'creating', {
            template: this.currentTemplate.id,
            name: this.functionName,
            appResourceId: this.context.site.id
        });

        this._exclutionFileList.forEach((file) => {
            for (const p in this.currentTemplate.files) {
                if (this.currentTemplate.files.hasOwnProperty(p) && file === (p + '').toLowerCase()) {
                    delete this.currentTemplate.files[p];
                }
            }
        });

        this._globalStateService.setBusyState();
        if (this._portalService.isEmbeddedFunctions) {
            this._embeddedService.createFunction(this.entityContext, this.functionName, this.currentTemplate.files, this.bc.UIToFunctionConfig(this.model.config))
                .subscribe(r => {
                    if (r.isSuccessful) {
                        r.result.context = this.entityContext;
                        this.functionsNode = <FunctionsNode>this.appNode.children.find(node => node.title === this.functionsNode.title);
                        this.functionsNode.addChild(r.result);
                    } else {
                        this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                            message: r.error.message,
                            errorId: r.error.errorId,
                            resourceId: this.entityContext.site.id,
                        });
                        this.close();
                    }
                    this._globalStateService.clearBusyState();
                });
        } else {
            this._functionAppService.createFunction(this.context, this.functionName, this.currentTemplate.files, this.bc.UIToFunctionConfig(this.model.config))
                .subscribe(newFunctionInfo => {
                    if (newFunctionInfo.isSuccessful) {
                        this._portalService.logAction('new-function', 'success', {
                            template: this.currentTemplate.id,
                            name: this.functionName,
                            appResourceId: this.context.site.id
                        });

                        this._aiService.trackEvent('new-function', { template: this.currentTemplate.id, result: 'success', first: 'false' });

                        newFunctionInfo.result.context = this.context;
                        this.functionsNode = <FunctionsNode>this.appNode.children.find(node => node.title === this.functionsNode.title);
                        this.functionsNode.addChild(newFunctionInfo.result);
                    }
                    this._globalStateService.clearBusyState();
                },
                    () => {
                        this._globalStateService.clearBusyState();
                    });
        }
    }

    onCreate() {
        if (!this.functionName || this._globalStateService.IsBusy) {
            return;
        }

        this.updateBindingsCount = this.model.config.bindings.length;
        if (this.updateBindingsCount === 0 || !this.hasConfigUI) {
            this._createFunction();
            return;
        }

        this.clickSave = true;
    }

    onKeyPress(event: KeyboardEvent) {
        if (event.keyCode === KeyCodes.escape) {
            this.close();
        }
    }

    close() {
        this.closePanel.next();
    }
}
