import { FunctionAppContext } from './../../shared/services/functions-service';
import { RuntimeExtension } from './../../shared/models/binding';
import { FunctionTemplate } from './../../shared/models/function-template';
import { FunctionsNode } from './../../tree-view/functions-node';
import { AppNode } from './../../tree-view/app-node';
import { FunctionApp } from './../../shared/function-app';
import { FunctionInfo } from 'app/shared/models/function-info';
import { Template } from './../../shared/models/template-picker';
import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';

@Component({
  selector: 'sidebar-picker',
  templateUrl: './sidebar-picker.component.html',
  styleUrls: ['./sidebar-picker.component.scss']
})
export class SidebarPickerComponent implements OnInit {

  @Input() functionCardTemplate: Template;
  @Input() functionLanguage: string;
  @Input() functionsInfo: FunctionInfo[];
  @Input() functionApp: FunctionApp;
  @Input() appNode: AppNode;
  @Input() functionsNode: FunctionsNode;
  @Input() context: FunctionAppContext;
  @Output() closePanel = new EventEmitter();

  openFunctionNewDetail = false;
  openExtensionInstallDetail = false;

  currentTemplate: FunctionTemplate;
  neededExtensions: RuntimeExtension[];
  allInstalled = false;
  autoPickedLanguage = false;

  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['functionCardTemplate']) {
      if (this.functionCardTemplate) {
        // if they did not select a language, pick the first language to test if extensions are installed
        if (!this.functionLanguage) {
          this.functionLanguage = this.functionCardTemplate.languages[0];
          this.autoPickedLanguage = true;
        }
        this.pickUpTemplate();
      }
    }
  }

  pickUpTemplate() {
    this.functionApp.getTemplates().subscribe((templates) => {
      setTimeout(() => {
        this.currentTemplate = templates.find((t) => {
          return t.metadata.language === this.functionLanguage &&
            this.functionCardTemplate.ids.find((id) => {
              return id === t.id;
            });
        });
        if (!this.currentTemplate) {
          return;
        }
        const runtimeExtensions = this.currentTemplate.metadata.extensions;
        if (runtimeExtensions && runtimeExtensions.length > 0) {
          this._getRequiredExtensions(runtimeExtensions)
          .subscribe(extensions => {
              this.neededExtensions = extensions;
              this.allInstalled = (this.neededExtensions.length === 0);
              this.functionLanguage = this.autoPickedLanguage ? null : this.functionLanguage;
              this.openFunctionNewDetail = this.allInstalled;
              this.openExtensionInstallDetail = !this.allInstalled;
          });
        } else {
          this.neededExtensions = [];
          this.allInstalled = true;
          this.functionLanguage = this.autoPickedLanguage ? null : this.functionLanguage;
          this.openFunctionNewDetail = true;
          this.openExtensionInstallDetail = false;
        }
      });
    });
  }

  private _getRequiredExtensions(templateExtensions: RuntimeExtension[]) {
    const extensions: RuntimeExtension[] = [];
    return this.functionApp.getHostExtensions().map(r => {
        // no extensions installed, all template extensions are required
        if (!r.extensions) {
            return templateExtensions;
        }

        templateExtensions.forEach(requiredExtension => {
          const ext = r.extensions.first(installedExtention => {
            return installedExtention.id === requiredExtension.id
                  && installedExtention.version === requiredExtension.version;
          });
          if (!ext) {
            extensions.push(requiredExtension);
          }
        });

        return extensions;
    });
  }

  close() {
    this.closePanel.emit();
  }

}
