import { NgModule } from '@angular/core';
import { AddSlotComponent } from 'app/site/slots/add-slot/add-slot.component';
import { AddSlotShellComponent } from 'app/ibiza-feature/add-slot-shell/add-slot-shell.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/zip';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  entryComponents: [AddSlotComponent],
  imports: [TranslateModule.forChild(), SharedModule, SharedFunctionsModule, NgSelectModule],
  declarations: [AddSlotComponent, AddSlotShellComponent],
  exports: [AddSlotComponent],
})
export class AddSlotModule {}
