import { Component, Input, SimpleChanges } from '@angular/core';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { FormBuilder, Validators } from '@angular/forms';
import { sourceControlProvider } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-setup-models';
import { OnChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-deployment-center-setup',
    templateUrl: './deployment-center-setup.component.html',
    styleUrls: ['./deployment-center-setup.component.scss'],
    providers: [DeploymentCenterStateManager]
})
export class DeploymentCenterSetupComponent implements OnChanges {
    @Input() resourceId: string;

    constructor(private _wizardService: DeploymentCenterStateManager, private _fb: FormBuilder, translateService: TranslateService) {
        this._wizardService.wizardForm = this._fb.group({
            sourceProvider: ['', []],
            buildProvider: ['kudu', []],
            sourceSettings: this._fb.group({
                repoUrl: ['', [Validators.required]],
                branch: ['', []],
                isManualIntegration: [false, []],
                deploymentRollbackEnabled: [false, []],
                isMercurial: [false, []]
            }),
            buildSettings: this._fb.group({
                createNewVsoAccount: ['existing', []],
                vstsAccount: ['', []],
                vstsProject: ['', []],
                location: ['', []],
                applicationFramework: ['', []],
                testEnvironment: this._fb.group({
                    enabled: ['', []],
                    AppServicePlanId: ['', []],
                    AppName: ['', []]
                }),
                deploymentSlot: ['', []]
            })
        });
    }

    get showTestStep() {
        const buildProvider: sourceControlProvider =
            this._wizardService &&
            this._wizardService.wizardForm &&
            this._wizardService.wizardForm.controls['buildProvider'] &&
            this._wizardService.wizardForm.controls['buildProvider'].value;
        return buildProvider === 'vsts';
    }

    get showDeployStep() {
        const buildProvider: sourceControlProvider =
            this._wizardService &&
            this._wizardService.wizardForm &&
            this._wizardService.wizardForm.controls['buildProvider'] &&
            this._wizardService.wizardForm.controls['buildProvider'].value;
        return buildProvider === 'vsts';
    }

    get showBuildStep() {
        const sourceControlProvider =
            this._wizardService &&
            this._wizardService.wizardForm &&
            this._wizardService.wizardForm.controls['sourceProvider'] &&
            this._wizardService.wizardForm.controls['sourceProvider'].value;
        return (
            sourceControlProvider !== 'onedrive' &&
            sourceControlProvider !== 'dropbox' &&
            sourceControlProvider !== 'bitbucket' &&
            sourceControlProvider !== 'ftp' &&
            sourceControlProvider !== 'webdeploy'
        );
    }

    get showConfigureStep() {
        const sourceControlProvider: sourceControlProvider =
            this._wizardService &&
            this._wizardService.wizardForm &&
            this._wizardService.wizardForm.controls['sourceProvider'] &&
            this._wizardService.wizardForm.controls['sourceProvider'].value;

        const buildProvider: sourceControlProvider =
            this._wizardService &&
            this._wizardService.wizardForm &&
            this._wizardService.wizardForm.controls['buildProvider'] &&
            this._wizardService.wizardForm.controls['buildProvider'].value;
        const localGitKudu = sourceControlProvider === 'localgit' && buildProvider === 'kudu';
        return sourceControlProvider !== 'ftp' && sourceControlProvider !== 'webdeploy' && !localGitKudu;
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['resourceId']) {
            this._wizardService.resourceIdStream.next(this.resourceId);
        }
    }
}
