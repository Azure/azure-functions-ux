import { SlotNewComponent } from './../slot-new/slot-new.component';
import { SlotsListComponent } from './../slots-list/slots-list.component';
import { SharedModule } from './../shared/shared.module';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule, ModuleWithProviders } from '@angular/core';

const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: SlotsListComponent,
    pathMatch: 'full',
  },
  {
    path: 'new/slot',
    component: SlotNewComponent,
  },
]);

@NgModule({
  imports: [TranslateModule.forChild(), SharedModule, routing],
  declarations: [SlotsListComponent, SlotNewComponent],
  providers: [],
})
export class SlotsListModule {}
