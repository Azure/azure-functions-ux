import { KeyCodes } from './../../shared/models/constants';
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
import { Subscription } from 'rxjs/Subscription';
import { ExtensionInstallStatus } from '../../shared/models/extension-install-status';

@Component({
    selector: 'extension-install-detail',
    templateUrl: './extension-install-detail.component.html',
    styleUrls: ['./extension-install-detail.component.scss']
})
export class ExtensionInstallDetailComponent extends BaseExtensionInstallComponent {
    @Input() functionCard: CreateCard;
    @Input() requiredExtensions: RuntimeExtension[];
    @Output() installed: BehaviorSubject<boolean> = new BehaviorSubject(false);
    @Output() closePanel = new Subject();

    loading = false;
    installJobs: ExtensionInstallStatus[] = [];
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

    setup(): Subscription {
        return this.viewInfoEvents
            .takeUntil(this.ngUnsubscribe)
            .switchMap(() => {
                this.loading = true;
                if (this.requiredExtensions && this.requiredExtensions.length > 0) {
                    return this.GetRequiredExtensions(this.requiredExtensions);
                } else {
                    return Observable.of([]);
                }
            })
            .subscribe(extensions => {
                this.loading = false;
                this.extensions = extensions;
                this.installed.next(this.extensions.length === 0);
            });
    }

    installRequiredExtensions() {
        this.installing = true;
        if (this.extensions.length > 0) {
            const extensionCalls = this.extensions.map(extension => {
                return this._functionAppService.installExtension(this.context, extension);
            });

            // Check install status
            Observable.zip(...extensionCalls).subscribe((r) => {
                this.installJobs = r.filter(i => i.isSuccessful).map(i => i.result);
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

                Observable.zip(...status).subscribe(r => {
                    const job: ExtensionInstallStatus[] = [];
                    r.forEach(jobStatus => {
                        // if failed then show error, remove from status tracking queue
                        if (jobStatus.installStatusResult.isSuccessful && jobStatus.installStatusResult.result.status === 'Failed') {
                            this.showInstallFailed(this.context, jobStatus.installStatusResult.result.id);
                        }
                        // error status also show up here, error is different from failed
                        else if (jobStatus.installStatusResult.isSuccessful &&
                            jobStatus.installStatusResult.result.status !== 'Succeeded' &&
                            jobStatus.installStatusResult.result.status !== 'Failed') {
                            job.push(jobStatus.installStatusResult.result);
                        } else if (!jobStatus.installStatusResult.isSuccessful) {
                            job.push(jobStatus.job);
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
