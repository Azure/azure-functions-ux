import { AiService } from 'app/shared/services/ai.service';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { BroadcastService } from './../shared/services/broadcast.service';
import { FunctionAppContext } from 'app/shared/function-app-context';
import { errorIds } from './../shared/models/error-ids';
import { PortalResources } from './../shared/models/portal-resources';
import { FunctionAppContextComponent } from 'app/shared/components/function-app-context-component';
import { TranslateService } from '@ngx-translate/core';
import { RuntimeExtension } from 'app/shared/models/binding';
import { ExtensionInstallStatus } from 'app/shared/models/extension-install-status';
import { Observable } from 'rxjs/Observable';
import { PortalService } from 'app/shared/services/portal.service';
import { FunctionService } from 'app/shared/services/function.service';
import { Version } from 'app/shared/Utilities/version';

export abstract class BaseExtensionInstallComponent extends FunctionAppContextComponent {
  public neededExtensions: RuntimeExtension[];
  public runtimeExtensions: RuntimeExtension[];
  public allInstalled = false;
  public installing = false;
  public installJobs: ExtensionInstallStatus[] = [];
  public uninstallJobs: ExtensionInstallStatus[] = [];
  public installFailed = false;
  public correctAppState: boolean;
  public oldExtensionIds: string[] = [];

  constructor(
    componentName: string,
    public functionAppService: FunctionAppService,
    broadcastService: BroadcastService,
    private _aiService: AiService,
    public translateService: TranslateService,
    public portalService: PortalService,
    functionService: FunctionService,
    setBusy?: Function
  ) {
    super(componentName, functionAppService, broadcastService, functionService, setBusy);
  }

  installExtensions() {
    if (this.neededExtensions.length > 0) {
      this.installing = true;
      this.installFailed = false;

      // Put host into offline state
      this.functionAppService.updateHostState(this.context, 'offline').subscribe(r => {
        if (r.isSuccessful) {
          // Ensure host is offline
          this.correctAppState = false;
          this.pollHostStatus(0, 'Offline');
        } else {
          this.showComponentError({
            message: this.translateService.instant(PortalResources.functionDev_hostErrorMessage, { error: r.error }),
            errorId: errorIds.failedToUpdateHostToOffline,
            resourceId: this.context.site.id,
          });
        }
      });
    }
  }

  updateExtensions() {
    if (this.oldExtensionIds.length > 0) {
      this.removeOldExtensions();
    } else {
      this.installNeededExtensions();
    }
  }

  installNeededExtensions() {
    // Install Extensions
    const extensionCalls = this.neededExtensions.map(extension => {
      return this.functionAppService.installExtension(this.context, extension);
    });

    // Check install status
    Observable.zip(...extensionCalls).subscribe(r => {
      this.installJobs = r.filter(i => i.isSuccessful).map(i => i.result);
      this.pollInstallationStatus(0);
    });
  }

  removeOldExtensions() {
    // Uninstall Extensions
    const extensionCalls = this.oldExtensionIds.map(id => {
      return this.functionAppService.uninstallExtension(this.context, id);
    });

    // Check uninstall status
    return Observable.zip(...extensionCalls).subscribe(r => {
      this.uninstallJobs = r.filter(i => i.isSuccessful).map(i => i.result);
      this.pollUninstallationStatus(0);
    });
  }

  getNeededExtensions(runtimeExtensions: RuntimeExtension[]): Observable<RuntimeExtension[]> {
    const neededExtensions: RuntimeExtension[] = [];
    return this.functionAppService.getHostExtensions(this.context).map(r => {
      // no extensions installed, all template extensions are required
      if (!r.isSuccessful || !r.result.extensions) {
        return runtimeExtensions;
      }

      // Only require an extension installations if the extension is not already installed
      // OR the extension is installed but the major version is mismatched
      runtimeExtensions.forEach(runtimeExtension => {
        const extFound = r.result.extensions.find(installedExtention => {
          if (installedExtention.id === runtimeExtension.id) {
            return !this._shouldInstallNewExtensionVersion(installedExtention, runtimeExtension);
          }
          return false;
        });
        if (!extFound) {
          neededExtensions.push(runtimeExtension);

          // Check if an older version of the extension needs to be uninstalled
          // Only uninstall extensions with mismatching major versions
          const old = r.result.extensions.find(installedExtention => {
            if (installedExtention.id === runtimeExtension.id) {
              return this._shouldInstallNewExtensionVersion(installedExtention, runtimeExtension);
            }
            return false;
          });
          if (old) {
            this.oldExtensionIds.push(runtimeExtension.id);
          }
        }
      });

      return neededExtensions;
    });
  }

