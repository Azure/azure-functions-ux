import { AbstractConsoleComponent } from './abstract.console.component';
import { ComponentFactoryResolver } from '@angular/core';
import { ConsoleService } from '../services/console.service';

export abstract class AbstractWindowsComponent extends AbstractConsoleComponent {
    private _defaultDirectory = 'D:\\home\\site\\wwwroot';
    constructor(
        componentFactoryResolver: ComponentFactoryResolver,
        public consoleService: ConsoleService
        ) {
          super(componentFactoryResolver, consoleService);
          this.dir = this._defaultDirectory;
        }

    /**
     * Get Kudu API URL
     */
    protected getKuduUri(): string {
        const scmHostName = this.site ? (this.site.properties.hostNameSslStates.find (h => h.hostType === 1).name) : 'funcplaceholder01.scm.azurewebsites.net';
        return `https://${scmHostName}/api/command`;
    }

    /**
     * Handle the tab-pressed event
     */
    protected tabKeyEvent() {
        this.focusConsole();
        if (this.listOfDir.length === 0) {
            const uri = this.getKuduUri();
            const header = this.getHeader();
            const body = {'command': (this.getCommandPrefix() + this.getTabKeyCommand()), 'dir': this.dir + '\\'}; // can use ls -a also
            const res = this.consoleService.send('POST', uri, JSON.stringify(body), header);
            res.subscribe(
                data => {
                    const output = data.json();
                    if (output.ExitCode === 0) {
                        // fetch the list of files/folders in the current directory
                        const cmd = this.command.substring(0, this.ptrPosition);
                        const allFiles = output.Output.split('\r\n');
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
        const body = {'command': this.getCommandPrefix() + cmd, 'dir': (this.dir + '\\') };
        const res = this.consoleService.send('POST', uri, JSON.stringify(body), header);
        this.lastAPICall = res.subscribe(
        data => {
            const output = data.json();
            if (output.Output === '' && output.ExitCode !== 0) {
                this.addErrorComponent(output.Error + '\r\n');
            } else {
                this.addMessageComponent(output.Output + '\r\n');
                if (output.ExitCode === 0 && output.Output === '') {
                    this.performAction(cmd);
                }
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
    protected performAction(cmd?: string): boolean {
        if (this.command.toLowerCase() === 'cls') {
            this.removeMsgComponents();
            return false;
        }
        if (this.command.toLowerCase() === 'exit') {
            this.removeMsgComponents();
            this.dir = this._defaultDirectory;
            return false;
        }
        if (cmd && cmd.toLowerCase().startsWith('cd')) {
            cmd = cmd.substring(2).trim().replace(/\//g, '\\').replace(/\\\\/g, '\\');
            this._changeCurrentDirectory(cmd);
            return false;
        }
        return true;
    }

    protected abstract getCommandPrefix(): string;

    /**
     * Change current directory; run cd command
     */
    private _changeCurrentDirectory(cmd: string) {
        const currentDirs = this.dir.split('\\');
        if (cmd === '\\') {
            this.dir = currentDirs[0];
        } else {
            const dirsInPath = cmd.split('\\');
            for (let i = 0; i < dirsInPath.length; ++i) {
                if (dirsInPath[i] === '.') {
                    // remain in current directory
                } else if (dirsInPath[i] === '' || dirsInPath[i] === '..') {
                    if (currentDirs.length === 1) {
                        break;
                    }
                    currentDirs.pop();
                } else {
                    currentDirs.push(dirsInPath[i]);
                }
            }
            this.dir = currentDirs.join('\\');
        }
    }

}
