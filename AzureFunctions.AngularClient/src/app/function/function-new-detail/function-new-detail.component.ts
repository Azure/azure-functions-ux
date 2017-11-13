import { LogCategories } from 'app/shared/models/constants';
import { LogService } from 'app/shared/services/log.service';
import { Subject } from 'rxjs/Subject';
import { FunctionAppContext } from './../../shared/services/functions-service';
import { CacheService } from './../../shared/services/cache.service';
import { AppNode } from './../../tree-view/app-node';
import { FunctionsNode } from './../../tree-view/functions-node';
import { AiService } from './../../shared/services/ai.service';
import { BindingList } from './../../shared/models/binding-list';
import { BindingManager } from './../../shared/models/binding-manager';
import { TranslateService } from '@ngx-translate/core';
import { BindingComponent } from './../../binding/binding.component';
import { GlobalStateService } from './../../shared/services/global-state.service';
import { FunctionApp } from './../../shared/function-app';
import { FunctionInfo } from './../../shared/models/function-info';
import { DropDownElement } from './../../shared/models/drop-down-element';
import { Template } from './../../shared/models/template-picker';
import { Component, Input, SimpleChanges, OnChanges, OnInit, Output } from '@angular/core';
import { FunctionTemplate } from '../../shared/models/function-template';
import { PortalResources } from '../../shared/models/portal-resources';
import { Action } from '../../shared/models/binding';
import { UIFunctionBinding } from '../../shared/models/binding';
import { PortalService } from '../../shared/services/portal.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'function-new-detail',
  templateUrl: './function-new-detail.component.html',
  styleUrls: ['./function-new-detail.component.scss']
})
export class FunctionNewDetailComponent implements OnInit, OnChanges {

  private _bindingComponents: BindingComponent[] = [];

  @Input() functionCardTemplate: Template;
  @Input() functionLanguage: string;
  @Input() functionsInfo: FunctionInfo[];
  @Input() functionApp: FunctionApp;
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
    private _logService: LogService) {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['functionCardTemplate']) {
      if (this.functionCardTemplate) {
        this.updateLanguageOptions();
      }
    }
  }

  updateLanguageOptions() {
    this.languageOptions = [];
    this.functionCardTemplate.languages.forEach(language => {
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

  onTemplatePickUpComplete() {
    return this.functionApp.getTemplates()
      .switchMap(templates => {
        this._globalStateService.setBusyState();
        return Observable.zip(
          this.functionApp.getBindingConfig(),
          Observable.of(templates),
          (c, t) => ({ config: c, templates: t }));
      })
      .do(r => {
        this.currentTemplate = r.templates.find((t) => {
          return t.metadata.language === this.functionLanguage &&
            this.functionCardTemplate.ids.find((id) => {
              return id === t.id;
            });
        });
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
        }, r.config.bindings);

        this.model.config.bindings.forEach((b) => {
          b.hiddenList = this.currentTemplate.metadata.userPrompt || [];
        });

        this.hasConfigUI = ((this.currentTemplate.metadata.userPrompt) && (this.currentTemplate.metadata.userPrompt.length > 0));

        this.model.setBindings();
        this.currentBinding = this.model.trigger;
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
    this._portalService.logAction('new-function', 'creating', { template: this.currentTemplate.id, name: this.functionName });

    this._exclutionFileList.forEach((file) => {
      for (const p in this.currentTemplate.files) {
        if (this.currentTemplate.files.hasOwnProperty(p) && file === (p + '').toLowerCase()) {
          delete this.currentTemplate.files[p];
        }
      }
    });

    this._globalStateService.setBusyState();
    this.functionApp.createFunctionV2(this.functionName, this.currentTemplate.files, this.bc.UIToFunctionConfig(this.model.config))
      .subscribe(newFunctionInfo => {
        this._portalService.logAction('new-function', 'success', { template: this.currentTemplate.id, name: this.functionName });
        this._aiService.trackEvent('new-function', { template: this.currentTemplate.id, result: 'success', first: 'false' });

        this._cacheService.clearCachePrefix(this.functionApp.getScmUrl());
        newFunctionInfo.context = this.context;

        // If someone refreshed the app, it would created a new set of child nodes under the app node.
        this.functionsNode = <FunctionsNode>this.appNode.children.find(node => node.title === this.functionsNode.title);
        this.functionsNode.addChild(newFunctionInfo);
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

  close() {
    this.closePanel.next();
  }

}
