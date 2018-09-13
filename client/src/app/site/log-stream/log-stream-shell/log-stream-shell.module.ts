import { LogStreamModule } from '../log-stream.module';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { LogStreamShellComponent } from './log-stream-shell.component';

const routing: ModuleWithProviders = RouterModule.forChild([{ path: '', component: LogStreamShellComponent }]);

@NgModule({
    entryComponents: [],
    imports: [TranslateModule.forChild(), SharedModule, LogStreamModule, routing],
    declarations: [
        LogStreamShellComponent,
    ],
    providers: [
    ],
})
export class LogStreamShellModule { }
