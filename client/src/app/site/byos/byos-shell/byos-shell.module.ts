import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedFunctionsModule } from '../../../shared/shared-functions.module';
import { ByosShellComponent } from './byos-shell.component';
import { ByosModule } from '../byos.module';

const routing: ModuleWithProviders = RouterModule.forChild([{ path: '', component: ByosShellComponent }]);

@NgModule({
  entryComponents: [],
  imports: [TranslateModule.forChild(), SharedModule, SharedFunctionsModule, ByosModule, routing],
  declarations: [ByosShellComponent],
  providers: [],
})
export class ByosShellModule {}
