import { SharedModule } from './../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { DeploymentCenterComponent } from 'app/site/deployment-center/deployment-center.component';
import { KuduDashboardComponent } from 'app/site/deployment-center/ProviderDashboards/kudu-dashboard/kudu-dashboard.component';
import { VsoDashboardComponent } from 'app/site/deployment-center/ProviderDashboards/Vso-Dashboard/vso-dashboard.component';
import { DeploymentCenterSetupComponent } from 'app/site/deployment-center/deployment-center-setup/deployment-center-setup.component';
import { StepSourceControlComponent } from 'app/site/deployment-center/deployment-center-setup/step-source-control/step-source-control.component';
import { StepDeploymentSlotComponent } from 'app/site/deployment-center/deployment-center-setup/step-deployment-slot/step-deployment-slot.component';
import { StepBuildProviderComponent } from 'app/site/deployment-center/deployment-center-setup/step-build-provider/step-build-provider.component';
import { StepCompleteComponent } from 'app/site/deployment-center/deployment-center-setup/step-complete/step-complete.component';
import { StepConfigureComponent } from 'app/site/deployment-center/deployment-center-setup/step-configure/step-configure.component';
import { SidebarModule } from 'ng-sidebar';
import { DeploymentDetailComponent } from 'app/site/deployment-center/ProviderDashboards/kudu-dashboard/deployment-detail/deployment-detail.component';
import { StepTestComponent } from 'app/site/deployment-center/deployment-center-setup/step-test/step-test.component';
import { WizardModule } from 'app/controls/form-wizard/wizard.module';
import { ConfigureDropboxComponent } from './deployment-center-setup/step-configure/configure-dropbox/configure-dropbox.component';
import { ConfigureOnedriveComponent } from './deployment-center-setup/step-configure/configure-onedrive/configure-onedrive.component';
import { ConfigureGithubComponent } from './deployment-center-setup/step-configure/configure-github/configure-github.component';
import { ConfigureVstsSourceComponent } from './deployment-center-setup/step-configure/configure-vsts-source/configure-vsts-source.component';
import { ConfigureVstsBuildComponent } from './deployment-center-setup/step-configure/configure-vsts-build/configure-vsts-build.component';
import { ConfigureExternalComponent } from './deployment-center-setup/step-configure/configure-external/configure-external.component';
import { ConfigureBitbucketComponent } from './deployment-center-setup/step-configure/configure-bitbucket/configure-bitbucket.component';

@NgModule({
    entryComponents: [DeploymentCenterComponent],
    declarations: [
        DeploymentCenterComponent,
        KuduDashboardComponent,
        VsoDashboardComponent,
        DeploymentCenterSetupComponent,
        StepSourceControlComponent,
        StepDeploymentSlotComponent,
        StepConfigureComponent,
        StepCompleteComponent,
        StepBuildProviderComponent,
        DeploymentDetailComponent,
        StepTestComponent,
        ConfigureDropboxComponent,
        ConfigureOnedriveComponent,
        ConfigureGithubComponent,
        ConfigureVstsSourceComponent,
        ConfigureVstsBuildComponent,
        ConfigureExternalComponent,
        ConfigureBitbucketComponent
    ],
    imports: [TranslateModule.forChild(), SharedModule, SidebarModule, WizardModule],
    exports: [
        DeploymentCenterComponent
    ]
})
export class DeploymentCenterModule {
    static forRoot(): ModuleWithProviders {
        return { ngModule: DeploymentCenterModule, providers: [] };
    }
}
