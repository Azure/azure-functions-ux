import { AbstractConsoleComponent } from './abstract.console.component';
import { ComponentFactoryResolver } from '@angular/core';
import { ConsoleService } from '../services/console.service';
import { ConsoleConstants, HttpMethods, Constants } from '../../../../shared/models/constants';

export abstract class AbstractWindowsComponent extends AbstractConsoleComponent {
    private _defaultDirectory = 'D:\\home\\site\\wwwroot';

    constructor(
        componentFactoryResolver: ComponentFactoryResolver,
        public consoleService: ConsoleService
        ) {
          super(componentFactoryResolver, consoleService);
          this.dir = this._defaultDirectory;
        }

    protected initializeConsole() {
        this.siteSubscription = this.consoleService.getSite().subscribe(site => {
            this.site = site;
            this.removeMsgComponents();
            this.updateDefaultDirectory();
        });
        this.publishingCredSubscription = this.consoleService.getPublishingCredentials().subscribe(publishingCredentials => {
            this.publishingCredentials = publishingCredentials;
            this.updateDefaultDirectory();
        });
    }

    protected updateDefaultDirectory() {
        if (this.site && this.publishingCredentials) {
            const uri = this.getKuduUri();
            const header = this.getHeader();
            const body = {
                'command': 'cd',
                'dir': 'site\\wwwroot'
            };
            const res = this.consoleService.send(HttpMethods.POST, uri, JSON.stringify(body), header);
            res.subscribe(data => {
                const output = data.json();
                this._defaultDirectory = output.Output.trim();
                this.dir = this._defaultDirectory;
                if (this.currentPrompt) {
                    this.currentPrompt.instance.dir = this.getConsoleLeft();
                }
            });
        }
    }

    /**
     * Get Kudu API URL
     */
    protected getKuduUri(): string {
        const scmHostName = this.site.properties.hostNameSslStates.find(h => h.hostType === Constants.scmHostType).name;
        return `https://${scmHostName}/api/command`;
    }

    /**
     * Handle the tab-pressed event
     */
    protected tabKeyEvent() {
        this.unFocusConsoleManually();
        if (this.listOfDir.length === 0) {
            this.dirIndex = -1;
            const uri = this.getKuduUri();
            const header = this.getHeader();
            const body = {
                'command': `${this.getCommandPrefix()}${this.getTabKeyCommand()}`,
                'dir': this.dir + ConsoleConstants.singleBackslash
            };
            const res = this.consoleService.send(HttpMethods.POST, uri, JSON.stringify(body), header);
            res.subscribe(
                data => {
                    const output = data.json();
                    if (output.ExitCode === ConsoleConstants.successExitcode) {
                        // fetch the list of files/folders in the current directory
                        const cmd = this.command.substring(0, this.ptrPosition);
                        const allFiles = output.Output.split(ConsoleConstants.windowsNewLine);
                        this.tabKeyPointer = cmd.lastIndexOf(ConsoleConstants.whitespace);
                        this.listOfDir = this.consoleService.findMatchingStrings(allFiles, cmd.substring(this.tabKeyPointer + 1));
                        if (this.listOfDir.length > 0) {
                            this.command = cmd;
                            this.replaceWithFileName();
                        }
                    }
                },
                err => {
                    console.log('Tab Key Error' + err.text);
                }
            );
        } else {
            this.replaceWithFileName();
        }
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
            'command': `${this.getCommandPrefix()}${cmd} & echo. & cd`,
            'dir': (this.dir + ConsoleConstants.singleBackslash)
        };
        const res = this.consoleService.send(HttpMethods.POST, uri, JSON.stringify(body), header);
        this.lastAPICall = res.subscribe(
            data => {
                const output = data.json();
                if (output.Error !== '') {
                    this.addErrorComponent(output.Error + ConsoleConstants.newLine);
                } else {
                    if (output.ExitCode === ConsoleConstants.successExitcode && this.performAction(cmd, output.Output)) {
                        if (output.Output !== '') {
                            this.addMessageComponent(output.Output.split(ConsoleConstants.windowsNewLine + this.dir)[0] + ConsoleConstants.newLine);
                        }
                    }
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
        if (this.command.toLowerCase() === ConsoleConstants.windowsClear || this.command.toLowerCase() === ConsoleConstants.linuxClear) {
            this.removeMsgComponents();
            return false;
        }
        if (this.command.toLowerCase() === ConsoleConstants.exit) {
            this.removeMsgComponents();
            this.dir = this._defaultDirectory;
            return false;
        }
        if (cmd && cmd.toLowerCase().startsWith(ConsoleConstants.changeDirectory)) {
            return this._changeCurrentDirectory(cmd.substr(2).trim(), output);
        }
        return true;
    }

    protected abstract getCommandPrefix(): string;

    /**
     * Change current directory; run cd command
     */
    private _changeCurrentDirectory(cmd: string, output: string) {
        output = output.trim();
        if (cmd.length === 0) {
            return true;
        }
        this.dir = output.trim();
        return false;
    }

}
