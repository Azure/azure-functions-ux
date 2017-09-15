import { Component, Input, Output } from '@angular/core';
import { RuntimeExtension } from '../shared/models/binding';
import { FunctionApp } from '../shared/function-app';
import { Observable } from 'rxjs/Observable';
import { ExtensionInstallStatus } from '../shared/models/constants';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
    selector: 'extension-install',
    templateUrl: './extension-install.component.html',
    styleUrls: ['./extension-install.component.scss']
})

export class ExtensionInstallComponent {
    @Input() integrateText;
    @Input() loading = false;
    @Input() installing = false;
    @Output() installed: BehaviorSubject<boolean> = new BehaviorSubject(false);
    packages: RuntimeExtension[];
    installationSucceeded = false;
    private _functionApp: FunctionApp;
    extensions: RuntimeExtension[];
    public installJobs: any[] = [];
    @Input() set functionApp(functionApp: FunctionApp) {
        if (functionApp) {
            this._functionApp = functionApp;
        }
    }

    @Input() set requiredExtensions(runtimeExtensions: RuntimeExtension[]) {
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
                extensionCalls.push(this._functionApp.installExtension(extension));
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
            if (timeOut > 60) {
                this.GetRequiredExtensions(this.extensions).subscribe((r) => {
                    this.extensions = r;
                    this._functionApp.showTimeoutError();
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
                        status.push(this._functionApp.getExtensionInstallStatus(job.id));
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
                            this._functionApp.showInstallFailed();
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
        return this._functionApp.getHostExtensions().map(r => {
            // no extensions installed, all template extensions are required
            if (!r.extensions) {
                return templateExtensions;
            }

            templateExtensions.forEach(requiredExtension => {
                let isInstalled = false;
                r.extensions.forEach(installedExtension => {
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
        });
    }
}
