import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PromptComponent } from './shared/components/prompt.component';
import { ErrorComponent } from './shared/components/error.component';
import { MessageComponent } from './shared/components/message.component';
import { CommonModule } from '@angular/common';
import { ClickOutsideDirective } from './shared/directives/click.directive';
import { SharedModule } from '../../shared/shared.module';
import { ConsoleService } from './shared/services/console.service';
import { CmdComponent } from './cmd/cmd.component';
import { PowershellComponent } from './powershell/powershell.component';
import { BashComponent } from './bash/bash.component';
import { SSHComponent } from './ssh/ssh.component';
import { ConsoleComponent } from './console.component';
import { SanitizeURL } from './shared/directives/sanitizeURL.pipe';
import { SharedFunctionsModule } from '../../shared/shared-functions.module';

@NgModule({
    entryComponents: [
      ConsoleComponent,
      CmdComponent,
      PowershellComponent,
      BashComponent,
      SSHComponent,
      PromptComponent,
      ErrorComponent,
      MessageComponent,
    ],
    imports: [
      TranslateModule.forChild(),
      CommonModule,
      SharedModule,
      SharedFunctionsModule,
    ],
    declarations: [
      SanitizeURL,
      ConsoleComponent,
      CmdComponent,
      PowershellComponent,
      BashComponent,
      SSHComponent,
      PromptComponent,
      ClickOutsideDirective,
      ErrorComponent,
      MessageComponent,
    ],
    providers: [
      ConsoleService,
    ],
    exports: [
      CmdComponent,
      PowershellComponent,
      BashComponent,
      SSHComponent,
    ],
  })
export class ConsoleModule { }
