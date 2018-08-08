import { PortalService } from 'app/shared/services/portal.service';
import { PortalResources } from 'app/shared/models/portal-resources';
import { LogCategories, KeyCodes } from './../../shared/models/constants';
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
import { ExtensionInstallStatus } from '../../shared/models/extension-install-status';
import { BaseExtensionInstallComponent } from '../../extension-install/base-extension-install-component';
import { TranslateService } from '@ngx-translate/core';
import { AiService } from '../../shared/services/ai.service';
import { FunctionAppContext } from '../../shared/function-app-context';
import { BusyStateScopeManager } from '../../busy-state/busy-state-scope-manager';
import { errorIds } from '../../shared/models/error-ids';

@Component({
    selector: 'extension-checker',
    templateUrl: './extension-checker.component.html',
    styleUrls: ['./extension-checker.component.scss']
})
export class ExtensionCheckerComponent extends BaseExtensionInstallComponent  {

    @Input() functionLanguage: string;
    @Input() functionsInfo: FunctionInfo[];
    @Input() functionAppLanguage: string;
    @Input() appNode: AppNode;
    @Input() functionsNode: FunctionsNode;
    @Input() passedContext: FunctionAppContext;
    @Output() closePanel = new Subject();

    public openFunctionNewDetail = false;
    public showExtensionInstallDetail = false;
    public currentTemplate: FunctionTemplate;
    public neededExtensions: RuntimeExtension[];
    public runtimeExtensions: RuntimeExtension[];
    public allInstalled = false;
    public autoPickedLanguage = false;
    public _functionCard: CreateCard;
    public installing = false;
    public installJobs: ExtensionInstallStatus[] = [];
    public installFailed = false;
    public detailsUrl: string;
    public installFailedUrl: string;
    public installFailedInstallId: string;
    public installFailedSessionId: string;

    private functionCardStream: Subject<CreateCard>;
    private _busyManager: BusyStateScopeManager;

    constructor(aiService: AiService,
        broadcastService: BroadcastService,
        private _functionAppService: FunctionAppService,
        private _logService: LogService,
        private _portalService: PortalService,
        private _translateService: TranslateService) {

        super('extension-checker', _functionAppService, broadcastService, aiService, _translateService);

        this._busyManager = new BusyStateScopeManager(this._broadcastService, 'sidebar');
        this.functionCardStream = new Subject();
        this.functionCardStream
            .takeUntil(this.ngUnsubscribe)
            .switchMap(card => {
                this._busyManager.setBusy();
                this._functionCard = card;
                return this._functionAppService.getTemplates(this.passedContext);
            })
            .switchMap(templates => {
                if (!this.functionLanguage) {
                    this.functionLanguage = this._functionCard.languages[0];
                    this.autoPickedLanguage = true;
                }
                this.currentTemplate = templates.result.find(t =>
                    t.metadata.language === this.functionLanguage && !!this._functionCard.ids.find(id => id === t.id));
                this.runtimeExtensions = this.currentTemplate.metadata.extensions;
                if (this.runtimeExtensions && this.runtimeExtensions.length > 0) {
                    return this._getNeededExtensions(this.runtimeExtensions);
                } else {
                    return Observable.of(null);
                }
            })
            .switchMap(extensions => {
                return this._setInstallationVariables(extensions);
            })
            .do(null, e => {
                this._busyManager.clearBusy();
                this.showComponentError({
                    message: this._translateService.instant(PortalResources.functionCreateErrorDetails, { error: e }),
                    errorId: errorIds.unableToCreateFunction,
                    resourceId: this.context.site.id
                });
                this._logService.error(LogCategories.functionNew, '/sidebar-error', e);
            })
            .subscribe(r => {
                this.functionLanguage = this.autoPickedLanguage ? null : this.functionLanguage;
                if (this.allInstalled) {
                    this.continueToFunctionNewDetail();
                } else {
                    this.showExtensionInstallDetail = true;
                    if (this.installing) {
                        this._pollInstallationStatus(0);
                    }
                }
                this._busyManager.clearBusy();
            });
    }

    @Input()
    set functionCard(value: CreateCard) {
        setTimeout(() => {
            this.functionCardStream.next(value);
        }, 100);
    }

    installNeededExtensions() {
        this.installing = true;
        this.installFailed = false;
        if (this.neededExtensions.length > 0) {
            const extensionCalls = this.neededExtensions.map(extension => {
                return this._functionAppService.installExtension(this.context, extension);
            });

            // Check install status
            Observable.zip(...extensionCalls).subscribe((r) => {
                this.installJobs = r.filter(i => i.isSuccessful).map(i => i.result);
                this._pollInstallationStatus(0);
            });
        }
    }

