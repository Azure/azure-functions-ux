import {Component, ElementRef, Inject, Output, Input, EventEmitter, OnInit, AfterViewInit} from '@angular/core';
import {NgClass} from '@angular/common';
import {FunctionsService} from '../services/functions.service';
import {BindingComponent} from './binding.component';
import {TemplatePickerComponent} from './template-picker.component';
import {TemplatePickerType} from '../models/template-picker';
import {UIFunctionConfig, UIFunctionBinding, DirectionType, BindingType} from '../models/binding';
import {BindingList} from '../models/binding-list';
import {FunctionInfo} from '../models/function-info';
import {BindingManager} from '../models/binding-manager';
import {FunctionTemplate} from '../models/function-template';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {PortalService} from '../services/portal.service';
import {ErrorEvent} from '../models/error-event';
import {GlobalStateService} from '../services/global-state.service';
import {PopOverComponent} from './pop-over.component';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';

declare var jQuery: any;

@Component({
    selector: 'function-new',
    templateUrl: './templates/function-new.component.html',
    styleUrls: ['styles/function-new.style.css'],
    directives: [TemplatePickerComponent, BindingComponent, NgClass, PopOverComponent],
    outputs: ['functionAdded'],
    pipes: [TranslatePipe]

})

export class FunctionNewComponent {
    @Input() functionsInfo: FunctionInfo[];

    elementRef: ElementRef;
    type: TemplatePickerType = TemplatePickerType.template;
    functionName: string;
    functionNameError: string = "";
    bc: BindingManager = new BindingManager();
    model: BindingList = new BindingList();
    clickSave: boolean = false;
    updateBindingsCount = 0;
    areInputsValid: boolean = false;
    hasConfigUI :boolean = true;
    selectedTemplate: FunctionTemplate;
    hasInputsToShow: boolean;
    templateWarning: string;
    public disabled: boolean;
    private functionAdded: EventEmitter<FunctionInfo> = new EventEmitter<FunctionInfo>();
    private _bindingComponents: BindingComponent[] = [];
    private _exclutionFileList = [
        "test.json",
        "readme.md",
        "metadata.json"
    ];

    constructor(
        @Inject(ElementRef) elementRef: ElementRef,
        private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService,
        private _portalService : PortalService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService)
    {
        this.elementRef = elementRef;
        this.disabled = _broadcastService.getDirtyState("function_disabled");
    }

    onTemplatePickUpComplete(templateName: string) {
        this._bindingComponents = [];
        this._globalStateService.setBusyState();
        this._functionsService.getTemplates().subscribe((templates) => {
            this.selectedTemplate = templates.find((t) => t.id === templateName);

            var experimentalCategory = this.selectedTemplate.metadata.category.find((c) => {
                return c === "Experimental";
            });
            this.templateWarning = experimentalCategory === undefined ? '' : <string>this._translateService.instant("functionNew_experimentalTemplate");

            this.functionName = BindingManager.getFunctionName(this.selectedTemplate.metadata.defaultFunctionName, this.functionsInfo);
            this._functionsService.getBindingConfig().subscribe((bindings) => {
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
            });
        });
    }

    onCreate() {
        if (!this.functionName) {
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
            //Last binding update
            this.createFunction();
        }
    }

    onInputsToShowChanged(show : boolean){
        this.hasInputsToShow = show;
    }

    functionNameChanged(value: string) {
        this.validate();
    }

    onValidChanged(component: BindingComponent) {
        var i = this._bindingComponents.findIndex((b) => {
            return b.bindingValue.id === component.bindingValue.id;
        });

        if (i !== -1) {
            this._bindingComponents[i] = component;
        } else {
            this._bindingComponents.push(component);
        }
        this.validate();
    }

    private validate() {
        this.areInputsValid = this.functionName ? true : false;
        this.functionNameError = this.areInputsValid ? '' : <string>this._translateService.instant("functionNew_functionNameRequired");
        this._bindingComponents.forEach((b) => {
            this.areInputsValid = b.areInputsValid && this.areInputsValid;
        });
    }

    private createFunction() {
        this._portalService.logAction("new-function", "creating", { template: this.selectedTemplate.id, name: this.functionName });

        this._exclutionFileList.forEach((file) => {
            for (var p in this.selectedTemplate.files) {
                if (this.selectedTemplate.files.hasOwnProperty(p) && file == (p + "").toLowerCase()) {
                    delete this.selectedTemplate.files[p];
                }
            }
        });

        this._globalStateService.setBusyState();
        this._functionsService.createFunctionV2(this.functionName, this.selectedTemplate.files, this.bc.UIToFunctionConfig(this.model.config))
            .subscribe(res => {
                this._portalService.logAction("new-function", "success", { template: this.selectedTemplate.id, name: this.functionName });
                this._broadcastService.broadcast(BroadcastEvent.FunctionAdded, res);
                this._globalStateService.clearBusyState();
            },
            e => {
                this._portalService.logAction("new-function", "failed", { template: this.selectedTemplate.id, name: this.functionName });
                this._globalStateService.clearBusyState();
                this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                    message: <string>this._translateService.instant("functionCreateErrorMessage"),
                    details: <string>this._translateService.instant("functionCreateErrorDetails", { error: JSON.stringify(e) })
                });
            });
    }
}