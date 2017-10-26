import { Component, OnInit } from '@angular/core';
import { DeploymentCenterWizardService } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-wizard-service';
import { SourceSettings } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-setup-models';
import { CacheService } from 'app/shared/services/cache.service';
import { ArmService } from 'app/shared/services/arm.service';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'app-step-complete',
    templateUrl: './step-complete.component.html',
    styleUrls: ['./step-complete.component.scss']
})
export class StepCompleteComponent implements OnInit {
    resourceId: string;
    constructor(public wizard: DeploymentCenterWizardService, cacheService: CacheService, private _armService: ArmService) {
        this.wizard.resourceIdStream.subscribe(r => {
            this.resourceId = r;
        });
    }

    get repo() {
        const buildSettings = this.wizard.wizardForm['sourceSettings'].value as SourceSettings;
        if (buildSettings) {
            return buildSettings.repoUrl;
        }
        return 'no onedrive';
    }

    Save() {

        Observable.zip(
            this._armService.put(`${this.resourceId}/sourcecontrols/web`, {
                properties: this.wizard.wizardForm.controls.sourceSettings.value
            }),
            (t) => ({
                sc: t.json()
            })
        ).subscribe(r => {});
    }
    ngOnInit() {}
}
