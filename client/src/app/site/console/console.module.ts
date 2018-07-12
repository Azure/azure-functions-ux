import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PromptComponent } from './templates/prompt.component';
import { ErrorComponent } from './templates/error.component';
import { MessageComponent } from './templates/message.component';
import { CommonModule } from '@angular/common';
import { ClickOutsideDirective } from './directives/click.directive';
import { SharedModule } from '../../shared/shared.module';
import { ConsoleService } from './services/console.service';
import { WindowsConsoleComponent } from './windows.console.component';
import { LinuxConsoleComponent } from './linux.console.component';
import { CmdComponent } from './cmd/cmd.component';
import { PowershellComponent } from './powershell/powershell.component';
import { BashComponent } from './bash/bash.component';
import { SSHComponent } from './ssh/ssh.component';

@NgModule({
    entryComponents: [
      WindowsConsoleComponent,
      LinuxConsoleComponent,
      CmdComponent,
      PowershellComponent,
      BashComponent,
      SSHComponent,
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
      CmdComponent,
      PowershellComponent,
      BashComponent,
      SSHComponent,
      PromptComponent,
      ClickOutsideDirective,
      ErrorComponent,
      MessageComponent
    ],
    providers: [
      ConsoleService
    ],
    exports: [
      CmdComponent,
      PowershellComponent,
      BashComponent,
      SSHComponent
    ]
  })
export class ConsoleModule { }
