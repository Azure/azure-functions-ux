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

    constructor(public wizard: DeploymentCenterStateManager, private _fb: FormBuilder, translateService: TranslateService) {
        this.wizard.wizardForm = this._fb.group({
            sourceProvider: [null, []],
            buildProvider: ['kudu', []],
            sourceSettings: this._fb.group({
                repoUrl: [null, []],
                branch: [null, []],
                isManualIntegration: [false, []],
                deploymentRollbackEnabled: [false, []],
                isMercurial: [false, []],
                privateRepo: [false, []],
                username: ['', []],
                password: ['', []]
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
            this.wizard &&
            this.wizard.wizardForm &&
            this.wizard.wizardForm.controls['buildProvider'] &&
            this.wizard.wizardForm.controls['buildProvider'].value;
        return buildProvider === 'vsts';
    }

    get showDeployStep() {
        const buildProvider: sourceControlProvider =
            this.wizard &&
            this.wizard.wizardForm &&
            this.wizard.wizardForm.controls['buildProvider'] &&
            this.wizard.wizardForm.controls['buildProvider'].value;
        return buildProvider === 'vsts' && this.wizard.deploymentSlotsAvailable;
    }

    get showBuildStep() {
        const sourceControlProvider =
            this.wizard &&
            this.wizard.wizardForm &&
            this.wizard.wizardForm.controls['sourceProvider'] &&
            this.wizard.wizardForm.controls['sourceProvider'].value;
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
            this.wizard &&
            this.wizard.wizardForm &&
            this.wizard.wizardForm.controls['sourceProvider'] &&
            this.wizard.wizardForm.controls['sourceProvider'].value;

        const buildProvider: sourceControlProvider =
            this.wizard &&
            this.wizard.wizardForm &&
            this.wizard.wizardForm.controls['buildProvider'] &&
            this.wizard.wizardForm.controls['buildProvider'].value;
        const localGitKudu = sourceControlProvider === 'localgit' && buildProvider === 'kudu';
        return sourceControlProvider !== 'ftp' && sourceControlProvider !== 'webdeploy' && !localGitKudu;
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['resourceId']) {
            this.wizard.resourceIdStream$.next(this.resourceId);
        }
    }

    // This is ran when the user attempts to exit the configuration step of the wizard
    buildConfigValid(direction: MovingDirection) {
        if (direction === MovingDirection.Forwards) {
            this.wizard.markSectionAsTouched(this.wizard.buildSettings);
            this.wizard.markSectionAsTouched(this.wizard.sourceSettings);
            return this.wizard.buildSettings.valid && this.wizard.sourceSettings.valid;
        }
        return true;
    }

    get showSummaryStep() {
        const sourceProvider = this.wizard && this.wizard.wizardValues && this.wizard.wizardValues.sourceProvider;
        return sourceProvider && sourceProvider !== 'ftp' && sourceProvider !== 'webdeploy';
    }
}
