import { LogService } from 'app/shared/services/log.service';
import { LogCategories } from 'app/shared/models/constants';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { FunctionAppContext } from './../../shared/services/functions-service';
import { RuntimeExtension } from './../../shared/models/binding';
import { FunctionTemplate } from './../../shared/models/function-template';
import { FunctionsNode } from './../../tree-view/functions-node';
import { AppNode } from './../../tree-view/app-node';
import { FunctionApp } from './../../shared/function-app';
import { FunctionInfo } from 'app/shared/models/function-info';
import { Component, OnInit, Input, Output, SimpleChanges } from '@angular/core';
import { CreateCard } from 'app/function/function-new/function-new.component';

@Component({
  selector: 'sidebar-picker',
  templateUrl: './sidebar-picker.component.html',
  styleUrls: ['./sidebar-picker.component.scss']
})
export class SidebarPickerComponent implements OnInit {

  @Input() functionCard: CreateCard;
  @Input() functionLanguage: string;
  @Input() functionsInfo: FunctionInfo[];
  @Input() functionApp: FunctionApp;
  @Input() appNode: AppNode;
  @Input() functionsNode: FunctionsNode;
  @Input() context: FunctionAppContext;
  @Output() closePanel = new Subject();

  openFunctionNewDetail = false;
  openExtensionInstallDetail = false;

  currentTemplate: FunctionTemplate;
  neededExtensions: RuntimeExtension[];
  allInstalled = false;
  autoPickedLanguage = false;

  constructor(
    private _logService: LogService) {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['functionCard']) {
      if (this.functionCard) {
        // if they did not select a language, pick the first language to test if extensions are installed
        if (!this.functionLanguage) {
          this.functionLanguage = this.functionCard.languages[0];
          this.autoPickedLanguage = true;
        }
        this.pickUpTemplate()
        .subscribe(() => {
        });
      }
    }
  }

  pickUpTemplate() {
    return this.functionApp.getTemplates()
    .switchMap(templates => {
      this.currentTemplate = templates.find((t) => {
        return t.metadata.language === this.functionLanguage &&
          this.functionCard.ids.find((id) => {
            return id = t.id;
          });
      });
      return Observable.of(this.currentTemplate);
    })
    .switchMap(currentTemplate => {
      const runtimeExtensions = this.currentTemplate.metadata.extensions;
      if (runtimeExtensions && runtimeExtensions.length > 0) {
        return this._getRequiredExtensions(runtimeExtensions);
      }
      return Observable.of(null);
    })
    .do(extensions => {
      if (extensions) {
        this.neededExtensions = extensions;
        this.allInstalled = (this.neededExtensions.length === 0);
        this.functionLanguage = this.autoPickedLanguage ? null : this.functionLanguage;
        this.openFunctionNewDetail = this.allInstalled;
        this.openExtensionInstallDetail = !this.allInstalled;
      } else {
        this.neededExtensions = [];
        this.allInstalled = true;
        this.functionLanguage = this.autoPickedLanguage ? null : this.functionLanguage;
        this.openFunctionNewDetail = true;
        this.openExtensionInstallDetail = false;
      }
    }, e => {
      this._logService.error(LogCategories.functionNew, '/sidebar-error', e);
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
    this.closePanel.next();
  }

}
