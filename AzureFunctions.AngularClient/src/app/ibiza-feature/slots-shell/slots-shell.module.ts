import { NgModule, ModuleWithProviders } from '@angular/core';
import { SlotsShellComponent } from './slots-shell.component';
import { RouterModule } from '@angular/router';
import { SlotsComponent } from 'app/site/slots/slots.component';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { SlotsModule } from 'app/site/slots/slots.module';


const routing: ModuleWithProviders = RouterModule.forChild([{ path: '', component: SlotsShellComponent }]);

@NgModule({
    entryComponents: [SlotsComponent],
    imports: [TranslateModule.forChild(), SharedModule, SharedFunctionsModule, SlotsModule, routing],
    declarations: [
    ],
    providers: []
})
export class SlotsShellModule {}
