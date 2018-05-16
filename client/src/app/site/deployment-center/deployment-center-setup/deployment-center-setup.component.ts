import { Component, Input, SimpleChanges } from '@angular/core';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { FormBuilder } from '@angular/forms';
import { sourceControlProvider } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-setup-models';
import { OnChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { TranslateService } from '@ngx-translate/core';
import { MovingDirection } from '../../../controls/form-wizard/util/moving-direction.enum';

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
            sourceProvider: [null, []],
            buildProvider: ['kudu', []],
            sourceSettings: this._fb.group({
                repoUrl: [null, []],
                branch: [null, []],
                isManualIntegration: [false, []],
                deploymentRollbackEnabled: [false, []],
                isMercurial: [false, []]
            }),
            buildSettings: this._fb.group({
                createNewVsoAccount: [false, []],
                vstsAccount: [null, []],
                vstsProject: [null, []],
                location: [null, []],
                applicationFramework: [null, []],
                workingDirectory: [null, []],
                pythonSettings: this._fb.group({
                    framework: [null, []],
                    version: [null, []],
                    flaskProjectName: ['flaskProjectName', []],
                    djangoSettingsModule: ['DjangoProjectName.settings', []]
                }),
                nodejsTaskRunner: [null, []]
            }),
            deploymentSlotSetting: this._fb.group({
                newDeploymentSlot: [false, []],
                deploymentSlotEnabled: [false, []],
                deploymentSlot: [null, []]
            }),
            testEnvironment: this._fb.group({
                enabled: [false, []],
                newApp: [true, []],
                appServicePlanId: [null, []],
                webAppId: [null, []]
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
            sourceControlProvider !== 'webdeploy' &&
            sourceControlProvider !== 'zip'
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
            this._wizardService.resourceIdStream$.next(this.resourceId);
        }
    }

    // This is ran when the user attempts to exit the configuration step of the wizard
    buildConfigValid(direction: MovingDirection) {
        if (direction === MovingDirection.Forwards) {
            this._wizardService.markSectionAsTouched(this._wizardService.buildSettings);
            this._wizardService.markSectionAsTouched(this._wizardService.sourceSettings);
            return this._wizardService.buildSettings.valid && this._wizardService.sourceSettings.valid;
        }
        return true;
    }
}
