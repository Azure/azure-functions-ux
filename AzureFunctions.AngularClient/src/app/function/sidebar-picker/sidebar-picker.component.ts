import { LogCategories } from './../../shared/models/constants';
import { FunctionAppContextComponent } from 'app/shared/components/function-app-context-component';
import { LogService } from 'app/shared/services/log.service';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { RuntimeExtension } from './../../shared/models/binding';
import { FunctionTemplate } from './../../shared/models/function-template';
import { FunctionsNode } from './../../tree-view/functions-node';
import { AppNode } from './../../tree-view/app-node';
import { FunctionInfo } from 'app/shared/models/function-info';
import { Component, Input, Output } from '@angular/core';
import { CreateCard } from 'app/function/function-new/function-new.component';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { BroadcastService } from '../../shared/services/broadcast.service';

@Component({
    selector: 'sidebar-picker',
    templateUrl: './sidebar-picker.component.html',
    styleUrls: ['./sidebar-picker.component.scss']
})
export class SidebarPickerComponent extends FunctionAppContextComponent {

    @Input() functionLanguage: string;
    @Input() functionsInfo: FunctionInfo[];
    @Input() appNode: AppNode;
    @Input() functionsNode: FunctionsNode;
    @Output() closePanel = new Subject();

    public openFunctionNewDetail = false;
    public openExtensionInstallDetail = false;
    public currentTemplate: FunctionTemplate;
    public neededExtensions: RuntimeExtension[];
    public allInstalled = false;
    public autoPickedLanguage = false;
    public _functionCard: CreateCard;

    private functionCardStream: Subject<CreateCard>;

    constructor(private _logService: LogService, private _functionAppService: FunctionAppService, broadcastService: BroadcastService) {
        super('sidebar-picker', _functionAppService, broadcastService);
        this.functionCardStream = new Subject();
        this.functionCardStream
            .takeUntil(this.ngUnsubscribe)
            .switchMap(card => {
                this._functionCard = card;
                return this._functionAppService.getTemplates(this.context);
            })
            .switchMap(templates => {
                if (!this.functionLanguage) {
                    this.functionLanguage = this._functionCard.languages[0];
                    this.autoPickedLanguage = true;
                }
                this.currentTemplate = templates.result.find(t =>
                    t.metadata.language === this.functionLanguage && !!this._functionCard.ids.find(id => id === t.id));
                const runtimeExtensions = this.currentTemplate.metadata.extensions;
                if (runtimeExtensions && runtimeExtensions.length > 0) {
                    return this._getNeededExtensions(runtimeExtensions);
                } else {
                    return Observable.of(null);
                }
            })
            .do(null, e => {
                this._logService.error(LogCategories.functionNew, '/sidebar-error', e);
            })
            .subscribe(extensions => {
                if (extensions && extensions.length > 0) {
                    this.neededExtensions = extensions;
                    this.allInstalled = false;
                    this.functionLanguage = this.autoPickedLanguage ? null : this.functionLanguage;
                    this.openFunctionNewDetail = false;
                    this.openExtensionInstallDetail = true;
                } else {
                    this.neededExtensions = [];
                    this.allInstalled = true;
                    this.functionLanguage = this.autoPickedLanguage ? null : this.functionLanguage;
                    this.openFunctionNewDetail = true;
                    this.openExtensionInstallDetail = false;
                }
            });
    }

    pickUpTemplate() {
        return this._functionAppService.getTemplates(this.context)
            .concatMap(templates => {
                // TODO: [agruning] What to do if there is an error.
                if (templates.isSuccessful) {
                    this.currentTemplate = templates.result.find((t) => {
                        return t.metadata.language === this.functionLanguage &&
                            !!this.functionCard.ids.find((id) => {
                                return id === t.id;
                            });
                    });
                    return Observable.of(this.currentTemplate);
                } else {
                    return Observable.of(null);
                }
            })
            .concatMap(currentTemplate => {
                if (currentTemplate) {
                    const runtimeExtensions = this.currentTemplate.metadata.extensions;
                    if (runtimeExtensions && runtimeExtensions.length > 0) {
                        return this._getNeededExtensions(runtimeExtensions);
                    }
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

    @Input()
    set functionCard(value: CreateCard) {
        setTimeout(() => {
            this.functionCardStream.next(value);
        }, 100);
    }

    private _getNeededExtensions(requiredExtensions: RuntimeExtension[]) {
        const neededExtensions: RuntimeExtension[] = [];
        return this._functionAppService.getHostExtensions(this.context)
            .map(r => {
                // no extensions installed, all template extensions are required
                if (!r.isSuccessful || !r.result.extensions) {
                    return requiredExtensions;
                }

                requiredExtensions.forEach(requiredExtension => {
                    const ext = r.result.extensions.find(installedExtention => {
                        return installedExtention.id === requiredExtension.id
                            && installedExtention.version === requiredExtension.version;
                    });
                    if (!ext) {
                        neededExtensions.push(requiredExtension);
                    }
                });

                return neededExtensions;
            });
    }

    close() {
        this.closePanel.next();
    }
}
