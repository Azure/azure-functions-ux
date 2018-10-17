import { NgModule, ModuleWithProviders } from '@angular/core';
import { DeploymentShellComponent } from './deployment-shell.component';
import { RouterModule } from '@angular/router';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { SiteConfigModule } from 'app/site/site-config/site-config.module';
import { DeploymentCenterModule } from 'app/site/deployment-center/deployment-center.module';
import { DeploymentCenterComponent } from 'app/site/deployment-center/deployment-center.component';

const routing: ModuleWithProviders = RouterModule.forChild([{ path: '', component: DeploymentShellComponent }]);

@NgModule({
  entryComponents: [DeploymentShellComponent, DeploymentCenterComponent],
  imports: [TranslateModule.forChild(), SharedModule, SharedFunctionsModule, SiteConfigModule, routing, DeploymentCenterModule],
  declarations: [DeploymentShellComponent],
  providers: [],
})
export class DeploymentShellModule {}
