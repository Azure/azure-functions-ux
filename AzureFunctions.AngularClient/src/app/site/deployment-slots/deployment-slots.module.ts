import { NgModule } from '@angular/core';
import { DeploymentSlotsComponent } from 'app/site/deployment-slots/deployment-slots.component';
import { SwapSlotsComponent } from 'app/site/deployment-slots/swap-slots/swap-slots.component';
import { AddSlotComponent } from 'app/site/deployment-slots/add-slot/add-slot.component';
import { DeploymentSlotsShellComponent } from 'app/ibiza-feature/deployment-slots-shell/deployment-slots-shell.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';
import { SidebarModule } from 'ng-sidebar';

@NgModule({
  entryComponents: [
    DeploymentSlotsComponent
  ],
  imports: [
    TranslateModule.forChild(), SharedModule, SharedFunctionsModule, SidebarModule
  ],
  declarations: [
    DeploymentSlotsComponent,
    SwapSlotsComponent,
    AddSlotComponent,
    DeploymentSlotsShellComponent
  ],
  exports: [
    DeploymentSlotsComponent
  ]
})
export class DeploymentSlotsModule { }
