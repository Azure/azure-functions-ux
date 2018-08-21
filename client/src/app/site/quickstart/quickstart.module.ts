import { QuickstartComponent } from './quickstart.component';
import { StepChooseDevEnvironmentComponent } from './step-choose-dev-environment/step-choose-dev-environment.component';
import { StepCreateFunctionComponent } from './step-create-function/step-create-function.component';
import { StepChooseDeploymentMethodComponent } from './step-choose-deployment-method/step-choose-deployment-method.component';
import { StepDeployFunctionComponent } from './step-deploy-function/step-deploy-function.component';
import { SharedModule } from './../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { WizardModule } from 'app/controls/form-wizard/wizard.module';

@NgModule({
    entryComponents: [QuickstartComponent],
    declarations: [
        StepChooseDevEnvironmentComponent,
        StepCreateFunctionComponent,
        StepChooseDeploymentMethodComponent,
        StepDeployFunctionComponent,
        QuickstartComponent
    ],
    imports: [TranslateModule.forChild(), SharedModule, WizardModule],
    exports: [QuickstartComponent]
})
export class QuickstartModule {
    static forRoot(): ModuleWithProviders {
        return { ngModule: QuickstartModule, providers: [] };
    }
}
