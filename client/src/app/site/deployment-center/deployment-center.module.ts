import { SharedModule } from './../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { DeploymentCenterComponent } from 'app/site/deployment-center/deployment-center.component';
import { KuduDashboardComponent } from 'app/site/deployment-center/provider-dashboards/kudu-dashboard/kudu-dashboard.component';
import { VsoDashboardComponent } from 'app/site/deployment-center/provider-dashboards/vso-Dashboard/vso-dashboard.component';
import { DeploymentCenterSetupComponent } from 'app/site/deployment-center/deployment-center-setup/deployment-center-setup.component';
import { StepSourceControlComponent } from 'app/site/deployment-center/deployment-center-setup/step-source-control/step-source-control.component';
import { StepBuildProviderComponent } from 'app/site/deployment-center/deployment-center-setup/step-build-provider/step-build-provider.component';
import { StepCompleteComponent } from 'app/site/deployment-center/deployment-center-setup/step-complete/step-complete.component';
import { StepConfigureComponent } from 'app/site/deployment-center/deployment-center-setup/step-configure/step-configure.component';
import { DeploymentDetailComponent } from 'app/site/deployment-center/provider-dashboards/kudu-dashboard/deployment-detail/deployment-detail.component';
import { WizardModule } from 'app/controls/form-wizard/wizard.module';
import { ConfigureDropboxComponent } from './deployment-center-setup/step-configure/configure-dropbox/configure-dropbox.component';
import { ConfigureOnedriveComponent } from './deployment-center-setup/step-configure/configure-onedrive/configure-onedrive.component';
import { ConfigureVstsSourceComponent } from './deployment-center-setup/step-configure/configure-vsts-source/configure-vsts-source.component';
import { ConfigureExternalComponent } from './deployment-center-setup/step-configure/configure-external/configure-external.component';
import { ConfigureBitbucketComponent } from './deployment-center-setup/step-configure/configure-bitbucket/configure-bitbucket.component';
import { ConfigureLocalGitComponent } from './deployment-center-setup/step-configure/configure-local-git/configure-local-git.component';
import { SidebarModule } from 'ng-sidebar';
import { NgSelectModule } from '@ng-select/ng-select';
import { FtpDashboardComponent } from './provider-dashboards/ftp-dashboard/ftp-dashboard.component';
import { DeploymentCredentialsComponent } from './provider-dashboards/deployment-credentials/deployment-credentials.component';
import { NgxDatatableModule } from 'ngx-datatable-accessable';
import { ConfigureVstsBuildModule } from './deployment-center-setup/step-configure/configure-vsts-build/configure-vsts-build.module';
import { ConfigureGithubModule } from './deployment-center-setup/step-configure/configure-github/configure-github.module';
import { CredentialsDashboardComponent } from './provider-dashboards/credentials-dashboard/credentials-dashboard.component';
import { GithubActionDashboardComponent } from './provider-dashboards/github-action-dashboard/github-action-dashboard.component';
import { GitHubDeploymentDetailComponent } from './provider-dashboards/github-action-dashboard/github-deployment-detail/github-deployment-detail.component';

@NgModule({
  entryComponents: [DeploymentCenterComponent],
  declarations: [
    DeploymentCenterComponent,
    KuduDashboardComponent,
    VsoDashboardComponent,
    DeploymentCenterSetupComponent,
    StepSourceControlComponent,
    StepConfigureComponent,
    StepCompleteComponent,
    StepBuildProviderComponent,
    DeploymentDetailComponent,
    ConfigureDropboxComponent,
    ConfigureOnedriveComponent,
    ConfigureVstsSourceComponent,
    ConfigureExternalComponent,
    ConfigureBitbucketComponent,
    ConfigureLocalGitComponent,
    FtpDashboardComponent,
    DeploymentCredentialsComponent,
    CredentialsDashboardComponent,
    GithubActionDashboardComponent,
    GitHubDeploymentDetailComponent,
  ],
  imports: [
    TranslateModule.forChild(),
    SharedModule,
    WizardModule,
    SidebarModule,
    NgSelectModule,
    NgxDatatableModule,
    ConfigureVstsBuildModule,
    ConfigureGithubModule,
  ],
  exports: [DeploymentCenterComponent],
})
export class DeploymentCenterModule {
  static forRoot(): ModuleWithProviders {
    return { ngModule: DeploymentCenterModule, providers: [] };
  }
}
