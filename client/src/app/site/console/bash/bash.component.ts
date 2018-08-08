import { Component, ComponentFactoryResolver} from '@angular/core';
import { ConsoleService, ConsoleTypes } from './../shared/services/console.service';
import { AbstractConsoleComponent } from '../shared/components/abstract.console.component';
import { Regex, ConsoleConstants, HttpMethods } from '../../../shared/models/constants';

@Component({
  selector: 'app-bash',
  templateUrl: './bash.component.html',
  styleUrls: ['./../console.component.scss'],
  providers: []
})
export class BashComponent  extends AbstractConsoleComponent {

  private _defaultDirectory = '/home';
  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    public consoleService: ConsoleService
    ) {
      super(componentFactoryResolver, consoleService);
      this.dir = this._defaultDirectory;
      this.consoleType = ConsoleTypes.BASH;
    }

  protected updateDefaultDirectory() {
  }

  /**
   * Get the tab-key command for bash console
   */
  protected getTabKeyCommand(): string {
    return 'ls -a';
  }

  /**
   * Get Kudu API URL
   */
  protected getKuduUri(): string {
    const scmHostName = this.site.properties.hostNameSslStates.find (h => h.hostType === 1).name;
    return `https://${scmHostName}/command`;
  }

  /**
   * Handle the tab-pressed event
   */
  protected tabKeyEvent() {
      this.unFocusConsoleManually();
      if (this.listOfDir.length === 0) {
        const uri = this.getKuduUri();
        const header = this.getHeader();
        const body = {
          'command': (`bash -c \' ${this.getTabKeyCommand()} && echo \'\' && pwd\'`),
          'dir': this.dir
        };
        const res = this.consoleService.send(HttpMethods.POST, uri, JSON.stringify(body), header);
        res.subscribe(
            data => {
              const output = data.json();
              if (output.ExitCode === ConsoleConstants.successExitcode) {
                // fetch the list of files/folders in the current directory
                const cmd = this.command.substring(0, this.ptrPosition);
                const allFiles = output.Output.split(ConsoleConstants.newLine.repeat(2) + this.dir)[0].split(ConsoleConstants.newLine);
                this.listOfDir = this.consoleService.findMatchingStrings(allFiles, cmd.substring(cmd.lastIndexOf(ConsoleConstants.whitespace) + 1));
                if (this.listOfDir.length > 0) {
                    this.dirIndex = 0;
                    this.command = this.command.substring(0, this.ptrPosition);
                    this.command = this.command.substring(0, this.command.lastIndexOf(ConsoleConstants.whitespace) + 1) + this.listOfDir[0];
                    this.ptrPosition = this.command.length;
                    this.divideCommandForPtr();
                }
              }
              this.focusConsole();
            },
            err => {
                console.log('Tab Key Error' + err.text);
            }
        );
      return;
      }
      this.command = this.command.substring(0, this.ptrPosition);
      this.command = this.command.substring(0, this.command.lastIndexOf(ConsoleConstants.whitespace) + 1) + this.listOfDir[(this.dirIndex++) % this.listOfDir.length];
      this.ptrPosition = this.command.length;
      this.divideCommandForPtr();
      this.focusConsole();
  }

  /**
   * Connect to the kudu API and display the response;
   * both incase of an error or a valid response
   */
  protected connectToKudu() {
      const uri = this.getKuduUri();
      const header = this.getHeader();
      const cmd = this.command;
      const body = {
        'command': (`bash -c \' ${cmd} && echo \'\' && pwd\'`),
        'dir': this.dir
      };
      const res = this.consoleService.send(HttpMethods.POST, uri, JSON.stringify(body), header);
      this.lastAPICall = res.subscribe(
        data => {
            const output = data.json();
            if (output.Output === '' && output.ExitCode !== ConsoleConstants.successExitcode) {
              this.addErrorComponent(output.Error + ConsoleConstants.newLine);
            } else if (output.ExitCode === ConsoleConstants.successExitcode && output.Output !== '' && this.performAction(cmd, output.Output)) {
                this.addMessageComponent(output.Output.split(ConsoleConstants.newLine.repeat(2) + this.dir)[0] + ConsoleConstants.newLine.repeat(2));
            }
            this.addPromptComponent();
            this.enterPressed = false;
            return output;
        },
        err => {
            this.addErrorComponent(err.text);
            this.enterPressed = false;
        }
      );
  }

  /**
   * perform action on key pressed.
   */
  protected performAction(cmd?: string, output?: string): boolean {
      if (this.command.toLowerCase() === ConsoleConstants.linuxClear) { // bash uses clear to empty the console
        this.removeMsgComponents();
        return false;
      }
      if (this.command.toLowerCase() === ConsoleConstants.exit) {
        this.removeMsgComponents();
        this.dir = this._defaultDirectory;
        return false;
      }
      if (cmd && cmd.toLowerCase().startsWith(ConsoleConstants.changeDirectory)) {
        output = output.replace(Regex.newLine, '');
        this.dir = output;
        return false;
      }
      return true;
  }

  /**
   * Get the left-hand-side text for the console
   */
  protected getConsoleLeft() {
    return `${this.appName}:~$ `;
  }
}
