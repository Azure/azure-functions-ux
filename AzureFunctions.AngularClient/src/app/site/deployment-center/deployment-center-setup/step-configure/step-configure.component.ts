import { Component } from '@angular/core';
import { DeploymentCenterWizardService } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-wizard-service';
import { PortalService } from 'app/shared/services/portal.service';
import { CacheService } from 'app/shared/services/cache.service';
import { ArmService } from 'app/shared/services/arm.service';
import { AiService } from 'app/shared/services/ai.service';

@Component({
    selector: 'app-step-configure',
    templateUrl: './step-configure.component.html',
    styleUrls: ['./step-configure.component.scss']
})
export class StepConfigureComponent {
    constructor(
        private _wizard: DeploymentCenterWizardService,
        _portalService: PortalService,
        _cacheService: CacheService,
        _armService: ArmService,
        _aiService: AiService
    ) {}

    get sourceProvider() {
        return (
            this._wizard.wizardForm &&
            this._wizard.wizardForm.controls.sourceProvider &&
            this._wizard.wizardForm.controls.sourceProvider.value
        );
    }

    get buildProvider() {
        return (
            this._wizard.wizardForm &&
            this._wizard.wizardForm.controls.buildProvider &&
            this._wizard.wizardForm.controls.buildProvider.value
        );
    }
}
