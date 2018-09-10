import { EmbeddedEditorShellComponent } from './embedded-editor-shell.component';
import { EmbeddedFunctionLogsTabComponent } from '../../function/embedded/embedded-function-logs-tab/embedded-function-logs-tab.component';
import { EmbeddedFunctionTestTabComponent } from '../../function/embedded/embedded-function-test-tab/embedded-function-test-tab.component';
import { EmbeddedFunctionEditorComponent } from '../../function/embedded/embedded-function-editor/embedded-function-editor.component';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';
import { FileUploadModule } from 'ng2-file-upload';
import { PopoverModule } from 'ng2-popover';
import { SidebarModule } from 'ng-sidebar';

const routing: ModuleWithProviders = RouterModule.forChild([{ path: '', component: EmbeddedEditorShellComponent }]);

@NgModule({
    entryComponents: [EmbeddedEditorShellComponent],
    imports: [TranslateModule.forChild(),
        SharedModule,
        SharedFunctionsModule,
        routing,
        FileUploadModule,
        PopoverModule,
        SidebarModule,
    ],
    declarations: [
        EmbeddedEditorShellComponent,
        EmbeddedFunctionEditorComponent,
        EmbeddedFunctionTestTabComponent,
        EmbeddedFunctionLogsTabComponent,
    ],
    providers: []
})
export class EmbeddedEditorShellModule { }
