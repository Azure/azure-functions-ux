import { NgModule } from '@angular/core';
import { SlotsComponent } from 'app/site/slots/slots.component';
import { SlotsShellComponent } from 'app/ibiza-feature/slots-shell/slots-shell.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';

@NgModule({
  entryComponents: [
    SlotsComponent
  ],
  imports: [
    TranslateModule.forChild(), SharedModule, SharedFunctionsModule
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
