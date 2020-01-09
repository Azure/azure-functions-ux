import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { FunctionMonitorComponent } from 'app/function-monitor/function-monitor.component';
import { FunctionMonitorModule } from 'app/function-monitor/function-monitor.module';
import { FunctionMonitorShellComponent } from './function-monitor-shell.component';
import 'rxjs/add/operator/takeUntil';

const routing: ModuleWithProviders = RouterModule.forChild([{ path: '', component: FunctionMonitorShellComponent }]);

@NgModule({
  entryComponents: [FunctionMonitorComponent],
  imports: [TranslateModule.forChild(), SharedModule, SharedFunctionsModule, FunctionMonitorModule, routing],
  declarations: [FunctionMonitorShellComponent],
  providers: [],
})
export class FunctionMonitorShellModule {}
