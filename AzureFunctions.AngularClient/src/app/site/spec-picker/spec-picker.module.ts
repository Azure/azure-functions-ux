import { SpecPickerComponent } from './spec-picker.component';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { SpecListComponent } from './spec-list/spec-list.component';
import { SpecFeatureListComponent } from './spec-feature-list/spec-feature-list.component';
import { SpecPickerFeatureWrapperComponent } from './spec-picker-feature-wrapper/spec-picker-feature-wrapper.component';

const routing: ModuleWithProviders = RouterModule.forChild([{ path: '', component: SpecPickerFeatureWrapperComponent }]);

@NgModule({
    imports: [TranslateModule.forChild(), SharedModule, routing],
    declarations: [
        SpecPickerComponent,
        SpecListComponent,
        SpecFeatureListComponent,
        SpecPickerFeatureWrapperComponent
    ],
    providers: []
})
export class SpecPickerModule { }
