import { SpecPickerComponent } from './spec-picker.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { SpecListComponent } from './spec-list/spec-list.component';
import { SpecFeatureListComponent } from './spec-feature-list/spec-feature-list.component';

@NgModule({
    imports: [TranslateModule.forChild(), SharedModule],
    entryComponents: [
        SpecPickerComponent
    ],
    declarations: [
        SpecPickerComponent,
        SpecListComponent,
        SpecFeatureListComponent,
    ],
    providers: [],
    exports: [
        SpecPickerComponent
    ]
})
export class SpecPickerModule { }
