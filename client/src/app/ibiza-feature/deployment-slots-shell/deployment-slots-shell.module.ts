import { NgModule, ModuleWithProviders } from '@angular/core';
import { DeploymentSlotsShellComponent } from './deployment-slots-shell.component';
import { RouterModule } from '@angular/router';
import { DeploymentSlotsComponent } from 'app/site/slots/deployment-slots/deployment-slots.component';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { DeploymentSlotsModule } from 'app/site/slots/deployment-slots/deployment-slots.module';
import 'rxjs/add/operator/takeUntil';

const routing: ModuleWithProviders = RouterModule.forChild([{ path: '', component: DeploymentSlotsShellComponent }]);

@NgModule({
  entryComponents: [DeploymentSlotsComponent],
  imports: [TranslateModule.forChild(), SharedModule, SharedFunctionsModule, DeploymentSlotsModule, routing],
  declarations: [],
  providers: [],
})
export class DeploymentSlotsShellModule {}
