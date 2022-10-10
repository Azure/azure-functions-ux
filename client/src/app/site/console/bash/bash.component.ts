import { Component, ComponentFactoryResolver } from '@angular/core';
import { ConsoleService, ConsoleTypes } from './../shared/services/console.service';
import { AbstractConsoleComponent, KuduRequestBody } from '../shared/components/abstract.console.component';
import { ConsoleConstants } from '../../../shared/models/constants';
import { HostType } from '../../../shared/models/arm/site';
import { PortalResources } from '../../../shared/models/portal-resources';
import { TranslateService } from '@ngx-translate/core';
import { PortalService } from '../../../shared/services/portal.service';
import { NoCorsHttpService } from '../../../shared/no-cors-http-service';

@Component({
  selector: 'app-bash',
  templateUrl: '././../shared/templates/abstract.console.component.html',
  styleUrls: ['./../console.component.scss'],
})
export class BashComponent extends AbstractConsoleComponent {
  private _defaultDirectory = '/home';
  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    public consoleService: ConsoleService,
    private _translateService: TranslateService,
    portalService: PortalService,
    noCorsHttpService: NoCorsHttpService
  ) {
    super(componentFactoryResolver, consoleService, portalService, noCorsHttpService);
    this.dir = this._defaultDirectory;
    this.consoleType = ConsoleTypes.BASH;
  }

  protected initializeConsole() {
    this.siteSubscription = this.consoleService.getSite().subscribe(site => {
      this.site = site;
      this.removeMsgComponents();
    });
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
    const scmHostName = this.site.properties.hostNameSslStates.find(h => h.hostType === HostType.Repository).name;
    return `https://${scmHostName}/command`;
  }

  /**
   * Handle the tab-pressed event
   */
  protected tabKeyEvent() {
    this.unFocusConsoleManually();
    if (this.listOfDir.length === 0) {
      this.dirIndex = -1;
      const body = {
        command: `bash -c ' ${this.getTabKeyCommand()} '`,
        dir: this.dir,
      };
      const res = this._sendRequestToKudu(body);
      res.subscribe(
        data => {
          const { Output, ExitCode } = data.json();
          if (ExitCode === ConsoleConstants.successExitcode) {
            // fetch the list of files/folders in the current directory
            const cmd = this.command.substring(0, this.ptrPosition);
            const allFiles = Output.split(ConsoleConstants.newLine);
            this.tabKeyPointer = cmd.lastIndexOf(ConsoleConstants.whitespace);
            this.listOfDir = this.consoleService.findMatchingStrings(allFiles, cmd.substring(this.tabKeyPointer + 1));
            if (this.listOfDir.length > 0) {
              this.command = cmd;
              this.replaceWithFileName();
            }
          }
        },
        err => {
          console.log('Tab Key Error' + err.text());
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
    const cmd = this.command;
    const body = {
      command: `bash -c " ${cmd} && echo '' && pwd"`,
      dir: this.dir,
    };
    const res = this._sendRequestToKudu(body);
    this.lastAPICall = res.subscribe(
      data => {
        const { Output, ExitCode, Error } = data.json();
        if (Error !== '') {
          this.addErrorComponent(`${Error.trimEnd()}${ConsoleConstants.linuxNewLine}`);
        } else if (ExitCode === ConsoleConstants.successExitcode && Output !== '') {
          this._updateDirectoryAfterCommand(Output.trim());
          const msg = Output.split(this.getMessageDelimeter())[0].trimEnd();
          this.addMessageComponent(`${msg}${ConsoleConstants.linuxNewLine}`);
        }
        this.addPromptComponent();
        this.enterPressed = false;
      },
      err => {
        this.addErrorComponent(this._translateService.instant(PortalResources.error_consoleCommandFialure));
        this.enterPressed = false;
      }
    );
  }

  protected getMessageDelimeter(): string {
    return ConsoleConstants.linuxNewLine + this.dir;
  }

  /**
   * Check and update the directory
   * @param cmd string which represents the response from the API
   */
  private _updateDirectoryAfterCommand(cmd: string) {
    const result = cmd.split(ConsoleConstants.linuxNewLine);
    this.dir = result[result.length - 1];
  }

  /**
   * perform action on key pressed.
   */
  protected performAction(): boolean {
    if (!this.command || !this.command.trim()) {
      this.addMessageComponent();
      return false;
    }
    if (this.command.toLowerCase() === ConsoleConstants.linuxClear) {
      // bash uses clear to empty the console
      this.removeMsgComponents();
      this.cleared = true;
      return false;
    }
    if (this.command.toLowerCase() === ConsoleConstants.exit) {
      this.removeMsgComponents();
      this.dir = this._defaultDirectory;
      this.cleared = true;
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

  private _sendRequestToKudu(body: KuduRequestBody) {
    return super.sendRequestToKudu(this.getKuduUri(), body, this.site);
  }
}
