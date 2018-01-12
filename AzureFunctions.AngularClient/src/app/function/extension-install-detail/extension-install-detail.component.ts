import { ExtensionInstallStatus, KeyCodes } from './../../shared/models/constants';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BaseExtensionInstallComponent } from 'app/extension-install/base-extension-install-component';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { RuntimeExtension } from './../../shared/models/binding';
import { Component, Input, Output } from '@angular/core';
import { CreateCard } from 'app/function/function-new/function-new.component';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { TranslateService } from '@ngx-translate/core';
import { AiService } from '../../shared/services/ai.service';

@Component({
    selector: 'extension-install-detail',
    templateUrl: './extension-install-detail.component.html',
    styleUrls: ['./extension-install-detail.component.scss']
})
export class ExtensionInstallDetailComponent extends BaseExtensionInstallComponent {
    @Input() functionCard: CreateCard;
    @Output() installed: BehaviorSubject<boolean> = new BehaviorSubject(false);
    @Output() closePanel = new Subject();

    loading = false;
    installJobs: any[] = [];
    extensions: RuntimeExtension[];
    installing = false;
    installationSucceeded = false;

    constructor(
        private _functionAppService: FunctionAppService,
        broadcastService: BroadcastService,
        translateService: TranslateService,
        aiService: AiService) {
        super('extension-install-details', _functionAppService, broadcastService, aiService, translateService);
    }

    @Input()
    set requiredExtensions(runtimeExtensions: RuntimeExtension[]) {
        if (runtimeExtensions && runtimeExtensions.length > 0) {
            this.loading = true;
            this.GetRequiredExtensions(runtimeExtensions)
                .subscribe(extensions => {
                    this.loading = false;
                    this.extensions = extensions;
                    this.installed.next(this.extensions.length === 0);
                });
        } else {
            this.installed.next(true);
            this.extensions = [];
        }
    }

    installRequiredExtensions() {
        this.installing = true;
        if (this.extensions.length > 0) {
            const extensionCalls: Observable<any>[] = [];
            this.extensions.forEach(extension => {
                extensionCalls.push(this._functionAppService.installExtension(this.context, extension));
            });

            // Check install status
            Observable.zip(...extensionCalls).subscribe((r) => {
                this.installJobs = r;
                this.installing = false;
                this.pollInstallationStatus(0);
            });
        }
    }

    // if post request for install resulted in error, error is added to jobstatus
    // if polling has started, it will wait until timeout and will ignore error
    // as error could be temporary because of host restart.
    pollInstallationStatus(timeOut: number) {
        setTimeout(() => {
            if (timeOut > 600) {
                this.GetRequiredExtensions(this.extensions).subscribe((r) => {
                    this.extensions = r;
                    this.showTimeoutError(this.context);
                    this.installing = false;
                    this.installed.next(this.extensions.length === 0);
                });
                return;
            }

            if (this.installJobs.length > 0) {
                this.installing = true;
                const status: Observable<any>[] = [];
                this.installJobs.forEach(job => {
                    // if resulted in error not added to status
                    if (job && job.id) {
                        status.push(this._functionAppService.getExtensionInstallStatus(this.context, job.id));
                    }
                });

                // No installation to keep track of
                // All extension installations resulted in error like 500
                if (status.length === 0) {
                    this.installing = false;
                    return;
                }

                Observable.zip(...status).subscribe(r => {
                    const job: any[] = [];
                    r.forEach(jobStatus => {
                        // if failed then show error, remove from status tracking queue
                        if (jobStatus.status === ExtensionInstallStatus.Failed) {
                            this.showInstallFailed(this.context, jobStatus.id);
                        }

                        // error status also show up here, error is different from failed
                        if (jobStatus.status !== ExtensionInstallStatus.Succeeded && jobStatus.status !== ExtensionInstallStatus.Failed) {
                            job.push(jobStatus);
                        }

                    });
                    this.installJobs = job;
                    this.pollInstallationStatus(timeOut + 1);
                });
            } else {
                // if any one the extension installation failed then success banner will not be shown
                this.GetRequiredExtensions(this.extensions).subscribe((r) => {
                    this.installing = false;
                    this.extensions = r;
                    if (r.length === 0) {
                        this.installed.next(true);
                        this.showInstallSucceededBanner();
                    }
                });
            }
        }, 1000);
    }

    showInstallSucceededBanner() {
        this.installationSucceeded = true;
        setTimeout(() => {
            this.installationSucceeded = false;
        }, 5000);
    }

    GetRequiredExtensions(templateExtensions: RuntimeExtension[]) {
        const extensions: RuntimeExtension[] = [];
        return this._functionAppService.getHostExtensions(this.context)
            .map(r => {
                if (r.isSuccessful) {
                    // no extensions installed, all template extensions are required
                    if (!r.result.extensions) {
                        return templateExtensions;
                    }

                    templateExtensions.forEach(requiredExtension => {
                        let isInstalled = false;
                        r.result.extensions.forEach(installedExtension => {
                            isInstalled = isInstalled
                                || (installedExtension.id
                                    && requiredExtension.id === installedExtension.id
                                    && requiredExtension.version === installedExtension.version);
                        });

                        if (!isInstalled) {
                            extensions.push(requiredExtension);
                        }
                    });
                    return extensions;
                } else {
                    return [];
                }
            });
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
