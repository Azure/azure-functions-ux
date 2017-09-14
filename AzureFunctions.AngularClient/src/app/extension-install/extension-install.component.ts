import { AiService } from '../shared/services/ai.service';
import { Component, Input, Output } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { RuntimeExtension } from '../shared/models/binding';
import { FunctionApp } from '../shared/function-app';
import { TreeViewInfo } from '../tree-view/models/tree-view-info';
import { FunctionsNode } from '../tree-view/functions-node';
import { FunctionInfo } from '../shared/models/function-info';
import { Observable } from 'rxjs/Observable';
import { ExtensionInstallStatus } from '../shared/models/constants';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
    selector: 'extension-install',
    templateUrl: './extension-install.component.html',
    styleUrls: ['./extension-install.component.scss'],
    inputs: ['viewInfoInput']
})
export class ExtensionInstallComponent {
    @Input() functionInfo: FunctionInfo;
    @Input() functionApp: FunctionApp;
    @Input() requiredExtensions: RuntimeExtension[];
    @Input() integrateText;
    @Input() loading = false;
    @Input() installing = false;
    @Output() installed: BehaviorSubject<boolean> = new BehaviorSubject(false);
    packages: RuntimeExtension[];
    installationSucceeded = false;
    private functionsNode: FunctionsNode;
    private _viewInfoStream = new Subject<TreeViewInfo<any>>();
    public functionsInfo: FunctionInfo[];
    public installJobs: any[] = [];

    constructor(private _aiService: AiService) {
        this._viewInfoStream
            .switchMap(viewInfo => {
                this.functionsNode = <FunctionsNode>viewInfo.node;
                this.functionApp = this.functionsNode.functionApp;
                return Observable.of('');
            })
            .do(null, e => {
                this._aiService.trackException(e, '/errors/extension-install');
                console.error(e);
            })
            .retry()
            .subscribe();
    }

    installRequiredExtensions() {
        this.installing = true;
        if (this.requiredExtensions.length > 0) {
            const extensionCalls: Observable<any>[] = [];
            this.requiredExtensions.forEach(extension => {
                extensionCalls.push(this.functionApp.installExtension(extension));
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
                this.GetRequiredExtensions(this.requiredExtensions).subscribe((r) => {
                    this.requiredExtensions = r;
                    this.functionApp.showTimeoutError();
                    this.installing = false;
                });
                return;
            }

            if (this.installJobs.length > 0) {
                this.installing = true;
                const status: Observable<any>[] = [];
                this.installJobs.forEach(job => {
                    // if resulted in error not added to status
                    if (job && job.id) {
                        status.push(this.functionApp.getExtensionInstallStatus(job.id));
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
                            this.functionApp.showInstallFailed();
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
                this.GetRequiredExtensions(this.requiredExtensions).subscribe((r) => {
                    this.installing = false;
                    this.requiredExtensions = r;
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
        return this.functionApp.getHostExtensions().map(r => {
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

            this.installed.next(extensions.length === 0);
            return extensions;
        });
    }

    set viewInfoInput(viewInfoInput: TreeViewInfo<any>) {
        this._viewInfoStream.next(viewInfoInput);
    }
}
