import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ByosComponent } from './byos.component';
import { ByosManager } from './byos-manager';
import { ByosSelectorComponent } from './byos-selector/byos-selector.component';
import { ByosSelectorBasicComponent } from './byos-selector/byos-selector-basic.component';
import { ByosSelectorAdvancedComponent } from './byos-selector/byos-selector-advanced.component';

@NgModule({
  imports: [TranslateModule.forChild(), SharedModule, NgSelectModule],
  entryComponents: [],
  declarations: [ByosComponent, ByosSelectorComponent, ByosSelectorBasicComponent, ByosSelectorAdvancedComponent],
  providers: [ByosManager],
  exports: [ByosComponent],
})
export class ByosModule {}