    continueToFunctionNewDetail() {
        this.openFunctionNewDetail = true;
        this.showExtensionInstallDetail = false;
    }

    private _getNeededExtensions(runtimeExtensions: RuntimeExtension[]) {
        const neededExtensions: RuntimeExtension[] = [];
        return this._functionAppService.getHostExtensions(this.context)
            .map(r => {
                // no extensions installed, all template extensions are required
                if (!r.isSuccessful || !r.result.extensions) {
                    return runtimeExtensions;
                }

                runtimeExtensions.forEach(runtimeExtension => {
                    const ext = r.result.extensions.find(installedExtention => {
                        return installedExtention.id === runtimeExtension.id
                            && installedExtention.version === runtimeExtension.version;
                    });
                    if (!ext) {
                        neededExtensions.push(runtimeExtension);
                    }
                });

                return neededExtensions;
            });
    }

    private _setInstallationVariables(neededExtensions: RuntimeExtension[]) {
        this.neededExtensions = !!neededExtensions ? neededExtensions : [];
        this.allInstalled = this.neededExtensions.length === 0;

        if (this.allInstalled) {
            return Observable.of(null);
        }
        return this._functionAppService.getExtensionJobsStatus(this.context)
            .map(r => {
                if (!r.isSuccessful || r.result.jobs.length === 0) {
                    return;
                }

                this.installing = true;
                this.neededExtensions.forEach(neededExtension => {
                    const ext = !!r.result.jobs.find(inProgressExtension => {
                        return neededExtension.id === inProgressExtension.properties.id
                        && neededExtension.version === inProgressExtension.properties.version;
                    });
                    this.installing = this.installing && ext;
                });
            });
    }

    private _pollInstallationStatus(timeOut: number) {
        setTimeout(() => {
            if (timeOut > 600) {
                this._getNeededExtensions(this.runtimeExtensions).subscribe((extensions) => {
                    this._setInstallationVariables(extensions);
                    if (!this.allInstalled) {
                        this.showTimeoutError(this.context);
                    }
                });
                return;
            }

            if (this.installJobs.length > 0) {
                this.installing = true;
                const status = this.installJobs
                    .filter(job => job && job.id)
                    .map(job => {
                        return this._functionAppService.getExtensionInstallStatus(this.context, job.id)
                            .map(r => {
                                return {
                                    installStatusResult: r,
                                    job: job
                                };
                            });
                    });

                // No installation to keep track of
                // All extension installations resulted in error like 500
                if (status.length === 0) {
                    this.installing = false;
                    return;
                }

                Observable.zip(...status).subscribe(responses => {
                    const job: ExtensionInstallStatus[] = [];
                    responses.forEach(r => {
                        const jobInstallationStatusResult = r.installStatusResult;
                        const jobObject = r.job;
                        // if failed then show error, remove from status tracking queue
                        if (jobInstallationStatusResult.isSuccessful && jobInstallationStatusResult.result.status === 'Failed') {
                            this.showInstallFailed(this.context, jobInstallationStatusResult.result.id);
                        }
                        // error status also show up here, error is different from failed
                        else if (jobInstallationStatusResult.isSuccessful &&
                            jobInstallationStatusResult.result.status !== 'Succeeded' &&
                            jobInstallationStatusResult.result.status !== 'Failed') {
                            job.push(jobInstallationStatusResult.result);
                        } else if (!jobInstallationStatusResult.isSuccessful) {
                            job.push(jobObject);
                        }
                    });
                    this.installJobs = job;
                    this._pollInstallationStatus(timeOut + 1);
                });
            } else {
                this._getNeededExtensions(this.runtimeExtensions).subscribe((extensions) => {
                    this.installing = false;
                    this._setInstallationVariables(extensions);
                });
            }
        }, 1000);
    }

    onKeyPress(event: KeyboardEvent) {
        if (event.keyCode === KeyCodes.escape) {
            this.close();
        }
    }

    showInstallFailed(context: FunctionAppContext, id: string) {
        this.installFailed = true;
        this.detailsUrl = context.urlTemplates.getRuntimeHostExentensionsJobUrl(id);
        this.installFailedUrl = this._translateService.instant(PortalResources.failedToInstallExtensionUrl, { url: this.detailsUrl });
        this.installFailedInstallId = this._translateService.instant(PortalResources.failedToInstallExtensionInstallId, {installId: id});
        this.installFailedSessionId = this._translateService.instant(PortalResources.failedToInstallExtensionSessionId, {sessionId: this._portalService.sessionId});
    }

    close() {
        this.closePanel.next();
    }
}
