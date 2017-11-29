import { Component, Input, SimpleChanges } from '@angular/core';
import { DeploymentCenterWizardService } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-wizard-service';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
    selector: 'app-deployment-center-setup',
    templateUrl: './deployment-center-setup.component.html',
    styleUrls: ['./deployment-center-setup.component.scss'],
    providers: [DeploymentCenterWizardService]
})
export class DeploymentCenterSetupComponent  {
    @Input() resourceId: string;

    constructor(private _wizardService: DeploymentCenterWizardService, private _fb: FormBuilder) {
        this._wizardService.wizardForm = this._fb.group({
            sourceProvider: ['', []],
            buildProvider: ['', []],
            sourceSettings: this._fb.group({
                repoUrl: ['', [Validators.required]],
                branch: ['', []],
                isManualIntegration: [false, []],
                deploymentRollbackEnabled: [false, []],
                isMercurial: [false, []]
            }),
            vstsBuildSettings: this._fb.group({
                createNewVsoAccount: ['', []],
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
        const buildProvider =
            this._wizardService &&
            this._wizardService.wizardForm &&
            this._wizardService.wizardForm.controls['buildProvider'] &&
            this._wizardService.wizardForm.controls['buildProvider'].value;
        return buildProvider === 'vsts';
    }

    get showDeployStep() {
        const buildProvider =
            this._wizardService &&
            this._wizardService.wizardForm &&
            this._wizardService.wizardForm.controls['buildProvider'] &&
            this._wizardService.wizardForm.controls['buildProvider'].value;
        return buildProvider === 'vsts';
    }

    get showBuildStep() {
        return false;
        // const sourceControlProvider =
        //     this._wizardService &&
        //     this._wizardService.wizardForm &&
        //     this._wizardService.wizardForm.controls['sourceProvider'] &&
        //     this._wizardService.wizardForm.controls['sourceProvider'].value;
        // return (
        //     sourceControlProvider !== 'onedrive' &&
        //     sourceControlProvider !== 'dropbox' &&
        //     sourceControlProvider !== 'bitbucket' &&
        //     sourceControlProvider !== 'ftp' &&
        //     sourceControlProvider !== 'webdeploy'
        // );
    }

    get showConfigureStep() {
        const sourceControlProvider =
            this._wizardService &&
            this._wizardService.wizardForm &&
            this._wizardService.wizardForm.controls['sourceProvider'] &&
            this._wizardService.wizardForm.controls['sourceProvider'].value;

        const buildProvider =
            this._wizardService &&
            this._wizardService.wizardForm &&
            this._wizardService.wizardForm.controls['buildProvider'] &&
            this._wizardService.wizardForm.controls['buildProvider'].value;
        const localGitKudu = sourceControlProvider === 'localgit' && buildProvider === 'kudu'
        return sourceControlProvider !== 'ftp' && sourceControlProvider !== 'webdeploy' && !localGitKudu;
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['resourceId']) {
            this._wizardService.resourceIdStream.next(this.resourceId);
        }
    }

}
