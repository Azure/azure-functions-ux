import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/zip';
import { FunctionMonitorComponent } from './function-monitor.component';
import { SidebarModule } from 'ng-sidebar';

@NgModule({
  entryComponents: [FunctionMonitorComponent],
  imports: [TranslateModule.forChild(), SharedModule, SharedFunctionsModule, SidebarModule],
  declarations: [],
  exports: [],
})
export class FunctionMonitorModule {}
