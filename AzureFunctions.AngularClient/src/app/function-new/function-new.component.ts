import { Component, ElementRef, Inject } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import { TranslateService } from '@ngx-translate/core';

import { BindingComponent } from '../binding/binding.component';
import { TemplatePickerType } from '../shared/models/template-picker';
import { UIFunctionBinding } from '../shared/models/binding';
import { BindingList } from '../shared/models/binding-list';
import { Action } from '../shared/models/binding';
import { FunctionInfo } from '../shared/models/function-info';
import { BindingManager } from '../shared/models/binding-manager';
import { FunctionTemplate } from '../shared/models/function-template';
import { BroadcastService } from '../shared/services/broadcast.service';
import { PortalService } from '../shared/services/portal.service';
import { GlobalStateService } from '../shared/services/global-state.service';
import { PortalResources } from '../shared/models/portal-resources';
import { AiService } from '../shared/services/ai.service';
import { TreeViewInfo } from '../tree-view/models/tree-view-info';
import { FunctionsNode } from '../tree-view/functions-node';
import { FunctionApp } from '../shared/function-app';
import { AppNode } from '../tree-view/app-node';
import { DashboardType } from '../tree-view/models/dashboard-type';
import { Regex } from './../shared/models/constants';

@Component({
    selector: 'function-new',
    templateUrl: './function-new.component.html',
    styleUrls: ['./function-new.component.scss'],
    outputs: ['functionAdded'],
    inputs: ['viewInfoInput']
})
export class FunctionNewComponent {
    private functionsNode: FunctionsNode;
    public functionApp: FunctionApp;
    public functionsInfo: FunctionInfo[];
    elementRef: ElementRef;
    type: TemplatePickerType = TemplatePickerType.template;
    functionName: string;
    functionNameError = '';
    bc: BindingManager = new BindingManager();
    model: BindingList = new BindingList();
    clickSave = false;
    updateBindingsCount = 0;
    areInputsValid = false;
    hasConfigUI = true;
    selectedTemplate: FunctionTemplate;
    selectedTemplateId: string;
    templateWarning: string;
    addLinkToAuth = false;
    action: Action;
    aadConfigured = true;
    extensionInstalled = true;
    public disabled: boolean;
    private _bindingComponents: BindingComponent[] = [];
    public viewInfo: TreeViewInfo<any>;
    private _exclutionFileList = [
        'test.json',
        'readme.md',
        'metadata.json'
    ];

    private _viewInfoStream = new Subject<TreeViewInfo<any>>();
    public appNode: AppNode;

    constructor(
        @Inject(ElementRef) elementRef: ElementRef,
        _broadcastService: BroadcastService,
        private _portalService: PortalService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _aiService: AiService) {
        this.elementRef = elementRef;
        this.disabled = !!_broadcastService.getDirtyState("function_disabled");

        this._viewInfoStream
            .switchMap(viewInfo => {
                this.viewInfo = viewInfo;
                this._globalStateService.setBusyState();
                this.functionsNode = <FunctionsNode>viewInfo.node;
                this.appNode = <AppNode>viewInfo.node.parent;
                this.functionApp = this.functionsNode.functionApp;
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
    }

    set viewInfoInput(viewInfoInput: TreeViewInfo<any>) {
        this._viewInfoStream.next(viewInfoInput);
    }

    onTemplatePickUpComplete(templateName: string) {
        this._bindingComponents = [];
        this._globalStateService.setBusyState();
        this.functionApp.getTemplates().subscribe((templates) => {
            setTimeout(() => {
                this.selectedTemplate = templates.find((t) => t.id === templateName);
                const experimentalCategory = this.selectedTemplate.metadata.category.find((c) => {
                    return c === 'Experimental';
                });

                // setting values to default
                this.runtimeExtensionInstalled(true);
                this.aadRegistrationConfigured(true);

                this.templateWarning = experimentalCategory === undefined ? '' : this._translateService.instant(PortalResources.functionNew_experimentalTemplate);
                if (this.selectedTemplate.metadata.warning) {
                    this.addLinkToAuth = (<any>this.selectedTemplate.metadata.warning).addLinkToAuth ? true : false;
                    if (this.templateWarning) {
                        this.templateWarning += '<br/>' + this.selectedTemplate.metadata.warning.text;
                    } else {
                        this.templateWarning += this.selectedTemplate.metadata.warning.text;
                    }
                }

                this.functionName = BindingManager.getFunctionName(this.selectedTemplate.metadata.defaultFunctionName, this.functionsInfo);
                this.functionApp.getBindingConfig().subscribe((bindings) => {
                    this._globalStateService.clearBusyState();
                    this.bc.setDefaultValues(this.selectedTemplate.function.bindings, this._globalStateService.DefaultStorageAccount);

                    this.model.config = this.bc.functionConfigToUI({
                        disabled: false,
                        bindings: this.selectedTemplate.function.bindings
                    }, bindings.bindings);

                    this.model.config.bindings.forEach((b) => {
                        b.hiddenList = this.selectedTemplate.metadata.userPrompt || [];
                    });

                    this.hasConfigUI = ((this.selectedTemplate.metadata.userPrompt) && (this.selectedTemplate.metadata.userPrompt.length > 0));

                    this.model.setBindings();
                    this.validate();

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

                });
            });
        });
    }

    onCreate() {
        if (!this.functionName || this._globalStateService.IsBusy) {
            return;
        }

        this.updateBindingsCount = this.model.config.bindings.length;
        if (this.updateBindingsCount === 0 || !this.hasConfigUI) {
            this.createFunction();
            return;
        }

        this.clickSave = true;
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
            this.createFunction();
        }
    }

    functionNameChanged() {
        this.validate();
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

    quickstart() {
        this.functionsNode.openCreateDashboard(DashboardType.CreateFunctionQuickstartDashboard);
    }

    onAuth() {
        this._portalService.openBlade({
            detailBlade: 'AppAuth',
            detailBladeInputs: { resourceUri: this.functionApp.site.id }
        },
            'binding'
        );
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

        this._bindingComponents.forEach((b) => {
            this.areInputsValid = b.areInputsValid && this.areInputsValid;
        });
    }


    aadRegistrationConfigured(value: boolean) {
        this.aadConfigured = value;
    }

    runtimeExtensionInstalled(value: boolean) {
        this.extensionInstalled = value;
    }

    private createFunction() {
        this._portalService.logAction('new-function', 'creating', { template: this.selectedTemplate.id, name: this.functionName });

        this._exclutionFileList.forEach((file) => {
            for (const p in this.selectedTemplate.files) {
                if (this.selectedTemplate.files.hasOwnProperty(p) && file === (p + '').toLowerCase()) {
                    delete this.selectedTemplate.files[p];
                }
            }
        });

        this._globalStateService.setBusyState();
        this.functionApp.createFunctionV2(this.functionName, this.selectedTemplate.files, this.bc.UIToFunctionConfig(this.model.config))
            .subscribe(res => {
                this._portalService.logAction('new-function', 'success', { template: this.selectedTemplate.id, name: this.functionName });
                this._aiService.trackEvent('new-function', { template: this.selectedTemplate.id, result: 'success', first: 'false' });

                // If someone refreshed the app, it would created a new set of child nodes under the app node.
                this.functionsNode = <FunctionsNode>this.appNode.children.find(node => node.title === this.functionsNode.title);
                this.functionsNode.addChild(res);
            },
            () => {
                this._globalStateService.clearBusyState();
            });
    }
}
