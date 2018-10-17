import { NgModule } from '@angular/core';
import { SwapSlotsComponent } from 'app/site/slots/swap-slots/swap-slots.component';
import { SwapDiffTableComponent } from 'app/site/slots/swap-slots/swap-diff-table/swap-diff-table.component';
import { SwapSlotsShellComponent } from 'app/ibiza-feature/swap-slots-shell/swap-slots-shell.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';
import { WizardModule } from 'app/controls/form-wizard/wizard.module';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/zip';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  entryComponents: [SwapSlotsComponent],
  imports: [TranslateModule.forChild(), SharedModule, SharedFunctionsModule, WizardModule, NgSelectModule],
  declarations: [SwapSlotsComponent, SwapDiffTableComponent, SwapSlotsShellComponent],
  exports: [SwapSlotsComponent],
})
export class SwapSlotsModule {}
