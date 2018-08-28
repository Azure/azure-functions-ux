import { AbstractConsoleComponent } from './abstract.console.component';
import { ComponentFactoryResolver } from '@angular/core';
import { ConsoleService } from '../services/console.service';
import { ConsoleConstants, HttpMethods } from '../../../../shared/models/constants';

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
        const scmHostName = this.site.properties.hostNameSslStates.find (h => h.hostType === 1).name;
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
            'dir': this.dir
        };
        const res = this.consoleService.send(HttpMethods.POST, uri, JSON.stringify(body), header);
        this.lastAPICall = res.subscribe(
            data => {
                const output = data.json().Output;
                const exitCode = data.json().ExitCode;
                const error = data.json().Error.trim();
                if (error !== '') {
                    this.addErrorComponent(`${error}${ConsoleConstants.windowsNewLine.repeat(2)}`);
                } else if (exitCode === ConsoleConstants.successExitcode && output !== '') {
                    this._updateDirectoryAfterCommand(output.trim());
                    const msg = output.split(this.getMessageDelimeter())[0].trim();
                    this.addMessageComponent(`${msg}${ConsoleConstants.windowsNewLine.repeat(2)}`);
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

    protected getMessageDelimeter(): string {
        return ConsoleConstants.windowsNewLine + this.dir;
    }

    /**
     * Check and update the directory
     * @param cmd string which represents the response from the API
     */
    private _updateDirectoryAfterCommand(cmd: string) {
        const result = cmd.split(ConsoleConstants.windowsNewLine);
        this.dir = result[result.length - 1];
    }

    /**
     * perform action on key pressed.
     */
    protected performAction(): boolean {
        if (this.command.toLowerCase() === ConsoleConstants.windowsClear || this.command.toLowerCase() === ConsoleConstants.linuxClear) {
            this.removeMsgComponents();
            return false;
        }
        if (this.command.toLowerCase() === ConsoleConstants.exit) {
            this.removeMsgComponents();
            this.dir = this._defaultDirectory;
            return false;
        }
        return true;
    }

    protected abstract getCommandPrefix(): string;
}
