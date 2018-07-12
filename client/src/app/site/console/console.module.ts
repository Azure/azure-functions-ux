import { CmdConsoleComponent } from './cmd/cmd.component';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PromptComponent } from './templates/prompt.component';
import { ErrorComponent } from './templates/error.component';
import { MessageComponent } from './templates/message.component';
import { CommonModule } from '@angular/common';
import { ClickOutsideDirective } from './directives/click.directive';
import { SharedModule } from '../../shared/shared.module';
import { WindowsConsoleComponent } from './windows.component';
import { ConsoleService } from './services/console.service';
import { LinuxConsoleComponent } from './linux.component';
import { PowershellConsoleComponent } from './powershell/powershell.component';

@NgModule({
    entryComponents: [
      WindowsConsoleComponent,
      LinuxConsoleComponent,
      CmdConsoleComponent,
      PowershellConsoleComponent,
      PromptComponent,
      ErrorComponent,
      MessageComponent
    ],
    imports: [
      TranslateModule.forChild(), CommonModule, SharedModule
    ],
    declarations: [
      WindowsConsoleComponent,
      LinuxConsoleComponent,
      CmdConsoleComponent,
      PowershellConsoleComponent,
      PromptComponent,
      ClickOutsideDirective,
      ErrorComponent,
      MessageComponent
    ],
    providers: [
      ConsoleService
    ],
    exports: [
      CmdConsoleComponent
    ]
  })
export class ConsoleModule { }
