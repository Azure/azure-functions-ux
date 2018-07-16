import { Component, ComponentFactoryResolver} from '@angular/core';
import { ConsoleService, ConsoleTypes } from './../shared/services/console.service';
import { AbstractConsoleComponent } from '../shared/components/abstract.console.component';

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
    const scmHostName = this.site ? (this.site.properties.hostNameSslStates.find (h => h.hostType === 1).name) : 'funcplaceholder01.scm.azurewebsites.net';
    return `https://${scmHostName}/command`;
  }

  /**
   * Handle the tab-pressed event
   */
  protected tabKeyEvent() {
      this.focusConsole();
      if (this.listOfDir.length === 0) {
        const uri = this.getKuduUri();
        const header = this.getHeader();
        const body = {'command': ('bash -c \' ' + this.getTabKeyCommand() + ' && echo \'\' && pwd\''), 'dir': this.dir}; // can use ls -a also
        const res = this.consoleService.send('POST', uri, JSON.stringify(body), header);
        res.subscribe(
            data => {
              const output = data.json();
              if (output.ExitCode === 0) {
                // fetch the list of files/folders in the current directory
                const cmd = this.command.substring(0, this.ptrPosition);
                const allFiles = output.Output.split('\n\n' + this.dir)[0].split('\n');
                this.listOfDir = this.consoleService.findMatchingStrings(allFiles, cmd.substring(cmd.lastIndexOf(' ') + 1));
                if (this.listOfDir.length > 0) {
                  this.dirIndex = 0;
                  this.command = this.command.substring(0, this.ptrPosition);
                  this.command = this.command.substring(0, this.command.lastIndexOf(' ') + 1) + this.listOfDir[0];
                  this.ptrPosition = this.command.length;
                  this.divideCommandForPtr();
                }
              }
            },
            err => {
                console.log('Tab Key Error' + err.text);
            }
        );
      return;
      }
      this.command = this.command.substring(0, this.ptrPosition);
      this.command = this.command.substring(0, this.command.lastIndexOf(' ') + 1) + this.listOfDir[ (++this.dirIndex) % this.listOfDir.length];
      this.ptrPosition = this.command.length;
      this.divideCommandForPtr();
  }

  /**
   * Connect to the kudu API and display the response;
   * both incase of an error or a valid response
   */
  protected connectToKudu() {
      const uri = this.getKuduUri();
      const header = this.getHeader();
      const cmd = this.command;
      const body = {'command': ('bash -c \' ' + cmd + ' && echo \'\' && pwd\''), 'dir': this.dir };
      const res = this.consoleService.send('POST', uri, JSON.stringify(body), header);
      this.lastAPICall = res.subscribe(
      data => {
          const output = data.json();
          if (output.Output === '' && output.ExitCode !== 0) {
            this.addErrorComponent(output.Error + '\r\n');
          } else if (output.ExitCode === 0 && output.Output !== '' && this.performAction(cmd, output.Output)) {
              this.addMessageComponent(output.Output.split('\n\n' + this.dir)[0] + '\r\n\n');
          }
          this.addPromptComponent();
          return output;
      },
      err => {
          this.addErrorComponent(err.text);
      }
      );
  }

  /**
   * perform action on key pressed.
   */
  protected performAction(cmd?: string, output?: string): boolean {
      if (this.command.toLowerCase() === 'clear') { // bash uses clear to empty the console
        this.removeMsgComponents();
        return false;
      }
      if (this.command.toLowerCase() === 'exit') {
        this.removeMsgComponents();
        this.dir = this._defaultDirectory;
        return false;
      }
      if (cmd && cmd.toLowerCase().startsWith('cd')) {
        output = output.replace(/(\n)+/g, '');
        this.dir = output;
        return false;
      }
      return true;
  }

  /**
   * Get the left-hand-side text for the console
   */
  protected getConsoleLeft() {
    return this.appName + ':~$ ';
  }
}
