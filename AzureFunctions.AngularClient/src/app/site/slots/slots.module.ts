import { NgModule } from '@angular/core';
import { SlotsComponent } from 'app/site/slots/slots.component';
import { SlotsShellComponent } from 'app/ibiza-feature/slots-shell/slots-shell.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';
import { SidebarModule } from 'ng-sidebar';

@NgModule({
  entryComponents: [
    SlotsComponent
  ],
  imports: [
    TranslateModule.forChild(), SharedModule, SharedFunctionsModule, SidebarModule
  ],
  declarations: [
    SlotsComponent,
    SlotsShellComponent
  ],
  exports: [
    SlotsComponent
  ]
})
export class SlotsModule { }
