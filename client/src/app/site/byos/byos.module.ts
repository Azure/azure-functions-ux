import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ByosComponent } from './byos.component';

@NgModule({
  imports: [TranslateModule.forChild(), SharedModule, NgSelectModule],
  entryComponents: [],
  declarations: [ByosComponent],
  providers: [],
  exports: [ByosComponent],
})
export class ByosModule {}
