import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { StorageService } from 'app/shared/services/storage.service';
import { FunctionMonitorComponent } from './function-monitor.component';
import { FunctionMonitorInfo } from 'app/shared/models/function-monitor';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';

@NgModule({
  imports: [TranslateModule.forChild(), SharedModule, SharedFunctionsModule, NgSelectModule],
  declarations: [FunctionMonitorComponent],
  providers: [StorageService],
  exports: [FunctionMonitorComponent],
})
export class FunctionMonitorModule {
  public functionMonitorInfo: FunctionMonitorInfo;
}
