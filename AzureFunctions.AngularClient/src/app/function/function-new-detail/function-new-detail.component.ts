import { ArmEmbeddedService } from './../../shared/services/arm-embedded.service';
import { KeyCodes, LogCategories } from './../../shared/models/constants';
import { TreeViewInfo } from 'app/tree-view/models/tree-view-info';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { FunctionAppContext } from './../../shared/function-app-context';
import { LogService } from 'app/shared/services/log.service';
import { Subject } from 'rxjs/Subject';
import { CacheService } from './../../shared/services/cache.service';
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

@Component({
    selector: 'function-new-detail',
    templateUrl: './function-new-detail.component.html',
    styleUrls: ['./function-new-detail.component.scss']
})
export class FunctionNewDetailComponent implements OnChanges {

    // TODO: ellhamai - figure out where to put this
    private _cdsEntitiesUrl = 'https://tip1.api.cds.microsoft.com/providers/Microsoft.CommonDataModel/environments/0fb7e803-94aa-4e69-9694-d3b3cea74523/namespaces/5d5374aa-0df3-421c-9656-5244ac88593c/entities?api-version=2016-11-01-alpha&$expand=namespace&headeronly=true';
    private _bindingComponents: BindingComponent[] = [];

    @Input() functionCard: CreateCard;
    @Input() functionLanguage: string;
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
    modelDocumentation: string;
    entityOptions: DropDownElement<string>[] = [];      // Used for embedded scenario's
    functionEntity: string;                             // Used for embedded scenario's

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
        private _cacheService: CacheService,
        private _functionAppService: FunctionAppService,
        private _logService: LogService) {
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
        this._getEntities()
            .subscribe(r => {
                const entities = r.value.map(e => e.name);
                this.entityOptions = [];
                entities.forEach(entity => {
                    const dropDownElement: any = {
                        displayLabel: entity,
                        value: entity
                    };
                    this.entityOptions.push(dropDownElement);
                });
            });
    }

    onEntityChanged(entity: string) {
        this.areInputsValid = false;
        this.functionEntity = entity.toLowerCase();
        // const entityContextId = `${this.context.site.id}/entities/${this.functionEntity}`;

        if (this.functionLanguage) {
            this.functionName = BindingManager.getFunctionName(this.currentTemplate.metadata.defaultFunctionName, this.functionsInfo);
            this.validate();
        }

        // this._functionAppService.getAppContext(entityContextId)
        //     .subscribe(appContext => {
        //         const entityContext = appContext;
        //         this._functionAppService.getFunctions(entityContext)
        //             .subscribe(functionInfo => {
        //                 this.functionsInfo = functionInfo.result;
        //                 if (this.functionLanguage) {
        //                     this.functionName = BindingManager.getFunctionName(this.currentTemplate.metadata.defaultFunctionName, this.functionsInfo);
        //                     this.validate();
        //                 }
        //             });
        //     });
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
                    this.functionNameError = this._translateService.instant(PortalResources.functionNew_functionExsists, { name: this.functionName });
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

    private _getEntities() {
        const url = this._cdsEntitiesUrl;
        return this._cacheService.get(url)
            .map(r => r.json());
    }

    private _createFunction() {
        this._portalService.logAction('new-function', 'creating', { template: this.currentTemplate.id, name: this.functionName });

        this._exclutionFileList.forEach((file) => {
            for (const p in this.currentTemplate.files) {
                if (this.currentTemplate.files.hasOwnProperty(p) && file === (p + '').toLowerCase()) {
                    delete this.currentTemplate.files[p];
                }
            }
        });

        this._globalStateService.setBusyState();
        this._functionAppService.createFunctionV2(this.context, this.functionName, this.currentTemplate.files, this.bc.UIToFunctionConfig(this.model.config))
            .subscribe(newFunctionInfo => {
                if (newFunctionInfo.isSuccessful) {
                    this._portalService.logAction('new-function', 'success', { template: this.currentTemplate.id, name: this.functionName });
                    this._aiService.trackEvent('new-function', { template: this.currentTemplate.id, result: 'success', first: 'false' });

                    if (this._portalService.isEmbeddedFunctions) {
                        this._cacheService.clearCachePrefix(`${ArmEmbeddedService.url}${this.context.site.id}`);

                        const currResourceId = '/' + newFunctionInfo.result.script_href.split('/').filter(part => !!part).slice(0, 8).join('/');

                        // TODO: ellhamai - should probably fix this so that you're not calling an observable
                        // to set the context on the function object.
                        this._functionAppService.getAppContext(currResourceId)
                            .subscribe(appContext => newFunctionInfo.result.context = appContext);

                    } else {
                        this._cacheService.clearCachePrefix(this.context.urlTemplates.scmSiteUrl);
                        newFunctionInfo.result.context = this.context;
                    }

                    // If someone refreshed the app, it would created a new set of child nodes under the app node.
                    this.functionsNode = <FunctionsNode>this.appNode.children.find(node => node.title === this.functionsNode.title);
                    this.functionsNode.addChild(newFunctionInfo.result);
                }
                this._globalStateService.clearBusyState();
            },
            () => {
                this._globalStateService.clearBusyState();
            });
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
