import { CmdConsoleComponent } from './cmd/cmd.component';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PromptComponent } from './templates/prompt.component';
import { ErrorComponent } from './templates/error.component';
import { MessageComponent } from './templates/message.component';
import { CommonModule } from '@angular/common';

@NgModule({
    entryComponents: [
      CmdConsoleComponent,
      PromptComponent,
      ErrorComponent,
      MessageComponent
    ],
    imports: [
      TranslateModule.forChild(), CommonModule
    ],
    declarations: [
      CmdConsoleComponent,
      PromptComponent,
      ErrorComponent,
      MessageComponent
    ],
    exports: []
  })
export class ConsoleModule { }
