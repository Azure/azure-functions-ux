import { NgModule } from '@angular/core';
import { DeploymentSlotsComponent } from 'app/site/slots/deployment-slots/deployment-slots.component';
import { DeploymentSlotsShellComponent } from 'app/ibiza-feature/deployment-slots-shell/deployment-slots-shell.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/observable/zip';

@NgModule({
  entryComponents: [DeploymentSlotsComponent],
  imports: [TranslateModule.forChild(), SharedModule, SharedFunctionsModule],
  declarations: [DeploymentSlotsComponent, DeploymentSlotsShellComponent],
  exports: [DeploymentSlotsComponent],
})
export class DeploymentSlotsModule {}
