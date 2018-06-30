import { SpecPickerModule } from './../spec-picker.module';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { SpecPickerShellComponent } from './spec-picker-shell.component';

const routing: ModuleWithProviders = RouterModule.forChild([{ path: '', component: SpecPickerShellComponent }]);

@NgModule({
    entryComponents: [],
    imports: [TranslateModule.forChild(), SharedModule, SpecPickerModule, routing],
    declarations: [
        SpecPickerShellComponent
    ],
    providers: []
})
export class SpecPickerShellModule { }
