import { Component } from '@angular/core';
import { DeploymentCenterWizardService } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-wizard-service';
import { PortalService } from 'app/shared/services/portal.service';
import { CacheService } from 'app/shared/services/cache.service';
import { ArmService } from 'app/shared/services/arm.service';
import { AiService } from 'app/shared/services/ai.service';
import { sourceControlProvider } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-setup-models';

@Component({
    selector: 'app-step-configure',
    templateUrl: './step-configure.component.html',
    styleUrls: ['./step-configure.component.scss']
})
export class StepConfigureComponent {
    private _resourceId: string;
    provider: sourceControlProvider;
    buildProvider: sourceControlProvider;
    constructor(
        private _wizard: DeploymentCenterWizardService,
        _portalService: PortalService,
        _cacheService: CacheService,
        _armService: ArmService,
        _aiService: AiService
    ) {
        this._wizard.sourceControlProvider$.subscribe(provider => {
            this.provider = provider;
        });
        this._wizard.buildProvider$.subscribe(provider => {
          this.buildProvider = provider;
        });
        this._wizard.resourceIdStream.subscribe(r => {
            this._resourceId = r;
        });
    }
}
