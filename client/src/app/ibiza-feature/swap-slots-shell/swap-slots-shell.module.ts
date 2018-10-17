import { NgModule, ModuleWithProviders } from '@angular/core';
import { SwapSlotsShellComponent } from './swap-slots-shell.component';
import { RouterModule } from '@angular/router';
import { SwapSlotsComponent } from 'app/site/slots/swap-slots/swap-slots.component';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { SwapSlotsModule } from 'app/site/slots/swap-slots/swap-slots.module';
import 'rxjs/add/operator/takeUntil';

const routing: ModuleWithProviders = RouterModule.forChild([{ path: '', component: SwapSlotsShellComponent }]);

@NgModule({
  entryComponents: [SwapSlotsComponent],
  imports: [TranslateModule.forChild(), SharedModule, SharedFunctionsModule, SwapSlotsModule, routing],
  declarations: [],
  providers: [],
})
export class SwapSlotsShellModule {}
