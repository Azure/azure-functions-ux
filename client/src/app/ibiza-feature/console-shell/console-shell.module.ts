import { NgModule, ModuleWithProviders } from '@angular/core';
import { ConsoleShellComponent } from './console-shell.component';
import { RouterModule } from '@angular/router';
import { ConsoleComponent } from 'app/site/console/console.component';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ConsoleModule } from 'app/site/console/console.module';

const routing: ModuleWithProviders = RouterModule.forChild([{ path: '', component: ConsoleShellComponent }]);

@NgModule({
  entryComponents: [ConsoleComponent],
  imports: [TranslateModule.forChild(), SharedModule, SharedFunctionsModule, ConsoleModule, routing],
  declarations: [],
  providers: [],
})
export class ConsoleShellModule {}
