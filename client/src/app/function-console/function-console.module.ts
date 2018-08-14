import { NgModule } from '@angular/core';
import { FunctionConsoleComponent } from './function-console.component';
import { PromptComponent } from './extra-components/prompt.component';
import { MessageComponent } from './extra-components/message.component';
import { ErrorComponent } from './extra-components/error.component';
import { SharedModule } from '../shared/shared.module';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ConsoleService } from '../site/console/shared/services/console.service';

@NgModule({
    entryComponents: [
      FunctionConsoleComponent,
      PromptComponent,
      MessageComponent,
      ErrorComponent
    ],
    imports: [
      TranslateModule.forChild(), CommonModule, SharedModule
    ],
    declarations: [
        FunctionConsoleComponent,
        PromptComponent,
        MessageComponent,
        ErrorComponent
    ],
    providers: [
      ConsoleService
    ],
    exports: [
      FunctionConsoleComponent
    ]
  })
export class FunctionConsoleModule { }
