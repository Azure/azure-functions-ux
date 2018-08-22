import { SiteService } from './../../shared/services/site.service';
import { SiteTabIds, Constants } from 'app/shared/models/constants';
import { FunctionAppContextComponent } from 'app/shared/components/function-app-context-component';
import { Component } from '@angular/core';
import { QuickstartStateManager } from 'app/site/quickstart/wizard-logic/quickstart-state-manager';
import { FormBuilder } from '@angular/forms';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BusyStateScopeManager } from '../../busy-state/busy-state-scope-manager';
import { FunctionAppService } from '../../shared/services/function-app.service';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../shared/models/portal-resources';
import { ArmUtil } from 'app/shared/Utilities/arm-utils';
import { FunctionInfo } from 'app/shared/models/function-info';

@Component({
    selector: 'quickstart',
    templateUrl: './quickstart.component.html',
    styleUrls: ['./quickstart.component.scss'],
    providers: [QuickstartStateManager]
})
export class QuickstartComponent extends FunctionAppContextComponent {

    public quickstartTitle: string;
    public workerRuntime: string;
    public functionsInfo: FunctionInfo[];
    private _busyManager: BusyStateScopeManager;

    constructor(
        private _wizardService: QuickstartStateManager,
        private _fb: FormBuilder,
        private _functionAppService: FunctionAppService,
        private _siteService: SiteService,
        private _translateService: TranslateService,
        broadcastService: BroadcastService) {

        super('quickstart', _functionAppService, broadcastService, () => this._busyManager.setBusy());

        this._wizardService.wizardForm = this._fb.group({
            devEnvironment: [null],
            workerRuntime: [null],
            portalTemplate: [null],
            isLinux: [null],
            isLinuxConsumption: [null],
            context: [null],
            functionsInfo: [null]
        });

        this._busyManager = new BusyStateScopeManager(broadcastService, SiteTabIds.quickstart);
    }

    setup(): Subscription {
        return this.viewInfoEvents
            .takeUntil(this.ngUnsubscribe)
            .switchMap(viewInfo => {
                this._busyManager.setBusy();
                return Observable.zip(
                    this._functionAppService.getRuntimeGeneration(this.context),
                    this._siteService.getAppSettings(viewInfo.context.site.id),
                    this._functionAppService.getFunctions(this.context));
            })
            .do(null, e => {
                // what is the way we should do this?
            })
            .subscribe(r => {
                if (r[1].isSuccessful) {
                    const appSettingsArm = r[1].result;
                    if (appSettingsArm.properties.hasOwnProperty(Constants.functionsWorkerRuntimeAppSettingsName)) {
                        this.workerRuntime = appSettingsArm.properties[Constants.functionsWorkerRuntimeAppSettingsName].toLowerCase();
                        this.setQuickstartTitle();
                    } else {
                        console.log('no worker runtime');
                    }
                } else {
                    this.showComponentError({
                        errorId: 'errorId',
                        message: 'errorMessage',
                        resourceId: this.context.site.id
                    });
                }

                this.functionsInfo = r[2].isSuccessful ? r[2].result : null;
                this.setInitalWizardProperties();
                this._busyManager.clearBusy();
            });
    }

    setQuickstartTitle() {
        switch (this.workerRuntime) {
            case 'dotnet':
                this.quickstartTitle = this._translateService.instant(PortalResources.quickstartDotnetTitle);
                break;
            case 'node':
            case 'nodejs':
                this.quickstartTitle = this._translateService.instant(PortalResources.quickstartNodeTitle);
                break;
            case 'python':
                this.quickstartTitle = this._translateService.instant(PortalResources.quickstartPythonTitle);
                break;
            case 'java':
                this.quickstartTitle = this._translateService.instant(PortalResources.quickstartPythonTitle);
                break;
        }
    }

    setInitalWizardProperties() {
        const currentFormValues = this._wizardService.wizardValues;
        currentFormValues.workerRuntime = this.workerRuntime;
        currentFormValues.isLinux = ArmUtil.isLinuxApp(this.context.site);
        currentFormValues.isLinuxConsumption = ArmUtil.isLinuxDynamic(this.context.site);
        currentFormValues.context = this.context;
        currentFormValues.functionsInfo = this.functionsInfo;
        this._wizardService.wizardValues = currentFormValues;
    }

    get showDeploymentStep(): boolean {
        if (this._wizardService && this._wizardService.wizardForm && this._wizardService.wizardForm.controls) {
            const devEnvironment = this._wizardService.wizardForm.controls['devEnvironment'] &&
                this._wizardService.wizardForm.controls['devEnvironment'].value;

            const isLinux = this._wizardService.wizardForm.controls['isLinux'] &&
                this._wizardService.wizardForm.controls['isLinux'].value;

            const isLinuxConsumption = this._wizardService.wizardForm.controls['isLinuxConsumption'] &&
                this._wizardService.wizardForm.controls['isLinuxConsumption'].value;

            return devEnvironment === 'vs' ||
                devEnvironment === 'maven' ||
                devEnvironment === 'vscode' && (!isLinux || isLinux && !isLinuxConsumption) ||
                devEnvironment === 'coretools' && (!isLinux || isLinux && !isLinuxConsumption);
            }
        return false;
    }
}
