import { NgModule, ModuleWithProviders } from '@angular/core';
import { AddSlotShellComponent } from './add-slot-shell.component';
import { RouterModule } from '@angular/router';
import { AddSlotComponent } from 'app/site/slots/add-slot/add-slot.component';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { AddSlotModule } from 'app/site/slots/add-slot/add-slot.module';
import 'rxjs/add/operator/takeUntil';

const routing: ModuleWithProviders = RouterModule.forChild([{ path: '', component: AddSlotShellComponent }]);

@NgModule({
  entryComponents: [AddSlotComponent],
  imports: [TranslateModule.forChild(), SharedModule, SharedFunctionsModule, AddSlotModule, routing],
  declarations: [],
  providers: [],
})
export class AddSlotShellModule {}
