import { Component } from '@angular/core';
import { QuickstartStateManager } from 'app/site/quickstart/wizard-logic/quickstart-state-manager';
import { PortalTemplateCard } from 'app/site/quickstart/Models/portal-function-card';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from 'app/shared/models/portal-resources';

@Component({
    selector: 'step-create-function',
    templateUrl: './step-create-function.component.html',
    styleUrls: ['./step-create-function.component.scss', '../quickstart.component.scss']
})
export class StepCreateFunctionComponent {

    public readonly portalTemplateCards: PortalTemplateCard[] = [
        {
            id: 'HttpTrigger',
            name: 'Webhook + API',
            icon: 'image/deployment-center/vsts.svg',
            color: '#2B79DA',
            description: this._translateService.instant(PortalResources.vstsDesc)
        },
        {
            id: 'TimerTrigger',
            name: 'Timer',
            icon: 'image/deployment-center/vsts.svg',
            color: '#2B79DA',
            description: this._translateService.instant(PortalResources.vstsDesc)
        }
    ];

    public selectedPortalTemplateCard: PortalTemplateCard = null;

    constructor(
        public _wizardService: QuickstartStateManager,
        private _translateService: TranslateService,
        // private _functionAppService: FunctionAppService
    ) {
    }

    get createPortalFunction(): boolean {
        const devEnvironment =
        this._wizardService &&
        this._wizardService.wizardForm &&
        this._wizardService.wizardForm.controls &&
        this._wizardService.wizardForm.controls['devEnvironment'] &&
        this._wizardService.wizardForm.controls['devEnvironment'].value;
        return devEnvironment === 'portal';
    }

    public selectPortalTemplate(card: PortalTemplateCard) {
        this.selectedPortalTemplateCard = card;
        const currentFormValues = this._wizardService.wizardValues;
        currentFormValues.portalTemplate = card.id;
        this._wizardService.wizardValues = currentFormValues;
    }

    create() {
        console.log("I created a portal function");
    }


}