  setInstallationVariables(neededExtensions: RuntimeExtension[]) {
    this.neededExtensions = !!neededExtensions ? neededExtensions : [];
    this.allInstalled = this.neededExtensions.length === 0;

    if (this.allInstalled) {
      return Observable.of(null);
    }
    return this.functionAppService.getExtensionJobsStatus(this.context).map(r => {
      if (!r.isSuccessful || r.result.jobs.length === 0) {
        return;
      }

      this.installing = true;
      this.neededExtensions.forEach(neededExtension => {
        const ext = !!r.result.jobs.find(inProgressExtension => {
          return (
            neededExtension.id === inProgressExtension.properties.id && neededExtension.version === inProgressExtension.properties.version
          );
        });
        this.installing = this.installing && ext;
      });
    });
  }

  pollHostStatus(tryNumber: number, desiredState: 'Offline' | 'Running') {
    const timeOut = 1000; // milliseconds per request
    const maxTries = 60; // should wait 1 minute maximum
    setTimeout(() => {
      if (tryNumber > maxTries) {
        this.showTimeoutError(this.context);
        return;
      }

      if (!this.correctAppState) {
        this.functionAppService.getFunctionHostStatus(this.context).subscribe(r => {
          if (r.isSuccessful && r.result.state) {
            this.correctAppState = r.result.state === desiredState;
          }
          return this.pollHostStatus(tryNumber + 1, desiredState);
        });
      } else if (desiredState === 'Offline') {
        this.updateExtensions();
      } else if (desiredState === 'Running') {
        this.getNeededExtensions(this.runtimeExtensions).subscribe(extensions => {
          this.installing = false;
          this.setInstallationVariables(extensions);
        });
      }
    }, timeOut);
  }

  pollUninstallationStatus(tryNumber: number) {
    const timeOut = 1000; // milliseconds per request
    const maxTries = 180; // should wait 3 minutes maximum
    setTimeout(() => {
      if (tryNumber > maxTries) {
        this.showTimeoutError(this.context);
        return;
      }

      if (this.uninstallJobs.length > 0) {
        this.functionAppService.getExtensionJobsStatus(this.context).subscribe(r => {
          if (r.isSuccessful) {
            if (r.result.jobs.length !== 0) {
              return this.pollUninstallationStatus(tryNumber + 1);
            } else {
              this.installNeededExtensions();
            }
          } else {
            this.showComponentError({
              message: this.translateService.instant(PortalResources.extensionUninstallError),
              errorId: errorIds.failedToUninstallExtensions,
              resourceId: this.context.site.id,
            });
            this.bringHostOnline();
          }
        });
      } else {
        this.installNeededExtensions();
      }
    }, timeOut);
  }

  pollInstallationStatus(timeOut: number) {
    setTimeout(() => {
      if (timeOut > 600) {
        this.getNeededExtensions(this.runtimeExtensions).subscribe(extensions => {
          this.setInstallationVariables(extensions);
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
            return this.functionAppService.getExtensionInstallStatus(this.context, job.id).map(r => {
              return {
                installStatusResult: r,
                job: job,
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
              this.bringHostOnline();
            } else if (
              jobInstallationStatusResult.isSuccessful &&
              jobInstallationStatusResult.result.status !== 'Succeeded' &&
              jobInstallationStatusResult.result.status !== 'Failed'
            ) {
              job.push(jobInstallationStatusResult.result);
            } else if (!jobInstallationStatusResult.isSuccessful) {
              job.push(jobObject);
            }
          });
          this.installJobs = job;
          this.pollInstallationStatus(timeOut + 1);
        });
      } else {
        // Ensure host is running
        this.correctAppState = false;
        this.pollHostStatus(0, 'Running');
      }
    }, 1000);
  }

  bringHostOnline() {
    // Put host into running state
    this.functionAppService.updateHostState(this.context, 'running').subscribe(r => {
      if (r.isSuccessful) {
        // Ensure host is running
        this.correctAppState = false;
        this.pollHostStatus(0, 'Running');
      } else {
        this.showComponentError({
          message: this.translateService.instant(PortalResources.functionDev_hostErrorMessage, { error: r.error }),
          errorId: errorIds.failedToUpdateHostToRunning,
          resourceId: this.context.site.id,
        });
      }
    });
  }

  showTimeoutError(context: FunctionAppContext) {
    this.showComponentError({
      message: this.translateService.instant(PortalResources.timeoutInstallingFunctionRuntimeExtension),
      errorId: errorIds.timeoutInstallingFunctionRuntimeExtension,
      resourceId: context.site.id,
    });

    this._aiService.trackEvent(errorIds.timeoutInstallingFunctionRuntimeExtension, {
      content: this.translateService.instant(PortalResources.timeoutInstallingFunctionRuntimeExtension),
    });
  }

  private _shouldInstallNewExtensionVersion(installedExtension: RuntimeExtension, runtimeExtension: RuntimeExtension): boolean {
    const installedExtentionVersion = new Version(installedExtension.version);
    const runtimeExtensionVersion = new Version(runtimeExtension.version);
    return installedExtentionVersion.majorVersion !== runtimeExtensionVersion.majorVersion;
  }

  abstract showInstallFailed(context: FunctionAppContext, id: string);
}
